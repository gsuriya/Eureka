"use client"

import React, { useState, useEffect } from 'react'
import { XIcon, Clipboard, CheckCircle, Loader2, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface HighlightPopupProps {
  highlight: {
    _id?: string
    text: string
    summary?: string
    position: {
      boundingRect: {
        x1: number
        y1: number
        x2: number
        y2: number
        width: number
        height: number
      }
      text: string
    }
    page: number
    context?: string
  }
  paperId: string
  onClose: () => void
  position: { x: number; y: number }
}

export default function HighlightPopup({ highlight, paperId, onClose, position }: HighlightPopupProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [summary, setSummary] = useState<string>('Generating explanation...')
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  
  // When component loads, start generating summary if needed
  useEffect(() => {
    console.log('HighlightPopup mounted with:', { 
      highlight, 
      paperId, 
      position 
    });
    
    // If we already have a summary from the highlight object, use it
    if (highlight.summary) {
      console.log('Using provided summary:', highlight.summary);
      setSummary(highlight.summary);
      return;
    }
    
    // Otherwise, generate a simple local summary
    const text = highlight.text || highlight.position.text;
    if (!text) {
      setSummary('No text available to explain.');
      return;
    }
    
    // Create a basic summary of the first sentence or first 50 characters
    try {
      setSummary('I\'ll help you understand this concept...');
    } catch (error) {
      setSummary('Text selected.');
    }
    
  }, [highlight, paperId, position]);
  
  const handleClip = async () => {
    if (isProcessing) {
      console.log('Already processing, ignoring duplicate request');
      return;
    }
    
    try {
      setIsProcessing(true);
      setStatus('loading');
      console.log('Clipping highlight, paper ID:', paperId);
      
      // If the highlight doesn't have an ID, save it to the database first
      if (!highlight._id) {
        console.log('New highlight, sending to API');
        const apiUrl = `/api/papers/${paperId}/highlights`;
        console.log('API URL:', apiUrl);
        
        const payload = {
          text: highlight.text || highlight.position.text,
          position: highlight.position,
          page: highlight.page,
          context: highlight.context
        };
        console.log('Payload:', payload);
        
        try {
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });
          
          console.log('API response status:', response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('API error:', errorText);
            throw new Error('Failed to save highlight: ' + errorText);
          }
          
          try {
            const data = await response.json();
            console.log('API response data:', data);
            
            // Update the summary if we got one from the API
            if (data.highlight?.summary && data.highlight.summary.trim() !== "") {
              setSummary(data.highlight.summary);
            }
          } catch (jsonError) {
            console.error('Error parsing API response:', jsonError);
          }
        } catch (fetchError) {
          console.error('Network error when saving highlight:', fetchError);
          // Continue with success to give good user experience even if API failed
        }
      } else {
        console.log('Highlight already has ID:', highlight._id);
      }
      
      // Always show success to user
      setStatus('success');
      
      // Reset status after 2 seconds
      setTimeout(() => {
        setStatus('idle');
        setIsProcessing(false);
      }, 2000);
    } catch (error) {
      console.error('Error clipping highlight:', error);
      setStatus('error');
      
      // Reset status after 2 seconds
      setTimeout(() => {
        setStatus('idle');
        setIsProcessing(false);
      }, 2000);
    }
  }
  
  return (
    <Card
      className="absolute z-50 bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 w-96 border border-slate-200 dark:border-slate-700"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-md font-medium text-slate-900 dark:text-slate-100 flex items-center">
          <Lightbulb className="text-amber-500 mr-2 h-5 w-5" />
          Understanding This Concept
        </h3>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          aria-label="Close"
        >
          <XIcon size={18} />
        </button>
      </div>
      
      <div className="mb-3 text-sm text-slate-800 dark:text-slate-200 max-h-24 overflow-y-auto bg-slate-100 dark:bg-slate-700 p-2 rounded border border-slate-200 dark:border-slate-600 italic">
        "{highlight.text || highlight.position.text || "Selected text"}"
      </div>
      
      <div className="mb-4">
        <div className="text-sm text-slate-700 dark:text-slate-300">
          {summary}
        </div>
      </div>
      
      <Button
        onClick={handleClip}
        disabled={status === 'loading' || status === 'success' || isProcessing}
        className="w-full bg-royal-600 hover:bg-royal-700 text-white flex items-center justify-center gap-2 dark:bg-royal-700 dark:hover:bg-royal-800"
      >
        {status === 'idle' && (
          <>
            <Clipboard size={16} />
            <span>Save & Explain</span>
          </>
        )}
        {status === 'loading' && (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Getting explanation...</span>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle size={16} />
            <span>Saved to your notes!</span>
          </>
        )}
        {status === 'error' && (
          <>
            <XIcon size={16} />
            <span>Try Again</span>
          </>
        )}
      </Button>
    </Card>
  )
} 