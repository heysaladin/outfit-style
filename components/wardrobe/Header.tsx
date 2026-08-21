'use client'

import { Plus, CheckSquare, Sun, Moon, ChevronLeft } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import { useState } from 'react'
import Link from 'next/link'
import { UserAvatarMenu } from '@/components/UserAvatarMenu'

interface HeaderProps {
  user: { email?: string; user_metadata?: { full_name?: string; avatar_url?: string } } | null
  onUpload: () => void
  onSelectMode?: () => void
}

export function Header({ user, onUpload, onSelectMode }: HeaderProps) {
  const { theme, toggle } = useTheme()

  return (
    <header className="sticky top-0 z-10 px-5 pt-[calc(0.875rem+env(safe-area-inset-top,0px))] pb-3.5 flex items-center justify-between" style={{ background: '#1C1917' }}>
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
            <UserAvatarMenu />
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
