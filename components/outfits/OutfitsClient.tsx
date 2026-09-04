'use client'

import { useState, useTransition } from 'react'
import { Plus, X, Trash2, Shirt, Pencil, Search, Share2 } from 'lucide-react'
import {
  createOutfit, deleteOutfit, useOutfit, updateOutfit, postOutfit,
  createWardrobeCollection, updateWardrobeCollection, deleteWardrobeCollection,
} from '@/app/actions'
import type { Outfit, WardrobeCollection, WardrobeItem } from '@/lib/types'
import { BottomNav } from '@/components/BottomNav'
import { OCCASIONS } from '@/lib/types'
import { UserAvatarMenu } from '@/components/UserAvatarMenu'

interface OutfitsClientProps {
  outfits: Outfit[]
  allItems: WardrobeItem[]
  wardrobeCollections: WardrobeCollection[]
}

function OutfitCollage({ items }: { items: WardrobeItem[] }) {
  const shown = items.slice(0, 4)
  if (shown.length === 0) return (
    <div className="w-full h-full flex items-center justify-center text-4xl bg-muted">👗</div>
  )
  if (shown.length === 1) return (
    <img src={shown[0].image_url} alt="" className="w-full h-full object-cover" />
  )
  return (
    <div className="grid grid-cols-2 w-full h-full gap-0.5">
      {shown.map((item, i) => (
        <div key={i} className="overflow-hidden bg-muted">
          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
        </div>
      ))}
      {shown.length < 4 && Array.from({ length: 4 - shown.length }).map((_, i) => (
        <div key={`empty-${i}`} className="bg-muted" />
      ))}
    </div>
  )
}

function filterItems(items: WardrobeItem[], q: string) {
  if (!q.trim()) return items
  const lq = q.toLowerCase()
  return items.filter(i =>
    [i.name, i.brand, ...(i.tags ?? [])].filter(Boolean).join(' ').toLowerCase().includes(lq)
  )
}

function ItemPicker({
  allItems,
  selectedIds,
  onToggle,
  search,
  onSearchChange,
}: {
  allItems: WardrobeItem[]
  selectedIds: Set<string>
  onToggle: (id: string) => void
  search: string
  onSearchChange: (v: string) => void
}) {
  const filtered = filterItems(allItems, search)
  return (
    <div>
      <p className="text-muted-foreground text-xs font-medium mb-2">
        Items ({selectedIds.size} selected)
      </p>
      <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search by name, brand, tag..."
          className="w-full bg-muted border border-border rounded-xl pl-8 pr-4 py-2.5 text-foreground placeholder:text-muted-foreground text-sm outline-none focus:border-primary transition-colors"
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {filtered.map(item => (
          <button key={item.id} onClick={() => onToggle(item.id)}
            className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedIds.has(item.id) ? 'border-primary' : 'border-border'}`}>
            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
            {selectedIds.has(item.id) && (
              <div className="absolute inset-0 bg-primary/15 flex items-end justify-center pb-1">
                <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                  <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" /></svg>
                </div>
              </div>
            )}
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-3 text-center text-muted-foreground text-xs py-6">No items found</p>
        )}
      </div>
    </div>
  )
}

export function OutfitsClient({ outfits, allItems, wardrobeCollections }: OutfitsClientProps) {
  const [view, setView] = useState<'outfits' | 'wardrobes'>('outfits')

  // ── Outfit state ──────────────────────────────────────────────────────────
  const [creating, setCreating]             = useState(false)
  const [detail, setDetail]                 = useState<Outfit | null>(null)
  const [name, setName]                     = useState('')
  const [occasion, setOccasion]             = useState('')
  const [selectedIds, setSelectedIds]       = useState<Set<string>>(new Set())
  const [isPending, startTransition]        = useTransition()
  const [error, setError]                   = useState('')
  const [confirmUse, setConfirmUse]         = useState(false)
  const [useDate, setUseDate]               = useState(() => new Date().toISOString().split('T')[0])
  const [editing, setEditing]               = useState(false)
  const [editName, setEditName]             = useState('')
  const [editOccasion, setEditOccasion]     = useState('')
  const [editIds, setEditIds]               = useState<Set<string>>(new Set())
  const [createSearch, setCreateSearch]     = useState('')
  const [editSearch, setEditSearch]         = useState('')
  const [posting, setPosting]               = useState(false)
  const [postCaption, setPostCaption]       = useState('')

  // ── Wardrobe collection state ─────────────────────────────────────────────
  const [wcCreating, setWcCreating]         = useState(false)
  const [wcDetail, setWcDetail]             = useState<WardrobeCollection | null>(null)
  const [wcEditing, setWcEditing]           = useState(false)
  const [wcName, setWcName]                 = useState('')
  const [wcSelectedIds, setWcSelectedIds]   = useState<Set<string>>(new Set())
  const [wcCreateSearch, setWcCreateSearch] = useState('')
  const [wcEditName, setWcEditName]         = useState('')
  const [wcEditIds, setWcEditIds]           = useState<Set<string>>(new Set())
  const [wcEditSearch, setWcEditSearch]     = useState('')
  const [wcError, setWcError]               = useState('')

  // ── Outfit handlers ───────────────────────────────────────────────────────
  function toggleItem(id: string) {
    setSelectedIds(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  function toggleEditItem(id: string) {
    setEditIds(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  function openEdit() {
    if (!detail) return
    setEditName(detail.name)
    setEditOccasion(detail.occasion ?? '')
    setEditIds(new Set(detail.outfit_items?.map(oi => (oi.wardrobe_items as WardrobeItem)?.id).filter(Boolean) ?? []))
    setEditSearch('')
    setEditing(true)
  }
  function resetCreate() { setName(''); setOccasion(''); setSelectedIds(new Set()); setError(''); setCreateSearch('') }
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
  function handleUpdate() {
    if (!detail || !editName.trim()) return
    startTransition(async () => {
      const res = await updateOutfit(detail.id, editName.trim(), [...editIds], editOccasion || undefined)
      if (!res.error) setEditing(false)
    })
  }
  function handleDelete(id: string) {
    startTransition(async () => { await deleteOutfit(id); setDetail(null) })
  }
  function handleUse(id: string) {
    startTransition(async () => { await useOutfit(id, useDate); setConfirmUse(false) })
  }
  function handlePost() {
    if (!detail) return
    startTransition(async () => {
      await postOutfit(detail.id, postCaption)
      setPosting(false)
      setPostCaption('')
    })
  }

  // ── Wardrobe collection handlers ──────────────────────────────────────────
  function toggleWcItem(id: string) {
    setWcSelectedIds(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  function toggleWcEditItem(id: string) {
    setWcEditIds(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  function resetWcCreate() { setWcName(''); setWcSelectedIds(new Set()); setWcError(''); setWcCreateSearch('') }
  function handleWcCreate() {
    if (!wcName.trim()) return setWcError('Enter a collection name')
    if (wcSelectedIds.size === 0) return setWcError('Select at least one item')
    setWcError('')
    startTransition(async () => {
      const res = await createWardrobeCollection(wcName.trim(), [...wcSelectedIds])
      if (res.error) setWcError(res.error)
      else { resetWcCreate(); setWcCreating(false) }
    })
  }
  function openWcEdit() {
    if (!wcDetail) return
    setWcEditName(wcDetail.name)
    setWcEditIds(new Set(wcDetail.wardrobe_collection_items?.map(ci => (ci.wardrobe_items as WardrobeItem)?.id).filter(Boolean) ?? []))
    setWcEditSearch('')
    setWcEditing(true)
  }
  function handleWcUpdate() {
    if (!wcDetail || !wcEditName.trim()) return
    startTransition(async () => {
      const res = await updateWardrobeCollection(wcDetail.id, wcEditName.trim(), [...wcEditIds])
      if (!res.error) setWcEditing(false)
    })
  }
  function handleWcDelete(id: string) {
    startTransition(async () => { await deleteWardrobeCollection(id); setWcDetail(null) })
  }

  const detailItems = detail?.outfit_items?.map(oi => oi.wardrobe_items).filter(Boolean) ?? []
  const wcDetailItems = wcDetail?.wardrobe_collection_items?.map(ci => ci.wardrobe_items).filter(Boolean) ?? []

  return (
    <div className="h-dvh overflow-y-auto bg-background pb-16">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('outfits')}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${view === 'outfits' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Outfits
          </button>
          <button
            onClick={() => setView('wardrobes')}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${view === 'wardrobes' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Collections
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => view === 'outfits' ? setCreating(true) : setWcCreating(true)}
            className="w-8 h-8 bg-primary rounded-full flex items-center justify-center hover:opacity-90 transition-opacity">
            <Plus size={16} className="text-primary-foreground" strokeWidth={2.5} />
          </button>
          <UserAvatarMenu />
        </div>
      </header>

      {/* ── Outfits view ─────────────────────────────────────────────────── */}
      {view === 'outfits' && (
        outfits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center px-6">
            <div className="text-5xl mb-4">👗</div>
            <p className="text-foreground font-semibold mb-1">No outfits yet</p>
            <p className="text-muted-foreground text-sm">Tap + to create your first outfit</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 p-4 pb-24">
            {outfits.map(outfit => {
              const items = outfit.outfit_items?.map(oi => oi.wardrobe_items).filter(Boolean) ?? []
              return (
                <button key={outfit.id} onClick={() => setDetail(outfit)}
                  className="relative aspect-square rounded-2xl overflow-hidden bg-muted border border-border active:scale-95 transition-transform">
                  <OutfitCollage items={items as WardrobeItem[]} />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <p className="text-white text-xs font-semibold truncate">{outfit.name}</p>
                    {outfit.occasion && (
                      <p className="text-white/60 text-[10px] capitalize">{outfit.occasion}</p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )
      )}

      {/* ── Collections view ─────────────────────────────────────────────── */}
      {view === 'wardrobes' && (
        wardrobeCollections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center px-6">
            <div className="text-5xl mb-4">🗂️</div>
            <p className="text-foreground font-semibold mb-1">No wardrobe collections yet</p>
            <p className="text-muted-foreground text-sm">Tap + to create your first collection</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 p-4 pb-24">
            {wardrobeCollections.map(col => {
              const items = col.wardrobe_collection_items?.map(ci => ci.wardrobe_items).filter(Boolean) ?? []
              return (
                <button key={col.id} onClick={() => setWcDetail(col)}
                  className="relative aspect-square rounded-2xl overflow-hidden bg-muted border border-border active:scale-95 transition-transform">
                  <OutfitCollage items={items as WardrobeItem[]} />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <p className="text-white text-xs font-semibold truncate">{col.name}</p>
                    <p className="text-white/60 text-[10px]">{items.length} items</p>
                  </div>
                </button>
              )
            })}
          </div>
        )
      )}

      <BottomNav />

      {/* ── Create Outfit modal ───────────────────────────────────────────── */}
      {creating && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end" onClick={() => { setCreating(false); resetCreate() }}>
          <div className="w-full bg-background rounded-t-3xl max-h-[92vh] flex flex-col border-t border-border"
            onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3 mb-1 flex-shrink-0" />
            <div className="flex items-center justify-between px-5 py-3 border-b border-border flex-shrink-0">
              <h2 className="text-foreground font-bold text-base">New Outfit</h2>
              <button onClick={() => { setCreating(false); resetCreate() }} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-5 overflow-y-auto flex-1">
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Outfit name"
                className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground text-base outline-none focus:border-primary transition-colors" />
              <div className="flex gap-2 flex-wrap">
                {OCCASIONS.map(o => (
                  <button type="button" key={o.value} onClick={() => setOccasion(occasion === o.value ? '' : o.value)}
                    className={`px-3 py-2 rounded-full text-xs font-medium transition-all ${
                      occasion === o.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground border border-border'
                    }`}>{o.label}</button>
                ))}
              </div>
              <ItemPicker allItems={allItems} selectedIds={selectedIds} onToggle={toggleItem} search={createSearch} onSearchChange={setCreateSearch} />
              {error && <p className="text-destructive text-xs font-medium">{error}</p>}
            </div>
            <div className="px-5 pb-8 pt-3 border-t border-border flex-shrink-0">
              <button onClick={handleCreate} disabled={isPending}
                className="w-full bg-primary text-primary-foreground font-semibold py-3.5 rounded-xl text-sm disabled:opacity-40 hover:opacity-90 transition-opacity">
                {isPending ? 'Saving...' : 'Save Outfit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create Wardrobe Collection modal ──────────────────────────────── */}
      {wcCreating && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end" onClick={() => { setWcCreating(false); resetWcCreate() }}>
          <div className="w-full bg-background rounded-t-3xl max-h-[92vh] flex flex-col border-t border-border"
            onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3 mb-1 flex-shrink-0" />
            <div className="flex items-center justify-between px-5 py-3 border-b border-border flex-shrink-0">
              <h2 className="text-foreground font-bold text-base">New Wardrobe</h2>
              <button onClick={() => { setWcCreating(false); resetWcCreate() }} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-5 overflow-y-auto flex-1">
              <input value={wcName} onChange={e => setWcName(e.target.value)} placeholder="Collection name"
                className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground text-base outline-none focus:border-primary transition-colors" />
              <ItemPicker allItems={allItems} selectedIds={wcSelectedIds} onToggle={toggleWcItem} search={wcCreateSearch} onSearchChange={setWcCreateSearch} />
              {wcError && <p className="text-destructive text-xs font-medium">{wcError}</p>}
            </div>
            <div className="px-5 pb-8 pt-3 border-t border-border flex-shrink-0">
              <button onClick={handleWcCreate} disabled={isPending}
                className="w-full bg-primary text-primary-foreground font-semibold py-3.5 rounded-xl text-sm disabled:opacity-40 hover:opacity-90 transition-opacity">
                {isPending ? 'Saving...' : 'Save Collection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Outfit detail modal ───────────────────────────────────────────── */}
      {detail && (
        <div className="fixed inset-0 z-50 bg-black/70" onClick={() => { setDetail(null); setConfirmUse(false) }}>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-background rounded-t-3xl max-h-[88vh] overflow-y-auto border-t border-border"
            onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3" />
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button onClick={openEdit} className="text-muted-foreground hover:text-foreground transition-colors">
                <Pencil size={17} />
              </button>
              <button onClick={() => { setDetail(null); setConfirmUse(false) }} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <h2 className="text-foreground font-bold text-xl">{detail.name}</h2>
                {detail.occasion && <p className="text-muted-foreground text-sm capitalize mt-0.5">{detail.occasion}</p>}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {detailItems.map((item) => item && (
                  <div key={(item as WardrobeItem).id} className="aspect-square rounded-xl overflow-hidden border border-border">
                    <img src={(item as WardrobeItem).image_url} alt={(item as WardrobeItem).name} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <button onClick={() => setPosting(true)} disabled={isPending}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3.5 rounded-xl text-sm disabled:opacity-40 hover:opacity-90 transition-opacity">
                <Share2 size={15} />
                Post to Activity
              </button>
              {!confirmUse ? (
                <button onClick={() => setConfirmUse(true)} disabled={isPending}
                  className="w-full flex items-center justify-center gap-2 bg-foreground text-background font-semibold py-3.5 rounded-xl text-sm disabled:opacity-40">
                  <Shirt size={15} />
                  Use This Outfit
                </button>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Tanggal pakai</label>
                    <input type="date" value={useDate} onChange={e => setUseDate(e.target.value)}
                      className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-foreground/20" />
                  </div>
                  <p className="text-sm text-center text-muted-foreground">
                    +1 worn untuk semua {detailItems.length} item. Lanjut?
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => setConfirmUse(false)} disabled={isPending}
                      className="flex-1 bg-muted text-muted-foreground font-semibold py-3 rounded-xl text-sm">Batal</button>
                    <button onClick={() => handleUse(detail.id)} disabled={isPending}
                      className="flex-1 bg-foreground text-background font-semibold py-3 rounded-xl text-sm disabled:opacity-40">
                      {isPending ? 'Saving...' : 'Ya, Pakai'}
                    </button>
                  </div>
                </div>
              )}
              <button onClick={() => handleDelete(detail.id)} disabled={isPending}
                className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-500 border border-red-500/20 py-3 rounded-xl text-sm disabled:opacity-40">
                <Trash2 size={15} />
                {isPending ? 'Deleting...' : 'Delete Outfit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Wardrobe Collection detail modal ──────────────────────────────── */}
      {wcDetail && !wcEditing && (
        <div className="fixed inset-0 z-50 bg-black/70" onClick={() => setWcDetail(null)}>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-background rounded-t-3xl max-h-[88vh] overflow-y-auto border-t border-border"
            onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3" />
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button onClick={openWcEdit} className="text-muted-foreground hover:text-foreground transition-colors">
                <Pencil size={17} />
              </button>
              <button onClick={() => setWcDetail(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Wardrobe</p>
                <h2 className="text-foreground font-bold text-xl">{wcDetail.name}</h2>
                <p className="text-muted-foreground text-sm mt-0.5">{wcDetailItems.length} items</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {wcDetailItems.map((item) => item && (
                  <div key={(item as WardrobeItem).id} className="aspect-square rounded-xl overflow-hidden border border-border">
                    <img src={(item as WardrobeItem).image_url} alt={(item as WardrobeItem).name} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <button onClick={() => handleWcDelete(wcDetail.id)} disabled={isPending}
                className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-500 border border-red-500/20 py-3 rounded-xl text-sm disabled:opacity-40">
                <Trash2 size={15} />
                {isPending ? 'Deleting...' : 'Delete Collection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Post Outfit sheet ─────────────────────────────────────────────── */}
      {posting && detail && (
        <div className="fixed inset-0 z-[60] bg-black/70 flex items-end" onClick={() => { setPosting(false); setPostCaption('') }}>
          <div className="w-full bg-background rounded-t-3xl max-h-[80vh] flex flex-col border-t border-border"
            onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3 mb-1 flex-shrink-0" />
            <div className="flex items-center justify-between px-5 py-3 border-b border-border flex-shrink-0">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Outfit</p>
                <h2 className="text-foreground font-bold text-base leading-tight">{detail.name}</h2>
              </div>
              <button onClick={() => { setPosting(false); setPostCaption('') }} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-5 space-y-4">
              <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {detailItems.map((item, i) => item && (
                  <div key={i} className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border border-border">
                    <img src={(item as WardrobeItem).image_url} alt={(item as WardrobeItem).name} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <textarea value={postCaption} onChange={e => setPostCaption(e.target.value)}
                placeholder="Add a caption... (optional)" rows={3}
                className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground text-sm outline-none focus:border-primary transition-colors resize-none" />
            </div>
            <div className="px-5 pb-8 pt-3 border-t border-border flex-shrink-0">
              <button onClick={handlePost} disabled={isPending}
                className="w-full bg-primary text-primary-foreground font-semibold py-3.5 rounded-xl text-sm disabled:opacity-40 hover:opacity-90 transition-opacity">
                {isPending ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Outfit modal ─────────────────────────────────────────────── */}
      {editing && detail && (
        <div className="fixed inset-0 z-[60] bg-black/70 flex items-end" onClick={() => setEditing(false)}>
          <div className="w-full bg-background rounded-t-3xl max-h-[92vh] flex flex-col border-t border-border"
            onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3 mb-1 flex-shrink-0" />
            <div className="flex items-center justify-between px-5 py-3 border-b border-border flex-shrink-0">
              <h2 className="text-foreground font-bold text-base">Edit Outfit</h2>
              <button onClick={() => setEditing(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-5 overflow-y-auto flex-1">
              <input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Outfit name"
                className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground text-base outline-none focus:border-primary transition-colors" />
              <div className="flex gap-2 flex-wrap">
                {OCCASIONS.map(o => (
                  <button type="button" key={o.value} onClick={() => setEditOccasion(editOccasion === o.value ? '' : o.value)}
                    className={`px-3 py-2 rounded-full text-xs font-medium transition-all ${
                      editOccasion === o.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground border border-border'
                    }`}>{o.label}</button>
                ))}
              </div>
              <ItemPicker allItems={allItems} selectedIds={editIds} onToggle={toggleEditItem} search={editSearch} onSearchChange={setEditSearch} />
            </div>
            <div className="px-5 pb-8 pt-3 border-t border-border flex-shrink-0">
              <button onClick={handleUpdate} disabled={isPending}
                className="w-full bg-primary text-primary-foreground font-semibold py-3.5 rounded-xl text-sm disabled:opacity-40 hover:opacity-90 transition-opacity">
                {isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Wardrobe Collection modal ────────────────────────────────── */}
      {wcEditing && wcDetail && (
        <div className="fixed inset-0 z-[60] bg-black/70 flex items-end" onClick={() => setWcEditing(false)}>
          <div className="w-full bg-background rounded-t-3xl max-h-[92vh] flex flex-col border-t border-border"
            onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3 mb-1 flex-shrink-0" />
            <div className="flex items-center justify-between px-5 py-3 border-b border-border flex-shrink-0">
              <h2 className="text-foreground font-bold text-base">Edit Wardrobe</h2>
              <button onClick={() => setWcEditing(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-5 overflow-y-auto flex-1">
              <input value={wcEditName} onChange={e => setWcEditName(e.target.value)} placeholder="Collection name"
                className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground text-base outline-none focus:border-primary transition-colors" />
              <ItemPicker allItems={allItems} selectedIds={wcEditIds} onToggle={toggleWcEditItem} search={wcEditSearch} onSearchChange={setWcEditSearch} />
            </div>
            <div className="px-5 pb-8 pt-3 border-t border-border flex-shrink-0">
              <button onClick={handleWcUpdate} disabled={isPending}
                className="w-full bg-primary text-primary-foreground font-semibold py-3.5 rounded-xl text-sm disabled:opacity-40 hover:opacity-90 transition-opacity">
                {isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
