"use client"

import React, { useState } from 'react'
import { XIcon, Clipboard, CheckCircle, Loader2 } from 'lucide-react'
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
  }
  paperId: string
  onClose: () => void
  position: { x: number; y: number }
}

export default function HighlightPopup({ highlight, paperId, onClose, position }: HighlightPopupProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [summary, setSummary] = useState<string>(highlight.summary || 'Generating summary...')
  
  const handleClip = async () => {
    try {
      setStatus('loading')
      
      // If the highlight doesn't have an ID, save it to the database first
      if (!highlight._id) {
        const response = await fetch(`/api/papers/${paperId}/highlights`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: highlight.text,
            position: highlight.position,
            page: highlight.page,
          }),
        })
        
        if (!response.ok) {
          throw new Error('Failed to save highlight')
        }
        
        const data = await response.json()
        
        // Update the summary if we got one from the API
        if (data.highlight.summary && data.highlight.summary !== "Unable to generate summary.") {
          setSummary(data.highlight.summary)
        }
      }
      
      setStatus('success')
      
      // Reset status after 2 seconds
      setTimeout(() => {
        setStatus('idle')
      }, 2000)
    } catch (error) {
      console.error('Error clipping highlight:', error)
      setStatus('error')
      
      // Reset status after 2 seconds
      setTimeout(() => {
        setStatus('idle')
      }, 2000)
    }
  }
  
  return (
    <Card
      className="absolute z-50 bg-white shadow-lg rounded-lg p-4 w-72"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-md font-medium text-royal-700">Text Selection</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <XIcon size={18} />
        </button>
      </div>
      
      <div className="mb-3 text-sm text-gray-600 max-h-24 overflow-y-auto">
        {highlight.text}
      </div>
      
      <div className="mb-4">
        <h4 className="text-sm font-medium text-royal-600 mb-1">AI Summary</h4>
        <p className="text-sm text-gray-700 italic">
          {summary}
        </p>
      </div>
      
      <Button
        onClick={handleClip}
        disabled={status === 'loading' || status === 'success'}
        className="w-full bg-royal-600 hover:bg-royal-700 text-white flex items-center justify-center gap-2"
      >
        {status === 'idle' && (
          <>
            <Clipboard size={16} />
            <span>Clip Selection</span>
          </>
        )}
        {status === 'loading' && (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Saving...</span>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle size={16} />
            <span>Clipped!</span>
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