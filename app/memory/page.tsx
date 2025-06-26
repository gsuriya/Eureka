"use client"

import { useState } from "react"
import NextLink from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Brain, ArrowLeft } from "lucide-react"
import { useRouter } from 'next/navigation'

export default function MemoryPage() {
  const router = useRouter()
  const [memoryItems, setMemoryItems] = useState<any[]>([])

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
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-6">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-8">
              <Brain className="h-6 w-6 text-royal-500" />
              <h1 className="text-3xl font-sans font-bold text-royal-500">Memory Graph</h1>
            </div>

            {/* Empty State */}
            <Card className="bg-white shadow-sm">
              <CardContent className="p-12 text-center">
                <div className="bg-royal-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Brain className="h-8 w-8 text-royal-500" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Memory Graph is Empty
                </h2>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Start highlighting text in papers to build your knowledge graph. 
                  Connections between concepts will appear here automatically.
                </p>
                <NextLink href="/upload">
                  <Button className="bg-royal-500 hover:bg-royal-600 text-white">
                    Upload Your First Paper
                  </Button>
                </NextLink>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
