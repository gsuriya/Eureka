"use client"

import { useEffect, useRef, useState } from "react"
import NextLink from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { BookOpen, Brain, Filter, Search, ZoomIn, ZoomOut } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"

// Mock data for memory nodes
const mockHighlights = [
  {
    id: "1",
    text: "Attention mechanisms have become an integral part of compelling sequence modeling and transduction models in various tasks.",
    paperTitle: "Attention Is All You Need",
    paperAuthors: "Vaswani et al.",
    date: "2023-04-15",
  },
  {
    id: "2",
    text: "The Transformer allows for significantly more parallelization and can reach a new state of the art in translation quality.",
    paperTitle: "Attention Is All You Need",
    paperAuthors: "Vaswani et al.",
    date: "2023-04-15",
  },
  {
    id: "3",
    text: "Most competitive neural sequence transduction models have an encoder-decoder structure.",
    paperTitle: "Attention Is All You Need",
    paperAuthors: "Vaswani et al.",
    date: "2023-04-16",
  },
  {
    id: "4",
    text: "Large language models demonstrate emergent abilities that are not present in smaller-scale models.",
    paperTitle: "Emergent Abilities of Large Language Models",
    paperAuthors: "Wei et al.",
    date: "2023-04-20",
  },
  {
    id: "5",
    text: "Chain-of-thought prompting improves the reasoning ability of large language models on complex tasks.",
    paperTitle: "Chain-of-Thought Prompting",
    paperAuthors: "Wei et al.",
    date: "2023-04-22",
  },
]

// Define node graph data structure
interface Node {
  id: string
  text: string
  paperTitle: string
  x?: number
  y?: number
  vx?: number
  vy?: number
}

interface Link {
  source: string
  target: string
  strength: number
}

export default function MemoryPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [nodes, setNodes] = useState<Node[]>([])
  const [links, setLinks] = useState<Link[]>([])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [zoom, setZoom] = useState(1)
  const isMobile = useMobile()

  // Initialize the graph
  useEffect(() => {
    // Convert highlights to nodes
    const graphNodes = mockHighlights.map((highlight) => ({
      id: highlight.id,
      text: highlight.text,
      paperTitle: highlight.paperTitle,
      x: Math.random() * 800,
      y: Math.random() * 600,
      vx: 0,
      vy: 0,
    }))

    // Create links between nodes based on semantic similarity
    // In a real app, this would use embeddings or other NLP techniques
    const graphLinks: Link[] = [
      { source: "1", target: "2", strength: 0.8 },
      { source: "1", target: "3", strength: 0.6 },
      { source: "2", target: "3", strength: 0.7 },
      { source: "4", target: "5", strength: 0.9 },
      { source: "3", target: "4", strength: 0.4 },
    ]

    setNodes(graphNodes)
    setLinks(graphLinks)
  }, [])

  // Render the graph
  useEffect(() => {
    if (!canvasRef.current || nodes.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const resizeCanvas = () => {
      const container = canvas.parentElement
      if (container) {
        canvas.width = container.clientWidth
        canvas.height = container.clientHeight
      }
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Force-directed graph simulation
    const simulation = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.save()
      ctx.scale(zoom, zoom)

      // Draw links
      ctx.strokeStyle = "rgba(200, 200, 200, 0.6)"
      ctx.lineWidth = 1

      links.forEach((link) => {
        const source = nodes.find((n) => n.id === link.source)
        const target = nodes.find((n) => n.id === link.target)

        if (source && target && source.x && source.y && target.x && target.y) {
          ctx.beginPath()
          ctx.moveTo(source.x, source.y)
          ctx.lineTo(target.x, target.y)
          ctx.stroke()
        }
      })

      // Draw nodes
      nodes.forEach((node) => {
        if (node.x === undefined || node.y === undefined) return

        // Node circle
        ctx.beginPath()
        ctx.fillStyle =
          selectedNode?.id === node.id
            ? "rgba(147, 51, 234, 0.8)" // Purple for selected
            : node.paperTitle.includes("Attention")
              ? "rgba(59, 130, 246, 0.7)" // Blue for Attention paper
              : "rgba(79, 70, 229, 0.7)" // Indigo for others
        ctx.arc(node.x, node.y, 10, 0, Math.PI * 2)
        ctx.fill()

        // Draw text for selected node or on hover
        if (selectedNode?.id === node.id) {
          ctx.font = "12px Arial"
          ctx.fillStyle = "black"
          ctx.fillText(node.text.substring(0, 30) + "...", node.x + 15, node.y)
        }
      })

      ctx.restore()

      // Simple physics simulation
      nodes.forEach((node) => {
        if (node.x === undefined || node.y === undefined) return

        // Apply forces
        let fx = 0,
          fy = 0

        // Repulsive force between nodes
        nodes.forEach((other) => {
          if (node.id !== other.id && other.x !== undefined && other.y !== undefined) {
            const dx = node.x - other.x
            const dy = node.y - other.y
            const distance = Math.sqrt(dx * dx + dy * dy) || 1
            const force = 200 / (distance * distance)

            fx += (dx / distance) * force
            fy += (dy / distance) * force
          }
        })

        // Attractive force along links
        links.forEach((link) => {
          if (link.source === node.id || link.target === node.id) {
            const other = nodes.find((n) => n.id === (link.source === node.id ? link.target : link.source))

            if (other && other.x !== undefined && other.y !== undefined) {
              const dx = node.x - other.x
              const dy = node.y - other.y
              const distance = Math.sqrt(dx * dx + dy * dy) || 1
              const force = distance * 0.01 * link.strength

              fx -= (dx / distance) * force
              fy -= (dy / distance) * force
            }
          }
        })

        // Center gravity
        fx += (canvas.width / (2 * zoom) - node.x) * 0.01
        fy += (canvas.height / (2 * zoom) - node.y) * 0.01

        // Update velocity and position
        if (node.vx !== undefined && node.vy !== undefined) {
          node.vx = (node.vx + fx) * 0.4
          node.vy = (node.vy + fy) * 0.4
          node.x += node.vx
          node.y += node.vy
        }
      })

      requestAnimationFrame(simulation)
    }

    // Handle canvas interactions
    let isDragging = false
    let draggedNode: Node | null = null

    canvas.addEventListener("mousedown", (e) => {
      const rect = canvas.getBoundingClientRect()
      const x = (e.clientX - rect.left) / zoom
      const y = (e.clientY - rect.top) / zoom

      // Check if a node was clicked
      const clickedNode = nodes.find((node) => {
        if (node.x === undefined || node.y === undefined) return false
        const dx = node.x - x
        const dy = node.y - y
        return Math.sqrt(dx * dx + dy * dy) <= 10
      })

      if (clickedNode) {
        isDragging = true
        draggedNode = clickedNode
        setSelectedNode(clickedNode)
      } else {
        setSelectedNode(null)
      }
    })

    canvas.addEventListener("mousemove", (e) => {
      if (isDragging && draggedNode) {
        const rect = canvas.getBoundingClientRect()
        draggedNode.x = (e.clientX - rect.left) / zoom
        draggedNode.y = (e.clientY - rect.top) / zoom
        draggedNode.vx = 0
        draggedNode.vy = 0
      }
    })

    canvas.addEventListener("mouseup", () => {
      isDragging = false
      draggedNode = null
    })

    // Start simulation
    simulation()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [nodes, links, zoom, selectedNode])

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 3))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.5))
  }

  const filteredHighlights = mockHighlights.filter(
    (highlight) =>
      highlight.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      highlight.paperTitle.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <NextLink href="/" className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              <span className="font-semibold">PaperMind</span>
            </NextLink>
          </div>
          <div className="flex items-center gap-4">
            <NextLink href="/upload">
              <Button variant="outline" size="sm">
                Upload
              </Button>
            </NextLink>
            <NextLink href="/reader/demo">
              <Button variant="outline" size="sm">
                Reader
              </Button>
            </NextLink>
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
                <Brain className="h-5 w-5" />
                <h1 className="text-2xl font-bold">Memory Graph</h1>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  placeholder="Search highlights..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium">Highlights</h2>
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <Filter className="h-4 w-4 mr-1" />
                    Filter
                  </Button>
                </div>

                <div className="space-y-2 max-h-[calc(100vh-240px)] overflow-y-auto pr-2">
                  {filteredHighlights.map((highlight) => (
                    <Card
                      key={highlight.id}
                      className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                        selectedNode?.id === highlight.id ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20" : ""
                      }`}
                      onClick={() => {
                        const node = nodes.find((n) => n.id === highlight.id)
                        if (node) setSelectedNode(node)
                      }}
                    >
                      <CardContent className="p-3">
                        <p className="text-sm line-clamp-2">{highlight.text}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-gray-500">{highlight.paperTitle}</span>
                          <span className="text-xs text-gray-400">{highlight.date}</span>
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
                <Button variant="outline" size="icon" onClick={handleZoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleZoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border h-[calc(100vh-160px)]">
                <canvas ref={canvasRef} className="w-full h-full" />
              </div>

              {selectedNode && (
                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{selectedNode.paperTitle}</h3>
                          <p className="mt-2 text-sm">{selectedNode.text}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedNode(null)}>
                          <span className="sr-only">Close</span>
                          <span>×</span>
                        </Button>
                      </div>
                      <div className="mt-4 flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                          View in Context
                        </Button>
                        <Button size="sm">Find Related</Button>
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
