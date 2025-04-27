'use client'

import { useEffect } from 'react'

export default function AFrameScript() {
  useEffect(() => {
    // Only execute in browser environment
    if (typeof window !== 'undefined') {
      // Check if AFRAME is already defined
      if (typeof window.AFRAME === 'undefined') {
        // Create script element
        const script = document.createElement('script')
        script.src = 'https://aframe.io/releases/1.5.0/aframe.min.js'
        script.async = true
        script.onload = () => {
          console.log('A-Frame loaded successfully!')
          
          // Load A-Frame Force Graph component after A-Frame is loaded
          const forceGraphScript = document.createElement('script')
          forceGraphScript.src = 'https://unpkg.com/aframe-forcegraph-component@3.2.3/dist/aframe-forcegraph-component.min.js'
          forceGraphScript.async = true
          document.head.appendChild(forceGraphScript)
        }
        
        // Append to document head
        document.head.appendChild(script)
      }
    }
  }, [])

  return null
}

// Add global type for AFRAME
declare global {
  interface Window {
    AFRAME: any
  }
} 