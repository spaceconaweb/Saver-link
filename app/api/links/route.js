import { NextResponse } from 'next/server';

// GET: Sends a starter card to your dashboard grid so the canvas isn't blank
export async function GET() {
  try {
    const mockLinks = [
      {
        id: 'mock-1',
        custom_name: 'Cloudflare Workers Documentation',
        original_url: 'https://cloudflare.com',
        custom_icon: 'Layers',
        created_at: Math.floor(Date.now() / 1000) - 86400,
        summary: 'Cloudflare Workers provides a serverless execution environment allowing developers to create entirely new applications without configuring infrastructure.'
      }
    ];
    return NextResponse.json({ links: mockLinks }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Database read failure' }, { status: 500 });
  }
}

// POST: Successfully accepts your pasted URL metadata and sends it right back to the frontend
export async function POST(request) {
  try {
    const body = await request.json();
    const { original_url, custom_name, custom_icon } = body;

    const newLinkRow = {
      id: crypto.randomUUID(),
      original_url: original_url || 'https://example.com',
      custom_name: custom_name || 'Untitled Resource',
      custom_icon: custom_icon || 'Bookmark',
      created_at: Math.floor(Date.now() / 1000),
      summary: null // Initially empty until the user triggers explicit AI summary actions
    };

    return NextResponse.json({ link: newLinkRow }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Database write failure' }, { status: 500 });
  }
}
