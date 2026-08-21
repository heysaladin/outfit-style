'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { WardrobeItem, HobbyActivity, HobbyPhoto } from '@/lib/types'
import { ActivitiesTab } from '@/components/gear/ActivitiesTab'
import { MomentsTab } from '@/components/gear/MomentsTab'

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
