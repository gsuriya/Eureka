"use client"

import { useState, useEffect, useRef, RefCallback } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import dynamic from "next/dynamic"
import { useToast } from "@/hooks/use-toast"

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
  const { toast } = useToast();
  
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
  const handleTextSelection = async (currentPage: number) => {
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
      // Center popup vertically relative to the highlight
      let popupY = relativeRect.y1 + relativeRect.height / 2; 
      
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
        
        // Log the highlight creation
        console.log("Created new highlight:", { 
          highlight,
          hasId: !!highlight._id,
          totalHighlights: newHighlights.length
        });
        
        // After adding the highlight, show popup immediately
        setPopup({
          visible: true,
          highlight: {
            ...highlight,
            context: context || undefined
          },
          position: {
            x: adjustedX,
            y: popupY // Use the centered Y position
          }
        });
        
        return newHighlights;
      });
      
      // Log popup state after setting
      console.log("Popup state after creating highlight:", {
        visible: true,
        highlightHasId: !!(popup.highlight && popup.highlight._id),
        popupHighlight: popup.highlight
      });
      
      // Clear the selection
      selection.removeAllRanges();

      // If we have a paper ID, save the highlight to backend
      if (paperId) {
        try {
          console.log("Saving highlight to backend");
          const apiUrl = `/api/papers/${paperId}/highlights`;
          
          const payload = {
            text: highlight.text || highlight.position.text,
            position: highlight.position,
            page: highlight.page,
            context: context
          };
          
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });
          
          if (!response.ok) {
            throw new Error('Failed to save highlight to server');
          }
          
          const data = await response.json();
          console.log("Highlight saved to server:", data);
          
          if (data.highlight && data.highlight._id) {
            const serverHighlightId = data.highlight._id;
            
            // Update highlights state with the server ID
            setHighlights(prev => {
              return prev.map(h => {
                // Find the temporary highlight we just created by matching position/page
                if (h.page === highlight.page && 
                    h.position.boundingRect.x1 === highlight.position.boundingRect.x1 &&
                    h.position.boundingRect.y1 === highlight.position.boundingRect.y1) {
                  console.log("Updated highlight with server ID:", serverHighlightId);
                  // Return the updated highlight with ID and summary from server
                  return { 
                    ...h, 
                    _id: serverHighlightId,
                    summary: data.highlight.summary || h.summary
                  };
                }
                return h;
              });
            });
            
            // Also update the popup state with the server ID
            setPopup(prev => {
              if (prev.visible && prev.highlight) {
                console.log("Updated popup highlight with server ID:", serverHighlightId);
                return {
                  ...prev,
                  highlight: {
                    ...prev.highlight,
                    _id: serverHighlightId,
                    summary: data.highlight.summary || prev.highlight.summary
                  }
                };
              }
              return prev;
            });
          }
        } catch (error) {
          console.error("Error saving highlight:", error);
          toast({
            title: 'Error',
            description: 'Failed to save highlight to server.',
            variant: 'destructive',
          });
        }
      }
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

  // Delete highlight from backend
  const deleteHighlight = async (highlightId: string) => {
    console.log("deleteHighlight called with ID:", highlightId);
    if (!paperId) return;
    try {
      const response = await fetch(`/api/papers/${paperId}/highlights/${highlightId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete highlight from server');
      }
      console.log(`Highlight ${highlightId} deleted from server.`);
    } catch (error) {
      console.error('Error deleting highlight:', error);
      toast({
        title: 'Error',
        description: 'Could not delete highlight from server.',
        variant: 'destructive',
      });
    }
  };

  // Handle click on highlight
  const handleHighlightClick = (highlight: Highlight) => {
    // Debug logging for handleHighlightClick
    console.log("Highlight clicked:", {
      highlightId: highlight._id,
      hasId: !!highlight._id,
      highlight
    });
    
    // Check if the popup for this specific highlight is already visible
    if (popup.visible && popup.highlight?._id === highlight._id) {
      // Just close the popup if the same highlight is clicked again
      closePopup();
      return; // Stop processing here
    }

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
    // Center popup vertically relative to the highlight
    const popupY = highlightRect.y1 + highlightRect.height / 2; 
    
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
        y: popupY // Use centered Y position
      }
    });
  };
  
  // New function to delete a highlight
  const handleDeleteHighlight = (highlight: Highlight) => {
    console.log("handleDeleteHighlight called:", {
      highlight,
      highlightId: highlight._id,
      hasId: !!highlight._id
    });
    
    // Remove highlight locally regardless of whether it has an ID
    if (highlight._id) {
      // For highlights with an ID, filter by ID
      setHighlights(prev => prev.filter(h => h._id !== highlight._id));
      
      // Delete from backend
      deleteHighlight(highlight._id);
    } else {
      // For temporary highlights without an ID, filter by position
      setHighlights(prev => prev.filter(h => 
        h.page !== highlight.page || 
        h.position.boundingRect.x1 !== highlight.position.boundingRect.x1 ||
        h.position.boundingRect.y1 !== highlight.position.boundingRect.y1
      ));
    }
    
    // Close the popup
    closePopup();
    
    toast({
      title: 'Highlight removed',
      description: 'The highlight and explanation have been removed.',
    });
  };

  // Test function for the API delete endpoint (for debugging)
  const testDeleteEndpoint = async () => {
    if (!paperId || highlights.length === 0) return;
    
    // Take the first highlight that has an ID
    const testHighlight = highlights.find(h => h._id);
    if (!testHighlight || !testHighlight._id) {
      console.error("No highlight with ID found for testing");
      return;
    }
    
    console.log("Testing delete endpoint with:", {
      paperId,
      highlightId: testHighlight._id
    });
    
    try {
      const response = await fetch(`/api/papers/${paperId}/highlights/${testHighlight._id}`, {
        method: 'DELETE',
      });
      
      console.log("Delete test response:", {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });
      
      if (!response.ok) {
        const text = await response.text();
        console.error("Error response:", text);
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Delete test successful:", data);
      
      // Remove from state
      setHighlights(prev => prev.filter(h => h._id !== testHighlight._id));
      
    } catch (error) {
      console.error("Delete test failed:", error);
    }
  };
  
  // Run test once when highlights are loaded (for debugging only)
  useEffect(() => {
    if (highlights.length > 0 && highlights.some(h => h._id)) {
      // Uncomment to test the delete endpoint
      // setTimeout(testDeleteEndpoint, 5000);
      
      // Log all highlights with their IDs
      console.log("Loaded highlights:", highlights.map(h => ({
        id: h._id,
        hasId: !!h._id,
        page: h.page,
        text: h.text?.substring(0, 30) || h.position.text.substring(0, 30)
      })));
    }
  }, [highlights.length]);

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
              transform: 'translateY(-50%)', // Center vertically
              zIndex: 50,
              marginLeft: '50px', // Add more space between highlight and popup
              pointerEvents: 'auto' // Ensure popup is clickable
            }}
          >
            <HighlightPopup
              highlight={{
                ...popup.highlight,
                text: popup.highlight.text || popup.highlight.position.text || "", // Provide fallback for text
              }}
              paperId={paperId}
              onClose={closePopup}
              position={{ x: 0, y: 0 }} // Position is handled by parent div
              onDelete={handleDeleteHighlight}
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