'use client'

import { useTransition, useState } from 'react'
import { X, Trash2, ShirtIcon, Tag, Package2, Pencil, CheckCircle2 } from 'lucide-react'
import { deleteItem, wearItem, flagDeclutter, assignItemToWardrobe, setItemStatus } from '@/app/actions'
import { COLORS, SEASONS, DECLUTTER_STATUSES, getCategoryLabel, type WardrobeItem, type Wardrobe } from '@/lib/types'
import { EditClothModal } from './EditClothModal'
import { WorthCard } from '@/components/worth/WorthCard'

interface ItemDetailModalProps {
  item: WardrobeItem | null
  wardrobes: Wardrobe[]
  user?: { id: string } | null
  onClose: () => void
}

export function ItemDetailModal({ item, wardrobes, user, onClose }: ItemDetailModalProps) {
  const [isPending, startTransition] = useTransition()
  const [tab, setTab] = useState<'info' | 'storage' | 'declutter'>('info')
  const [editOpen, setEditOpen] = useState(false)

  if (!item) return null

  const colorInfo   = COLORS.find(c => c.value === item.color)
  const catLabel    = getCategoryLabel(item.category, item.subcategory, item.item_type)
  const costPerWear = item.price && item.wear_count > 0 ? (item.price / item.wear_count).toFixed(2) : null
  const isDraft     = !item.status || item.status === 'draft'

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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="absolute inset-x-0 bottom-0 bg-background rounded-t-2xl max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="sticky top-0 z-10 bg-background pt-3 pb-2 px-4">
          <div className="w-8 h-1 bg-border rounded-full mx-auto mb-3" />

          {/* Top bar: edit + close */}
          <div className="flex items-center justify-between">
            {user ? (
              <button
                onClick={() => setEditOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-accent text-foreground text-xs font-medium transition-colors"
              >
                <Pencil size={12} />
                Edit
              </button>
            ) : <div />}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-muted hover:bg-accent flex items-center justify-center transition-colors"
            >
              <X size={16} className="text-foreground" />
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="mx-4 mt-1 aspect-square rounded-xl overflow-hidden bg-muted">
          <img src={item.image_url} alt={item.name} className="w-full h-full object-contain" />
        </div>

        {/* Name / meta */}
        <div className="px-4 pt-4 pb-2 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-foreground font-bold text-lg leading-tight truncate">{item.name}</h2>
              {!isDraft && <CheckCircle2 size={15} className="text-primary shrink-0" />}
            </div>
            {item.brand && <p className="text-muted-foreground text-xs mt-0.5">{item.brand}</p>}
            {isDraft && (
              <span className="inline-block mt-1 text-[9px] font-semibold tracking-widest uppercase text-muted-foreground/50">
                Draft
              </span>
            )}
          </div>
          {item.price && (
            <div className="text-right shrink-0">
              <p className="text-foreground font-semibold text-sm">
                {item.price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
              </p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="px-4 pb-1">
          <div className="flex gap-0 border-b border-border">
            {(['info', 'storage', 'declutter'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2.5 text-xs font-medium capitalize transition-all border-b-2 -mb-px ${
                  tab === t
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}>{t}</button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="px-4 py-4 space-y-3 pb-10">

          {tab === 'info' && (
            <div className="space-y-3">
              {/* Category */}
              <div className="flex items-center gap-2">
                <ShirtIcon size={13} className="text-muted-foreground shrink-0" />
                <span className="text-muted-foreground text-xs">{catLabel}</span>
              </div>

              {/* Color */}
              {colorInfo && (
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full border border-border shrink-0" style={{ backgroundColor: colorInfo.hex }} />
                  <span className="text-muted-foreground text-xs">{colorInfo.label}</span>
                </div>
              )}

              {/* Seasons */}
              {item.seasons && item.seasons.length > 0 && (
                <div className="flex gap-1.5 flex-wrap">
                  {item.seasons.map(s => {
                    const def = SEASONS.find(x => x.value === s)
                    return (
                      <span key={s} className="flex items-center gap-1 bg-muted text-muted-foreground text-[10px] px-2 py-1 rounded-lg">
                        {def?.icon} {def?.label ?? s}
                      </span>
                    )
                  })}
                </div>
              )}

              {/* Occasions */}
              {item.occasions && item.occasions.length > 0 && (
                <div className="flex gap-1.5 flex-wrap">
                  {item.occasions.map(o => (
                    <span key={o} className="bg-muted text-muted-foreground text-[10px] px-2 py-1 rounded-lg capitalize">{o}</span>
                  ))}
                </div>
              )}

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Tag size={11} className="text-muted-foreground" />
                  {item.tags.map(t => (
                    <span key={t} className="text-muted-foreground text-[10px]">#{t}</span>
                  ))}
                </div>
              )}

              {/* Harga & Tanggal Beli */}
              {(item.price || item.purchase_date) && (
                <div className="bg-muted rounded-xl p-3.5 space-y-2">
                  <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">Pembelian</p>
                  {item.price && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs">Harga Beli</span>
                      <span className="text-foreground text-xs font-semibold">
                        {item.price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  )}
                  {item.purchase_date && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs">Tanggal Beli</span>
                      <span className="text-foreground text-xs">
                        {new Date(item.purchase_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Worth */}
              <WorthCard
                purchasePrice={item.price}
                purchaseDate={item.purchase_date}
                totalUses={item.wear_count}
              />

              {/* Wear stats */}
              <div className="flex items-center justify-between bg-muted rounded-xl p-3.5">
                <div>
                  <p className="text-foreground text-sm font-semibold">{item.wear_count} wears</p>
                  <p className="text-muted-foreground text-[10px] mt-0.5">
                    {item.last_worn
                      ? `Last ${new Date(item.last_worn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                      : 'Never worn'}
                  </p>
                </div>
                {user && (
                  <button onClick={handleWear} disabled={isPending}
                    className="bg-foreground text-background text-xs font-semibold px-4 py-2 rounded-lg disabled:opacity-40 hover:opacity-80 transition-opacity">
                    + Wear
                  </button>
                )}
              </div>

              <p className="text-muted-foreground/40 text-[10px]">
                Added {new Date(item.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>

              {user && (
                <>
                  {isDraft ? (
                    <button onClick={() => handleSetStatus('verified')} disabled={isPending}
                      className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3 rounded-xl text-sm disabled:opacity-40 hover:opacity-90 transition-opacity">
                      <CheckCircle2 size={15} />
                      {isPending ? 'Saving…' : 'Set as Verified'}
                    </button>
                  ) : (
                    <button onClick={() => handleSetStatus('draft')} disabled={isPending}
                      className="w-full flex items-center justify-center gap-2 bg-muted text-muted-foreground font-medium py-3 rounded-xl text-sm disabled:opacity-40 hover:text-foreground transition-colors">
                      <CheckCircle2 size={15} className="text-primary" />
                      Verified — Revert to Draft
                    </button>
                  )}

                  <button onClick={handleDelete} disabled={isPending}
                    className="w-full flex items-center justify-center gap-2 text-destructive font-medium py-3 rounded-xl text-sm border border-destructive/20 bg-destructive/5 disabled:opacity-40 hover:bg-destructive/10 transition-colors">
                    <Trash2 size={14} />
                    {isPending ? 'Deleting…' : 'Delete'}
                  </button>
                </>
              )}
            </div>
          )}

          {tab === 'storage' && (
            <div className="space-y-2">
              {!user ? (
                <p className="text-muted-foreground text-sm text-center py-8">Sign in to manage storage</p>
              ) : wardrobes.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <Package2 size={24} className="text-border mb-2" />
                  <p className="text-muted-foreground text-sm">No wardrobes yet</p>
                  <p className="text-muted-foreground/60 text-xs mt-0.5">Create one in Storage</p>
                </div>
              ) : (
                <>
                  <p className="text-muted-foreground text-xs mb-3">Assign to a wardrobe:</p>
                  {wardrobes.map(w => (
                    <button key={w.id} onClick={() => handleAssign(w.id)} disabled={isPending}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all disabled:opacity-40 ${
                        item.wardrobe_id === w.id
                          ? 'bg-foreground text-background'
                          : 'bg-muted text-muted-foreground hover:text-foreground'
                      }`}>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        item.wardrobe_id === w.id ? 'bg-background/20' : 'bg-background text-foreground border border-border'
                      }`}>{w.code}</span>
                      <span className="flex-1 text-left">{w.name}</span>
                      {item.wardrobe_id === w.id && <span className="text-[10px] opacity-60">Current</span>}
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
            <div className="space-y-2">
              {!user ? (
                <p className="text-muted-foreground text-sm text-center py-8">Sign in to manage declutter</p>
              ) : (
                <>
                  <p className="text-muted-foreground text-xs mb-3">Flag for decluttering:</p>
                  {DECLUTTER_STATUSES.map(d => (
                    <button key={d.value} onClick={() => handleDeclutter(d.value)} disabled={isPending}
                      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium transition-all disabled:opacity-40 ${
                        item.declutter_status === d.value
                          ? 'bg-foreground text-background'
                          : 'bg-muted text-muted-foreground hover:text-foreground'
                      }`}>
                      <span>{d.label}</span>
                      {item.declutter_status === d.value && <span className="text-[10px] opacity-60">Active</span>}
                    </button>
                  ))}
                  {item.declutter_status && (
                    <button onClick={() => handleDeclutter(null)} disabled={isPending}
                      className="w-full text-muted-foreground text-xs py-2 disabled:opacity-40 hover:text-foreground transition-colors">
                      Clear flag
                    </button>
                  )}
                </>
              )}
            </div>
          )}

        </div>
      </div>

      {user && editOpen && (
        <EditClothModal item={item} onClose={() => { setEditOpen(false); onClose() }} />
      )}
    </div>
  )
}
