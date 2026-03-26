'use client'

import { useState } from 'react'
import { Plus, CheckSquare, X } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import type { WardrobeItem } from '@/lib/types'
import { Header } from './Header'
import { FilterBar } from './FilterBar'
import { ItemCard } from './ItemCard'
import { UploadModal } from './UploadModal'
import { ItemDetailModal } from './ItemDetailModal'
import { BottomNav } from '@/components/BottomNav'

interface WardrobeClientProps {
  items: WardrobeItem[]
  user: User
}

export function WardrobeClient({ items, user }: WardrobeClientProps) {
  const [uploadOpen, setUploadOpen]     = useState(false)
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null)
  const [selectMode, setSelectMode]     = useState(false)
  const [selected, setSelected]         = useState<Set<string>>(new Set())

  const [activeCategory,    setActiveCategory]    = useState<string | null>(null)
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null)
  const [activeColor,       setActiveColor]       = useState<string | null>(null)
  const [activeSeason,      setActiveSeason]      = useState<string | null>(null)
  const [activeOccasion,    setActiveOccasion]    = useState<string | null>(null)

  const filtered = items.filter(item => {
    if (activeCategory    && item.category    !== activeCategory)    return false
    if (activeSubcategory && item.subcategory !== activeSubcategory) return false
    if (activeColor       && item.color       !== activeColor)       return false
    if (activeSeason      && !(item.seasons ?? []).includes(activeSeason))   return false
    if (activeOccasion    && !(item.occasions ?? []).includes(activeOccasion)) return false
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
    <div className="min-h-screen bg-[#0A0A0A] pb-16">
      <Header user={user} onUpload={() => setUploadOpen(true)} onSelectMode={() => setSelectMode(v => !v)} />

      <FilterBar
        activeCategory={activeCategory} activeSubcategory={activeSubcategory}
        activeColor={activeColor} activeSeason={activeSeason} activeOccasion={activeOccasion}
        onCategoryChange={v => { setActiveCategory(v); setActiveSubcategory(null) }}
        onSubcategoryChange={setActiveSubcategory}
        onColorChange={setActiveColor} onSeasonChange={setActiveSeason} onOccasionChange={setActiveOccasion}
      />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center px-6">
          <div className="text-5xl mb-4">👔</div>
          <p className="text-white font-semibold mb-1">
            {items.length === 0 ? 'Your wardrobe is empty' : 'No items match'}
          </p>
          <p className="text-[#444444] text-sm">
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
          className="fixed bottom-20 right-5 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-2xl hover:bg-gray-100 transition-colors active:scale-95">
          <Plus size={22} className="text-black" strokeWidth={2.5} />
        </button>
      )}

      {/* Bulk select bar */}
      {selectMode && (
        <div className="fixed bottom-16 inset-x-0 bg-[#0F0F0F] border-t border-[#1F1F1F] px-5 py-3 flex items-center justify-between">
          <span className="text-white text-sm font-medium">
            {selected.size > 0 ? `${selected.size} selected` : 'Tap items to select'}
          </span>
          <button onClick={exitSelectMode} className="text-[#555555] hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
      )}

      <BottomNav />
      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
      <ItemDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  )
}
