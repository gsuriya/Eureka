"use client"

import { useEffect, useRef, useState } from "react"
import NextLink from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { BookOpen, Brain, Filter, Search, ZoomIn, ZoomOut, ArrowLeft, Loader2, Trash2 } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import { useRouter } from 'next/navigation'
import { useToast } from "@/hooks/use-toast"
import dynamic from "next/dynamic"

// Dynamically import ForceGraph to avoid SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph').then(mod => mod.ForceGraph2D), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-royal-500" />
    </div>
  )
})

// Define MemoryItem type
interface MemoryItem {
  id: string;
  text: string;
  paperTitle: string;
  paperId?: string;
  paperAuthors?: string;
  date: string;
}

// Define graph data structure
interface GraphNode {
  id: string;
  text: string;
  paperTitle: string;
  group?: number;
  x?: number;
  y?: number;
  __threeObj?: any; // For Three.js objects
}

interface GraphLink {
  source: string;
  target: string;
  strength: number;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// Import ForceGraphMethods type to help with TypeScript
type ForceGraphInstance = any; // Simplified type for the ref

export default function MemoryPage() {
  const graphRef = useRef<ForceGraphInstance>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] })
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [highlights, setHighlights] = useState<MemoryItem[]>([])
  const [loadingLinks, setLoadingLinks] = useState(false)
  const isMobile = useMobile()
  const router = useRouter()
  const { toast } = useToast()

  // Fetch memory items and initialize graph
  useEffect(() => {
    // Start with hardcoded nodes and edges for the demo
    const demoNodes = [
      // Cluster 1 - Technical AI (positioned top left)
      { id: "A", text: "Artificial intelligence includes game playing, expert systems, neural networks, natural language, and robotics.", paperTitle: "AI Fundamentals", x: 100, y: 100, group: 0 },
      { id: "B", text: "The best computer chess programs are now capable of beating humans.", paperTitle: "AI in Games", x: 200, y: 150, group: 0 },
      { id: "C", text: "Today, the hottest area of artificial intelligence is neural networks, which are proving successful in voice recognition and natural-language processing.", paperTitle: "Neural Networks", x: 150, y: 250, group: 0 },
      { id: "D", text: "There are several programming languages that are known as AI languages because they are used almost exclusively for AI applications.", paperTitle: "AI Programming", x: 300, y: 200, group: 0 },
      
      // Isolated Node (positioned center)
      { id: "E", text: "Now we can say that making a machine or say robot is not as easy as ABC.", paperTitle: "Robotics Challenges", x: 450, y: 350, group: 3 },
      
      // Cluster 2 - Human-like AI (positioned bottom right)
      { id: "F", text: "Artificial intelligence is the study of how to make things which can exactly work like humans do.", paperTitle: "AI Theory", x: 700, y: 450, group: 1 },
      { id: "G", text: "It is difficult to make a machine like humans which can show emotions or think like humans in different circumstances.", paperTitle: "AI Limitations", x: 650, y: 550, group: 1 },
      { id: "H", text: "Future research is centered on constructing human-like machines or robots.", paperTitle: "Future of AI", x: 800, y: 500, group: 1 }
    ];
    
    // Create hardcoded connections with strength values
    const hardcodedEdges = [
      // Cluster 1 connections
      { source: "A", target: "B", strength: 0.8 },
      { source: "A", target: "C", strength: 0.9 },
      { source: "A", target: "D", strength: 0.7 },
      { source: "B", target: "C", strength: 0.6 },
      { source: "C", target: "D", strength: 0.7 },
      
      // Cluster 2 connections
      { source: "F", target: "G", strength: 0.9 },
      { source: "G", target: "H", strength: 0.8 },
      { source: "F", target: "H", strength: 0.75 },
      
      // One cross-cluster connection (very weak)
      { source: "E", target: "F", strength: 0.3 },
      { source: "E", target: "G", strength: 0.2 }
    ];
    
    // First set the hardcoded data for immediate display
    const mockHighlights = demoNodes.map(node => ({
      id: node.id,
      text: node.text,
      paperTitle: node.paperTitle,
      date: new Date().toISOString()
    }));
    
    setHighlights(mockHighlights);
    setGraphData({ 
      nodes: demoNodes, 
      links: hardcodedEdges 
    });
    
    // Now fetch actual data from API and merge with demo data
    fetch('/api/memory/list')
      .then(res => res.json())
      .then((realHighlights: MemoryItem[]) => {
        // Filter out any highlights that match our demo IDs
        const newHighlights = realHighlights.filter(
          item => !demoNodes.some(demo => demo.id === item.id)
        );
        
        if (newHighlights.length > 0) {
          // Create nodes for new highlights with positions in available spaces
          const newNodes = newHighlights.map((highlight, index) => {
            // Assign new nodes to areas with spacing (near the right side)
            const x = 300 + (index % 3) * 150;
            const y = 100 + Math.floor(index / 3) * 120;
            
            return {
              id: highlight.id,
              text: highlight.text,
              paperTitle: highlight.paperTitle || 'Unknown Paper',
              x: x,
              y: y,
              group: 2 // New nodes get their own group color
            };
          });
          
          // Combine with demo nodes
          const allNodes = [...demoNodes, ...newNodes];
          
          // Generate semantic links for new nodes
          const newLinks = generateSemanticLinksForNewNodes(demoNodes, newNodes, hardcodedEdges);
          
          // Update state with combined data
          setHighlights([...mockHighlights, ...newHighlights]);
          setGraphData({
            nodes: allNodes,
            links: [...hardcodedEdges, ...newLinks]
          });
        }
      })
      .catch(error => {
        console.error("Error fetching additional memory items:", error);
      });
  }, []);
  
  /**
   * Generate semantic links between existing nodes and new nodes
   */
  const generateSemanticLinksForNewNodes = (
    existingNodes: GraphNode[], 
    newNodes: GraphNode[],
    existingLinks: GraphLink[]
  ): GraphLink[] => {
    const links: GraphLink[] = [];
    
    // Simple semantic similarity calculation between texts
    const calculateSimilarity = (text1: string, text2: string): number => {
      // Convert to lowercase and split into words
      const words1 = text1.toLowerCase().split(/\W+/).filter(w => w.length > 3);
      const words2 = text2.toLowerCase().split(/\W+/).filter(w => w.length > 3);
      
      // Count word overlap
      let matchCount = 0;
      for (const word of words1) {
        if (words2.includes(word)) matchCount++;
      }
      
      // Calculate similarity (0-1)
      const totalWords = Math.max(words1.length, words2.length);
      return totalWords > 0 ? matchCount / totalWords : 0;
    };
    
    // For each new node, find connections to existing nodes
    newNodes.forEach(newNode => {
      // Combine text and title for better matching
      const newNodeText = `${newNode.text} ${newNode.paperTitle}`;
      
      // Find at least one connection to existing nodes
      let bestMatch = { node: existingNodes[0], similarity: 0 };
      
      // Calculate similarities with existing nodes
      existingNodes.forEach(existingNode => {
        const existingNodeText = `${existingNode.text} ${existingNode.paperTitle}`;
        const similarity = calculateSimilarity(newNodeText, existingNodeText);
        
        // Add link if similarity is good enough
        if (similarity > 0.1) {
          links.push({
            source: newNode.id,
            target: existingNode.id,
            strength: similarity
          });
        }
        
        // Track best match
        if (similarity > bestMatch.similarity) {
          bestMatch = { node: existingNode, similarity };
        }
      });
      
      // Always ensure at least one connection
      if (!links.some(link => 
        (link.source === newNode.id && link.target === bestMatch.node.id) ||
        (link.source === bestMatch.node.id && link.target === newNode.id)
      )) {
        links.push({
          source: newNode.id,
          target: bestMatch.node.id,
          strength: Math.max(0.3, bestMatch.similarity) // Minimum strength of 0.3
        });
      }
    });
    
    return links;
  };

  // Handle node deletion
  const handleDeleteMemoryItem = async (idToDelete: string) => {
    console.log(`Requesting delete for item ID: ${idToDelete}`);

    try {
      const response = await fetch(`/api/memory/delete/${idToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete item: ${response.statusText}`);
      }

      // Remove item from local state immediately for UI update
      setHighlights(prev => prev.filter(item => item.id !== idToDelete));
      
      // Update graph data
      setGraphData(prev => ({
        nodes: prev.nodes.filter(node => node.id !== idToDelete),
        links: prev.links.filter(link => 
          link.source !== idToDelete && link.target !== idToDelete
        )
      }));
      
      toast({ title: "Success", description: "Memory item deleted." });
      
      // If the deleted node was selected, clear selection
      if (selectedNode?.id === idToDelete) {
        setSelectedNode(null);
      }

    } catch (error: any) {
      console.error('Error deleting memory item:', error);
      toast({ 
        title: "Error", 
        description: error.message || "Could not delete item.", 
        variant: 'destructive' 
      });
    }
  };

  const filteredHighlights = highlights.filter(
    (highlight) =>
      highlight.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      highlight.paperTitle.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Node object color based on group
  const getNodeColor = (node: GraphNode) => {
    const colors = [
      'rgba(13, 69, 131, 1)',  // Royal blue
      'rgba(39, 123, 123, 1)', // Teal
      'rgba(77, 102, 175, 1)', // Blue-purple
      'rgba(13, 104, 131, 1)', // Darker blue
      'rgba(46, 139, 139, 1)'  // Darker teal
    ];
    
    return node.id === selectedNode?.id 
      ? 'rgba(234, 90, 12, 1)' // Orange for selected node
      : colors[node.group || 0];
  };

  return (
    <div className="flex flex-col min-h-screen bg-ivory">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <NextLink href="/" className="flex items-center gap-2">
              <div className="bg-royal-500 p-1.5 rounded-lg">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="font-sans font-bold text-royal-500">Eureka</span>
            </NextLink>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1 text-royal-500 hover:bg-royal-100"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" /> Back to Reader View
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-6">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar */}
            <div className="w-full md:w-80 space-y-4">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-royal-500" />
                <h1 className="text-2xl font-sans font-bold text-royal-500">Memory Graph</h1>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  placeholder="Search highlights..."
                  className="pl-10 font-sans focus-royal-blue"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-sans font-medium text-gray-700">Highlights</h2>
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-royal-500 hover:bg-royal-100">
                    <Filter className="h-4 w-4 mr-1" />
                    Filter
                  </Button>
                </div>

                <div className="space-y-2 max-h-[calc(100vh-240px)] overflow-y-auto pr-2">
                  {filteredHighlights.map((highlight) => (
                    <Card
                      key={highlight.id}
                      className={`cursor-pointer hover:bg-gray-50 transition-colors font-sans border shadow-sm ${
                        selectedNode?.id === highlight.id ? "border-royal-500 bg-royal-50" : "bg-white"
                      }`}
                      onClick={() => {
                        const node = graphData.nodes.find((n) => n.id === highlight.id);
                        if (node) setSelectedNode(node);
                      }}
                    >
                      <CardContent className="p-3 relative group">
                        <p className={`text-sm line-clamp-2 ${selectedNode?.id === highlight.id ? 'text-royal-700' : 'text-gray-800'}`}>
                          {highlight.text}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-5 w-5 min-w-5 flex-shrink-0 bg-white text-red-500 hover:text-white hover:bg-red-500 border border-gray-200 rounded-full flex items-center justify-center shadow-sm transition-all opacity-80 group-hover:opacity-100" 
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent card click
                              handleDeleteMemoryItem(highlight.id);
                            }}
                            title="Delete Memory Item"
                          > 
                            <Trash2 className="h-3 w-3" />
                          </Button>
                          <div className="flex-1 flex justify-between min-w-0">
                            <span className="text-xs text-gray-500 truncate pr-2 flex-1" title={highlight.paperTitle}>
                              {highlight.paperTitle || 'Unknown Paper'}
                            </span>
                            <span className="text-xs text-gray-400 flex-shrink-0">
                              {new Date(highlight.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Graph View */}
            <div className="flex-1 relative">
              <div className="absolute top-2 right-2 flex gap-2 z-10">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => {
                    if (graphRef.current) {
                      // @ts-ignore
                      graphRef.current.zoomIn();
                    }
                  }} 
                  className="bg-white hover:bg-gray-100"
                >
                  <ZoomIn className="h-4 w-4 text-royal-500" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => {
                    if (graphRef.current) {
                      // @ts-ignore
                      graphRef.current.zoomOut();
                    }
                  }} 
                  className="bg-white hover:bg-gray-100"
                >
                  <ZoomOut className="h-4 w-4 text-royal-500" />
                </Button>
              </div>

              {/* Loading Indicator */} 
              {loadingLinks && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-white/80 p-4 rounded-lg shadow flex items-center">
                  <Loader2 className="h-6 w-6 animate-spin text-royal-500" />
                  <span className="ml-2 text-sm text-gray-600">Generating connections...</span>
                </div>
              )}
              
              <div className="bg-white rounded-lg border h-[calc(100vh-160px)] shadow-sm">
                {highlights.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">Memory is empty. Clip some highlights!</p>
                  </div>
                ) : (
                  <ForceGraph2D
                    ref={graphRef}
                    graphData={graphData}
                    nodeId="id"
                    nodeVal={(node) => ((node as any).id === selectedNode?.id ? 20 : 10)} // Larger selected nodes
                    nodeLabel={(node) => `${(node as any).paperTitle}: ${(node as any).text.substring(0, 80)}...`}
                    nodeColor={(node) => getNodeColor(node as any)}
                    linkWidth={(link) => ((link as any).strength || 0.5) * 5} // Link width based on strength
                    linkColor={() => 'rgba(13, 69, 131, 0.4)'} // Semi-transparent royal blue
                    onNodeClick={(node) => setSelectedNode(node as GraphNode)}
                    onBackgroundClick={() => setSelectedNode(null)}
                    cooldownTicks={50} // Fewer ticks for faster stabilization
                    cooldownTime={1000}
                    d3AlphaDecay={0.3} // Faster decay to respect fixed positions
                    d3VelocityDecay={0.8} // High decay to limit node movement
                    nodeCanvasObject={(node, ctx, globalScale) => {
                      const typedNode = node as any;
                      const label = typedNode.text.substring(0, 25) + "...";
                      const fontSize = 14/globalScale;
                      const isSelected = typedNode.id === selectedNode?.id;
                      
                      // Draw node
                      ctx.beginPath();
                      ctx.arc(typedNode.x || 0, typedNode.y || 0, isSelected ? 8 : 5, 0, 2 * Math.PI);
                      ctx.fillStyle = getNodeColor(typedNode);
                      ctx.fill();
                      
                      // Draw label for selected node or on hover
                      if (isSelected) {
                        ctx.font = `${fontSize}px Sans-Serif`;
                        ctx.fillStyle = 'black';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(label, (typedNode.x || 0), (typedNode.y || 0) + 15);
                      }
                    }}
                    linkDirectionalParticles={3}
                    linkDirectionalParticleWidth={(link) => ((link as any).strength || 0.5) * 3}
                    linkDirectionalParticleSpeed={0.006}
                    width={800}
                    height={600}
                    // Fix node positions by making fx and fy same as x and y
                    onEngineStop={() => {
                      // Fix node positions after initial simulation
                      if (graphRef.current) {
                        const nodes = graphData.nodes.map(node => ({
                          ...node,
                          fx: node.x, // Fix x position
                          fy: node.y  // Fix y position
                        }));
                        setGraphData({
                          nodes,
                          links: graphData.links
                        });
                      }
                    }}
                  />
                )}
              </div>

              {selectedNode && (
                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <Card className="shadow-lg border border-royal-200">
                    <CardContent className="p-4 font-sans">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-royal-700">{selectedNode.paperTitle}</h3>
                          <p className="mt-2 text-sm text-gray-800">{selectedNode.text}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-gray-500 hover:text-gray-700 hover:bg-gray-100" 
                          onClick={() => setSelectedNode(null)}
                        >
                          <span className="sr-only">Close</span>
                          <span>×</span>
                        </Button>
                      </div>
                      <div className="mt-4 flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="text-royal-500 border-royal-200 hover:bg-royal-50">
                          View in Context
                        </Button>
                        <Button size="sm" className="bg-royal-500 hover:bg-royal-600 text-white">
                          Find Related
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
