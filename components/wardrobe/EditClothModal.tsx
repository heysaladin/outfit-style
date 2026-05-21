'use client'

import { useTransition, useRef, useState } from 'react'
import { X, ChevronDown, ChevronUp, Camera, Link } from 'lucide-react'
import { updateItem } from '@/app/actions'
import { CATEGORY_TREE, COLORS, SEASONS, OCCASIONS, getCategoryDef, getSubcategoryDef, type WardrobeItem } from '@/lib/types'

interface EditClothModalProps {
  item: WardrobeItem
  onClose: () => void
}

const inputCls = 'w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground text-base outline-none focus:border-primary transition-colors'
const chipActive = 'bg-primary text-primary-foreground'
const chipInactive = 'bg-muted text-muted-foreground border border-border'

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
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [showUrlInput, setShowUrlInput] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImageUrlInput('')
    setShowUrlInput(false)
    setImagePreview(URL.createObjectURL(file))
  }

  function handleUrlApply() {
    if (!imageUrlInput.startsWith('https://')) {
      setError('Image URL must start with https://')
      return
    }
    setImageFile(null)
    setImagePreview(imageUrlInput)
    setError('')
  }

  const catDef = getCategoryDef(category)
  const subDef = getSubcategoryDef(category, subcategory)
  const availableTypes = subcategory ? (subDef?.types ?? []) : (catDef?.types ?? [])
  const hasSubcategories = (catDef?.subcategories.length ?? 0) > 0

  function pickCategory(val: string) { setCategory(val); setSubcategory(''); setItemType('') }
  function pickSubcategory(val: string) { setSubcategory(val); setItemType('') }
  function toggleSeason(v: string) { setSeasons(s => s.includes(v) ? s.filter(x => x !== v) : [...s, v]) }
  function toggleOccasion(v: string) { setOccasions(s => s.includes(v) ? s.filter(x => x !== v) : [...s, v]) }

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
    if (imageFile) formData.set('image', imageFile)
    else formData.delete('image')
    if (imageUrlInput && !imageFile) formData.set('image_url_input', imageUrlInput)
    else formData.delete('image_url_input')

    startTransition(async () => {
      const result = await updateItem(item.id, formData)
      if (result?.error) setError(result.error)
      else onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 flex items-end" onClick={onClose}>
      <div
        className="w-full bg-background rounded-t-3xl max-h-[95vh] overflow-y-auto border-t border-border"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3 mb-1" />
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h2 className="text-foreground font-bold text-base">Edit Clothing</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Image editor */}
        <div className="mx-5 mt-4 space-y-2">
          <div className="flex items-end gap-3">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-muted border border-border flex-shrink-0">
              <img
                src={imagePreview ?? item.image_url}
                alt={item.name}
                className="w-full h-full object-contain"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
              >
                <Camera size={18} className="text-white" />
              </button>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 bg-muted border border-border rounded-lg text-muted-foreground text-xs flex items-center gap-1.5 hover:border-primary/50 hover:text-foreground transition-colors"
              >
                <Camera size={12} /> Upload
              </button>
              <button
                type="button"
                onClick={() => setShowUrlInput(v => !v)}
                className="px-3 py-2 bg-muted border border-border rounded-lg text-muted-foreground text-xs flex items-center gap-1.5 hover:border-primary/50 hover:text-foreground transition-colors"
              >
                <Link size={12} /> URL
              </button>
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          {showUrlInput && (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://..."
                value={imageUrlInput}
                onChange={e => setImageUrlInput(e.target.value)}
                className="flex-1 bg-muted border border-border rounded-xl px-3 py-2 text-foreground placeholder:text-muted-foreground text-base outline-none focus:border-primary transition-colors"
              />
              <button
                type="button"
                onClick={handleUrlApply}
                className="px-3 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium"
              >
                Apply
              </button>
            </div>
          )}
          {imagePreview && (
            <p className="text-muted-foreground text-xs">New image selected — save to apply</p>
          )}
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="p-5 space-y-5 pb-8">
          {/* Name */}
          <input
            type="text"
            name="name"
            placeholder="Item name"
            defaultValue={item.name}
            required
            className={inputCls}
          />

          {/* Category */}
          <div>
            <p className="text-muted-foreground text-xs font-medium mb-2">Category</p>
            <div className="grid grid-cols-5 gap-2">
              {CATEGORY_TREE.map(cat => (
                <button type="button" key={cat.value} onClick={() => pickCategory(cat.value)}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-medium transition-all border ${
                    category === cat.value ? chipActive + ' border-primary' : chipInactive
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
              <p className="text-muted-foreground text-xs font-medium mb-2">Subcategory</p>
              <div className="flex flex-wrap gap-2">
                {catDef!.subcategories.map(sub => (
                  <button type="button" key={sub.value} onClick={() => pickSubcategory(sub.value)}
                    className={`px-3 py-2 rounded-full text-xs font-medium transition-all ${
                      subcategory === sub.value ? chipActive : chipInactive
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
              <p className="text-muted-foreground text-xs font-medium mb-2">Type</p>
              <div className="flex flex-wrap gap-2">
                {availableTypes.map(t => (
                  <button type="button" key={t.value} onClick={() => setItemType(t.value)}
                    className={`px-3 py-2 rounded-full text-xs font-medium transition-all ${
                      itemType === t.value ? chipActive : chipInactive
                    }`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color */}
          <div>
            <p className="text-muted-foreground text-xs font-medium mb-2">Color</p>
            <div className="flex flex-wrap gap-2.5">
              {COLORS.map(c => (
                <button type="button" key={c.value} onClick={() => setColor(c.value)} title={c.label}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === c.value ? 'border-primary scale-110' : 'border-border'
                  }`}
                  style={{ backgroundColor: c.hex }} />
              ))}
            </div>
          </div>

          {/* More details toggle */}
          <button type="button" onClick={() => setMoreOpen(v => !v)}
            className="flex items-center gap-2 text-muted-foreground text-xs font-medium hover:text-foreground transition-colors">
            {moreOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {moreOpen ? 'Less details' : 'More details (season, brand, price…)'}
          </button>

          {moreOpen && (
            <div className="space-y-4 pt-1">
              {/* Seasons */}
              <div>
                <p className="text-muted-foreground text-xs font-medium mb-2">Season</p>
                <div className="flex gap-2 flex-wrap">
                  {SEASONS.map(s => (
                    <button type="button" key={s.value} onClick={() => toggleSeason(s.value)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all ${
                        seasons.includes(s.value) ? chipActive : chipInactive
                      }`}>
                      <span>{s.icon}</span>{s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Occasions */}
              <div>
                <p className="text-muted-foreground text-xs font-medium mb-2">Occasion</p>
                <div className="flex gap-2 flex-wrap">
                  {OCCASIONS.map(o => (
                    <button type="button" key={o.value} onClick={() => toggleOccasion(o.value)}
                      className={`px-3 py-2 rounded-full text-xs font-medium transition-all ${
                        occasions.includes(o.value) ? chipActive : chipInactive
                      }`}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand + Price */}
              <div className="grid grid-cols-2 gap-3">
                <input type="text" name="brand" placeholder="Brand (optional)" defaultValue={item.brand ?? ''}
                  className="bg-muted border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground text-base outline-none focus:border-primary transition-colors" />
                <input type="number" name="price" placeholder="Price (optional)" min="0" step="0.01"
                  defaultValue={item.price ?? ''}
                  className="bg-muted border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground text-base outline-none focus:border-primary transition-colors" />
              </div>

              {/* Tags */}
              <input type="text" name="tags" placeholder="Tags: vintage, oversized, fav… (comma separated)"
                defaultValue={item.tags?.join(', ') ?? ''}
                className={inputCls} />
            </div>
          )}

          {error && <p className="text-destructive text-xs font-medium">{error}</p>}

          <button type="submit" disabled={isPending}
            className="w-full bg-primary text-primary-foreground font-semibold py-3.5 rounded-xl text-sm disabled:opacity-40 transition-opacity hover:opacity-90">
            {isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
