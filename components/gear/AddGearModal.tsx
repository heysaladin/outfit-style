'use client'

import { useRef, useState, useTransition } from 'react'
import { X, Upload, Link } from 'lucide-react'
import { createGearItem } from '@/app/actions'
import { HOBBIES, HOBBY_META_FIELDS, GEAR_CONDITIONS } from '@/lib/types'

interface AddGearModalProps {
  onClose: () => void
}

export function AddGearModal({ onClose }: AddGearModalProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError]           = useState<string | null>(null)
  const [hobby, setHobby]           = useState<string>(HOBBIES[0].value)
  const [preview, setPreview]       = useState<string | null>(null)
  const [metadata, setMetadata]     = useState<Record<string, string>>({})
  const [useUrlInput, setUseUrlInput] = useState(false)
  const [imageUrl, setImageUrl]       = useState('')
  const fileRef                     = useRef<HTMLInputElement>(null)

  const metaFields = HOBBY_META_FIELDS[hobby] ?? []

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) setPreview(URL.createObjectURL(f))
  }

  function handleHobbyChange(v: string) {
    setHobby(v)
    setMetadata({})
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget
    const fd   = new FormData(form)
    fd.set('hobby', hobby)
    fd.set('metadata', JSON.stringify(metadata))
    if (useUrlInput && imageUrl.trim()) {
      fd.set('image_url_direct', imageUrl.trim())
    }

    startTransition(async () => {
      const res = await createGearItem(fd)
      if (res.error) { setError(res.error); return }
      onClose()
    })
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
            <h2 className="text-foreground font-semibold text-base">Add Gear</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-muted hover:bg-accent flex items-center justify-center transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4 pb-10">
          {/* Hobby picker */}
          <div>
            <label className="text-muted-foreground text-xs font-medium mb-2 block">Hobby *</label>
            <div className="grid grid-cols-4 gap-1.5">
              {HOBBIES.map(h => (
                <button
                  key={h.value}
                  type="button"
                  onClick={() => handleHobbyChange(h.value)}
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
            <input ref={fileRef} type="file" name="image" accept="image/*" className="hidden" onChange={handleFileChange} />

            {/* URL toggle */}
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
                  autoFocus
                />
                {preview && (
                  <div className="aspect-video rounded-xl overflow-hidden bg-white border border-border">
                    <img src={preview} alt="preview" className="w-full h-full object-contain" onError={() => setPreview(null)} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Basic fields */}
          <div className="space-y-3">
            <div>
              <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Name *</label>
              <input
                name="name" required
                className="w-full bg-muted rounded-xl px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-1 focus:ring-foreground/20"
                placeholder={`e.g. My ${HOBBIES.find(h => h.value === hobby)?.label} item`}
              />
            </div>
            <div>
              <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Brand</label>
              <input
                name="brand"
                className="w-full bg-muted rounded-xl px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-1 focus:ring-foreground/20"
                placeholder="Brand name"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Price</label>
                <input
                  name="purchase_price" type="number" step="0.01" min="0"
                  className="w-full bg-muted rounded-xl px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-1 focus:ring-foreground/20"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Condition</label>
                <select
                  name="condition"
                  className="w-full bg-muted rounded-xl px-3.5 py-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-foreground/20"
                >
                  <option value="">Select…</option>
                  {GEAR_CONDITIONS.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Purchase Date</label>
              <input
                name="purchase_date" type="date"
                className="w-full bg-muted rounded-xl px-3.5 py-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-foreground/20"
              />
            </div>
          </div>

          {/* Per-hobby metadata fields */}
          {metaFields.length > 0 && (
            <div className="space-y-3">
              <p className="text-muted-foreground text-xs font-medium border-t border-border/40 pt-3">
                {HOBBIES.find(h => h.value === hobby)?.icon} {HOBBIES.find(h => h.value === hobby)?.label} Details
              </p>
              {metaFields.map(field => (
                <div key={field.key}>
                  <label className="text-muted-foreground text-xs font-medium mb-1.5 block">{field.label}</label>
                  {field.type === 'select' ? (
                    <select
                      value={metadata[field.key] ?? ''}
                      onChange={e => setMetadata(m => ({ ...m, [field.key]: e.target.value }))}
                      className="w-full bg-muted rounded-xl px-3.5 py-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-foreground/20"
                    >
                      <option value="">Select…</option>
                      {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      value={metadata[field.key] ?? ''}
                      onChange={e => setMetadata(m => ({ ...m, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full bg-muted rounded-xl px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-1 focus:ring-foreground/20"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Tags & Notes */}
          <div className="space-y-3">
            <div>
              <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Tags</label>
              <input
                name="tags"
                className="w-full bg-muted rounded-xl px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-1 focus:ring-foreground/20"
                placeholder="comma, separated, tags"
              />
            </div>
            <div>
              <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Notes</label>
              <textarea
                name="notes" rows={3}
                className="w-full bg-muted rounded-xl px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-1 focus:ring-foreground/20 resize-none"
                placeholder="Any notes about this item…"
              />
            </div>
          </div>

          {error && <p className="text-destructive text-xs bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>}

          <button
            type="submit" disabled={isPending}
            className="w-full bg-foreground text-background font-semibold py-3.5 rounded-xl text-sm disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            {isPending ? 'Saving…' : 'Add Gear'}
          </button>
        </form>
      </div>
    </div>
  )
}
