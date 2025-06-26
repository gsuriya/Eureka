"use client"

import { useState, useEffect, useCallback } from "react"
import NextLink from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { BookOpen, Brain, ArrowLeft, Loader2, RefreshCw } from "lucide-react"
import { useRouter } from 'next/navigation'
import { useToast } from "@/hooks/use-toast"
import SemanticGraph, { type GraphData, type GraphNode } from "@/components/semantic-graph"
import SimilarityMatrix from "@/components/similarity-matrix"

interface MemoryItem {
  id: string;
  text: string;
  paperId: string;
  paperTitle?: string;
  createdAt: string;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
}

export default function MemoryPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Fetch graph data from API
  const fetchGraphData = useCallback(async () => {
    try {
      console.log('Fetching graph data...')
      const response = await fetch('/api/memory/list')
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
      
      const data = await response.json()
      console.log('Received graph data:', data)
      
      // Validate the received data structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data format received from API')
      }
      
      const nodes = Array.isArray(data.nodes) ? data.nodes : []
      const edges = Array.isArray(data.edges) ? data.edges : []
      
      console.log(`Validated data: ${nodes.length} nodes, ${edges.length} edges`)
      
      setGraphData({ nodes, edges })
      setRefreshTrigger(prev => prev + 1) // Trigger similarity matrix refresh
    } catch (error) {
      console.error('Error fetching graph data:', error)
      toast({
        title: "Error",
        description: `Failed to load memory graph: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      })
      // Set empty data on error to prevent crashes
      setGraphData({ nodes: [], edges: [] })
    }
  }, [toast])

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await fetchGraphData()
      setLoading(false)
    }
    
    loadData()
  }, [fetchGraphData])

  // Handle manual refresh
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchGraphData()
    setRefreshing(false)
    toast({
      title: "Refreshed",
      description: "Memory graph updated"
    })
  }

  // Handle node deletion
  const handleNodeDelete = async (nodeId: string) => {
    try {
      console.log(`Deleting node: ${nodeId}`)
      
      const response = await fetch(`/api/memory/delete/${nodeId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete memory item')
      }

      // Update local state immediately
      setGraphData(prev => ({
        nodes: prev.nodes.filter(node => node.id !== nodeId),
        edges: prev.edges.filter(edge => 
          edge.source !== nodeId && edge.target !== nodeId
        )
      }))

      toast({
        title: "Deleted",
        description: "Memory item removed from graph"
      })

      // Trigger similarity matrix refresh
      setRefreshTrigger(prev => prev + 1)

    } catch (error: any) {
      console.error('Error deleting node:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete memory item",
        variant: "destructive"
      })
    }
  }

  // Handle node click (navigate to paper)
  const handleNodeClick = (node: GraphNode) => {
    console.log('Node clicked:', node)
    // You could implement additional actions here like showing more details
  }

  // Set up real-time updates (polling every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && !refreshing) {
        fetchGraphData()
      }
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [fetchGraphData, loading, refreshing])

  if (loading) {
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
          </div>
        </header>

        {/* Loading State */}
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-royal-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading memory graph...</p>
          </div>
        </main>
      </div>
    )
  }

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
              variant="outline" 
              size="sm" 
              className="gap-1 text-royal-500 hover:bg-royal-100"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1 text-royal-500 hover:bg-royal-100"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-6">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <Brain className="h-6 w-6 text-royal-500" />
              <h1 className="text-3xl font-sans font-bold text-royal-500">Semantic Memory Graph</h1>
            </div>

            {/* Graph or Empty State */}
            {graphData.nodes.length === 0 ? (
              <Card className="bg-white shadow-sm">
                <CardContent className="p-12 text-center">
                  <div className="bg-royal-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Brain className="h-8 w-8 text-royal-500" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    No Memory Items Yet
                  </h2>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Start highlighting text in papers to build your semantic knowledge graph. 
                    Similar concepts will automatically connect based on AI embeddings.
                  </p>
                  <NextLink href="/upload">
                    <Button className="bg-royal-500 hover:bg-royal-600 text-white">
                      Upload Your First Paper
                    </Button>
                  </NextLink>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Graph */}
                <div className="lg:col-span-2">
                  <Card className="bg-white shadow-sm">
                    <CardContent className="p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <h2 className="text-lg font-semibold text-royal-700">
                            Knowledge Graph
                          </h2>
                          <p className="text-sm text-gray-600">
                            Nodes represent clipped sentences. Connections show semantic similarity {'>'}50%.
                          </p>
                        </div>
                        <div className="text-sm text-gray-600">
                          Last updated: {new Date().toLocaleTimeString()}
                        </div>
                      </div>
                      
                      <SemanticGraph
                        graphData={graphData}
                        onNodeClick={handleNodeClick}
                        onNodeDelete={handleNodeDelete}
                        height="700px"
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Similarity Matrix */}
                <div className="lg:col-span-1">
                  <SimilarityMatrix refreshTrigger={refreshTrigger} />
                </div>
              </div>
            )}

            {/* Instructions */}
            <Card className="mt-6 bg-royal-50 border-royal-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-royal-700 mb-2">How to Use</h3>
                <ul className="text-sm text-royal-600 space-y-1">
                  <li>• <strong>Clip sentences</strong> in the PDF reader to add them to your memory</li>
                  <li>• <strong>Hover over nodes</strong> to see the full sentence text</li>
                  <li>• <strong>Click nodes</strong> to see details and navigate to the source paper</li>
                  <li>• <strong>Search</strong> to highlight matching nodes in green</li>
                  <li>• <strong>Connections</strong> are automatically created when similarity {'>'}50%</li>
                  <li>• <strong>Debug panel</strong> on the right shows all similarity scores for troubleshooting</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
