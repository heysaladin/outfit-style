'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { HOBBIES } from '@/lib/types'

const C = {
  bg: '#FDF7EE', card: '#FFFFFF', line: '#EFE6D6',
  ink: '#22190F', muted: '#8D8271',
  orange: '#FF7A2F',
  shadow: '0 6px 18px rgba(84,62,32,.08)',
}
const DP = 'var(--font-bricolage), system-ui, sans-serif'
const UI = "'Inter', -apple-system, system-ui, sans-serif"

interface AddGearModalProps {
  onClose: () => void
  defaultHobby?: string
  returnTo?: string
}

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
    <>
      {/* Scrim */}
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(50,35,15,.4)', zIndex: 40 }} onClick={onClose} />

      {/* Sheet */}
      <div style={{
        position: 'fixed', left: '50%', transform: 'translateX(-50%)',
        bottom: 0, width: '100%', maxWidth: 430, zIndex: 50,
        background: C.bg, borderRadius: '30px 30px 0 0',
        boxShadow: '0 -10px 40px rgba(60,40,15,.18)',
        maxHeight: '92dvh', display: 'flex', flexDirection: 'column',
        paddingBottom: 'env(safe-area-inset-bottom,0px)',
      }}>
        {/* Grab */}
        <div style={{ width: 40, height: 5, borderRadius: 99, background: C.line, margin: '10px auto 2px', flexShrink: 0 }} />

        {/* Sheet head */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 18px 12px', flexShrink: 0 }}>
          <h2 style={{ fontFamily: DP, fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em', margin: 0 }}>Add item</h2>
          <button onClick={onClose} style={{ width: 42, height: 42, borderRadius: 16, border: 'none', background: C.card, color: C.ink, cursor: 'pointer', display: 'grid', placeItems: 'center', boxShadow: C.shadow }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '0 18px 18px', flex: 1 }}>

          {/* Hobby chips */}
          <Field label="Hobby">
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
              {HOBBIES.map(h => (
                <button
                  key={h.value}
                  type="button"
                  onClick={() => setHobby(h.value)}
                  style={{
                    flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6,
                    border: 'none', borderRadius: 99, padding: '10px 15px',
                    fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    background: hobby === h.value ? C.ink : C.card,
                    color: hobby === h.value ? '#FFF7EC' : C.muted,
                    boxShadow: C.shadow,
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
              style={{
                border: preview ? 'none' : '2px dashed #EFE6D6',
                borderRadius: 16, background: C.card,
                padding: preview ? 0 : 26,
                display: 'grid', placeItems: 'center', gap: 6,
                textAlign: 'center', color: C.muted, cursor: 'pointer',
                overflow: 'hidden',
              }}
            >
              {preview ? (
                <img src={preview} alt="preview" style={{ width: '100%', display: 'block', borderRadius: 14, objectFit: 'cover' }} onError={() => setPreview(null)} />
              ) : (
                <>
                  <div style={{ fontSize: 22 }}>📷</div>
                  <b style={{ color: C.muted, fontSize: 13, fontWeight: 700 }}>Tap to add photo</b>
                  <span style={{ fontSize: 11, fontWeight: 500 }}>or paste an image URL below</span>
                </>
              )}
            </div>
            <input ref={fileRef} name="image" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
            <input
              type="url"
              value={imageUrl}
              onChange={e => { setImageUrl(e.target.value); setPreview(e.target.value.startsWith('http') ? e.target.value : null) }}
              placeholder="https://…"
              style={{ ...inputStyle, marginTop: 8 }}
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
              style={inputStyle}
            />
          </Field>

          {/* Price + Date */}
          <div style={{ display: 'flex', gap: 10 }}>
            <Field label="Price (Rp)" style={{ flex: 1 }}>
              <input name="purchase_price" type="number" min="0" inputMode="numeric" placeholder="0" style={inputStyle} />
            </Field>
            <Field label="Purchase date" style={{ flex: 1 }}>
              <input name="purchase_date" type="date" style={inputStyle} />
            </Field>
          </div>

          {/* Notes */}
          <Field label="Notes">
            <textarea
              name="notes"
              rows={3}
              placeholder="Anything worth remembering about this item…"
              style={{ ...inputStyle, resize: 'none', minHeight: 76 }}
            />
          </Field>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', border: 'none', borderRadius: 18, padding: 17,
              cursor: 'pointer', background: C.orange, color: '#fff',
              fontFamily: UI, fontSize: 15, fontWeight: 800,
              boxShadow: '0 10px 22px rgba(255,122,47,.35)',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Saving…' : `Add item`}
          </button>
        </form>
      </div>
    </>
  )
}

function Field({ label, children, style }: { label: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ marginBottom: 16, ...style }}>
      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: '#8D8271', marginBottom: 8 }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#FFFFFF', border: '1.5px solid #EFE6D6',
  borderRadius: 16, color: '#22190F',
  fontFamily: "'Inter', -apple-system, system-ui, sans-serif",
  fontSize: 15, fontWeight: 500, padding: '13px 15px', outline: 'none',
  boxSizing: 'border-box',
}
