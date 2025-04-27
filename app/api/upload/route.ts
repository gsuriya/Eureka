import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, dbModels, genAI } from '@/lib/config';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, fileName, fileContent } = body;
    const db = await connectToDatabase();
    const papersCollection = db.collection(dbModels.papers);

    // Prepare paper object
    const paper: any = {
      title: '',
      authors: [],
      abstract: '',
      content: fileContent || '',
      url: url || '',
      filePath: fileName ? `/uploads/${fileName}` : '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Use Gemini API to extract info (simulate for now)
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const titlePrompt = `Extract the title and authors from this research paper: ${paper.content.substring(0, 1000)}`;
    const titleResult = await model.generateContent(titlePrompt);
    const titleResponse = await titleResult.response;
    const titleText = titleResponse.text();
    
    const abstractPrompt = `Extract the abstract from this research paper: ${paper.content}`;
    const abstractResult = await model.generateContent(abstractPrompt);
    const abstractResponse = await abstractResult.response;
    const abstractText = abstractResponse.text();

    paper.title = titleText.split('\n')[0];
    paper.authors = titleText.split('\n')[1]?.split(',').map((author: string) => author.trim()) || [];
    paper.abstract = abstractText;

    // Save to MongoDB
    const result = await papersCollection.insertOne(paper);
    paper._id = result.insertedId;

    return NextResponse.json({ paper });
  } catch (error) {
    console.error('API upload error:', error);
    return NextResponse.json({ error: 'Failed to process paper.' }, { status: 500 });
  }
} 