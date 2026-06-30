'use client'

import { useState, useRef } from 'react'
import { Trash2, X, Camera } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import type { HobbyPhoto } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

const MAX_PHOTOS = 6

interface MomentsTabProps {
  hobby: string
  photos: HobbyPhoto[]
  user: User | null
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function MomentsTab({ hobby, photos: initialPhotos, user }: MomentsTabProps) {
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
    setFile(null)
    setPreview(null)
    setNote('')
    setError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleAdd() {
    if (!file) return setError('Please select a photo')
    setError('')
    setIsPending(true)
    try {
      const supabase = createClient()
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) { setError('Not authenticated'); return }

      const ext  = file.name.split('.').pop() || 'jpg'
      const path = `${u.id}/hobby/${hobby}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('wardrobe').upload(path, file, { contentType: file.type })
      if (upErr) { setError(`Upload failed: ${upErr.message}`); return }

      const { data: { publicUrl } } = supabase.storage.from('wardrobe').getPublicUrl(path)

      // remove oldest if over limit
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
      resetForm()
      setAddOpen(false)
    } finally {
      setIsPending(false)
    }
  }

  async function handleDelete(photo: HobbyPhoto) {
    const supabase = createClient()
    const path = photo.image_url.match(/\/wardrobe\/(.+)$/)?.[1]
    if (path) await supabase.storage.from('wardrobe').remove([path])
    await supabase.from('hobby_photos').delete().eq('id', photo.id)
    setPhotos(prev => prev.filter(p => p.id !== photo.id))
    setViewPhoto(null)
  }

  const canAdd = user && photos.length < MAX_PHOTOS || (user && photos.length >= MAX_PHOTOS)

  return (
    <div className="pb-8">
      {/* Count indicator + add button */}
      {user && (
        <div className="px-4 pt-4 pb-3 flex items-center justify-between">
          <span className="text-muted-foreground text-xs font-medium">
            {photos.length}/{MAX_PHOTOS} moments
            {photos.length >= MAX_PHOTOS && (
              <span className="ml-1.5 text-amber-500">(oldest will be removed)</span>
            )}
          </span>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1.5 bg-foreground text-background text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-80 transition-opacity"
          >
            <Camera size={13} />
            Add Photo
          </button>
        </div>
      )}

      {/* Photo grid */}
      {photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
          <Camera size={36} className="text-border mb-3" />
          <p className="text-foreground font-semibold text-sm">No moments yet</p>
          <p className="text-muted-foreground text-xs mt-1">
            {user ? 'Capture up to 6 photos per hobby' : 'Sign in to add moments'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 px-4">
          {photos.map(photo => (
            <button
              key={photo.id}
              onClick={() => setViewPhoto(photo)}
              className="relative aspect-square rounded-2xl overflow-hidden bg-muted active:scale-95 transition-transform"
            >
              <img src={photo.image_url} alt={photo.note ?? ''} className="w-full h-full object-cover" />
              {photo.note && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2">
                  <p className="text-white text-[11px] leading-tight line-clamp-2">{photo.note}</p>
                </div>
              )}
              <div className="absolute top-2 right-2 bg-black/40 rounded-full px-1.5 py-0.5">
                <span className="text-white text-[10px]">{formatDate(photo.created_at)}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Add photo modal */}
      {addOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end" onClick={() => { setAddOpen(false); resetForm() }}>
          <div
            className="w-full bg-background rounded-t-3xl border-t border-border max-h-[92vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3 mb-1" />
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <h2 className="text-foreground font-bold text-base">Add Moment</h2>
              <button onClick={() => { setAddOpen(false); resetForm() }} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4 pb-10">
              {/* Photo picker */}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full aspect-video rounded-2xl border-2 border-dashed border-border bg-muted flex flex-col items-center justify-center gap-2 hover:border-foreground/30 transition-colors overflow-hidden"
              >
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Camera size={28} className="text-muted-foreground" />
                    <span className="text-muted-foreground text-sm">Tap to select photo</span>
                  </>
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />

              {photos.length >= MAX_PHOTOS && (
                <p className="text-amber-500 text-xs bg-amber-500/10 rounded-xl px-3 py-2">
                  You already have {MAX_PHOTOS} photos. The oldest one will be removed automatically.
                </p>
              )}

              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Add a note (optional)"
                rows={2}
                className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground text-sm outline-none focus:border-primary/50 resize-none"
              />

              {error && <p className="text-destructive text-xs font-medium">{error}</p>}

              <button
                onClick={handleAdd}
                disabled={isPending || !file}
                className="w-full bg-foreground text-background font-semibold py-3.5 rounded-xl text-sm disabled:opacity-40 hover:opacity-80 transition-opacity"
              >
                {isPending ? 'Uploading...' : 'Save Moment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View photo modal */}
      {viewPhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col" onClick={() => setViewPhoto(null)}>
          <div className="flex items-center justify-between px-5 pt-14 pb-3" onClick={e => e.stopPropagation()}>
            <p className="text-white/60 text-sm">{formatDate(viewPhoto.created_at)}</p>
            <div className="flex items-center gap-3">
              {user && (
                <button
                  onClick={() => handleDelete(viewPhoto)}
                  disabled={isPending}
                  className="p-2 text-red-400 hover:text-red-300 transition-colors disabled:opacity-40"
                >
                  <Trash2 size={18} />
                </button>
              )}
              <button onClick={() => setViewPhoto(null)} className="p-2 text-white/60 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center px-4" onClick={() => setViewPhoto(null)}>
            <img
              src={viewPhoto.image_url}
              alt={viewPhoto.note ?? ''}
              className="max-w-full max-h-full rounded-2xl object-contain"
              onClick={e => e.stopPropagation()}
            />
          </div>
          {viewPhoto.note && (
            <div className="px-5 py-4 pb-10" onClick={e => e.stopPropagation()}>
              <p className="text-white text-sm leading-relaxed">{viewPhoto.note}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
