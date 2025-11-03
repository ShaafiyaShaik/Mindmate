import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { MongoClient, Db as MongoDb, WithId, Document } from 'mongodb';

const DB_CLIENT = process.env.DB_CLIENT || (process.env.MONGODB_URI ? 'mongodb' : 'sqlite');
const DB_PATH = process.env.DB_FILE || './data/db.sqlite';
const DB_INIT_SCRIPT = path.join(process.cwd(), 'scripts', 'init_db.sql');

// Ensure data directory exists for SQLite
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// SQLite instance
let sqliteDb: Database.Database | null = null;

// MongoDB client & db
let mongoClient: MongoClient | null = null;
let mongoDb: MongoDb | null = null;

export async function connectMongo(uri?: string, dbName?: string) {
  if (mongoDb) return mongoDb;
  const uriToUse = uri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mindmate';
  mongoClient = new MongoClient(uriToUse);
  await mongoClient.connect();
  const name = dbName || (process.env.MONGODB_DBNAME || 'mindmate');
  mongoDb = mongoClient.db(name);
  return mongoDb;
}

export function getSqliteDb(): Database.Database {
  if (!sqliteDb) {
    sqliteDb = new Database(DB_PATH);
    sqliteDb.pragma('journal_mode = WAL');
    sqliteDb.pragma('foreign_keys = ON');
  }
  return sqliteDb;
}

export function getDb(): Database.Database {
  return getSqliteDb();
}

// Keep a synchronous init for SQLite to preserve previous behavior
export function initDb(): void {
  // Only initialize SQLite schema here. MongoDB collections are created on demand.
  if (DB_CLIENT === 'mongodb') return;

  const database = getSqliteDb();
  const tables = database.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  if (tables.length === 0) {
    console.log('Initializing SQLite database...');
    const initSQL = fs.readFileSync(DB_INIT_SCRIPT, 'utf-8');
    database.exec(initSQL);
    console.log('Database initialized successfully');
  }
}

// Conversation functions
// -- Implementations that work for both SQLite and MongoDB --

export async function getConversations(anonId: string) {
  if (DB_CLIENT === 'mongodb') {
    const db = await connectMongo();
    const convs = await db.collection('conversations').find({ anon_id: anonId }).sort({ last_activity: -1 }).toArray();
    // Attach last_message and message_count
    const results = await Promise.all(convs.map(async (c: any) => {
      const last = await db.collection('messages').find({ conversation_id: c.id }).sort({ timestamp: -1 }).limit(1).toArray();
      const count = await db.collection('messages').countDocuments({ conversation_id: c.id, sender: 'assistant' });
      return { ...c, last_message: last[0]?.text || null, message_count: count };
    }));
    return results;
  }

  const db = getSqliteDb();
  return db.prepare(`
    SELECT c.*, 
           (SELECT text FROM messages WHERE conversation_id = c.id ORDER BY timestamp DESC LIMIT 1) as last_message,
           (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender = 'assistant') as message_count
    FROM conversations c 
    WHERE anon_id = ? 
    ORDER BY last_activity DESC
  `).all(anonId);
}

export async function createConversation(anonId: string, title: string = 'New Conversation') {
  if (DB_CLIENT === 'mongodb') {
    const db = await connectMongo();
    const id = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = Math.floor(Date.now() / 1000);
    await db.collection('conversations').insertOne({ id, anon_id: anonId, title, created_at: timestamp, last_activity: timestamp });
    return { id, title, created_at: timestamp };
  }

  const db = getSqliteDb();
  const id = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = Math.floor(Date.now() / 1000);
  db.prepare(`
    INSERT INTO conversations (id, anon_id, title, created_at, last_activity)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, anonId, title, timestamp, timestamp);
  return { id, title, created_at: timestamp };
}

export async function updateConversationTitle(conversationId: string, title: string) {
  if (DB_CLIENT === 'mongodb') {
    const db = await connectMongo();
    await db.collection('conversations').updateOne({ id: conversationId }, { $set: { title } });
    return;
  }
  const db = getSqliteDb();
  db.prepare('UPDATE conversations SET title = ? WHERE id = ?').run(title, conversationId);
}

export async function updateConversationActivity(conversationId: string) {
  const timestamp = Math.floor(Date.now() / 1000);
  if (DB_CLIENT === 'mongodb') {
    const db = await connectMongo();
    await db.collection('conversations').updateOne({ id: conversationId }, { $set: { last_activity: timestamp } });
    return;
  }
  const db = getSqliteDb();
  db.prepare('UPDATE conversations SET last_activity = ? WHERE id = ?').run(timestamp, conversationId);
}

// Message functions
export async function getMessages(conversationId: string) {
  if (DB_CLIENT === 'mongodb') {
    const db = await connectMongo();
    return db.collection('messages').find({ conversation_id: conversationId }).sort({ timestamp: 1 }).toArray();
  }
  const db = getSqliteDb();
  return db.prepare(`
    SELECT * FROM messages 
    WHERE conversation_id = ? 
    ORDER BY timestamp ASC
  `).all(conversationId);
}

export async function saveMessage(messageObj: {
  id: string;
  conversation_id: string;
  sender: string;
  text: string;
  snippet?: string;
  timestamp?: number;
  stress_score?: number;
  tags?: string[];
  confidence?: number;
  intent?: string;
  emotion?: string;
  crisis_flag?: boolean;
}) {
  const timestamp = messageObj.timestamp || Math.floor(Date.now() / 1000);
  const snippet = messageObj.snippet || messageObj.text.substring(0, 100);

  if (DB_CLIENT === 'mongodb') {
    const db = await connectMongo();
    await db.collection('messages').insertOne({
      id: messageObj.id,
      conversation_id: messageObj.conversation_id,
      sender: messageObj.sender,
      text: messageObj.text,
      snippet,
      timestamp,
      stress_score: messageObj.stress_score || null,
      tags: messageObj.tags || [],
      confidence: messageObj.confidence || null,
      intent: messageObj.intent || null,
      emotion: messageObj.emotion || null,
      crisis_flag: messageObj.crisis_flag ? 1 : 0
    });
    await updateConversationActivity(messageObj.conversation_id);
    return;
  }

  const db = getSqliteDb();
  const tags = messageObj.tags ? JSON.stringify(messageObj.tags) : null;
  db.prepare(`
    INSERT INTO messages (
      id, conversation_id, sender, text, snippet, timestamp, 
      stress_score, tags, confidence, intent, emotion, crisis_flag
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    messageObj.id,
    messageObj.conversation_id,
    messageObj.sender,
    messageObj.text,
    snippet,
    timestamp,
    messageObj.stress_score || null,
    tags,
    messageObj.confidence || null,
    messageObj.intent || null,
    messageObj.emotion || null,
    messageObj.crisis_flag ? 1 : 0
  );
  updateConversationActivity(messageObj.conversation_id);
}

// Alert functions
export async function createAlert(alertObj: {
  alert_id: string;
  anon_id: string;
  dept: string;
  stress_score: number;
  snippet: string;
  tags: string[];
  consent: string;
  status?: string;
}) {
  const timestamp = Math.floor(Date.now() / 1000);
  if (DB_CLIENT === 'mongodb') {
    const db = await connectMongo();
    await db.collection('alerts').insertOne({
      alert_id: alertObj.alert_id,
      anon_id: alertObj.anon_id,
      dept: alertObj.dept,
      stress_score: alertObj.stress_score,
      snippet: alertObj.snippet,
      tags: alertObj.tags || [],
      timestamp,
      consent: alertObj.consent,
      status: alertObj.status || 'open'
    });
    return;
  }
  const db = getSqliteDb();
  const tags = JSON.stringify(alertObj.tags);
  db.prepare(`
    INSERT INTO alerts (alert_id, anon_id, dept, stress_score, snippet, tags, timestamp, consent, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    alertObj.alert_id,
    alertObj.anon_id,
    alertObj.dept,
    alertObj.stress_score,
    alertObj.snippet,
    tags,
    timestamp,
    alertObj.consent,
    alertObj.status || 'open'
  );
}

export async function getAlerts(status?: string) {
  if (DB_CLIENT === 'mongodb') {
    const db = await connectMongo();
    const q: any = status ? { status } : {};
    return db.collection('alerts').find(q).sort({ timestamp: -1 }).toArray();
  }
  const db = getSqliteDb();
  const query = status 
    ? 'SELECT * FROM alerts WHERE status = ? ORDER BY timestamp DESC'
    : 'SELECT * FROM alerts ORDER BY timestamp DESC';
  return status ? db.prepare(query).all(status) : db.prepare(query).all();
}

export async function assignAlert(alertId: string, counselorId: string) {
  if (DB_CLIENT === 'mongodb') {
    const db = await connectMongo();
    await db.collection('alerts').updateOne({ alert_id: alertId }, { $set: { status: 'assigned', assigned_to: counselorId } });
    return;
  }
  const db = getSqliteDb();
  db.prepare(`
    UPDATE alerts 
    SET status = 'assigned', assigned_to = ? 
    WHERE alert_id = ?
  `).run(counselorId, alertId);
}

// Resource functions
export async function getResourcesByTags(tags: string[]) {
  if (DB_CLIENT === 'mongodb') {
    const db = await connectMongo();
    // match any resource with overlapping tags
    return db.collection('resources').find({ tags: { $in: tags } }).toArray();
  }
  const db = getSqliteDb();
  const placeholders = tags.map(() => '?').join(',');
  const query = `
    SELECT * FROM resources 
    WHERE ${tags.map(() => 'tags LIKE ?').join(' OR ')}
  `;
  const likeParams = tags.map(tag => `%"${tag}"%`);
  return db.prepare(query).all(...likeParams);
}

export async function saveResource(resource: {
  id: string;
  title: string;
  type: string;
  url: string;
  tags: string[];
  description: string;
}) {
  if (DB_CLIENT === 'mongodb') {
    const db = await connectMongo();
    await db.collection('resources').updateOne({ id: resource.id }, { $set: resource }, { upsert: true });
    return;
  }
  const db = getSqliteDb();
  const tags = JSON.stringify(resource.tags);
  db.prepare(`
    INSERT OR REPLACE INTO resources (id, title, type, url, tags, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(resource.id, resource.title, resource.type, resource.url, tags, resource.description);
}

// AI Overview persistence for resources
export async function getResourceOverview(resourceId: string) {
  if (DB_CLIENT === 'mongodb') {
    const db = await connectMongo();
    const doc = await db.collection('resource_overviews').findOne({ resource_id: resourceId });
    return doc ? { overview: doc.overview as string, links: doc.links || [] } : null;
  }
  const db = getSqliteDb();
  try {
    const row = db.prepare('SELECT overview, links FROM resource_overviews WHERE resource_id = ?').get(resourceId) as any;
    if (!row) return null;
    try {
      const links = row.links ? JSON.parse(row.links) : [];
      return { overview: row.overview, links };
    } catch (e) {
      return { overview: row.overview, links: [] };
    }
  } catch (e) {
    // Table might not exist yet
    return null;
  }
}

export async function saveResourceOverview(resourceId: string, overview: string, links: Array<{ title: string; url: string }>) {
  if (DB_CLIENT === 'mongodb') {
    const db = await connectMongo();
    await db.collection('resource_overviews').updateOne({ resource_id: resourceId }, { $set: { overview, links, updated_at: Date.now() } }, { upsert: true });
    return;
  }
  const db = getSqliteDb();
  // Ensure table exists
  db.prepare(`CREATE TABLE IF NOT EXISTS resource_overviews (resource_id TEXT PRIMARY KEY, overview TEXT, links TEXT, updated_at INTEGER)`).run();
  const linksJson = JSON.stringify(links || []);
  db.prepare(`INSERT OR REPLACE INTO resource_overviews (resource_id, overview, links, updated_at) VALUES (?, ?, ?, ?)`)
    .run(resourceId, overview, linksJson, Math.floor(Date.now() / 1000));
}

// Initialize database on module load
initDb();