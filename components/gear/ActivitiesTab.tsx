'use client'

import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import type { HobbyActivity } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

const C = {
  bg: '#FDF7EE', card: '#FFFFFF', line: '#EFE6D6',
  ink: '#22190F', muted: '#8D8271', faint: '#B8AD9A',
  orange: '#FF7A2F', orangeSoft: '#FFE9DB',
  mint: '#3FBF8F', mintSoft: '#DDF4EA',
  danger: '#E9573F',
  shadow: '0 6px 18px rgba(84,62,32,.08)',
  shadowLg: '0 14px 34px rgba(84,62,32,.14)',
}
const DP = 'var(--font-bricolage), system-ui, sans-serif'
const UI = "'Inter', -apple-system, system-ui, sans-serif"

interface Props {
  hobby: string
  activities: HobbyActivity[]
  user: User | null
}

function formatRelative(iso: string): string {
  const d = new Date(iso)
  const diff = Math.floor((Date.now() - d.getTime()) / 86400000)
  const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  if (diff === 0) return `Today · ${timeStr}`
  if (diff === 1) return `Yesterday · ${timeStr}`
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + ` · ${timeStr}`
}

export function ActivitiesTab({ hobby, activities: initialActivities, user }: Props) {
  const [activities, setActivities] = useState(initialActivities)
  const [addOpen, setAddOpen]       = useState(false)
  const [note, setNote]             = useState('')
  const [location, setLocation]     = useState('')
  const [activityAt, setActivityAt] = useState(() => {
    const now = new Date(); now.setSeconds(0, 0)
    return now.toISOString().slice(0, 16)
  })
  const [error, setError]     = useState('')
  const [isPending, setIsPending] = useState(false)
  const [deleting, setDeleting]   = useState<string | null>(null)

  function resetForm() {
    setNote(''); setLocation(''); setError('')
    const now = new Date(); now.setSeconds(0, 0)
    setActivityAt(now.toISOString().slice(0, 16))
  }

  async function handleAdd() {
    if (!note.trim()) return setError('Please add a note')
    setError(''); setIsPending(true)
    try {
      const supabase = createClient()
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) { setError('Not authenticated'); return }
      const { data, error: err } = await supabase.from('hobby_activities').insert({
        user_id: u.id, hobby,
        note: note.trim() || null,
        location: location.trim() || null,
        activity_at: new Date(activityAt).toISOString(),
      }).select().single()
      if (err) { setError(err.message); return }
      setActivities(prev => [data, ...prev])
      resetForm(); setAddOpen(false)
    } finally { setIsPending(false) }
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    const supabase = createClient()
    await supabase.from('hobby_activities').delete().eq('id', id)
    setActivities(prev => prev.filter(a => a.id !== id))
    setDeleting(null)
  }

  return (
    <div style={{ padding: '0 18px 40px' }}>
      {/* Activity list */}
      {activities.length === 0 ? (
        <div style={{ padding: '40px 0 20px', textAlign: 'center', color: C.muted }}>
          <div style={{ width: 56, height: 56, borderRadius: 20, background: C.card, boxShadow: C.shadow, display: 'grid', placeItems: 'center', margin: '0 auto 12px', fontSize: 24 }}>⏱️</div>
          <b style={{ display: 'block', color: C.ink, fontFamily: DP, fontSize: 15, fontWeight: 700, marginBottom: 3 }}>No activities yet</b>
          <p style={{ fontSize: 13 }}>{user ? 'Log your first session below' : 'Sign in to log activities'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, paddingBottom: 12 }}>
          {activities.map(act => (
            <div key={act.id} style={{
              display: 'flex', gap: 12, padding: 14,
              background: C.card, boxShadow: C.shadow, borderRadius: 16,
              alignItems: 'center',
            }}>
              <div style={{ width: 42, height: 42, borderRadius: 14, background: C.mintSoft, display: 'grid', placeItems: 'center', fontSize: 19, flexShrink: 0 }}>
                ✨
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <b style={{ fontSize: 14, fontWeight: 700, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {act.note ?? 'Session logged'}
                </b>
                <span style={{ fontSize: 12, fontWeight: 500, color: C.muted }}>
                  {formatRelative(act.activity_at)}{act.location ? ` · ${act.location}` : ''}
                </span>
              </div>
              {user && (
                <button
                  onClick={() => handleDelete(act.id)}
                  disabled={deleting === act.id}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: C.faint, opacity: deleting === act.id ? 0.4 : 1 }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M8 6V4h8v2m-9 0l1 14h8l1-14"/>
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Log activity button */}
      {user && (
        <button
          onClick={() => setAddOpen(true)}
          style={{
            width: '100%', border: 'none', borderRadius: 18, padding: 17,
            cursor: 'pointer', marginTop: 6,
            background: C.orange, color: '#fff',
            fontFamily: UI, fontSize: 15, fontWeight: 800,
            boxShadow: '0 10px 22px rgba(255,122,47,.35)',
          }}
        >
          ＋ Log activity
        </button>
      )}

      {/* ── Log activity sheet ── */}
      {addOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(50,35,15,.4)', zIndex: 40 }} onClick={() => { setAddOpen(false); resetForm() }} />
          <div style={{
            position: 'fixed', left: '50%', transform: 'translateX(-50%)',
            bottom: 0, width: '100%', maxWidth: 430, zIndex: 50,
            background: C.bg, borderRadius: '30px 30px 0 0',
            boxShadow: '0 -10px 40px rgba(60,40,15,.18)',
            maxHeight: '88dvh', display: 'flex', flexDirection: 'column',
            paddingBottom: 'env(safe-area-inset-bottom,0px)',
          }}>
            <div style={{ width: 40, height: 5, borderRadius: 99, background: C.line, margin: '10px auto 2px' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 18px 12px' }}>
              <h2 style={{ fontFamily: DP, fontSize: 20, fontWeight: 800, margin: 0 }}>Log activity</h2>
              <button onClick={() => { setAddOpen(false); resetForm() }} style={{ width: 42, height: 42, borderRadius: 16, border: 'none', background: C.card, cursor: 'pointer', display: 'grid', placeItems: 'center', boxShadow: C.shadow }}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
              </button>
            </div>
            <div style={{ overflowY: 'auto', padding: '0 18px 18px' }}>
              <Field label="What did you do? *">
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="e.g. Cleaned bracelet, went for a ride"
                  rows={3}
                  style={inputStyle}
                />
              </Field>
              <div style={{ display: 'flex', gap: 10 }}>
                <Field label="Location" style={{ flex: 1 }}>
                  <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Home, Garage" style={inputStyle} />
                </Field>
                <Field label="Date & time" style={{ flex: 1 }}>
                  <input type="datetime-local" value={activityAt} onChange={e => setActivityAt(e.target.value)} style={inputStyle} />
                </Field>
              </div>
              {error && <p style={{ color: C.danger, fontSize: 12, fontWeight: 600, marginBottom: 8 }}>{error}</p>}
              <button
                onClick={handleAdd}
                disabled={isPending}
                style={{ width: '100%', border: 'none', borderRadius: 18, padding: 17, cursor: 'pointer', marginTop: 8, background: C.orange, color: '#fff', fontFamily: UI, fontSize: 15, fontWeight: 800, boxShadow: '0 10px 22px rgba(255,122,47,.35)', opacity: isPending ? 0.6 : 1 }}
              >
                {isPending ? 'Saving…' : 'Save activity'}
              </button>
            </div>
          </div>
        </>
      )}
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

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#FFFFFF', border: '1.5px solid #EFE6D6',
  borderRadius: 16, color: '#22190F',
  fontFamily: "'Inter', -apple-system, system-ui, sans-serif",
  fontSize: 15, fontWeight: 500, padding: '13px 15px', outline: 'none',
  boxSizing: 'border-box', resize: 'none',
}
