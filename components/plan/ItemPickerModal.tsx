'use client'

import { useTransition, useState, useEffect } from 'react'
import { X, Check } from 'lucide-react'
import { addToPlan, removeFromPlan } from '@/app/actions'
import { CATEGORIES, type WardrobeItem, type PlanEntry } from '@/lib/types'

interface ItemPickerModalProps {
  open: boolean
  date: string
  dayPlans: PlanEntry[]
  allItems: WardrobeItem[]
  onClose: () => void
}

export function ItemPickerModal({ open, date, dayPlans, allItems, onClose }: ItemPickerModalProps) {
  const [isPending, startTransition] = useTransition()
  const [plannedMap, setPlannedMap] = useState<Map<string, string>>(new Map())
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  useEffect(() => {
    setPlannedMap(new Map(dayPlans.map(p => [p.item_id, p.id])))
  }, [dayPlans])

  function handleToggle(item: WardrobeItem) {
    const planId = plannedMap.get(item.id)
    if (planId) {
      setPlannedMap(prev => {
        const next = new Map(prev)
        next.delete(item.id)
        return next
      })
      startTransition(async () => {
        try {
          await removeFromPlan(planId)
        } catch {
          setPlannedMap(prev => new Map(prev).set(item.id, planId))
        }
      })
    } else {
      setPlannedMap(prev => new Map(prev).set(item.id, 'pending'))
      startTransition(async () => {
        try {
          await addToPlan(item.id, date)
        } catch {
          setPlannedMap(prev => {
            const next = new Map(prev)
            next.delete(item.id)
            return next
          })
        }
      })
    }
  }

  const filtered = activeCategory
    ? allItems.filter(i => i.category === activeCategory)
    : allItems

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-end" onClick={onClose}>
      <div
        className="w-full bg-[#0F0F0F] rounded-t-3xl max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-[#2A2A2A] rounded-full mx-auto mt-3 mb-1 flex-shrink-0" />

        <div className="flex items-center justify-between px-5 py-3 border-b border-[#1F1F1F] flex-shrink-0">
          <h2 className="text-white font-bold text-base">Pick Items</h2>
          <button onClick={onClose} className="text-[#555555] hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Category filter */}
        <div
          className="flex gap-2 overflow-x-auto px-4 py-3 flex-shrink-0 border-b border-[#1F1F1F]"
          style={{ scrollbarWidth: 'none' }}
        >
          <button
            onClick={() => setActiveCategory(null)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all ${
              !activeCategory ? 'bg-white text-black' : 'bg-[#1A1A1A] text-[#666666] border border-[#2A2A2A]'
            }`}
          >
            All
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(activeCategory === cat.value ? null : cat.value)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                activeCategory === cat.value
                  ? 'bg-white text-black'
                  : 'bg-[#1A1A1A] text-[#666666] border border-[#2A2A2A]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="overflow-y-auto flex-1 p-4">
          {filtered.length === 0 ? (
            <p className="text-center text-[#444444] text-sm py-12">No items in this category</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {filtered.map(item => {
                const isPlanned = plannedMap.has(item.id)
                return (
                  <button
                    key={item.id}
                    onClick={() => handleToggle(item)}
                    disabled={isPending}
                    className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#1A1A1A] active:scale-95 transition-transform disabled:opacity-70"
                  >
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    {isPlanned && (
                      <div className="absolute inset-0 bg-white/20 flex items-start justify-end p-1.5">
                        <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                          <Check size={11} className="text-black" strokeWidth={3} />
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-white text-[10px] truncate font-medium">{item.name}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
