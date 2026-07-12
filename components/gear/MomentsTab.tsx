'use client'

import { useState, useRef } from 'react'
import type { User } from '@supabase/supabase-js'
import type { HobbyPhoto } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

const C = {
  bg: '#FDF7EE', card: '#FFFFFF', line: '#EFE6D6',
  ink: '#22190F', muted: '#8D8271', faint: '#B8AD9A',
  orange: '#FF7A2F',
  danger: '#E9573F',
  shadow: '0 6px 18px rgba(84,62,32,.08)',
}
const DP = 'var(--font-bricolage), system-ui, sans-serif'
const UI = "'Inter', -apple-system, system-ui, sans-serif"
const MAX_PHOTOS = 6

interface Props {
  hobby: string
  photos: HobbyPhoto[]
  user: User | null
}

export function MomentsTab({ hobby, photos: initialPhotos, user }: Props) {
  const [photos, setPhotos]       = useState(initialPhotos)
  const [addOpen, setAddOpen]     = useState(false)
  const [preview, setPreview]     = useState<string | null>(null)
  const [file, setFile]           = useState<File | null>(null)
  const [note, setNote]           = useState('')
  const [error, setError]         = useState('')
  const [viewPhoto, setViewPhoto] = useState<HobbyPhoto | null>(null)
  const [isPending, setIsPending] = useState(false)
  const fileRef                   = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    const reader = new FileReader()
    reader.onload = ev => setPreview(ev.target?.result as string)
    reader.readAsDataURL(f)
  }

  function resetForm() {
    setFile(null); setPreview(null); setNote(''); setError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleAdd() {
    if (!file) return setError('Please select a photo')
    setError(''); setIsPending(true)
    try {
      const supabase = createClient()
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) { setError('Not authenticated'); return }

      const ext  = file.name.split('.').pop() || 'jpg'
      const path = `${u.id}/hobby/${hobby}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('wardrobe').upload(path, file, { contentType: file.type })
      if (upErr) { setError(`Upload failed: ${upErr.message}`); return }

      const { data: { publicUrl } } = supabase.storage.from('wardrobe').getPublicUrl(path)

      if (photos.length >= MAX_PHOTOS) {
        const oldest = [...photos].sort((a, b) => a.created_at.localeCompare(b.created_at))[0]
        const oldPath = oldest.image_url.match(/\/wardrobe\/(.+)$/)?.[1]
        if (oldPath) await supabase.storage.from('wardrobe').remove([oldPath])
        await supabase.from('hobby_photos').delete().eq('id', oldest.id)
        setPhotos(prev => prev.filter(p => p.id !== oldest.id))
      }

      const { data: inserted, error: dbErr } = await supabase.from('hobby_photos').insert({
        user_id: u.id, hobby, image_url: publicUrl, note: note || null,
      }).select().single()
      if (dbErr) { setError(dbErr.message); return }

      setPhotos(prev => [inserted as HobbyPhoto, ...prev])
      resetForm(); setAddOpen(false)
    } finally { setIsPending(false) }
  }

  async function handleDelete(photo: HobbyPhoto) {
    const supabase = createClient()
    const path = photo.image_url.match(/\/wardrobe\/(.+)$/)?.[1]
    if (path) await supabase.storage.from('wardrobe').remove([path])
    await supabase.from('hobby_photos').delete().eq('id', photo.id)
    setPhotos(prev => prev.filter(p => p.id !== photo.id))
    setViewPhoto(null)
  }

  return (
    <div style={{ padding: '0 18px 40px' }}>
      {/* Count + add */}
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.faint, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {photos.length} / {MAX_PHOTOS} moments
          </span>
          <button
            onClick={() => setAddOpen(true)}
            style={{
              border: 'none', borderRadius: 99, padding: '9px 16px', cursor: 'pointer',
              background: C.orange, color: '#fff', fontFamily: UI, fontSize: 13, fontWeight: 700,
              boxShadow: '0 6px 14px rgba(255,122,47,.35)',
            }}
          >
            📸 Add photo
          </button>
        </div>
      )}

      {/* Empty */}
      {photos.length === 0 && (
        <div style={{ padding: '40px 0 20px', textAlign: 'center', color: C.muted }}>
          <div style={{ width: 56, height: 56, borderRadius: 20, background: C.card, boxShadow: C.shadow, display: 'grid', placeItems: 'center', margin: '0 auto 12px', fontSize: 24 }}>📸</div>
          <b style={{ display: 'block', color: C.ink, fontFamily: DP, fontSize: 15, fontWeight: 700, marginBottom: 3 }}>No moments yet</b>
          <p style={{ fontSize: 13 }}>{user ? `Capture up to ${MAX_PHOTOS} photos` : 'Sign in to add moments'}</p>
        </div>
      )}

      {/* Masonry grid */}
      {photos.length > 0 && (
        <div style={{ columns: 2, columnGap: 11 }}>
          {photos.map(p => (
            <div
              key={p.id}
              onClick={() => setViewPhoto(p)}
              style={{
                borderRadius: 16, marginBottom: 11, overflow: 'hidden',
                position: 'relative', breakInside: 'avoid', boxShadow: C.shadow, cursor: 'pointer',
              }}
            >
              <img src={p.image_url} alt={p.note ?? ''} style={{ width: '100%', display: 'block', objectFit: 'cover' }} />
              {p.note && (
                <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '24px 11px 9px', fontSize: 11, fontWeight: 700, color: '#fff', background: 'linear-gradient(transparent,rgba(30,20,5,.72))' }}>
                  {p.note}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Add photo sheet ── */}
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
              <h2 style={{ fontFamily: DP, fontSize: 20, fontWeight: 800, margin: 0 }}>Add moment</h2>
              <button onClick={() => { setAddOpen(false); resetForm() }} style={{ width: 42, height: 42, borderRadius: 16, border: 'none', background: C.card, cursor: 'pointer', display: 'grid', placeItems: 'center', boxShadow: C.shadow }}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
              </button>
            </div>
            <div style={{ overflowY: 'auto', padding: '0 18px 18px' }}>
              {/* Photo picker */}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                style={{
                  width: '100%', aspectRatio: '16/9', border: preview ? 'none' : '2px dashed #EFE6D6',
                  borderRadius: 16, background: preview ? 'transparent' : C.card,
                  display: 'grid', placeItems: 'center', cursor: 'pointer',
                  overflow: 'hidden', marginBottom: 16, color: C.muted, padding: 0,
                }}
              >
                {preview ? (
                  <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>📷</div>
                    <b style={{ fontSize: 13, fontWeight: 700, color: C.muted }}>Tap to add photo</b>
                  </div>
                )}
              </button>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} style={{ display: 'none' }} />

              {photos.length >= MAX_PHOTOS && (
                <p style={{ fontSize: 12, color: '#D97706', background: '#FEF3C7', borderRadius: 12, padding: '10px 14px', marginBottom: 12 }}>
                  Oldest photo will be removed automatically.
                </p>
              )}

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: C.muted, marginBottom: 8 }}>Note (optional)</label>
                <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Add a caption…" rows={2} style={{ width: '100%', background: C.card, border: '1.5px solid #EFE6D6', borderRadius: 16, color: C.ink, fontFamily: UI, fontSize: 15, fontWeight: 500, padding: '13px 15px', outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
              </div>

              {error && <p style={{ color: C.danger, fontSize: 12, fontWeight: 600, marginBottom: 8 }}>{error}</p>}

              <button
                onClick={handleAdd}
                disabled={isPending || !file}
                style={{ width: '100%', border: 'none', borderRadius: 18, padding: 17, cursor: 'pointer', background: C.orange, color: '#fff', fontFamily: UI, fontSize: 15, fontWeight: 800, boxShadow: '0 10px 22px rgba(255,122,47,.35)', opacity: isPending || !file ? 0.5 : 1 }}
              >
                {isPending ? 'Uploading…' : 'Save moment'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── View photo ── */}
      {viewPhoto && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,.9)', display: 'flex', flexDirection: 'column' }} onClick={() => setViewPhoto(null)}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'calc(14px + env(safe-area-inset-top,0px)) 18px 12px' }} onClick={e => e.stopPropagation()}>
            <span style={{ color: 'rgba(255,255,255,.6)', fontSize: 13 }}>{new Date(viewPhoto.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <div style={{ display: 'flex', gap: 10 }}>
              {user && (
                <button onClick={() => handleDelete(viewPhoto)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#F87171', padding: 8 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2m-9 0l1 14h8l1-14"/></svg>
                </button>
              )}
              <button onClick={() => setViewPhoto(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.6)', padding: 8 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
              </button>
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 18px' }} onClick={() => setViewPhoto(null)}>
            <img src={viewPhoto.image_url} alt={viewPhoto.note ?? ''} style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 22, objectFit: 'contain' }} onClick={e => e.stopPropagation()} />
          </div>
          {viewPhoto.note && (
            <div style={{ padding: '12px 18px calc(env(safe-area-inset-bottom,0px) + 24px)' }} onClick={e => e.stopPropagation()}>
              <p style={{ color: '#fff', fontSize: 14, lineHeight: 1.5 }}>{viewPhoto.note}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
