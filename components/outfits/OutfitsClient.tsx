'use client'

import { useState, useTransition } from 'react'
import { Plus, X, Trash2 } from 'lucide-react'
import { createOutfit, deleteOutfit } from '@/app/actions'
import type { Outfit, WardrobeItem } from '@/lib/types'
import { BottomNav } from '@/components/BottomNav'
import { OCCASIONS } from '@/lib/types'

interface OutfitsClientProps {
  outfits: Outfit[]
  allItems: WardrobeItem[]
}

function OutfitCollage({ items }: { items: WardrobeItem[] }) {
  const shown = items.slice(0, 4)
  if (shown.length === 0) return (
    <div className="w-full h-full flex items-center justify-center text-4xl bg-[#1A1A1A]">👗</div>
  )
  if (shown.length === 1) return (
    <img src={shown[0].image_url} alt="" className="w-full h-full object-cover" />
  )
  return (
    <div className="grid grid-cols-2 w-full h-full gap-0.5">
      {shown.map((item, i) => (
        <div key={i} className="overflow-hidden bg-[#1A1A1A]">
          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
        </div>
      ))}
      {shown.length < 4 && Array.from({ length: 4 - shown.length }).map((_, i) => (
        <div key={`empty-${i}`} className="bg-[#1A1A1A]" />
      ))}
    </div>
  )
}

export function OutfitsClient({ outfits, allItems }: OutfitsClientProps) {
  const [creating, setCreating]     = useState(false)
  const [detail, setDetail]         = useState<Outfit | null>(null)
  const [name, setName]             = useState('')
  const [occasion, setOccasion]     = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()
  const [error, setError]           = useState('')

  function toggleItem(id: string) {
    setSelectedIds(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  function resetCreate() { setName(''); setOccasion(''); setSelectedIds(new Set()); setError('') }

  function handleCreate() {
    if (!name.trim()) return setError('Enter an outfit name')
    if (selectedIds.size === 0) return setError('Select at least one item')
    setError('')
    startTransition(async () => {
      const res = await createOutfit(name.trim(), [...selectedIds], occasion || undefined)
      if (res.error) setError(res.error)
      else { resetCreate(); setCreating(false) }
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => { await deleteOutfit(id); setDetail(null) })
  }

  const detailItems = detail?.outfit_items?.map(oi => oi.wardrobe_items).filter(Boolean) ?? []

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-16">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0A0A0A]/95 backdrop-blur border-b border-[#1F1F1F] px-4 py-3 flex items-center justify-between">
        <h1 className="text-white font-bold text-lg">Outfits</h1>
        <button onClick={() => setCreating(true)}
          className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
          <Plus size={16} className="text-black" strokeWidth={2.5} />
        </button>
      </header>

      {outfits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center px-6">
          <div className="text-5xl mb-4">👗</div>
          <p className="text-white font-semibold mb-1">No outfits yet</p>
          <p className="text-[#444444] text-sm">Tap + to create your first outfit</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 p-4 pb-24">
          {outfits.map(outfit => {
            const items = outfit.outfit_items?.map(oi => oi.wardrobe_items).filter(Boolean) ?? []
            return (
              <button key={outfit.id} onClick={() => setDetail(outfit)}
                className="relative aspect-square rounded-2xl overflow-hidden bg-[#1A1A1A] border border-[#2A2A2A] active:scale-95 transition-transform">
                <OutfitCollage items={items as WardrobeItem[]} />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <p className="text-white text-xs font-semibold truncate">{outfit.name}</p>
                  {outfit.occasion && (
                    <p className="text-[#888888] text-[10px] capitalize">{outfit.occasion}</p>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}

      <BottomNav />

      {/* Create outfit modal */}
      {creating && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end" onClick={() => { setCreating(false); resetCreate() }}>
          <div className="w-full bg-[#0F0F0F] rounded-t-3xl max-h-[92vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-[#2A2A2A] rounded-full mx-auto mt-3 mb-1" />
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#1F1F1F]">
              <h2 className="text-white font-bold text-base">New Outfit</h2>
              <button onClick={() => { setCreating(false); resetCreate() }} className="text-[#555555] hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-5 pb-8">
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Outfit name"
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white placeholder-[#444444] text-sm outline-none focus:border-[#3A3A3A]" />

              {/* Occasion */}
              <div className="flex gap-2 flex-wrap">
                {OCCASIONS.map(o => (
                  <button type="button" key={o.value} onClick={() => setOccasion(occasion === o.value ? '' : o.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      occasion === o.value ? 'bg-white text-black' : 'bg-[#1A1A1A] text-[#666666] border border-[#2A2A2A]'
                    }`}>{o.label}</button>
                ))}
              </div>

              {/* Item picker */}
              <div>
                <p className="text-[#666666] text-xs font-medium mb-2">
                  Select items ({selectedIds.size} selected)
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {allItems.map(item => (
                    <button key={item.id} onClick={() => toggleItem(item.id)}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                        selectedIds.has(item.id) ? 'border-white' : 'border-[#2A2A2A]'
                      }`}>
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      {selectedIds.has(item.id) && (
                        <div className="absolute inset-0 bg-white/15 flex items-end justify-center pb-1">
                          <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                            <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                              <path d="M1 3L3 5L7 1" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-red-400 text-xs">{error}</p>}

              <button onClick={handleCreate} disabled={isPending}
                className="w-full bg-white text-black font-semibold py-3.5 rounded-xl text-sm disabled:opacity-40">
                {isPending ? 'Saving...' : 'Save Outfit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Outfit detail modal */}
      {detail && (
        <div className="fixed inset-0 z-50 bg-black/80" onClick={() => setDetail(null)}>
          <div className="absolute inset-x-0 bottom-0 bg-[#0F0F0F] rounded-t-3xl max-h-[88vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-[#2A2A2A] rounded-full mx-auto mt-3" />
            <button onClick={() => setDetail(null)} className="absolute top-4 right-4 text-[#555555] hover:text-white">
              <X size={20} />
            </button>
            <div className="p-5 space-y-4">
              <div>
                <h2 className="text-white font-bold text-xl">{detail.name}</h2>
                {detail.occasion && <p className="text-[#666666] text-sm capitalize mt-0.5">{detail.occasion}</p>}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {detailItems.map((item) => item && (
                  <div key={(item as WardrobeItem).id} className="aspect-square rounded-xl overflow-hidden border border-[#2A2A2A]">
                    <img src={(item as WardrobeItem).image_url} alt={(item as WardrobeItem).name} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <button onClick={() => handleDelete(detail.id)} disabled={isPending}
                className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20 py-3 rounded-xl text-sm disabled:opacity-40">
                <Trash2 size={15} />
                {isPending ? 'Deleting...' : 'Delete Outfit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
