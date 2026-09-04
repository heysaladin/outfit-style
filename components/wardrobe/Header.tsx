'use client'

import { Plus, CheckSquare, Sun, Moon, ChevronLeft } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import Link from 'next/link'
import { UserAvatarMenu } from '@/components/UserAvatarMenu'
import { MobileButton } from '@/components/ui/mobile-shims'

interface HeaderProps {
  user: { email?: string; user_metadata?: { full_name?: string; avatar_url?: string } } | null
  onUpload: () => void
  onSelectMode?: () => void
}

export function Header({ user, onUpload, onSelectMode }: HeaderProps) {
  const { theme, toggle } = useTheme()

  return (
    <header className="sticky top-0 z-10 px-5 pt-[calc(0.875rem+env(safe-area-inset-top,0px))] pb-3.5 flex items-center justify-between bg-background border-b border-border">
      <div className="flex items-center gap-3">
        <Link href="/fashion" className="w-8 h-8 flex items-center justify-center rounded-full bg-muted">
          <ChevronLeft size={16} strokeWidth={2} className="text-foreground" />
        </Link>
        <h1 className="text-foreground font-bold text-xl tracking-tight">Wardrobe</h1>
      </div>

      <div className="flex items-center gap-2">
        {user && onSelectMode && (
          <MobileButton variant="ghost" size="sm" icon={<CheckSquare size={15} />} onClick={onSelectMode} className="w-8 h-8 rounded-full p-0 justify-center" />
        )}
        <MobileButton variant="ghost" size="sm" icon={theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />} onClick={toggle} aria-label="Toggle theme" className="w-8 h-8 rounded-full p-0 justify-center" />
        {user ? (
          <>
            <MobileButton size="sm" icon={<Plus size={14} strokeWidth={2.5} />} onClick={onUpload} className="h-8 px-4 rounded-full bg-foreground text-background text-[11px] font-bold">
              Add
            </MobileButton>
            <UserAvatarMenu />
          </>
        ) : (
          <Link href="/login">
            <MobileButton size="sm" className="h-8 px-4 rounded-full bg-foreground text-background text-[11px] font-bold">
              Sign in
            </MobileButton>
          </Link>
        )}
      </div>
    </header>
  )
}
