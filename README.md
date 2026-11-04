# LinkSava

LinkSava is a Next.js static frontend with Cloudflare Pages Functions backed by
Cloudflare D1.

## Development

Install dependencies and run the Next.js development server for UI work:

```bash
npm install
npm run dev
```

To test the static site and Pages Functions together in Wrangler, use:

```bash
npm run pages:dev
```

## Cloudflare Pages setup

The app is configured for Cloudflare Pages: Next.js exports static assets to
`out/`, and routes under `functions/api/` handle `/api/links` and
`/api/summaries` using the Pages D1 binding named `DB`. The compatibility date
is pinned to `2026-11-01` in `wrangler.jsonc`.

Before deploying, replace `REPLACE_WITH_YOUR_D1_DATABASE_ID` in
`wrangler.jsonc` with the ID of the existing `hublink-db` database. Find it
with `npx wrangler d1 list`. If your Cloudflare Pages project's name is not
`linksava`, update the `name` in `wrangler.jsonc` and the `--project-name` in
the `pages:deploy` script to match its exact name.

For a new database, apply the root-level schema from the project root:

```bash
npx wrangler d1 execute hublink-db --file=./schema.sql --remote
```

If you already applied the earlier schema that required `user_id` and used
`url`/`title`, apply the data-preserving upgrade instead:

```bash
npx wrangler d1 execute hublink-db --file=./migrations/0002_shared_link_schema.sql --remote
```

Choose **one** command based on the database's current schema; do not run the
upgrade against a newly initialized database. Both commands change the remote
database, so verify the database and environment before running them.

The summary endpoint currently stores a deterministic placeholder summary. It
does not call a Workers AI model yet.

In Cloudflare Pages, set the build command to `npm run build` and the build
output directory to `out`. Once the D1 database ID and matching schema are
configured, deploy with `npm run pages:deploy`, or connect the repository to
Pages and deploy through Git integration.
