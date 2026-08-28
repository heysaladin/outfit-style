'use client'

import { useState, useRef } from 'react'
import { X, Pencil, Trash2, Camera } from 'lucide-react'
import type { ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { HOBBIES, type HobbyActivity, type HobbyPhoto } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { formatRelative as fmtRelative, formatDateLabel, formatTime, defaultDatetimeLocal } from '@/lib/date'
import { MobileButton } from 'cubicle-ds/src/components/mobileapp/MobileButton'
import { MobileFormField } from 'cubicle-ds/src/components/mobileapp/MobileFormField'
import { MobileEmptyState } from 'cubicle-ds/src/components/mobileapp/MobileEmptyState'

const inputCls = "w-full bg-background border border-border rounded-xl px-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground outline-none box-border"

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
    if (!editNote.trim() && !editAct.outfit_id) return setEditError('Please add a note')
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
    <div className="px-4 pb-10">
      {/* Activity list */}
      {activities.length === 0 ? (
        <MobileEmptyState
          icon={<span className="text-4xl">⏱️</span>}
          title="No activities yet"
          description={user ? 'Log your first session below' : 'Sign in to log activities'}
        />
      ) : (
        <div className="flex flex-col gap-2.5 pb-3">
          {activities.map(act => {
            const h = HOBBIES.find(x => x.value === act.hobby)
            const timeStr = formatTime(act.activity_at)
            const dateLabel = formatDateLabel(act.activity_at)

            const outfitItems =
              act.outfit_snapshot?.length
                ? act.outfit_snapshot
                : act.outfits?.outfit_items?.map((oi: { wardrobe_items: unknown }) => oi.wardrobe_items).filter(Boolean) ?? []
            const outfitLabel = act.outfits?.name ?? 'Outfit'

            if (outfitItems.length > 0 && (act.outfit_snapshot?.length || act.outfits)) {
              return (
                <div key={act.id} className="rounded-3xl overflow-hidden bg-card">
                  <div className="px-3.5 pt-3.5 pb-2.5 flex items-center justify-between">
                    <span className="text-[12px] font-bold text-muted-foreground">👗 {outfitLabel}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] font-semibold text-muted-foreground">{dateLabel}</span>
                      {user && (
                        <>
                          <button onClick={() => openEdit(act)} className="p-1 text-muted-foreground">
                            <Pencil size={12} />
                          </button>
                          <button onClick={() => handleDelete(act.id)} disabled={deleting === act.id} className="p-1 text-muted-foreground transition-opacity disabled:opacity-30">
                            <Trash2 size={12} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 overflow-x-auto px-3.5 pb-3" style={{ scrollbarWidth: 'none' }}>
                    {outfitItems.map((item: { image_url: string; name: string }, i: number) => (
                      <div key={i} className="w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden border border-border">
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  {act.note && (
                    <p className="px-3.5 pb-3.5 text-[14px] font-medium text-foreground leading-relaxed m-0">{act.note}</p>
                  )}
                </div>
              )
            }

            const linkedPhoto = photos.find(p => p.hobby === act.hobby && p.note === act.note)
              ?? photos.find(p => p.hobby === act.hobby && !p.note)

            if (linkedPhoto) {
              return (
                <div
                  key={act.id}
                  onClick={() => user && openEdit(act, linkedPhoto)}
                  className="rounded-3xl overflow-hidden bg-card"
                  style={{ cursor: user ? 'pointer' : 'default' }}
                >
                  <img src={linkedPhoto.image_url} alt={act.hobby} className="w-full block object-cover max-h-[300px]" />
                  <div className="px-3 pb-3 pt-3">
                    {act.note && <p className="text-[15px] text-foreground mb-2.5 leading-snug font-semibold">{act.note}</p>}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl flex-shrink-0">{h?.icon ?? '📷'}</span>
                        <b className="text-[13px] font-bold">{h?.label ?? act.hobby}</b>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] font-semibold text-muted-foreground">{dateLabel} · {timeStr}</span>
                        {user && (
                          <>
                            <button onClick={e => { e.stopPropagation(); openEdit(act, linkedPhoto) }} className="p-1 text-muted-foreground">
                              <Pencil size={12} />
                            </button>
                            <button onClick={e => { e.stopPropagation(); handleDelete(act.id) }} disabled={deleting === act.id} className="p-1 text-muted-foreground transition-opacity disabled:opacity-30">
                              <Trash2 size={12} />
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

              const editDeleteBtns = user && (
                <div className="flex items-center gap-0.5">
                  <button onClick={() => openEdit(act)} className="p-1 text-muted-foreground">
                    <Pencil size={12} />
                  </button>
                  <button onClick={() => handleDelete(act.id)} disabled={deleting === act.id} className="p-1 text-muted-foreground transition-opacity disabled:opacity-30">
                    <Trash2 size={12} />
                  </button>
                </div>
              )

              if (isVeryLong) return (
                <div key={act.id} className="rounded-3xl overflow-hidden bg-card flex flex-col">
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="text-[18px]">{h?.icon ?? '✨'}</span>
                      <span className="text-[13px] font-semibold text-muted-foreground">{h?.label ?? act.hobby}</span>
                      <span className="ml-auto text-[11px] font-semibold text-muted-foreground">{dateLabel} · {timeStr}</span>
                      {editDeleteBtns}
                    </div>
                    <p
                      className="m-0 text-[14px] font-medium leading-relaxed text-foreground break-words text-left overflow-hidden"
                      style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: isExpanded ? 'unset' as unknown as number : 5 }}
                    >
                      {text}
                    </p>
                    <button onClick={toggleExpand} className="mt-1.5 text-[13px] font-bold text-muted-foreground bg-transparent border-0 p-0 cursor-pointer">
                      {isExpanded ? 'Show less' : 'Read more'}
                    </button>
                  </div>
                </div>
              )

              if (!isShort) return (
                <div key={act.id} className="rounded-3xl overflow-hidden bg-card flex flex-col">
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="text-[18px]">{h?.icon ?? '✨'}</span>
                      <span className="text-[13px] font-semibold text-muted-foreground">{h?.label ?? act.hobby}</span>
                      <span className="ml-auto text-[11px] font-semibold text-muted-foreground">{dateLabel} · {timeStr}</span>
                      {editDeleteBtns}
                    </div>
                    <p className="m-0 text-[14px] font-medium leading-relaxed text-foreground break-words text-left">{text}</p>
                  </div>
                </div>
              )

              return (
                <div key={act.id} className="rounded-3xl overflow-hidden bg-card min-h-[130px] flex flex-col justify-between">
                  <div className="px-4 pt-5 pb-3 flex-1 flex flex-col justify-center items-center text-center">
                    <p className="m-0 text-[22px] font-extrabold leading-tight text-foreground break-words">{text}</p>
                  </div>
                  <div className="px-4 pb-3.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[18px]">{h?.icon ?? '✨'}</span>
                      <span className="text-[12px] font-semibold text-muted-foreground">{h?.label ?? act.hobby}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] font-semibold text-muted-foreground">{dateLabel} · {timeStr}</span>
                      {editDeleteBtns}
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
        <MobileButton fullWidth onClick={() => setAddOpen(true)} className="rounded-2xl mt-1.5">
          + Log activity
        </MobileButton>
      )}

      {/* Log activity sheet */}
      {addOpen && (
        <Sheet title="Log activity" onClose={() => { setAddOpen(false); resetForm() }}>
          <div className="space-y-4 pb-1">
            <MobileFormField
              label="What did you do? *"
              value={note}
              onChange={setNote}
              placeholder="e.g. Cleaned bracelet, went for a ride"
              multiline
              rows={3}
            />
            <div className="grid grid-cols-2 gap-2.5">
              <MobileFormField
                label="Location"
                value={location}
                onChange={setLocation}
                placeholder="e.g. Home, Garage"
              />
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Date & time</label>
                <input type="datetime-local" value={activityAt} onChange={e => setActivityAt(e.target.value)} className={inputCls} />
              </div>
            </div>

            {/* Photo */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Photo (optional)</label>
              <input ref={addFileRef} type="file" accept="image/*" onChange={handleAddFileChange} className="hidden" />
              {addPhoto ? (
                <div className="relative rounded-2xl overflow-hidden">
                  <img src={addPhoto} alt="captured" className="w-full block object-cover max-h-[160px]" />
                  <button
                    onClick={() => { setAddPhoto(null); setAddPhotoFile(null) }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => addFileRef.current?.click()}
                  className="w-full border-2 border-dashed border-border rounded-2xl py-5 flex items-center justify-center gap-2.5 bg-card text-muted-foreground text-[14px] font-bold"
                >
                  <Camera size={20} />
                  Take photo
                </button>
              )}
            </div>

            {error && <p className="text-xs text-destructive font-semibold">{error}</p>}
            <MobileButton fullWidth loading={isPending} onClick={handleAdd} className="rounded-xl">
              Save activity
            </MobileButton>
          </div>
        </Sheet>
      )}

      {/* Edit activity sheet */}
      {editAct && (
        <Sheet title="Edit activity" onClose={closeEdit}>
          <div className="space-y-4 pb-1">
            <MobileFormField
              label="What did you do? *"
              value={editNote}
              onChange={setEditNote}
              placeholder="e.g. Cleaned bracelet, went for a ride"
              multiline
              rows={3}
            />
            <div className="grid grid-cols-2 gap-2.5">
              <MobileFormField
                label="Location"
                value={editLocation}
                onChange={setEditLocation}
                placeholder="e.g. Home, Garage"
              />
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Date & time</label>
                <input type="datetime-local" value={editActivityAt} onChange={e => setEditActivityAt(e.target.value)} className={inputCls} />
              </div>
            </div>

            {/* Photo */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Photo (optional)</label>
              <input ref={editFileRef} type="file" accept="image/*" onChange={handleEditFileChange} className="hidden" />
              {editDeletePhoto ? (
                <div className="rounded-2xl border-2 border-dashed border-border px-4 py-4 flex items-center justify-between bg-card">
                  <span className="text-[13px] text-destructive font-semibold">Photo will be deleted</span>
                  <button onClick={() => setEditDeletePhoto(false)} className="text-[12px] font-bold text-muted-foreground bg-transparent border-0 cursor-pointer">Undo</button>
                </div>
              ) : editPreview || editPhoto ? (
                <div className="relative rounded-2xl overflow-hidden">
                  <img src={editPreview ?? editPhoto!.image_url} alt="" className="w-full block object-cover max-h-[160px]" />
                  <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                    <span
                      onClick={() => editFileRef.current?.click()}
                      className="text-white text-[13px] font-bold bg-black/40 px-3.5 py-1.5 rounded-full cursor-pointer"
                    >
                      Change photo
                    </span>
                  </div>
                  <button
                    onClick={() => { setEditDeletePhoto(true); setEditNewFile(null); setEditPreview(null) }}
                    className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-black/60 text-red-400 flex items-center justify-center"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => editFileRef.current?.click()}
                  className="w-full border-2 border-dashed border-border rounded-2xl py-5 flex items-center justify-center gap-2.5 bg-card text-muted-foreground text-[14px] font-bold"
                >
                  <Camera size={20} />
                  Take photo
                </button>
              )}
            </div>

            {editError && <p className="text-xs text-destructive font-semibold">{editError}</p>}
            <MobileButton fullWidth loading={editPending} onClick={handleEdit} className="rounded-xl">
              Save changes
            </MobileButton>
          </div>
        </Sheet>
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
