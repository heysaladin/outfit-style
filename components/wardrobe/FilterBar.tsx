'use client'

import { useState } from 'react'
import { SlidersHorizontal, X, ArrowUpDown } from 'lucide-react'
import { CATEGORY_TREE, COLORS, SEASONS, OCCASIONS, getCategoryDef } from '@/lib/types'
import { MobileChip } from 'cubicle-ds/src/components/mobileapp/MobileChip'

type SortKey = 'wear_asc' | 'wear_desc' | 'price_asc' | 'price_desc' | 'date_asc' | 'date_desc'

const SORT_GROUPS: { label: string; options: { key: SortKey; desc: string }[] }[] = [
  { label: 'Wear',  options: [{ key: 'wear_asc',   desc: 'Least worn first' }, { key: 'wear_desc',  desc: 'Most worn first'      }] },
  { label: 'Price', options: [{ key: 'price_desc',  desc: 'Most expensive'   }, { key: 'price_asc',  desc: 'Cheapest first'       }] },
  { label: 'Date',  options: [{ key: 'date_desc',   desc: 'Newest first'     }, { key: 'date_asc',   desc: 'Oldest first'         }] },
]

const SORT_LABEL: Record<SortKey, string> = {
  wear_asc: 'Wear ↑', wear_desc: 'Wear ↓',
  price_asc: 'Price ↑', price_desc: 'Price ↓',
  date_asc: 'Date ↑', date_desc: 'Date ↓',
}

interface FilterBarProps {
  activeCategory: string | null
  activeSubcategory: string | null
  activeColor: string | null
  activeSeason: string | null
  activeOccasion: string | null
  showVerified: boolean
  showDraft: boolean
  sort: SortKey
  onSortChange: (v: SortKey) => void
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
  showVerified, showDraft, sort, onSortChange,
  onCategoryChange, onSubcategoryChange, onColorChange, onSeasonChange, onOccasionChange,
  onShowVerifiedChange, onShowDraftChange,
}: FilterBarProps) {
  const [expanded, setExpanded] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
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
          <MobileChip
            label="All"
            type="filter"
            selected={!activeCategory}
            onSelect={() => { onCategoryChange(null); onSubcategoryChange(null) }}
          />
          {CATEGORY_TREE.map(cat => (
            <MobileChip
              key={cat.value}
              label={cat.label}
              type="filter"
              icon={<span>{cat.icon}</span>}
              selected={activeCategory === cat.value}
              onSelect={sel => {
                onCategoryChange(sel ? cat.value : null)
                onSubcategoryChange(null)
              }}
            />
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
          <MobileChip
            label="All"
            type="filter"
            selected={!activeSubcategory}
            onSelect={() => onSubcategoryChange(null)}
          />
          {catDef!.subcategories.map(sub => (
            <MobileChip
              key={sub.value}
              label={sub.label}
              type="filter"
              selected={activeSubcategory === sub.value}
              onSelect={sel => onSubcategoryChange(sel ? sub.value : null)}
            />
          ))}
        </div>
      )}

      {/* Status — always visible */}
      <div className="flex gap-1.5 items-center">
        <MobileChip
          label="Verified"
          type="filter"
          selected={showVerified}
          onSelect={onShowVerifiedChange}
        />
        <MobileChip
          label="Draft"
          type="filter"
          selected={showDraft}
          onSelect={onShowDraftChange}
        />

        {/* Sort button */}
        <div className="relative ml-auto">
          <button
            onClick={() => setSortOpen(v => !v)}
            className={`flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium border transition-all ${
              sortOpen ? 'bg-foreground text-background border-foreground' : 'bg-background text-muted-foreground border-border'
            }`}
          >
            <ArrowUpDown size={11} />
            {SORT_LABEL[sort]}
          </button>

          {sortOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
              <div className="absolute right-0 top-full mt-1.5 z-20 bg-card border border-border rounded-xl shadow-md overflow-hidden min-w-[180px]">
                {SORT_GROUPS.map((group, gi) => (
                  <div key={group.label}>
                    {gi > 0 && <div className="border-t border-border mx-3" />}
                    <div className="px-3.5 pt-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{group.label}</div>
                    {group.options.map(opt => (
                      <button
                        key={opt.key}
                        onClick={() => { onSortChange(opt.key); setSortOpen(false) }}
                        className="w-full flex items-center justify-between gap-3 px-3.5 py-2 text-left hover:bg-muted transition-colors"
                      >
                        <span className="text-[13px] font-medium text-foreground">{opt.desc}</span>
                        {sort === opt.key && (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-foreground">
                            <path d="M20 6L9 17l-5-5"/>
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                ))}
                <div className="pb-1" />
              </div>
            </>
          )}
        </div>
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
              <MobileChip
                key={s.value}
                label={s.label}
                type="filter"
                icon={<span>{s.icon}</span>}
                selected={activeSeason === s.value}
                onSelect={sel => onSeasonChange(sel ? s.value : null)}
              />
            ))}
          </div>

          {/* Occasions */}
          <div className="flex gap-1.5 flex-wrap">
            {OCCASIONS.map(o => (
              <MobileChip
                key={o.value}
                label={o.label}
                type="filter"
                selected={activeOccasion === o.value}
                onSelect={sel => onOccasionChange(sel ? o.value : null)}
              />
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
