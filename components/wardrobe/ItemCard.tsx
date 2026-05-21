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
    <div className={`relative aspect-[3/4] rounded-2xl overflow-hidden bg-muted border transition-all ${
      selected ? 'border-primary scale-[0.97]' : 'border-border'
    }`}>
      <button onClick={onClick} className="absolute inset-0 w-full h-full active:scale-95 transition-transform">
        <img src={src} alt={item.name} className="w-full h-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3 pt-6">
          <div className="flex items-center gap-1.5">
            <p className="text-white text-xs font-semibold truncate">{item.name}</p>
            {(!item.status || item.status === 'draft') && (
              <span className="shrink-0 text-[8px] font-bold tracking-widest uppercase bg-amber-400/90 text-black px-1.5 py-0.5 rounded-sm">
                Draft
              </span>
            )}
          </div>
          <p className="text-white/60 text-[10px]">
            {item.wear_count > 0 ? `${item.wear_count}× worn` : 'Never worn'}
          </p>
        </div>
      </button>

      {/* Status badges */}
      <div className="absolute top-2 left-2 flex flex-col gap-1">
        {item.status === 'verified' && (
          <div className="w-5 h-5 rounded-full bg-emerald-500 border border-black/20 flex items-center justify-center">
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
        {item.declutter_status && (
          <div className="w-2.5 h-2.5 rounded-full border border-black/30"
            style={{ backgroundColor: declutterColor }} />
        )}
      </div>

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
          selected ? 'border-primary bg-primary/10' : 'border-transparent'
        }`}>
          {selected && (
            <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
