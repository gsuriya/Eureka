"use client"

import React, { useState, useEffect, useRef } from 'react'
import { XIcon, Clipboard, CheckCircle, Loader2, Lightbulb, Trash2, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// Define Highlight interface here instead of importing it
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

// Helper function to format markdown-like text into HTML elements
function formatText(text: string): React.ReactNode {
  // Basic replacement for markdown elements - can be expanded
  const html = text
    .replace(/^# (.*$)/gm, '<h1 class="text-xl font-bold mt-3 mb-2">$1</h1>') // H1
    .replace(/^## (.*$)/gm, '<h2 class="text-lg font-semibold mt-3 mb-1 text-slate-800 dark:text-slate-200">$1</h2>') // H2
    .replace(/^\* (.*$)/gm, '<li class="ml-4 list-disc">$1</li>') // Unordered list item (*)
    .replace(/^- (.*$)/gm, '<li class="ml-4 list-disc">$1</li>') // Unordered list item (-)
    .replace(/\n/g, '<br />') // Convert newlines to <br> for paragraph breaks

  // Wrap list items in <ul> if necessary (compatible approach)
  const wrappedHtml = html.replace(/(?:<li.*?<\/li>\s*<br\s*\/>\s*)+<li.*?<\/li>/g, (match) => {
    // Remove trailing <br /> tags within the list block before wrapping
    const cleanedMatch = match.replace(/(<br\s*\/>\s*)+$/g, '');
    return `<ul>${cleanedMatch.replace(/<br\s*\/>/g, '')}</ul>`; 
  }).replace(/^(<li.*?<\/li>)$/gm, '<ul>$1</ul>'); // Wrap single list items

  return <div dangerouslySetInnerHTML={{ __html: wrappedHtml }} />;
}

// Component for typing animation
function TypingAnimation({ text, speed = 10, onComplete }: {
  text: string;
  speed?: number;
  onComplete?: () => void;
}) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text) return;

    let index = 0;
    setDisplayedText('');
    setIsComplete(false);

    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(prev => prev + text.charAt(index));
        index++;
      } else {
        clearInterval(interval);
        setIsComplete(true);
        if (onComplete) onComplete();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  return (
    <div className="typing-animation">
      {displayedText ? formatText(displayedText) : null}
      {!isComplete && <span className="typing-cursor">|</span>}
    </div>
  );
}

interface HighlightPopupProps {
  highlight: Highlight
  paperId: string
  onClose: () => void
  position: { x: number; y: number }
  onDelete?: (highlight: Highlight) => void
}

export default function HighlightPopup({ highlight, paperId, onClose, position, onDelete }: HighlightPopupProps) {
  const [clipStatus, setClipStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isClipping, setIsClipping] = useState<boolean>(false);
  const [explainStatus, setExplainStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isExplaining, setIsExplaining] = useState<boolean>(false);
  const [summary, setSummary] = useState<string>('Generating explanation...'); // Keep local summary
  const [explanation, setExplanation] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Close popup on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [onClose]);

  // Initialize summary based on highlight prop
  useEffect(() => {
    console.log('HighlightPopup DEBUG:', {
      highlightId: highlight._id,
      hasId: !!highlight._id,
      hasDeleteHandler: !!onDelete,
      deleteButtonShouldShow: !!(highlight._id && onDelete)
    });

    if (highlight.summary) {
      setSummary(highlight.summary);
    } else {
      const text = highlight.text || highlight.position.text;
      if (!text) {
        setSummary('No text available.');
      } else {
        setSummary('Text selected. Click "Explain" for details.'); // Update initial summary
      }
    }
    // Reset explanation state when highlight changes
    setExplanation('');
    setIsTyping(false);
    setExplainStatus('idle');
    setIsExplaining(false);

  }, [highlight]); // Depend only on highlight

  const handleClip = async () => {
    if (isClipping) return; // Prevent multiple clicks

    setIsClipping(true);
    setClipStatus('loading');
    console.log('Clipping highlight, paper ID:', paperId);

    try {
      let currentHighlight = { ...highlight };

      // If the highlight doesn't have an ID, save it to the database first
      if (!currentHighlight._id) {
        console.log('New highlight, sending to API');
        const apiUrl = `/api/papers/${paperId}/highlights`;
        const payload = {
          text: currentHighlight.text || currentHighlight.position.text,
          position: currentHighlight.position,
          page: currentHighlight.page,
          context: currentHighlight.context
        };

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to save highlight: ${errorText}`);
        }

        const data = await response.json();
        console.log('API response data:', data);
        if (data.highlight?._id) {
          // Update the highlight with the ID received from the server
          currentHighlight._id = data.highlight._id;
          // Optionally update summary if provided by API on save
          if (data.highlight?.summary) {
             setSummary(data.highlight.summary);
          }
        }
      } else {
        console.log('Highlight already has ID:', currentHighlight._id);
      }

      // Show success
      setClipStatus('success');
      // Optionally, update parent state or trigger feedback
    } catch (error) {
      console.error('Error clipping highlight:', error);
      setClipStatus('error');
    } finally {
      // Reset status after 2 seconds
      setTimeout(() => {
        setClipStatus('idle');
        setIsClipping(false);
      }, 2000);
    }
  };

  const handleExplainWithGemini = async () => {
    if (isExplaining) return; // Prevent multiple clicks

    setIsExplaining(true);
    setExplainStatus('loading');
    setExplanation(''); // Clear previous explanation
    setIsTyping(false);

    try {
      const selectedText = highlight.text || highlight.position.text;
      if (!selectedText) {
        throw new Error('No text selected to explain');
      }

      const context = highlight.context || '';
      const prompt = `Explain this text simply, using Markdown for formatting (headings #, ##; lists -):\n\nText: "${selectedText}"\n\nContext: ${context}`;

      console.log('Sending to Gemini API:', { prompt });

      const response = await fetch('/api/gemini/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${errorText}`);
      }

      const data = await response.json();
      const fullExplanation = data.explanation || 'Failed to generate explanation.';

      console.log("Received explanation:", fullExplanation);
      setExplanation(fullExplanation); // Set the full explanation
      setIsTyping(true); // Start typing animation
      setExplainStatus('success');

    } catch (error) {
      console.error('Error getting explanation from Gemini:', error);
      setExplanation('Sorry, I could not generate an explanation.');
      setExplainStatus('error');
      setIsTyping(false);
    } finally {
      // Keep loading state until typing is complete or error occurs
       if (!isTyping && explanation === '') { // Only reset if typing didn't start (error)
         setIsExplaining(false);
       }
    }
  };

  const handleDelete = () => {
    console.log('Delete button clicked with highlight:', highlight);
    const isTemporary = !highlight._id;

    if (isTemporary) {
      console.log('Deleting temporary highlight');
      onClose();
      if (onDelete) onDelete(highlight); // Notify parent to remove from local state
      return;
    }

    if (!onDelete) {
      console.error('Cannot delete highlight: Missing onDelete handler');
      return;
    }

    console.log('Deleting highlight with ID:', highlight._id);
    onDelete(highlight); // Call parent's delete handler
  };

  // Log visible state of delete button
  console.log("Delete button visibility state:", {
    shouldShowDelete: !!onDelete, // Show if handler exists (ID check happens in handleDelete)
    highlightId: highlight._id,
    hasDeleteHandler: !!onDelete
  });

  return (
    <Card
      ref={popupRef}
      className={`absolute z-50 bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 border border-slate-200 dark:border-slate-700 transition-all duration-300 ${explanation ? 'w-[500px] max-w-[90vw]' : 'w-96'}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        maxHeight: explanation ? '70vh' : 'auto',
        overflowY: explanation ? 'auto' : 'visible'
      }}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-md font-medium text-slate-900 dark:text-slate-100 flex items-center">
          <Lightbulb className="text-amber-500 mr-2 h-5 w-5" />
          Understanding This Concept
        </h3>
        <div className="flex gap-2">
          {/* Share Button (Functionality TBD) */}
          <Button size="sm" variant="ghost" className="p-1 h-7 w-7" title="Share highlight">
            <Share2 className="h-4 w-4" />
          </Button>
          {/* Delete Button */}
          {onDelete && ( // Only render if onDelete prop is provided
            <Button
              size="sm"
              variant="ghost"
              className="p-1 h-7 w-7 hover:bg-red-100 hover:text-red-600"
              title="Delete highlight"
              onClick={handleDelete}
              disabled={isClipping || isExplaining} // Disable while other actions are in progress
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          {/* Close Button */}
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            aria-label="Close"
          >
            <XIcon size={16} />
          </button>
        </div>
      </div>

      {/* Highlighted Text */}
      <div className="mb-3 text-sm text-slate-800 dark:text-slate-200 max-h-24 overflow-y-auto bg-slate-100 dark:bg-slate-700 p-2 rounded border border-slate-200 dark:border-slate-600 italic">
        "{highlight.text || highlight.position.text || "Selected text"}"
      </div>

      {/* Explanation Area */}
      <div className="mb-4 prose prose-sm dark:prose-invert max-w-none min-h-[3rem]"> {/* Added min-height */}
        {isExplaining && explainStatus === 'loading' && !isTyping && (
           <div className="flex items-center justify-center text-slate-500 dark:text-slate-400">
             <Loader2 size={16} className="animate-spin mr-2" />
             <span>Generating explanation...</span>
           </div>
        )}
        {isTyping && explanation ? (
          <TypingAnimation
            text={explanation}
            speed={5} // Adjust speed as needed
            onComplete={() => {
              setIsTyping(false);
              setIsExplaining(false); // Mark explanation as fully complete
            }}
          />
        ) : explanation && !isTyping ? ( // Show full text once typing is done
          formatText(explanation)
        ) : !isExplaining && explainStatus !== 'loading' ? ( // Show summary if not explaining/loading
          <div className="text-sm text-slate-700 dark:text-slate-300">
            {summary}
          </div>
        ) : null}
         {explainStatus === 'error' && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-2">{explanation}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col space-y-2">
        <div className="flex space-x-2">
          {/* Clip Button */}
          <Button
            onClick={handleClip}
            disabled={isClipping || clipStatus === 'success'} // Disable while clipping or on success
            className="flex-1 bg-royal-600 hover:bg-royal-700 text-white flex items-center justify-center gap-2 dark:bg-royal-700 dark:hover:bg-royal-800"
          >
            {clipStatus === 'idle' && <><Clipboard size={16} /><span>Clip To Memory</span></>}
            {clipStatus === 'loading' && <><Loader2 size={16} className="animate-spin" /><span>Saving...</span></>}
            {clipStatus === 'success' && <><CheckCircle size={16} /><span>Saved!</span></>}
            {clipStatus === 'error' && <><XIcon size={16} /><span>Save Error</span></>}
          </Button>

          {/* Explain Button */}
          <Button
            onClick={handleExplainWithGemini}
            disabled={isExplaining} // Disable only while explaining
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2"
          >
            {isExplaining ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Explaining...</span>
              </>
            ) : (
              <>
                <Lightbulb size={16} />
                <span>Explain w/ Gemini</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Styles */}
      <style jsx global>{`
        .typing-cursor {
          display: inline-block;
          width: 2px; /* More visible cursor */
          height: 1em;
          background-color: currentColor;
          margin-left: 2px;
          animation: blink 1s step-end infinite;
        }
        @keyframes blink {
          from, to { opacity: 1; }
          50% { opacity: 0; }
        }
        /* Basic prose styling adjustments for dark mode */
        .dark .prose h1, .dark .prose h2, .dark .prose h3, .dark .prose h4, .dark .prose h5, .dark .prose h6 { color: #f1f5f9; }
        .dark .prose p, .dark .prose li, .dark .prose blockquote, .dark .prose td, .dark .prose th { color: #cbd5e1; }
        .dark .prose strong { color: #f8fafc; }
        .dark .prose code { color: #e2e8f0; background-color: #334155; padding: 0.1em 0.3em; border-radius: 0.25em; }
        .dark .prose a { color: #7dd3fc; }
        .dark .prose ul { list-style-type: disc; padding-left: 1.5em; } /* Ensure lists are styled */
        .prose ul { list-style-type: disc; padding-left: 1.5em; } /* Ensure lists are styled for light mode */
      `}</style>
    </Card>
  )
} 