'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BarChart2, Images, Menu, X, Home as HomeIcon } from 'lucide-react'
import { HOBBIES } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

type Tab = 'home' | 'stats' | 'gallery'

const hobbyLinks = [
  { label: 'Fashion', icon: '👔', href: '/fashion' },
  ...HOBBIES.map(h => ({ label: h.label, icon: h.icon as string, href: `/${h.value}` })),
]

export default function Home() {
  const [tab, setTab]           = useState<Tab>('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser]         = useState<User | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

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

      {menuOpen && (
        <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)}>
          <div className="absolute top-28 right-4 bg-background border border-border rounded-2xl shadow-xl p-2 min-w-[180px]" onClick={e => e.stopPropagation()}>
            {user ? (
              <>
                <p className="px-3 py-2 text-xs text-muted-foreground truncate">{user.email}</p>
                <div className="h-px bg-border my-1" />
                <form action="/auth/signout" method="post">
                  <button className="w-full text-left px-3 py-2.5 text-sm font-medium rounded-xl hover:bg-muted transition-colors text-destructive">
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <Link href="/login" className="block px-3 py-2.5 text-sm font-medium rounded-xl hover:bg-muted transition-colors" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
            )}
          </div>
        </div>
      )}

      <main className="px-5 pt-5">
        {tab === 'home' && (
          <>
            <h2 className="text-foreground font-bold text-base mb-3">Interests</h2>
            <div className="grid grid-cols-2 gap-2.5 pb-6">
              {hobbyLinks.map(({ label, icon, href }) => (
                <Link key={label} href={href} prefetch={false}
                  className="flex flex-col gap-4 bg-muted rounded-2xl px-4 py-5 active:scale-[0.97] transition-transform">
                  <span className="text-2xl leading-none">{icon}</span>
                  <span className="text-foreground text-sm font-semibold">{label}</span>
                </Link>
              ))}
            </div>
          </>
        )}
        {tab === 'stats' && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <p className="text-foreground font-semibold">Statistics coming soon</p>
          </div>
        )}
        {tab === 'gallery' && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <p className="text-foreground font-semibold">Gallery coming soon</p>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-20 bg-background border-t border-border flex" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {([
          { key: 'home' as Tab,    label: 'Home',    Icon: HomeIcon  },
          { key: 'stats' as Tab,   label: 'Stats',   Icon: BarChart2 },
          { key: 'gallery' as Tab, label: 'Gallery', Icon: Images    },
        ]).map(({ key, label, Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-1 flex flex-col items-center pt-3 pb-2 gap-0.5 transition-colors ${tab === key ? 'text-foreground' : 'text-muted-foreground/40'}`}>
            <Icon size={20} strokeWidth={tab === key ? 2 : 1.5} />
            <span className={`text-[9px] font-medium tracking-wide mt-0.5 ${tab === key ? 'opacity-100' : 'opacity-60'}`}>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
