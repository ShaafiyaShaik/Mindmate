const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Read the SQL file
const sqlFile = path.join(__dirname, 'init_db.sql');
const sql = fs.readFileSync(sqlFile, 'utf-8');

// Initialize database
const dbPath = path.join(__dirname, '..', 'mindmate.db');
const db = new Database(dbPath);

try {
  // Execute the SQL to create tables and seed data
  db.exec(sql);
  console.log('✅ Database initialized successfully!');
  console.log(`📍 Database location: ${dbPath}`);
  
  // Test that tables were created
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('📋 Created tables:', tables.map(t => t.name).join(', '));
  
} catch (error) {
  console.error('❌ Database initialization failed:', error);
  process.exit(1);
} finally {
  db.close();
}