'use client'

import { useState } from 'react'
import type { WardrobeItem } from '@/lib/types'
import { DECLUTTER_STATUSES } from '@/lib/types'

interface ItemCardProps {
  item: WardrobeItem
  onClick: () => void
  selected?: boolean
  selectable?: boolean
}

export function ItemCard({ item, onClick, selected, selectable }: ItemCardProps) {
  const hasOriginal = !!item.original_image_url && item.original_image_url !== item.image_url
  const [showOriginal, setShowOriginal] = useState(false)
  const src = showOriginal && item.original_image_url ? item.original_image_url : item.image_url
  const declutterColor = DECLUTTER_STATUSES.find(d => d.value === item.declutter_status)?.color

  return (
    <div className={`relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#1A1A1A] border transition-all ${
      selected ? 'border-white scale-[0.97]' : 'border-[#2A2A2A]'
    }`}>
      <button onClick={onClick} className="absolute inset-0 w-full h-full active:scale-95 transition-transform">
        <img src={src} alt={item.name} className="w-full h-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3 pt-6">
          <p className="text-white text-xs font-semibold truncate">{item.name}</p>
          <p className="text-[#888888] text-[10px]">
            {item.wear_count > 0 ? `${item.wear_count}× worn` : 'Never worn'}
          </p>
        </div>
      </button>

      {/* Declutter badge */}
      {item.declutter_status && (
        <div className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full border border-black/30"
          style={{ backgroundColor: declutterColor }} />
      )}

      {/* No-bg toggle */}
      {hasOriginal && (
        <button onClick={e => { e.stopPropagation(); setShowOriginal(v => !v) }}
          className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full border border-white/10 hover:bg-black/80 transition-colors">
          {showOriginal ? 'No BG' : 'Orig'}
        </button>
      )}

      {/* Bulk select checkmark */}
      {selectable && (
        <div className={`absolute inset-0 rounded-2xl border-2 transition-all pointer-events-none ${
          selected ? 'border-white bg-white/10' : 'border-transparent'
        }`}>
          {selected && (
            <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center">
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
