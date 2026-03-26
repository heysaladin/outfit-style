'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => {
    const original = Element.prototype.releasePointerCapture
    Element.prototype.releasePointerCapture = function (pointerId) {
      try {
        original.call(this, pointerId)
      } catch {
        // Radix UI fires this after pointer is already released — safe to ignore
      }
    }
    return () => {
      Element.prototype.releasePointerCapture = original
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}