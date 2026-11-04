# LinkSava

LinkSava is a Next.js static frontend with Cloudflare Pages Functions backed by
Cloudflare D1 and Workers AI.

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
`/api/summaries` using the Pages D1 binding named `DB`. The `/api/chat` Function
uses D1 to look up the saved link and a Workers AI binding named `AI` to answer
questions about its webpage. The compatibility date is pinned to
`2026-11-01` in `wrangler.jsonc`.

The D1 binding in `wrangler.jsonc` is configured for the existing
`hublink-db` database. If your Cloudflare Pages project's name is not
`linksava`, update the `name` in `wrangler.jsonc` and the `--project-name` in
the `pages:deploy` script to match its exact name.

For Git-integrated Pages deployments, configure the Workers AI binding named
`AI` in both the production and preview environments under **Workers & Pages >
your Pages project > Settings > Bindings > Add > Workers AI**, then redeploy.
Local `npm run pages:dev` requests use Workers AI and may incur usage charges.

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

The summary endpoint currently stores a deterministic placeholder summary; the
Ask AI card console uses the Llama 3.1 8B Instruct model through Workers AI.
The chat endpoint fetches only the webpage URL saved in D1, follows a limited
number of validated redirects, and caps the amount of page text sent to the
model. Consider adding Cloudflare rate limits to `/api/chat` before sharing the
app publicly.

In Cloudflare Pages, set the build command to `npm run build` and the build
output directory to `out`. Once the D1 database ID and matching schema are
configured, deploy with `npm run pages:deploy`, or connect the repository to
Pages and deploy through Git integration.
