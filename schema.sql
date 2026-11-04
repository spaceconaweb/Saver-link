CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY NOT NULL,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS links (
    id TEXT PRIMARY KEY NOT NULL,
    original_url TEXT NOT NULL,
    custom_name TEXT NOT NULL,
    custom_icon TEXT NOT NULL DEFAULT 'Bookmark',
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS summaries (
    id TEXT PRIMARY KEY NOT NULL,
    link_id TEXT NOT NULL UNIQUE REFERENCES links(id) ON DELETE CASCADE,
    summary_text TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_links_created_at ON links(created_at DESC);
