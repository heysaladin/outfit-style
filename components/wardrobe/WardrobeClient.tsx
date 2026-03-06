'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
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
  const [uploadOpen, setUploadOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeColor, setActiveColor] = useState<string | null>(null)

  const filtered = items.filter(item => {
    if (activeCategory && item.category !== activeCategory) return false
    if (activeColor && item.color !== activeColor) return false
    return true
  })

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-16">
      <Header user={user} onUpload={() => setUploadOpen(true)} />

      <FilterBar
        activeCategory={activeCategory}
        activeColor={activeColor}
        onCategoryChange={setActiveCategory}
        onColorChange={setActiveColor}
      />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center px-6">
          <div className="text-5xl mb-4">👔</div>
          <p className="text-white font-semibold mb-1">
            {items.length === 0 ? 'Your wardrobe is empty' : 'No items match your filter'}
          </p>
          <p className="text-[#444444] text-sm">
            {items.length === 0 ? 'Tap + to add your first clothing item' : 'Try a different filter'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 pb-24">
          {filtered.map(item => (
            <ItemCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />
          ))}
        </div>
      )}

      {/* Floating action button */}
      <button
        onClick={() => setUploadOpen(true)}
        className="fixed bottom-20 right-5 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-2xl hover:bg-gray-100 transition-colors active:scale-95"
      >
        <Plus size={22} className="text-black" strokeWidth={2.5} />
      </button>

      <BottomNav />
      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
      <ItemDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  )
}
