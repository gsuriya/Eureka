"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, X, FileText, BookOpen, Upload, Plus } from "lucide-react"

// Mock data for imported papers
const mockPapers = [
  {
    id: "1",
    title: "Attention Is All You Need",
    authors: "Vaswani et al.",
    year: "2017",
    venue: "NeurIPS",
    isActive: true,
  },
  {
    id: "2",
    title: "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",
    authors: "Devlin et al.",
    year: "2019",
    venue: "NAACL",
    isActive: false,
  },
  {
    id: "3",
    title: "GPT-3: Language Models are Few-Shot Learners",
    authors: "Brown et al.",
    year: "2020",
    venue: "NeurIPS",
    isActive: false,
  },
  {
    id: "4",
    title: "Deep Residual Learning for Image Recognition",
    authors: "He et al.",
    year: "2016",
    venue: "CVPR",
    isActive: false,
  },
  {
    id: "5",
    title: "Transformer-XL: Attentive Language Models Beyond a Fixed-Length Context",
    authors: "Dai et al.",
    year: "2019",
    venue: "ACL",
    isActive: false,
  },
]

interface PapersSidebarProps {
  isOpen: boolean
  onClose: () => void
  activePaperId: string
  onPaperSelect: (id: string) => void
}

export function PapersSidebar({ isOpen, onClose, activePaperId, onPaperSelect }: PapersSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredPapers = mockPapers.filter(
    (paper) =>
      paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.authors.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div
      id="sidebar"
      className={`fixed inset-y-0 left-0 z-20 w-72 bg-white border-r shadow-lg transform transition-transform duration-200 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Sidebar Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-royal-500 p-1.5 rounded-lg">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="font-sans font-bold text-royal-500">Papers</span>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search papers..."
              className="pl-10 focus-royal-blue font-sans"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Papers List */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {filteredPapers.map((paper) => (
              <div
                key={paper.id}
                className={`p-3 rounded-lg cursor-pointer transition-all font-sans ${
                  paper.id === activePaperId
                    ? "bg-royal-50 border border-royal-200"
                    : "hover:bg-gray-50 border border-transparent"
                }`}
                onClick={() => onPaperSelect(paper.id)}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-md ${
                      paper.id === activePaperId
                        ? "bg-royal-100 text-royal-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`text-sm font-medium truncate ${
                        paper.id === activePaperId ? "text-royal-600" : "text-gray-800"
                      }`}
                    >
                      {paper.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {paper.authors} • {paper.year} • {paper.venue}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="p-4 border-t">
          <Link href="/upload">
            <Button className="w-full bg-royal-500 hover:bg-royal-600 text-white font-sans font-medium gap-2">
              <Upload className="h-4 w-4" />
              Upload New Paper
            </Button>
          </Link>
          <div className="mt-2 text-center">
            <Link
              href="/memory"
              className="text-sm text-royal-500 hover:text-royal-600 font-sans flex items-center justify-center gap-1"
            >
              <Plus className="h-3 w-3" />
              Import from Memory
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
