"use client"

import { useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react"

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

interface PDFViewerProps {
  url: string
  fileName?: string
}

export function PDFViewer({ url, fileName }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1.0)

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
  }

  function changePage(offset: number) {
    setPageNumber((prevPageNumber) => {
      const newPageNumber = prevPageNumber + offset
      return newPageNumber >= 1 && newPageNumber <= (numPages || 1) ? newPageNumber : prevPageNumber
    })
  }

  function changeScale(delta: number) {
    setScale((prevScale) => {
      const newScale = prevScale + delta
      return newScale >= 0.5 && newScale <= 2.5 ? newScale : prevScale
    })
  }

  return (
    <div className="flex flex-col items-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-4 w-full max-w-3xl">
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex justify-center items-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          }
          error={
            <div className="flex justify-center items-center h-96 text-center">
              <div>
                <p className="text-red-500 font-medium mb-2">Error loading PDF</p>
                <p className="text-gray-500 text-sm">Please try again or upload a different file.</p>
              </div>
            </div>
          }
          className="w-full"
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="flex justify-center"
            loading={
              <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            }
          />
        </Document>
      </div>

      <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow p-2 mb-6 w-full max-w-md">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => changePage(-1)}
            disabled={pageNumber <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="mx-2 text-sm">
            Page {pageNumber} of {numPages || "-"}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => changePage(1)}
            disabled={numPages !== null && pageNumber >= numPages}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => changeScale(-0.1)}
            disabled={scale <= 0.5}
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="mx-2 text-sm">{Math.round(scale * 100)}%</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => changeScale(0.1)}
            disabled={scale >= 2.5}
            aria-label="Zoom in"
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