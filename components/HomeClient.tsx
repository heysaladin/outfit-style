'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Home, BarChart2, Images, Menu, X, ArrowUpDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { HOBBIES } from '@/lib/types'
import type { User } from '@supabase/supabase-js'
import { ReorderHobbiesModal, getOrderedHobbies } from './gear/ReorderHobbiesModal'

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
  const [tab, setTab]             = useState<Tab>('home')
  const [menuOpen, setMenuOpen]   = useState(false)
  const [reorderOpen, setReorderOpen] = useState(false)
  const [activities, setActivities] = useState<HobbyActivity[]>([])
  const [photos, setPhotos]       = useState<HobbyPhoto[]>([])
  const [loaded, setLoaded]       = useState(false)
  const [hobbyOrder, setHobbyOrder] = useState(() => getOrderedHobbies())

  const hobbyLinks = [
    { label: 'Fashion', icon: '👔', href: '/fashion' },
    ...hobbyOrder.map(h => ({ label: h.label, icon: h.icon, href: `/${h.value}` })),
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

  const firstName = user?.user_metadata?.full_name?.split(' ')[0]
    ?? user?.email?.split('@')[0]
    ?? null

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="px-5 pt-14 pb-2 flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-sm font-medium">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-foreground font-bold text-2xl tracking-tight mt-0.5">
            {firstName ? `Hello, ${firstName}` : 'Interestory'}
          </h1>
        </div>
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-muted mt-1"
        >
          {menuOpen ? <X size={16} className="text-foreground" /> : <Menu size={16} className="text-foreground" />}
        </button>
      </header>

      {/* Dropdown menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)}>
          <div
            className="absolute top-28 right-4 bg-background border border-border rounded-2xl shadow-xl p-2 min-w-[180px]"
            onClick={e => e.stopPropagation()}
          >
            {user ? (
              <>
                <p className="px-3 py-2 text-xs text-muted-foreground truncate">{user.email}</p>
                <div className="h-px bg-border my-1" />
                <button
                  className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm font-medium rounded-xl hover:bg-muted transition-colors"
                  onClick={() => { setMenuOpen(false); setReorderOpen(true) }}
                >
                  <ArrowUpDown size={14} className="text-muted-foreground" />
                  Change the order
                </button>
                <Link
                  href="/profile"
                  className="block px-3 py-2.5 text-sm font-medium rounded-xl hover:bg-muted transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Profile
                </Link>
                <form action="/auth/signout" method="post">
                  <button className="w-full text-left px-3 py-2.5 text-sm font-medium rounded-xl hover:bg-muted transition-colors text-destructive">
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                className="block px-3 py-2.5 text-sm font-medium rounded-xl hover:bg-muted transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <main className="px-5 pt-5">
        {tab === 'home' && (
          <>
            <h2 className="text-foreground font-bold text-base mb-3">Interests</h2>
            <div className="grid grid-cols-2 gap-2.5 pb-6">
              {hobbyLinks.map(({ label, icon, href }) => (
                <Link
                  key={label}
                  href={href}
                  prefetch={false}
                  className="flex flex-col gap-4 bg-muted rounded-2xl px-4 py-5 active:scale-[0.97] transition-transform"
                >
                  <span className="text-2xl leading-none">{icon}</span>
                  <span className="text-foreground text-sm font-semibold">{label}</span>
                </Link>
              ))}
            </div>
          </>
        )}

        {tab === 'stats' && (
          <div className="pb-6">
            {!user ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
                <p className="text-foreground font-semibold">Sign in to see your stats</p>
                <Link href="/login" className="text-sm font-medium underline">Login</Link>
              </div>
            ) : statsData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
                <p className="text-foreground font-semibold">No activity recorded yet</p>
                <p className="text-muted-foreground text-sm">Start logging activities in your hobbies</p>
              </div>
            ) : (
              <>
                <h2 className="text-foreground font-bold text-base mb-5">Activity Duration</h2>
                {(() => {
                  const total = statsData.reduce((s, d) => s + d.value, 0)
                  return (
                    <>
                      <div className="flex h-3 rounded-full overflow-hidden gap-px mb-5">
                        {statsData.map(d => (
                          <div
                            key={d.name}
                            style={{ width: `${(d.value / total) * 100}%`, background: d.color }}
                          />
                        ))}
                      </div>
                      <div className="space-y-1">
                        {statsData.map(d => (
                          <div key={d.name} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                            <div className="flex items-center gap-2.5">
                              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                              <span className="text-sm font-medium">{d.icon} {d.name}</span>
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
                <Link href="/login" className="text-sm font-medium underline">Login</Link>
              </div>
            ) : photos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
                <p className="text-foreground font-semibold">No photos yet</p>
                <p className="text-muted-foreground text-sm">Add moments in your hobbies</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1 rounded-2xl overflow-hidden">
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

      {reorderOpen && (
        <ReorderHobbiesModal
          initialOrder={hobbyOrder}
          onClose={() => setReorderOpen(false)}
          onSave={(newOrder) => setHobbyOrder(newOrder)}
        />
      )}

      {/* Bottom nav */}
      <nav
        className="fixed bottom-0 inset-x-0 z-20 bg-background border-t border-border flex"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {([
          { key: 'home',    label: 'Home',    Icon: Home      },
          { key: 'stats',   label: 'Stats',   Icon: BarChart2 },
          { key: 'gallery', label: 'Gallery', Icon: Images    },
        ] as const).map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 flex flex-col items-center pt-3 pb-2 gap-0.5 transition-colors ${
              tab === key ? 'text-foreground' : 'text-muted-foreground/40'
            }`}
          >
            <Icon size={20} strokeWidth={tab === key ? 2 : 1.5} />
            <span className={`text-[9px] font-medium tracking-wide mt-0.5 ${tab === key ? 'opacity-100' : 'opacity-60'}`}>
              {label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  )
}
