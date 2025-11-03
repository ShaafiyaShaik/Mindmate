-- Resources table for storing university-approved materials
CREATE TABLE IF NOT EXISTS resources (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL, -- 'pdf', 'video', 'workshop', 'hotline'
  url TEXT,
  thumbnail TEXT,
  description TEXT NOT NULL,
  tags TEXT NOT NULL, -- JSON array of tags like ["exam", "stress", "sleep"]
  approved_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  popularity INTEGER DEFAULT 0, -- number of saves/clicks
  is_hotline BOOLEAN DEFAULT FALSE,
  hotline_number TEXT,
  content_text TEXT, -- for search indexing
  is_active BOOLEAN DEFAULT TRUE
);

-- User saved resources
CREATE TABLE IF NOT EXISTS user_saved_resources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  anon_id TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (resource_id) REFERENCES resources(id),
  UNIQUE(anon_id, resource_id)
);

-- Resource analytics for tracking usage
CREATE TABLE IF NOT EXISTS resource_analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  resource_id TEXT NOT NULL,
  anon_id TEXT,
  action TEXT NOT NULL, -- 'open', 'save', 'share', 'call'
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (resource_id) REFERENCES resources(id)
);

-- User resource preferences/tags for recommendation
CREATE TABLE IF NOT EXISTS user_resource_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  anon_id TEXT NOT NULL,
  tag TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  last_used DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(anon_id, tag)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_resources_tags ON resources(tags);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
CREATE INDEX IF NOT EXISTS idx_resources_popularity ON resources(popularity DESC);
CREATE INDEX IF NOT EXISTS idx_user_saved_anon ON user_saved_resources(anon_id);
CREATE INDEX IF NOT EXISTS idx_resource_analytics_resource ON resource_analytics(resource_id);
CREATE INDEX IF NOT EXISTS idx_user_tags_anon ON user_resource_tags(anon_id);