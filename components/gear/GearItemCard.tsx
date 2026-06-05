'use client'

import type { GearItem } from '@/lib/types'
import { HOBBIES, DECLUTTER_STATUSES } from '@/lib/types'

interface GearItemCardProps {
  item: GearItem
  onClick: () => void
}

export function GearItemCard({ item, onClick }: GearItemCardProps) {
  const hobbyDef     = HOBBIES.find(h => h.value === item.hobby)
  const isDraft      = !item.status || item.status === 'draft'
  const declutterColor = DECLUTTER_STATUSES.find(d => d.value === item.declutter_status)?.color

  return (
    <div className="group relative flex flex-col gap-2">
      <div className="relative aspect-square rounded-xl overflow-hidden bg-white">
        <button onClick={onClick} className="absolute inset-0 w-full h-full">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl bg-muted">
              {hobbyDef?.icon ?? '📦'}
            </div>
          )}
        </button>

        {/* Top indicators */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {item.status === 'verified' && (
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-sm">
              <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                <path d="M1 3.5L3 5.5L8 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
          {item.declutter_status && (
            <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: declutterColor }} />
          )}
        </div>

        {/* Hobby badge */}
        <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm text-[10px] px-1.5 py-0.5 rounded-md border border-border/50">
          {hobbyDef?.icon}
        </div>
      </div>

      <button onClick={onClick} className="text-left px-0.5">
        <div className="flex items-baseline gap-1.5">
          <p className="text-foreground text-xs font-semibold truncate leading-tight">{item.name}</p>
          {isDraft && (
            <span className="shrink-0 text-[8px] font-medium tracking-wider uppercase text-muted-foreground/60">
              draft
            </span>
          )}
        </div>
        <p className="text-muted-foreground text-[10px] mt-0.5">
          {item.brand ?? hobbyDef?.label ?? item.hobby}
        </p>
      </button>
    </div>
  )
}
