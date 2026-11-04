# Saver-link

Saver-link is a Next.js application.

## Development

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Cloudflare D1 setup

The app reads the D1 database from the Cloudflare Worker binding named `DB`.
`process.env.DB` is not a D1 database binding; the API uses the OpenNext
Cloudflare request context to access `env.DB`.

Before previewing or deploying, replace `REPLACE_WITH_YOUR_D1_DATABASE_ID` in
`wrangler.jsonc` with the ID for the existing `hublink-db` database. You can
find the ID with `npx wrangler d1 list`. The binding name must remain `DB`.

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

Use `npm run preview` to build and preview in the Workers runtime. Use
`npm run deploy` only after setting the database ID and applying the matching
schema.
