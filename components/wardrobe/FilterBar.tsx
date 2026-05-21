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
  const activeCount = [activeColor, activeSeason, activeOccasion].filter(Boolean).length + (showDraft ? 1 : 0) + (!showVerified ? 1 : 0)

  function clearAll() {
    onCategoryChange(null); onSubcategoryChange(null); onColorChange(null)
    onSeasonChange(null); onOccasionChange(null)
    onShowVerifiedChange(true); onShowDraftChange(false)
  }

  return (
    <div className="border-b border-border px-4 py-3 space-y-3">
      {/* Category row */}
      <div className="flex items-center gap-2">
        <div className="flex gap-2 overflow-x-auto flex-1" style={{ scrollbarWidth: 'none' }}>
          <button onClick={() => { onCategoryChange(null); onSubcategoryChange(null) }}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all ${
              !activeCategory
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground border border-border'
            }`}>All</button>
          {CATEGORY_TREE.map(cat => (
            <button key={cat.value} onClick={() => {
              onCategoryChange(activeCategory === cat.value ? null : cat.value)
              onSubcategoryChange(null)
            }}
              className={`flex-shrink-0 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                activeCategory === cat.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground border border-border'
              }`}>
              <span>{cat.icon}</span>{cat.label}
            </button>
          ))}
        </div>
        <button onClick={() => setExpanded(v => !v)}
          className={`flex-shrink-0 relative w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            expanded || activeCount > 0
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground border border-border'
          }`}>
          <SlidersHorizontal size={14} />
          {activeCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center border border-background">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* Subcategory row */}
      {activeCategory && hasSubcategories && (
        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <button onClick={() => onSubcategoryChange(null)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all ${
              !activeSubcategory ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground border border-border'
            }`}>All</button>
          {catDef!.subcategories.map(sub => (
            <button key={sub.value} onClick={() => onSubcategoryChange(activeSubcategory === sub.value ? null : sub.value)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                activeSubcategory === sub.value ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground border border-border'
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
                !activeColor ? 'border-primary scale-110' : 'border-border'
              }`} />
            {COLORS.map(c => (
              <button key={c.value} onClick={() => onColorChange(activeColor === c.value ? null : c.value)} title={c.label}
                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all ${
                  activeColor === c.value ? 'border-primary scale-110' : 'border-border'
                }`}
                style={{ backgroundColor: c.hex }} />
            ))}
          </div>

          {/* Seasons */}
          <div className="flex gap-2 flex-wrap">
            {SEASONS.map(s => (
              <button key={s.value} onClick={() => onSeasonChange(activeSeason === s.value ? null : s.value)}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  activeSeason === s.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground border border-border'
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
                  activeOccasion === o.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground border border-border'
                }`}>{o.label}</button>
            ))}
          </div>

          {/* Status */}
          <div className="flex gap-2">
            <button onClick={() => onShowVerifiedChange(!showVerified)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                showVerified ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30' : 'bg-muted text-muted-foreground border-border'
              }`}>
              <span className={`w-3 h-3 rounded-full border flex items-center justify-center ${showVerified ? 'bg-emerald-500 border-emerald-500' : 'border-muted-foreground/40'}`}>
                {showVerified && <svg width="7" height="5" viewBox="0 0 7 5" fill="none"><path d="M1 2.5L2.5 4L6 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </span>
              Verified
            </button>
            <button onClick={() => onShowDraftChange(!showDraft)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                showDraft ? 'bg-amber-400/15 text-amber-500 border-amber-400/30' : 'bg-muted text-muted-foreground border-border'
              }`}>
              <span className={`w-3 h-3 rounded-full border flex items-center justify-center ${showDraft ? 'bg-amber-400 border-amber-400' : 'border-muted-foreground/40'}`}>
                {showDraft && <svg width="7" height="5" viewBox="0 0 7 5" fill="none"><path d="M1 2.5L2.5 4L6 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </span>
              Draft
            </button>
          </div>

          {(activeColor || activeSeason || activeOccasion || showDraft || !showVerified) && (
            <button onClick={clearAll} className="flex items-center gap-1 text-muted-foreground text-xs hover:text-foreground transition-colors">
              <X size={12} /> Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}
