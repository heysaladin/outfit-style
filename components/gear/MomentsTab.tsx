'use client'

import { useState, useRef } from 'react'
import { X, Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import type { HobbyPhoto } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { MobileButton } from 'cubicle-ds/src/components/mobileapp/MobileButton'
import { MobileFormField } from 'cubicle-ds/src/components/mobileapp/MobileFormField'
import { MobileEmptyState } from 'cubicle-ds/src/components/mobileapp/MobileEmptyState'

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
    <div className="px-4 pb-10">
      {/* Count + add */}
      {user && (
        <div className="flex items-center justify-between mb-3.5">
          <span className="text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wider">
            {photos.length} / {MAX_PHOTOS} moments
          </span>
          <MobileButton size="sm" onClick={() => setAddOpen(true)} className="h-9 px-4 rounded-xl text-xs font-extrabold">
            📸 Add photo
          </MobileButton>
        </div>
      )}

      {/* Empty */}
      {photos.length === 0 && (
        <MobileEmptyState
          icon={<span className="text-4xl">📸</span>}
          title="No moments yet"
          description={user ? `Capture up to ${MAX_PHOTOS} photos` : 'Sign in to add moments'}
        />
      )}

      {/* Masonry grid */}
      {photos.length > 0 && (
        <div style={{ columns: 2, columnGap: 11 }}>
          {photos.map(p => (
            <div
              key={p.id}
              onClick={() => setViewPhoto(p)}
              className="rounded-2xl mb-2.5 overflow-hidden relative cursor-pointer break-inside-avoid"
            >
              <img src={p.image_url} alt={p.note ?? ''} className="w-full block object-cover" />
              {p.note && (
                <div
                  className="absolute left-0 right-0 bottom-0 px-3 pb-2 pt-6 text-[11px] font-bold text-white"
                  style={{ background: 'linear-gradient(transparent,rgba(30,20,5,.72))' }}
                >
                  {p.note}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add photo sheet */}
      {addOpen && (
        <Sheet title="Add moment" onClose={() => { setAddOpen(false); resetForm() }}>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full mb-4 rounded-2xl overflow-hidden cursor-pointer grid place-items-center"
            style={{
              aspectRatio: '16/9',
              border: preview ? 'none' : '2px dashed var(--border)',
              background: preview ? 'transparent' : 'var(--card)',
            }}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-muted-foreground">
                <div className="text-2xl mb-1.5">📷</div>
                <b className="text-[13px] font-bold">Tap to add photo</b>
              </div>
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

          {photos.length >= MAX_PHOTOS && (
            <p className="text-[12px] text-amber-600 bg-amber-50 dark:bg-amber-950/30 rounded-xl px-3.5 py-2.5 mb-3">
              Oldest photo will be removed automatically.
            </p>
          )}

          <MobileFormField
            label="Note (optional)"
            value={note}
            onChange={setNote}
            placeholder="Add a caption…"
            multiline
            rows={2}
          />

          {error && <p className="text-xs text-destructive font-semibold mb-2">{error}</p>}

          <MobileButton fullWidth loading={isPending} onClick={handleAdd} disabled={!file} className="rounded-xl mt-2">
            Save moment
          </MobileButton>
        </Sheet>
      )}

      {/* View photo */}
      {viewPhoto && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex flex-col"
          onClick={() => setViewPhoto(null)}
        >
          <div
            className="flex items-center justify-between px-4 pb-3 flex-shrink-0"
            style={{ paddingTop: 'calc(14px + env(safe-area-inset-top,0px))' }}
            onClick={e => e.stopPropagation()}
          >
            <span className="text-white/60 text-[13px]">
              {new Date(viewPhoto.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <div className="flex gap-2.5">
              {user && (
                <button onClick={() => handleDelete(viewPhoto)} className="p-2 text-red-400">
                  <Trash2 size={18} />
                </button>
              )}
              <button onClick={() => setViewPhoto(null)} className="p-2 text-white/60">
                <X size={20} />
              </button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center px-4 min-h-0" onClick={() => setViewPhoto(null)}>
            <img
              src={viewPhoto.image_url}
              alt={viewPhoto.note ?? ''}
              className="max-w-full max-h-full rounded-3xl object-contain"
              onClick={e => e.stopPropagation()}
            />
          </div>
          {viewPhoto.note && (
            <div
              className="px-4 pt-3 text-white text-[14px] leading-relaxed flex-shrink-0"
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom,0px) + 24px)' }}
              onClick={e => e.stopPropagation()}
            >
              {viewPhoto.note}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Sheet primitive (fixed, Cubicle-styled) ────────────────────────────────

function Sheet({ children, onClose, title }: { children: ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full bg-background rounded-t-2xl max-h-[88dvh] flex flex-col shadow-2xl">
        <div className="mx-auto mt-2.5 h-1 w-9 rounded-full bg-muted-foreground/30 flex-shrink-0" />
        <div className="px-5 pt-3 pb-2 flex-shrink-0">
          <h2 className="text-xl font-extrabold tracking-tight">{title}</h2>
        </div>
        <div className="overflow-y-auto flex-1 px-5" style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom,0px))' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
