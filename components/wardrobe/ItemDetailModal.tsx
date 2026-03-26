'use client'

import { useTransition, useState } from 'react'
import { X, Trash2, ShirtIcon, Tag, DollarSign } from 'lucide-react'
import { deleteItem, wearItem, flagDeclutter } from '@/app/actions'
import { COLORS, SEASONS, DECLUTTER_STATUSES, getCategoryLabel, type WardrobeItem } from '@/lib/types'

interface ItemDetailModalProps {
  item: WardrobeItem | null
  onClose: () => void
}

export function ItemDetailModal({ item, onClose }: ItemDetailModalProps) {
  const [isPending, startTransition] = useTransition()
  const [tab, setTab] = useState<'info' | 'declutter'>('info')

  if (!item) return null

  const colorInfo  = COLORS.find(c => c.value === item.color)
  const catLabel   = getCategoryLabel(item.category, item.subcategory, item.item_type)
  const costPerWear = item.price && item.wear_count > 0 ? (item.price / item.wear_count).toFixed(2) : null

  function handleDelete() {
    startTransition(async () => { await deleteItem(item!.id); onClose() })
  }
  function handleWear() {
    startTransition(async () => { await wearItem(item!.id); onClose() })
  }
  function handleDeclutter(status: 'donate' | 'sell' | 'giveaway' | null) {
    startTransition(async () => { await flagDeclutter(item!.id, status); onClose() })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80" onClick={onClose}>
      <div className="absolute inset-x-0 bottom-0 bg-[#0F0F0F] rounded-t-3xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-[#2A2A2A] rounded-full mx-auto mt-3" />
        <button onClick={onClose} className="absolute top-4 right-4 text-[#555555] hover:text-white z-10">
          <X size={20} />
        </button>

        {/* Image */}
        <div className="mx-4 mt-4 aspect-square rounded-2xl overflow-hidden bg-[#1A1A1A]">
          <img src={item.image_url} alt={item.name} className="w-full h-full object-contain" />
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-white font-bold text-xl">{item.name}</h2>
              {item.brand && <p className="text-[#666666] text-sm mt-0.5">{item.brand}</p>}
            </div>
            {item.price && (
              <div className="text-right">
                <p className="text-white font-semibold">${item.price}</p>
                {costPerWear && <p className="text-[#666666] text-xs">${costPerWear}/wear</p>}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-[#1A1A1A] rounded-xl p-1">
            {(['info', 'declutter'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-all ${
                  tab === t ? 'bg-[#2A2A2A] text-white' : 'text-[#555555]'
                }`}>{t}</button>
            ))}
          </div>

          {tab === 'info' && (
            <div className="space-y-3">
              {/* Category */}
              <div className="flex items-center gap-2">
                <ShirtIcon size={14} className="text-[#555555]" />
                <span className="text-[#888888] text-sm">{catLabel}</span>
              </div>

              {/* Color */}
              {colorInfo && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border border-[#3A3A3A]" style={{ backgroundColor: colorInfo.hex }} />
                  <span className="text-[#888888] text-sm">{colorInfo.label}</span>
                </div>
              )}

              {/* Seasons */}
              {item.seasons && item.seasons.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {item.seasons.map(s => {
                    const def = SEASONS.find(x => x.value === s)
                    return (
                      <span key={s} className="flex items-center gap-1 bg-[#1A1A1A] border border-[#2A2A2A] text-[#888888] text-xs px-2 py-1 rounded-full">
                        {def?.icon} {def?.label ?? s}
                      </span>
                    )
                  })}
                </div>
              )}

              {/* Occasions */}
              {item.occasions && item.occasions.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {item.occasions.map(o => (
                    <span key={o} className="bg-[#1A1A1A] border border-[#2A2A2A] text-[#888888] text-xs px-2 py-1 rounded-full capitalize">{o}</span>
                  ))}
                </div>
              )}

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag size={12} className="text-[#555555]" />
                  {item.tags.map(t => (
                    <span key={t} className="text-[#666666] text-xs">#{t}</span>
                  ))}
                </div>
              )}

              {/* Wear stats */}
              <div className="flex items-center justify-between bg-[#1A1A1A] rounded-xl p-3 border border-[#2A2A2A]">
                <div>
                  <p className="text-white text-sm font-semibold">{item.wear_count} wears</p>
                  <p className="text-[#555555] text-xs">
                    {item.last_worn ? `Last worn ${new Date(item.last_worn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'Never worn'}
                  </p>
                </div>
                <button onClick={handleWear} disabled={isPending}
                  className="bg-white text-black text-xs font-semibold px-4 py-2 rounded-xl disabled:opacity-40">
                  + Log Wear
                </button>
              </div>

              <p className="text-[#333333] text-xs">
                Added {new Date(item.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>

              <button onClick={handleDelete} disabled={isPending}
                className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20 font-medium py-3 rounded-xl text-sm disabled:opacity-40">
                <Trash2 size={15} />
                {isPending ? 'Deleting...' : 'Delete Item'}
              </button>
            </div>
          )}

          {tab === 'declutter' && (
            <div className="space-y-3">
              <p className="text-[#666666] text-sm">Flag this item for decluttering:</p>
              {DECLUTTER_STATUSES.map(d => (
                <button key={d.value} onClick={() => handleDeclutter(d.value)} disabled={isPending}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border text-sm font-medium transition-all disabled:opacity-40 ${
                    item.declutter_status === d.value
                      ? 'border-white/30 bg-white/10 text-white'
                      : 'border-[#2A2A2A] bg-[#1A1A1A] text-[#888888] hover:border-[#3A3A3A]'
                  }`}>
                  <span>{d.label}</span>
                  {item.declutter_status === d.value && <span className="text-xs text-[#666666]">Active ✓</span>}
                </button>
              ))}
              {item.declutter_status && (
                <button onClick={() => handleDeclutter(null)} disabled={isPending}
                  className="w-full text-[#555555] text-xs py-2 disabled:opacity-40 hover:text-white transition-colors">
                  Clear flag
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
