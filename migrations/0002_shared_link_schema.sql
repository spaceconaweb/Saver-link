PRAGMA foreign_keys = OFF;

BEGIN TRANSACTION;

ALTER TABLE summaries RENAME TO summaries_legacy;
ALTER TABLE links RENAME TO links_legacy;

CREATE TABLE links (
    id TEXT PRIMARY KEY NOT NULL,
    original_url TEXT NOT NULL,
    custom_name TEXT NOT NULL,
    custom_icon TEXT NOT NULL DEFAULT 'Bookmark',
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

INSERT INTO links (id, original_url, custom_name, custom_icon, created_at)
SELECT id,
       url,
       COALESCE(NULLIF(title, ''), 'Untitled Resource'),
       'Bookmark',
       CASE
           WHEN created_at NOT GLOB '*[^0-9]*' AND length(created_at) <= 10
               THEN CAST(created_at AS INTEGER)
           ELSE CAST(strftime('%s', created_at) AS INTEGER)
       END
FROM links_legacy;

CREATE TABLE summaries (
    id TEXT PRIMARY KEY NOT NULL,
    link_id TEXT NOT NULL UNIQUE REFERENCES links(id) ON DELETE CASCADE,
    summary_text TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

INSERT INTO summaries (id, link_id, summary_text, created_at)
SELECT id, link_id, summary, created_at
FROM (
    SELECT id,
           link_id,
           summary,
           CASE
               WHEN created_at NOT GLOB '*[^0-9]*' AND length(created_at) <= 10
                   THEN CAST(created_at AS INTEGER)
               ELSE CAST(strftime('%s', created_at) AS INTEGER)
           END AS created_at,
           ROW_NUMBER() OVER (PARTITION BY link_id ORDER BY created_at DESC, id) AS row_number
    FROM summaries_legacy
)
WHERE row_number = 1;

DROP TABLE summaries_legacy;
DROP TABLE links_legacy;

CREATE INDEX idx_links_created_at ON links(created_at DESC);

COMMIT;

PRAGMA foreign_keys = ON;
