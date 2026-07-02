'use client'

import { useTransition, useRef, useState } from 'react'
import { X, ImagePlus, ChevronDown, ChevronUp, Link } from 'lucide-react'
import { uploadItem } from '@/app/actions'
import { CATEGORY_TREE, COLORS, SEASONS, OCCASIONS, getCategoryDef, getSubcategoryDef } from '@/lib/types'

interface UploadModalProps {
  open: boolean
  onClose: () => void
}

const inputCls = 'w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground text-base outline-none focus:border-primary transition-colors'
const chipActive = 'bg-primary text-primary-foreground'
const chipInactive = 'bg-muted text-muted-foreground border border-border'

export function UploadModal({ open, onClose }: UploadModalProps) {
  const [isPending, startTransition] = useTransition()
  const [preview, setPreview] = useState<string | null>(null)
  const [useImageUrl, setUseImageUrl] = useState(false)
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [draggedUrl, setDraggedUrl] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
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

  function pickCategory(val: string) { setCategory(val); setSubcategory(''); setItemType('') }
  function pickSubcategory(val: string) { setSubcategory(val); setItemType('') }
  function toggleSeason(v: string) { setSeasons(s => s.includes(v) ? s.filter(x => x !== v) : [...s, v]) }
  function toggleOccasion(v: string) { setOccasions(s => s.includes(v) ? s.filter(x => x !== v) : [...s, v]) }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragOver(false)

    if (e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith('image/')) {
        setDraggedUrl(null)
        setPreview(URL.createObjectURL(file))
        const dt = new DataTransfer()
        dt.items.add(file)
        const fileInput = formRef.current?.querySelector<HTMLInputElement>('input[name="image"]')
        if (fileInput) fileInput.files = dt.files
        return
      }
    }

    const uri = e.dataTransfer.getData('text/uri-list')
    if (uri && uri.startsWith('http')) { setDraggedUrl(uri); setPreview(uri); return }

    const html = e.dataTransfer.getData('text/html')
    if (html) {
      const match = html.match(/src="([^"]+)"/)
      if (match?.[1] && match[1].startsWith('http')) { setDraggedUrl(match[1]); setPreview(match[1]) }
    }
  }

  function reset() {
    formRef.current?.reset()
    setPreview(null); setUseImageUrl(false); setImageUrlInput(''); setDraggedUrl(null)
    setCategory(''); setSubcategory(''); setItemType('')
    setColor(''); setSeasons([]); setOccasions([]); setMoreOpen(false); setError('')
  }

  function handleClose() { reset(); onClose() }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!category) return setError('Please select a category')
    if (hasSubcategories && !subcategory) return setError('Please select a subcategory')
    if (availableTypes.length > 0 && !itemType) return setError('Please select a type')
    if (!color) return setError('Please select a color')

    const resolvedUrl = useImageUrl ? imageUrlInput.trim() : draggedUrl
    if (resolvedUrl) {
      if (!resolvedUrl.startsWith('http')) return setError('Please enter a valid image URL')
    } else {
      const file = (e.currentTarget.querySelector('input[name="image"]') as HTMLInputElement)?.files?.[0]
      if (!file) return setError('Please add an image')
    }
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
    if (resolvedUrl) formData.set('image_url_input', resolvedUrl)

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
        className="w-full bg-background rounded-t-3xl max-h-[95vh] overflow-y-auto border-t border-border"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3 mb-1" />
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h2 className="text-foreground font-bold text-base">Add Clothing</h2>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={20} />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="p-5 space-y-5 pb-8">
          {/* Image picker */}
          <div className="space-y-2">
            <input type="file" name="image" accept="image/*" className="hidden" id="image-file-input"
              onChange={e => { const f = e.target.files?.[0]; if (f) { setDraggedUrl(null); setPreview(URL.createObjectURL(f)) } }} />

            {preview ? (
              <label htmlFor={useImageUrl ? undefined : 'image-file-input'} className={useImageUrl ? 'block' : 'block cursor-pointer'}>
                <div className="relative mx-auto w-36 aspect-[3/4] rounded-2xl overflow-hidden border border-border">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" onError={() => setPreview(null)} />
                  {!useImageUrl && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs font-medium">Change</p>
                    </div>
                  )}
                </div>
              </label>
            ) : (
              <label
                htmlFor="image-file-input"
                className={`block cursor-pointer border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
                  isDragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                }`}
                onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
              >
                <ImagePlus size={28} className="mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground text-sm">Tap or drop photo here</p>
                <p className="text-muted-foreground/60 text-xs mt-1">Drag from browser or files</p>
              </label>
            )}

            {/* Add image URL toggle */}
            <button
              type="button"
              onClick={() => { setUseImageUrl(v => !v); setPreview(null); setDraggedUrl(null); setImageUrlInput('') }}
              className="flex items-center justify-between w-full px-4 py-3 bg-muted border border-border rounded-xl mt-1"
            >
              <div className="flex items-center gap-2 text-foreground text-sm font-medium">
                <Link size={14} className="text-muted-foreground" />
                Add image URL
              </div>
              <div className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${useImageUrl ? 'bg-primary' : 'bg-border'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-200 ${useImageUrl ? 'left-5 bg-white' : 'left-1 bg-muted-foreground'}`} />
              </div>
            </button>

            {useImageUrl && (
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrlInput}
                onChange={e => { setImageUrlInput(e.target.value); setPreview(e.target.value.startsWith('http') ? e.target.value : null) }}
                className={inputCls}
                autoFocus
              />
            )}
          </div>

          {/* Name */}
          <input type="text" name="name" placeholder="Item name" required className={inputCls} />

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
                <input type="text" name="brand" placeholder="Brand (optional)"
                  className="bg-muted border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground text-base outline-none focus:border-primary transition-colors" />
                <input type="number" name="price" placeholder="Harga beli" min="0" step="0.01"
                  className="bg-muted border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground text-base outline-none focus:border-primary transition-colors" />
              </div>

              {/* Purchase Date */}
              <div>
                <p className="text-muted-foreground text-xs font-medium mb-2">Tanggal Beli</p>
                <input type="date" name="purchase_date"
                  className={inputCls} />
              </div>

              {/* Tags */}
              <input type="text" name="tags" placeholder="Tags: vintage, oversized, fav… (comma separated)"
                className={inputCls} />
            </div>
          )}

          {error && <p className="text-destructive text-xs font-medium">{error}</p>}

          <button type="submit" disabled={isPending}
            className="w-full bg-primary text-primary-foreground font-semibold py-3.5 rounded-xl text-sm disabled:opacity-40 transition-opacity hover:opacity-90">
            {isPending ? 'Uploading...' : 'Add to Wardrobe'}
          </button>
        </form>
      </div>
    </div>
  )
}
