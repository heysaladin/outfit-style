'use client'

import { useTransition, useState, useRef } from 'react'
import { X, Trash2, Pencil, CheckCircle2, Upload, Tag, Link } from 'lucide-react'
import { deleteGearItem, updateGearItem, setGearItemStatus, flagGearDeclutter } from '@/app/actions'
import { HOBBIES, HOBBY_META_FIELDS, GEAR_CONDITIONS, DECLUTTER_STATUSES, type GearItem } from '@/lib/types'
import { WorthCard } from '@/components/worth/WorthCard'

interface GearItemDetailModalProps {
  item: GearItem | null
  onClose: () => void
}

export function GearItemDetailModal({ item, onClose }: GearItemDetailModalProps) {
  const [isPending, startTransition] = useTransition()
  const [tab, setTab]       = useState<'info' | 'edit' | 'declutter'>('info')
  const [error, setError]   = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [metadata, setMetadata] = useState<Record<string, string>>({})
  const [useUrlInput, setUseUrlInput] = useState(false)
  const [editImageUrl, setEditImageUrl] = useState('')
  const fileRef             = useRef<HTMLInputElement>(null)

  if (!item) return null

  const hobbyDef   = HOBBIES.find(h => h.value === item.hobby)
  const metaFields = HOBBY_META_FIELDS[item.hobby] ?? []
  const isDraft    = !item.status || item.status === 'draft'

  function handleDelete() {
    startTransition(async () => { await deleteGearItem(item!.id); onClose() })
  }

  function handleSetStatus(status: 'draft' | 'verified') {
    startTransition(async () => { await setGearItemStatus(item!.id, status); onClose() })
  }

  function handleDeclutter(status: 'donate' | 'sell' | 'giveaway' | null) {
    startTransition(async () => { await flagGearDeclutter(item!.id, status); onClose() })
  }

  function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    const mergedMeta = { ...item!.metadata, ...metadata }
    fd.set('metadata', JSON.stringify(mergedMeta))
    if (useUrlInput && editImageUrl.trim()) fd.set('image_url_direct', editImageUrl.trim())
    startTransition(async () => {
      const res = await updateGearItem(item!.id, fd)
      if (res.error) { setError(res.error); return }
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="absolute inset-x-0 bottom-0 bg-background rounded-t-2xl max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background pt-3 pb-2 px-4">
          <div className="w-8 h-1 bg-border rounded-full mx-auto mb-3" />
          <div className="flex items-center justify-between">
            <button
              onClick={() => setTab(t => t === 'edit' ? 'info' : 'edit')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-accent text-foreground text-xs font-medium transition-colors"
            >
              <Pencil size={12} />
              {tab === 'edit' ? 'Cancel' : 'Edit'}
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-muted hover:bg-accent flex items-center justify-center transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="mx-4 mt-1 aspect-square rounded-xl overflow-hidden bg-muted flex items-center justify-center">
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} className="w-full h-full object-contain" />
          ) : (
            <span className="text-6xl">{hobbyDef?.icon ?? '📦'}</span>
          )}
        </div>

        {/* Name / meta */}
        <div className="px-4 pt-4 pb-2 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-base">{hobbyDef?.icon}</span>
              <h2 className="text-foreground font-bold text-lg leading-tight truncate">{item.name}</h2>
              {!isDraft && <CheckCircle2 size={15} className="text-primary shrink-0" />}
            </div>
            {item.brand && <p className="text-muted-foreground text-xs mt-0.5">{item.brand}</p>}
            <p className="text-muted-foreground/60 text-[10px] mt-0.5">{hobbyDef?.label ?? item.hobby}</p>
            {isDraft && (
              <span className="inline-block mt-1 text-[9px] font-semibold tracking-widest uppercase text-muted-foreground/50">
                Draft
              </span>
            )}
          </div>
          {item.purchase_price && (
            <div className="text-right shrink-0">
              <p className="text-foreground font-semibold text-sm">
                {item.purchase_price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
              </p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="px-4 pb-1">
          <div className="flex gap-0 border-b border-border">
            {(['info', 'edit', 'declutter'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2.5 text-xs font-medium capitalize transition-all border-b-2 -mb-px ${
                  tab === t ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}>{t}</button>
            ))}
          </div>
        </div>

        <div className="px-4 py-4 space-y-3 pb-10">

          {/* INFO TAB */}
          {tab === 'info' && (
            <div className="space-y-3">
              {/* Pembelian */}
              {(item.purchase_price || item.purchase_date || item.condition) && (
                <div className="bg-muted rounded-xl p-3.5 space-y-2">
                  <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">Pembelian</p>
                  {item.purchase_price && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs">Harga Beli</span>
                      <span className="text-foreground text-xs font-semibold">
                        {item.purchase_price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  )}
                  {item.purchase_date && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs">Tanggal Beli</span>
                      <span className="text-foreground text-xs">
                        {new Date(item.purchase_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                  )}
                  {item.condition && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs">Kondisi</span>
                      <span className="text-foreground text-xs font-medium capitalize">{item.condition.replace('_', ' ')}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Hobby metadata */}
              {metaFields.length > 0 && Object.keys(item.metadata ?? {}).length > 0 && (
                <div className="bg-muted rounded-xl p-3.5 space-y-2">
                  <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">{hobbyDef?.label} Details</p>
                  {metaFields.map(field => {
                    const val = item.metadata?.[field.key]
                    if (!val) return null
                    return (
                      <div key={field.key} className="flex items-center justify-between">
                        <span className="text-muted-foreground text-xs">{field.label}</span>
                        <span className="text-foreground text-xs font-medium">{String(val)}</span>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Worth */}
              <WorthCard
                purchasePrice={item.purchase_price}
                purchaseDate={item.purchase_date}
              />

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Tag size={11} className="text-muted-foreground" />
                  {item.tags.map(t => (
                    <span key={t} className="text-muted-foreground text-[10px]">#{t}</span>
                  ))}
                </div>
              )}

              {/* Notes */}
              {item.notes && (
                <div className="bg-muted rounded-xl p-3.5">
                  <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider mb-1.5">Notes</p>
                  <p className="text-foreground text-xs leading-relaxed">{item.notes}</p>
                </div>
              )}

              <p className="text-muted-foreground/40 text-[10px]">
                Added {new Date(item.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>

              {isDraft ? (
                <button onClick={() => handleSetStatus('verified')} disabled={isPending}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3 rounded-xl text-sm disabled:opacity-40 hover:opacity-90 transition-opacity">
                  <CheckCircle2 size={15} />
                  {isPending ? 'Saving…' : 'Set as Verified'}
                </button>
              ) : (
                <button onClick={() => handleSetStatus('draft')} disabled={isPending}
                  className="w-full flex items-center justify-center gap-2 bg-muted text-muted-foreground font-medium py-3 rounded-xl text-sm disabled:opacity-40 hover:text-foreground transition-colors">
                  <CheckCircle2 size={15} className="text-primary" />
                  Verified — Revert to Draft
                </button>
              )}

              <button onClick={handleDelete} disabled={isPending}
                className="w-full flex items-center justify-center gap-2 text-destructive font-medium py-3 rounded-xl text-sm border border-destructive/20 bg-destructive/5 disabled:opacity-40 hover:bg-destructive/10 transition-colors">
                <Trash2 size={14} />
                {isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          )}

          {/* EDIT TAB */}
          {tab === 'edit' && (
            <form onSubmit={handleEditSubmit} className="space-y-3">
              {/* Image upload */}
              <div>
                <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Photo</label>
                {!useUrlInput && (
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="relative aspect-video rounded-xl overflow-hidden bg-white border border-dashed border-border hover:border-foreground/40 transition-colors cursor-pointer flex items-center justify-center"
                  >
                    {preview ? (
                      <img src={preview} alt="preview" className="absolute inset-0 w-full h-full object-contain" />
                    ) : item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="absolute inset-0 w-full h-full object-contain opacity-60" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Upload size={20} />
                        <span className="text-xs">Change photo</span>
                      </div>
                    )}
                  </div>
                )}
                <input ref={fileRef} type="file" name="image" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) setPreview(URL.createObjectURL(f)) }} />

                {/* URL toggle */}
                <button
                  type="button"
                  onClick={() => { setUseUrlInput(v => !v); setPreview(null); setEditImageUrl('') }}
                  className="flex items-center justify-between w-full px-3.5 py-2.5 bg-muted rounded-xl mt-2"
                >
                  <div className="flex items-center gap-2 text-foreground text-xs font-medium">
                    <Link size={13} className="text-muted-foreground" />
                    Use image URL instead
                  </div>
                  <div className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${useUrlInput ? 'bg-primary' : 'bg-border'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200 ${useUrlInput ? 'left-4 bg-white' : 'left-0.5 bg-muted-foreground'}`} />
                  </div>
                </button>
                {useUrlInput && (
                  <div className="mt-2 space-y-2">
                    <input
                      type="url"
                      value={editImageUrl}
                      onChange={e => { setEditImageUrl(e.target.value); setPreview(e.target.value.startsWith('http') ? e.target.value : null) }}
                      placeholder="https://example.com/image.jpg"
                      className="w-full bg-muted rounded-xl px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-1 focus:ring-foreground/20"
                    />
                    {preview && (
                      <div className="aspect-video rounded-xl overflow-hidden bg-white border border-border">
                        <img src={preview} alt="preview" className="w-full h-full object-contain" onError={() => setPreview(null)} />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Name *</label>
                <input name="name" required defaultValue={item.name}
                  className="w-full bg-muted rounded-xl px-3.5 py-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-foreground/20" />
              </div>
              <div>
                <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Brand</label>
                <input name="brand" defaultValue={item.brand ?? ''}
                  className="w-full bg-muted rounded-xl px-3.5 py-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-foreground/20" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Price</label>
                  <input name="purchase_price" type="number" step="0.01" min="0" defaultValue={item.purchase_price ?? ''}
                    className="w-full bg-muted rounded-xl px-3.5 py-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-foreground/20" />
                </div>
                <div>
                  <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Condition</label>
                  <select name="condition" defaultValue={item.condition ?? ''}
                    className="w-full bg-muted rounded-xl px-3.5 py-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-foreground/20">
                    <option value="">Select…</option>
                    {GEAR_CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Purchase Date</label>
                <input name="purchase_date" type="date" defaultValue={item.purchase_date ?? ''}
                  className="w-full bg-muted rounded-xl px-3.5 py-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-foreground/20" />
              </div>

              {/* Per-hobby metadata */}
              {metaFields.length > 0 && (
                <div className="space-y-3">
                  <p className="text-muted-foreground text-xs font-medium border-t border-border/40 pt-3">
                    {hobbyDef?.icon} {hobbyDef?.label} Details
                  </p>
                  {metaFields.map(field => (
                    <div key={field.key}>
                      <label className="text-muted-foreground text-xs font-medium mb-1.5 block">{field.label}</label>
                      {field.type === 'select' ? (
                        <select
                          defaultValue={String(item.metadata?.[field.key] ?? '')}
                          onChange={e => setMetadata(m => ({ ...m, [field.key]: e.target.value }))}
                          className="w-full bg-muted rounded-xl px-3.5 py-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-foreground/20"
                        >
                          <option value="">Select…</option>
                          {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          defaultValue={String(item.metadata?.[field.key] ?? '')}
                          onChange={e => setMetadata(m => ({ ...m, [field.key]: e.target.value }))}
                          placeholder={field.placeholder}
                          className="w-full bg-muted rounded-xl px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-1 focus:ring-foreground/20"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Tags</label>
                <input name="tags" defaultValue={(item.tags ?? []).join(', ')}
                  className="w-full bg-muted rounded-xl px-3.5 py-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-foreground/20"
                  placeholder="comma, separated, tags" />
              </div>
              <div>
                <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Notes</label>
                <textarea name="notes" rows={3} defaultValue={item.notes ?? ''}
                  className="w-full bg-muted rounded-xl px-3.5 py-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-foreground/20 resize-none"
                  placeholder="Any notes…" />
              </div>

              {error && <p className="text-destructive text-xs bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>}

              <button type="submit" disabled={isPending}
                className="w-full bg-foreground text-background font-semibold py-3.5 rounded-xl text-sm disabled:opacity-40 hover:opacity-90 transition-opacity">
                {isPending ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          )}

          {/* DECLUTTER TAB */}
          {tab === 'declutter' && (
            <div className="space-y-2">
              <p className="text-muted-foreground text-xs mb-3">Flag for decluttering:</p>
              {DECLUTTER_STATUSES.map(d => (
                <button key={d.value} onClick={() => handleDeclutter(d.value)} disabled={isPending}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium transition-all disabled:opacity-40 ${
                    item.declutter_status === d.value ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}>
                  <span>{d.label}</span>
                  {item.declutter_status === d.value && <span className="text-[10px] opacity-60">Active</span>}
                </button>
              ))}
              {item.declutter_status && (
                <button onClick={() => handleDeclutter(null)} disabled={isPending}
                  className="w-full text-muted-foreground text-xs py-2 disabled:opacity-40 hover:text-foreground transition-colors">
                  Clear flag
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
