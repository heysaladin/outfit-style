'use client'

import { useState, useTransition } from 'react'
import { flagDeclutter } from '@/app/actions'
import type { WardrobeItem, DeclutterStatus } from '@/lib/types'
import { DECLUTTER_STATUSES } from '@/lib/types'
import { BottomNav } from '@/components/BottomNav'

interface DeclutterClientProps {
  items: WardrobeItem[]
  cutoffDate: string
}

type Tab = 'suggested' | 'flagged'

export function DeclutterClient({ items, cutoffDate }: DeclutterClientProps) {
  const [tab, setTab]               = useState<Tab>('suggested')
  const [isPending, startTransition] = useTransition()
  const [pending, setPending]        = useState<string | null>(null)

  const suggested = items.filter(i =>
    !i.declutter_status &&
    (i.wear_count === 0 || (i.wear_count <= 2 && i.created_at < cutoffDate))
  )
  const flagged = items.filter(i => !!i.declutter_status)

  function handleFlag(itemId: string, status: DeclutterStatus | null) {
    setPending(itemId)
    startTransition(async () => {
      await flagDeclutter(itemId, status)
      setPending(null)
    })
  }

  const shown = tab === 'suggested' ? suggested : flagged

  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <h1 className="text-foreground font-bold text-lg">Declutter</h1>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 mx-4 mt-4 bg-muted rounded-xl p-1">
        {([
          { key: 'suggested', label: `Suggested (${suggested.length})` },
          { key: 'flagged',   label: `Flagged (${flagged.length})` },
        ] as { key: Tab; label: string }[]).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
              tab === t.key ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
            }`}>{t.label}</button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center px-6">
          <div className="text-4xl mb-3">✨</div>
          <p className="text-foreground font-semibold">
            {tab === 'suggested' ? 'No candidates found' : 'Nothing flagged'}
          </p>
          <p className="text-muted-foreground text-sm mt-1">
            {tab === 'suggested' ? 'Wear your items to track usage' : 'Flag items from the wardrobe'}
          </p>
        </div>
      ) : (
        <div className="px-4 pt-4 space-y-3 pb-24">
          {shown.map(item => (
            <div key={item.id} className="flex gap-3 bg-card rounded-2xl p-3 border border-border">
              <div className="w-20 aspect-[3/4] rounded-xl overflow-hidden flex-shrink-0">
                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0 py-1">
                <p className="text-foreground text-sm font-semibold truncate">{item.name}</p>
                <p className="text-muted-foreground text-xs mt-0.5 capitalize">{item.category}</p>
                <p className="text-muted-foreground/70 text-xs mt-1">
                  {item.wear_count === 0 ? 'Never worn' : `${item.wear_count} wears`}
                  {item.price ? ` · $${item.price}` : ''}
                </p>

                {/* Current flag */}
                {item.declutter_status && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: DECLUTTER_STATUSES.find(d => d.value === item.declutter_status)?.color + '22',
                        color: DECLUTTER_STATUSES.find(d => d.value === item.declutter_status)?.color
                      }}>
                      {DECLUTTER_STATUSES.find(d => d.value === item.declutter_status)?.label}
                    </span>
                    <button onClick={() => handleFlag(item.id, null)} disabled={pending === item.id}
                      className="text-muted-foreground text-xs hover:text-foreground transition-colors disabled:opacity-40">
                      Clear
                    </button>
                  </div>
                )}

                {/* Flag buttons */}
                {!item.declutter_status && (
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {DECLUTTER_STATUSES.map(d => (
                      <button key={d.value} onClick={() => handleFlag(item.id, d.value as DeclutterStatus)}
                        disabled={pending === item.id}
                        className="text-xs px-2 py-1 rounded-full border disabled:opacity-40 transition-all"
                        style={{ color: d.color, borderColor: d.color + '44' }}>
                        {d.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  )
}
