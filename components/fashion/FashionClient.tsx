'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { WardrobeItem, HobbyActivity, HobbyPhoto } from '@/lib/types'
import { ActivitiesTab } from '@/components/gear/ActivitiesTab'
import { MomentsTab } from '@/components/gear/MomentsTab'

const C = {
  bg: '#FDF7EE', card: '#FFFFFF', line: '#EFE6D6',
  ink: '#22190F', muted: '#8D8271',
  shadow: '0 6px 18px rgba(84,62,32,.08)',
}
const DP = 'var(--font-bricolage), system-ui, sans-serif'
const UI = "'Inter', -apple-system, system-ui, sans-serif"

type Tab = 'items' | 'activities' | 'moments'

interface FashionClientProps {
  user: User | null
  activities: HobbyActivity[]
  photos: HobbyPhoto[]
}

export function FashionClient({ user, activities, photos }: FashionClientProps) {
  const router = useRouter()
  const [tab, setTab]     = useState<Tab>('items')
  const [items, setItems] = useState<WardrobeItem[] | null>(null)
  const [showNames, setShowNames] = useState(true)

  useEffect(() => {
    createClient()
      .from('wardrobe_items')
      .select('*')
      .eq('status', 'verified')
      .order('created_at', { ascending: false })
      .then(({ data }) => setItems(data ?? []))
  }, [])

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'items',      label: 'Items',      count: items?.length ?? 0 },
    { key: 'activities', label: 'Activities', count: activities.length  },
    { key: 'moments',    label: 'Moments',    count: photos.length      },
  ]

  return (
    <div style={{ background: C.bg, minHeight: '100dvh', fontFamily: UI, color: C.ink }}>

      {/* ── Subhead ── */}
      <div style={{
        padding: 'calc(14px + env(safe-area-inset-top,0px)) 14px 10px',
        display: 'flex', alignItems: 'center', gap: 10,
        position: 'sticky', top: 0, zIndex: 10,
        background: '#FDF7EEf5', backdropFilter: 'blur(12px)',
      }}>
        <IconBtn onClick={() => router.push('/')}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </IconBtn>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontFamily: DP, fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            👔 Fashion
          </h1>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: C.muted }}>
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
            padding: '0 16px', borderRadius: 16, border: 'none',
            background: C.ink, color: '#FFF7EC',
            fontFamily: UI, fontSize: 12, fontWeight: 800,
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
              fontSize: 13, fontWeight: 700, padding: '11px 0', borderRadius: 99,
              background: tab === t.key ? C.ink : C.card,
              color: tab === t.key ? '#FFF7EC' : C.muted,
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
          {items === null ? (
            /* Skeleton */
            <div style={{ columns: 2, columnGap: 11 }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{
                  background: C.card, borderRadius: 22, marginBottom: 11,
                  breakInside: 'avoid', aspectRatio: '1',
                  boxShadow: C.shadow, opacity: 0.5,
                }} />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div style={{ padding: '50px 24px', textAlign: 'center', color: C.muted }}>
              <div style={{ width: 60, height: 60, borderRadius: 22, background: C.card, boxShadow: C.shadow, display: 'grid', placeItems: 'center', margin: '0 auto 14px', fontSize: 26 }}>👔</div>
              <b style={{ display: 'block', color: C.ink, fontFamily: DP, fontSize: 16, fontWeight: 700, marginBottom: 4 }}>No verified items yet</b>
              <p style={{ fontSize: 13, lineHeight: 1.5 }}>Check back soon</p>
            </div>
          ) : (
            <div style={{ columns: 2, columnGap: 11 }}>
              {items.map(item => (
                <div
                  key={item.id}
                  style={{
                    background: C.card, borderRadius: 22, boxShadow: C.shadow,
                    overflow: 'hidden', marginBottom: 11, breakInside: 'avoid',
                  }}
                >
                  <img
                    src={item.image_url}
                    alt={item.name}
                    style={{ width: '100%', display: 'block', objectFit: 'contain' }}
                  />
                  {showNames && (
                    <div style={{ padding: '10px 13px 13px' }}>
                      <b style={{ display: 'block', fontFamily: DP, fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.name}
                      </b>
                      {item.brand && (
                        <span style={{ display: 'block', fontSize: 10.5, fontWeight: 600, color: C.muted, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.brand}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'activities' && (
        <ActivitiesTab hobby="fashion" activities={activities} user={user} />
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
      width: 42, height: 42, borderRadius: 16, border: 'none',
      background: active ? '#22190F' : '#FFFFFF',
      color: active ? '#FFF7EC' : '#22190F',
      cursor: 'pointer', display: 'grid', placeItems: 'center',
      boxShadow: '0 6px 18px rgba(84,62,32,.08)', flexShrink: 0,
    }}>
      {children}
    </button>
  )
}
