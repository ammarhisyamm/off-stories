PRAGMA foreign_keys = ON;

CREATE TABLE newsletter_subscribers (
  email TEXT PRIMARY KEY COLLATE NOCASE,
  source TEXT NOT NULL DEFAULT 'blog',
  unsubscribed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX newsletter_subscribers_by_created_at ON newsletter_subscribers(created_at);
