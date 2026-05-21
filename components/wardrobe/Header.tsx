'use client'

import { signOut } from '@/app/actions'
import { Plus, CheckSquare, Sun, Moon, LogOut } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'

interface HeaderProps {
  user: { email?: string; user_metadata?: { full_name?: string; avatar_url?: string } }
  onUpload: () => void
  onSelectMode?: () => void
}

export function Header({ user, onUpload, onSelectMode }: HeaderProps) {
  const name   = user.user_metadata?.full_name?.split(' ')[0] ?? 'You'
  const avatar = user.user_metadata?.avatar_url
  const { theme, toggle } = useTheme()

  return (
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border px-5 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-foreground font-bold text-base tracking-tight leading-none">Wardrobe</h1>
        <p className="text-muted-foreground text-[11px] mt-0.5">Good to see you, {name}</p>
      </div>

      <div className="flex items-center gap-1.5">
        {onSelectMode && (
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
        <button onClick={onUpload}
          className="h-8 px-3 rounded-lg bg-primary flex items-center gap-1.5 hover:opacity-90 transition-opacity">
          <Plus size={14} className="text-primary-foreground" strokeWidth={2.5} />
          <span className="text-primary-foreground text-[11px] font-semibold">Add</span>
        </button>
        <form action={signOut}>
          <button type="submit"
            className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-accent transition-colors">
            {avatar
              ? <img src={avatar} alt={name} className="w-6 h-6 rounded-md object-cover" />
              : <LogOut size={14} className="text-muted-foreground" />}
          </button>
        </form>
      </div>
    </header>
  )
}
