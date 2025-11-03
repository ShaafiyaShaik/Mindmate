const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(__dirname, '..', 'mindmate.db');
console.log('DB path:', dbPath);
try {
  const db = new Database(dbPath, { readonly: true });
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('Tables:', tables.map(t=>t.name));
} catch (e) {
  console.error('Error reading DB:', e.message);
}
