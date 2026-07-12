'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import type { HobbyItem, HobbyActivity, HobbyPhoto } from '@/lib/types'
import { AddGearModal } from './AddGearModal'
import { ActivitiesTab } from './ActivitiesTab'
import { MomentsTab } from './MomentsTab'

const C = {
  bg: '#FDF7EE', card: '#FFFFFF', line: '#EFE6D6',
  ink: '#22190F', muted: '#8D8271',
  shadow: '0 6px 18px rgba(84,62,32,.08)',
}
const DP = 'var(--font-bricolage), system-ui, sans-serif'
const UI = "'Inter', -apple-system, system-ui, sans-serif"

const ITEM_TINTS = [
  'linear-gradient(150deg,#FFF0DC,#FFDFC2)',
  'linear-gradient(150deg,#EAEFFB,#D8E2F5)',
  'linear-gradient(150deg,#DFF2E4,#B7DFC3)',
  'linear-gradient(150deg,#EDE6FD,#D3C4F6)',
  'linear-gradient(150deg,#FBE0DC,#F2BBB2)',
  'linear-gradient(150deg,#D8ECF7,#A9D2EA)',
]

type Tab = 'items' | 'activities' | 'moments'

interface Props {
  hobby: { value: string; label: string; icon: string; category: string }
  items: HobbyItem[]
  activities: HobbyActivity[]
  photos: HobbyPhoto[]
  user: User | null
  wardrobeHref?: string
}

function lastActiveLabel(activities: HobbyActivity[]): string {
  if (!activities.length) return 'never'
  const diff = Math.floor((Date.now() - new Date(activities[0].activity_at).getTime()) / 86400000)
  if (diff === 0) return 'today'
  if (diff === 1) return 'yesterday'
  if (diff < 7) return `${diff}d ago`
  return `${Math.floor(diff / 7)}w ago`
}

export function HobbyDetailClient({ hobby, items, activities, photos, user }: Props) {
  const router = useRouter()
  const [tab, setTab]       = useState<Tab>('items')
  const [addOpen, setAddOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return <div style={{ minHeight: '100dvh', background: C.bg }} />

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'items',      label: 'Items',      count: items.length      },
    { key: 'activities', label: 'Activities', count: activities.length },
    { key: 'moments',    label: 'Moments',    count: photos.length     },
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
            {hobby.label}
          </h1>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: C.muted }}>
            {items.length} items · last active {lastActiveLabel(activities)}
          </span>
        </div>

        {user && tab === 'items' && (
          <IconBtn onClick={() => setAddOpen(true)}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </IconBtn>
        )}
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
          {items.length === 0 ? (
            <EmptyState icon={hobby.icon} title={`No ${hobby.label} items yet`} desc={user ? 'Tap + to add your first item' : 'Sign in to add items'} />
          ) : (
            <div style={{ columns: 2, columnGap: 11 }}>
              {items.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => router.push(`/${hobby.value}/${item.id}`)}
                  style={{
                    background: C.card, border: 'none', borderRadius: 22, boxShadow: C.shadow,
                    overflow: 'hidden', cursor: 'pointer', color: C.ink, textAlign: 'left', padding: 0,
                    WebkitTapHighlightColor: 'transparent',
                    display: 'block', width: '100%', marginBottom: 11, breakInside: 'avoid',
                  }}
                >
                  <div style={{
                    aspectRatio: '1', display: 'grid', placeItems: 'center',
                    fontSize: 52, position: 'relative',
                    background: item.image_url ? undefined : ITEM_TINTS[i % ITEM_TINTS.length],
                  }}>
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span>{hobby.icon}</span>
                    )}
                    <span style={{
                      position: 'absolute', bottom: 8, right: 8,
                      fontSize: 10.5, fontWeight: 700,
                      padding: '4px 9px', borderRadius: 99,
                      background: 'rgba(255,255,255,.9)', color: C.ink, boxShadow: C.shadow,
                    }}>
                      {item.use_count} uses
                    </span>
                  </div>
                  <div style={{ padding: '11px 13px 13px' }}>
                    <b style={{ display: 'block', fontFamily: DP, fontSize: 13.5, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </b>
                    {item.description && (
                      <span style={{ display: 'block', fontSize: 11, fontWeight: 500, color: C.muted, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.description}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'activities' && (
        <ActivitiesTab hobby={hobby.value} activities={activities} user={user} />
      )}

      {tab === 'moments' && (
        <MomentsTab hobby={hobby.value} photos={photos} user={user} />
      )}

      {addOpen && user && (
        <AddGearModal defaultHobby={hobby.value} onClose={() => setAddOpen(false)} />
      )}
    </div>
  )
}

function IconBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      width: 42, height: 42, borderRadius: 16, border: 'none',
      background: '#FFFFFF', color: '#22190F', cursor: 'pointer',
      display: 'grid', placeItems: 'center',
      boxShadow: '0 6px 18px rgba(84,62,32,.08)', flexShrink: 0,
    }}>
      {children}
    </button>
  )
}

function EmptyState({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div style={{ padding: '50px 24px', textAlign: 'center', color: '#8D8271' }}>
      <div style={{ width: 60, height: 60, borderRadius: 22, background: '#FFFFFF', boxShadow: '0 6px 18px rgba(84,62,32,.08)', display: 'grid', placeItems: 'center', margin: '0 auto 14px', fontSize: 26 }}>{icon}</div>
      <b style={{ display: 'block', color: '#22190F', fontFamily: 'var(--font-bricolage), system-ui', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{title}</b>
      <p style={{ fontSize: 13, lineHeight: 1.5 }}>{desc}</p>
    </div>
  )
}
