'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { HOBBIES } from '@/lib/types'
import type { HobbyActivity, HobbyPhoto } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { ReorderHobbiesModal, getOrderedHobbies } from '@/components/gear/ReorderHobbiesModal'

type Tab = 'home' | 'stats' | 'gallery'

const TINTS = ['#FFE9DB','#DDF4EA','#FFF3D1','#EDE6FD','#DCE8F5','#FBE0DC']

const C = {
  bg: '#FDF7EE', card: '#FFFFFF', card2: '#F7F0E4', line: '#EFE6D6',
  ink: '#22190F', muted: '#8D8271', faint: '#B8AD9A',
  orange: '#FF7A2F', orangeSoft: '#FFE9DB',
  mint: '#3FBF8F', mintSoft: '#DDF4EA',
  berry: '#8B5CF6', sun: '#FFC531', sunSoft: '#FFF3D1',
  danger: '#E9573F',
  shadow: '0 6px 18px rgba(84,62,32,.08)',
  shadowLg: '0 14px 34px rgba(84,62,32,.14)',
}

const DP = 'var(--font-bricolage), system-ui, sans-serif'
const UI = "'Inter', -apple-system, system-ui, sans-serif"

function NavTab({ label, active, onClick, children }: {
  label: string; active: boolean; onClick: () => void; children: React.ReactNode
}) {
  return (
    <button onClick={onClick} style={{
      background: 'none', border: 'none',
      color: active ? C.orange : C.faint,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
      fontFamily: UI, fontSize: 10, fontWeight: 700, cursor: 'pointer', width: 56, padding: '6px 0',
    }}>
      {children}
      {label}
    </button>
  )
}

export default function Home() {
  const [tab, setTab]               = useState<Tab>('home')
  const [popOpen, setPopOpen]       = useState(false)
  const [reorderOpen, setReorderOpen] = useState(false)
  const [user, setUser]             = useState<User | null>(null)
  const [hobbyOrder, setHobbyOrder] = useState(() => [...HOBBIES])
  const [activities, setActivities] = useState<HobbyActivity[]>([])
  const [photos, setPhotos]         = useState<HobbyPhoto[]>([])
  const [gearCounts, setGearCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    setHobbyOrder(getOrderedHobbies())
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data.user
      setUser(u)
      if (!u) return
      const [{ data: acts }, { data: pics }, { data: gear }, { count: wardrobeCount }] = await Promise.all([
        supabase.from('hobby_activities').select('id,hobby,activity_at,note,location,user_id,created_at').eq('user_id', u.id).order('activity_at', { ascending: false }),
        supabase.from('hobby_photos').select('*').eq('user_id', u.id).order('created_at', { ascending: false }),
        supabase.from('hobby_items').select('category'),
        supabase.from('wardrobe_items').select('*', { count: 'exact', head: true }).eq('user_id', u.id),
      ])
      setActivities(acts ?? [])
      setPhotos(pics ?? [])
      const counts: Record<string, number> = { fashion: wardrobeCount ?? 0 }
      for (const item of (gear ?? [])) {
        counts[item.category] = (counts[item.category] ?? 0) + 1
      }
      setGearCounts(counts)
    })
  }, [])

  const firstName = user?.user_metadata?.full_name?.split(' ')[0]
    ?? user?.email?.split('@')[0]
    ?? 'there'
  const avatarLetter = (firstName[0] ?? 'H').toUpperCase()

  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })

  // Last 7 days (Sun=0..Sat=6 order relative to today)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now); d.setDate(d.getDate() - (6 - i)); return d
  })
  const DAY_LABELS = ['S','M','T','W','T','F','S']
  const activeDaySet = new Set(activities.map(a => new Date(a.activity_at).toDateString()))
  const weekDots = weekDays.map((d, i) => ({
    label: DAY_LABELS[d.getDay()], active: activeDaySet.has(d.toDateString()), isToday: i === 6,
  }))

  // Streak: consecutive days back from today
  let streak = 0
  for (let i = 0; i < 60; i++) {
    const d = new Date(now); d.setDate(d.getDate() - i)
    if (activeDaySet.has(d.toDateString())) streak++
    else break
  }

  // Last active label per hobby
  const lastActive: Record<string, string> = {}
  for (const a of activities) {
    if (!lastActive[a.hobby]) {
      const diff = Math.floor((now.getTime() - new Date(a.activity_at).getTime()) / 86400000)
      if (diff === 0) lastActive[a.hobby] = 'today'
      else if (diff === 1) lastActive[a.hobby] = 'yesterday'
      else if (diff < 7) lastActive[a.hobby] = `${diff}d ago`
      else lastActive[a.hobby] = `${Math.floor(diff / 7)}w ago`
    }
  }

  // Sorted hobby list for stats
  const hobbiesByActivity = [...HOBBIES].map(h => ({
    ...h, count: activities.filter(a => a.hobby === h.value).length,
  })).sort((a, b) => b.count - a.count).filter(h => h.count > 0)

  const hobbyLinks = [
    { label: 'Fashion', icon: '👔', href: '/fashion', value: 'fashion' },
    ...hobbyOrder.map(h => ({ label: h.label, icon: h.icon as string, href: `/${h.value}`, value: h.value })),
  ]

  return (
    <div style={{ background: '#EFE7D9', height: '100dvh', fontFamily: UI, color: C.ink }}>
      <div style={{
        width: '100%', maxWidth: 430, height: '100dvh', background: C.bg,
        margin: '0 auto', position: 'relative', display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* ── Header ── */}
        <header style={{ padding: 'calc(18px + env(safe-area-inset-top,0px)) 18px 6px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.faint }}>
            {dateStr}
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, marginTop: 4 }}>
            <h1 style={{ fontFamily: DP, fontWeight: 800, fontSize: 28, lineHeight: 1.06, letterSpacing: '-0.02em', margin: 0 }}>
              Hi {firstName},<br />let&apos;s add to your{' '}
              <em style={{ fontStyle: 'normal', color: C.orange }}>story</em>
            </h1>
            <button
              onClick={(e) => { e.stopPropagation(); setPopOpen(v => !v) }}
              style={{
                width: 44, height: 44, borderRadius: '50%', border: 'none', cursor: 'pointer', flexShrink: 0,
                background: 'linear-gradient(135deg,#FFC531,#FF7A2F)',
                display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 15,
                color: '#4A2A00', fontFamily: DP, boxShadow: C.shadow,
              }}
            >
              {user ? avatarLetter : '?'}
            </button>
          </div>
        </header>

        {/* ── Popup menu ── */}
        {popOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 55 }} onClick={() => setPopOpen(false)}>
            <div
              style={{
                position: 'absolute', top: 'calc(78px + env(safe-area-inset-top,0px))', right: 16,
                background: C.card, borderRadius: 20, minWidth: 240, maxWidth: 'calc(100vw - 32px)',
                boxShadow: C.shadowLg, overflow: 'hidden',
              }}
              onClick={e => e.stopPropagation()}
            >
              {user ? (
                <>
                  <div style={{ padding: '14px 16px', fontSize: 12, fontWeight: 600, color: C.muted, borderBottom: `1px solid ${C.line}`, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.email}
                  </div>
                  <button
                    style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 10, background: 'none', border: 'none', color: C.ink, fontFamily: UI, fontSize: 14, fontWeight: 600, padding: '13px 16px', cursor: 'pointer', textAlign: 'left' }}
                    onClick={() => { setPopOpen(false); setReorderOpen(true) }}
                  >
                    ⇅ &nbsp;Reorder interests
                  </button>
                  <form action="/auth/signout" method="post" style={{ margin: 0 }}>
                    <button style={{ display: 'flex', width: '100%', alignItems: 'center', background: 'none', border: 'none', color: C.danger, fontFamily: UI, fontSize: 14, fontWeight: 600, padding: '13px 16px', cursor: 'pointer', textAlign: 'left' }}>
                      Sign out
                    </button>
                  </form>
                </>
              ) : (
                <Link href="/login" style={{ display: 'block', padding: '13px 16px', color: C.ink, fontWeight: 600, fontSize: 14, textDecoration: 'none' }} onClick={() => setPopOpen(false)}>
                  Login
                </Link>
              )}
            </div>
          </div>
        )}

        {/* ── Scrollable content ── */}
        <div style={{
          flex: 1, overflowY: 'auto', overscrollBehavior: 'contain',
          padding: '0 18px calc(100px + env(safe-area-inset-bottom,0px))',
        }}>

          {/* ════ HOME TAB ════ */}
          {tab === 'home' && (
            <>
              {/* Momo mascot card */}
              <div style={{
                margin: '16px 0 4px', padding: 16, borderRadius: 28,
                background: C.card, boxShadow: C.shadow,
                display: 'flex', alignItems: 'center', gap: 14,
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', right: -30, top: -30, width: 120, height: 120, borderRadius: '50%', background: C.sunSoft }} />
                <svg style={{ width: 86, height: 86, flexShrink: 0, position: 'relative', zIndex: 1 }} viewBox="0 0 100 100">
                  <ellipse cx="26" cy="22" rx="13" ry="15" fill="#FF9A5C"/>
                  <ellipse cx="74" cy="22" rx="13" ry="15" fill="#FF9A5C"/>
                  <ellipse cx="26" cy="24" rx="7" ry="9" fill="#FFD9BE"/>
                  <ellipse cx="74" cy="24" rx="7" ry="9" fill="#FFD9BE"/>
                  <circle cx="50" cy="55" r="36" fill="#FF9A5C"/>
                  <ellipse cx="50" cy="66" rx="24" ry="18" fill="#FFE4CE"/>
                  <circle cx="37" cy="50" r="5" fill="#2B1B0E"/>
                  <circle cx="63" cy="50" r="5" fill="#2B1B0E"/>
                  <circle cx="38.6" cy="48.4" r="1.7" fill="#fff"/>
                  <circle cx="64.6" cy="48.4" r="1.7" fill="#fff"/>
                  <ellipse cx="30" cy="60" rx="5" ry="3.2" fill="#FFB68F"/>
                  <ellipse cx="70" cy="60" rx="5" ry="3.2" fill="#FFB68F"/>
                  <path d="M43 64 Q50 71 57 64" stroke="#2B1B0E" strokeWidth="3" strokeLinecap="round" fill="none"/>
                  <ellipse cx="50" cy="58" rx="4.5" ry="3.4" fill="#2B1B0E"/>
                </svg>
                <div style={{ flex: 1, zIndex: 1, position: 'relative' }}>
                  <b style={{ fontFamily: DP, fontWeight: 700, fontSize: 15.5, display: 'block', lineHeight: 1.25 }}>
                    {streak > 1
                      ? `"${streak}-day streak! You're on fire \uD83D\uDD25"`
                      : streak === 1
                      ? '"Great start! Keep logging today \uD83C\uDFAF"'
                      : '"Start logging to build your story \uD83C\uDFAF"'}
                  </b>
                  <span style={{ fontSize: 12, color: C.muted, display: 'block', marginTop: 3 }}>Momo · your interest pal</span>
                </div>
              </div>

              {/* Week streak dots */}
              <div style={{
                margin: '12px 0 4px', padding: '13px 16px', borderRadius: 22,
                background: C.card, boxShadow: C.shadow,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <b style={{ fontFamily: DP, fontSize: 22, fontWeight: 800 }}>🔥 {streak}</b>
                  <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, lineHeight: 1.3 }}>day<br />streak</span>
                </div>
                <div style={{ display: 'flex', gap: 9 }}>
                  {weekDots.map((d, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: C.faint }}>{d.label}</span>
                      <div style={{
                        width: 10, height: 10, borderRadius: '50%',
                        background: d.active ? C.orange : C.line,
                        outline: d.isToday ? `2px solid ${C.orange}` : 'none',
                        outlineOffset: 2,
                      }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Section header */}
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '22px 4px 12px' }}>
                <h2 style={{ fontFamily: DP, fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em', margin: 0 }}>
                  Interests <small style={{ fontSize: 12, color: C.faint, fontWeight: 600, marginLeft: 5 }}>{hobbyLinks.length}</small>
                </h2>
                <button
                  style={{ background: 'none', border: 'none', color: C.orange, fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 4 }}
                  onClick={() => setReorderOpen(true)}
                >
                  Reorder
                </button>
              </div>

              {/* Hobby grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
                {hobbyLinks.map(({ label, icon, href, value }, i) => {
                  const count = gearCounts[value] ?? 0
                  const last = lastActive[value]
                  const dots = weekDays.map(d =>
                    activities.some(a => a.hobby === value && new Date(a.activity_at).toDateString() === d.toDateString())
                  )
                  return (
                    <Link key={label} href={href} prefetch={false} style={{
                      background: C.card, borderRadius: 22, boxShadow: C.shadow,
                      padding: '15px 14px 13px', textDecoration: 'none', color: C.ink,
                      display: 'flex', flexDirection: 'column', gap: 10,
                      WebkitTapHighlightColor: 'transparent',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ width: 40, height: 40, borderRadius: 14, background: TINTS[i % TINTS.length], display: 'grid', placeItems: 'center', fontSize: 21 }}>
                          {icon}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, background: C.card2, padding: '4px 9px', borderRadius: 99 }}>
                          {count} items
                        </span>
                      </div>
                      <div style={{ fontFamily: DP, fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>
                        {label}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: C.faint }}>{last ?? 'not started'}</span>
                        <span style={{ display: 'flex', gap: 3.5 }}>
                          {dots.map((on, j) => (
                            <i key={j} style={{ display: 'block', width: 5, height: 5, borderRadius: '50%', background: on ? C.mint : C.line }} />
                          ))}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </>
          )}

          {/* ════ STATS TAB ════ */}
          {tab === 'stats' && (
            <div style={{ paddingTop: 16 }}>
              {!user ? (
                <EmptyState icon="📊" title="Sign in to see stats" desc="Track your hobby activity over time">
                  <Link href="/login" style={{ color: C.orange, fontWeight: 700, fontSize: 14, marginTop: 12, display: 'inline-block' }}>Login</Link>
                </EmptyState>
              ) : activities.length === 0 ? (
                <EmptyState icon="📈" title="No activities yet" desc="Start logging activities in your hobbies" />
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11, marginTop: 14 }}>
                    {[
                      { v: streak, unit: 'days', l: 'Current streak' },
                      { v: activities.length, unit: '', l: 'Total activities' },
                      { v: Object.keys(lastActive).length, unit: '', l: 'Active hobbies' },
                      { v: Object.values(gearCounts).reduce((a, b) => a + b, 0), unit: '', l: 'Items catalogued' },
                    ].map((s, i) => (
                      <div key={i} style={{ background: C.card, boxShadow: C.shadow, borderRadius: 22, padding: '16px 15px' }}>
                        <div style={{ fontFamily: DP, fontSize: 28, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em' }}>
                          {s.v}{s.unit ? <small style={{ fontSize: 14, color: C.muted, fontWeight: 600 }}> {s.unit}</small> : null}
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: C.faint, marginTop: 8 }}>{s.l}</div>
                      </div>
                    ))}
                  </div>

                  {hobbiesByActivity.length > 0 && (
                    <div style={{ background: C.card, boxShadow: C.shadow, borderRadius: 28, padding: '17px 15px', marginTop: 12 }}>
                      <h3 style={{ fontFamily: DP, fontSize: 15.5, fontWeight: 700, margin: '0 0 4px' }}>Top hobbies</h3>
                      {hobbiesByActivity.slice(0, 5).map((h, i) => {
                        const maxC = hobbiesByActivity[0].count
                        const pct = maxC > 0 ? (h.count / maxC) * 100 : 0
                        const colors = [C.orange, C.mint, C.sun, C.berry, '#0ea5e9']
                        const bgs = [C.orangeSoft, C.mintSoft, C.sunSoft, '#EDE6FD', '#E0F2FE']
                        return (
                          <div key={h.value} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 2px', borderTop: i > 0 ? `1px solid ${C.line}` : 'none' }}>
                            <span style={{ fontFamily: DP, fontWeight: 800, fontSize: 13, color: C.faint, width: 18 }}>{i + 1}</span>
                            <span style={{ width: 38, height: 38, borderRadius: 13, background: bgs[i], display: 'grid', placeItems: 'center', fontSize: 19, flexShrink: 0 }}>{h.icon}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <b style={{ fontSize: 14, fontWeight: 700, display: 'block' }}>{h.label}</b>
                              <span style={{ fontSize: 11.5, fontWeight: 500, color: C.muted }}>{h.count} activities</span>
                              <div style={{ height: 5, borderRadius: 99, marginTop: 6, background: colors[i], width: `${pct}%` }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ════ GALLERY TAB ════ */}
          {tab === 'gallery' && (
            <div style={{ paddingTop: 16 }}>
              {!user ? (
                <EmptyState icon="🖼️" title="Sign in to see gallery" desc="Your captured moments will appear here">
                  <Link href="/login" style={{ color: C.orange, fontWeight: 700, fontSize: 14, marginTop: 12, display: 'inline-block' }}>Login</Link>
                </EmptyState>
              ) : photos.length === 0 ? (
                <EmptyState icon="📸" title="No photos yet" desc="Capture moments from your hobbies" />
              ) : (
                <div style={{ columns: 2, columnGap: 11, marginTop: 4 }}>
                  {photos.map(p => (
                    <div key={p.id} style={{ borderRadius: 16, marginBottom: 11, overflow: 'hidden', position: 'relative', breakInside: 'avoid', boxShadow: C.shadow }}>
                      <img src={p.image_url} alt={p.hobby} style={{ width: '100%', display: 'block', objectFit: 'cover' }} />
                      <span style={{ position: 'absolute', top: 8, left: 8, fontSize: 13, background: 'rgba(255,255,255,.9)', borderRadius: 99, padding: '4px 8px', boxShadow: C.shadow }}>
                        {HOBBIES.find(h => h.value === p.hobby)?.icon ?? '📷'}
                      </span>
                      {p.note && (
                        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '24px 11px 9px', fontSize: 11, fontWeight: 700, color: '#fff', background: 'linear-gradient(transparent,rgba(30,20,5,.72))' }}>
                          {p.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Bottom nav — floating pill ── */}
        <nav style={{
          position: 'fixed',
          bottom: 'calc(10px + env(safe-area-inset-bottom,0px))',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(calc(100vw - 24px), 406px)',
          height: 66,
          borderRadius: 26,
          background: C.card,
          boxShadow: C.shadowLg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 30,
          padding: '0 18px',
        }}>
          <NavTab label="Home" active={tab === 'home'} onClick={() => setTab('home')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 10.5L12 3l9 7.5V21H3z"/><path d="M9 21v-6h6v6"/>
            </svg>
          </NavTab>

          <NavTab label="Stats" active={tab === 'stats'} onClick={() => setTab('stats')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 20V10M12 20V4M20 20v-7"/>
            </svg>
          </NavTab>

          {/* FAB */}
          <div style={{ position: 'relative', width: 58, height: 58, marginTop: -28, flexShrink: 0, display: 'grid', placeItems: 'center' }}>
            <button style={{
              width: 58, height: 58, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: C.orange, color: '#fff', display: 'grid', placeItems: 'center',
              boxShadow: '0 10px 24px rgba(255,122,47,.45)',
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </button>
          </div>

          <NavTab label="Gallery" active={tab === 'gallery'} onClick={() => setTab('gallery')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="3"/>
              <circle cx="9" cy="10" r="1.6" fill="currentColor" stroke="none"/>
              <path d="M21 15l-5-4-9 8"/>
            </svg>
          </NavTab>

          <NavTab label="Search" active={false} onClick={() => {}}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
            </svg>
          </NavTab>
        </nav>

        {/* Reorder modal */}
        {reorderOpen && (
          <ReorderHobbiesModal
            initialOrder={hobbyOrder}
            onClose={() => setReorderOpen(false)}
            onSave={(newOrder) => setHobbyOrder(newOrder)}
          />
        )}
      </div>
    </div>
  )
}

function EmptyState({ icon, title, desc, children }: { icon: string; title: string; desc: string; children?: React.ReactNode }) {
  return (
    <div style={{ padding: '50px 24px', textAlign: 'center', color: C.muted }}>
      <div style={{ width: 60, height: 60, borderRadius: 22, background: C.card, boxShadow: C.shadow, display: 'grid', placeItems: 'center', margin: '0 auto 14px', fontSize: 26 }}>{icon}</div>
      <b style={{ display: 'block', color: C.ink, fontFamily: DP, fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{title}</b>
      <p style={{ fontSize: 13, lineHeight: 1.5 }}>{desc}</p>
      {children}
    </div>
  )
}
