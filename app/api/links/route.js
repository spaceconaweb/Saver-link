import { NextResponse } from "next/server";
import { getD1Database } from "../../lib/d1";

export async function GET() {
  try {
    const db = await getD1Database();
    const { results } = await db
      .prepare(
        `SELECT links.id, links.original_url, links.custom_name, links.custom_icon,
                links.created_at, summaries.summary_text AS summary
         FROM links
         LEFT JOIN summaries ON summaries.link_id = links.id
         ORDER BY links.created_at DESC`,
      )
      .all();

    return NextResponse.json({ links: results });
  } catch (error) {
    console.error("Failed to read links from D1:", error);
    return NextResponse.json({ error: "Unable to load saved links." }, { status: 500 });
  }
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const originalUrl = typeof body?.original_url === "string" ? body.original_url.trim() : "";
  const customName = typeof body?.custom_name === "string" ? body.custom_name.trim() : "";
  const customIcon = typeof body?.custom_icon === "string" ? body.custom_icon.trim() : "";

  let parsedUrl;
  try {
    parsedUrl = new URL(originalUrl);
  } catch {
    return NextResponse.json({ error: "A valid link URL is required." }, { status: 400 });
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return NextResponse.json({ error: "Only HTTP and HTTPS links can be saved." }, { status: 400 });
  }

  if (!customName || customName.length > 120) {
    return NextResponse.json(
      { error: "A link name between 1 and 120 characters is required." },
      { status: 400 },
    );
  }

  const allowedIcons = new Set([
    "Bookmark",
    "Layers",
    "Code",
    "FileText",
    "Cpu",
    "Briefcase",
    "Globe",
    "BookOpen",
  ]);
  if (!allowedIcons.has(customIcon)) {
    return NextResponse.json({ error: "Choose a supported link icon." }, { status: 400 });
  }

  const id = crypto.randomUUID();

  try {
    const db = await getD1Database();
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

    return NextResponse.json({ link }, { status: 201 });
  } catch (error) {
    console.error("Failed to save link to D1:", error);
    return NextResponse.json({ error: "Unable to save this link." }, { status: 500 });
  }
}

export async function DELETE(request) {
  const linkId = new URL(request.url).searchParams.get("linkId")?.trim();
  if (!linkId) {
    return NextResponse.json({ error: "The linkId query parameter is required." }, { status: 400 });
  }

  try {
    const db = await getD1Database();
    const result = await db.prepare("DELETE FROM links WHERE id = ?").bind(linkId).run();

    if (result.meta.changes === 0) {
      return NextResponse.json({ error: "Saved link not found." }, { status: 404 });
    }

    return NextResponse.json({ deleted: true, id: linkId });
  } catch (error) {
    console.error("Failed to delete link from D1:", error);
    return NextResponse.json({ error: "Unable to delete this link." }, { status: 500 });
  }
}
