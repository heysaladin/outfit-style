'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, Download, Loader2 } from 'lucide-react'
import type { WardrobeItem } from '@/lib/types'
import { CATEGORY_TREE } from '@/lib/types'
import { daysDiff } from '@/lib/date'
import { BottomNav } from '@/components/BottomNav'
import { UserAvatarMenu } from '@/components/UserAvatarMenu'
import { StatsShareCard } from './StatsShareCard'

interface StatsClientProps { items: WardrobeItem[] }

function formatIDRCompact(n: number): string {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`
  if (n >= 1_000) return `Rp ${Math.round(n / 1_000)}rb`
  return `Rp ${Math.round(n)}`
}

export function StatsClient({ items }: StatsClientProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)

  async function handleExport() {
    if (!cardRef.current) return
    setExporting(true)
    try {
      const { toPng } = await import('html-to-image')
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 3, cacheBust: true })
      const link = document.createElement('a')
      link.download = 'interestory-stats.png'
      link.href = dataUrl
      link.click()
    } finally {
      setExporting(false)
    }
  }
  const total       = items.length
  const totalWears  = items.reduce((s, i) => s + i.wear_count, 0)
  const neverWorn   = items.filter(i => i.wear_count === 0)
  const latestUsed  = [...items].filter(i => i.last_worn).sort((a, b) => new Date(b.last_worn!).getTime() - new Date(a.last_worn!).getTime()).slice(0, 8)
  const mostWorn    = [...items].sort((a, b) => b.wear_count - a.wear_count).slice(0, 5)
  const leastWorn   = [...items].filter(i => i.wear_count > 0).sort((a, b) => a.wear_count - b.wear_count).slice(0, 5)
  const withPrice   = items.filter(i => i.price && i.wear_count > 0)
    .map(i => ({ ...i, cpw: i.price! / i.wear_count }))
    .sort((a, b) => a.cpw - b.cpw)

  const byCategory = CATEGORY_TREE
    .filter(cat => cat.value !== 'fashion')
    .map(cat => ({
      ...cat,
      count: items.filter(i => i.category === cat.value).length,
    })).filter(c => c.count > 0)

  const maxCat = Math.max(...byCategory.map(c => c.count), 1)

  return (
    <div className="h-dvh overflow-y-auto bg-background pb-24">
      <div
        className="bg-neutral-950 rounded-b-[28px] px-3 pb-[58px] flex flex-col"
        style={{ paddingTop: 'calc(16px + env(safe-area-inset-top, 0px))' }}
      >
        <div className="h-9 flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <Link
              href="/fashion"
              aria-label="Back to Interestory"
              className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-200 shrink-0"
            >
              <ChevronLeft size={16} strokeWidth={2} />
            </Link>
            <span className="text-xl font-semibold tracking-tight text-[#EEF040]">Ofit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleExport}
              disabled={exporting}
              aria-label="Export stats card"
              className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-200 shrink-0 disabled:opacity-50"
            >
              {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            </button>
            <UserAvatarMenu buttonClassName="relative w-9 h-9 rounded-full bg-neutral-800 border-2 border-neutral-700 flex items-center justify-center overflow-hidden flex-shrink-0" />
          </div>
        </div>

        <div className="pt-7 px-2 flex flex-col gap-2">
          <p className="text-sm font-medium uppercase tracking-[1.5px] text-neutral-400">All time</p>
          <h1 className="text-[30px] leading-[30px] tracking-[-1px] font-semibold text-neutral-50">Style stats</h1>
        </div>
      </div>

      <div className="-mt-[34px] mx-3 relative bg-neutral-800 rounded-xl px-4 py-3.5 grid grid-cols-3 gap-3 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)]">
        {[
          { label: 'Items', value: total },
          { label: 'Total wears', value: totalWears },
          { label: 'Never worn', value: neverWorn.length },
        ].map(stat => (
          <div key={stat.label} className="flex flex-col gap-0.5 min-w-0">
            <span className="text-2xl font-semibold tracking-[-0.5px] font-mono text-neutral-50 truncate">{stat.value}</span>
            <span className="text-xs text-neutral-400 truncate">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="px-5 pt-7 pb-28 flex flex-col gap-6">
        {/* Most worn */}
        {mostWorn.filter(i => i.wear_count > 0).length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold text-foreground">Most worn</h2>
            <div className="border border-border rounded-xl flex flex-col">
              {mostWorn.filter(i => i.wear_count > 0).map((item, idx, arr) => (
                <ItemRow key={item.id} item={item} rank={idx + 1} showBorder={idx < arr.length - 1} />
              ))}
            </div>
          </section>
        )}

        {/* Category breakdown */}
        {byCategory.length > 0 && (
          <section className="flex flex-col gap-3.5">
            <h2 className="text-xl font-semibold text-foreground">By category</h2>
            <div className="flex flex-col gap-1.5">
              {byCategory.map(cat => (
                <div key={cat.value} className="flex flex-col gap-1.5">
                  <div className="flex justify-between">
                    <span className="text-sm text-foreground">{cat.label}</span>
                    <span className="text-sm font-mono text-neutral-500">{cat.count}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-foreground rounded-full transition-all"
                      style={{ width: `${(cat.count / maxCat) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Latest used */}
        {latestUsed.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold text-foreground">Latest used</h2>
            <div className="border border-border rounded-xl flex flex-col">
              {latestUsed.map((item, idx, arr) => (
                <div key={item.id} className={`px-4 py-3 flex items-center gap-3 ${idx < arr.length - 1 ? 'border-b border-border' : ''}`}>
                  <span className="w-4 text-sm font-mono text-muted-foreground shrink-0">{idx + 1}</span>
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 relative bg-muted border border-border">
                    <Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="40px" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {new Date(item.last_worn!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {item.wear_count}× total
                    </p>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground shrink-0">{daysDiff(item.last_worn!) === 0 ? 'today' : `${daysDiff(item.last_worn!)}d ago`}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Least worn */}
        {leastWorn.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold text-foreground">Least worn</h2>
            <div className="border border-border rounded-xl flex flex-col">
              {leastWorn.map((item, idx, arr) => (
                <ItemRow key={item.id} item={item} rank={idx + 1} showBorder={idx < arr.length - 1} />
              ))}
            </div>
          </section>
        )}

        {/* Never worn */}
        {neverWorn.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold text-foreground">Never worn ({neverWorn.length})</h2>
            <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              {neverWorn.map(item => (
                <div key={item.id} className="flex-shrink-0 w-20 aspect-[3/4] rounded-xl overflow-hidden border border-border relative">
                  <Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="80px" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Cost per wear */}
        {withPrice.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold text-foreground">Cost per wear</h2>
            <div className="border border-border rounded-xl flex flex-col">
              {withPrice.slice(0, 8).map((item, idx, arr) => (
                <div key={item.id} className={`px-4 py-3 flex items-center gap-3 ${idx < arr.length - 1 ? 'border-b border-border' : ''}`}>
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 relative bg-muted border border-border">
                    <Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="40px" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.wear_count} wears · {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.price!)}</p>
                  </div>
                  <span className="text-sm font-mono text-foreground shrink-0">{formatIDRCompact(item.cpw)}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <BottomNav />

      {/* Hidden share card — rendered off-screen for html2canvas capture */}
      <div style={{ position: 'fixed', top: -9999, left: -9999, pointerEvents: 'none' }}>
        <StatsShareCard ref={cardRef} items={items} />
      </div>
    </div>
  )
}

function ItemRow({ item, rank, showBorder }: { item: WardrobeItem; rank: number; showBorder: boolean }) {
  return (
    <div className={`px-4 py-3 flex items-center gap-3 ${showBorder ? 'border-b border-border' : ''}`}>
      <span className="w-4 text-sm font-mono text-muted-foreground shrink-0">{rank}</span>
      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 relative bg-muted border border-border">
        <Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="40px" />
      </div>
      <div className="flex-1 min-w-0 flex flex-col">
        <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
        <p className="text-xs text-muted-foreground truncate">
          {item.price ? `${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.price / Math.max(1, item.wear_count))} per wear` :
            item.last_worn ? `Last ${new Date(item.last_worn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'Not worn yet'}
        </p>
      </div>
      <span className="text-sm font-mono text-foreground shrink-0">{item.wear_count}×</span>
    </div>
  )
}
