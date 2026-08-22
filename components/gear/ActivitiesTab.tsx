'use client'

import { useState, useRef } from 'react'
import type { User } from '@supabase/supabase-js'
import { HOBBIES, type HobbyActivity, type HobbyPhoto } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { formatRelative as fmtRelative, formatDateLabel, formatTime, defaultDatetimeLocal, daysDiff } from '@/lib/date'

const C = {
  bg: 'var(--background)', card: 'var(--card)', line: 'var(--border)',
  ink: 'var(--foreground)', muted: 'var(--muted-foreground)', faint: 'var(--muted-foreground)',
  orange: 'var(--primary)', orangeSoft: 'var(--secondary)',
  mint: '#059669', mintSoft: '#ECFDF5',
  danger: 'var(--destructive)',
  shadow: '0 6px 18px rgba(84,62,32,.08)',
  shadowLg: '0 14px 34px rgba(84,62,32,.14)',
}
const DP = 'var(--font-sans), system-ui, sans-serif'
const UI = "'Inter', -apple-system, system-ui, sans-serif"

interface Props {
  hobby: string
  activities: HobbyActivity[]
  photos?: HobbyPhoto[]
  user: User | null
}

const formatRelative = fmtRelative

export function ActivitiesTab({ hobby, activities: initialActivities, photos: initialPhotos = [], user }: Props) {
  const [activities, setActivities] = useState(() =>
    [...initialActivities].sort((a, b) => new Date(b.activity_at).getTime() - new Date(a.activity_at).getTime())
  )
  const [photos, setPhotos] = useState(initialPhotos)
  const [addOpen, setAddOpen]       = useState(false)
  const [note, setNote]             = useState('')
  const [location, setLocation]     = useState('')
  const [activityAt, setActivityAt] = useState(() => defaultDatetimeLocal())
  const [addPhoto, setAddPhoto]     = useState<string | null>(null)
  const [addPhotoFile, setAddPhotoFile] = useState<File | null>(null)
  const [error, setError]     = useState('')
  const [isPending, setIsPending] = useState(false)
  const [deleting, setDeleting]   = useState<string | null>(null)
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set())
  const addFileRef = useRef<HTMLInputElement>(null)

  const [editAct, setEditAct] = useState<HobbyActivity | null>(null)
  const [editPhoto, setEditPhoto] = useState<HobbyPhoto | null>(null)
  const [editDeletePhoto, setEditDeletePhoto] = useState(false)
  const [editNewFile, setEditNewFile] = useState<File | null>(null)
  const [editPreview, setEditPreview] = useState<string | null>(null)
  const [editNote, setEditNote] = useState('')
  const [editLocation, setEditLocation] = useState('')
  const [editActivityAt, setEditActivityAt] = useState('')
  const [editPending, setEditPending] = useState(false)
  const [editError, setEditError] = useState('')
  const editFileRef = useRef<HTMLInputElement>(null)

  function resetForm() {
    setNote(''); setLocation(''); setError('')
    setAddPhoto(null); setAddPhotoFile(null)
    if (addFileRef.current) addFileRef.current.value = ''
    setActivityAt(defaultDatetimeLocal())
  }

  function handleAddFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setAddPhotoFile(f)
    const reader = new FileReader()
    reader.onload = ev => setAddPhoto(ev.target?.result as string)
    reader.readAsDataURL(f)
  }

  function openEdit(act: HobbyActivity, photo?: HobbyPhoto) {
    setEditAct(act)
    setEditPhoto(photo ?? null)
    setEditNote(act.note ?? '')
    setEditLocation(act.location ?? '')
    const d = new Date(act.activity_at)
    d.setSeconds(0, 0)
    setEditActivityAt(defaultDatetimeLocal(d))
    setEditError('')
  }

  function closeEdit() {
    setEditAct(null)
    setEditPhoto(null)
    setEditDeletePhoto(false)
    setEditNewFile(null)
    setEditPreview(null)
    setEditNote('')
    setEditLocation('')
    setEditError('')
    if (editFileRef.current) editFileRef.current.value = ''
  }

  function handleEditFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setEditNewFile(f)
    const reader = new FileReader()
    reader.onload = ev => setEditPreview(ev.target?.result as string)
    reader.readAsDataURL(f)
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
      setActivities(prev => [...prev, data].sort((a, b) => b.activity_at.localeCompare(a.activity_at)))
      if (addPhotoFile) {
        const ext = addPhotoFile.name.split('.').pop() || 'jpg'
        const path = `${u.id}/hobby/${hobby}/${Date.now()}.${ext}`
        await supabase.storage.from('wardrobe').upload(path, addPhotoFile, { contentType: addPhotoFile.type })
        const { data: { publicUrl } } = supabase.storage.from('wardrobe').getPublicUrl(path)
        await supabase.from('hobby_photos').insert({ user_id: u.id, hobby, image_url: publicUrl, note: note.trim() || null })
      }
      resetForm(); setAddOpen(false)
    } finally { setIsPending(false) }
  }

  async function handleEdit() {
    if (!editAct) return
    if (!editNote.trim()) return setEditError('Please add a note')
    setEditError(''); setEditPending(true)
    const updated = {
      note: editNote.trim() || null,
      location: editLocation.trim() || null,
      activity_at: new Date(editActivityAt).toISOString(),
    }
    try {
      const supabase = createClient()
      const { error: err } = await supabase.from('hobby_activities').update(updated).eq('id', editAct.id)
      if (err) { setEditError(err.message); return }
      setActivities(prev => prev.map(a => a.id === editAct.id ? { ...a, ...updated } : a).sort((a, b) => b.activity_at.localeCompare(a.activity_at)))

      if (editDeletePhoto && editPhoto) {
        const oldPath = editPhoto.image_url.match(/\/wardrobe\/(.+)$/)?.[1]
        if (oldPath) await supabase.storage.from('wardrobe').remove([oldPath])
        await supabase.from('hobby_photos').delete().eq('id', editPhoto.id)
        setPhotos(prev => prev.filter(p => p.id !== editPhoto.id))
      } else if (editNewFile) {
        const { data: { user: u } } = await supabase.auth.getUser()
        if (u) {
          if (editPhoto) {
            const oldPath = editPhoto.image_url.match(/\/wardrobe\/(.+)$/)?.[1]
            if (oldPath) await supabase.storage.from('wardrobe').remove([oldPath])
            const ext = editNewFile.name.split('.').pop() || 'jpg'
            const path = `${u.id}/hobby/${editAct.hobby}/${Date.now()}.${ext}`
            await supabase.storage.from('wardrobe').upload(path, editNewFile, { contentType: editNewFile.type })
            const { data: { publicUrl } } = supabase.storage.from('wardrobe').getPublicUrl(path)
            const { data: updatedP } = await supabase.from('hobby_photos').update({ image_url: publicUrl, note: updated.note }).eq('id', editPhoto.id).select().single()
            if (updatedP) setPhotos(prev => prev.map(p => p.id === editPhoto.id ? updatedP : p))
          } else {
            const ext = editNewFile.name.split('.').pop() || 'jpg'
            const path = `${u.id}/hobby/${editAct.hobby}/${Date.now()}.${ext}`
            await supabase.storage.from('wardrobe').upload(path, editNewFile, { contentType: editNewFile.type })
            const { data: { publicUrl } } = supabase.storage.from('wardrobe').getPublicUrl(path)
            const { data: newP } = await supabase.from('hobby_photos').insert({ user_id: u.id, hobby: editAct.hobby, image_url: publicUrl, note: updated.note }).select().single()
            if (newP) setPhotos(prev => [newP, ...prev])
          }
        }
      }

      closeEdit()
    } finally { setEditPending(false) }
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11, paddingBottom: 12 }}>
          {activities.map(act => {
            const h = HOBBIES.find(x => x.value === act.hobby)
            const timeStr = formatTime(act.activity_at)
            const dateLabel = formatDateLabel(act.activity_at)
            const linkedPhoto = photos.find(p => p.hobby === act.hobby && p.note === act.note)
              ?? photos.find(p => p.hobby === act.hobby && !p.note)

            if (linkedPhoto) {
              return (
                <div key={act.id} onClick={() => user && openEdit(act, linkedPhoto)} style={{ borderRadius: 24, overflow: 'hidden', background: C.card, cursor: user ? 'pointer' : 'default' }}>
                  <img src={linkedPhoto.image_url} alt={act.hobby} style={{ width: '100%', display: 'block', objectFit: 'cover', maxHeight: 300 }} />
                  <div style={{ padding: '12px 13px 13px' }}>
                    {act.note && <p style={{ fontSize: 15, color: C.ink, margin: '0 0 10px', lineHeight: 1.4, fontWeight: 600 }}>{act.note}</p>}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 20, flexShrink: 0 }}>{h?.icon ?? '📷'}</span>
                        <b style={{ fontFamily: DP, fontSize: 13, fontWeight: 700 }}>{h?.label ?? act.hobby}</b>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: C.faint }}>{dateLabel} · {timeStr}</span>
                        {user && (
                          <>
                            <button onClick={e => { e.stopPropagation(); openEdit(act, linkedPhoto) }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: C.faint }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                            <button onClick={e => { e.stopPropagation(); handleDelete(act.id) }} disabled={deleting === act.id} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: C.faint, opacity: deleting === act.id ? 0.3 : 1 }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18M8 6V4h8v2m-9 0l1 14h8l1-14"/>
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            }

            {
              const text = act.note ?? 'Session logged'
              const SHORT = 120
              const LONG = 400
              const isShort = text.length <= SHORT
              const isVeryLong = text.length > LONG
              const isExpanded = expandedPosts.has(act.id)
              const toggleExpand = (e: React.MouseEvent) => {
                e.stopPropagation()
                setExpandedPosts(prev => {
                  const next = new Set(prev)
                  isExpanded ? next.delete(act.id) : next.add(act.id)
                  return next
                })
              }

              const editBtn = user && (
                <button onClick={() => openEdit(act)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: C.faint }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
              )
              const deleteBtn = user && (
                <button onClick={() => handleDelete(act.id)} disabled={deleting === act.id} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: C.faint, opacity: deleting === act.id ? 0.3 : 1 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M8 6V4h8v2m-9 0l1 14h8l1-14"/>
                  </svg>
                </button>
              )

              if (isVeryLong) return (
                <div key={act.id} style={{ borderRadius: 24, overflow: 'hidden', background: C.card, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: '14px 16px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: 18 }}>{h?.icon ?? '✨'}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.muted }}>{h?.label ?? act.hobby}</span>
                      <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600, color: C.muted }}>{dateLabel} · {timeStr}</span>
                      {editBtn}{deleteBtn}
                    </div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 500, lineHeight: 1.6, color: C.ink, textAlign: 'left', wordBreak: 'break-word', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: isExpanded ? 'unset' as any : 5, overflow: 'hidden' }}>
                      {text}
                    </p>
                    <button onClick={toggleExpand} style={{ background: 'none', border: 'none', padding: '6px 0 0', color: C.muted, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: UI }}>
                      {isExpanded ? 'Show less' : 'Read more'}
                    </button>
                  </div>
                </div>
              )

              if (!isShort) return (
                <div key={act.id} style={{ borderRadius: 24, overflow: 'hidden', background: C.card, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: '14px 16px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: 18 }}>{h?.icon ?? '✨'}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.muted }}>{h?.label ?? act.hobby}</span>
                      <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600, color: C.muted }}>{dateLabel} · {timeStr}</span>
                      {editBtn}{deleteBtn}
                    </div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 500, lineHeight: 1.6, color: C.ink, textAlign: 'left', wordBreak: 'break-word' }}>{text}</p>
                  </div>
                </div>
              )

              return (
                <div key={act.id} style={{ borderRadius: 24, overflow: 'hidden', background: C.card, minHeight: 130, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ padding: '20px 16px 12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: 22, fontWeight: 800, lineHeight: 1.25, color: C.ink, fontFamily: DP, wordBreak: 'break-word' }}>{text}</p>
                  </div>
                  <div style={{ padding: '0 16px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 18 }}>{h?.icon ?? '✨'}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: C.muted }}>{h?.label ?? act.hobby}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: C.muted }}>{dateLabel} · {timeStr}</span>
                      {user && (
                        <>
                          <button onClick={() => openEdit(act)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: C.muted }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button onClick={() => handleDelete(act.id)} disabled={deleting === act.id} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: C.muted, opacity: deleting === act.id ? 0.3 : 1 }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2m-9 0l1 14h8l1-14"/></svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            }
          })}
        </div>
      )}

      {/* Log activity button */}
      {user && (
        <button
          onClick={() => setAddOpen(true)}
          style={{
            width: '100%', border: 'none', borderRadius: 24, padding: 17,
            cursor: 'pointer', marginTop: 6,
            background: C.ink, color: C.bg,
            fontFamily: UI, fontSize: 15, fontWeight: 800,
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
              <Field label="Photo (optional)">
                <input ref={addFileRef} type="file" accept="image/*"  onChange={handleAddFileChange} style={{ display: 'none' }} />
                {addPhoto ? (
                  <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden' }}>
                    <img src={addPhoto} alt="captured" style={{ width: '100%', display: 'block', objectFit: 'cover', maxHeight: 160 }} />
                    <button onClick={() => { setAddPhoto(null); setAddPhotoFile(null) }} style={{ position: 'absolute', top: 8, right: 8, width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'rgba(34,25,15,.7)', color: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                    </button>
                  </div>
                ) : (
                  <button onClick={() => addFileRef.current?.click()} style={{ width: '100%', border: `2px dashed ${C.line}`, borderRadius: 16, padding: 20, cursor: 'pointer', background: C.card, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: C.muted, fontFamily: UI, fontSize: 14, fontWeight: 700 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                    Take photo
                  </button>
                )}
              </Field>
              {error && <p style={{ color: C.danger, fontSize: 12, fontWeight: 600, marginBottom: 8 }}>{error}</p>}
              <button
                onClick={handleAdd}
                disabled={isPending}
                style={{ width: '100%', border: 'none', borderRadius: 18, padding: 17, cursor: 'pointer', marginTop: 8, background: C.orange, color: 'var(--primary-foreground)', fontFamily: UI, fontSize: 15, fontWeight: 800, opacity: isPending ? 0.6 : 1 }}
              >
                {isPending ? 'Saving…' : 'Save activity'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Edit activity sheet ── */}
      {editAct && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(50,35,15,.4)', zIndex: 40 }} onClick={closeEdit} />
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
              <h2 style={{ fontFamily: DP, fontSize: 20, fontWeight: 800, margin: 0 }}>Edit activity</h2>
              <button onClick={closeEdit} style={{ width: 42, height: 42, borderRadius: 16, border: 'none', background: C.card, cursor: 'pointer', display: 'grid', placeItems: 'center', boxShadow: C.shadow }}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
              </button>
            </div>
            <div style={{ overflowY: 'auto', padding: '0 18px 18px' }}>
              <Field label="What did you do? *">
                <textarea
                  value={editNote}
                  onChange={e => setEditNote(e.target.value)}
                  placeholder="e.g. Cleaned bracelet, went for a ride"
                  rows={3}
                  style={inputStyle}
                />
              </Field>
              <div style={{ display: 'flex', gap: 10 }}>
                <Field label="Location" style={{ flex: 1 }}>
                  <input value={editLocation} onChange={e => setEditLocation(e.target.value)} placeholder="e.g. Home, Garage" style={inputStyle} />
                </Field>
                <Field label="Date & time" style={{ flex: 1 }}>
                  <input type="datetime-local" value={editActivityAt} onChange={e => setEditActivityAt(e.target.value)} style={inputStyle} />
                </Field>
              </div>
              <Field label="Photo (optional)">
                <input ref={editFileRef} type="file" accept="image/*"  onChange={handleEditFileChange} style={{ display: 'none' }} />
                {editDeletePhoto ? (
                  <div style={{ borderRadius: 16, border: `2px dashed ${C.line}`, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: C.card }}>
                    <span style={{ fontSize: 13, color: C.danger, fontWeight: 600 }}>Photo will be deleted</span>
                    <button onClick={() => setEditDeletePhoto(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: C.muted }}>Undo</button>
                  </div>
                ) : editPreview || editPhoto ? (
                  <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden' }}>
                    <img src={editPreview ?? editPhoto!.image_url} alt="" style={{ width: '100%', display: 'block', objectFit: 'cover', maxHeight: 160 }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span onClick={() => editFileRef.current?.click()} style={{ color: '#fff', fontFamily: UI, fontSize: 13, fontWeight: 700, background: 'rgba(0,0,0,.4)', padding: '6px 14px', borderRadius: 20, cursor: 'pointer' }}>Change photo</span>
                    </div>
                    <button onClick={() => { setEditDeletePhoto(true); setEditNewFile(null); setEditPreview(null) }} style={{ position: 'absolute', top: 8, right: 8, zIndex: 1, width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'rgba(34,25,15,.7)', color: '#F87171', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2m-9 0l1 14h8l1-14"/></svg>
                    </button>
                  </div>
                ) : (
                  <button onClick={() => editFileRef.current?.click()} style={{ width: '100%', border: `2px dashed ${C.line}`, borderRadius: 16, padding: 20, cursor: 'pointer', background: C.card, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: C.muted, fontFamily: UI, fontSize: 14, fontWeight: 700 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                    Take photo
                  </button>
                )}
              </Field>
              {editError && <p style={{ color: C.danger, fontSize: 12, fontWeight: 600, marginBottom: 8 }}>{editError}</p>}
              <button
                onClick={handleEdit}
                disabled={editPending}
                style={{ width: '100%', border: 'none', borderRadius: 18, padding: 17, cursor: 'pointer', marginTop: 8, background: C.orange, color: 'var(--primary-foreground)', fontFamily: UI, fontSize: 15, fontWeight: 800, opacity: editPending ? 0.6 : 1 }}
              >
                {editPending ? 'Saving…' : 'Save changes'}
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
      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: 'var(--muted-foreground)', marginBottom: 8 }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'var(--background)', border: '1.5px solid var(--border)',
  borderRadius: 16, color: 'var(--foreground)',
  fontFamily: "'Inter', -apple-system, system-ui, sans-serif",
  fontSize: 15, fontWeight: 500, padding: '13px 15px', outline: 'none',
  boxSizing: 'border-box', resize: 'none',
}
