'use client'

import dynamic from 'next/dynamic'
import { ReactNode } from 'react'

// Load AFrameScript with dynamic import in a client component
const AFrameScript = dynamic(() => import('./aframe-script'), { ssr: false })

export default function ClientProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <AFrameScript />
    </>
  )
} 