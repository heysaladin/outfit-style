'use client'

import { useTransition, useRef, useState } from 'react'
import { X, ImagePlus, ChevronDown, ChevronUp } from 'lucide-react'
import { uploadItem } from '@/app/actions'
import { CATEGORY_TREE, COLORS, SEASONS, OCCASIONS, getCategoryDef, getSubcategoryDef } from '@/lib/types'

interface UploadModalProps {
  open: boolean
  onClose: () => void
}

export function UploadModal({ open, onClose }: UploadModalProps) {
  const [isPending, startTransition] = useTransition()
  const [preview, setPreview] = useState<string | null>(null)
  const [category, setCategory] = useState('')
  const [subcategory, setSubcategory] = useState('')
  const [itemType, setItemType] = useState('')
  const [color, setColor] = useState('')
  const [seasons, setSeasons] = useState<string[]>([])
  const [occasions, setOccasions] = useState<string[]>([])
  const [moreOpen, setMoreOpen] = useState(false)
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

  function reset() {
    formRef.current?.reset()
    setPreview(null); setCategory(''); setSubcategory(''); setItemType('')
    setColor(''); setSeasons([]); setOccasions([]); setMoreOpen(false); setError('')
  }

  function handleClose() { reset(); onClose() }

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
    if (itemType) formData.set('item_type', itemType)
    formData.set('color', color)
    formData.delete('seasons')
    seasons.forEach(s => formData.append('seasons', s))
    formData.delete('occasions')
    occasions.forEach(o => formData.append('occasions', o))

    startTransition(async () => {
      const result = await uploadItem(formData)
      if (result?.error) setError(result.error)
      else handleClose()
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-end" onClick={handleClose}>
      <div
        className="w-full bg-[#0F0F0F] rounded-t-3xl max-h-[95vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-[#2A2A2A] rounded-full mx-auto mt-3 mb-1" />
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#1F1F1F]">
          <h2 className="text-white font-bold text-base">Add Clothing</h2>
          <button onClick={handleClose} className="text-[#555555] hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="p-5 space-y-5 pb-8">
          {/* Image picker */}
          <label className="block cursor-pointer">
            <input type="file" name="image" accept="image/*" required className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) setPreview(URL.createObjectURL(f)) }} />
            {preview ? (
              <div className="relative mx-auto w-36 aspect-[3/4] rounded-2xl overflow-hidden border border-[#2A2A2A]">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs font-medium">Change</p>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-[#2A2A2A] rounded-2xl p-8 text-center hover:border-[#3A3A3A] transition-colors">
                <ImagePlus size={28} className="mx-auto mb-2 text-[#444444]" />
                <p className="text-[#666666] text-sm">Tap to select photo</p>
              </div>
            )}
          </label>

          {/* Name */}
          <input type="text" name="name" placeholder="Item name" required
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white placeholder-[#444444] text-sm outline-none focus:border-[#3A3A3A]" />

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
                <input type="text" name="brand" placeholder="Brand (optional)"
                  className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white placeholder-[#444444] text-sm outline-none focus:border-[#3A3A3A]" />
                <input type="number" name="price" placeholder="Price (optional)" min="0" step="0.01"
                  className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white placeholder-[#444444] text-sm outline-none focus:border-[#3A3A3A]" />
              </div>

              {/* Tags */}
              <input type="text" name="tags" placeholder="Tags: vintage, oversized, fav… (comma separated)"
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white placeholder-[#444444] text-sm outline-none focus:border-[#3A3A3A]" />
            </div>
          )}

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button type="submit" disabled={isPending}
            className="w-full bg-white text-black font-semibold py-3.5 rounded-xl text-sm disabled:opacity-40 transition-opacity">
            {isPending ? 'Uploading...' : 'Add to Wardrobe'}
          </button>
        </form>
      </div>
    </div>
  )
}
