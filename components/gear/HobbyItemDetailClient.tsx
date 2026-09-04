'use client'

import { useTransition, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Pencil, Trash2, X } from 'lucide-react'
import type { ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import type { HobbyItem, HobbyItemUse } from '@/lib/types'
import { HOBBIES } from '@/lib/types'
import { WorthCard } from '@/components/worth/WorthCard'
import { updateHobbyItem, deleteHobbyItem, useHobbyItem, getHobbyItemUses, setHobbyItemUseCount, setHobbyItemTarget } from '@/app/actions'
import { MobileButton } from '@/components/ui/mobile-shims'

const HERO_TINTS = [
  'radial-gradient(120% 100% at 30% 20%,#FFF0DC,#FFDFC2)',
  'radial-gradient(120% 100% at 30% 20%,#EAEFFB,#C9D6EE)',
  'radial-gradient(120% 100% at 30% 20%,#DFF2E4,#B7DFC3)',
  'radial-gradient(120% 100% at 30% 20%,#EDE6FD,#D3C4F6)',
  'radial-gradient(120% 100% at 30% 20%,#FBE0DC,#F2BBB2)',
]

const today = new Date().toISOString().split('T')[0]
const inputCls = "w-full bg-background border border-border rounded-xl px-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground outline-none box-border"

interface Props {
  item: HobbyItem
  hobby: string
  user: User | null
}

export function HobbyItemDetailClient({ item, hobby, user }: Props) {
  const router                       = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editOpen, setEditOpen]      = useState(false)
  const [deleteOpen, setDeleteOpen]  = useState(false)
  const [useSheetOpen, setUseSheetOpen] = useState(false)
  const [listOpen, setListOpen]      = useState(false)
  const [uses, setUses]              = useState<HobbyItemUse[]>([])
  const [listLoading, setListLoading] = useState(false)
  const [editUsesOpen, setEditUsesOpen] = useState(false)
  const [editUsesCount, setEditUsesCount] = useState(item.use_count)

  const [target, setTarget]               = useState(item.target ?? 0)
  const [editingTarget, setEditingTarget]   = useState(false)
  const [editTargetValue, setEditTargetValue] = useState<string>(String(item.target ?? 0))
  const [targetPending, setTargetPending]   = useState(false)
  const [useDate, setUseDate]        = useState(today)
  const [useNote, setUseNote]        = useState('')
  const [error, setError]            = useState<string | null>(null)

  const [preview, setPreview]   = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState(item.image_url ?? '')
  const fileRef                 = useRef<HTMLInputElement>(null)

  const hobbyDef   = HOBBIES.find(h => h.value === hobby)
  const hobbyIdx   = HOBBIES.findIndex(h => h.value === hobby)
  const heroBg     = item.image_url ? undefined : HERO_TINTS[hobbyIdx % HERO_TINTS.length]
  const displayImg = preview ?? item.image_url

  function openUseSheet() { setUseDate(today); setUseNote(''); setUseSheetOpen(true) }

  function handleUseSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const res = await useHobbyItem(item.id, hobby, useDate, useNote || null)
      if (res.error) { setError(res.error); return }
      setUseSheetOpen(false)
      router.refresh()
    })
  }

  async function openHistory() {
    setListOpen(true); setListLoading(true)
    const res = await getHobbyItemUses(item.id)
    setUses(res.data ?? []); setListLoading(false)
  }

  function openEditUses() {
    setEditUsesCount(item.use_count)
    setEditUsesOpen(true)
  }

  async function handleSaveUses() {
    const res = await setHobbyItemUseCount(item.id, editUsesCount)
    if (res.error) { setError(res.error); return }
    setEditUsesOpen(false)
    router.refresh()
  }

  async function handleSaveTarget() {
    setTargetPending(true)
    const val = Math.max(0, parseInt(editTargetValue) || 0)
    const res = await setHobbyItemTarget(item.id, val)
    setTargetPending(false)
    if (res.error) { setError(res.error); return }
    setTarget(val)
    setEditingTarget(false)
    router.refresh()
  }

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteHobbyItem(item.id, hobby)
      if (res.error) { setError(res.error); setDeleteOpen(false); return }
      router.push(`/${hobby}`)
    })
  }

  function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    if (imageUrl.trim() && !fileRef.current?.files?.[0]) fd.set('image_url_direct', imageUrl.trim())
    startTransition(async () => {
      const res = await updateHobbyItem(item.id, fd)
      if (res.error) { setError(res.error); return }
      router.refresh(); setEditOpen(false); setPreview(null)
    })
  }

  const priceStr = item.purchase_price
    ? item.purchase_price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
    : null
  const dateStr = item.purchase_date
    ? new Date(item.purchase_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null
  const lastUsedStr = item.last_used
    ? new Date(item.last_used).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'never used'
  const addedStr = new Date(item.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div className="bg-background h-dvh overflow-y-auto text-foreground">

      {/* Header */}
      <header
        className="sticky top-0 z-10 flex items-center gap-2 px-3.5 pb-2.5 bg-background/95 backdrop-blur-sm border-b border-border"
        style={{ paddingTop: 'calc(14px + env(safe-area-inset-top,0px))' }}
      >
        <MobileButton
          variant="ghost" size="sm"
          icon={<ChevronLeft size={18} />}
          onClick={() => router.push(`/${hobby}`)}
          className="w-9 h-9 rounded-xl p-0 justify-center"
        />
        <div className="flex-1 min-w-0">
          <h1 className="text-[18px] font-extrabold tracking-tight leading-none truncate">{item.name}</h1>
          <span className="text-[11.5px] font-semibold text-muted-foreground">{hobbyDef?.label}</span>
        </div>
        {user && (
          <>
            <MobileButton
              variant="ghost" size="sm"
              icon={<Pencil size={16} />}
              onClick={() => setEditOpen(true)}
              className="w-9 h-9 rounded-xl p-0 justify-center"
            />
            <MobileButton
              variant="ghost" size="sm"
              icon={<Trash2 size={16} />}
              onClick={() => setDeleteOpen(true)}
              className="w-9 h-9 rounded-xl p-0 justify-center text-destructive"
            />
          </>
        )}
      </header>

      {/* Scrollable content */}
      <div className="pb-12">

        {/* Hero */}
        <div
          className="mx-4 mt-1 rounded-[28px] overflow-hidden grid place-items-center text-[120px] relative"
          style={{ background: heroBg, aspectRatio: displayImg ? undefined : '1/.9' }}
        >
          {displayImg ? (
            <img src={displayImg} alt={item.name} className="w-full h-auto block object-contain" />
          ) : (
            <div className="w-full grid place-items-center" style={{ aspectRatio: '1/.9' }}>
              <span>{hobbyDef?.icon}</span>
            </div>
          )}
        </div>

        {/* Detail */}
        <div className="px-4 pt-4">

          <h1 className="text-[23px] font-extrabold leading-tight tracking-tight mb-2.5">{item.name}</h1>

          {/* Chips */}
          <div className="flex gap-1.5 flex-wrap mb-3.5">
            <span className="text-[11px] font-bold text-primary bg-secondary rounded-full px-3 py-1.5">
              {hobbyDef?.icon} {hobbyDef?.label}
            </span>
          </div>

          {item.description && (
            <p className="text-[14px] leading-relaxed text-muted-foreground mb-3.5">{item.description}</p>
          )}

          {/* Use bar */}
          <div className="flex items-center gap-3 mb-3 bg-card rounded-3xl p-3.5">
            <div className="text-[28px] font-extrabold leading-none">{item.use_count}</div>
            <div className="flex-1">
              <b className="text-[14px] block">uses</b>
              <span className="block text-[11px] font-semibold text-muted-foreground mt-0.5">{lastUsedStr}</span>
            </div>
            <button
              onClick={openEditUses}
              className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground flex-shrink-0 mr-1.5"
            >
              <Pencil size={15} />
            </button>
            {user && (
              <MobileButton
                size="sm"
                onClick={openUseSheet}
                disabled={isPending}
                className="rounded-full px-5 py-3 text-[14px] font-extrabold"
              >
                + Use
              </MobileButton>
            )}
          </div>

          {/* KV table */}
          <div className="bg-card rounded-3xl px-4 py-1 mb-3">
            <KVRow label="Purchase price" value={priceStr} unset="+ Add price" />
            <KVRow label="Purchase date" value={dateStr} unset="+ Add date" divider />
            {item.status && <KVRow label="Status" value={item.status === 'verified' ? 'Verified' : 'Draft'} divider />}
            {target > 0 && (
              <div className="flex justify-between items-center py-3 text-[13.5px] border-t border-border">
                <span className="text-muted-foreground font-medium">Defined target</span>
                {editingTarget ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number" inputMode="numeric" min="0"
                      value={editTargetValue}
                      onChange={e => setEditTargetValue(e.target.value.replace(/[^0-9]/g, ''))}
                      onFocus={e => e.target.select()}
                      className="w-16 bg-background border border-border rounded-xl px-2.5 py-1.5 text-[13px] font-semibold text-right outline-none"
                    />
                    <button onClick={handleSaveTarget} disabled={targetPending} className="bg-primary text-primary-foreground text-[12px] font-bold px-2.5 py-1.5 rounded-lg border-0 cursor-pointer disabled:opacity-60">Save</button>
                    <button onClick={() => { setEditingTarget(false); setEditTargetValue(String(target)) }} className="bg-muted text-muted-foreground text-[12px] font-bold px-2.5 py-1.5 rounded-lg border-0 cursor-pointer">Cancel</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{target} uses</span>
                    {user && (
                      <button onClick={() => { setEditTargetValue(String(target)); setEditingTarget(true) }} className="w-7 h-7 bg-muted rounded-lg flex items-center justify-center text-muted-foreground border-0 cursor-pointer">
                        <Pencil size={12} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Worth card */}
          <WorthCard purchasePrice={item.purchase_price} purchaseDate={item.purchase_date} totalUses={item.use_count} targetOverride={target > 0 ? target : null} />

          {error && (
            <p className="text-xs text-destructive font-semibold mt-3 bg-destructive/10 rounded-xl px-3.5 py-2.5">{error}</p>
          )}

          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mt-4">Added {addedStr}</p>
        </div>
      </div>

      {/* Edit sheet */}
      {editOpen && (
        <Sheet title="Edit item" onClose={() => setEditOpen(false)}>
          <form onSubmit={handleEditSubmit} className="space-y-4 pb-1">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Photo</label>
              <div
                onClick={() => fileRef.current?.click()}
                className="rounded-2xl cursor-pointer overflow-hidden grid place-items-center text-center text-muted-foreground"
                style={{
                  border: displayImg ? 'none' : '2px dashed var(--border)',
                  background: 'var(--card)',
                  minHeight: displayImg ? 'auto' : '100px',
                  padding: displayImg ? '0' : '20px',
                }}
              >
                {displayImg ? (
                  <img src={displayImg} alt={item.name} className="w-full block rounded-xl object-cover" onError={() => { setPreview(null); setImageUrl('') }} />
                ) : (
                  <>
                    <div className="text-2xl mb-1">📷</div>
                    <b className="text-[13px] font-bold">Tap to change photo</b>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" name="image" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) { setPreview(URL.createObjectURL(f)); setImageUrl('') } }} />
              <input
                type="url"
                value={imageUrl}
                onChange={e => { setImageUrl(e.target.value); setPreview(null) }}
                placeholder="or paste image URL…"
                className={inputCls}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Name *</label>
              <input name="name" required defaultValue={item.name} className={inputCls} />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Price (Rp)</label>
                <input name="purchase_price" type="number" min="0" inputMode="numeric" defaultValue={item.purchase_price ?? ''} placeholder="0" className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Purchase date</label>
                <input name="purchase_date" type="date" defaultValue={item.purchase_date ?? ''} className={inputCls} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Notes</label>
              <textarea name="description" rows={3} defaultValue={item.description ?? ''} placeholder="Anything worth remembering…" className={`${inputCls} resize-none`} />
            </div>

            {error && <p className="text-xs text-destructive font-semibold">{error}</p>}

            <MobileButton type="submit" fullWidth loading={isPending} className="rounded-xl">
              Save changes
            </MobileButton>
            <MobileButton type="button" variant="destructive" fullWidth onClick={() => { setEditOpen(false); setDeleteOpen(true) }} disabled={isPending} className="rounded-xl mt-2">
              Delete item
            </MobileButton>
          </form>
        </Sheet>
      )}

      {/* Use sheet */}
      {useSheetOpen && (
        <Sheet title="Log a use" onClose={() => setUseSheetOpen(false)}>
          <form onSubmit={handleUseSubmit} className="space-y-4 pb-1">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Date</label>
              <input type="date" value={useDate} max={today} onChange={e => setUseDate(e.target.value)} className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Note (optional)</label>
              <input type="text" value={useNote} onChange={e => setUseNote(e.target.value)} placeholder="e.g. Office day, casual outing" className={inputCls} />
            </div>
            <MobileButton type="submit" fullWidth loading={isPending} className="rounded-xl">
              Save
            </MobileButton>
          </form>
        </Sheet>
      )}

      {/* Delete confirmation dialog */}
      {deleteOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={() => setDeleteOpen(false)} />
          <div className="relative w-full max-w-[340px] bg-background rounded-3xl p-6 text-center shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4 text-2xl">
              🗑️
            </div>
            <h2 className="text-[19px] font-extrabold tracking-tight mb-2">Delete item?</h2>
            <p className="text-[13.5px] text-muted-foreground leading-relaxed mb-5">
              <b className="text-foreground">{item.name}</b> will be permanently removed. This can&apos;t be undone.
            </p>
            <MobileButton variant="destructive" fullWidth loading={isPending} onClick={handleDelete} className="rounded-2xl mb-2.5">
              Yes, delete
            </MobileButton>
            <MobileButton variant="ghost" fullWidth onClick={() => setDeleteOpen(false)} disabled={isPending} className="rounded-2xl border border-border">
              Cancel
            </MobileButton>
          </div>
        </div>
      )}

      {/* Edit use count sheet */}
      {editUsesOpen && (
        <Sheet title="Edit use count" onClose={() => setEditUsesOpen(false)}>
          <div className="space-y-4 pb-1">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Total uses</label>
              <input
                type="number" inputMode="numeric" min="0"
                value={editUsesCount}
                onChange={e => setEditUsesCount(Math.max(0, parseInt(e.target.value) || 0))}
                className={inputCls}
              />
            </div>
            <MobileButton fullWidth onClick={handleSaveUses} loading={isPending} className="rounded-xl">
              Save
            </MobileButton>
          </div>
        </Sheet>
      )}

      {/* History sheet */}
      {listOpen && (
        <Sheet title="Use history" onClose={() => setListOpen(false)}>
          <p className="text-[11.5px] text-muted-foreground font-semibold mb-3 -mt-1">{item.use_count} total uses</p>
          {listLoading ? (
            <p className="text-muted-foreground text-center py-8 text-[14px]">Loading…</p>
          ) : uses.length === 0 ? (
            <p className="text-muted-foreground text-center py-8 text-[14px]">No uses logged yet</p>
          ) : (
            <div className="pb-2">
              {uses.map((u, i) => (
                <div key={u.id} className={`flex justify-between items-center py-3 ${i > 0 ? 'border-t border-border' : ''}`}>
                  <div>
                    <p className="text-[14px] font-bold m-0">{u.note ?? 'Use logged'}</p>
                    <p className="text-[11.5px] text-muted-foreground m-0 mt-0.5">
                      {new Date(u.used_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-bold">#{item.use_count - i}</span>
                </div>
              ))}
            </div>
          )}
        </Sheet>
      )}
    </div>
  )
}

function KVRow({ label, value, unset, divider }: { label: string; value: string | null; unset?: string; divider?: boolean }) {
  return (
    <div className={`flex justify-between items-center py-3 text-[13.5px] ${divider ? 'border-t border-border' : ''}`}>
      <span className="text-muted-foreground font-medium">{label}</span>
      <span className={`font-bold ${value ? 'text-foreground' : 'text-primary'}`}>{value ?? unset}</span>
    </div>
  )
}

// ── Sheet primitive (fixed, Cubicle-styled) ────────────────────────────────

function Sheet({ children, onClose, title }: { children: ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full bg-background rounded-t-2xl max-h-[90dvh] flex flex-col shadow-2xl">
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
