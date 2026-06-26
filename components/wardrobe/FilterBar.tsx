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
  showVerified: boolean
  showDraft: boolean
  onCategoryChange: (v: string | null) => void
  onSubcategoryChange: (v: string | null) => void
  onColorChange: (v: string | null) => void
  onSeasonChange: (v: string | null) => void
  onOccasionChange: (v: string | null) => void
  onShowVerifiedChange: (v: boolean) => void
  onShowDraftChange: (v: boolean) => void
}

export function FilterBar({
  activeCategory, activeSubcategory, activeColor, activeSeason, activeOccasion,
  showVerified, showDraft,
  onCategoryChange, onSubcategoryChange, onColorChange, onSeasonChange, onOccasionChange,
  onShowVerifiedChange, onShowDraftChange,
}: FilterBarProps) {
  const [expanded, setExpanded] = useState(false)
  const catDef = getCategoryDef(activeCategory ?? '')
  const hasSubcategories = (catDef?.subcategories.length ?? 0) > 0
  const activeCount = [activeColor, activeSeason, activeOccasion].filter(Boolean).length

  function clearAll() {
    onCategoryChange(null); onSubcategoryChange(null); onColorChange(null)
    onSeasonChange(null); onOccasionChange(null)
    onShowVerifiedChange(true); onShowDraftChange(false)
  }

  return (
    <div className="border-b border-border px-5 py-3 space-y-3">
      {/* Category row */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1.5 overflow-x-auto flex-1" style={{ scrollbarWidth: 'none' }}>
          <button onClick={() => { onCategoryChange(null); onSubcategoryChange(null) }}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
              !activeCategory
                ? 'bg-foreground text-background'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}>All</button>
          {CATEGORY_TREE.map(cat => (
            <button key={cat.value} onClick={() => {
              onCategoryChange(activeCategory === cat.value ? null : cat.value)
              onSubcategoryChange(null)
            }}
              className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                activeCategory === cat.value
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}>
              <span>{cat.icon}</span>{cat.label}
            </button>
          ))}
        </div>
        <button onClick={() => setExpanded(v => !v)}
          className={`flex-shrink-0 relative w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            expanded || activeCount > 0
              ? 'bg-foreground text-background'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}>
          <SlidersHorizontal size={13} />
          {activeCount > 0 && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary text-primary-foreground text-[8px] font-bold rounded-full flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* Subcategory row */}
      {activeCategory && hasSubcategories && (
        <div className="flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <button onClick={() => onSubcategoryChange(null)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
              !activeSubcategory ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}>All</button>
          {catDef!.subcategories.map(sub => (
            <button key={sub.value} onClick={() => onSubcategoryChange(activeSubcategory === sub.value ? null : sub.value)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                activeSubcategory === sub.value ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}>{sub.label}</button>
          ))}
        </div>
      )}

      {/* Status — always visible */}
      <div className="flex gap-1.5">
        <button onClick={() => onShowVerifiedChange(!showVerified)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
            showVerified ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}>
          <span className={`w-2.5 h-2.5 rounded-full ${showVerified ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
          Verified
        </button>
        <button onClick={() => onShowDraftChange(!showDraft)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
            showDraft ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}>
          <span className={`w-2.5 h-2.5 rounded-full ${showDraft ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
          Draft
        </button>
      </div>

      {/* Expanded filters */}
      {expanded && (
        <div className="space-y-4 pt-1">
          {/* Colors */}
          <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            <button onClick={() => onColorChange(null)} title="All"
              className={`flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all bg-gradient-to-br from-red-400 via-blue-400 to-green-400 ${
                !activeColor ? 'border-foreground scale-110' : 'border-transparent'
              }`} />
            {COLORS.map(c => (
              <button key={c.value} onClick={() => onColorChange(activeColor === c.value ? null : c.value)} title={c.label}
                className={`flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all ${
                  activeColor === c.value ? 'border-foreground scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: c.hex }} />
            ))}
          </div>

          {/* Seasons */}
          <div className="flex gap-1.5 flex-wrap">
            {SEASONS.map(s => (
              <button key={s.value} onClick={() => onSeasonChange(activeSeason === s.value ? null : s.value)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                  activeSeason === s.value ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}>
                <span>{s.icon}</span>{s.label}
              </button>
            ))}
          </div>

          {/* Occasions */}
          <div className="flex gap-1.5 flex-wrap">
            {OCCASIONS.map(o => (
              <button key={o.value} onClick={() => onOccasionChange(activeOccasion === o.value ? null : o.value)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                  activeOccasion === o.value ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}>{o.label}</button>
          ))}
          </div>

          {(activeColor || activeSeason || activeOccasion) && (
            <button onClick={clearAll} className="flex items-center gap-1 text-muted-foreground text-[11px] hover:text-foreground transition-colors">
              <X size={11} /> Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}
