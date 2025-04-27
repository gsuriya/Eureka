"use client"

import { useState, useEffect, useRef, RefCallback } from "react"
import { Document, Page, pdfjs } from "react-pdf"

// Set worker source - only executed on client
if (typeof window !== 'undefined') {
  // Use version 2.12.313 to match what react-pdf is using internally
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@2.12.313/build/pdf.worker.min.js`;
}

interface PDFComponentsProps {
  file: string
  onLoadSuccess: ({ numPages }: { numPages: number }) => void
  pageNumber?: number
  scale: number
  showAllPages?: boolean
}

interface Highlight {
  page: number;
  position: {
    boundingRect: {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      width: number;
      height: number;
    };
    text: string;
  };
}

export default function PDFComponents({ file, onLoadSuccess, pageNumber = 1, scale, showAllPages = false }: PDFComponentsProps) {
  const [error, setError] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string>(file);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [numPages, setNumPages] = useState<number>(0);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<HTMLDivElement[]>([]);

  // Initialize page refs when numPages changes
  useEffect(() => {
    pageRefs.current = Array(numPages).fill(null);
  }, [numPages]);

  // Ensure file path is correct
  useEffect(() => {
    // If the path doesn't start with http or blob, make sure it's a proper URL
    if (file && !file.startsWith('http') && !file.startsWith('blob')) {
      // Ensure the file path starts with a forward slash
      const path = file.startsWith('/') ? file : `/${file}`;
      setFileUrl(window.location.origin + path);
      console.log("Resolved PDF URL:", window.location.origin + path);
    } else {
      setFileUrl(file);
      console.log("Using original PDF URL:", file);
    }
  }, [file]);

  const handleError = (err: Error) => {
    console.error("PDF Error:", err);
    setError(err.message);
  };

  const handleDocumentLoadSuccess = (data: { numPages: number }) => {
    setNumPages(data.numPages);
    onLoadSuccess(data);
  };

  // Function to handle text selection and create highlights
  const handleTextSelection = (currentPage: number) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    try {
      // Get the selected text
      const text = selection.toString().trim();
      if (!text) return;

      // Get the bounding client rect of the selection
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      if (!rect.width || !rect.height) return;

      // Get page element
      const pageElement = pageRefs.current[currentPage - 1];
      if (!pageElement) {
        console.error("Page element reference not available");
        return;
      }

      // Get the page's position
      const pageRect = pageElement.getBoundingClientRect();
      
      // Calculate position relative to the page
      const relativeRect = {
        x1: rect.left - pageRect.left,
        y1: rect.top - pageRect.top,
        x2: rect.right - pageRect.left,
        y2: rect.bottom - pageRect.top,
        width: rect.width,
        height: rect.height,
      };

      // Create a highlight object
      const highlight: Highlight = {
        page: currentPage,
        position: {
          boundingRect: relativeRect,
          text,
        },
      };

      // Add the highlight
      setHighlights(prev => [...prev, highlight]);
      
      console.log("Created highlight:", highlight);
      
      // Clear the selection
      selection.removeAllRanges();
    } catch (error) {
      console.error("Error creating highlight:", error);
    }
  };

  // Create a ref callback to store page element references
  const setPageRef: RefCallback<HTMLDivElement> = (element: HTMLDivElement | null) => {
    if (!element) return;
    
    // Extract the page number from the data attribute
    const pageNum = parseInt(element.dataset.page || '0', 10);
    if (pageNum > 0) {
      pageRefs.current[pageNum - 1] = element;
    }
  };

  // Render a single page with highlights
  const renderPage = (pageNum: number) => {
    return (
      <div 
        key={`page_${pageNum}`} 
        className="relative mb-8" 
        ref={setPageRef}
        data-page={pageNum}
        onMouseUp={() => handleTextSelection(pageNum)}
      >
        {/* PDF Page */}
        <Page
          pageNumber={pageNum}
          scale={scale}
          renderTextLayer={true}
          renderAnnotationLayer={false}
          className="shadow-xl"
          loading={
            <div className="flex justify-center items-center h-[60vh]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-royal-500"></div>
            </div>
          }
        />
        
        {/* Highlight layers - positioned relative to the Page */}
        {highlights
          .filter(highlight => highlight.page === pageNum)
          .map((highlight, index) => (
            <div
              key={index}
              className="absolute bg-yellow-200 opacity-50 pointer-events-none z-10"
              style={{
                left: highlight.position.boundingRect.x1,
                top: highlight.position.boundingRect.y1,
                width: highlight.position.boundingRect.width,
                height: highlight.position.boundingRect.height,
              }}
              title={highlight.position.text}
            />
          ))}
      </div>
    );
  };

  return (
    <>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error loading PDF</p>
          <p className="text-sm">{error}</p>
          <p className="text-sm mt-2">URL: {fileUrl}</p>
        </div>
      )}
      
      <div className="relative w-full flex items-center justify-center" ref={containerRef}>
        <Document
          file={fileUrl}
          onLoadSuccess={handleDocumentLoadSuccess}
          onLoadError={handleError}
          loading={
            <div className="flex justify-center items-center h-[80vh]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-royal-500"></div>
            </div>
          }
          error={
            <div className="flex justify-center items-center h-[80vh] text-center">
              <div>
                <p className="text-red-500 font-medium mb-2">Error loading PDF</p>
                <p className="text-gray-500 text-sm">Please try again or upload a different file.</p>
                <p className="text-gray-500 text-xs mt-4">URL: {fileUrl}</p>
              </div>
            </div>
          }
          className="w-full"
        >
          <div className="relative w-full flex flex-col items-center">
            {showAllPages 
              ? Array.from(new Array(numPages), (_, index) => renderPage(index + 1))
              : renderPage(pageNumber)
            }
          </div>
        </Document>
        
        {/* Display highlight count */}
        {highlights.length > 0 && (
          <div className="mt-4 p-2 bg-blue-50 rounded-md border border-blue-100">
            <p className="text-sm text-blue-800">
              {highlights.length} highlight{highlights.length !== 1 ? 's' : ''} created.
            </p>
          </div>
        )}
      </div>
    </>
  )
}