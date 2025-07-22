'use server';

import 'server-only';
import { BrowserBaseExtractor } from './browserbase-extractor';

export async function extractPdfWithBrowserBase(url: string) {
  const extractor = new BrowserBaseExtractor(
    process.env.BROWSERBASE_API_KEY || '',
    process.env.BROWSERBASE_PROJECT_ID || ''
  );
  return extractor.extractPDF(url);
} 