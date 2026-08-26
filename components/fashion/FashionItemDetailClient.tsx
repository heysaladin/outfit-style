'use client'

import { useRouter } from 'next/navigation'
import { useTransition, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import type { WardrobeItem } from '@/lib/types'
import { WorthCard } from '@/components/worth/WorthCard'
import { wearItem, setWardrobeItemWearCount, setWardrobeItemTarget } from '@/app/actions'

const C = {
  bg: 'var(--background)', card: 'var(--card)', card2: 'var(--muted)', line: 'var(--border)',
  ink: 'var(--foreground)', muted: 'var(--muted-foreground)', faint: 'var(--muted-foreground)',
  orange: 'var(--primary)', orangeSoft: 'var(--secondary)',
  shadow: '0 6px 18px rgba(84,62,32,.08)',
}
const DP = 'var(--font-sans), system-ui, sans-serif'
const UI = "'Inter', -apple-system, system-ui, sans-serif"

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'var(--background)', border: '1.5px solid var(--border)',
  borderRadius: 16, color: 'var(--foreground)',
  fontFamily: "'Inter', -apple-system, system-ui, sans-serif",
  fontSize: 15, fontWeight: 500, padding: '13px 15px', outline: 'none',
  boxSizing: 'border-box',
}

interface Props {
  item: WardrobeItem
  user: User | null
}

export function FashionItemDetailClient({ item, user }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Local wear count (optimistic)
  const [wearCount, setWearCount] = useState(item.wear_count)
  const [lastWorn, setLastWorn]   = useState(item.last_worn)

  // Edit use count sheet
  const [editUsesOpen, setEditUsesOpen]   = useState(false)
  const [editUsesCount, setEditUsesCount] = useState<string>(String(item.wear_count))
  const [editUsesPending, setEditUsesPending] = useState(false)

  // Inline target edit
  const [target, setTarget]           = useState(item.target ?? 0)
  const [editingTarget, setEditingTarget] = useState(false)
  const [editTargetValue, setEditTargetValue] = useState<string>(String(item.target ?? 0))
  const [targetPending, setTargetPending] = useState(false)

  const priceStr = item.price
    ? item.price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
    : null
  const lastWornStr = lastWorn
    ? new Date(lastWorn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'never worn'
  const addedStr = new Date(item.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  function handleUse() {
    startTransition(async () => {
      const res = await wearItem(item.id)
      if (res.error) return
      const today = new Date().toISOString().split('T')[0]
      setWearCount(c => c + 1)
      setLastWorn(today)
      router.refresh()
    })
  }

  async function handleSaveUses() {
    setEditUsesPending(true)
    const count = Math.max(0, parseInt(editUsesCount) || 0)
    const res = await setWardrobeItemWearCount(item.id, count)
    setEditUsesPending(false)
    if (res.error) return
    setWearCount(count)
    setEditUsesOpen(false)
    router.refresh()
  }

  async function handleSaveTarget() {
    setTargetPending(true)
    const val = Math.max(0, parseInt(editTargetValue) || 0)
    const res = await setWardrobeItemTarget(item.id, val)
    setTargetPending(false)
    if (res.error) return
    setTarget(val)
    setEditingTarget(false)
    router.refresh()
  }

  return (
    <div style={{ background: C.bg, height: '100dvh', overflowY: 'auto', fontFamily: UI, color: C.ink }}>

      {/* Sticky header */}
      <div style={{
        padding: 'calc(14px + env(safe-area-inset-top,0px)) 14px 10px',
        display: 'flex', alignItems: 'center', gap: 8,
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(250,250,250,0.95)', backdropFilter: 'blur(12px)',
      }}>
        <IconBtn onClick={() => router.push('/fashion')}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </IconBtn>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontFamily: DP, fontSize: 18, fontWeight: 800, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
            {item.name}
          </h1>
          {item.brand && (
            <span style={{ fontSize: 11.5, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {item.brand}
            </span>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ padding: '4px 18px 48px' }}>

        {/* Hero image */}
        {item.image_url && (
          <div style={{ borderRadius: 28, overflow: 'hidden', marginBottom: 0, background: C.card, boxShadow: C.shadow }}>
            <img src={item.image_url} alt={item.name} style={{ width: '100%', display: 'block', objectFit: 'contain' }} />
          </div>
        )}

        {/* Detail block */}
        <div style={{ padding: '18px 0 0' }}>

          {/* Name */}
          <h1 style={{ fontFamily: DP, fontSize: 23, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.015em', margin: '0 0 10px' }}>
            {item.name}
          </h1>

          {/* Chips */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.orange, background: C.orangeSoft, borderRadius: 99, padding: '6px 12px' }}>
              👔 {item.category}
            </span>
            {item.color && (
              <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, background: C.card, boxShadow: C.shadow, borderRadius: 99, padding: '6px 12px' }}>
                {item.color}
              </span>
            )}
          </div>

          {/* Subcategory / type as description */}
          {item.subcategory && (
            <p style={{ fontSize: 14, lineHeight: 1.55, color: C.muted, marginBottom: 14 }}>
              {item.subcategory}
            </p>
          )}

          {/* Use bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12,
            background: C.card, boxShadow: C.shadow, borderRadius: 22, padding: 15,
          }}>
            <div style={{ fontFamily: DP, fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{wearCount}</div>
            <div style={{ flex: 1 }}>
              <b style={{ fontSize: 14, display: 'block' }}>uses</b>
              <span style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.muted, marginTop: 2 }}>{lastWornStr}</span>
            </div>
            {user && (
              <button
                onClick={() => { setEditUsesCount(String(wearCount)); setEditUsesOpen(true) }}
                style={{ background: C.card2, border: 'none', borderRadius: 12, width: 36, height: 36, cursor: 'pointer', display: 'grid', placeItems: 'center', color: C.muted, flexShrink: 0, marginRight: 6 }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3a2.8 2.8 0 114 4L7.5 20.5 2 22l1.5-5.5z"/>
                </svg>
              </button>
            )}
            {user && (
              <button
                onClick={handleUse}
                disabled={isPending}
                style={{ border: 'none', borderRadius: 99, padding: '12px 22px', cursor: 'pointer', background: C.orange, color: 'var(--primary-foreground)', fontFamily: UI, fontSize: 14, fontWeight: 800, opacity: isPending ? 0.6 : 1 }}
              >
                ＋ Use
              </button>
            )}
          </div>

          {/* KV table */}
          <div style={{ background: C.card, boxShadow: C.shadow, borderRadius: 22, padding: '4px 15px', marginBottom: 12 }}>
            {priceStr && <KVRow label="Purchase price" value={priceStr} />}
            {item.purchase_date && (
              <KVRow
                label="Purchase date"
                value={new Date(item.purchase_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                divider={!!priceStr}
              />
            )}
            {item.status && (
              <KVRow label="Status" value={item.status === 'verified' ? 'Verified' : 'Draft'} divider />
            )}
            {item.occasions && item.occasions.length > 0 && (
              <KVRow label="Occasions" value={item.occasions.join(', ')} divider />
            )}
            {item.seasons && item.seasons.length > 0 && (
              <KVRow label="Seasons" value={item.seasons.join(', ')} divider />
            )}
            {target > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', fontSize: 13.5, borderTop: '1px solid var(--border)' }}>
                <span style={{ color: C.muted, fontWeight: 500 }}>Defined target</span>
                {editingTarget ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      value={editTargetValue}
                      onChange={e => setEditTargetValue(e.target.value.replace(/[^0-9]/g, ''))}
                      onFocus={e => e.target.select()}
                      style={{ width: 72, background: 'var(--background)', border: '1.5px solid var(--border)', borderRadius: 10, color: C.ink, fontFamily: UI, fontSize: 13, fontWeight: 600, padding: '6px 10px', outline: 'none', textAlign: 'right' }}
                    />
                    <button onClick={handleSaveTarget} disabled={targetPending} style={{ border: 'none', borderRadius: 8, padding: '6px 10px', background: C.orange, color: 'var(--primary-foreground)', fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: targetPending ? 0.6 : 1 }}>
                      Save
                    </button>
                    <button onClick={() => { setEditingTarget(false); setEditTargetValue(String(target)) }} style={{ border: 'none', borderRadius: 8, padding: '6px 10px', background: C.card2, color: C.muted, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 700, color: C.ink }}>{target} uses</span>
                    {user && (
                      <button onClick={() => { setEditTargetValue(String(target)); setEditingTarget(true) }} style={{ border: 'none', background: C.card2, borderRadius: 8, width: 28, height: 28, cursor: 'pointer', display: 'grid', placeItems: 'center', color: C.muted }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 3a2.8 2.8 0 114 4L7.5 20.5 2 22l1.5-5.5z"/>
                        </svg>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Worth card */}
          <WorthCard purchasePrice={item.price} purchaseDate={item.purchase_date} totalUses={wearCount} targetOverride={target > 0 ? target : null} />

          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.faint, marginTop: 16 }}>
            Added {addedStr}
          </p>
        </div>
      </div>

      {/* Edit use count sheet */}
      {editUsesOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(50,35,15,.4)', zIndex: 40 }} onClick={() => setEditUsesOpen(false)} />
          <div style={{
            position: 'fixed', left: '50%', transform: 'translateX(-50%)',
            bottom: 0, width: '100%', maxWidth: 430, zIndex: 50,
            background: C.bg, borderRadius: '30px 30px 0 0',
            boxShadow: '0 -10px 40px rgba(60,40,15,.18)',
            paddingBottom: 'env(safe-area-inset-bottom,0px)',
          }}>
            <div style={{ width: 40, height: 5, borderRadius: 99, background: C.line, margin: '10px auto 2px' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 18px 12px' }}>
              <h2 style={{ fontFamily: DP, fontSize: 20, fontWeight: 800, margin: 0 }}>Edit use count</h2>
              <IconBtn onClick={() => setEditUsesOpen(false)}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
              </IconBtn>
            </div>
            <div style={{ padding: '0 18px 18px' }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: C.muted, marginBottom: 8 }}>Total uses</label>
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={editUsesCount}
                  onChange={e => setEditUsesCount(e.target.value.replace(/[^0-9]/g, ''))}
                  onFocus={e => e.target.select()}
                  style={inputStyle}
                />
              </div>
              <button
                onClick={handleSaveUses}
                disabled={editUsesPending}
                style={{ width: '100%', border: 'none', borderRadius: 18, padding: 17, cursor: 'pointer', background: C.orange, color: 'var(--primary-foreground)', fontFamily: UI, fontSize: 15, fontWeight: 800, opacity: editUsesPending ? 0.6 : 1 }}
              >
                {editUsesPending ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function IconBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      width: 42, height: 42, borderRadius: 16, border: 'none',
      background: 'var(--card)', color: 'var(--foreground)',
      cursor: 'pointer', display: 'grid', placeItems: 'center',
      boxShadow: '0 6px 18px rgba(84,62,32,.08)', flexShrink: 0,
    }}>
      {children}
    </button>
  )
}

function KVRow({ label, value, divider }: { label: string; value: string; divider?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', fontSize: 13.5, borderTop: divider ? '1px solid var(--border)' : 'none' }}>
      <span style={{ color: 'var(--muted-foreground)', fontWeight: 500 }}>{label}</span>
      <span style={{ fontWeight: 700, color: 'var(--foreground)', textAlign: 'right', marginLeft: 12 }}>{value}</span>
    </div>
  )
}
