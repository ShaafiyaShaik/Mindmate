#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

async function main() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  const dbName = process.env.MONGODB_DBNAME || process.env.MONGODB_DB || 'mindmate';
  if (!uri) {
    console.error('Please set MONGODB_URI in your environment');
    process.exit(1);
  }

  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  const db = client.db(dbName);

  const convDir = path.join(process.cwd(), 'data', 'conversations');
  if (!fs.existsSync(convDir)) {
    console.error('No conversation data directory found at', convDir);
    process.exit(1);
  }

  const files = fs.readdirSync(convDir).filter(f => f.endsWith('.json'));
  console.log(`Found ${files.length} conversation files`);

  for (const f of files) {
    const full = path.join(convDir, f);
    try {
      const raw = fs.readFileSync(full, 'utf-8');
      const obj = JSON.parse(raw);
      // Conversation doc
      const convDoc = {
        id: obj.id,
        anon_id: obj.anon_id || obj.anonId || obj.anon_id || 'ANON-UNKNOWN',
        title: obj.title || 'Imported Conversation',
        created_at: obj.created_at || Math.floor(Date.now()/1000),
        last_activity: obj.last_activity || Math.floor(Date.now()/1000)
      };

      await db.collection('conversations').updateOne({ id: convDoc.id }, { $set: convDoc }, { upsert: true });

      if (Array.isArray(obj.messages)) {
        const messages = obj.messages.map(m => ({
          id: m.id,
          conversation_id: obj.id,
          sender: m.sender,
          text: m.text,
          snippet: m.snippet || (m.text && m.text.substring(0, 120)),
          timestamp: m.timestamp || Math.floor(Date.now()/1000),
          stress_score: m.metadata && m.metadata.stress_score ? m.metadata.stress_score : (m.stress_score || null),
          tags: (m.metadata && m.metadata.detected_keywords) || m.tags || [],
          confidence: (m.metadata && m.metadata.confidence) || null,
          intent: (m.metadata && m.metadata.intent) || null,
          emotion: (m.metadata && m.metadata.emotion) || null,
          crisis_flag: m.crisis_flag || false
        }));
        if (messages.length) {
          await db.collection('messages').insertMany(messages.map(m => ({ ...m })), { ordered: false }).catch(e => {
            // ignore duplicate key errors
            if (e.code !== 11000) console.error('Insert error', e);
          });
        }
      }
      console.log('Imported', f);
    } catch (e) {
      console.error('Failed to import', f, e.message);
    }
  }

  console.log('Seeding complete');
  await client.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});