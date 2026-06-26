'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import type { HobbyItem } from '@/lib/types'
import { HOBBIES } from '@/lib/types'
import { GearItemCard } from './GearItemCard'
import { AddGearModal } from './AddGearModal'

interface GearClientProps {
  items: HobbyItem[]
  user: User
}

export function GearClient({ items, user }: GearClientProps) {
  const [addOpen, setAddOpen]           = useState(false)
  const [selectedItem, setSelectedItem] = useState<HobbyItem | null>(null)
  const [activeHobby, setActiveHobby]   = useState<string | null>(null)

  const filtered = activeHobby ? items.filter(i => i.category === activeHobby) : items

  const hobbyCounts = HOBBIES.reduce<Record<string, number>>((acc, h) => {
    acc[h.value] = items.filter(i => i.category === h.value).length
    return acc
  }, {})

  const activeHobbies = HOBBIES.filter(h => hobbyCounts[h.value] > 0)

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/40">
        <div className="flex items-center justify-between px-4 pt-14 pb-3">
          <div>
            <h1 className="text-foreground font-bold text-xl tracking-tight">Gear</h1>
            <p className="text-muted-foreground text-xs mt-0.5">
              {items.length} {items.length === 1 ? 'item' : 'items'} across {activeHobbies.length} {activeHobbies.length === 1 ? 'hobby' : 'hobbies'}
            </p>
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="w-9 h-9 rounded-xl bg-foreground text-background flex items-center justify-center hover:opacity-80 transition-opacity"
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Hobby filter pills */}
        {activeHobbies.length > 1 && (
          <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveHobby(null)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                activeHobby === null
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-muted text-muted-foreground border-transparent'
              }`}
            >
              All
              <span className="text-[10px] opacity-60">{items.length}</span>
            </button>
            {activeHobbies.map(h => (
              <button
                key={h.value}
                onClick={() => setActiveHobby(v => v === h.value ? null : h.value)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  activeHobby === h.value
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-muted text-muted-foreground border-transparent'
                }`}
              >
                {h.icon} {h.label}
                <span className="text-[10px] opacity-60">{hobbyCounts[h.value]}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-8 text-center gap-4">
          <span className="text-5xl">{activeHobby ? HOBBIES.find(h => h.value === activeHobby)?.icon : '🎒'}</span>
          <div>
            <p className="text-foreground font-semibold text-base">
              {activeHobby ? `No ${HOBBIES.find(h => h.value === activeHobby)?.label} gear yet` : 'No gear yet'}
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              Tap + to add your first item
            </p>
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 bg-foreground text-background font-semibold px-5 py-2.5 rounded-xl text-sm hover:opacity-80 transition-opacity"
          >
            <Plus size={15} />
            Add Gear
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 p-4">
          {filtered.map(item => (
            <GearItemCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />
          ))}
        </div>
      )}

      {addOpen && <AddGearModal onClose={() => setAddOpen(false)} />}
    </div>
  )
}
