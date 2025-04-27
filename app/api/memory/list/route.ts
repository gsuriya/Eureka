import { NextResponse } from 'next/server';
import { mockDb } from '../db';

export async function GET(req: Request) {
  try {
    // Use a mock/default userId instead of requiring authentication
    const userId = "demo-user";

    // Get memory items for this user from the shared database
    const memoryItems = mockDb.listMemoryItems({ userId });
    
    // Map to desired shape for frontend
    const result = memoryItems.map(item => ({
      id: item.id,
      text: item.text,
      paperId: item.paperId,
      paperTitle: `Paper ${item.paperId.split('-')[1] || 'Unknown'}`, // Mock title
      paperAuthors: 'Demo Authors',
      date: item.createdAt,
    }));

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('[MEMORY_LIST_GET]', error);
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
  }
} 