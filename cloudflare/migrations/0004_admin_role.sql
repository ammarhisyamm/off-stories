PRAGMA foreign_keys = ON;

ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0;

CREATE INDEX users_by_admin ON users(is_admin);
