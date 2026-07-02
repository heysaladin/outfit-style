'use client'

import { useTransition, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Pencil, Trash2, Upload, Link, History, X, Plus } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import type { HobbyItem, HobbyItemUse } from '@/lib/types'
import { HOBBIES } from '@/lib/types'
import { WorthCard } from '@/components/worth/WorthCard'
import { updateHobbyItem, deleteHobbyItem, useHobbyItem, getHobbyItemUses } from '@/app/actions'

interface HobbyItemDetailClientProps {
  item: HobbyItem
  hobby: string
  user: User | null
}

const today = new Date().toISOString().split('T')[0]

export function HobbyItemDetailClient({ item, hobby, user }: HobbyItemDetailClientProps) {
  const router                        = useRouter()
  const [isPending, startTransition]  = useTransition()
  const [mode, setMode]               = useState<'view' | 'edit'>('view')
  const [error, setError]             = useState<string | null>(null)
  const [preview, setPreview]         = useState<string | null>(null)
  const [useUrl, setUseUrl]           = useState(false)
  const [imageUrl, setImageUrl]       = useState('')
  const fileRef                       = useRef<HTMLInputElement>(null)

  // Use form sheet
  const [useSheetOpen, setUseSheetOpen] = useState(false)
  const [useDate, setUseDate]           = useState(today)
  const [useNote, setUseNote]           = useState('')

  // Uses history sheet
  const [listOpen, setListOpen]     = useState(false)
  const [uses, setUses]             = useState<HobbyItemUse[]>([])
  const [listLoading, setListLoading] = useState(false)

  const hobbyDef = HOBBIES.find(h => h.value === hobby)

  function openUseSheet() {
    setUseDate(today)
    setUseNote('')
    setUseSheetOpen(true)
  }

  function handleUseSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const res = await useHobbyItem(item.id, hobby, useDate, useNote || null)
      if (res.error) { setError(res.error); return }
      setUseSheetOpen(false)
      router.refresh()
    })
  }

  async function openList() {
    setListOpen(true)
    setListLoading(true)
    const res = await getHobbyItemUses(item.id)
    setUses(res.data ?? [])
    setListLoading(false)
  }

  function handleDelete() {
    if (!confirm('Delete this item?')) return
    startTransition(async () => {
      const res = await deleteHobbyItem(item.id, hobby)
      if (res.error) { setError(res.error); return }
      router.push(`/${hobby}`)
    })
  }

  function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    if (useUrl && imageUrl.trim()) fd.set('image_url_direct', imageUrl.trim())
    startTransition(async () => {
      const res = await updateHobbyItem(item.id, fd)
      if (res.error) { setError(res.error); return }
      router.refresh()
      setMode('view')
      setPreview(null)
    })
  }

  const displayImage = preview ?? item.image_url

  return (
    <div className="min-h-screen bg-background pb-10">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/40 px-4 pt-12 pb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => mode === 'edit' ? setMode('view') : router.push(`/${hobby}`)}
            className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center hover:bg-accent transition-colors"
          >
            <ArrowLeft size={16} className="text-muted-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">{hobbyDef?.icon}</span>
            <h1 className="text-foreground font-bold text-lg tracking-tight truncate max-w-[180px]">
              {mode === 'edit' ? 'Edit Item' : item.name}
            </h1>
          </div>
        </div>

        {user && mode === 'view' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode('edit')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-accent text-foreground text-xs font-medium transition-colors"
            >
              <Pencil size={12} />
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-medium transition-colors disabled:opacity-40"
            >
              <Trash2 size={12} />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* VIEW MODE */}
      {mode === 'view' && (
        <>
          {displayImage ? (
            <div className="aspect-square w-full bg-muted">
              <img src={displayImage} alt={item.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="aspect-square w-full bg-muted flex items-center justify-center text-8xl">
              {hobbyDef?.icon}
            </div>
          )}

          <div className="p-5 space-y-4">
            <div>
              <h2 className="text-foreground font-bold text-2xl">{item.name}</h2>
              <p className="text-muted-foreground text-sm mt-0.5 capitalize">{hobbyDef?.label}</p>
            </div>

            {item.description && (
              <p className="text-foreground/80 text-sm leading-relaxed">{item.description}</p>
            )}

            {/* Purchase */}
            <div className="bg-muted rounded-xl p-3.5 space-y-2">
              <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">Purchase</p>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Price</span>
                <span className="text-foreground text-xs font-semibold">
                  {item.purchase_price
                    ? item.purchase_price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
                    : <span className="text-muted-foreground/50">Not set</span>}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Date</span>
                <span className="text-foreground text-xs">
                  {item.purchase_date
                    ? new Date(item.purchase_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                    : <span className="text-muted-foreground/50">Not set</span>}
                </span>
              </div>
            </div>

            {/* Use stats */}
            <div className="flex items-center justify-between bg-muted rounded-xl p-3.5">
              <div>
                <p className="text-foreground text-sm font-semibold">{item.use_count} uses</p>
                <p className="text-muted-foreground text-[10px] mt-0.5">
                  {item.last_used
                    ? `Last ${new Date(item.last_used).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                    : 'Never used'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={openList}
                  className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center hover:bg-accent transition-colors"
                  title="Use history"
                >
                  <History size={14} className="text-muted-foreground" />
                </button>
                {user && (
                  <button
                    onClick={openUseSheet}
                    disabled={isPending}
                    className="flex items-center gap-1.5 bg-foreground text-background text-xs font-semibold px-3 py-2 rounded-lg disabled:opacity-40 hover:opacity-80 transition-opacity"
                  >
                    <Plus size={12} />
                    Use
                  </button>
                )}
              </div>
            </div>

            {/* Worth */}
            <WorthCard
              purchasePrice={item.purchase_price}
              purchaseDate={item.purchase_date}
              totalUses={item.use_count}
            />

            {error && (
              <p className="text-destructive text-xs bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
            )}

            <p className="text-muted-foreground/40 text-[10px]">
              Added {new Date(item.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </>
      )}

      {/* EDIT MODE */}
      {mode === 'edit' && (
        <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
          {/* Image */}
          <div>
            <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Photo</label>
            {!useUrl && (
              <div
                onClick={() => fileRef.current?.click()}
                className="relative aspect-video rounded-xl overflow-hidden bg-muted border border-dashed border-border hover:border-foreground/40 transition-colors cursor-pointer flex items-center justify-center"
              >
                {preview || item.image_url ? (
                  <img
                    src={preview ?? item.image_url ?? ''}
                    alt={item.name}
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Upload size={20} />
                    <span className="text-xs">Tap to upload</span>
                  </div>
                )}
              </div>
            )}
            <input
              ref={fileRef} type="file" name="image" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) setPreview(URL.createObjectURL(f)) }}
            />
            <button
              type="button"
              onClick={() => { setUseUrl(v => !v); setPreview(null); setImageUrl('') }}
              className="flex items-center justify-between w-full px-3.5 py-2.5 bg-muted rounded-xl mt-2"
            >
              <div className="flex items-center gap-2 text-foreground text-xs font-medium">
                <Link size={13} className="text-muted-foreground" />
                Use image URL
              </div>
              <div className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${useUrl ? 'bg-primary' : 'bg-border'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200 ${useUrl ? 'left-4 bg-white' : 'left-0.5 bg-muted-foreground'}`} />
              </div>
            </button>
            {useUrl && (
              <div className="mt-2 space-y-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={e => { setImageUrl(e.target.value); setPreview(e.target.value.startsWith('http') ? e.target.value : null) }}
                  placeholder="https://example.com/image.jpg"
                  className="w-full bg-muted rounded-xl px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-1 focus:ring-foreground/20"
                />
                {preview && (
                  <div className="aspect-video rounded-xl overflow-hidden bg-muted border border-border">
                    <img src={preview} alt="preview" className="w-full h-full object-contain" onError={() => setPreview(null)} />
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Name *</label>
            <input
              name="name" required defaultValue={item.name}
              className="w-full bg-muted rounded-xl px-3.5 py-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-foreground/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Purchase Price</label>
              <input
                name="purchase_price" type="number" min="0" step="0.01"
                defaultValue={item.purchase_price ?? ''}
                className="w-full bg-muted rounded-xl px-3.5 py-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-foreground/20"
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Purchase Date</label>
              <input
                name="purchase_date" type="date"
                defaultValue={item.purchase_date ?? ''}
                className="w-full bg-muted rounded-xl px-3.5 py-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-foreground/20"
              />
            </div>
          </div>

          <div>
            <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Notes</label>
            <textarea
              name="description" rows={3} defaultValue={item.description ?? ''}
              className="w-full bg-muted rounded-xl px-3.5 py-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-foreground/20 resize-none"
              placeholder="Notes about this item…"
            />
          </div>

          {error && (
            <p className="text-destructive text-xs bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit" disabled={isPending}
            className="w-full bg-foreground text-background font-semibold py-3.5 rounded-xl text-sm disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            {isPending ? 'Saving…' : 'Save Changes'}
          </button>

          <button
            type="button" onClick={handleDelete} disabled={isPending}
            className="w-full flex items-center justify-center gap-2 text-destructive font-medium py-3 rounded-xl text-sm border border-destructive/20 bg-destructive/5 disabled:opacity-40 hover:bg-destructive/10 transition-colors"
          >
            <Trash2 size={14} />
            {isPending ? 'Deleting…' : 'Delete Item'}
          </button>
        </form>
      )}

      {/* USE FORM SHEET */}
      {useSheetOpen && (
        <div className="fixed inset-0 z-50 bg-black/60" onClick={() => setUseSheetOpen(false)}>
          <div
            className="absolute inset-x-0 bottom-0 bg-background rounded-t-2xl p-5 pb-10 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-8 h-1 bg-border rounded-full mx-auto -mt-1 mb-3" />
            <div className="flex items-center justify-between">
              <h3 className="text-foreground font-bold text-base">Log a Use</h3>
              <button onClick={() => setUseSheetOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUseSubmit} className="space-y-4">
              <div>
                <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Date</label>
                <input
                  type="date"
                  value={useDate}
                  onChange={e => setUseDate(e.target.value)}
                  max={today}
                  className="w-full bg-muted rounded-xl px-3.5 py-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-foreground/20"
                />
              </div>

              <div>
                <label className="text-muted-foreground text-xs font-medium mb-1.5 block">
                  Note <span className="text-muted-foreground/50">(optional)</span>
                </label>
                <input
                  type="text"
                  value={useNote}
                  onChange={e => setUseNote(e.target.value)}
                  placeholder={`Leave blank to use day name (${new Date(useDate).toLocaleDateString('en-US', { weekday: 'long' })})`}
                  className="w-full bg-muted rounded-xl px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:ring-1 focus:ring-foreground/20"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-foreground text-background font-semibold py-3.5 rounded-xl text-sm disabled:opacity-40 hover:opacity-90 transition-opacity"
              >
                {isPending ? 'Saving…' : 'Save'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* USE HISTORY SHEET */}
      {listOpen && (
        <div className="fixed inset-0 z-50 bg-black/60" onClick={() => setListOpen(false)}>
          <div
            className="absolute inset-x-0 bottom-0 bg-background rounded-t-2xl max-h-[70vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-5 pt-4 pb-3 border-b border-border flex-shrink-0">
              <div className="w-8 h-1 bg-border rounded-full mx-auto mb-3" />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-foreground font-bold text-base">Use History</h3>
                  <p className="text-muted-foreground text-xs mt-0.5">{item.use_count} total uses</p>
                </div>
                <button onClick={() => setListOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 pb-10">
              {listLoading ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-muted-foreground text-sm">Loading…</p>
                </div>
              ) : uses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <History size={24} className="text-border" />
                  <p className="text-muted-foreground text-sm">No uses logged yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {uses.map((u, i) => (
                    <div key={u.id} className="px-5 py-3.5 flex items-center justify-between">
                      <div>
                        <p className="text-foreground text-sm font-medium">{u.note}</p>
                        <p className="text-muted-foreground text-[11px] mt-0.5">
                          {new Date(u.used_at).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <span className="text-muted-foreground/40 text-xs font-mono">#{item.use_count - i}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
