'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { WardrobeItem, HobbyActivity, HobbyPhoto } from '@/lib/types'
import { ActivitiesTab } from '@/components/gear/ActivitiesTab'
import { MomentsTab } from '@/components/gear/MomentsTab'
import { postOutfitActivity } from '@/app/actions'

const C = {
  bg: 'var(--background)', card: 'var(--card)', line: 'var(--border)',
  ink: 'var(--foreground)', muted: 'var(--muted-foreground)',
  shadow: 'none',
}
const DP = 'var(--font-sans), system-ui, sans-serif'
const UI = DP

type Tab = 'items' | 'activities' | 'moments'
type SortKey = 'wear' | 'price' | 'date'

interface FashionClientProps {
  user: User | null
  activities: HobbyActivity[]
  photos: HobbyPhoto[]
}

export function FashionClient({ user, activities, photos }: FashionClientProps) {
  const router = useRouter()
  const [tab, setTab]
           = useState<Tab>('items')
  const [items, setItems]       = useState<WardrobeItem[] | null>(null)
  const [showNames, setShowNames] = useState(true)
  const [sort, setSort] = useState<SortKey>('wear')
  const [qpOpen, setQpOpen]         = useState(false)
  const [qpSelected, setQpSelected] = useState<Set<string>>(new Set())
  const [qpCaption, setQpCaption]   = useState('')
  const [qpSearch, setQpSearch]     = useState('')
  const [qpPending, setQpPending]   = useState(false)
  const [qpError, setQpError]       = useState('')

  useEffect(() => {
    createClient()
      .from('wardrobe_items')
      .select('*')
      .eq('status', 'verified')
      .is('declutter_status', null)
      .order('wear_count', { ascending: true })
      .order('created_at', { ascending: false })
      .then(({ data }) => setItems(data ?? []))
  }, [])

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'items',      label: 'Items',      count: items?.length ?? 0 },
    { key: 'activities', label: 'Activities', count: activities.length  },
    { key: 'moments',    label: 'Moments',    count: photos.length      },
  ]

  return (
    <div style={{ background: C.bg, height: '100dvh', overflowY: 'auto', fontFamily: UI, color: C.ink }}>

      {/* ── Subhead ── */}
      <div style={{
        padding: 'calc(14px + env(safe-area-inset-top,0px)) 14px 10px',
        display: 'flex', alignItems: 'center', gap: 10,
        position: 'sticky', top: 0, zIndex: 10,
        background: 'color-mix(in srgb, var(--background) 95%, transparent)', backdropFilter: 'blur(12px)',
      }}>
        <IconBtn onClick={() => router.push('/')}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </IconBtn>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontFamily: DP, fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            👔 Fashion
          </h1>
          <span style={{ fontSize: 'var(--text-para-xs)', fontWeight: 600, color: C.muted }}>
            {items?.length ?? 0} items
          </span>
        </div>

        {/* Show/hide names toggle */}
        <IconBtn
          onClick={() => setShowNames(v => !v)}
          active={showNames}
          title={showNames ? 'Hide names' : 'Show names'}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 6h16M4 12h16M4 18h10"/>
          </svg>
        </IconBtn>

        {/* Post Outfit button */}
        {user && (
          <button
            onClick={() => { setQpOpen(true); setQpSelected(new Set()); setQpCaption(''); setQpSearch(''); setQpError('') }}
            style={{
              display: 'flex', alignItems: 'center', height: 42,
              padding: '0 14px', borderRadius: 'var(--radius-full)', border: 'none',
              background: 'var(--card)', color: 'var(--foreground)',
              fontFamily: UI, fontSize: 'var(--text-para-xs)', fontWeight: 700,
              cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
            }}
          >
            + Post
          </button>
        )}

        {/* Wardrobe link */}
        <a
          href="/ofit"
          style={{
            display: 'flex', alignItems: 'center', height: 42,
            padding: '0 16px', borderRadius: 'var(--radius-full)', border: 'none',
            background: 'var(--primary)', color: 'var(--primary-foreground)',
            fontFamily: UI, fontSize: 'var(--text-para-xs)', fontWeight: 700,
            textDecoration: 'none', whiteSpace: 'nowrap',
            boxShadow: C.shadow,
          }}
        >
          Wardrobe
        </a>
      </div>

      {/* ── Segmented tabs ── */}
      <div style={{ display: 'flex', gap: 6, padding: '6px 18px 12px' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1, border: 'none', cursor: 'pointer', fontFamily: UI,
              fontSize: 'var(--text-para-sm)', fontWeight: 700, padding: '11px 0', borderRadius: 'var(--radius-full)',
              background: tab === t.key ? 'var(--primary)' : 'var(--card)',
              color: tab === t.key ? 'var(--primary-foreground)' : C.muted,
              boxShadow: C.shadow,
            }}
          >
            {t.label}
            {t.count > 0 && (
              <b style={{ fontWeight: 700, fontSize: 11, marginLeft: 4, opacity: 0.6 }}>{t.count}</b>
            )}
          </button>
        ))}
      </div>

      {/* ── Items tab ── */}
      {tab === 'items' && (
        <div style={{ padding: '0 18px 40px' }}>

          {/* Sort pills */}
          {items && items.length > 0 && (
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              {([
                { key: 'wear' as SortKey, label: 'Wear' },
                { key: 'price' as SortKey, label: 'Price' },
                { key: 'date' as SortKey, label: 'Date' },
              ]).map(s => (
                <button
                  key={s.key}
                  onClick={() => setSort(s.key)}
                  style={{
                    border: 'none', cursor: 'pointer', fontFamily: UI,
                    fontSize: 'var(--text-para-xs)', fontWeight: 700,
                    padding: '7px 14px', borderRadius: 'var(--radius-full)',
                    background: sort === s.key ? 'var(--primary)' : 'var(--card)',
                    color: sort === s.key ? 'var(--primary-foreground)' : C.muted,
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}

          {items === null ? (
            /* Skeleton */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{
                  background: C.card, borderRadius: 'var(--radius-xl)', aspectRatio: '1', opacity: 0.5,
                }} />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div style={{ padding: '50px 24px', textAlign: 'center', color: C.muted }}>
              <div style={{ width: 60, height: 60, borderRadius: 'var(--radius-xl)', background: C.card, display: 'grid', placeItems: 'center', margin: '0 auto 14px', fontSize: 26 }}>👔</div>
              <b style={{ display: 'block', color: C.ink, fontFamily: DP, fontSize: 16, fontWeight: 700, marginBottom: 4 }}>No verified items yet</b>
              <p style={{ fontSize: 13, lineHeight: 1.5 }}>Check back soon</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {[...items].sort((a, b) => {
                if (sort === 'wear') return a.wear_count - b.wear_count || new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                if (sort === 'price') return (b.price ?? -1) - (a.price ?? -1)
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              }).map(item => (
                <Link
                  key={item.id}
                  href={`/fashion/${item.id}`}
                  style={{
                    display: 'block', background: C.card, borderRadius: 'var(--radius-xl)',
                    overflow: 'hidden', border: `1px solid var(--border)`,
                    textDecoration: 'none', WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <img
                    src={item.image_url}
                    alt={item.name}
                    style={{ width: '100%', display: 'block', objectFit: 'cover', aspectRatio: '1' }}
                  />
                  <div style={{ padding: '10px 13px 13px' }}>
                    {showNames && (
                      <>
                        <b style={{ display: 'block', fontFamily: DP, fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.name}
                        </b>
                        {item.brand && (
                          <span style={{ display: 'block', fontSize: 10.5, fontWeight: 600, color: C.muted, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.brand}
                          </span>
                        )}
                      </>
                    )}
                    <div style={{ marginTop: showNames ? 8 : 0 }}>
                      <div style={{ height: 3, borderRadius: 'var(--radius-full)', background: 'var(--muted)', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 'var(--radius-full)',
                          width: `${Math.min(item.wear_count / 20, 1) * 100}%`,
                          background: item.wear_count >= 20 ? '#16a34a' : item.wear_count >= 10 ? '#d97706' : '#94a3b8',
                        }} />
                      </div>
                      <span style={{ display: 'block', fontSize: 9.5, fontWeight: 600, color: C.muted, marginTop: 3 }}>
                        {item.wear_count}× · {
                          item.wear_count >= 100 ? '💎 Excellent!'
                          : item.wear_count >= 20 ? `${100 - item.wear_count} more to Excellent`
                          : `${20 - item.wear_count} more to Worth it`
                        }
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'activities' && (
        <ActivitiesTab hobby="fashion" activities={activities} photos={photos} user={user} />
      )}

      {tab === 'moments' && (
        <MomentsTab hobby="fashion" photos={photos} user={user} />
      )}

      {/* ── Quick Post Outfit sheet ── */}
      {qpOpen && items && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 50 }} onClick={() => setQpOpen(false)} />
          <div style={{
            position: 'fixed', left: '50%', transform: 'translateX(-50%)',
            bottom: 0, width: '100%', maxWidth: 430, zIndex: 60,
            background: 'var(--background)', borderRadius: '28px 28px 0 0',
            maxHeight: '90dvh', display: 'flex', flexDirection: 'column',
            paddingBottom: 'env(safe-area-inset-bottom,0px)',
          }}>
            <div style={{ width: 40, height: 5, borderRadius: 99, background: 'var(--border)', margin: '10px auto 2px', flexShrink: 0 }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 18px 12px', flexShrink: 0 }}>
              <h2 style={{ fontFamily: DP, fontSize: 20, fontWeight: 800, margin: 0 }}>Post Outfit</h2>
              <button onClick={() => setQpOpen(false)} style={{ width: 36, height: 36, borderRadius: 12, border: 'none', background: 'var(--card)', cursor: 'pointer', display: 'grid', placeItems: 'center', color: 'var(--foreground)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
              </button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, padding: '0 18px 18px' }}>
              {/* Selected preview */}
              {qpSelected.size > 0 && (
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 14, paddingBottom: 4, scrollbarWidth: 'none' }}>
                  {items.filter(i => qpSelected.has(i.id)).map(item => (
                    <div key={item.id} style={{ width: 72, height: 72, flexShrink: 0, borderRadius: 14, overflow: 'hidden', border: '2px solid var(--primary)', position: 'relative' }}>
                      <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              )}

              {/* Search */}
              <div style={{ position: 'relative', marginBottom: 10 }}>
                <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
                <input
                  value={qpSearch}
                  onChange={e => setQpSearch(e.target.value)}
                  placeholder="Search items..."
                  style={{ width: '100%', background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: 14, padding: '10px 14px 10px 34px', color: 'var(--foreground)', fontFamily: UI, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Item grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
                {items.filter(i => !qpSearch.trim() || [i.name, i.brand, ...(i.tags ?? [])].filter(Boolean).join(' ').toLowerCase().includes(qpSearch.toLowerCase())).map(item => {
                  const sel = qpSelected.has(item.id)
                  return (
                    <button key={item.id} onClick={() => setQpSelected(s => { const n = new Set(s); sel ? n.delete(item.id) : n.add(item.id); return n })}
                      style={{ position: 'relative', aspectRatio: '1', borderRadius: 14, overflow: 'hidden', border: `2px solid ${sel ? 'var(--primary)' : 'var(--border)'}`, background: 'none', cursor: 'pointer', padding: 0 }}>
                      <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {sel && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.15)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 6 }}>
                          <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
                          </div>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Caption */}
              <textarea
                value={qpCaption}
                onChange={e => setQpCaption(e.target.value)}
                placeholder="Add a caption... (optional)"
                rows={2}
                style={{ width: '100%', background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: 14, padding: '12px 14px', color: 'var(--foreground)', fontFamily: UI, fontSize: 14, outline: 'none', resize: 'none', boxSizing: 'border-box', marginBottom: 4 }}
              />
              {qpError && <p style={{ color: 'var(--destructive)', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>{qpError}</p>}
            </div>

            <div style={{ padding: '12px 18px 16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
              <button
                disabled={qpPending || qpSelected.size === 0}
                onClick={async () => {
                  if (qpSelected.size === 0) return setQpError('Pilih minimal 1 item')
                  setQpPending(true); setQpError('')
                  const selectedItems = items.filter(i => qpSelected.has(i.id)).map(i => ({ id: i.id, image_url: i.image_url, name: i.name }))
                  const res = await postOutfitActivity(selectedItems, qpCaption)
                  if (res.error) { setQpError(res.error); setQpPending(false); return }
                  setQpOpen(false); setQpSelected(new Set()); setQpCaption(''); setQpPending(false)
                }}
                style={{ width: '100%', border: 'none', borderRadius: 18, padding: 16, cursor: qpSelected.size === 0 ? 'not-allowed' : 'pointer', background: 'var(--primary)', color: 'var(--primary-foreground)', fontFamily: UI, fontSize: 15, fontWeight: 800, opacity: (qpPending || qpSelected.size === 0) ? 0.5 : 1 }}
              >
                {qpPending ? 'Posting...' : `Post & Log Wear (${qpSelected.size} item${qpSelected.size !== 1 ? 's' : ''})`}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}


function IconBtn({ onClick, children, active, title }: { onClick: () => void; children: React.ReactNode; active?: boolean; title?: string }) {
  return (
    <button onClick={onClick} title={title} style={{
      width: 42, height: 42, borderRadius: 'var(--radius-full)', border: 'none',
      background: active ? 'var(--foreground)' : 'var(--card)',
      color: active ? 'var(--background)' : 'var(--foreground)',
      cursor: 'pointer', display: 'grid', placeItems: 'center',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)', flexShrink: 0,
    }}>
      {children}
    </button>
  )
}
