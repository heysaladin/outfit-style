'use client'

import { useState } from 'react'
import { Plus, X, Search } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import type { WardrobeItem, Wardrobe } from '@/lib/types'
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
  const [uploadOpen, setUploadOpen]     = useState(false)
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null)
  const [selectMode, setSelectMode]     = useState(false)
  const [selected, setSelected]         = useState<Set<string>>(new Set())

  const [activeCategory,    setActiveCategory]    = useState<string | null>(null)
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null)
  const [activeColor,       setActiveColor]       = useState<string | null>(null)
  const [activeSeason,      setActiveSeason]      = useState<string | null>(null)
  const [activeOccasion,    setActiveOccasion]    = useState<string | null>(null)
  const [showVerified,      setShowVerified]      = useState(true)
  const [showDraft,         setShowDraft]         = useState(false)
  const [search,            setSearch]            = useState('')

  const q = search.toLowerCase().trim()
  const filtered = items.filter(item => {
    if (activeCategory    && item.category    !== activeCategory)    return false
    if (activeSubcategory && item.subcategory !== activeSubcategory) return false
    if (activeColor       && item.color       !== activeColor)       return false
    if (activeSeason      && !(item.seasons ?? []).includes(activeSeason))   return false
    if (activeOccasion    && !(item.occasions ?? []).includes(activeOccasion)) return false
    const isDraft = !item.status || item.status === 'draft'
    if (isDraft && !showDraft)     return false
    if (!isDraft && !showVerified) return false
    if (q) {
      const hay = [item.name, item.brand, ...(item.tags ?? [])].filter(Boolean).join(' ').toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })

  function toggleSelect(id: string) {
    setSelected(s => {
      const n = new Set(s)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  function exitSelectMode() { setSelectMode(false); setSelected(new Set()) }

  function handleItemClick(item: WardrobeItem) {
    if (selectMode) toggleSelect(item.id)
    else setSelectedItem(item)
  }

  return (
    <div className="min-h-screen bg-background pb-24">
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
            />
          ))}
        </div>
      )}

      {/* Bulk select bar */}
      {selectMode && (
        <div className="fixed bottom-16 inset-x-0 bg-background/95 backdrop-blur-md border-t border-border px-5 py-3 flex items-center justify-between">
          <span className="text-foreground text-sm font-medium">
            {selected.size > 0 ? `${selected.size} selected` : 'Tap items to select'}
          </span>
          <button onClick={exitSelectMode} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>
      )}

      <BottomNav />
      {user && <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />}
      <ItemDetailModal item={selectedItem} wardrobes={wardrobes} user={user} onClose={() => setSelectedItem(null)} />
    </div>
  )
}
