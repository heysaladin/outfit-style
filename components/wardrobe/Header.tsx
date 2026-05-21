'use client'

import { signOut } from '@/app/actions'
import { LogOut, Plus, CheckSquare, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'

interface HeaderProps {
  user: { email?: string; user_metadata?: { full_name?: string; avatar_url?: string } }
  onUpload: () => void
  onSelectMode?: () => void
}

export function Header({ user, onUpload, onSelectMode }: HeaderProps) {
  const name   = user.user_metadata?.full_name ?? user.email ?? 'U'
  const avatar = user.user_metadata?.avatar_url
  const { theme, toggle } = useTheme()

  return (
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
      <h1 className="text-foreground font-bold text-lg tracking-tight">Outfit Style</h1>
      <div className="flex items-center gap-2">
        {onSelectMode && (
          <button onClick={onSelectMode}
            className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center hover:border-primary/50 transition-colors">
            <CheckSquare size={15} className="text-muted-foreground" />
          </button>
        )}
        <button onClick={toggle}
          className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center hover:border-primary/50 transition-colors"
          aria-label="Toggle theme">
          {theme === 'dark' ? <Sun size={15} className="text-muted-foreground" /> : <Moon size={15} className="text-muted-foreground" />}
        </button>
        <button onClick={onUpload}
          className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:opacity-90 transition-opacity">
          <Plus size={16} className="text-primary-foreground" strokeWidth={2.5} />
        </button>
        <form action={signOut}>
          <button type="submit" className="text-muted-foreground hover:text-foreground transition-colors">
            <LogOut size={18} />
          </button>
        </form>
        {avatar ? (
          <img src={avatar} alt={name} className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold">
            {name[0].toUpperCase()}
          </div>
        )}
      </div>
    </header>
  )
}
