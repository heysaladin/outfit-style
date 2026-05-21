'use client'

import { useTransition, useState } from 'react'
import { X, Trash2, ShirtIcon, Tag, Package2, Pencil } from 'lucide-react'
import { deleteItem, wearItem, flagDeclutter, assignItemToWardrobe, setItemStatus } from '@/app/actions'
import { COLORS, SEASONS, DECLUTTER_STATUSES, getCategoryLabel, type WardrobeItem, type Wardrobe } from '@/lib/types'
import { EditClothModal } from './EditClothModal'

interface ItemDetailModalProps {
  item: WardrobeItem | null
  wardrobes: Wardrobe[]
  onClose: () => void
}

export function ItemDetailModal({ item, wardrobes, onClose }: ItemDetailModalProps) {
  const [isPending, startTransition] = useTransition()
  const [tab, setTab] = useState<'info' | 'storage' | 'declutter'>('info')
  const [editOpen, setEditOpen] = useState(false)

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
  function handleAssign(wardrobeId: string | null) {
    startTransition(async () => { await assignItemToWardrobe(item!.id, wardrobeId); onClose() })
  }
  function handleSetStatus(status: 'draft' | 'verified') {
    startTransition(async () => {
      const res = await setItemStatus(item!.id, status)
      if (res.error) { console.error('setItemStatus failed:', res.error); return }
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70" onClick={onClose}>
      <div className="absolute inset-x-0 bottom-0 bg-background rounded-t-3xl max-h-[90vh] overflow-y-auto border-t border-border"
        onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3" />
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          <button onClick={() => setEditOpen(true)} className="text-muted-foreground hover:text-foreground transition-colors">
            <Pencil size={18} />
          </button>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Image */}
        <div className="mx-4 mt-4 aspect-square rounded-2xl overflow-hidden bg-muted">
          <img src={item.image_url} alt={item.name} className="w-full h-full object-contain" />
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-foreground font-bold text-xl">{item.name}</h2>
              {item.brand && <p className="text-muted-foreground text-sm mt-0.5">{item.brand}</p>}
            </div>
            {item.price && (
              <div className="text-right">
                <p className="text-foreground font-semibold">${item.price}</p>
                {costPerWear && <p className="text-muted-foreground text-xs">${costPerWear}/wear</p>}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-muted rounded-xl p-1">
            {(['info', 'storage', 'declutter'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-all ${
                  tab === t ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
                }`}>{t}</button>
            ))}
          </div>

          {tab === 'info' && (
            <div className="space-y-3">
              {/* Category */}
              <div className="flex items-center gap-2">
                <ShirtIcon size={14} className="text-muted-foreground" />
                <span className="text-muted-foreground text-sm">{catLabel}</span>
              </div>

              {/* Color */}
              {colorInfo && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: colorInfo.hex }} />
                  <span className="text-muted-foreground text-sm">{colorInfo.label}</span>
                </div>
              )}

              {/* Seasons */}
              {item.seasons && item.seasons.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {item.seasons.map(s => {
                    const def = SEASONS.find(x => x.value === s)
                    return (
                      <span key={s} className="flex items-center gap-1 bg-muted border border-border text-muted-foreground text-xs px-2 py-1 rounded-full">
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
                    <span key={o} className="bg-muted border border-border text-muted-foreground text-xs px-2 py-1 rounded-full capitalize">{o}</span>
                  ))}
                </div>
              )}

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag size={12} className="text-muted-foreground" />
                  {item.tags.map(t => (
                    <span key={t} className="text-muted-foreground text-xs">#{t}</span>
                  ))}
                </div>
              )}

              {/* Wear stats */}
              <div className="flex items-center justify-between bg-muted rounded-xl p-3 border border-border">
                <div>
                  <p className="text-foreground text-sm font-semibold">{item.wear_count} wears</p>
                  <p className="text-muted-foreground text-xs">
                    {item.last_worn ? `Last worn ${new Date(item.last_worn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'Never worn'}
                  </p>
                </div>
                <button onClick={handleWear} disabled={isPending}
                  className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-2 rounded-xl disabled:opacity-40 hover:opacity-90 transition-opacity">
                  + Log Wear
                </button>
              </div>

              <p className="text-muted-foreground/50 text-xs">
                Added {new Date(item.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>

              {/* Verify / Draft toggle */}
              {item.status === 'verified' ? (
                <button onClick={() => handleSetStatus('draft')} disabled={isPending}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-medium py-3 rounded-xl text-sm disabled:opacity-40">
                  <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
                    <path d="M1 5.5L5 9.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Verified — Revert to Draft
                </button>
              ) : (
                <button onClick={() => handleSetStatus('verified')} disabled={isPending}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-white font-semibold py-3 rounded-xl text-sm disabled:opacity-40 hover:bg-emerald-600 transition-colors">
                  <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
                    <path d="M1 5.5L5 9.5L13 1" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {isPending ? 'Saving...' : 'Set as Verified'}
                </button>
              )}

              <button onClick={handleDelete} disabled={isPending}
                className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-500 border border-red-500/20 font-medium py-3 rounded-xl text-sm disabled:opacity-40">
                <Trash2 size={15} />
                {isPending ? 'Deleting...' : 'Delete Item'}
              </button>
            </div>
          )}

          {tab === 'storage' && (
            <div className="space-y-3">
              <p className="text-muted-foreground text-sm">Assign this item to a wardrobe:</p>
              {wardrobes.length === 0 ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <Package2 size={28} className="text-border mb-2" />
                  <p className="text-muted-foreground text-sm">No wardrobes yet</p>
                  <p className="text-muted-foreground/60 text-xs mt-0.5">Create one in the Wardrobes page</p>
                </div>
              ) : (
                <>
                  {wardrobes.map(w => (
                    <button key={w.id} onClick={() => handleAssign(w.id)} disabled={isPending}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-sm font-medium transition-all disabled:opacity-40 ${
                        item.wardrobe_id === w.id
                          ? 'border-primary/40 bg-primary/10 text-foreground'
                          : 'border-border bg-muted text-muted-foreground hover:border-primary/40'
                      }`}>
                      <span className="text-xs font-mono text-muted-foreground bg-background px-1.5 py-0.5 rounded border border-border">{w.code}</span>
                      <span className="flex-1 text-left">{w.name}</span>
                      {item.wardrobe_id === w.id && <span className="text-xs text-primary">Current ✓</span>}
                    </button>
                  ))}
                  {item.wardrobe_id && (
                    <button onClick={() => handleAssign(null)} disabled={isPending}
                      className="w-full text-muted-foreground text-xs py-2 disabled:opacity-40 hover:text-foreground transition-colors">
                      Remove from wardrobe
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {tab === 'declutter' && (
            <div className="space-y-3">
              <p className="text-muted-foreground text-sm">Flag this item for decluttering:</p>
              {DECLUTTER_STATUSES.map(d => (
                <button key={d.value} onClick={() => handleDeclutter(d.value)} disabled={isPending}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border text-sm font-medium transition-all disabled:opacity-40 ${
                    item.declutter_status === d.value
                      ? 'border-primary/40 bg-primary/10 text-foreground'
                      : 'border-border bg-muted text-muted-foreground hover:border-primary/40'
                  }`}>
                  <span>{d.label}</span>
                  {item.declutter_status === d.value && <span className="text-xs text-primary">Active ✓</span>}
                </button>
              ))}
              {item.declutter_status && (
                <button onClick={() => handleDeclutter(null)} disabled={isPending}
                  className="w-full text-muted-foreground text-xs py-2 disabled:opacity-40 hover:text-foreground transition-colors">
                  Clear flag
                </button>
              )}
            </div>
          )}

        </div>
      </div>
      {editOpen && (
        <EditClothModal item={item} onClose={() => { setEditOpen(false); onClose() }} />
      )}
    </div>
  )
}
