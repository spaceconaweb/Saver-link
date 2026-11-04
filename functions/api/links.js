import { errorMessage, getDatabase, jsonResponse } from "../_shared/response.js";

const ALLOWED_ICONS = new Set([
  "Bookmark",
  "Layers",
  "Code",
  "FileText",
  "Cpu",
  "Briefcase",
  "Globe",
  "BookOpen",
  "Database",
]);

export async function onRequestGet({ env }) {
  try {
    const db = getDatabase(env);
    const { results } = await db
      .prepare(
        `SELECT links.id, links.original_url, links.custom_name, links.custom_icon,
                links.created_at, summaries.summary_text AS summary
         FROM links
         LEFT JOIN summaries ON summaries.link_id = links.id
         ORDER BY links.created_at DESC`,
      )
      .all();

    return jsonResponse({ links: results });
  } catch (error) {
    console.error("Failed to read links from D1:", error);
    return jsonResponse({ error: "Unable to load saved links." }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Request body must be valid JSON." }, 400);
  }

  const originalUrl = typeof body?.original_url === "string" ? body.original_url.trim() : "";
  const customName = typeof body?.custom_name === "string" ? body.custom_name.trim() : "";
  const customIcon = typeof body?.custom_icon === "string" ? body.custom_icon.trim() : "";

  let parsedUrl;
  try {
    parsedUrl = new URL(originalUrl);
  } catch {
    return jsonResponse({ error: "A valid link URL is required." }, 400);
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return jsonResponse({ error: "Only HTTP and HTTPS links can be saved." }, 400);
  }

  if (!customName || customName.length > 120) {
    return jsonResponse({ error: "A link name between 1 and 120 characters is required." }, 400);
  }

  if (!ALLOWED_ICONS.has(customIcon)) {
    return jsonResponse({ error: "Choose a supported link icon." }, 400);
  }

  const id = crypto.randomUUID();

  try {
    const db = getDatabase(env);
    await db
      .prepare(
        `INSERT INTO links (id, original_url, custom_name, custom_icon)
         VALUES (?, ?, ?, ?)`,
      )
      .bind(id, parsedUrl.href, customName, customIcon)
      .run();

    const link = await db
      .prepare(
        `SELECT id, original_url, custom_name, custom_icon, created_at,
                NULL AS summary
         FROM links
         WHERE id = ?`,
      )
      .bind(id)
      .first();

    if (!link) {
      throw new Error("Inserted link could not be read back from D1.");
    }

    return jsonResponse({ link }, 201);
  } catch (error) {
    console.error("Failed to save link to D1:", errorMessage(error));
    return jsonResponse({ error: "Unable to save this link." }, 500);
  }
}

export async function onRequestDelete({ request, env }) {
  const linkId = new URL(request.url).searchParams.get("linkId")?.trim();
  if (!linkId) {
    return jsonResponse({ error: "The linkId query parameter is required." }, 400);
  }

  try {
    const db = getDatabase(env);
    const result = await db.prepare("DELETE FROM links WHERE id = ?").bind(linkId).run();

    if (result.meta.changes === 0) {
      return jsonResponse({ error: "Saved link not found." }, 404);
    }

    return jsonResponse({ deleted: true, id: linkId });
  } catch (error) {
    console.error("Failed to delete link from D1:", errorMessage(error));
    return jsonResponse({ error: "Unable to delete this link." }, 500);
  }
}
