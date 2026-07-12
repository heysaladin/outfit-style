'use client'

import { useTransition, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import type { HobbyItem, HobbyItemUse } from '@/lib/types'
import { HOBBIES } from '@/lib/types'
import { WorthCard } from '@/components/worth/WorthCard'
import { updateHobbyItem, deleteHobbyItem, useHobbyItem, getHobbyItemUses } from '@/app/actions'

const C = {
  bg: '#FDF7EE', card: '#FFFFFF', card2: '#F7F0E4', line: '#EFE6D6',
  ink: '#22190F', muted: '#8D8271', faint: '#B8AD9A',
  orange: '#FF7A2F', orangeSoft: '#FFE9DB',
  mint: '#3FBF8F',
  danger: '#E9573F',
  shadow: '0 6px 18px rgba(84,62,32,.08)',
  shadowLg: '0 14px 34px rgba(84,62,32,.14)',
}
const DP = 'var(--font-bricolage), system-ui, sans-serif'
const UI = "'Inter', -apple-system, system-ui, sans-serif"

const HERO_TINTS = [
  'radial-gradient(120% 100% at 30% 20%,#FFF0DC,#FFDFC2)',
  'radial-gradient(120% 100% at 30% 20%,#EAEFFB,#C9D6EE)',
  'radial-gradient(120% 100% at 30% 20%,#DFF2E4,#B7DFC3)',
  'radial-gradient(120% 100% at 30% 20%,#EDE6FD,#D3C4F6)',
  'radial-gradient(120% 100% at 30% 20%,#FBE0DC,#F2BBB2)',
]

const today = new Date().toISOString().split('T')[0]

interface Props {
  item: HobbyItem
  hobby: string
  user: User | null
}

export function HobbyItemDetailClient({ item, hobby, user }: Props) {
  const router                       = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editOpen, setEditOpen]      = useState(false)
  const [deleteOpen, setDeleteOpen]  = useState(false)
  const [useSheetOpen, setUseSheetOpen] = useState(false)
  const [listOpen, setListOpen]      = useState(false)
  const [uses, setUses]              = useState<HobbyItemUse[]>([])
  const [listLoading, setListLoading] = useState(false)
  const [useDate, setUseDate]        = useState(today)
  const [useNote, setUseNote]        = useState('')
  const [error, setError]            = useState<string | null>(null)

  // Edit state
  const [preview, setPreview]   = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState(item.image_url ?? '')
  const fileRef                 = useRef<HTMLInputElement>(null)

  const hobbyDef   = HOBBIES.find(h => h.value === hobby)
  const hobbyIdx   = HOBBIES.findIndex(h => h.value === hobby)
  const heroBg     = item.image_url ? undefined : HERO_TINTS[hobbyIdx % HERO_TINTS.length]
  const displayImg = preview ?? item.image_url

  function openUseSheet() { setUseDate(today); setUseNote(''); setUseSheetOpen(true) }

  function handleUseSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const res = await useHobbyItem(item.id, hobby, useDate, useNote || null)
      if (res.error) { setError(res.error); return }
      setUseSheetOpen(false)
      router.refresh()
    })
  }

  async function openHistory() {
    setListOpen(true); setListLoading(true)
    const res = await getHobbyItemUses(item.id)
    setUses(res.data ?? []); setListLoading(false)
  }

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteHobbyItem(item.id, hobby)
      if (res.error) { setError(res.error); setDeleteOpen(false); return }
      router.push(`/${hobby}`)
    })
  }

  function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    if (imageUrl.trim() && !fileRef.current?.files?.[0]) fd.set('image_url_direct', imageUrl.trim())
    startTransition(async () => {
      const res = await updateHobbyItem(item.id, fd)
      if (res.error) { setError(res.error); return }
      router.refresh(); setEditOpen(false); setPreview(null)
    })
  }

  const priceStr = item.purchase_price
    ? item.purchase_price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
    : null
  const dateStr = item.purchase_date
    ? new Date(item.purchase_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null
  const lastUsedStr = item.last_used
    ? new Date(item.last_used).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'never used'
  const addedStr = new Date(item.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div style={{ background: C.bg, minHeight: '100dvh', fontFamily: UI, color: C.ink }}>

      {/* ── Subhead ── */}
      <div style={{
        padding: 'calc(14px + env(safe-area-inset-top,0px)) 14px 10px',
        display: 'flex', alignItems: 'center', gap: 8,
        position: 'sticky', top: 0, zIndex: 10,
        background: '#FDF7EEf5', backdropFilter: 'blur(12px)',
      }}>
        <IconBtn onClick={() => router.push(`/${hobby}`)}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </IconBtn>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontFamily: DP, fontSize: 18, fontWeight: 800, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
            {item.name}
          </h1>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: C.muted }}>{hobbyDef?.label}</span>
        </div>

        {user && (
          <>
            <IconBtn onClick={() => setEditOpen(true)}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.8 2.8 0 114 4L7.5 20.5 2 22l1.5-5.5z"/>
              </svg>
            </IconBtn>
            <IconBtn onClick={() => setDeleteOpen(true)} danger>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M8 6V4h8v2m-9 0l1 14h8l1-14"/>
              </svg>
            </IconBtn>
          </>
        )}
      </div>

      {/* ── Scrollable content ── */}
      <div style={{ overflowY: 'auto', paddingBottom: 48 }}>

        {/* Hero */}
        <div style={{
          margin: '4px 18px 0', borderRadius: 28, overflow: 'hidden',
          display: 'grid', placeItems: 'center',
          fontSize: 120, position: 'relative',
          background: heroBg,
          boxShadow: C.shadow,
          aspectRatio: displayImg ? undefined : '1/.9',
        }}>
          {displayImg ? (
            <img src={displayImg} alt={item.name} style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }} />
          ) : (
            <div style={{ aspectRatio: '1/.9', width: '100%', display: 'grid', placeItems: 'center' }}>
              <span>{hobbyDef?.icon}</span>
            </div>
          )}
        </div>

        {/* Detail */}
        <div style={{ padding: '18px 18px 0' }}>

          {/* Name */}
          <h1 style={{ fontFamily: DP, fontSize: 23, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.015em', margin: '0 0 10px' }}>
            {item.name}
          </h1>

          {/* Chips */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.orange, background: C.orangeSoft, borderRadius: 99, padding: '6px 12px' }}>
              {hobbyDef?.icon} {hobbyDef?.label}
            </span>
            {item.description && item.description.split(' ').slice(0, 2).join(' ') !== item.description && (
              <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, background: C.card, boxShadow: C.shadow, borderRadius: 99, padding: '6px 12px' }}>
                {item.status === 'verified' ? 'Verified' : 'Draft'}
              </span>
            )}
          </div>

          {/* Notes/description */}
          {item.description && (
            <p style={{ fontSize: 14, lineHeight: 1.55, color: C.muted, marginBottom: 14 }}>
              {item.description}
            </p>
          )}

          {/* Use bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12,
            background: C.card, boxShadow: C.shadow, borderRadius: 22, padding: 15,
          }}>
            <div style={{ fontFamily: DP, fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{item.use_count}</div>
            <div style={{ flex: 1 }}>
              <b style={{ fontSize: 14, display: 'block' }}>uses</b>
              <span style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.muted, marginTop: 2 }}>{lastUsedStr}</span>
            </div>
            <button
              onClick={openHistory}
              style={{ background: C.card2, border: 'none', borderRadius: 12, padding: '8px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: C.muted, marginRight: 6 }}
            >
              History
            </button>
            {user && (
              <button
                onClick={openUseSheet}
                disabled={isPending}
                style={{ border: 'none', borderRadius: 99, padding: '12px 22px', cursor: 'pointer', background: C.orange, color: '#fff', fontFamily: UI, fontSize: 14, fontWeight: 800, boxShadow: '0 8px 18px rgba(255,122,47,.35)', opacity: isPending ? 0.6 : 1 }}
              >
                ＋ Use
              </button>
            )}
          </div>

          {/* KV table */}
          <div style={{ background: C.card, boxShadow: C.shadow, borderRadius: 22, padding: '4px 15px', marginBottom: 12 }}>
            <KVRow label="Purchase price" value={priceStr} unset="＋ Add price" />
            <KVRow label="Purchase date" value={dateStr} unset="＋ Add date" divider />
            {item.status && <KVRow label="Status" value={item.status === 'verified' ? 'Verified' : 'Draft'} divider />}
          </div>

          {/* Worth card */}
          <WorthCard purchasePrice={item.purchase_price} purchaseDate={item.purchase_date} totalUses={item.use_count} />

          {error && (
            <p style={{ color: C.danger, fontSize: 12, fontWeight: 600, marginTop: 12, background: '#FEE2E2', borderRadius: 12, padding: '10px 14px' }}>{error}</p>
          )}

          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.faint, marginTop: 16 }}>
            Added {addedStr}
          </p>
        </div>
      </div>

      {/* ── Edit sheet ── */}
      {editOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(50,35,15,.4)', zIndex: 40 }} onClick={() => setEditOpen(false)} />
          <div style={{
            position: 'fixed', left: '50%', transform: 'translateX(-50%)',
            bottom: 0, width: '100%', maxWidth: 430, zIndex: 50,
            background: C.bg, borderRadius: '30px 30px 0 0',
            boxShadow: '0 -10px 40px rgba(60,40,15,.18)',
            maxHeight: '90dvh', display: 'flex', flexDirection: 'column',
            paddingBottom: 'env(safe-area-inset-bottom,0px)',
          }}>
            <div style={{ width: 40, height: 5, borderRadius: 99, background: C.line, margin: '10px auto 2px', flexShrink: 0 }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 18px 12px', flexShrink: 0 }}>
              <h2 style={{ fontFamily: DP, fontSize: 20, fontWeight: 800, margin: 0 }}>Edit item</h2>
              <IconBtn onClick={() => setEditOpen(false)}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
              </IconBtn>
            </div>
            <form onSubmit={handleEditSubmit} style={{ overflowY: 'auto', padding: '0 18px 18px', flex: 1 }}>

              {/* Photo */}
              <Field label="Photo">
                <div
                  onClick={() => fileRef.current?.click()}
                  style={{
                    border: displayImg ? 'none' : '2px dashed #EFE6D6',
                    borderRadius: 16, background: C.card,
                    display: 'grid', placeItems: 'center', cursor: 'pointer',
                    overflow: 'hidden', marginBottom: 8,
                    minHeight: displayImg ? 'auto' : 100,
                    padding: displayImg ? 0 : 20,
                    color: C.muted, textAlign: 'center',
                  }}
                >
                  {displayImg ? (
                    <img src={displayImg} alt={item.name} style={{ width: '100%', display: 'block', borderRadius: 14, objectFit: 'cover' }} onError={() => { setPreview(null); setImageUrl('') }} />
                  ) : (
                    <>
                      <div style={{ fontSize: 22 }}>📷</div>
                      <b style={{ fontSize: 13, fontWeight: 700 }}>Tap to change photo</b>
                    </>
                  )}
                </div>
                <input ref={fileRef} type="file" name="image" accept="image/*" style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) { setPreview(URL.createObjectURL(f)); setImageUrl('') } }} />
                <input
                  type="url"
                  value={imageUrl}
                  onChange={e => { setImageUrl(e.target.value); setPreview(null) }}
                  placeholder="or paste image URL…"
                  style={inputStyle}
                />
              </Field>

              {/* Name */}
              <Field label="Name *">
                <input name="name" required defaultValue={item.name} style={inputStyle} />
              </Field>

              {/* Price + Date */}
              <div style={{ display: 'flex', gap: 10 }}>
                <Field label="Price (Rp)" style={{ flex: 1 }}>
                  <input name="purchase_price" type="number" min="0" inputMode="numeric" defaultValue={item.purchase_price ?? ''} placeholder="0" style={inputStyle} />
                </Field>
                <Field label="Purchase date" style={{ flex: 1 }}>
                  <input name="purchase_date" type="date" defaultValue={item.purchase_date ?? ''} style={inputStyle} />
                </Field>
              </div>

              {/* Notes */}
              <Field label="Notes">
                <textarea name="description" rows={3} defaultValue={item.description ?? ''} placeholder="Anything worth remembering…" style={{ ...inputStyle, resize: 'none', minHeight: 76 }} />
              </Field>

              {error && <p style={{ color: C.danger, fontSize: 12, fontWeight: 600, marginBottom: 8 }}>{error}</p>}

              <BigBtn type="submit" disabled={isPending}>{isPending ? 'Saving…' : 'Save changes'}</BigBtn>
              <BigBtn type="button" danger onClick={() => { setEditOpen(false); setDeleteOpen(true) }} disabled={isPending}>Delete item</BigBtn>
            </form>
          </div>
        </>
      )}

      {/* ── Use sheet ── */}
      {useSheetOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(50,35,15,.4)', zIndex: 40 }} onClick={() => setUseSheetOpen(false)} />
          <div style={{
            position: 'fixed', left: '50%', transform: 'translateX(-50%)',
            bottom: 0, width: '100%', maxWidth: 430, zIndex: 50,
            background: C.bg, borderRadius: '30px 30px 0 0',
            boxShadow: '0 -10px 40px rgba(60,40,15,.18)',
            paddingBottom: 'env(safe-area-inset-bottom,0px)',
          }}>
            <div style={{ width: 40, height: 5, borderRadius: 99, background: C.line, margin: '10px auto 2px' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 18px 12px' }}>
              <h2 style={{ fontFamily: DP, fontSize: 20, fontWeight: 800, margin: 0 }}>Log a use</h2>
              <IconBtn onClick={() => setUseSheetOpen(false)}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
              </IconBtn>
            </div>
            <form onSubmit={handleUseSubmit} style={{ padding: '0 18px 18px' }}>
              <Field label="Date">
                <input type="date" value={useDate} max={today} onChange={e => setUseDate(e.target.value)} style={inputStyle} />
              </Field>
              <Field label="Note (optional)">
                <input type="text" value={useNote} onChange={e => setUseNote(e.target.value)} placeholder="e.g. Office day, casual outing" style={inputStyle} />
              </Field>
              <BigBtn type="submit" disabled={isPending}>{isPending ? 'Saving…' : 'Save'}</BigBtn>
            </form>
          </div>
        </>
      )}

      {/* ── Delete confirmation ── */}
      {deleteOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(50,35,15,.45)', zIndex: 60 }} onClick={() => setDeleteOpen(false)} />
          <div style={{
            position: 'fixed', left: '50%', top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'calc(100% - 48px)', maxWidth: 340, zIndex: 70,
            background: C.bg, borderRadius: 28,
            boxShadow: '0 24px 60px rgba(60,40,15,.22)',
            padding: '28px 22px 20px',
            textAlign: 'center',
          }}>
            <div style={{ width: 56, height: 56, borderRadius: 20, background: '#FEE2E2', display: 'grid', placeItems: 'center', margin: '0 auto 16px', fontSize: 24 }}>
              🗑️
            </div>
            <h2 style={{ fontFamily: DP, fontSize: 19, fontWeight: 800, letterSpacing: '-0.01em', margin: '0 0 8px', color: C.ink }}>
              Delete item?
            </h2>
            <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.5, margin: '0 0 22px' }}>
              <b style={{ color: C.ink }}>{item.name}</b> will be permanently removed. This can&apos;t be undone.
            </p>
            <button
              onClick={handleDelete}
              disabled={isPending}
              style={{
                width: '100%', border: 'none', borderRadius: 16, padding: '14px 0',
                background: C.danger, color: '#fff',
                fontFamily: UI, fontSize: 15, fontWeight: 800,
                cursor: 'pointer', marginBottom: 10,
                opacity: isPending ? 0.6 : 1,
                boxShadow: '0 8px 20px rgba(233,87,63,.3)',
              }}
            >
              {isPending ? 'Deleting…' : 'Yes, delete'}
            </button>
            <button
              onClick={() => setDeleteOpen(false)}
              disabled={isPending}
              style={{
                width: '100%', border: '1.5px solid #EFE6D6', borderRadius: 16, padding: '13px 0',
                background: C.card, color: C.ink,
                fontFamily: UI, fontSize: 15, fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </>
      )}

      {/* ── History sheet ── */}
      {listOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(50,35,15,.4)', zIndex: 40 }} onClick={() => setListOpen(false)} />
          <div style={{
            position: 'fixed', left: '50%', transform: 'translateX(-50%)',
            bottom: 0, width: '100%', maxWidth: 430, zIndex: 50,
            background: C.bg, borderRadius: '30px 30px 0 0',
            boxShadow: '0 -10px 40px rgba(60,40,15,.18)',
            maxHeight: '70dvh', display: 'flex', flexDirection: 'column',
            paddingBottom: 'env(safe-area-inset-bottom,0px)',
          }}>
            <div style={{ width: 40, height: 5, borderRadius: 99, background: C.line, margin: '10px auto 2px', flexShrink: 0 }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 18px 12px', flexShrink: 0 }}>
              <div>
                <h2 style={{ fontFamily: DP, fontSize: 20, fontWeight: 800, margin: 0 }}>Use history</h2>
                <span style={{ fontSize: 11.5, color: C.muted, fontWeight: 600 }}>{item.use_count} total uses</span>
              </div>
              <IconBtn onClick={() => setListOpen(false)}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
              </IconBtn>
            </div>
            <div style={{ overflowY: 'auto', flex: 1, padding: '0 18px 18px' }}>
              {listLoading ? (
                <p style={{ color: C.muted, textAlign: 'center', padding: '32px 0', fontSize: 14 }}>Loading…</p>
              ) : uses.length === 0 ? (
                <p style={{ color: C.muted, textAlign: 'center', padding: '32px 0', fontSize: 14 }}>No uses logged yet</p>
              ) : (
                uses.map((u, i) => (
                  <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: i > 0 ? `1px solid ${C.line}` : 'none' }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{u.note ?? 'Use logged'}</p>
                      <p style={{ fontSize: 11.5, color: C.muted, margin: '2px 0 0' }}>{new Date(u.used_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <span style={{ fontSize: 11, color: C.faint, fontWeight: 700 }}>#{item.use_count - i}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function IconBtn({ onClick, children, danger }: { onClick: () => void; children: React.ReactNode; danger?: boolean }) {
  return (
    <button onClick={onClick} style={{
      width: 42, height: 42, borderRadius: 16, border: 'none',
      background: '#FFFFFF', color: danger ? '#E9573F' : '#22190F',
      cursor: 'pointer', display: 'grid', placeItems: 'center',
      boxShadow: '0 6px 18px rgba(84,62,32,.08)', flexShrink: 0,
    }}>
      {children}
    </button>
  )
}

function KVRow({ label, value, unset, divider }: { label: string; value: string | null; unset?: string; divider?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', fontSize: 13.5, borderTop: divider ? '1px solid #EFE6D6' : 'none' }}>
      <span style={{ color: '#8D8271', fontWeight: 500 }}>{label}</span>
      <span style={{ fontWeight: 700, color: value ? '#22190F' : '#FF7A2F' }}>{value ?? unset}</span>
    </div>
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

function BigBtn({ children, danger, type = 'button', disabled, onClick }: { children: React.ReactNode; danger?: boolean; type?: 'button' | 'submit'; disabled?: boolean; onClick?: () => void }) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        width: '100%', border: danger ? '1.5px solid #F4CFC7' : 'none',
        borderRadius: 18, padding: 17, cursor: 'pointer', marginTop: danger ? 10 : 0,
        background: danger ? 'none' : '#FF7A2F',
        color: danger ? '#E9573F' : '#fff',
        fontFamily: "'Inter', -apple-system, system-ui, sans-serif",
        fontSize: 15, fontWeight: 800,
        boxShadow: danger ? 'none' : '0 10px 22px rgba(255,122,47,.35)',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}
    </button>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#FFFFFF', border: '1.5px solid #EFE6D6',
  borderRadius: 16, color: '#22190F',
  fontFamily: "'Inter', -apple-system, system-ui, sans-serif",
  fontSize: 15, fontWeight: 500, padding: '13px 15px', outline: 'none',
  boxSizing: 'border-box',
}
