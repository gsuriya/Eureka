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

// This is a singleton mock database that persists across API requests
// while the server is running
class MockDatabase {
  private static instance: MockDatabase;
  public memory: MemoryItem[] = [];

  private constructor() {
    // Add sample data
    this.memory.push(
      {
        id: 'memory-1',
        userId: 'demo-user',
        paperId: 'paper-1',
        text: 'The Transformer architecture has revolutionized natural language processing',
        source: 'clip',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() // 2 days ago
      },
      {
        id: 'memory-2',
        userId: 'demo-user',
        paperId: 'paper-2',
        text: 'Graph neural networks can learn representations of molecular structures',
        source: 'clip',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
      }
    );
  }

  public static getInstance(): MockDatabase {
    if (!MockDatabase.instance) {
      MockDatabase.instance = new MockDatabase();
    }
    return MockDatabase.instance;
  }

  public createMemoryItem(data: MemoryItemData): MemoryItem {
    const id = `memory-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    const newItem = { 
      id, 
      ...data, 
      createdAt: new Date().toISOString() 
    };
    this.memory.push(newItem);
    console.log(`Added memory item: ${newItem.id}`, newItem);
    return newItem;
  }

  public listMemoryItems(filter?: { userId?: string }): MemoryItem[] {
    console.log(`Listing memory items. Total: ${this.memory.length}`);
    
    let result = this.memory;
    if (filter?.userId) {
      result = this.memory.filter(item => item.userId === filter.userId);
      console.log(`Filtered for user ${filter.userId}, found: ${result.length}`);
    }
    
    // Sort by most recent first
    return [...result].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}

// Export the singleton instance
export const mockDb = MockDatabase.getInstance(); 