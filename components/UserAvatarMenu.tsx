'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { User, Sun, Moon, AlignJustify, Layers, PenLine } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from '@/components/ThemeProvider'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface Props {
  buttonClassName?: string
  buttonStyle?: React.CSSProperties
  onReorderInterests?: () => void
}

export function UserAvatarMenu({ buttonClassName, buttonStyle, onReorderInterests }: Props) {
  const [user, setUser]       = useState<SupabaseUser | null>(null)
  const [open, setOpen]       = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, toggle }     = useTheme()

  useEffect(() => {
    setMounted(true)
    createClient().auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  if (!user) return null

  const name   = user.user_metadata?.full_name?.split(' ')[0] ?? user.email?.split('@')[0]
  const avatar = 'https://heysaladindesign.web.app/pictures/avatar.png'
  const since  = new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

  const dropdown = (
    <div
      className="fixed inset-0 z-[55]"
      style={{ background: 'rgba(0,0,0,0.10)' }}
      onClick={() => setOpen(false)}
    >
      <div
        className="absolute bg-card rounded-[10px] w-[268px] shadow-md border border-border overflow-hidden"
        style={{ top: 'calc(56px + env(safe-area-inset-top,0px))', right: 16 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <span className="relative flex shrink-0 overflow-hidden rounded-full w-10 h-10 border border-border">
            <img className="aspect-square h-full w-full" alt={name} src={avatar} />
          </span>
          <div className="min-w-0">
            <p className="text-[15px] font-semibold text-foreground leading-tight truncate">{name}</p>
            <p className="text-[12px] text-muted-foreground leading-tight">Logging since {since}</p>
          </div>
        </div>

        <Link
          href="/profile"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 px-4 h-11 text-[15px] text-foreground hover:bg-muted transition-colors no-underline rounded-[6px] mx-1 my-0.5"
        >
          <User size={18} className="text-muted-foreground" />
          Profile
        </Link>

        <button
          onClick={toggle}
          className="flex w-full items-center gap-3 px-4 h-11 text-[15px] text-foreground hover:bg-muted transition-colors rounded-[6px] mx-1 my-0.5 cursor-pointer border-0 bg-transparent"
        >
          {theme === 'dark'
            ? <Moon size={18} className="text-muted-foreground" />
            : <Sun  size={18} className="text-muted-foreground" />}
          Appearance
          <span className="ml-auto text-[14px] text-muted-foreground">{theme === 'dark' ? 'Dark' : 'Light'}</span>
        </button>

        {onReorderInterests && (
          <button
            onClick={() => { setOpen(false); onReorderInterests() }}
            className="flex w-full items-center gap-3 px-4 h-11 text-[15px] text-foreground hover:bg-muted transition-colors rounded-[6px] mx-1 my-0.5 cursor-pointer border-0 bg-transparent"
          >
            <AlignJustify size={18} className="text-muted-foreground" />
            Reorder interests
          </button>
        )}

        <div className="border-t border-border mx-4 my-1" />

        <Link
          href="/admin/backlog"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 px-4 h-11 text-[15px] text-foreground hover:bg-muted transition-colors no-underline rounded-[6px] mx-1 my-0.5"
        >
          <Layers size={18} className="text-muted-foreground" />
          Zopavo
        </Link>

        <Link
          href="/admin/blogs"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 px-4 h-11 text-[15px] text-foreground hover:bg-muted transition-colors no-underline rounded-[6px] mx-1 my-0.5"
        >
          <PenLine size={18} className="text-muted-foreground" />
          Hyperfantasy
        </Link>

        <div className="border-t border-border mx-4 my-1" />

        <form action="/auth/signout" method="post" className="m-0 px-1 pb-1">
          <button className="flex w-full items-center gap-3 px-3 h-11 text-[15px] text-muted-foreground hover:bg-muted transition-colors rounded-[6px] cursor-pointer border-0 bg-transparent">
            Sign out
          </button>
        </form>
      </div>
    </div>
  )

  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(v => !v) }}
        className={buttonClassName ?? 'w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0'}
        style={buttonStyle}
      >
        <img src={avatar} alt={name} className="w-full h-full object-cover" />
      </button>

      {open && mounted && createPortal(dropdown, document.body)}
    </>
  )
}
