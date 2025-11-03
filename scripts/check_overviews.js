const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(__dirname, '..', 'data', 'db.sqlite');
console.log('DB path:', dbPath);
try {
  const db = new Database(dbPath, { readonly: true });
  const rows = db.prepare("SELECT resource_id, overview, links, updated_at FROM resource_overviews").all();
  if (!rows || rows.length === 0) {
    console.log('No cached overviews found.');
  } else {
    console.log('Cached overviews:');
    rows.forEach(r => {
      console.log('- id:', r.resource_id);
      console.log('  overview:', (r.overview || '').slice(0, 300));
      console.log('  links:', r.links ? JSON.parse(r.links) : r.links);
      console.log('  updated_at:', r.updated_at);
    });
  }
} catch (e) {
  console.error('Error reading DB:', e.message);
}
