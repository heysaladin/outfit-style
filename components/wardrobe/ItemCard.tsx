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
  const isDraft = !item.status || item.status === 'draft'

  return (
    <div className={`group relative flex flex-col gap-1.5 ${selected ? 'opacity-90' : ''}`}>
      {/* Image */}
      <div className={`relative aspect-square rounded-2xl overflow-hidden bg-muted transition-all ${
        selected ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background' : ''
      }`}>
        <button onClick={onClick} className="absolute inset-0 w-full h-full">
          <img src={src} alt={item.name} className="w-full h-full object-contain" />
        </button>

        {/* Draft badge */}
        {isDraft && (
          <div className="absolute top-2 left-2">
            <span className="bg-background/90 text-foreground text-[8px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-full">
              Draft
            </span>
          </div>
        )}

        {/* Declutter dot */}
        {item.declutter_status && (
          <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: declutterColor }} />
        )}

        {/* No-bg toggle */}
        {hasOriginal && (
          <button onClick={e => { e.stopPropagation(); setShowOriginal(v => !v) }}
            className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm text-foreground text-[9px] font-semibold px-2 py-1 rounded-full">
            {showOriginal ? 'Edit' : 'Raw'}
          </button>
        )}

        {/* Bulk select */}
        {selectable && (
          <div className={`absolute inset-0 rounded-2xl border-2 transition-all pointer-events-none ${
            selected ? 'border-foreground bg-foreground/10' : 'border-transparent'
          }`}>
            {selected && (
              <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-foreground rounded-full flex items-center justify-center shadow-sm">
                <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                  <path d="M1 3.5L3 5.5L8 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Text below image */}
      <button onClick={onClick} className="text-left px-0.5">
        <p className="text-foreground text-xs font-semibold truncate leading-tight">{item.name}</p>
        <p className="text-muted-foreground text-[10px] mt-0.5">
          {item.brand ? item.brand : item.wear_count > 0 ? `${item.wear_count}× worn` : 'Never worn'}
        </p>
      </button>
    </div>
  )
}
