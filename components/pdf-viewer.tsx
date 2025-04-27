"use client"

import React, { useState } from "react"
import dynamic from 'next/dynamic'
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut } from "lucide-react"

// Dynamically import react-pdf components with ssr: false to avoid canvas issues
const PDFComponents = dynamic(() => import('./pdf-components'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-royal-500"></div>
    </div>
  )
});

interface PDFViewerProps {
  url: string
  fileName?: string
  paperId?: string
}

export function PDFViewer({ url, fileName, paperId }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [scale, setScale] = useState(2.0)

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
  }

  function changeScale(delta: number) {
    setScale((prevScale) => {
      const newScale = prevScale + delta
      return newScale >= 0.5 && newScale <= 3.0 ? newScale : prevScale
    })
  }

  return (
    <div className="flex flex-col items-center w-full">
      <div className="bg-white rounded-lg shadow-elegant p-4 mb-4 w-full max-w-full">
        <div className="min-h-[80vh] overflow-auto">
          <PDFComponents 
            file={url} 
            onLoadSuccess={onDocumentLoadSuccess} 
            scale={scale}
            showAllPages={true}
            paperId={paperId}
          />
        </div>
      </div>

      {/* Zoom Bar - now fixed at the bottom of the screen */}
      <div
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-sm p-2 w-full max-w-3xl z-50 flex items-center justify-between"
        style={{ pointerEvents: 'auto' }}
      >
        <div className="flex items-center">
          <span className="mx-2 text-sm text-gray-700">
            {numPages || "-"} Pages
          </span>
        </div>

        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => changeScale(-0.1)}
            disabled={scale <= 0.5}
            aria-label="Zoom out"
            className="border-gray-200 text-royal-500 hover:text-royal-600 hover:border-royal-200"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="mx-2 text-sm text-gray-700">{Math.round(scale * 100)}%</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => changeScale(0.1)}
            disabled={scale >= 3.0}
            aria-label="Zoom in"
            className="border-gray-200 text-royal-500 hover:text-royal-600 hover:border-royal-200"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {fileName && (
        <div className="text-center text-gray-500 text-sm mb-6">
          <p>{fileName}</p>
        </div>
      )}
    </div>
  )
} 