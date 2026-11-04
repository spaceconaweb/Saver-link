import { NextResponse } from 'next/server';

// POST: Triggers simulation proxy insights and passes analysis down to the frontend UI
export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const linkId = searchParams.get('linkId');

    if (!linkId) {
      return NextResponse.json({ error: 'Target link ID parameter missing' }, { status: 400 });
    }

    // Artificially wait 1.2 seconds to accurately mimic high-speed serverless inference parsing
    await new Promise((resolve) => setTimeout(resolve, 1200)); 

    const generatedSummaryText = "Automated AI Analysis: This resource details the core architectural benefits of deploying applications onto Cloudflare Workers, emphasizing sub-millisecond scaling metrics, global V8 isolated sandbox layers, and decoupled edge processing patterns.";

    return NextResponse.json({ summary_text: generatedSummaryText }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'AI processing or scraping failure' }, { status: 500 });
  }
}
