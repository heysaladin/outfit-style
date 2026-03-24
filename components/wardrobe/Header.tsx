'use client'

import { signOut } from '@/app/actions'
import { LogOut, Plus } from 'lucide-react'

interface HeaderProps {
  user: {
    email?: string
    user_metadata?: { full_name?: string; avatar_url?: string }
  }
  onUpload: () => void
}

export function Header({ user, onUpload }: HeaderProps) {
  const name = user.user_metadata?.full_name ?? user.email ?? 'U'
  const avatar = user.user_metadata?.avatar_url

  return (
    <header className="sticky top-0 z-10 bg-[#0A0A0A]/95 backdrop-blur border-b border-[#1F1F1F] px-4 py-3 flex items-center justify-between">
      <h1 className="text-white font-bold text-lg tracking-tight">Outfit Style App</h1>
      <div className="flex items-center gap-3">
        <button
          onClick={onUpload}
          className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <Plus size={16} className="text-black" strokeWidth={2.5} />
        </button>
        <form action={signOut}>
          <button type="submit" className="text-[#555555] hover:text-white transition-colors">
            <LogOut size={18} />
          </button>
        </form>
        {avatar ? (
          <img src={avatar} alt={name} className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#2A2A2A] flex items-center justify-center text-white text-xs font-semibold">
            {name[0].toUpperCase()}
          </div>
        )}
      </div>
    </header>
  )
}
