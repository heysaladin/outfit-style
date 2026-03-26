'use client'

import { useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { CATEGORY_TREE, COLORS, SEASONS, OCCASIONS, getCategoryDef } from '@/lib/types'

interface FilterBarProps {
  activeCategory: string | null
  activeSubcategory: string | null
  activeColor: string | null
  activeSeason: string | null
  activeOccasion: string | null
  onCategoryChange: (v: string | null) => void
  onSubcategoryChange: (v: string | null) => void
  onColorChange: (v: string | null) => void
  onSeasonChange: (v: string | null) => void
  onOccasionChange: (v: string | null) => void
}

export function FilterBar({
  activeCategory, activeSubcategory, activeColor, activeSeason, activeOccasion,
  onCategoryChange, onSubcategoryChange, onColorChange, onSeasonChange, onOccasionChange,
}: FilterBarProps) {
  const [expanded, setExpanded] = useState(false)
  const catDef = getCategoryDef(activeCategory ?? '')
  const hasSubcategories = (catDef?.subcategories.length ?? 0) > 0
  const activeCount = [activeColor, activeSeason, activeOccasion].filter(Boolean).length

  function clearAll() {
    onCategoryChange(null); onSubcategoryChange(null); onColorChange(null)
    onSeasonChange(null); onOccasionChange(null)
  }

  return (
    <div className="border-b border-[#1F1F1F] px-4 py-3 space-y-3">
      {/* Category row */}
      <div className="flex items-center gap-2">
        <div className="flex gap-2 overflow-x-auto flex-1" style={{ scrollbarWidth: 'none' }}>
          <button onClick={() => { onCategoryChange(null); onSubcategoryChange(null) }}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all ${
              !activeCategory ? 'bg-white text-black' : 'bg-[#1A1A1A] text-[#666666] border border-[#2A2A2A]'
            }`}>All</button>
          {CATEGORY_TREE.map(cat => (
            <button key={cat.value} onClick={() => {
              onCategoryChange(activeCategory === cat.value ? null : cat.value)
              onSubcategoryChange(null)
            }}
              className={`flex-shrink-0 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                activeCategory === cat.value ? 'bg-white text-black' : 'bg-[#1A1A1A] text-[#666666] border border-[#2A2A2A]'
              }`}>
              <span>{cat.icon}</span>{cat.label}
            </button>
          ))}
        </div>
        <button onClick={() => setExpanded(v => !v)}
          className={`flex-shrink-0 relative w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            expanded || activeCount > 0 ? 'bg-white text-black' : 'bg-[#1A1A1A] text-[#555555] border border-[#2A2A2A]'
          }`}>
          <SlidersHorizontal size={14} />
          {activeCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-black text-[9px] font-bold rounded-full flex items-center justify-center border border-[#0A0A0A]">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* Subcategory row (when category with subcategories is active) */}
      {activeCategory && hasSubcategories && (
        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <button onClick={() => onSubcategoryChange(null)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all ${
              !activeSubcategory ? 'bg-white/20 text-white' : 'bg-[#1A1A1A] text-[#666666] border border-[#2A2A2A]'
            }`}>All</button>
          {catDef!.subcategories.map(sub => (
            <button key={sub.value} onClick={() => onSubcategoryChange(activeSubcategory === sub.value ? null : sub.value)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                activeSubcategory === sub.value ? 'bg-white/20 text-white' : 'bg-[#1A1A1A] text-[#666666] border border-[#2A2A2A]'
              }`}>{sub.label}</button>
          ))}
        </div>
      )}

      {/* Expanded filters */}
      {expanded && (
        <div className="space-y-3 pt-1">
          {/* Colors */}
          <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            <button onClick={() => onColorChange(null)} title="All"
              className={`flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all bg-gradient-to-br from-red-400 via-blue-400 to-green-400 ${
                !activeColor ? 'border-white scale-110' : 'border-[#2A2A2A]'
              }`} />
            {COLORS.map(c => (
              <button key={c.value} onClick={() => onColorChange(activeColor === c.value ? null : c.value)} title={c.label}
                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all ${
                  activeColor === c.value ? 'border-white scale-110' : 'border-[#2A2A2A]'
                } ${c.value === 'white' ? '!border-[#3A3A3A]' : ''}`}
                style={{ backgroundColor: c.hex }} />
            ))}
          </div>

          {/* Seasons */}
          <div className="flex gap-2 flex-wrap">
            {SEASONS.map(s => (
              <button key={s.value} onClick={() => onSeasonChange(activeSeason === s.value ? null : s.value)}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  activeSeason === s.value ? 'bg-white text-black' : 'bg-[#1A1A1A] text-[#666666] border border-[#2A2A2A]'
                }`}>
                <span>{s.icon}</span>{s.label}
              </button>
            ))}
          </div>

          {/* Occasions */}
          <div className="flex gap-2 flex-wrap">
            {OCCASIONS.map(o => (
              <button key={o.value} onClick={() => onOccasionChange(activeOccasion === o.value ? null : o.value)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  activeOccasion === o.value ? 'bg-white text-black' : 'bg-[#1A1A1A] text-[#666666] border border-[#2A2A2A]'
                }`}>{o.label}</button>
            ))}
          </div>

          {(activeColor || activeSeason || activeOccasion) && (
            <button onClick={clearAll} className="flex items-center gap-1 text-[#555555] text-xs hover:text-white transition-colors">
              <X size={12} /> Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}
