'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Search, Check, Shirt } from 'lucide-react'
import { useRef } from 'react'
import type { User } from '@supabase/supabase-js'
import type { WardrobeItem, Wardrobe } from '@/lib/types'
import { setItemStatus, deleteItem, createOutfit } from '@/app/actions'
import { Header } from './Header'
import { FilterBar } from './FilterBar'
import { ItemCard } from './ItemCard'
import { UploadModal } from './UploadModal'
import { ItemDetailModal } from './ItemDetailModal'
import { BottomNav } from '@/components/BottomNav'

interface WardrobeClientProps {
  items: WardrobeItem[]
  wardrobes: Wardrobe[]
  user: User | null
}

export function WardrobeClient({ items, wardrobes, user }: WardrobeClientProps) {
  const router = useRouter()
  const [uploadOpen, setUploadOpen]     = useState(false)
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null)
  const [selectMode, setSelectMode]     = useState(false)
  const [selected, setSelected]         = useState<Set<string>>(new Set())
  const [namingOutfit, setNamingOutfit] = useState(false)
  const [outfitName, setOutfitName]     = useState('')
  const [outfitPending, setOutfitPending] = useState(false)
  const nameInputRef = useRef<HTMLInputElement>(null)

  const [activeCategory,    setActiveCategory]    = useState<string | null>(null)
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null)
  const [activeColor,       setActiveColor]       = useState<string | null>(null)
  const [activeSeason,      setActiveSeason]      = useState<string | null>(null)
  const [activeOccasion,    setActiveOccasion]    = useState<string | null>(null)
  const [showVerified,      setShowVerified]      = useState(true)
  const [showDraft,         setShowDraft]         = useState(false)
  const [search,            setSearch]            = useState('')
  const [sort,              setSort]              = useState<'wear_asc'|'wear_desc'|'price_asc'|'price_desc'|'date_asc'|'date_desc'>('wear_asc')

  const q = search.toLowerCase().trim()
  const statusRank = (s: string) => {
    if (s === 'verified')  return 0
    if (s === 'draft')     return 1
    if (s === 'donated' || s === 'sell' || s === 'give_away') return 2
    if (s === 'trashed')   return 3
    return 1
  }

  const filtered = items.filter(item => {
    if (activeCategory    && item.category    !== activeCategory)    return false
    if (activeSubcategory && item.subcategory !== activeSubcategory) return false
    if (activeColor       && item.color       !== activeColor)       return false
    if (activeSeason      && !(item.seasons ?? []).includes(activeSeason))   return false
    if (activeOccasion    && !(item.occasions ?? []).includes(activeOccasion)) return false
    const s = item.status ?? 'draft'
    if (s === 'verified'  && !showVerified) return false
    if (s !== 'verified'  && !showDraft)    return false
    if (item.declutter_status === 'non-fashion') return false
    if (item.declutter_status && !showDraft) return false
    if (q) {
      const hay = [item.name, item.brand, ...(item.tags ?? [])].filter(Boolean).join(' ').toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  }).sort((a, b) => {
    if (sort === 'price_desc') return (b.price ?? -1) - (a.price ?? -1)
    if (sort === 'price_asc')  return (a.price ?? Infinity) - (b.price ?? Infinity)
    if (sort === 'date_desc')  return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    if (sort === 'date_asc')   return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
    if (sort === 'wear_desc')  return b.wear_count - a.wear_count
    const wearDiff = a.wear_count - b.wear_count
    if (wearDiff !== 0) return wearDiff
    return statusRank(a.status ?? 'draft') - statusRank(b.status ?? 'draft')
  })

  function toggleSelect(id: string) {
    setSelected(s => {
      const n = new Set(s)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  function exitSelectMode() {
    setSelectMode(false); setSelected(new Set())
    setNamingOutfit(false); setOutfitName('')
  }

  async function handleCreateOutfit() {
    if (!outfitName.trim() || selected.size === 0) return
    setOutfitPending(true)
    const res = await createOutfit(outfitName.trim(), [...selected])
    setOutfitPending(false)
    if (!res.error) { exitSelectMode(); router.push('/outfits') }
  }

  async function handleVerify(id: string) {
    await setItemStatus(id, 'verified')
    router.refresh()
  }

  async function handleTrash(id: string) {
    await setItemStatus(id, 'trashed')
    router.refresh()
  }

  async function handleRestoreDraft(id: string) {
    await setItemStatus(id, 'draft')
    router.refresh()
  }

  async function handleDelete(id: string) {
    await deleteItem(id)
    router.refresh()
  }

  function handleItemClick(item: WardrobeItem) {
    if (selectMode) toggleSelect(item.id)
    else setSelectedItem(item)
  }

  return (
    <div className="h-dvh overflow-y-auto bg-background pb-24">
      <Header user={user} onUpload={() => setUploadOpen(true)} onSelectMode={user ? () => setSelectMode(v => !v) : undefined} />

      {/* Search bar */}
      <div className="px-5 pt-3 pb-1">
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, brand, tag…"
            className="w-full bg-muted rounded-xl pl-9 pr-9 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-1 focus:ring-foreground/20"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <FilterBar
        activeCategory={activeCategory} activeSubcategory={activeSubcategory}
        activeColor={activeColor} activeSeason={activeSeason} activeOccasion={activeOccasion}
        showVerified={showVerified} showDraft={showDraft}
        sort={sort} onSortChange={setSort}
        onCategoryChange={v => { setActiveCategory(v); setActiveSubcategory(null) }}
        onSubcategoryChange={setActiveSubcategory}
        onColorChange={setActiveColor} onSeasonChange={setActiveSeason} onOccasionChange={setActiveOccasion}
        onShowVerifiedChange={setShowVerified} onShowDraftChange={setShowDraft}
      />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center px-8">
          <p className="text-foreground font-semibold text-sm mb-1">
            {items.length === 0 ? (user ? 'Your wardrobe is empty' : 'No public items yet') : 'No items match'}
          </p>
          <p className="text-muted-foreground text-xs">
            {items.length === 0 ? (user ? 'Tap Add to start building your wardrobe' : 'Sign in to build your own wardrobe') : 'Adjust the filters above'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-5 px-5 py-5 pb-28">
          {filtered.map(item => (
            <ItemCard key={item.id} item={item}
              onClick={() => handleItemClick(item)}
              selected={selected.has(item.id)}
              selectable={selectMode}
              onVerify={user ? () => handleVerify(item.id) : undefined}
              onTrash={user && showDraft ? () => handleTrash(item.id) : undefined}
              onRestoreDraft={user ? () => handleRestoreDraft(item.id) : undefined}
              onDelete={user && showDraft ? () => handleDelete(item.id) : undefined}
            />
          ))}
        </div>
      )}

      {/* Bulk select bar */}
      {selectMode && (
        <div
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-30 bg-background border-t border-border"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          {namingOutfit ? (
            <div className="flex items-center gap-2 px-4 py-3">
              <input
                ref={nameInputRef}
                autoFocus
                value={outfitName}
                onChange={e => setOutfitName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreateOutfit()}
                placeholder="Outfit name…"
                className="flex-1 bg-muted rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              <button
                onClick={handleCreateOutfit}
                disabled={!outfitName.trim() || outfitPending}
                className="w-9 h-9 rounded-xl bg-foreground text-background flex items-center justify-center disabled:opacity-40 transition-opacity"
              >
                <Check size={16} />
              </button>
              <button
                onClick={() => { setNamingOutfit(false); setOutfitName('') }}
                className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-3">
              <span className="text-foreground text-sm font-medium flex-1">
                {selected.size > 0 ? `${selected.size} selected` : 'Tap items to select'}
              </span>
              {selected.size > 0 && (
                <button
                  onClick={() => { setNamingOutfit(true); setTimeout(() => nameInputRef.current?.focus(), 50) }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-foreground text-background text-xs font-semibold transition-opacity"
                >
                  <Shirt size={13} />
                  Save as Outfit
                </button>
              )}
              <button onClick={exitSelectMode} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      <BottomNav />
      {user && <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />}
      <ItemDetailModal item={selectedItem} wardrobes={wardrobes} user={user} onClose={() => setSelectedItem(null)} />
    </div>
  )
}
