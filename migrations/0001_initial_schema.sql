
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  blog_url TEXT NOT NULL,
  description TEXT,
  embed_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  posts INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  user_id VARCHAR REFERENCES users(id),
  config JSONB
);

-- Create generated_content table
CREATE TABLE IF NOT EXISTS generated_content (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  slug TEXT NOT NULL,
  excerpt TEXT,
  keywords TEXT,
  meta_description TEXT,
  focus_keyword TEXT,
  seo_score INTEGER,
  status TEXT NOT NULL DEFAULT 'draft',
  provider TEXT,
  published_at TIMESTAMP,
  scheduled_for TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  user_id VARCHAR REFERENCES users(id),
  campaign_id INTEGER REFERENCES campaigns(id),
  metadata JSONB
);

-- Create content_history table
CREATE TABLE IF NOT EXISTS content_history (
  id SERIAL PRIMARY KEY,
  content_id INTEGER NOT NULL REFERENCES generated_content(id),
  action TEXT NOT NULL,
  changes JSONB,
  performed_by VARCHAR REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create monthly_content_quota table
CREATE TABLE IF NOT EXISTS monthly_content_quota (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  month TEXT NOT NULL,
  content_generated INTEGER DEFAULT 0,
  max_content INTEGER DEFAULT 10,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, month)
);

-- Create api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  provider TEXT NOT NULL,
  key_value TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_generated_content_user_id ON generated_content(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_content_status ON generated_content(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_quota_user_month ON monthly_content_quota(user_id, month);
