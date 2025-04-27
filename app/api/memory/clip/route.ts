import { NextResponse } from 'next/server';
import { mockDb } from '../db';

export async function POST(req: Request) {
  try {
    // Use a mock/default userId instead of requiring authentication
    const userId = "demo-user"; // Fixed demo user ID
    
    const body = await req.json();
    const { paperId, text } = body;

    if (!paperId || !text) {
      return new NextResponse('Missing paperId or text', { status: 400 });
    }

    // Create the memory item using our shared mock database
    const memoryItem = mockDb.createMemoryItem({
      userId: userId,
      paperId: paperId,
      text: text,
      source: 'clip',
    });

    console.log(`Memory item created for paper ${paperId}:`, memoryItem);

    return NextResponse.json(memoryItem, { status: 201 });

  } catch (error: any) {
    console.error('[MEMORY_CLIP_POST]', error);
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
  }
} 