'use client'

import { useTransition, useRef, useState } from 'react'
import { X, ImagePlus } from 'lucide-react'
import { uploadItem } from '@/app/actions'
import { CATEGORIES, COLORS } from '@/lib/types'

interface UploadModalProps {
  open: boolean
  onClose: () => void
}

export function UploadModal({ open, onClose }: UploadModalProps) {
  const [isPending, startTransition] = useTransition()
  const [preview, setPreview] = useState<string | null>(null)
  const [category, setCategory] = useState('')
  const [color, setColor] = useState('')
  const [error, setError] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  function reset() {
    formRef.current?.reset()
    setPreview(null)
    setCategory('')
    setColor('')
    setError('')
  }

  function handleClose() {
    reset()
    onClose()
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!category) return setError('Please select a category')
    if (!color) return setError('Please select a color')
    setError('')

    const formData = new FormData(e.currentTarget)
    formData.set('category', category)
    formData.set('color', color)

    startTransition(async () => {
      const result = await uploadItem(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        handleClose()
      }
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-end" onClick={handleClose}>
      <div
        className="w-full bg-[#0F0F0F] rounded-t-3xl max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-[#2A2A2A] rounded-full mx-auto mt-3 mb-1" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#1F1F1F]">
          <h2 className="text-white font-bold text-base">Add Clothing</h2>
          <button onClick={handleClose} className="text-[#555555] hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Image picker */}
          <label className="block cursor-pointer">
            <input
              type="file"
              name="image"
              accept="image/*"
              required
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) setPreview(URL.createObjectURL(file))
              }}
            />
            {preview ? (
              <div className="relative mx-auto w-40 aspect-[3/4] rounded-2xl overflow-hidden border border-[#2A2A2A]">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs font-medium">Change photo</p>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-[#2A2A2A] rounded-2xl p-10 text-center hover:border-[#3A3A3A] transition-colors">
                <ImagePlus size={28} className="mx-auto mb-2 text-[#444444]" />
                <p className="text-[#666666] text-sm">Tap to select photo</p>
              </div>
            )}
          </label>

          {/* Name */}
          <input
            type="text"
            name="name"
            placeholder="Item name (e.g. White T-Shirt)"
            required
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white placeholder-[#444444] text-sm outline-none focus:border-[#3A3A3A] transition-colors"
          />

          {/* Category */}
          <div>
            <p className="text-[#666666] text-xs font-medium mb-2">Category</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  type="button"
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    category === cat.value
                      ? 'bg-white text-black'
                      : 'bg-[#1A1A1A] text-[#666666] border border-[#2A2A2A] hover:border-[#3A3A3A]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <p className="text-[#666666] text-xs font-medium mb-2">Color</p>
            <div className="flex flex-wrap gap-2.5">
              {COLORS.map(c => (
                <button
                  type="button"
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  title={c.label}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${
                    color === c.value ? 'border-white scale-110' : 'border-[#2A2A2A]'
                  } ${c.value === 'white' ? 'border-[#3A3A3A]' : ''}`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          {/* Error */}
          {error && <p className="text-red-400 text-xs">{error}</p>}

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-white text-black font-semibold py-3.5 rounded-xl text-sm disabled:opacity-40 transition-opacity"
          >
            {isPending ? 'Uploading...' : 'Add to Wardrobe'}
          </button>
        </form>
      </div>
    </div>
  )
}
