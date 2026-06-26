'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Upload, Link } from 'lucide-react'
import { HOBBIES } from '@/lib/types'

interface AddGearModalProps {
  onClose: () => void
  defaultHobby?: string
  returnTo?: string
}

export function AddGearModal({ onClose, defaultHobby, returnTo }: AddGearModalProps) {
  const router                        = useRouter()
  const [hobby, setHobby]             = useState(defaultHobby ?? HOBBIES[0].value)
  const [preview, setPreview]         = useState<string | null>(null)
  const [useUrlInput, setUseUrlInput] = useState(false)
  const [imageUrl, setImageUrl]       = useState('')
  const [loading, setLoading]         = useState(false)
  const fileRef                       = useRef<HTMLInputElement>(null)
  const nameRef                       = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) setPreview(URL.createObjectURL(f))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const name = nameRef.current?.value?.trim()
    if (!name) return
    setLoading(true)
    const fd = new FormData()
    fd.append('name', name)
    fd.append('category', hobby)
    if (useUrlInput) fd.append('image_url', imageUrl)
    else if (fileRef.current?.files?.[0]) fd.append('image', fileRef.current.files[0])
    const notesEl = (e.target as HTMLFormElement).querySelector('textarea[name="notes"]') as HTMLTextAreaElement | null
    if (notesEl?.value) fd.append('notes', notesEl.value)
    const res = await fetch('/api/hobby-items', { method: 'POST', body: fd })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.error('hobby-items error:', err)
      setLoading(false)
      return
    }
    router.refresh()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="absolute inset-x-0 bottom-0 bg-background rounded-t-2xl max-h-[95vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background pt-3 pb-2 px-4 border-b border-border/40">
          <div className="w-8 h-1 bg-border rounded-full mx-auto mb-3" />
          <div className="flex items-center justify-between">
            <h2 className="text-foreground font-semibold text-base">Add Item</h2>
            <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg bg-muted hover:bg-accent flex items-center justify-center transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4 pb-10">

          {/* Hobby picker */}
          <div>
            <label className="text-muted-foreground text-xs font-medium mb-2 block">Hobby</label>
            <div className="grid grid-cols-4 gap-1.5">
              {HOBBIES.map(h => (
                <button
                  key={h.value}
                  type="button"
                  onClick={() => setHobby(h.value)}
                  className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl text-center transition-all border ${
                    hobby === h.value
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-muted text-muted-foreground border-transparent hover:border-border'
                  }`}
                >
                  <span className="text-xl leading-none">{h.icon}</span>
                  <span className="text-[9px] font-medium leading-tight">{h.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Image */}
          <div>
            <label className="text-muted-foreground text-xs font-medium mb-2 block">Photo</label>
            {!useUrlInput && (
              <div
                onClick={() => fileRef.current?.click()}
                className="relative aspect-video rounded-xl overflow-hidden bg-white border border-dashed border-border hover:border-foreground/40 transition-colors cursor-pointer flex items-center justify-center"
              >
                {preview ? (
                  <img src={preview} alt="preview" className="absolute inset-0 w-full h-full object-contain" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Upload size={20} />
                    <span className="text-xs">Tap to upload photo</span>
                  </div>
                )}
              </div>
            )}
            <input ref={fileRef} name="image" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

            <button
              type="button"
              onClick={() => { setUseUrlInput(v => !v); setPreview(null); setImageUrl('') }}
              className="flex items-center justify-between w-full px-3.5 py-2.5 bg-muted rounded-xl mt-2"
            >
              <div className="flex items-center gap-2 text-foreground text-xs font-medium">
                <Link size={13} className="text-muted-foreground" />
                Add image from URL
              </div>
              <div className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${useUrlInput ? 'bg-primary' : 'bg-border'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200 ${useUrlInput ? 'left-4 bg-white' : 'left-0.5 bg-muted-foreground'}`} />
              </div>
            </button>

            {useUrlInput && (
              <div className="mt-2 space-y-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={e => { setImageUrl(e.target.value); setPreview(e.target.value.startsWith('http') ? e.target.value : null) }}
                  placeholder="https://example.com/image.jpg"
                  className="w-full bg-muted rounded-xl px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-1 focus:ring-foreground/20"
                />
                {preview && (
                  <div className="aspect-video rounded-xl overflow-hidden bg-white border border-border">
                    <img src={preview} alt="preview" className="w-full h-full object-contain" onError={() => setPreview(null)} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Name *</label>
            <input
              name="name"
              type="text"
              required
              ref={nameRef}
              className="w-full bg-muted rounded-xl px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-1 focus:ring-foreground/20"
              placeholder={`e.g. My ${HOBBIES.find(h => h.value === hobby)?.label} item`}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Notes</label>
            <textarea
              name="notes"
              rows={3}
              className="w-full bg-muted rounded-xl px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-1 focus:ring-foreground/20 resize-none"
              placeholder="Any notes about this item…"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-foreground text-background font-semibold py-3.5 rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Saving…' : 'Add Item'}
          </button>
        </form>
      </div>
    </div>
  )
}
