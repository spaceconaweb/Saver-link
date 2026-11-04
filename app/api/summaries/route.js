import { NextResponse } from "next/server";
import { getD1Database } from "../../lib/d1";

export async function POST(request) {
  const linkId = new URL(request.url).searchParams.get("linkId")?.trim();
  if (!linkId) {
    return NextResponse.json({ error: "The linkId query parameter is required." }, { status: 400 });
  }

  try {
    const db = await getD1Database();
    const link = await db
      .prepare("SELECT id, original_url, custom_name FROM links WHERE id = ?")
      .bind(linkId)
      .first();

    if (!link) {
      return NextResponse.json({ error: "Saved link not found." }, { status: 404 });
    }

    const existing = await db
      .prepare("SELECT summary_text FROM summaries WHERE link_id = ?")
      .bind(linkId)
      .first();

    if (existing) {
      return NextResponse.json({ summary_text: existing.summary_text });
    }

    const domain = new URL(link.original_url).hostname.replace(/^www\./, "");
    const summaryText = `${link.custom_name} is saved from ${domain}. Open the link to revisit this resource and explore its details.`;

    await db
      .prepare(
        `INSERT INTO summaries (id, link_id, summary_text)
         VALUES (?, ?, ?)
         ON CONFLICT(link_id) DO NOTHING`,
      )
      .bind(crypto.randomUUID(), linkId, summaryText)
      .run();

    const savedSummary = await db
      .prepare("SELECT summary_text FROM summaries WHERE link_id = ?")
      .bind(linkId)
      .first();

    if (!savedSummary) {
      throw new Error("Generated summary could not be read back from D1.");
    }

    return NextResponse.json({ summary_text: savedSummary.summary_text });
  } catch (error) {
    console.error("Failed to read or create summary in D1:", error);
    return NextResponse.json({ error: "Unable to create a summary for this link." }, { status: 500 });
  }
}
