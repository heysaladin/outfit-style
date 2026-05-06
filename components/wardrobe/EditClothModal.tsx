'use client'

import { useTransition, useRef, useState } from 'react'
import { X, ChevronDown, ChevronUp } from 'lucide-react'
import { updateItem } from '@/app/actions'
import { CATEGORY_TREE, COLORS, SEASONS, OCCASIONS, getCategoryDef, getSubcategoryDef, type WardrobeItem } from '@/lib/types'

interface EditClothModalProps {
  item: WardrobeItem
  onClose: () => void
}

export function EditClothModal({ item, onClose }: EditClothModalProps) {
  const [isPending, startTransition] = useTransition()
  const [category, setCategory] = useState(item.category)
  const [subcategory, setSubcategory] = useState(item.subcategory ?? '')
  const [itemType, setItemType] = useState(item.item_type ?? '')
  const [color, setColor] = useState(item.color)
  const [seasons, setSeasons] = useState<string[]>(item.seasons ?? [])
  const [occasions, setOccasions] = useState<string[]>(item.occasions ?? [])
  const [moreOpen, setMoreOpen] = useState(
    !!(item.seasons?.length || item.occasions?.length || item.brand || item.price || item.tags?.length)
  )
  const [error, setError] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  const catDef = getCategoryDef(category)
  const subDef = getSubcategoryDef(category, subcategory)
  const availableTypes = subcategory ? (subDef?.types ?? []) : (catDef?.types ?? [])
  const hasSubcategories = (catDef?.subcategories.length ?? 0) > 0

  function pickCategory(val: string) {
    setCategory(val)
    setSubcategory('')
    setItemType('')
  }
  function pickSubcategory(val: string) {
    setSubcategory(val)
    setItemType('')
  }
  function toggleSeason(v: string) {
    setSeasons(s => s.includes(v) ? s.filter(x => x !== v) : [...s, v])
  }
  function toggleOccasion(v: string) {
    setOccasions(s => s.includes(v) ? s.filter(x => x !== v) : [...s, v])
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!category) return setError('Please select a category')
    if (hasSubcategories && !subcategory) return setError('Please select a subcategory')
    if (availableTypes.length > 0 && !itemType) return setError('Please select a type')
    if (!color) return setError('Please select a color')
    setError('')

    const formData = new FormData(e.currentTarget)
    formData.set('category', category)
    if (subcategory) formData.set('subcategory', subcategory)
    else formData.delete('subcategory')
    if (itemType) formData.set('item_type', itemType)
    else formData.delete('item_type')
    formData.set('color', color)
    formData.delete('seasons')
    seasons.forEach(s => formData.append('seasons', s))
    formData.delete('occasions')
    occasions.forEach(o => formData.append('occasions', o))

    startTransition(async () => {
      const result = await updateItem(item.id, formData)
      if (result?.error) setError(result.error)
      else onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 flex items-end" onClick={onClose}>
      <div
        className="w-full bg-[#0F0F0F] rounded-t-3xl max-h-[95vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-[#2A2A2A] rounded-full mx-auto mt-3 mb-1" />
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#1F1F1F]">
          <h2 className="text-white font-bold text-base">Edit Clothing</h2>
          <button onClick={onClose} className="text-[#555555] hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Current image preview */}
        <div className="mx-5 mt-4">
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#1A1A1A] border border-[#2A2A2A]">
            <img src={item.image_url} alt={item.name} className="w-full h-full object-contain" />
          </div>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="p-5 space-y-5 pb-8">
          {/* Name */}
          <input
            type="text"
            name="name"
            placeholder="Item name"
            defaultValue={item.name}
            required
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white placeholder-[#444444] text-sm outline-none focus:border-[#3A3A3A]"
          />

          {/* Category */}
          <div>
            <p className="text-[#666666] text-xs font-medium mb-2">Category</p>
            <div className="grid grid-cols-5 gap-2">
              {CATEGORY_TREE.map(cat => (
                <button type="button" key={cat.value} onClick={() => pickCategory(cat.value)}
                  className={`flex flex-col items-center gap-1 py-2 rounded-xl text-xs font-medium transition-all border ${
                    category === cat.value
                      ? 'bg-white text-black border-white'
                      : 'bg-[#1A1A1A] text-[#666666] border-[#2A2A2A]'
                  }`}>
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-[10px]">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Subcategory */}
          {category && hasSubcategories && (
            <div>
              <p className="text-[#666666] text-xs font-medium mb-2">Subcategory</p>
              <div className="flex flex-wrap gap-2">
                {catDef!.subcategories.map(sub => (
                  <button type="button" key={sub.value} onClick={() => pickSubcategory(sub.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      subcategory === sub.value ? 'bg-white text-black' : 'bg-[#1A1A1A] text-[#666666] border border-[#2A2A2A]'
                    }`}>
                    {sub.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Item Type */}
          {category && availableTypes.length > 0 && (!hasSubcategories || subcategory) && (
            <div>
              <p className="text-[#666666] text-xs font-medium mb-2">Type</p>
              <div className="flex flex-wrap gap-2">
                {availableTypes.map(t => (
                  <button type="button" key={t.value} onClick={() => setItemType(t.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      itemType === t.value ? 'bg-white text-black' : 'bg-[#1A1A1A] text-[#666666] border border-[#2A2A2A]'
                    }`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color */}
          <div>
            <p className="text-[#666666] text-xs font-medium mb-2">Color</p>
            <div className="flex flex-wrap gap-2.5">
              {COLORS.map(c => (
                <button type="button" key={c.value} onClick={() => setColor(c.value)} title={c.label}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${
                    color === c.value ? 'border-white scale-110' : 'border-[#2A2A2A]'
                  } ${c.value === 'white' ? '!border-[#3A3A3A]' : ''}`}
                  style={{ backgroundColor: c.hex }} />
              ))}
            </div>
          </div>

          {/* More details toggle */}
          <button type="button" onClick={() => setMoreOpen(v => !v)}
            className="flex items-center gap-2 text-[#666666] text-xs font-medium hover:text-white transition-colors">
            {moreOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {moreOpen ? 'Less details' : 'More details (season, brand, price…)'}
          </button>

          {moreOpen && (
            <div className="space-y-4 pt-1">
              {/* Seasons */}
              <div>
                <p className="text-[#666666] text-xs font-medium mb-2">Season</p>
                <div className="flex gap-2 flex-wrap">
                  {SEASONS.map(s => (
                    <button type="button" key={s.value} onClick={() => toggleSeason(s.value)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        seasons.includes(s.value) ? 'bg-white text-black' : 'bg-[#1A1A1A] text-[#666666] border border-[#2A2A2A]'
                      }`}>
                      <span>{s.icon}</span>{s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Occasions */}
              <div>
                <p className="text-[#666666] text-xs font-medium mb-2">Occasion</p>
                <div className="flex gap-2 flex-wrap">
                  {OCCASIONS.map(o => (
                    <button type="button" key={o.value} onClick={() => toggleOccasion(o.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        occasions.includes(o.value) ? 'bg-white text-black' : 'bg-[#1A1A1A] text-[#666666] border border-[#2A2A2A]'
                      }`}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand + Price */}
              <div className="grid grid-cols-2 gap-3">
                <input type="text" name="brand" placeholder="Brand (optional)" defaultValue={item.brand ?? ''}
                  className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white placeholder-[#444444] text-sm outline-none focus:border-[#3A3A3A]" />
                <input type="number" name="price" placeholder="Price (optional)" min="0" step="0.01"
                  defaultValue={item.price ?? ''}
                  className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white placeholder-[#444444] text-sm outline-none focus:border-[#3A3A3A]" />
              </div>

              {/* Tags */}
              <input type="text" name="tags" placeholder="Tags: vintage, oversized, fav… (comma separated)"
                defaultValue={item.tags?.join(', ') ?? ''}
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white placeholder-[#444444] text-sm outline-none focus:border-[#3A3A3A]" />
            </div>
          )}

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button type="submit" disabled={isPending}
            className="w-full bg-white text-black font-semibold py-3.5 rounded-xl text-sm disabled:opacity-40 transition-opacity">
            {isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
