'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, Archive, Package2, CalendarRange, Shirt, BookOpen, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const MENU_ITEMS = [
  { href: '/declutter', icon: Archive,       label: 'Declutter' },
  { href: '/wardrobes', icon: Package2,      label: 'Storage'   },
  { href: '/plan',      icon: CalendarRange, label: 'Plan'      },
  { href: '/fashion',   icon: Shirt,         label: 'Fashion'   },
  { href: '/literacy',  icon: BookOpen,      label: 'Literacy'  },
  { href: '/profile',   icon: User,          label: 'Profile'   },
]

export function UserAvatarMenu() {
  const [user, setUser]   = useState<SupabaseUser | null>(null)
  const [open, setOpen]   = useState(false)
  const menuRef           = useRef<HTMLDivElement>(null)
  const router            = useRouter()

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  async function handleSignOut() {
    setOpen(false)
    await createClient().auth.signOut()
    router.push('/login')
  }

  if (!user) return null

  const name   = user.user_metadata?.full_name?.split(' ')[0] ?? user.email?.split('@')[0]
  const avatar = user.user_metadata?.avatar_url

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0"
      >
        {avatar
          ? <img src={avatar} alt={name} className="w-full h-full object-cover" />
          : <User size={15} className="text-foreground" />}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-48 bg-background border border-border rounded-2xl shadow-xl overflow-hidden z-50">
          <div className="px-3 py-3 border-b border-border">
            <p className="text-foreground text-xs font-semibold truncate">{name}</p>
            <p className="text-muted-foreground text-[10px] truncate">{user.email}</p>
          </div>

          {MENU_ITEMS.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-muted transition-colors"
            >
              <Icon size={13} className="text-muted-foreground" />
              <span className="text-foreground text-xs font-medium">{label}</span>
            </Link>
          ))}

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-muted transition-colors border-t border-border"
          >
            <LogOut size={13} className="text-muted-foreground" />
            <span className="text-foreground text-xs font-medium">Sign Out</span>
          </button>
        </div>
      )}
    </div>
  )
}
