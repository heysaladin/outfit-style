'use client'

import { useState } from 'react'
import type { WardrobeItem } from '@/lib/types'

interface ItemCardProps {
  item: WardrobeItem
  onClick: () => void
}

export function ItemCard({ item, onClick }: ItemCardProps) {
  const hasOriginal = !!item.original_image_url && item.original_image_url !== item.image_url
  const [showOriginal, setShowOriginal] = useState(false)

  const src = showOriginal && item.original_image_url ? item.original_image_url : item.image_url

  return (
    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#1A1A1A] border border-[#2A2A2A]">
      <button
        onClick={onClick}
        className="absolute inset-0 w-full h-full active:scale-95 transition-transform"
      >
        <img src={src} alt={item.name} className="w-full h-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3 pt-6">
          <p className="text-white text-xs font-semibold truncate">{item.name}</p>
          <p className="text-[#888888] text-xs capitalize">{item.category}</p>
        </div>
      </button>

      {hasOriginal && (
        <button
          onClick={e => { e.stopPropagation(); setShowOriginal(v => !v) }}
          className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-1 rounded-full border border-white/10 hover:bg-black/80 transition-colors"
        >
          {showOriginal ? 'No BG' : 'Original'}
        </button>
      )}
    </div>
  )
}
