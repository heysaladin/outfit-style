'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft, LogOut, Shirt, Wrench } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'

interface Props {
  user: User
  wardrobeCount: number
  gearCount: number
}

export function ProfileClient({ user, wardrobeCount, gearCount }: Props) {
  const router = useRouter()
  const name   = user.user_metadata?.full_name ?? user.email ?? 'User'
  const avatar = user.user_metadata?.avatar_url as string | undefined

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border px-5 py-4 flex items-center gap-3">
        <Link href="/fashion" className="flex items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft size={15} strokeWidth={2} />
          <span className="text-[11px] font-medium">Back</span>
        </Link>
        <h1 className="text-foreground font-bold text-base tracking-tight">My Profile</h1>
      </header>

      <main className="px-5 py-6 space-y-6">
        {/* Avatar + name */}
        <div className="flex flex-col items-center gap-3 py-6">
          {avatar
            ? <img src={avatar} alt={name} className="w-20 h-20 rounded-2xl object-cover" />
            : <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center text-3xl font-bold text-muted-foreground">{name[0]?.toUpperCase()}</div>}
          <div className="text-center">
            <p className="text-foreground font-semibold text-lg">{name}</p>
            <p className="text-muted-foreground text-sm">{user.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-border rounded-2xl px-4 py-5 flex flex-col gap-1.5">
            <Shirt size={18} className="text-muted-foreground" />
            <p className="text-foreground font-bold text-2xl">{wardrobeCount}</p>
            <p className="text-muted-foreground text-[11px]">Fashion items</p>
          </div>
          <div className="bg-card border border-border rounded-2xl px-4 py-5 flex flex-col gap-1.5">
            <Wrench size={18} className="text-muted-foreground" />
            <p className="text-foreground font-bold text-2xl">{gearCount}</p>
            <p className="text-muted-foreground text-[11px]">Gear items</p>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <LogOut size={15} />
          Sign Out
        </button>
      </main>
    </div>
  )
}
