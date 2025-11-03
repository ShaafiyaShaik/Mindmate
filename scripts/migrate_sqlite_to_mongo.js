const Database = require('better-sqlite3');
const { MongoClient } = require('mongodb');

async function migrate({ sqlitePath = 'mindmate.db', mongoUri = 'mongodb://127.0.0.1:27017', mongoDbName = 'mindmate' } = {}) {
  const sqlite = new Database(sqlitePath, { readonly: true });
  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db(mongoDbName);

  console.log('Clearing target Mongo collections...');
  await Promise.all(['users','conversations','messages','alerts','resources'].map(c => db.collection(c).deleteMany({})));

  console.log('Migrating users...');
  try {
    const users = sqlite.prepare('SELECT * FROM users').all();
    if (users && users.length) await db.collection('users').insertMany(users.map(u => ({ ...u })));
    console.log(`  migrated ${users.length} users`);
  } catch (e) { console.warn('users table not present or empty'); }

  console.log('Migrating conversations...');
  try {
    const convs = sqlite.prepare('SELECT * FROM conversations').all();
    if (convs && convs.length) await db.collection('conversations').insertMany(convs.map(c => ({ ...c })));
    console.log(`  migrated ${convs.length} conversations`);
  } catch (e) { console.warn('conversations table not present or empty'); }

  console.log('Migrating messages...');
  try {
    const msgs = sqlite.prepare('SELECT * FROM messages').all();
    if (msgs && msgs.length) {
      const fixed = msgs.map(m => ({ ...m, tags: m.tags ? JSON.parse(m.tags) : [] }));
      await db.collection('messages').insertMany(fixed);
      console.log(`  migrated ${msgs.length} messages`);
    }
  } catch (e) { console.warn('messages table not present or empty'); }

  console.log('Migrating alerts...');
  try {
    const alerts = sqlite.prepare('SELECT * FROM alerts').all();
    if (alerts && alerts.length) {
      const fixed = alerts.map(a => ({ ...a, tags: a.tags ? JSON.parse(a.tags) : [] }));
      await db.collection('alerts').insertMany(fixed);
      console.log(`  migrated ${alerts.length} alerts`);
    }
  } catch (e) { console.warn('alerts table not present or empty'); }

  console.log('Migrating resources...');
  try {
    const res = sqlite.prepare('SELECT * FROM resources').all();
    if (res && res.length) {
      const fixed = res.map(r => ({ ...r, tags: r.tags ? (typeof r.tags === 'string' ? JSON.parse(r.tags) : r.tags) : [] }));
      await db.collection('resources').insertMany(fixed);
      console.log(`  migrated ${res.length} resources`);
    }
  } catch (e) { console.warn('resources table not present or empty'); }

  await client.close();
  sqlite.close();
  console.log('Migration complete');
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const opts = {};
  args.forEach(a => {
    if (a.startsWith('--sqlite=')) opts.sqlitePath = a.split('=')[1];
    if (a.startsWith('--mongo=')) opts.mongoUri = a.split('=')[1];
    if (a.startsWith('--db=')) opts.mongoDbName = a.split('=')[1];
  });
  migrate(opts).catch(err => { console.error(err); process.exit(1); });
}
