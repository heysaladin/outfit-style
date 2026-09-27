'use client'

import { useState, useTransition } from 'react'
import { Plus, Trash2, X, Pencil, BookImage, Check, Loader2, Search, MoreHorizontal } from 'lucide-react'
import type { Lookbook, LookbookPhoto, Outfit, WardrobeItem } from '@/lib/types'
import {
  createLookbook, renameLookbook, setLookbookTag, deleteLookbook,
  addLookbookPhoto, updateLookbookPhoto, deleteLookbookPhoto,
  linkOutfitToPhoto, unlinkOutfitFromPhoto,
} from '@/app/actions'

const LOOKBOOK_TAGS = ['Casual', 'Heritage', 'Preppy', 'Formal', 'Functional'] as const
const PHOTO_TAGS = LOOKBOOK_TAGS

interface LookbookTabProps {
  lookbooks: Lookbook[]
  outfits: Outfit[]
  creating: boolean
  onCreateClose: () => void
}

function OutfitThumb({ outfit }: { outfit: Outfit }) {
  const item = (outfit.outfit_items ?? [])
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map(oi => oi.wardrobe_items as WardrobeItem)
    .filter(Boolean)[0]
  if (!item) return <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center text-sm flex-shrink-0">👗</div>
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={item.image_url} alt="" className="w-8 h-8 rounded-lg object-cover border border-border flex-shrink-0" />
}

function PhotoRow({ photo, outfits, onDelete, isPending, startTransition }: {
  photo: LookbookPhoto
  outfits: Outfit[]
  onDelete: () => void
  isPending: boolean
  startTransition: (fn: () => Promise<void>) => void
}) {
  // Outfit picker state
  const [showPicker, setShowPicker] = useState(false)
  const [search, setSearch] = useState('')
  const linkedIds = new Set((photo.lookbook_photo_outfits ?? []).map(lpo => lpo.outfit_id))
  const [draft, setDraft] = useState<Set<string>>(new Set(linkedIds))

  function openPicker() { setDraft(new Set(linkedIds)); setSearch(''); setShowPicker(true) }
  function toggleDraft(id: string) {
    setDraft(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  function handleSaveOutfits() {
    startTransition(async () => {
      const toAdd    = [...draft].filter(id => !linkedIds.has(id))
      const toRemove = [...linkedIds].filter(id => !draft.has(id))
      await Promise.all([
        ...toAdd.map(id    => linkOutfitToPhoto(photo.id, id)),
        ...toRemove.map(id => unlinkOutfitFromPhoto(photo.id, id)),
      ])
      setShowPicker(false)
    })
  }

  // Photo edit state
  const [photoMenu, setPhotoMenu]             = useState(false)
  const [confirmDeletePhoto, setConfirmDeletePhoto] = useState(false)
  const [editingPhoto, setEditingPhoto]       = useState(false)
  const [editUrl, setEditUrl]                 = useState('')
  const [editTitle, setEditTitle]             = useState('')
  const [editTag, setEditTag]                 = useState('')

  function openEdit() {
    setEditUrl(photo.image_url)
    setEditTitle(photo.caption ?? '')
    setEditTag(photo.tag ?? '')
    setEditingPhoto(true)
    setPhotoMenu(false)
  }
  function handleEditSave() {
    if (!editUrl.trim()) return
    startTransition(async () => {
      await updateLookbookPhoto(photo.id, editUrl.trim(), editTitle.trim() || undefined, editTag || undefined)
      setEditingPhoto(false)
    })
  }

  const linkedOutfits = outfits.filter(o => linkedIds.has(o.id))
  const filteredOutfits = search.trim()
    ? outfits.filter(o => o.name.toLowerCase().includes(search.toLowerCase()))
    : outfits

  return (
    <div className="flex flex-col gap-2">
      {/* Photo image */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-border bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.image_url} alt={photo.caption ?? ''} className="w-full h-auto block" />
        <button
          onClick={() => { setPhotoMenu(v => !v); setConfirmDeletePhoto(false) }}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white"
        >
          <MoreHorizontal size={14} />
        </button>
        {photoMenu && (
          <div className="absolute top-10 right-2 bg-background border border-border rounded-xl shadow-lg overflow-hidden z-10 min-w-[140px]">
            {confirmDeletePhoto ? (
              <div className="p-3 flex flex-col gap-2">
                <p className="text-xs text-foreground font-medium">Hapus foto ini?</p>
                <div className="flex gap-1.5">
                  <button onClick={() => { onDelete(); setPhotoMenu(false) }} disabled={isPending}
                    className="flex-1 h-7 rounded-lg bg-destructive text-white text-xs font-semibold disabled:opacity-40">
                    Hapus
                  </button>
                  <button onClick={() => setConfirmDeletePhoto(false)}
                    className="flex-1 h-7 rounded-lg bg-muted text-muted-foreground text-xs font-medium">
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button onClick={openEdit}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors border-b border-border">
                  <Pencil size={13} className="text-muted-foreground" /> Edit foto
                </button>
                <button onClick={() => setConfirmDeletePhoto(true)}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-destructive hover:bg-muted transition-colors">
                  <Trash2 size={13} /> Hapus foto
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Edit photo form (URL + title) */}
      {editingPhoto && (
        <div className="flex flex-col gap-2 bg-muted/60 rounded-2xl p-3 border border-border">
          <input
            autoFocus
            value={editUrl}
            onChange={e => setEditUrl(e.target.value)}
            placeholder="Image URL…"
            className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
          />
          <input
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            placeholder="Photo title…"
            className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
          />
          <div className="flex gap-1.5 flex-wrap">
            {PHOTO_TAGS.map(t => (
              <button key={t} type="button" onClick={() => setEditTag(editTag === t ? '' : t)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  editTag === t ? 'bg-foreground text-background border-foreground' : 'bg-background text-muted-foreground border-border'
                }`}>
                {t}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={handleEditSave} disabled={!editUrl.trim() || isPending}
              className="flex-1 h-9 rounded-xl bg-foreground text-background text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-1.5">
              {isPending ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Save
            </button>
            <button onClick={() => setEditingPhoto(false)}
              className="w-9 h-9 rounded-xl bg-muted text-muted-foreground flex items-center justify-center">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Title row: photo title left, edit-outfits pencil right */}
      <div className="flex items-center justify-between gap-2 px-0.5">
        <span className="text-sm font-semibold text-foreground truncate">
          {photo.caption || <span className="text-muted-foreground font-normal italic">Untitled</span>}
        </span>
        <button onClick={showPicker ? () => setShowPicker(false) : openPicker}
          className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0">
          {showPicker ? <X size={13} /> : <Pencil size={13} />}
        </button>
      </div>

      {/* Linked outfits — gallery style */}
      {!showPicker && (
        linkedOutfits.length > 0 ? (
          <div className="flex flex-col gap-3 px-0.5">
            {linkedOutfits.map(o => {
              const items = (o.outfit_items ?? [])
                .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                .map(oi => oi.wardrobe_items as WardrobeItem)
                .filter(Boolean)
              return (
                <div key={o.id} className="flex flex-col gap-1.5">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{o.name}</p>
                  <div className="flex gap-2 overflow-x-auto pb-0.5 no-scrollbar">
                    {items.map(item => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={item.id} src={item.image_url} alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover border border-border flex-shrink-0" />
                    ))}
                    {items.length === 0 && <p className="text-xs text-muted-foreground">No items</p>}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground px-0.5">No outfits linked</p>
        )
      )}

      {/* Outfit picker */}
      {showPicker && (
        <div className="bg-muted/60 rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center gap-2 px-3 pt-3 pb-2">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search outfit…"
                className="w-full bg-background border border-border rounded-lg pl-7 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors" />
            </div>
            <button onClick={handleSaveOutfits} disabled={isPending}
              className="h-8 px-3 rounded-lg bg-foreground text-background text-xs font-semibold disabled:opacity-40 flex items-center gap-1.5 shrink-0">
              {isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} strokeWidth={2.5} />} Save
            </button>
          </div>
          <div className="flex flex-col gap-0.5 px-3 pb-3 overflow-y-auto" style={{ maxHeight: 240 }}>
            {filteredOutfits.map(o => (
              <button key={o.id} onClick={() => toggleDraft(o.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors ${
                  draft.has(o.id) ? 'bg-foreground text-background' : 'bg-background text-foreground border border-border'
                }`}>
                <OutfitThumb outfit={o} />
                <span className="text-sm font-medium flex-1 truncate">{o.name}</span>
                {draft.has(o.id) && <Check size={14} strokeWidth={2.5} />}
              </button>
            ))}
            {filteredOutfits.length === 0 && <p className="text-xs text-muted-foreground py-3 text-center">No outfits found</p>}
          </div>
        </div>
      )}
    </div>
  )
}

export function LookbookTab({ lookbooks, outfits, creating, onCreateClose }: LookbookTabProps) {
  const [isPending, startTransition] = useTransition()
  const [newName, setNewName]   = useState('')
  const [nameError, setNameError] = useState('')

  const [detail, setDetail]               = useState<Lookbook | null>(null)
  const [renaming, setRenaming]           = useState(false)
  const [renameName, setRenameName]       = useState('')
  const [renameTag, setRenameTag]         = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const [activeTag, setActiveTag] = useState<string>('All')

  // Add photo: two-step — url first, then mandatory title
  const [addStep, setAddStep]   = useState<'url' | 'title' | null>(null)
  const [photoUrl, setPhotoUrl] = useState('')
  const [photoTitle, setPhotoTitle] = useState('')
  const [titleError, setTitleError] = useState('')

  const freshDetail = detail ? lookbooks.find(lb => lb.id === detail.id) ?? null : null

  function handleCreate() {
    if (!newName.trim()) { setNameError('Enter a name'); return }
    setNameError('')
    startTransition(async () => {
      const res = await createLookbook(newName.trim())
      if (res.error) { setNameError(res.error); return }
      setNewName('')
      onCreateClose()
    })
  }

  function handleRename() {
    if (!freshDetail || !renameName.trim()) return
    startTransition(async () => {
      await renameLookbook(freshDetail.id, renameName.trim())
      await setLookbookTag(freshDetail.id, renameTag || null)
      setRenaming(false)
    })
  }

  function handleDelete() {
    if (!freshDetail) return
    startTransition(async () => {
      await deleteLookbook(freshDetail.id)
      setDetail(null); setConfirmDelete(false)
    })
  }

  function handleUrlConfirm() {
    if (!photoUrl.trim()) return
    setPhotoTitle('')
    setTitleError('')
    setAddStep('title')
  }

  function handleTitleConfirm() {
    if (!photoTitle.trim()) { setTitleError('Nama foto wajib diisi'); return }
    if (!freshDetail) return
    setTitleError('')
    startTransition(async () => {
      await addLookbookPhoto(freshDetail.id, photoUrl.trim(), photoTitle.trim())
      setPhotoUrl(''); setPhotoTitle(''); setAddStep(null)
    })
  }

  function cancelAdd() { setPhotoUrl(''); setPhotoTitle(''); setAddStep(null) }

  function handleDeletePhoto(photoId: string) {
    startTransition(async () => { await deleteLookbookPhoto(photoId) })
  }

  const sortedPhotos = [...(freshDetail?.lookbook_photos ?? [])]
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  return (
    <>
      {/* Tag filter bar — outside, at lookbook level */}
      <div className="flex gap-2 overflow-x-auto px-5 pt-5 pb-3 no-scrollbar">
        {['All', ...LOOKBOOK_TAGS].map(t => (
          <button key={t} onClick={() => setActiveTag(t)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              activeTag === t ? 'bg-foreground text-background border-foreground' : 'bg-muted text-muted-foreground border-border'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* Lookbook masonry grid */}
      {(() => {
        const filtered = lookbooks.filter(lb => activeTag === 'All' || lb.tag === activeTag)
        if (lookbooks.length === 0) return (
          <div className="flex flex-col items-center justify-center py-24 text-center px-6">
            <div className="text-5xl mb-4">📸</div>
            <p className="text-foreground font-semibold mb-1">No lookbooks yet</p>
            <p className="text-muted-foreground text-sm">Tap + to create your first lookbook</p>
          </div>
        )
        if (filtered.length === 0) return (
          <div className="flex flex-col items-center justify-center py-24 text-center px-6">
            <p className="text-foreground font-semibold mb-1">No {activeTag} lookbooks</p>
          </div>
        )
        return (
          <div className="columns-2 gap-3 px-5 pb-28">
            {filtered.map(lb => {
              const cover = [...(lb.lookbook_photos ?? [])].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0]
              return (
                <button key={lb.id} onClick={() => setDetail(lb)}
                  className="break-inside-avoid mb-3 w-full relative rounded-2xl overflow-hidden bg-muted border border-border text-left block">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover.image_url} alt={lb.name} className="w-full h-auto block" />
                  ) : (
                    <div className="w-full aspect-square flex items-center justify-center text-4xl">📸</div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <p className="text-white text-xs font-semibold truncate">{lb.name}</p>
                    {lb.tag && <p className="text-white/50 text-[10px]">{lb.tag}</p>}
                  </div>
                </button>
              )
            })}
          </div>
        )
      })()}

      {/* Create lookbook modal */}
      {creating && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={onCreateClose}>
          <div className="w-full max-w-[430px] mx-auto bg-background rounded-t-3xl p-5 flex flex-col gap-4"
            style={{ paddingBottom: 'calc(32px + env(safe-area-inset-bottom, 0px))' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">New Lookbook</h3>
              <button onClick={onCreateClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground"><X size={16} /></button>
            </div>
            <input autoFocus value={newName} onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="e.g. Preppy Style"
              className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors" />
            {nameError && <p className="text-xs text-destructive -mt-2">{nameError}</p>}
            <button onClick={handleCreate} disabled={isPending}
              className="w-full h-12 rounded-xl bg-foreground text-background text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-2">
              {isPending ? <Loader2 size={15} className="animate-spin" /> : <BookImage size={15} />} Create Lookbook
            </button>
          </div>
        </div>
      )}

      {/* Detail sheet */}
      {freshDetail && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50" onClick={() => setDetail(null)}>
          <div className="w-full max-w-[430px] mx-auto bg-background rounded-t-3xl flex flex-col overflow-hidden"
            style={{ maxHeight: '92dvh', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
            onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="px-5 pt-5 pb-3 flex flex-col gap-2 border-b border-border shrink-0">
              {renaming ? (
                <>
                  <div className="flex items-center gap-2">
                    <input autoFocus value={renameName} onChange={e => setRenameName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleRename()}
                      className="flex-1 bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
                    <button onClick={handleRename} disabled={isPending} className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center disabled:opacity-40"><Check size={14} /></button>
                    <button onClick={() => setRenaming(false)} className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center"><X size={14} /></button>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {LOOKBOOK_TAGS.map(t => (
                      <button key={t} type="button" onClick={() => setRenameTag(renameTag === t ? '' : t)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                          renameTag === t ? 'bg-foreground text-background border-foreground' : 'bg-muted text-muted-foreground border-border'
                        }`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-foreground truncate">{freshDetail.name}</h3>
                    {freshDetail.tag && (
                      <span className="text-xs text-muted-foreground font-medium">{freshDetail.tag}</span>
                    )}
                  </div>
                  <button onClick={() => { setRenameName(freshDetail.name); setRenameTag(freshDetail.tag ?? ''); setRenaming(true) }}
                    className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground"><Pencil size={13} /></button>
                  {confirmDelete ? (
                    <>
                      <button onClick={handleDelete} disabled={isPending} className="h-8 px-3 rounded-full bg-destructive text-white text-xs font-semibold disabled:opacity-40">Delete</button>
                      <button onClick={() => setConfirmDelete(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground"><X size={14} /></button>
                    </>
                  ) : (
                    <button onClick={() => setConfirmDelete(true)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground"><Trash2 size={13} /></button>
                  )}
                  <button onClick={() => setDetail(null)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground"><X size={14} /></button>
                </div>
              )}
            </div>

            {/* Photos */}
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-6">
              {sortedPhotos.length === 0 && !addStep && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="text-4xl mb-3">🖼️</div>
                  <p className="text-sm font-semibold text-foreground">No photos yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Tap "Add Photo" to start</p>
                </div>
              )}
              {sortedPhotos.map(photo => (
                <PhotoRow key={photo.id} photo={photo} outfits={outfits}
                  onDelete={() => handleDeletePhoto(photo.id)}
                  isPending={isPending} startTransition={fn => startTransition(fn)} />
              ))}
            </div>

            {/* Add photo footer */}
            <div className="px-5 py-3 border-t border-border shrink-0 flex flex-col gap-2">
              {addStep === 'url' && (
                <div className="flex gap-2">
                  <input autoFocus value={photoUrl} onChange={e => setPhotoUrl(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleUrlConfirm()}
                    placeholder="Paste image URL…"
                    className="flex-1 bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors" />
                  <button onClick={handleUrlConfirm} disabled={!photoUrl.trim() || isPending}
                    className="w-10 h-10 rounded-xl bg-foreground text-background flex items-center justify-center disabled:opacity-40">
                    <Check size={14} />
                  </button>
                  <button onClick={cancelAdd} className="w-10 h-10 rounded-xl bg-muted text-muted-foreground flex items-center justify-center"><X size={14} /></button>
                </div>
              )}
              {addStep === 'title' && (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input autoFocus value={photoTitle} onChange={e => setPhotoTitle(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleTitleConfirm()}
                      placeholder="Nama foto (wajib)…"
                      className={`flex-1 bg-muted border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors ${titleError ? 'border-destructive' : 'border-border focus:border-primary'}`} />
                    <button onClick={handleTitleConfirm} disabled={isPending}
                      className="w-10 h-10 rounded-xl bg-foreground text-background flex items-center justify-center disabled:opacity-40">
                      {isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    </button>
                    <button onClick={cancelAdd} className="w-10 h-10 rounded-xl bg-muted text-muted-foreground flex items-center justify-center"><X size={14} /></button>
                  </div>
                  {titleError && <p className="text-xs text-destructive px-1">{titleError}</p>}
                </div>
              )}
              {!addStep && (
                <button onClick={() => setAddStep('url')} disabled={isPending}
                  className="w-full h-12 rounded-xl bg-foreground text-background text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-2">
                  <Plus size={15} strokeWidth={2.5} /> Add Photo
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
