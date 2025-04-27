import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, dbModels, genAI } from '@/lib/config';
import { ObjectId } from 'mongodb';

// POST: Create a new highlight with AI summary
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { text, position, page } = await request.json();
    const paperId = params.id;
    
    if (!text || !position || page === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: text, position, or page' },
        { status: 400 }
      );
    }

    // Generate AI summary
    let summary = "";
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Please provide a concise summary of the following text in 1-2 sentences: "${text}"`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      summary = response.text();
    } catch (error) {
      console.error('Error generating AI summary:', error);
      summary = "Unable to generate summary.";
    }

    // Connect to the database
    const db = await connectToDatabase();
    const highlightsCollection = db.collection(dbModels.highlights);
    
    // Create a new highlight document
    const highlight = {
      paperId,
      text,
      summary,
      position,
      page,
      createdAt: new Date(),
    };
    
    // Insert the highlight into the database
    const result = await highlightsCollection.insertOne(highlight);
    
    return NextResponse.json({ 
      highlight: { ...highlight, _id: result.insertedId } 
    });
  } catch (error) {
    console.error('Error creating highlight:', error);
    return NextResponse.json(
      { error: 'Failed to create highlight' },
      { status: 500 }
    );
  }
}

// GET: Retrieve all highlights for a paper
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const paperId = params.id;
    
    // Connect to the database
    const db = await connectToDatabase();
    const highlightsCollection = db.collection(dbModels.highlights);
    
    // Find all highlights for this paper
    const highlights = await highlightsCollection
      .find({ paperId })
      .sort({ createdAt: -1 })
      .toArray();
    
    return NextResponse.json({ highlights });
  } catch (error) {
    console.error('Error fetching highlights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch highlights' },
      { status: 500 }
    );
  }
} 