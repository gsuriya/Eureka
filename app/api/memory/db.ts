import fs from 'fs';
import path from 'path';

// Define types for memory items
export interface MemoryItem {
  id: string;
  userId: string;
  paperId: string;
  text: string;
  source: string;
  createdAt: string;
}

// Define type for memory item data
export interface MemoryItemData {
  userId: string;
  paperId: string;
  text: string;
  source: string;
}

// Path to the JSON file for storing data
// Use path.join to ensure cross-platform compatibility
// Store it in a writable directory, e.g., inside `.next` or a dedicated `data` folder 
// IMPORTANT: Avoid storing it directly in `app` or `pages` as it might trigger rebuilds
const dataFilePath = path.join(process.cwd(), '.next', 'memory-db.json');

// Ensure the directory exists
try {
  fs.mkdirSync(path.dirname(dataFilePath), { recursive: true });
} catch (e) {
  // Ignore errors if directory already exists
}

// Initialize the file with an EMPTY array if it doesn't exist
const initializeData = () => {
  if (!fs.existsSync(dataFilePath)) {
    const initialData: MemoryItem[] = []; // Start with an empty array
    try {
        fs.writeFileSync(dataFilePath, JSON.stringify(initialData, null, 2));
        console.log('Initialized EMPTY memory-db.json');
    } catch (writeError) {
        console.error('Error initializing memory-db.json:', writeError);
    }
  }
};

initializeData();

// Helper function to read data from the file
const readData = (): MemoryItem[] => {
  try {
    if (!fs.existsSync(dataFilePath)) {
        initializeData(); // Initialize if file missing
    }
    const jsonData = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(jsonData) as MemoryItem[];
  } catch (error) {
    console.error('Error reading memory data:', error);
    return []; // Return empty array on error
  }
};

// Helper function to write data to the file
const writeData = (data: MemoryItem[]) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing memory data:', error);
  }
};

// Database object using file storage
export const mockDb = {
  createMemoryItem: (data: MemoryItemData): MemoryItem => {
    const currentData = readData();
    const id = `memory-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    const newItem: MemoryItem = { 
      id, 
      ...data, 
      createdAt: new Date().toISOString() 
    };
    currentData.push(newItem);
    writeData(currentData);
    console.log(`Added memory item to file: ${newItem.id}`, newItem);
    return newItem;
  },

  listMemoryItems: (filter?: { userId?: string }): MemoryItem[] => {
    const currentData = readData();
    console.log(`Listing memory items from file. Total: ${currentData.length}`);
    
    let result = currentData;
    if (filter?.userId) {
      result = currentData.filter(item => item.userId === filter.userId);
      console.log(`Filtered for user ${filter.userId}, found: ${result.length}`);
    }
    
    // Sort by most recent first
    return [...result].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}; 