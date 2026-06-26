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
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border px-5 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Link href="/fashion" className="flex items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft size={15} strokeWidth={2} />
          <span className="text-[11px] font-medium">Back</span>
        </Link>
        <div className="w-px h-4 bg-border" />
        <div>
          <h1 className="text-foreground font-bold text-base tracking-tight leading-none">Wardrobe</h1>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {user && onSelectMode && (
          <button onClick={onSelectMode}
            className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-accent transition-colors">
            <CheckSquare size={14} className="text-muted-foreground" />
          </button>
        )}
        <button onClick={toggle}
          className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-accent transition-colors"
          aria-label="Toggle theme">
          {theme === 'dark'
            ? <Sun size={14} className="text-muted-foreground" />
            : <Moon size={14} className="text-muted-foreground" />}
        </button>
        {user ? (
          <>
            <button onClick={onUpload}
              className="h-8 px-3 rounded-lg bg-primary flex items-center gap-1.5 hover:opacity-90 transition-opacity">
              <Plus size={14} className="text-primary-foreground" strokeWidth={2.5} />
              <span className="text-primary-foreground text-[11px] font-semibold">Add</span>
            </button>
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen(v => !v)}
                className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-accent transition-colors">
                {avatar
                  ? <img src={avatar} alt={name} className="w-6 h-6 rounded-md object-cover" />
                  : <User size={14} className="text-muted-foreground" />}
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-10 w-44 bg-background border border-border rounded-xl shadow-lg overflow-hidden z-50">
                  <div className="px-3 py-2.5 border-b border-border">
                    <p className="text-foreground text-[11px] font-semibold truncate">{name}</p>
                    <p className="text-muted-foreground text-[10px] truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 hover:bg-muted transition-colors">
                    <User size={13} className="text-muted-foreground" />
                    <span className="text-foreground text-[12px]">My Profile</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-muted transition-colors border-t border-border">
                    <LogOut size={13} className="text-muted-foreground" />
                    <span className="text-foreground text-[12px]">Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link href="/login"
            className="h-8 px-3 rounded-lg bg-muted flex items-center gap-1.5 hover:bg-accent transition-colors border border-border">
            <span className="text-foreground text-[11px] font-medium">Sign in</span>
          </Link>
        )}
      </div>
    </header>
  )
}
