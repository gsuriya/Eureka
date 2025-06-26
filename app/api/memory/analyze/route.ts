import { NextResponse } from 'next/server';
import { mockDb, calculateCosineSimilarity } from '../db';

export async function GET(req: Request) {
  try {
    console.log('=== ANALYZING ALL CURRENT SIMILARITIES ===');
    
    const userId = "demo-user";
    const allItems = mockDb.listMemoryItems({ userId });
    
    console.log(`Found ${allItems.length} memory items to analyze`);
    
    if (allItems.length < 2) {
      return NextResponse.json({
        message: 'Need at least 2 items to analyze similarities',
        itemCount: allItems.length
      });
    }

    const analyses: any[] = [];
    const threshold = 0.5;

    // Compare all pairs
    for (let i = 0; i < allItems.length; i++) {
      for (let j = i + 1; j < allItems.length; j++) {
        const item1 = allItems[i];
        const item2 = allItems[j];
        
        if (item1.embedding && item2.embedding) {
          const similarity = calculateCosineSimilarity(item1.embedding, item2.embedding);
          
          const analysis = {
            text1: item1.text,
            text2: item2.text,
            similarity: similarity,
            similarityPercent: (similarity * 100).toFixed(2),
            connected: similarity > threshold,
            threshold: threshold,
            thresholdPercent: (threshold * 100).toFixed(1)
          };
          
          analyses.push(analysis);
          
          console.log(`📊 "${item1.text}" ↔ "${item2.text}"`);
          console.log(`   Similarity: ${similarity.toFixed(4)} (${(similarity * 100).toFixed(2)}%)`);
          console.log(`   ${similarity > threshold ? '✅ CONNECTED' : '❌ Not connected'} (threshold: ${(threshold * 100).toFixed(1)}%)`);
        }
      }
    }

    // Sort by similarity (highest first)
    analyses.sort((a, b) => b.similarity - a.similarity);

    console.log(`\n📈 SUMMARY:`);
    console.log(`Total pairs analyzed: ${analyses.length}`);
    console.log(`Connected pairs: ${analyses.filter(a => a.connected).length}`);
    console.log(`Highest similarity: ${analyses[0]?.similarityPercent}%`);
    console.log(`Lowest similarity: ${analyses[analyses.length - 1]?.similarityPercent}%`);
    console.log('=== END ANALYSIS ===\n');

    return NextResponse.json({
      analyses,
      summary: {
        totalPairs: analyses.length,
        connectedPairs: analyses.filter(a => a.connected).length,
        threshold: threshold,
        thresholdPercent: (threshold * 100).toFixed(1),
        highestSimilarity: analyses[0]?.similarity || 0,
        lowestSimilarity: analyses[analyses.length - 1]?.similarity || 0
      }
    });

  } catch (error: any) {
    console.error('[MEMORY_ANALYZE]', error);
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
  }
} 