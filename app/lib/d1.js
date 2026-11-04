import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function getD1Database() {
  const { env } = await getCloudflareContext({ async: true });
  const db = env.DB;

  if (!db) {
    throw new Error('Cloudflare D1 binding "DB" is not configured.');
  }

  return db;
}
