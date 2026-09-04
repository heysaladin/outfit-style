'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { HOBBIES } from '@/lib/types'
import { MobileButton } from '@/components/ui/mobile-shims'

interface AddGearModalProps {
  onClose: () => void
  defaultHobby?: string
  returnTo?: string
}

const inputCls = "w-full bg-background border border-border rounded-xl px-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground outline-none box-border"

export function AddGearModal({ onClose, defaultHobby }: AddGearModalProps) {
  const router                    = useRouter()
  const [hobby, setHobby]         = useState(defaultHobby ?? HOBBIES[0].value)
  const [preview, setPreview]     = useState<string | null>(null)
  const [imageUrl, setImageUrl]   = useState('')
  const [loading, setLoading]     = useState(false)
  const fileRef                   = useRef<HTMLInputElement>(null)
  const nameRef                   = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) {
      setImageUrl('')
      setPreview(URL.createObjectURL(f))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const name = nameRef.current?.value?.trim()
    if (!name) return
    setLoading(true)
    const fd = new FormData()
    fd.append('name', name)
    fd.append('category', hobby)
    if (imageUrl.trim()) fd.append('image_url', imageUrl.trim())
    else if (fileRef.current?.files?.[0]) fd.append('image', fileRef.current.files[0])
    const notesEl = form.querySelector('textarea[name="notes"]') as HTMLTextAreaElement | null
    if (notesEl?.value) fd.append('notes', notesEl.value)
    const priceEl = form.querySelector('input[name="purchase_price"]') as HTMLInputElement | null
    if (priceEl?.value) fd.append('purchase_price', priceEl.value)
    const dateEl = form.querySelector('input[name="purchase_date"]') as HTMLInputElement | null
    if (dateEl?.value) fd.append('purchase_date', dateEl.value)
    const res = await fetch('/api/hobby-items', { method: 'POST', body: fd })
    if (!res.ok) {
      console.error('hobby-items error:', await res.json().catch(() => ({})))
      setLoading(false)
      return
    }
    router.refresh()
    onClose()
  }

  const hobbyDef = HOBBIES.find(h => h.value === hobby)

  return (
    <Sheet title="Add item" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 pb-1">
        {/* Hobby chips */}
        <Field label="Hobby">
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {HOBBIES.map(h => (
              <button
                key={h.value}
                type="button"
                onClick={() => setHobby(h.value)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-bold transition-all"
                style={{
                  background: hobby === h.value ? 'var(--foreground)' : 'var(--card)',
                  color: hobby === h.value ? 'var(--background)' : 'var(--muted-foreground)',
                }}
              >
                {h.icon} {h.label}
              </button>
            ))}
          </div>
        </Field>

        {/* Photo */}
        <Field label="Photo">
          <div
            onClick={() => fileRef.current?.click()}
            className="rounded-2xl cursor-pointer overflow-hidden grid place-items-center gap-1.5 text-center"
            style={{
              border: preview ? 'none' : '2px dashed var(--border)',
              background: 'var(--card)',
              padding: preview ? '0' : '26px',
            }}
          >
            {preview ? (
              <img src={preview} alt="preview" className="w-full block rounded-xl object-cover" onError={() => setPreview(null)} />
            ) : (
              <>
                <div className="text-2xl">📷</div>
                <b className="text-muted-foreground text-[13px] font-bold">Tap to add photo</b>
                <span className="text-[11px] font-medium text-muted-foreground">or paste an image URL below</span>
              </>
            )}
          </div>
          <input ref={fileRef} name="image" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          <input
            type="url"
            value={imageUrl}
            onChange={e => { setImageUrl(e.target.value); setPreview(e.target.value.startsWith('http') ? e.target.value : null) }}
            placeholder="https://…"
            className={`${inputCls} mt-2`}
          />
        </Field>

        {/* Name */}
        <Field label="Name *">
          <input
            name="name"
            type="text"
            required
            ref={nameRef}
            placeholder={`e.g. My ${hobbyDef?.label ?? ''} item`}
            className={inputCls}
          />
        </Field>

        {/* Price + Date */}
        <div className="grid grid-cols-2 gap-2.5">
          <Field label="Price (Rp)">
            <input name="purchase_price" type="number" min="0" inputMode="numeric" placeholder="0" className={inputCls} />
          </Field>
          <Field label="Purchase date">
            <input name="purchase_date" type="date" className={inputCls} />
          </Field>
        </div>

        {/* Notes */}
        <Field label="Notes">
          <textarea
            name="notes"
            rows={3}
            placeholder="Anything worth remembering about this item…"
            className={`${inputCls} resize-none`}
          />
        </Field>

        <MobileButton type="submit" fullWidth loading={loading} className="rounded-xl">
          Add item
        </MobileButton>
      </form>
    </Sheet>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}

function Sheet({ children, onClose, title }: { children: ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full bg-background rounded-t-2xl max-h-[92dvh] flex flex-col shadow-2xl">
        <div className="mx-auto mt-2.5 h-1 w-9 rounded-full bg-muted-foreground/30 flex-shrink-0" />
        <div className="flex items-center justify-between px-5 pt-3 pb-2 flex-shrink-0">
          <h2 className="text-xl font-extrabold tracking-tight">{title}</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-card flex items-center justify-center text-foreground">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-5" style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom,0px))' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
