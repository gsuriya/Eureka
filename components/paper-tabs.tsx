"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X } from "lucide-react"

interface Paper {
  id: string
  title: string
}

interface PaperTabsProps {
  papers: Paper[]
  activePaperId: string
  onTabChange: (id: string) => void
  onTabClose: (id: string) => void
}

export function PaperTabs({ papers, activePaperId, onTabChange, onTabClose }: PaperTabsProps) {
  return (
    <div className="border-b bg-gray-50 dark:bg-gray-900/50">
      <ScrollArea orientation="horizontal" className="w-full">
        <div className="flex">
          {papers.map((paper) => (
            <div
              key={paper.id}
              className={`flex items-center px-4 py-2 border-r border-b-2 min-w-[180px] max-w-[240px] ${
                paper.id === activePaperId
                  ? "border-b-blue-600 dark:border-b-blue-500 bg-white dark:bg-gray-950"
                  : "border-b-transparent hover:bg-gray-100 dark:hover:bg-gray-800/50"
              }`}
            >
              <button className="flex-1 text-sm font-medium truncate text-left" onClick={() => onTabChange(paper.id)}>
                {paper.title}
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 rounded-full opacity-50 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation()
                  onTabClose(paper.id)
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
