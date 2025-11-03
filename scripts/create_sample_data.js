const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../data/db.sqlite');
const db = new Database(dbPath);

// Initialize tables if they don't exist
const initSQL = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password_hash TEXT,
  role TEXT,
  anon_id TEXT UNIQUE,
  dept TEXT,
  created_at INTEGER DEFAULT (strftime('%s','now'))
);

CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  anon_id TEXT,
  title TEXT,
  consent TEXT DEFAULT 'OFF',
  created_at INTEGER DEFAULT (strftime('%s','now')),
  last_activity INTEGER
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT,
  sender TEXT,
  text TEXT,
  snippet TEXT,
  timestamp INTEGER,
  stress_score INTEGER,
  tags TEXT,
  confidence REAL,
  intent TEXT,
  emotion TEXT,
  crisis_flag INTEGER DEFAULT 0,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id)
);
`;

db.exec(initSQL);

// Insert sample data
const now = Math.floor(Date.now() / 1000);
const weekAgo = now - (7 * 24 * 60 * 60);

// Sample conversations
const conversations = [
  { id: 'conv_001', anon_id: 'ANON-1001', title: 'Stress about exams', created_at: weekAgo + 1000 },
  { id: 'conv_002', anon_id: 'ANON-1002', title: 'Feeling overwhelmed', created_at: weekAgo + 2000 },
  { id: 'conv_003', anon_id: 'ANON-1003', title: 'Anxiety issues', created_at: weekAgo + 3000 },
  { id: 'conv_004', anon_id: 'ANON-1004', title: 'Academic pressure', created_at: weekAgo + 4000 },
  { id: 'conv_005', anon_id: 'ANON-1005', title: 'Social problems', created_at: weekAgo + 5000 }
];

const insertConv = db.prepare('INSERT OR REPLACE INTO conversations (id, anon_id, title, created_at) VALUES (?, ?, ?, ?)');
conversations.forEach(conv => {
  insertConv.run(conv.id, conv.anon_id, conv.title, conv.created_at);
});

// Sample messages with stress scores and emotions
const emotions = ['anxious', 'stressed', 'sad', 'worried', 'frustrated', 'angry', 'depressed'];
const messages = [];

conversations.forEach((conv, i) => {
  // Add 3-5 messages per conversation
  const messageCount = 3 + Math.floor(Math.random() * 3);
  for (let j = 0; j < messageCount; j++) {
    const timestamp = conv.created_at + (j * 300); // 5 minutes apart
    const stressScore = 30 + Math.floor(Math.random() * 50); // 30-80
    const emotion = emotions[Math.floor(Math.random() * emotions.length)];
    
    messages.push({
      id: `msg_${conv.id}_${j}`,
      conversation_id: conv.id,
      sender: 'student',
      text: `Sample message ${j + 1} from student`,
      timestamp: timestamp,
      stress_score: stressScore,
      emotion: emotion,
      crisis_flag: stressScore > 75 ? 1 : 0
    });
  }
});

const insertMsg = db.prepare(`
  INSERT OR REPLACE INTO messages 
  (id, conversation_id, sender, text, timestamp, stress_score, emotion, crisis_flag) 
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

messages.forEach(msg => {
  insertMsg.run(msg.id, msg.conversation_id, msg.sender, msg.text, msg.timestamp, msg.stress_score, msg.emotion, msg.crisis_flag);
});

console.log(`Inserted ${conversations.length} conversations and ${messages.length} messages`);
console.log('Sample analytics data created successfully!');

db.close();