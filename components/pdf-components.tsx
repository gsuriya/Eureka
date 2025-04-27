"use client"

import { useState, useEffect, useRef, RefCallback } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import dynamic from "next/dynamic"

// Dynamically import the HighlightPopup component
const HighlightPopup = dynamic(() => import('./highlight-popup'), {
  ssr: false,
});

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
  paperId?: string
}

interface Highlight {
  _id?: string;
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
  text?: string;
  summary?: string;
  context?: string;
}

interface PopupState {
  visible: boolean;
  highlight: Highlight | null;
  position: { x: number; y: number };
}

interface HighlightProps {
  highlight: Highlight;
  onClick: (highlight: Highlight) => void;
}

export default function PDFComponents({ file, onLoadSuccess, pageNumber = 1, scale, showAllPages = false, paperId = '' }: PDFComponentsProps) {
  const [error, setError] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string>(file);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [numPages, setNumPages] = useState<number>(0);
  const [popup, setPopup] = useState<PopupState>({
    visible: false,
    highlight: null,
    position: { x: 0, y: 0 }
  });
  const [visiblePages, setVisiblePages] = useState<number[]>([]);
  
  const textLayerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<HTMLDivElement[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Initialize page refs when numPages changes
  useEffect(() => {
    pageRefs.current = Array(numPages).fill(null);
    
    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    // Setup new intersection observer to track visible pages
    observerRef.current = new IntersectionObserver((entries) => {
      const newVisiblePages: number[] = [];
      
      entries.forEach(entry => {
        const pageNum = parseInt(entry.target.getAttribute('data-page') || '0', 10);
        if (pageNum > 0) {
          if (entry.isIntersecting) {
            newVisiblePages.push(pageNum);
          }
        }
      });
      
      if (newVisiblePages.length > 0) {
        setVisiblePages(newVisiblePages);
      }
    }, {
      root: null,
      rootMargin: '0px',
      threshold: 0.3 // Page is considered visible when 30% is in viewport
    });
    
    // Observe all page elements
    setTimeout(() => {
      if (pageRefs.current) {
        pageRefs.current.forEach(pageEl => {
          if (pageEl && observerRef.current) {
            observerRef.current.observe(pageEl);
          }
        });
      }
    }, 100);
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
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

  // Load stored highlights on component mount
  useEffect(() => {
    console.log("PDF Components mounted with paperId:", paperId);
    if (paperId) {
      fetchHighlights();
    } else {
      console.log("No paperId provided, cannot fetch highlights");
    }
  }, [paperId]);

  const fetchHighlights = async () => {
    try {
      if (!paperId) return;
      
      const response = await fetch(`/api/papers/${paperId}/highlights`);
      if (!response.ok) {
        throw new Error('Failed to fetch highlights');
      }
      
      const data = await response.json();
      setHighlights(data.highlights || []);
    } catch (error) {
      console.error('Error fetching highlights:', error);
    }
  };

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

      // Check for overlapping highlights
      const hasOverlap = highlights.some(h => {
        if (h.page !== currentPage) return false;
        
        // Basic overlap detection using coordinates
        const r1 = h.position.boundingRect;
        const r2 = relativeRect;
        
        // Check if one rectangle is completely to the left of the other
        if (r1.x1 + r1.width < r2.x1 || r2.x1 + r2.width < r1.x1) return false;
        
        // Check if one rectangle is completely above the other
        if (r1.y1 + r1.height < r2.y1 || r2.y1 + r2.height < r1.y1) return false;
        
        // If we get here, the rectangles overlap
        return true;
      });

      if (hasOverlap) {
        console.log("Highlight overlaps with existing highlight, skipping");
        return;
      }

      // Create a highlight object
      const highlight: Highlight = {
        page: currentPage,
        position: {
          boundingRect: relativeRect,
          text,
        },
      };

      // Get document context for better summaries
      let context = "";
      try {
        const textLayerElements = pageElement.querySelectorAll(".react-pdf__Page__textContent");
        if (textLayerElements.length > 0) {
          const texts = Array.from(textLayerElements)
            .map(el => el.textContent || "")
            .filter(text => text.trim().length > 0);
          context = texts.join(" ");
        }
      } catch (error) {
        console.error("Error extracting context from page:", error);
      }

      // Calculate popup position relative to the page
      // Position to the right of the highlight
      const popupX = relativeRect.x2 + 10; // 10px to the right
      let popupY = relativeRect.y1;  // Top aligned
      
      // Calculate page width to avoid going off the edge
      const pageWidth = pageElement.clientWidth;
      const popupWidth = 400; // Width of popup including margins
      
      // Adjust position if would go off page
      const adjustedX = popupX + popupWidth > pageWidth
        ? Math.max(10, relativeRect.x1 - popupWidth - 10) // Left of highlight
        : popupX;

      // Add the highlight and immediately show popup
      setHighlights(prev => {
        const newHighlights = [...prev, highlight];
        
        // After adding the highlight, show popup immediately
        setPopup({
          visible: true,
          highlight: {
            ...highlight,
            context: context || undefined
          },
          position: {
            x: adjustedX,
            y: popupY
          }
        });
        
        return newHighlights;
      });
      
      console.log("Created highlight:", highlight);
      
      // Clear the selection
      selection.removeAllRanges();
    } catch (error) {
      console.error("Error creating highlight:", error);
    }
  };

  // Close the popup
  const closePopup = () => {
    setPopup({
      visible: false,
      highlight: null,
      position: { x: 0, y: 0 }
    });
  };

  // Create a ref callback to store page element references
  const setPageRef: RefCallback<HTMLDivElement> = (element: HTMLDivElement | null) => {
    if (!element) return;
    
    // Extract the page number from the data attribute
    const pageNum = parseInt(element.dataset.page || '0', 10);
    if (pageNum > 0) {
      pageRefs.current[pageNum - 1] = element;
      
      // Observe this page element for visibility
      if (observerRef.current) {
        observerRef.current.observe(element);
      }
    }
  };

  // Handle click on highlight
  const handleHighlightClick = (highlight: Highlight) => {
    // Get context for better summaries
    let context = "";
    try {
      const pageElement = pageRefs.current[highlight.page - 1];
      if (pageElement) {
        const textLayerElements = pageElement.querySelectorAll(".react-pdf__Page__textContent");
        if (textLayerElements.length > 0) {
          const texts = Array.from(textLayerElements)
            .map(el => el.textContent || "")
            .filter(text => text.trim().length > 0);
          context = texts.join(" ");
        }
      }
    } catch (error) {
      console.error("Error extracting context from page:", error);
    }
    
    // Calculate position to show popup
    const pageElement = pageRefs.current[highlight.page - 1];
    if (!pageElement) return;
    
    const highlightRect = highlight.position.boundingRect;
    
    // Position popup to the right of the highlight
    const popupX = highlightRect.x2 + 10; // 10px to the right
    const popupY = highlightRect.y1; // Align with top
    
    // Check if popup would go off page edge
    const pageWidth = pageElement.clientWidth;
    const popupWidth = 400; // Width of popup including margins
    
    // Adjust position if needed
    const adjustedX = popupX + popupWidth > pageWidth
      ? Math.max(10, highlightRect.x1 - popupWidth - 10) // Position left instead
      : popupX;
    
    // Show popup
    setPopup({
      visible: true,
      highlight: {
        ...highlight,
        context: context || undefined
      },
      position: {
        x: adjustedX,
        y: popupY
      }
    });
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
              className="absolute cursor-pointer transition-colors duration-200"
              style={{
                background: 'rgba(255, 226, 143, 0.6)', // Soft yellow highlight that works in both modes
                border: '1px solid rgba(230, 186, 73, 0.8)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                left: highlight.position.boundingRect.x1,
                top: highlight.position.boundingRect.y1,
                height: highlight.position.boundingRect.height,
                width: highlight.position.boundingRect.width,
              }}
              onClick={() => handleHighlightClick(highlight)}
              title="Click to view or edit this highlight"
            />
          ))}
          
        {/* Popup for this page */}
        {popup.visible && 
         popup.highlight && 
         popup.highlight.page === pageNum && (
          <div 
            className="absolute" 
            style={{
              left: popup.position.x,
              top: popup.position.y,
              zIndex: 50
            }}
          >
            <HighlightPopup
              highlight={popup.highlight}
              paperId={paperId}
              onClose={closePopup}
              position={{ x: 0, y: 0 }} // Position is handled by parent div
            />
          </div>
        )}
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
        
        {/* Display current page indicator when scrolling */}
        {showAllPages && visiblePages.length > 0 && (
          <div className="fixed bottom-4 right-4 bg-slate-800 text-white px-3 py-2 rounded-full shadow-lg opacity-80">
            <p className="text-sm font-medium">
              Page {Math.min(...visiblePages)} of {numPages}
            </p>
          </div>
        )}
        
        {/* Display highlight count */}
        {highlights.length > 0 && (
          <div className="mt-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-800 dark:text-slate-200">
              {highlights.length} highlight{highlights.length !== 1 ? 's' : ''} created.
            </p>
          </div>
        )}
      </div>
    </>
  );
}