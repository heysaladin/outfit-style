'use client'

import { useRouter } from 'next/navigation'
import { useTransition, useState } from 'react'
import { ChevronLeft, Pencil, X } from 'lucide-react'
import type { ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import type { WardrobeItem } from '@/lib/types'
import { WorthCard } from '@/components/worth/WorthCard'
import { wearItem, setWardrobeItemWearCount, setWardrobeItemTarget } from '@/app/actions'
import { MobileButton } from '@/components/ui/mobile-shims'

const inputCls = "w-full bg-background border border-border rounded-xl px-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground outline-none box-border"

interface Props {
  item: WardrobeItem
  user: User | null
}

export function FashionItemDetailClient({ item, user }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [wearCount, setWearCount] = useState(item.wear_count)
  const [lastWorn, setLastWorn]   = useState(item.last_worn)

  const [editUsesOpen, setEditUsesOpen]   = useState(false)
  const [editUsesCount, setEditUsesCount] = useState<string>(String(item.wear_count))
  const [editUsesPending, setEditUsesPending] = useState(false)

  const [target, setTarget]           = useState(item.target ?? 0)
  const [editingTarget, setEditingTarget] = useState(false)
  const [editTargetValue, setEditTargetValue] = useState<string>(String(item.target ?? 0))
  const [targetPending, setTargetPending] = useState(false)

  const priceStr = item.price
    ? item.price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
    : null
  const lastWornStr = lastWorn
    ? new Date(lastWorn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'never worn'
  const addedStr = new Date(item.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  function handleUse() {
    startTransition(async () => {
      const res = await wearItem(item.id)
      if (res.error) return
      const today = new Date().toISOString().split('T')[0]
      setWearCount(c => c + 1)
      setLastWorn(today)
      router.refresh()
    })
  }

  async function handleSaveUses() {
    setEditUsesPending(true)
    const count = Math.max(0, parseInt(editUsesCount) || 0)
    const res = await setWardrobeItemWearCount(item.id, count)
    setEditUsesPending(false)
    if (res.error) return
    setWearCount(count)
    setEditUsesOpen(false)
    router.refresh()
  }

  async function handleSaveTarget() {
    setTargetPending(true)
    const val = Math.max(0, parseInt(editTargetValue) || 0)
    const res = await setWardrobeItemTarget(item.id, val)
    setTargetPending(false)
    if (res.error) return
    setTarget(val)
    setEditingTarget(false)
    router.refresh()
  }

  return (
    <div className="bg-background h-dvh overflow-y-auto text-foreground">

      {/* Sticky header */}
      <header
        className="sticky top-0 z-10 flex items-center gap-2 px-3.5 pb-2.5 bg-background/95 backdrop-blur-sm border-b border-border"
        style={{ paddingTop: 'calc(14px + env(safe-area-inset-top,0px))' }}
      >
        <MobileButton
          variant="ghost" size="sm"
          icon={<ChevronLeft size={18} />}
          onClick={() => router.push('/fashion')}
          className="w-9 h-9 rounded-xl p-0 justify-center"
        />
        <div className="flex-1 min-w-0">
          <h1 className="text-[18px] font-extrabold tracking-tight leading-none truncate">{item.name}</h1>
          {item.brand && (
            <span className="text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wider">{item.brand}</span>
          )}
        </div>
      </header>

      {/* Scrollable content */}
      <div className="px-4 pt-1 pb-12">

        {/* Hero image */}
        {item.image_url && (
          <div className="rounded-[28px] overflow-hidden mb-0 bg-card">
            <img src={item.image_url} alt={item.name} className="w-full block object-contain" />
          </div>
        )}

        <div className="pt-4">

          <h1 className="text-[23px] font-extrabold leading-tight tracking-tight mb-2.5">{item.name}</h1>

          {/* Chips */}
          <div className="flex gap-1.5 flex-wrap mb-3.5">
            <span className="text-[11px] font-bold text-primary bg-secondary rounded-full px-3 py-1.5">
              👔 {item.category}
            </span>
            {item.color && (
              <span className="text-[11px] font-bold text-muted-foreground bg-card rounded-full px-3 py-1.5">
                {item.color}
              </span>
            )}
          </div>

          {item.subcategory && (
            <p className="text-[14px] leading-relaxed text-muted-foreground mb-3.5">{item.subcategory}</p>
          )}

          {/* Use bar */}
          <div className="flex items-center gap-3 mb-3 bg-card rounded-3xl p-3.5">
            <div className="text-[28px] font-extrabold leading-none">{wearCount}</div>
            <div className="flex-1">
              <b className="text-[14px] block">uses</b>
              <span className="block text-[11px] font-semibold text-muted-foreground mt-0.5">{lastWornStr}</span>
            </div>
            {user && (
              <button
                onClick={() => { setEditUsesCount(String(wearCount)); setEditUsesOpen(true) }}
                className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground flex-shrink-0 mr-1.5"
              >
                <Pencil size={15} />
              </button>
            )}
            {user && (
              <MobileButton
                size="sm"
                onClick={handleUse}
                disabled={isPending}
                className="rounded-full px-5 py-3 text-[14px] font-extrabold"
              >
                + Use
              </MobileButton>
            )}
          </div>

          {/* KV table */}
          <div className="bg-card rounded-3xl px-4 py-1 mb-3">
            {priceStr && <KVRow label="Purchase price" value={priceStr} />}
            {item.purchase_date && (
              <KVRow
                label="Purchase date"
                value={new Date(item.purchase_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                divider={!!priceStr}
              />
            )}
            {item.status && (
              <KVRow label="Status" value={item.status === 'verified' ? 'Verified' : 'Draft'} divider />
            )}
            {item.occasions && item.occasions.length > 0 && (
              <KVRow label="Occasions" value={item.occasions.join(', ')} divider />
            )}
            {item.seasons && item.seasons.length > 0 && (
              <KVRow label="Seasons" value={item.seasons.join(', ')} divider />
            )}
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
          <WorthCard purchasePrice={item.price} purchaseDate={item.purchase_date} totalUses={wearCount} targetOverride={target > 0 ? target : null} />

          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mt-4">Added {addedStr}</p>
        </div>
      </div>

      {/* Edit use count sheet */}
      {editUsesOpen && (
        <Sheet title="Edit use count" onClose={() => setEditUsesOpen(false)}>
          <div className="space-y-4 pb-1">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Total uses</label>
              <input
                type="number" inputMode="numeric" min="0"
                value={editUsesCount}
                onChange={e => setEditUsesCount(e.target.value.replace(/[^0-9]/g, ''))}
                onFocus={e => e.target.select()}
                className={inputCls}
              />
            </div>
            <MobileButton fullWidth loading={editUsesPending} onClick={handleSaveUses} className="rounded-xl">
              Save
            </MobileButton>
          </div>
        </Sheet>
      )}
    </div>
  )
}

function KVRow({ label, value, divider }: { label: string; value: string; divider?: boolean }) {
  return (
    <div className={`flex justify-between items-center py-3 text-[13.5px] ${divider ? 'border-t border-border' : ''}`}>
      <span className="text-muted-foreground font-medium">{label}</span>
      <span className="font-bold text-right ml-3">{value}</span>
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
