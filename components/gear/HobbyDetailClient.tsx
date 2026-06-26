'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import type { HobbyItem, HobbyActivity, HobbyPhoto } from '@/lib/types'
import { GearItemCard } from './GearItemCard'
import { AddGearModal } from './AddGearModal'
import { ActivitiesTab } from './ActivitiesTab'
import { MomentsTab } from './MomentsTab'
import { GoogleSignInButton } from '@/components/ui/GoogleSignInButton'

type Tab = 'items' | 'activities' | 'moments'

interface HobbyDetailClientProps {
  hobby: { value: string; label: string; icon: string; category: string }
  items: HobbyItem[]
  activities: HobbyActivity[]
  photos: HobbyPhoto[]
  user: User | null
  wardrobeHref?: string
}

export function HobbyDetailClient({ hobby, items, activities, photos, user, wardrobeHref }: HobbyDetailClientProps) {
  const router = useRouter()
  const [tab, setTab]               = useState<Tab>('items')
  const [addOpen, setAddOpen]       = useState(false)
  const [selectedItem, setSelectedItem] = useState<HobbyItem | null>(null)
  const [mounted, setMounted]       = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'items',      label: 'Items',      count: items.length      },
    { key: 'activities', label: 'Activities', count: activities.length },
    { key: 'moments',    label: 'Moments',    count: photos.length     },
  ]

  if (!mounted) return <div className="min-h-screen bg-background" />

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/40">
        <div className="flex items-center justify-between px-4 pt-12 pb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center hover:bg-accent transition-colors"
            >
              <ArrowLeft size={16} className="text-muted-foreground" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">{hobby.icon}</span>
                <h1 className="text-foreground font-bold text-lg tracking-tight">{hobby.label}</h1>
              </div>
            </div>
          </div>

          {wardrobeHref ? (
            <Link
              href={wardrobeHref}
              className="h-8 px-3 rounded-xl bg-foreground text-background text-xs font-semibold flex items-center hover:opacity-80 transition-opacity"
            >
              OFIT→
            </Link>
          ) : user ? (
            tab === 'items' ? (
              <button
                onClick={() => setAddOpen(true)}
                className="w-9 h-9 rounded-xl bg-foreground text-background flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <Plus size={18} strokeWidth={2.5} />
              </button>
            ) : null
          ) : (
            <GoogleSignInButton />
          )}
        </div>

        {/* Tab bar */}
        <div className="flex px-4 pb-0">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 pb-3 text-xs font-semibold tracking-wide transition-colors border-b-2 ${
                tab === t.key
                  ? 'text-foreground border-foreground'
                  : 'text-muted-foreground/60 border-transparent'
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className="ml-1.5 text-[10px] opacity-60">{t.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {tab === 'items' && (
        <>
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 px-8 text-center gap-3">
              <span className="text-5xl">{hobby.icon}</span>
              <p className="text-foreground font-semibold">No {hobby.label} gear yet</p>
              <p className="text-muted-foreground text-sm">
                {user ? 'Tap + to add your first item' : 'Sign in to add gear'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 p-4">
              {items.map(item => (
                <GearItemCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />
              ))}
            </div>
          )}

          {user && addOpen && (
            <AddGearModal
              defaultHobby={hobby.value}
              onClose={() => setAddOpen(false)}
            />
          )}
        </>
      )}

      {tab === 'activities' && (
        <ActivitiesTab
          hobby={hobby.value}
          activities={activities}
          user={user}
        />
      )}

      {tab === 'moments' && (
        <MomentsTab
          hobby={hobby.value}
          photos={photos}
          user={user}
        />
      )}

    </div>
  )
}
