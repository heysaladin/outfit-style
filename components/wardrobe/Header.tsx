'use client'

import { Plus, CheckSquare, Sun, Moon, LogOut, ChevronLeft, User } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

interface HeaderProps {
  user: { email?: string; user_metadata?: { full_name?: string; avatar_url?: string } } | null
  onUpload: () => void
  onSelectMode?: () => void
}

export function Header({ user, onUpload, onSelectMode }: HeaderProps) {
  const name   = user?.user_metadata?.full_name?.split(' ')[0] ?? 'You'
  const avatar = user?.user_metadata?.avatar_url
  const { theme, toggle } = useTheme()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  async function handleSignOut() {
    setMenuOpen(false)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-10 bg-background px-5 pt-14 pb-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Link href="/fashion" className="w-8 h-8 flex items-center justify-center rounded-full bg-muted">
          <ChevronLeft size={16} strokeWidth={2} className="text-foreground" />
        </Link>
        <h1 className="text-foreground font-bold text-xl tracking-tight">Wardrobe</h1>
      </div>

      <div className="flex items-center gap-2">
        {user && onSelectMode && (
          <button onClick={onSelectMode}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <CheckSquare size={15} className="text-foreground" />
          </button>
        )}
        <button onClick={toggle}
          className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
          aria-label="Toggle theme">
          {theme === 'dark'
            ? <Sun size={15} className="text-foreground" />
            : <Moon size={15} className="text-foreground" />}
        </button>
        {user ? (
          <>
            <button onClick={onUpload}
              className="h-8 px-4 rounded-full bg-foreground flex items-center gap-1.5">
              <Plus size={14} className="text-background" strokeWidth={2.5} />
              <span className="text-background text-[11px] font-bold">Add</span>
            </button>
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen(v => !v)}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {avatar
                  ? <img src={avatar} alt={name} className="w-full h-full object-cover" />
                  : <User size={15} className="text-foreground" />}
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-10 w-44 bg-background border border-border rounded-2xl shadow-xl overflow-hidden z-50">
                  <div className="px-3 py-3 border-b border-border">
                    <p className="text-foreground text-xs font-semibold truncate">{name}</p>
                    <p className="text-muted-foreground text-[10px] truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-3 hover:bg-muted transition-colors">
                    <User size={13} className="text-muted-foreground" />
                    <span className="text-foreground text-xs font-medium">My Profile</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-3 hover:bg-muted transition-colors border-t border-border">
                    <LogOut size={13} className="text-muted-foreground" />
                    <span className="text-foreground text-xs font-medium">Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link href="/login"
            className="h-8 px-4 rounded-full bg-foreground flex items-center">
            <span className="text-background text-[11px] font-bold">Sign in</span>
          </Link>
        )}
      </div>
    </header>
  )
}
