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

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-border px-5 py-4 flex items-center justify-between">
        <h1 className="text-foreground font-bold text-base tracking-tight">Interestory</h1>
        <button onClick={() => setMenuOpen(v => !v)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-muted transition-colors">
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)}>
          <div className="absolute top-16 right-4 bg-card border border-border rounded-2xl shadow-lg p-2 min-w-[160px]" onClick={e => e.stopPropagation()}>
            {user ? (
              <>
                <p className="px-3 py-2 text-xs text-muted-foreground truncate">{user.email}</p>
                <div className="h-px bg-border my-1" />
                <form action="/auth/signout" method="post">
                  <button className="w-full text-left px-3 py-2 text-sm rounded-xl hover:bg-muted transition-colors text-destructive">
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <Link href="/login" className="block px-3 py-2 text-sm rounded-xl hover:bg-muted transition-colors" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
            )}
          </div>
        </div>
      )}

      <main className="px-4 pt-6">
        {tab === 'home' && (
          <div className="grid grid-cols-2 gap-3 pb-6">
            {hobbyLinks.map(({ label, icon, href }) => (
              <Link key={label} href={href} prefetch={false} className="flex flex-col gap-3 bg-card border border-border rounded-2xl px-4 py-5 hover:border-foreground/20 hover:bg-accent/40 transition-all active:scale-[0.98]">
                <span className="text-2xl leading-none">{icon}</span>
                <span className="text-foreground text-sm font-medium tracking-tight">{label}</span>
              </Link>
            ))}
          </div>
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

      <nav className="fixed bottom-0 inset-x-0 z-10 bg-background/95 backdrop-blur-md border-t border-border flex" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {([
          { key: 'home' as Tab,    label: 'Home',       Icon: HomeIcon  },
          { key: 'stats' as Tab,   label: 'Statistics', Icon: BarChart2 },
          { key: 'gallery' as Tab, label: 'Gallery',    Icon: Images    },
        ]).map(({ key, label, Icon }) => (
          <button key={key} onClick={() => setTab(key)} className={`flex-1 flex flex-col items-center pt-2.5 pb-2 gap-1 transition-colors ${tab === key ? 'text-primary' : 'text-muted-foreground/60'}`}>
            <Icon size={18} strokeWidth={tab === key ? 2.2 : 1.6} />
            <span className={`text-[9px] font-medium tracking-wide ${tab === key ? 'opacity-100' : 'opacity-70'}`}>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
