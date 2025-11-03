-- scripts/init_db.sql
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password_hash TEXT,
  role TEXT, -- 'student'|'counselor'|'admin'
  anon_id TEXT UNIQUE,
  dept TEXT,
  created_at INTEGER DEFAULT (strftime('%s','now'))
);

CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY, -- CONV-uuid
  anon_id TEXT,
  title TEXT,
  consent TEXT DEFAULT 'OFF', -- ON/OFF
  created_at INTEGER DEFAULT (strftime('%s','now')),
  last_activity INTEGER
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT,
  sender TEXT, -- student|assistant|counselor
  text TEXT,
  snippet TEXT,
  timestamp INTEGER,
  stress_score INTEGER,
  tags TEXT, -- JSON array string
  confidence REAL,
  intent TEXT,
  emotion TEXT,
  crisis_flag INTEGER DEFAULT 0,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id)
);

CREATE TABLE IF NOT EXISTS alerts (
  alert_id TEXT PRIMARY KEY,
  anon_id TEXT,
  dept TEXT,
  stress_score INTEGER,
  snippet TEXT,
  tags TEXT,
  timestamp INTEGER,
  consent TEXT,
  status TEXT DEFAULT 'open', -- open/assigned/resolved/held
  assigned_to TEXT
);

CREATE TABLE IF NOT EXISTS resources (
  id TEXT PRIMARY KEY,
  title TEXT,
  type TEXT,
  url TEXT,
  tags TEXT,
  description TEXT
);

-- Insert sample resources
INSERT OR IGNORE INTO resources (id, title, type, url, tags, description) VALUES
('res_breathing', 'Breathing Exercises', 'exercise', '/resources/breathing', '["anxiety","stress","relaxation"]', 'Quick breathing techniques to reduce anxiety'),
('res_study_tips', 'Study Techniques', 'article', '/resources/study-tips', '["academic","productivity","time_management"]', 'Evidence-based study methods for better learning'),
('res_sleep_hygiene', 'Sleep Hygiene Guide', 'article', '/resources/sleep', '["sleep","wellness","health"]', 'Tips for better sleep quality and routine'),
('res_crisis_hotline', 'Crisis Support Hotline', 'contact', 'tel:988', '["crisis","emergency","support"]', '24/7 crisis support and suicide prevention'),
('res_counseling', 'Campus Counseling', 'contact', '/counseling', '["counseling","therapy","support"]', 'Professional counseling services on campus');
