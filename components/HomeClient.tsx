'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Home, BarChart2, Images, Menu, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { HOBBIES } from '@/lib/types'
import type { User } from '@supabase/supabase-js'

type Tab = 'home' | 'stats' | 'gallery'

interface HobbyActivity {
  id: string
  hobby: string
  duration_minutes: number | null
  activity_at: string
}

interface HobbyPhoto {
  id: string
  hobby: string
  photo_url: string
  created_at: string
}

const HOBBY_COLORS = [
  '#6366f1','#ec4899','#f59e0b','#10b981','#3b82f6',
  '#8b5cf6','#f97316','#14b8a6','#ef4444','#84cc16',
  '#06b6d4','#a855f7','#eab308','#22c55e','#0ea5e9',
  '#d946ef','#f43f5e','#64748b',
]

export function HomeClient({ user }: { user: User | null }) {
  const [tab, setTab]         = useState<Tab>('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const [activities, setActivities] = useState<HobbyActivity[]>([])
  const [photos, setPhotos]   = useState<HobbyPhoto[]>([])
  const [loaded, setLoaded]   = useState(false)

  const hobbyLinks = [
    { label: 'Fashion', icon: '👔', href: '/fashion' },
    ...HOBBIES.map(h => ({ label: h.label, icon: h.icon, href: `/${h.value}` })),
  ]

  useEffect(() => {
    if (!user || loaded) return
    const supabase = createClient()
    Promise.all([
      supabase.from('hobby_activities').select('id,hobby,duration_minutes,activity_at').eq('user_id', user.id),
      supabase.from('hobby_photos').select('id,hobby,photo_url,created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
    ]).then(([{ data: acts }, { data: pics }]) => {
      setActivities(acts ?? [])
      setPhotos(pics ?? [])
      setLoaded(true)
    })
  }, [user, loaded])

  // Build pie chart data from activity durations
  const statsData = HOBBIES.map((h, i) => {
    const total = activities
      .filter(a => a.hobby === h.value)
      .reduce((sum, a) => sum + (a.duration_minutes ?? 0), 0)
    return { name: h.label, value: total, icon: h.icon, color: HOBBY_COLORS[i % HOBBY_COLORS.length] }
  }).filter(d => d.value > 0)

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-border px-5 py-4 flex items-center justify-between">
        <h1 className="text-foreground font-bold text-base tracking-tight">Interestory</h1>
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      {/* Burger dropdown */}
      {menuOpen && (
        <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)}>
          <div
            className="absolute top-16 right-4 bg-card border border-border rounded-2xl shadow-lg p-2 min-w-[160px]"
            onClick={e => e.stopPropagation()}
          >
            {user ? (
              <>
                <p className="px-3 py-2 text-xs text-muted-foreground truncate">{user.email}</p>
                <div className="h-px bg-border my-1" />
                <Link
                  href="/profile"
                  className="block px-3 py-2 text-sm rounded-xl hover:bg-muted transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Profile
                </Link>
                <form action="/auth/signout" method="post">
                  <button className="w-full text-left px-3 py-2 text-sm rounded-xl hover:bg-muted transition-colors text-destructive">
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                className="block px-3 py-2 text-sm rounded-xl hover:bg-muted transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <main className="px-4 pt-6">
        {tab === 'home' && (
          <div className="grid grid-cols-2 gap-3 pb-6">
            {hobbyLinks.map(({ label, icon, href }) => (
              <Link
                key={label}
                href={href}
                prefetch={false}
                className="flex flex-col gap-3 bg-card border border-border rounded-2xl px-4 py-5 hover:border-foreground/20 hover:bg-accent/40 transition-all active:scale-[0.98]"
              >
                <span className="text-2xl leading-none">{icon}</span>
                <span className="text-foreground text-sm font-medium tracking-tight">{label}</span>
              </Link>
            ))}
          </div>
        )}

        {tab === 'stats' && (
          <div className="pb-6">
            {!user ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
                <p className="text-foreground font-semibold">Sign in to see your stats</p>
                <Link href="/login" className="text-sm text-primary">Login</Link>
              </div>
            ) : statsData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
                <p className="text-foreground font-semibold">No activity recorded yet</p>
                <p className="text-muted-foreground text-sm">Start logging activities in your hobbies</p>
              </div>
            ) : (
              <>
                <h2 className="text-foreground font-bold text-lg mb-5">Activity Duration</h2>
                {(() => {
                  const total = statsData.reduce((s, d) => s + d.value, 0)
                  return (
                    <>
                      {/* Segmented bar */}
                      <div className="flex h-4 rounded-full overflow-hidden gap-px mb-5">
                        {statsData.map(d => (
                          <div
                            key={d.name}
                            style={{ width: `${(d.value / total) * 100}%`, background: d.color }}
                          />
                        ))}
                      </div>
                      {/* Legend */}
                      <div className="space-y-2">
                        {statsData.map(d => (
                          <div key={d.name} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                              <span className="text-sm">{d.icon} {d.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{d.value} min</span>
                              <span className="text-xs opacity-60">{Math.round((d.value / total) * 100)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )
                })()}
              </>
            )}
          </div>
        )}

        {tab === 'gallery' && (
          <div className="pb-6">
            {!user ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
                <p className="text-foreground font-semibold">Sign in to see your gallery</p>
                <Link href="/login" className="text-sm text-primary">Login</Link>
              </div>
            ) : photos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
                <p className="text-foreground font-semibold">No photos yet</p>
                <p className="text-muted-foreground text-sm">Add moments in your hobbies</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1">
                {photos.map(p => (
                  <div key={p.id} className="aspect-square bg-muted overflow-hidden">
                    <img src={p.photo_url} alt={p.hobby} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom nav */}
      <nav
        className="fixed bottom-0 inset-x-0 z-10 bg-background/95 backdrop-blur-md border-t border-border flex"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {([
          { key: 'home',    label: 'Home',       Icon: Home      },
          { key: 'stats',   label: 'Statistics', Icon: BarChart2 },
          { key: 'gallery', label: 'Gallery',    Icon: Images    },
        ] as const).map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 flex flex-col items-center pt-2.5 pb-2 gap-1 transition-colors ${
              tab === key ? 'text-primary' : 'text-muted-foreground/60'
            }`}
          >
            <Icon size={18} strokeWidth={tab === key ? 2.2 : 1.6} />
            <span className={`text-[9px] font-medium tracking-wide ${tab === key ? 'opacity-100' : 'opacity-70'}`}>
              {label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  )
}
