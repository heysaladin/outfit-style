'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    // Suppress Radix UI releasePointerCapture noise
    const original = Element.prototype.releasePointerCapture
    Element.prototype.releasePointerCapture = function (pointerId) {
      try { original.call(this, pointerId) } catch { /* ignore */ }
    }
    return () => { Element.prototype.releasePointerCapture = original }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
