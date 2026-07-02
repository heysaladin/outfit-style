'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Sun, Moon, Type } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { WardrobeItem, HobbyActivity, HobbyPhoto } from '@/lib/types'
import { ActivitiesTab } from '@/components/gear/ActivitiesTab'
import { MomentsTab } from '@/components/gear/MomentsTab'
import { GoogleSignInButton } from '@/components/ui/GoogleSignInButton'
import { useTheme } from '@/components/ThemeProvider'

type Tab = 'items' | 'activities' | 'moments'

const FASHION_HOBBY = { value: 'fashion', label: 'Fashion', icon: '👔', category: 'lifestyle' }

interface FashionClientProps {
  user: User | null
  activities: HobbyActivity[]
  photos: HobbyPhoto[]
}

export function FashionClient({ user, activities, photos }: FashionClientProps) {
  const router = useRouter()
  const { theme, toggle } = useTheme()
  const [tab, setTab] = useState<Tab>('items')
  const [items, setItems] = useState<WardrobeItem[] | null>(null)
  const [showNames, setShowNames] = useState(true)

  useEffect(() => {
    createClient()
      .from('wardrobe_items')
      .select('*')
      .eq('status', 'verified')
      .order('created_at', { ascending: false })
      .then(({ data }) => setItems(data ?? []))
  }, [])

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'items',      label: 'Items',      count: items?.length ?? 0 },
    { key: 'activities', label: 'Activities', count: activities.length },
    { key: 'moments',    label: 'Moments',    count: photos.length },
  ]

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background">
        <div className="flex items-center justify-between px-5 pt-14 pb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
            >
              <ArrowLeft size={16} className="text-foreground" />
            </button>
            <h1 className="text-foreground font-bold text-xl tracking-tight">Fashion</h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle names */}
            <button
              onClick={() => setShowNames(v => !v)}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                showNames ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'
              }`}
              title={showNames ? 'Hide names' : 'Show names'}
            >
              <Type size={14} />
            </button>

            {/* Dark/light mode */}
            <button
              onClick={toggle}
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
              aria-label="Toggle theme"
            >
              {theme === 'dark'
                ? <Sun size={14} className="text-foreground" />
                : <Moon size={14} className="text-foreground" />}
            </button>

            <Link
              href="/ofit"
              className="h-8 px-4 rounded-full bg-foreground text-background text-[11px] font-bold flex items-center"
            >
              Wardrobe
            </Link>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex px-5 pb-0 border-b border-border">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 pb-3 text-xs font-semibold tracking-wide transition-colors border-b-2 ${
                tab === t.key
                  ? 'text-foreground border-foreground'
                  : 'text-muted-foreground/40 border-transparent'
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className="ml-1.5 text-[10px] opacity-50">{t.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {tab === 'items' && (
        items === null ? (
          <div className="grid grid-cols-2 gap-2.5 p-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-white animate-pulse aspect-square border border-border/30" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-8 text-center gap-3">
            <span className="text-5xl">👔</span>
            <p className="text-foreground font-semibold">No verified items yet</p>
            <p className="text-muted-foreground text-sm">Check back soon</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 p-5">
            {items.map(item => (
              <div key={item.id} className="flex flex-col gap-1.5">
                <div className="rounded-2xl overflow-hidden bg-white aspect-square">
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-contain" />
                </div>
                {showNames && (
                  <div className="px-0.5">
                    <p className="text-foreground text-xs font-semibold leading-tight truncate">{item.name}</p>
                    {item.brand && (
                      <p className="text-muted-foreground text-[10px] mt-0.5 truncate uppercase tracking-wide">{item.brand}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'activities' && (
        <ActivitiesTab hobby="fashion" activities={activities} user={user} />
      )}

      {tab === 'moments' && (
        <MomentsTab hobby="fashion" photos={photos} user={user} />
      )}
    </div>
  )
}
