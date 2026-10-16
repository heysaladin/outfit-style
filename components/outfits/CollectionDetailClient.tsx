'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ChevronLeft, Pencil, X, Trash2, Shirt, Share2, CheckCircle2, Plus, CalendarDays, Copy, Check } from 'lucide-react'
import {
  DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, useSortable, horizontalListSortingStrategy, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  createOutfit, updateOutfit, deleteOutfit, useOutfit, postOutfit, reorderOutfitItems,
  updateWardrobeCollection, deleteWardrobeCollection, useCollectionItems, reorderCollectionItems,
} from '@/app/actions'
import type { Outfit, OutfitLog, WardrobeCollection, WardrobeItem } from '@/lib/types'
import { OCCASIONS } from '@/lib/types'
import { ItemPicker, OutfitCard, SortableDetailItem, collectionWorthItProgress, collectionItemsToJSON } from './OutfitsClient'
import { formatDateLabel } from '@/lib/date'

interface Props {
  collection: WardrobeCollection
  allItems: WardrobeItem[]
  outfits: Outfit[]
  logs: OutfitLog[]
}

function SortableCollectionItem({
  item, useMode, isSelected, onToggle, usageCount,
}: {
  item: WardrobeItem
  useMode: boolean
  isSelected: boolean
  onToggle: () => void
  usageCount: number
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: useMode,
  })
  return (
    <button ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      {...(useMode ? {} : { ...attributes, ...listeners })}
      onClick={() => useMode ? onToggle() : undefined}
      className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
        useMode
          ? isSelected ? 'border-primary' : 'border-border'
          : 'border-border touch-none cursor-grab active:cursor-grabbing'
      }`}
    >
      <Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="80px" />
      {usageCount > 0 && (
        <div className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-foreground text-background text-[10px] font-bold flex items-center justify-center">
          {usageCount}
        </div>
      )}
      {useMode && isSelected && (
        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
          <CheckCircle2 size={20} className="text-primary drop-shadow" />
        </div>
      )}
    </button>
  )
}

export function CollectionDetailClient({ collection, allItems, outfits, logs }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
  )

  // ── Collection items ───────────────────────────────────────────────────────
  const itemsById = Object.fromEntries(
    (collection.wardrobe_collection_items?.map(ci => [ci.item_id, ci.wardrobe_items]) ?? [])
  )
  const [itemOrder, setItemOrder] = useState<string[]>(
    [...(collection.wardrobe_collection_items ?? [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)).map(ci => ci.item_id)
  )
  useEffect(() => {
    setItemOrder(
      [...(collection.wardrobe_collection_items ?? [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)).map(ci => ci.item_id)
    )
  }, [collection.wardrobe_collection_items])
  const items = itemOrder.map(id => itemsById[id]).filter(Boolean) as WardrobeItem[]

  const usageCountByItem = new Map<string, number>()
  for (const outfit of outfits) {
    for (const oi of outfit.outfit_items ?? []) {
      usageCountByItem.set(oi.item_id, (usageCountByItem.get(oi.item_id) ?? 0) + 1)
    }
  }

  const logsByOutfit = new Map<string, OutfitLog[]>()
  for (const log of logs) {
    if (!log.outfit_id) continue
    logsByOutfit.set(log.outfit_id, [...(logsByOutfit.get(log.outfit_id) ?? []), log])
  }

  function handleItemsDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = itemOrder.indexOf(active.id as string)
    const newIndex = itemOrder.indexOf(over.id as string)
    const newOrder = arrayMove(itemOrder, oldIndex, newIndex)
    setItemOrder(newOrder)
    startTransition(async () => { await reorderCollectionItems(collection.id, newOrder) })
  }

  // ── Use items (bulk wear) ───────────────────────────────────────────────────
  const [useMode, setUseMode] = useState(false)
  const [useIds, setUseIds] = useState<Set<string>>(new Set())
  const [useDate, setUseDate] = useState(() => new Date().toISOString().split('T')[0])
  const [useConfirm, setUseConfirm] = useState(false)

  function toggleUseItem(id: string) {
    setUseIds(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  function exitUseMode() {
    setUseMode(false); setUseIds(new Set()); setUseConfirm(false)
  }
  function handleUse() {
    if (useIds.size === 0) return
    startTransition(async () => {
      await useCollectionItems([...useIds], useDate)
      exitUseMode()
    })
  }

  // ── Copy as JSON (for pasting into an LLM) ──────────────────────────────────
  const [copied, setCopied] = useState(false)
  function handleCopyJSON() {
    navigator.clipboard.writeText(collectionItemsToJSON(collection.name, items)).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  // ── Create outfit (restricted to this collection's items) ──────────────────
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [occasion, setOccasion] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [createSearch, setCreateSearch] = useState('')
  const [error, setError] = useState('')

  function toggleItem(id: string) {
    setSelectedIds(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  function resetCreate() { setName(''); setOccasion(''); setSelectedIds(new Set()); setError(''); setCreateSearch('') }
  function handleCreate() {
    if (!name.trim()) return setError('Enter an outfit name')
    if (selectedIds.size === 0) return setError('Select at least one item')
    setError('')
    startTransition(async () => {
      const res = await createOutfit(name.trim(), [...selectedIds], occasion || undefined, collection.id)
      if (res.error) setError(res.error)
      else { resetCreate(); setCreating(false) }
    })
  }

  // ── Outfit detail / edit ─────────────────────────────────────────────────
  const [detail, setDetail] = useState<Outfit | null>(null)
  const [detailItemOrder, setDetailItemOrder] = useState<string[]>([])
  const [confirmUse, setConfirmUse] = useState(false)
  const [outfitUseDate, setOutfitUseDate] = useState(() => new Date().toISOString().split('T')[0])
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editOccasion, setEditOccasion] = useState('')
  const [editIds, setEditIds] = useState<Set<string>>(new Set())
  const [editSearch, setEditSearch] = useState('')
  const [posting, setPosting] = useState(false)
  const [postCaption, setPostCaption] = useState('')

  const detailItemsById = Object.fromEntries(
    (detail?.outfit_items?.map(oi => [oi.item_id, oi.wardrobe_items]) ?? [])
  )
  const sortedDetailItems = detailItemOrder.map(id => detailItemsById[id]).filter(Boolean) as WardrobeItem[]
  const detailLogs = detail ? [...(logsByOutfit.get(detail.id) ?? [])].sort((a, b) => b.date.localeCompare(a.date)) : []

  function openDetail(outfit: Outfit) {
    setDetail(outfit)
    setDetailItemOrder(
      [...(outfit.outfit_items ?? [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)).map(oi => oi.item_id)
    )
  }
  function closeDetail() {
    setDetail(null); setConfirmUse(false); setConfirmDelete(false)
  }
  function toggleEditItem(id: string) {
    setEditIds(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  function openEdit() {
    if (!detail) return
    setEditName(detail.name)
    setEditOccasion(detail.occasion ?? '')
    setEditIds(new Set(
      [...(detail.outfit_items ?? [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map(oi => (oi.wardrobe_items as WardrobeItem)?.id).filter(Boolean)
    ))
    setEditSearch('')
    setEditing(true)
  }
  function handleUpdate() {
    if (!detail || !editName.trim()) return
    startTransition(async () => {
      const res = await updateOutfit(detail.id, editName.trim(), [...editIds], editOccasion || undefined)
      if (!res.error) setEditing(false)
    })
  }
  function handleDeleteOutfit(id: string) {
    startTransition(async () => { await deleteOutfit(id); setDetail(null) })
  }
  function handleUseOutfit(id: string) {
    startTransition(async () => { await useOutfit(id, outfitUseDate); setConfirmUse(false) })
  }
  function handlePost() {
    if (!detail) return
    startTransition(async () => {
      await postOutfit(detail.id, postCaption)
      setPosting(false)
      setPostCaption('')
    })
  }
  function handleOutfitDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id || !detail) return
    const oldIndex = detailItemOrder.indexOf(active.id as string)
    const newIndex = detailItemOrder.indexOf(over.id as string)
    const newOrder = arrayMove(detailItemOrder, oldIndex, newIndex)
    setDetailItemOrder(newOrder)
    startTransition(async () => { await reorderOutfitItems(detail.id, newOrder) })
  }

  // ── Edit collection (rename / add-remove items from full wardrobe) ─────────
  const [wcEditing, setWcEditing] = useState(false)
  const [wcEditName, setWcEditName] = useState('')
  const [wcEditIds, setWcEditIds] = useState<Set<string>>(new Set())
  const [wcEditSearch, setWcEditSearch] = useState('')
  const [confirmWcDelete, setConfirmWcDelete] = useState(false)

  function toggleWcEditItem(id: string) {
    setWcEditIds(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  function openWcEdit() {
    setWcEditName(collection.name)
    setWcEditIds(new Set(itemOrder))
    setWcEditSearch('')
    setWcEditing(true)
  }
  function handleWcUpdate() {
    if (!wcEditName.trim()) return
    startTransition(async () => {
      const res = await updateWardrobeCollection(collection.id, wcEditName.trim(), [...wcEditIds])
      if (!res.error) { setWcEditing(false); router.refresh() }
    })
  }
  function handleWcDelete() {
    startTransition(async () => {
      await deleteWardrobeCollection(collection.id)
      router.push('/outfits')
    })
  }

  const progress = collectionWorthItProgress(items)

  return (
    <div className="h-dvh overflow-y-auto bg-background pb-24">
      <header
        className="sticky top-0 z-10 flex items-center justify-between gap-2 px-3.5 pb-2.5 bg-background/95 backdrop-blur-sm border-b border-border"
        style={{ paddingTop: 'calc(14px + env(safe-area-inset-top,0px))' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={() => router.push('/outfits')} aria-label="Kembali"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0">
            <ChevronLeft size={18} />
          </button>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Collection</p>
            <h1 className="text-foreground font-bold text-base truncate">{collection.name}</h1>
          </div>
        </div>
        {!useMode && (
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={openWcEdit} aria-label="Edit koleksi"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Pencil size={16} />
            </button>
            <button onClick={handleCopyJSON} aria-label="Copy items as JSON" disabled={items.length === 0}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40">
              {copied ? <Check size={16} className="text-primary" /> : <Copy size={16} />}
            </button>
            <button onClick={() => setUseMode(true)} aria-label="Pakai item"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Shirt size={16} />
            </button>
          </div>
        )}
      </header>

      <div className="px-4 pt-4 space-y-5">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">{items.length} item{items.length !== 1 ? 's' : ''} · {outfits.length} outfit{outfits.length !== 1 ? 's' : ''}</p>
          {progress !== null && (
            <p className="text-[10px] font-bold text-muted-foreground">Worth it {Math.round(progress)}%</p>
          )}
        </div>

        {/* ── Horizontal item strip with usage badges ──────────────────────── */}
        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm py-6 text-center">Belum ada item di koleksi ini</p>
        ) : useMode ? (
          <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
            {items.map(item => (
              <SortableCollectionItem
                key={item.id} item={item} useMode={useMode}
                isSelected={useIds.has(item.id)} onToggle={() => toggleUseItem(item.id)}
                usageCount={usageCountByItem.get(item.id) ?? 0}
              />
            ))}
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleItemsDragEnd}>
            <SortableContext items={itemOrder} strategy={horizontalListSortingStrategy}>
              <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
                {items.map(item => (
                  <SortableCollectionItem
                    key={item.id} item={item} useMode={false}
                    isSelected={false} onToggle={() => {}}
                    usageCount={usageCountByItem.get(item.id) ?? 0}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {useMode && (
          <div className="space-y-3">
            {useConfirm ? (
              <>
                <div>
                  <label htmlFor="use-date" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Tanggal pakai</label>
                  <input id="use-date" type="date" value={useDate} onChange={e => setUseDate(e.target.value)}
                    className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-foreground/20" />
                </div>
                <p className="text-sm text-center text-muted-foreground">+1 worn untuk {useIds.size} item. Lanjut?</p>
                <div className="flex gap-2">
                  <button onClick={() => setUseConfirm(false)} disabled={isPending}
                    className="flex-1 bg-muted text-muted-foreground font-semibold py-3 rounded-xl text-sm">Batal</button>
                  <button onClick={handleUse} disabled={isPending || useIds.size === 0}
                    className="flex-1 bg-foreground text-background font-semibold py-3 rounded-xl text-sm disabled:opacity-40">
                    {isPending ? 'Saving...' : 'Ya, Pakai'}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex gap-2">
                <button onClick={exitUseMode} disabled={isPending}
                  className="flex-1 bg-muted text-muted-foreground font-semibold py-3 rounded-xl text-sm">Batal</button>
                <button onClick={() => setUseConfirm(true)} disabled={useIds.size === 0}
                  className="flex-1 bg-foreground text-background font-semibold py-3 rounded-xl text-sm disabled:opacity-40">
                  Pakai ({useIds.size})
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Lookbook: outfits curated for this collection ─────────────────── */}
        {!useMode && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-foreground font-bold text-sm">Lookbook</p>
              <button onClick={() => setCreating(true)} disabled={items.length === 0}
                className="flex items-center gap-1 text-xs font-semibold text-primary disabled:opacity-40">
                <Plus size={14} /> Outfit baru
              </button>
            </div>
            {outfits.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6 border border-dashed border-border rounded-2xl">
                <p className="text-foreground font-semibold mb-1 text-sm">Belum ada outfit</p>
                <p className="text-muted-foreground text-xs">Mix &amp; match item di koleksi ini jadi outfit pertama</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {outfits.map(outfit => {
                  const outfitItems = [...(outfit.outfit_items ?? [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)).map(oi => oi.wardrobe_items).filter(Boolean) as WardrobeItem[]
                  const outfitLogs = logsByOutfit.get(outfit.id) ?? []
                  const lastUsed = outfitLogs.length > 0 ? [...outfitLogs].sort((a, b) => b.date.localeCompare(a.date))[0].date : null
                  return (
                    <OutfitCard
                      key={outfit.id}
                      outfit={outfit}
                      items={outfitItems}
                      useCount={outfitLogs.length}
                      lastUsed={lastUsed}
                      onPress={() => openDetail(outfit)}
                    />
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Create Outfit modal (items restricted to this collection) ────────── */}
      {creating && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end" onClick={() => { setCreating(false); resetCreate() }}>
          <div className="w-full bg-background rounded-t-3xl max-h-[92vh] flex flex-col border-t border-border"
            onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3 mb-1 flex-shrink-0" />
            <div className="flex items-center justify-between px-5 py-3 border-b border-border flex-shrink-0">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{collection.name}</p>
                <h2 className="text-foreground font-bold text-base">New Outfit</h2>
              </div>
              <button onClick={() => { setCreating(false); resetCreate() }} aria-label="Tutup" className="text-muted-foreground hover:text-foreground transition-colors">
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
              <ItemPicker allItems={items} selectedIds={selectedIds} onToggle={toggleItem} search={createSearch} onSearchChange={setCreateSearch} />
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

      {/* ── Outfit detail modal ───────────────────────────────────────────── */}
      {detail && (
        <div className="fixed inset-0 z-50 bg-black/70" onClick={closeDetail}>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-background rounded-t-3xl max-h-[88vh] overflow-y-auto border-t border-border"
            onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3" />
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button onClick={openEdit} aria-label="Edit outfit" className="text-muted-foreground hover:text-foreground transition-colors">
                <Pencil size={17} />
              </button>
              <button onClick={closeDetail} aria-label="Tutup" className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <h2 className="text-foreground font-bold text-xl">{detail.name}</h2>
                {detail.occasion && <p className="text-muted-foreground text-sm capitalize mt-0.5">{detail.occasion}</p>}
              </div>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleOutfitDragEnd}>
                <SortableContext items={detailItemOrder} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-3 gap-2">
                    {sortedDetailItems.map(item => (
                      <SortableDetailItem key={item.id} item={item} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              {detailLogs.length > 0 && (
                <div className="bg-muted rounded-xl px-4 py-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-foreground">
                      <CalendarDays size={13} strokeWidth={2.5} />
                      <span className="text-xs font-bold uppercase tracking-wider">Riwayat Pakai</span>
                    </div>
                    <span className="text-xs font-semibold text-foreground">{detailLogs.length}×</span>
                  </div>
                  <div className="space-y-1">
                    {detailLogs.map(log => (
                      <p key={log.id} className="text-xs text-muted-foreground">{formatDateLabel(log.date)}</p>
                    ))}
                  </div>
                </div>
              )}
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
                    <label htmlFor="outfit-use-date" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Tanggal pakai</label>
                    <input id="outfit-use-date" type="date" value={outfitUseDate} onChange={e => setOutfitUseDate(e.target.value)}
                      className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-foreground/20" />
                  </div>
                  <p className="text-sm text-center text-muted-foreground">
                    +1 worn untuk semua {sortedDetailItems.length} item. Lanjut?
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => setConfirmUse(false)} disabled={isPending}
                      className="flex-1 bg-muted text-muted-foreground font-semibold py-3 rounded-xl text-sm">Batal</button>
                    <button onClick={() => handleUseOutfit(detail.id)} disabled={isPending}
                      className="flex-1 bg-foreground text-background font-semibold py-3 rounded-xl text-sm disabled:opacity-40">
                      {isPending ? 'Saving...' : 'Ya, Pakai'}
                    </button>
                  </div>
                </div>
              )}
              {!confirmDelete ? (
                <button onClick={() => setConfirmDelete(true)} disabled={isPending}
                  className="w-full flex items-center justify-center gap-2 bg-destructive/10 text-destructive border border-destructive/20 py-3 rounded-xl text-sm disabled:opacity-40">
                  <Trash2 size={15} />
                  Delete Outfit
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-center text-muted-foreground">Yakin hapus outfit ini?</p>
                  <div className="flex gap-2">
                    <button onClick={() => setConfirmDelete(false)} disabled={isPending}
                      className="flex-1 bg-muted text-muted-foreground font-semibold py-3 rounded-xl text-sm">Batal</button>
                    <button onClick={() => handleDeleteOutfit(detail.id)} disabled={isPending}
                      className="flex-1 bg-destructive text-destructive-foreground font-semibold py-3 rounded-xl text-sm disabled:opacity-40">
                      {isPending ? 'Menghapus...' : 'Hapus'}
                    </button>
                  </div>
                </div>
              )}
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
              <button onClick={() => { setPosting(false); setPostCaption('') }} aria-label="Tutup" className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-5 space-y-4">
              <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {sortedDetailItems.map((item, i) => (
                  <div key={i} className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border border-border relative">
                    <Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="80px" />
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

      {/* ── Edit Outfit modal (items restricted to this collection) ──────────── */}
      {editing && detail && (
        <div className="fixed inset-0 z-[60] bg-black/70 flex items-end" onClick={() => setEditing(false)}>
          <div className="w-full bg-background rounded-t-3xl max-h-[92vh] flex flex-col border-t border-border"
            onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3 mb-1 flex-shrink-0" />
            <div className="flex items-center justify-between px-5 py-3 border-b border-border flex-shrink-0">
              <h2 className="text-foreground font-bold text-base">Edit Outfit</h2>
              <button onClick={() => setEditing(false)} aria-label="Tutup" className="text-muted-foreground hover:text-foreground transition-colors">
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
              <ItemPicker allItems={items} selectedIds={editIds} onToggle={toggleEditItem} search={editSearch} onSearchChange={setEditSearch} />
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

      {/* ── Edit Collection sheet (rename / add-remove items, full wardrobe) ─── */}
      {wcEditing && (
        <div className="fixed inset-0 z-[60] bg-black/70 flex items-end" onClick={() => setWcEditing(false)}>
          <div className="w-full bg-background rounded-t-3xl max-h-[92vh] flex flex-col border-t border-border"
            onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3 mb-1 flex-shrink-0" />
            <div className="flex items-center justify-between px-5 py-3 border-b border-border flex-shrink-0">
              <h2 className="text-foreground font-bold text-base">Edit Collection</h2>
              <button onClick={() => setWcEditing(false)} aria-label="Tutup" className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-5 overflow-y-auto flex-1">
              <input value={wcEditName} onChange={e => setWcEditName(e.target.value)} placeholder="Collection name"
                className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground text-base outline-none focus:border-primary transition-colors" />
              <ItemPicker allItems={allItems} selectedIds={wcEditIds} onToggle={toggleWcEditItem} search={wcEditSearch} onSearchChange={setWcEditSearch} />
              {!confirmWcDelete ? (
                <button onClick={() => setConfirmWcDelete(true)} disabled={isPending}
                  className="w-full flex items-center justify-center gap-2 bg-destructive/10 text-destructive border border-destructive/20 py-3 rounded-xl text-sm disabled:opacity-40">
                  <Trash2 size={15} />
                  Delete Collection
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-center text-muted-foreground">Yakin hapus koleksi ini? Outfit yang sudah dibuat tidak akan ikut terhapus.</p>
                  <div className="flex gap-2">
                    <button onClick={() => setConfirmWcDelete(false)} disabled={isPending}
                      className="flex-1 bg-muted text-muted-foreground font-semibold py-3 rounded-xl text-sm">Batal</button>
                    <button onClick={handleWcDelete} disabled={isPending}
                      className="flex-1 bg-destructive text-destructive-foreground font-semibold py-3 rounded-xl text-sm disabled:opacity-40">
                      {isPending ? 'Menghapus...' : 'Hapus'}
                    </button>
                  </div>
                </div>
              )}
            </div>
            {!confirmWcDelete && (
              <div className="px-5 pb-8 pt-3 border-t border-border flex-shrink-0">
                <button onClick={handleWcUpdate} disabled={isPending}
                  className="w-full bg-primary text-primary-foreground font-semibold py-3.5 rounded-xl text-sm disabled:opacity-40 hover:opacity-90 transition-opacity">
                  {isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
