import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, dbModels } from '@/lib/config';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Connect to the database
    const db = await connectToDatabase();
    const papersCollection = db.collection(dbModels.papers);
    
    // Try to parse the ID as an ObjectId (for MongoDB)
    let paper = null;
    try {
      const objectId = new ObjectId(id);
      paper = await papersCollection.findOne({ _id: objectId });
    } catch (error) {
      // If not a valid ObjectId, try finding by other means
      // This allows us to use demo IDs or other identifiers
      paper = await papersCollection.findOne({ id: id });
    }
    
    if (!paper) {
      return NextResponse.json(
        { error: 'Paper not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ paper });
  } catch (error) {
    console.error('Error fetching paper:', error);
    return NextResponse.json(
      { error: 'Failed to fetch paper' },
      { status: 500 }
    );
  }
} 