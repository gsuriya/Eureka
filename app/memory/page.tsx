"use client"

import { useEffect, useRef, useState } from "react"
import NextLink from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { BookOpen, Brain, Filter, Search, ZoomIn, ZoomOut, ArrowLeft } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"

// Define MemoryItem type
interface MemoryItem {
  id: string;
  text: string;
  paperTitle: string;
  paperAuthors?: string;
  date: string;
}

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
  const [highlights, setHighlights] = useState<MemoryItem[]>([])
  const isMobile = useMobile()

  // Fetch memory items from API
  useEffect(() => {
    fetch('/api/memory/list')
      .then(res => res.json())
      .then((data: MemoryItem[]) => {
        setHighlights(data)
        // Convert highlights to nodes for the graph
        const graphNodes = data.map((highlight) => ({
          id: highlight.id,
          text: highlight.text,
          paperTitle: highlight.paperTitle,
          x: Math.random() * 800,
          y: Math.random() * 600,
          vx: 0,
          vy: 0,
        }))
        setNodes(graphNodes)
        // Optionally, you can generate links here if you want
        // setLinks(...)
      })
      .catch(console.error)
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
      ctx.strokeStyle = "rgba(13, 69, 131, 0.2)" // Lighter royal blue for links
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
            ? "rgba(13, 69, 131, 1)" // Solid royal blue for selected
            : "rgba(13, 69, 131, 0.7)" // Royal blue for others
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
        fx += (canvas.width / (2 * zoom) - node.x!) * 0.01
        fy += (canvas.height / (2 * zoom) - node.y!) * 0.01

        // Update velocity and position
        if (node.vx !== undefined && node.vy !== undefined) {
          node.vx = (node.vx + fx) * 0.4
          node.vy = (node.vy + fy) * 0.4
          node.x! += node.vx
          node.y! += node.vy
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

  const filteredHighlights = highlights.filter(
    (highlight) =>
      highlight.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      highlight.paperTitle.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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
            <NextLink href="/">
              <Button variant="ghost" size="sm" className="gap-1 text-royal-500 hover:bg-royal-100">
                <ArrowLeft className="h-4 w-4" /> Back to Home
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
                        const node = nodes.find((n) => n.id === highlight.id)
                        if (node) setSelectedNode(node)
                      }}
                    >
                      <CardContent className="p-3">
                        <p className={`text-sm line-clamp-2 ${selectedNode?.id === highlight.id ? 'text-royal-700' : 'text-gray-800'}`}>{highlight.text}</p>
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
                <Button variant="outline" size="icon" onClick={handleZoomIn} className="bg-white hover:bg-gray-100">
                  <ZoomIn className="h-4 w-4 text-royal-500" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleZoomOut} className="bg-white hover:bg-gray-100">
                  <ZoomOut className="h-4 w-4 text-royal-500" />
                </Button>
              </div>

              <div className="bg-white rounded-lg border h-[calc(100vh-160px)] shadow-sm">
                <canvas ref={canvasRef} className="w-full h-full" />
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
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-500 hover:text-gray-700 hover:bg-gray-100" onClick={() => setSelectedNode(null)}>
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
