'use client'

import { useState } from 'react'
import { Trash2, RotateCcw } from 'lucide-react'
import type { WardrobeItem } from '@/lib/types'
import { DECLUTTER_STATUSES } from '@/lib/types'
import { calcWorth, formatWPStatus, wpStatusColor, type WPStatus } from '@/lib/worth'

const WORTH_BADGE: Partial<Record<WPStatus, { icon: string; bg: string }>> = {
  'worth':     { icon: '✅', bg: '#DDF4EA' },
  'great':     { icon: '🔥', bg: '#EFF6FF' },
  'excellent': { icon: '💎', bg: '#F5F3FF' },
}

interface ItemCardProps {
  item: WardrobeItem
  onClick: () => void
  selected?: boolean
  selectable?: boolean
  onVerify?: () => void
  onTrash?: () => void
  onRestoreDraft?: () => void
  onDelete?: () => void
}

type ItemStatus = WardrobeItem['status']

const STATUS_CONFIG: Record<string, { label: string; badge: string }> = {
  draft:     { label: 'Draft',     badge: 'bg-background/90 text-foreground' },
  trashed:   { label: 'Trash',     badge: 'bg-destructive/90 text-white' },
  donated:   { label: 'Donated',   badge: 'bg-purple-500/90 text-white' },
  sell:      { label: 'Sell',      badge: 'bg-orange-500/90 text-white' },
  give_away: { label: 'Give Away', badge: 'bg-blue-500/90 text-white' },
}

export function ItemCard({ item, onClick, selected, selectable, onVerify, onTrash, onRestoreDraft, onDelete }: ItemCardProps) {
  const hasOriginal = !!item.original_image_url && item.original_image_url !== item.image_url
  const [showOriginal, setShowOriginal] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const src = showOriginal && item.original_image_url ? item.original_image_url : item.image_url
  const declutterColor = DECLUTTER_STATUSES.find(d => d.value === item.declutter_status)?.color

  const { wpStatus } = calcWorth({ purchasePrice: item.price, purchaseDate: item.purchase_date, totalUses: item.wear_count })
  const worthBadge = wpStatus ? WORTH_BADGE[wpStatus] : null

  const status = item.status ?? 'draft'
  const isDraft    = status === 'draft'
  const isTrashed  = status === 'trashed'
  const isDeclutter = status === 'donated' || status === 'sell' || status === 'give_away'
  const showBadge  = status !== 'verified'
  const statusCfg  = STATUS_CONFIG[status]
  const dimmed     = isTrashed || isDeclutter

  return (
    <div className={`group relative flex flex-col gap-1.5 ${selected ? 'opacity-90' : ''}`}>
      {/* Image */}
      <div className={`relative aspect-square rounded-2xl overflow-hidden bg-muted transition-all ${
        dimmed ? 'opacity-50' : ''
      } ${selected ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background' : ''}`}>
        <button onClick={onClick} className="absolute inset-0 w-full h-full">
          <img src={src} alt={item.name} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
        </button>

        {/* Status badge */}
        {showBadge && statusCfg && (
          <div className="absolute top-2 left-2">
            <span className={`text-[8px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-full ${statusCfg.badge}`}>
              {statusCfg.label}
            </span>
          </div>
        )}

        {/* Declutter dot */}
        {item.declutter_status && (
          <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: declutterColor }} />
        )}

        {/* Worth badge */}
        {worthBadge && (
          <div className="absolute bottom-2 left-2 w-6 h-6 rounded-full flex items-center justify-center text-[11px] shadow-sm"
            style={{ background: worthBadge.bg }}>
            {worthBadge.icon}
          </div>
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
        <p className={`text-xs font-semibold truncate leading-tight ${dimmed ? 'text-muted-foreground' : 'text-foreground'}`}>{item.name}</p>
        <p className="text-muted-foreground text-[10px] mt-0.5">
          {item.brand ? item.brand : item.wear_count > 0 ? `${item.wear_count}× worn` : 'Never worn'}
        </p>
        {worthBadge && wpStatus && (
          <p className={`text-[10px] font-semibold mt-0.5 ${wpStatusColor(wpStatus)}`}>
            {worthBadge.icon} {formatWPStatus(wpStatus)}
          </p>
        )}
      </button>

      {/* Draft actions: Verify + Trash */}
      {isDraft && (onVerify || onTrash) && (
        <div className="flex gap-1.5 px-0.5">
          {onVerify && (
            <button type="button" onClick={e => { e.stopPropagation(); onVerify() }}
              className="flex-1 bg-foreground text-background text-[10px] font-semibold h-8 rounded-lg">
              Verify
            </button>
          )}
          {onTrash && (
            <button type="button" onClick={e => { e.stopPropagation(); onTrash() }}
              className="flex items-center justify-center w-8 h-8 shrink-0 rounded-lg bg-muted text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
              <Trash2 size={12} />
            </button>
          )}
        </div>
      )}

      {/* Declutter / Trashed actions: Restore + Delete */}
      {(isTrashed || isDeclutter) && (onRestoreDraft || onDelete) && (
        <div className="flex gap-1.5 px-0.5">
          {onRestoreDraft && !confirmDelete && (
            <button type="button" onClick={e => { e.stopPropagation(); onRestoreDraft() }}
              className="flex-1 flex items-center justify-center gap-1 bg-muted text-foreground text-[10px] font-semibold h-8 rounded-lg">
              <RotateCcw size={10} />
              Restore
            </button>
          )}
          {onDelete && !confirmDelete && (
            <button type="button" onClick={e => { e.stopPropagation(); setConfirmDelete(true) }}
              className="flex items-center justify-center w-8 h-8 shrink-0 rounded-lg bg-muted text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
              <Trash2 size={12} />
            </button>
          )}
          {confirmDelete && (
            <>
              <button type="button" onClick={e => { e.stopPropagation(); setConfirmDelete(false) }}
                className="flex-1 bg-muted text-muted-foreground text-[10px] font-semibold h-8 rounded-lg">
                Cancel
              </button>
              <button type="button" onClick={e => { e.stopPropagation(); onDelete?.() }}
                className="flex-1 bg-destructive text-destructive-foreground text-[10px] font-semibold h-8 rounded-lg">
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
