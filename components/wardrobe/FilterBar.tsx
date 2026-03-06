'use client'

import { CATEGORIES, COLORS } from '@/lib/types'

interface FilterBarProps {
  activeCategory: string | null
  activeColor: string | null
  onCategoryChange: (cat: string | null) => void
  onColorChange: (color: string | null) => void
}

export function FilterBar({ activeCategory, activeColor, onCategoryChange, onColorChange }: FilterBarProps) {
  return (
    <div className="border-b border-[#1F1F1F] px-4 py-3 space-y-3">
      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        <button
          onClick={() => onCategoryChange(null)}
          className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all ${
            activeCategory === null
              ? 'bg-white text-black'
              : 'bg-[#1A1A1A] text-[#666666] border border-[#2A2A2A] hover:border-[#3A3A3A]'
          }`}
        >
          All
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => onCategoryChange(activeCategory === cat.value ? null : cat.value)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all ${
              activeCategory === cat.value
                ? 'bg-white text-black'
                : 'bg-[#1A1A1A] text-[#666666] border border-[#2A2A2A] hover:border-[#3A3A3A]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Color dots */}
      <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        <button
          onClick={() => onColorChange(null)}
          title="All colors"
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all bg-gradient-to-br from-red-400 via-blue-400 to-green-400 ${
            activeColor === null ? 'border-white scale-110' : 'border-[#2A2A2A]'
          }`}
        />
        {COLORS.map(color => (
          <button
            key={color.value}
            onClick={() => onColorChange(activeColor === color.value ? null : color.value)}
            title={color.label}
            className={`flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all ${
              activeColor === color.value ? 'border-white scale-110' : 'border-[#2A2A2A]'
            } ${color.value === 'white' ? 'border-[#3A3A3A]' : ''}`}
            style={{ backgroundColor: color.hex }}
          />
        ))}
      </div>
    </div>
  )
}
