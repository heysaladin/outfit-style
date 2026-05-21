'use client'

import { useState, useEffect } from 'react'
import { Plus, X } from 'lucide-react'
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
  user: User
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
  const [mounted,           setMounted]           = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const filtered = items.filter(item => {
    if (activeCategory    && item.category    !== activeCategory)    return false
    if (activeSubcategory && item.subcategory !== activeSubcategory) return false
    if (activeColor       && item.color       !== activeColor)       return false
    if (activeSeason      && !(item.seasons ?? []).includes(activeSeason))   return false
    if (activeOccasion    && !(item.occasions ?? []).includes(activeOccasion)) return false
    if (mounted) {
      const isDraft = !item.status || item.status === 'draft'
      if (isDraft && !showDraft)     return false
      if (!isDraft && !showVerified) return false
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
    <div className="min-h-screen bg-background pb-16">
      <Header user={user} onUpload={() => setUploadOpen(true)} onSelectMode={() => setSelectMode(v => !v)} />

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
        <div className="flex flex-col items-center justify-center py-32 text-center px-6">
          <div className="text-5xl mb-4">👔</div>
          <p className="text-foreground font-semibold mb-1">
            {items.length === 0 ? 'Your wardrobe is empty' : 'No items match'}
          </p>
          <p className="text-muted-foreground text-sm">
            {items.length === 0 ? 'Tap + to add your first item' : 'Try a different filter'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 pb-24">
          {filtered.map(item => (
            <ItemCard key={item.id} item={item}
              onClick={() => handleItemClick(item)}
              selected={selected.has(item.id)}
              selectable={selectMode}
            />
          ))}
        </div>
      )}

      {/* FAB */}
      {!selectMode && (
        <button onClick={() => setUploadOpen(true)}
          className="fixed bottom-20 right-5 w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-2xl hover:opacity-90 transition-opacity active:scale-95">
          <Plus size={22} className="text-primary-foreground" strokeWidth={2.5} />
        </button>
      )}

      {/* Bulk select bar */}
      {selectMode && (
        <div className="fixed bottom-16 inset-x-0 bg-background border-t border-border px-5 py-3 flex items-center justify-between">
          <span className="text-foreground text-sm font-medium">
            {selected.size > 0 ? `${selected.size} selected` : 'Tap items to select'}
          </span>
          <button onClick={exitSelectMode} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={20} />
          </button>
        </div>
      )}

      <BottomNav />
      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
      <ItemDetailModal item={selectedItem} wardrobes={wardrobes} onClose={() => setSelectedItem(null)} />
    </div>
  )
}
