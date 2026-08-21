'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { flagDeclutter, setItemStatus, deleteItem } from '@/app/actions'
import type { WardrobeItem, DeclutterStatus } from '@/lib/types'
import { DECLUTTER_STATUSES } from '@/lib/types'
import { BottomNav } from '@/components/BottomNav'

interface DeclutterClientProps {
  items: WardrobeItem[]
  cutoffDate: string
}

type Tab = 'suggested' | 'flagged' | 'trash'

export function DeclutterClient({ items, cutoffDate }: DeclutterClientProps) {
  const router                       = useRouter()
  const [tab, setTab]               = useState<Tab>('suggested')
  const [isPending, startTransition] = useTransition()
  const [pending, setPending]        = useState<string | null>(null)
  const [query, setQuery]            = useState('')

  const suggested = items.filter(i =>
    i.status !== 'trashed' &&
    !i.declutter_status &&
    (i.wear_count === 0 || (i.wear_count <= 2 && i.created_at < cutoffDate))
  )
  const flagged = items.filter(i => i.status !== 'trashed' && !!i.declutter_status)
  const trashed = items.filter(i => i.status === 'trashed')

  function handleFlag(itemId: string, status: DeclutterStatus | null) {
    setPending(itemId)
    startTransition(async () => {
      await flagDeclutter(itemId, status)
      setPending(null)
    })
  }

  function handleRestore(itemId: string) {
    setPending(itemId)
    startTransition(async () => {
      await setItemStatus(itemId, 'draft')
      router.refresh()
      setPending(null)
    })
  }

  function handleDelete(itemId: string) {
    setPending(itemId)
    startTransition(async () => {
      await deleteItem(itemId)
      router.refresh()
      setPending(null)
    })
  }

  const q = query.trim().toLowerCase()
  const pool = tab === 'suggested' ? suggested : tab === 'flagged' ? flagged : trashed
  const shown = pool.filter(i => !q || i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q))

  const emptyMsg = {
    suggested: { title: 'No candidates found', sub: 'Wear your items to track usage' },
    flagged:   { title: 'Nothing flagged',      sub: 'Flag items from the wardrobe' },
    trash:     { title: 'Trash is empty',       sub: 'Trashed items appear here' },
  }[tab]

  return (
    <div className="h-dvh overflow-y-auto bg-background pb-16">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 pt-3 pb-2 space-y-2">
        <h1 className="text-foreground font-bold text-lg">Declutter</h1>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
          </svg>
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search items…"
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 mx-4 mt-4 bg-muted rounded-xl p-1">
        {([
          { key: 'suggested', label: `Suggested (${suggested.length})` },
          { key: 'flagged',   label: `Flagged (${flagged.length})` },
          { key: 'trash',     label: `Trash (${trashed.length})` },
        ] as { key: Tab; label: string }[]).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
              tab === t.key ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
            }`}>{t.label}</button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center px-6">
          <div className="text-4xl mb-3">{tab === 'trash' ? '🗑️' : '✨'}</div>
          <p className="text-foreground font-semibold">{emptyMsg.title}</p>
          <p className="text-muted-foreground text-sm mt-1">{emptyMsg.sub}</p>
        </div>
      ) : (
        <div className="px-4 pt-4 space-y-3 pb-24">
          {shown.map(item => (
            <div key={item.id} className="flex gap-3 bg-card rounded-2xl p-3 border border-border">
              <div className="w-20 aspect-[3/4] rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                {item.image_url && (
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0 py-1">
                <p className="text-foreground text-sm font-semibold truncate">{item.name}</p>
                <p className="text-muted-foreground text-xs mt-0.5 capitalize">{item.category}</p>
                <p className="text-muted-foreground/70 text-xs mt-1">
                  {item.wear_count === 0 ? 'Never worn' : `${item.wear_count} wears`}
                  {item.price ? ` · $${item.price}` : ''}
                </p>

                {/* Trash tab actions */}
                {tab === 'trash' && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleRestore(item.id)}
                      disabled={pending === item.id}
                      className="text-xs px-2.5 py-1 rounded-full border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-40"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={pending === item.id}
                      className="text-xs px-2.5 py-1 rounded-full border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40"
                    >
                      Delete
                    </button>
                  </div>
                )}

                {/* Current flag */}
                {tab !== 'trash' && item.declutter_status && (
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
                {tab !== 'trash' && !item.declutter_status && (
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
