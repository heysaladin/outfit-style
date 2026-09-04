'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Plus } from 'lucide-react'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import type { HobbyItem, HobbyActivity, HobbyPhoto } from '@/lib/types'
import { AddGearModal } from './AddGearModal'
import { ActivitiesTab } from './ActivitiesTab'
import { MomentsTab } from './MomentsTab'
import { calcWorthIt } from '@/lib/worth'
import { MobileButton } from '@/components/ui/mobile-shims'
import { MobileEmptyState } from '@/components/ui/mobile-shims'
import { SegmentedControl } from '@/components/ui/mobile-shims'

type Tab = 'items' | 'activities' | 'moments'

interface Props {
  hobby: { value: string; label: string; icon: string; category: string }
  items: HobbyItem[]
  activities: HobbyActivity[]
  photos: HobbyPhoto[]
  user: User | null
  wardrobeHref?: string
  wardrobeLabel?: string
}

function lastActiveLabel(activities: HobbyActivity[]): string {
  if (!activities.length) return 'never'
  const diff = Math.floor((Date.now() - new Date(activities[0].activity_at).getTime()) / 86400000)
  if (diff === 0) return 'today'
  if (diff === 1) return 'yesterday'
  if (diff < 7) return `${diff}d ago`
  return `${Math.floor(diff / 7)}w ago`
}

export function HobbyDetailClient({ hobby, items, activities, photos, user, wardrobeHref, wardrobeLabel }: Props) {
  const router = useRouter()
  const [tab, setTab]       = useState<Tab>('items')
  const [addOpen, setAddOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return <div className="min-h-dvh bg-background" />

  const tabValue = tab === 'items' ? 'Items' : tab === 'activities' ? 'Activities' : 'Moments'

  return (
    <div className="bg-background h-dvh overflow-y-auto text-foreground max-w-[430px] mx-auto">

      {/* Header */}
      <header
        className="sticky top-0 z-10 flex items-center gap-2.5 px-3.5 pb-2.5 bg-background/95 backdrop-blur-sm border-b border-border"
        style={{ paddingTop: 'calc(14px + env(safe-area-inset-top,0px))' }}
      >
        <MobileButton
          variant="ghost" size="sm"
          icon={<ChevronLeft size={18} />}
          onClick={() => router.push('/')}
          className="w-9 h-9 rounded-xl p-0 justify-center"
        />
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-extrabold tracking-tight leading-none truncate">{hobby.label}</h1>
          <span className="text-[11.5px] font-semibold text-muted-foreground">
            {items.length} items · last active {lastActiveLabel(activities)}
          </span>
        </div>

        {user && tab === 'items' && (
          <MobileButton
            variant="ghost" size="sm"
            icon={<Plus size={18} />}
            onClick={() => setAddOpen(true)}
            className="w-9 h-9 rounded-xl p-0 justify-center"
          />
        )}

        {wardrobeHref && (
          <Link href={wardrobeHref}>
            <MobileButton size="sm" className="h-9 px-4 rounded-xl text-xs font-extrabold">
              {wardrobeLabel ?? 'Library'}
            </MobileButton>
          </Link>
        )}
      </header>

      {/* Tab selector */}
      <div className="px-4 pt-3 pb-3">
        <SegmentedControl
          segments={['Items', 'Activities', 'Moments']}
          value={tabValue}
          onChange={v => setTab(v.toLowerCase() as Tab)}
        />
      </div>

      {/* Items tab */}
      {tab === 'items' && (
        <div className="px-4 pb-10">
          {items.length === 0 ? (
            <MobileEmptyState
              icon={<span className="text-4xl">{hobby.icon}</span>}
              title={`No ${hobby.label} items yet`}
              description={user ? 'Tap + to add your first item' : 'Sign in to add items'}
            />
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {items.map(item => (
                <button
                  key={item.id}
                  onClick={() => router.push(`/${hobby.value}/${item.id}`)}
                  className="bg-card border border-border rounded-xl overflow-hidden text-left w-full block"
                >
                  <div className="aspect-square grid place-items-center text-5xl relative bg-muted">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{hobby.icon}</span>
                    )}
                    <span className="absolute bottom-2 right-2 text-[10.5px] font-bold px-2.5 py-1 rounded-full bg-background/80 text-foreground">
                      {item.use_count} uses
                    </span>
                  </div>
                  <div className="p-3">
                    <b className="block text-[13.5px] font-bold truncate">{item.name}</b>
                    {item.description && (
                      <span className="block text-[11px] font-medium text-muted-foreground mt-0.5 truncate">
                        {item.description}
                      </span>
                    )}
                    {(() => {
                      const w = calcWorthIt({ purchasePrice: item.purchase_price, actualUses: item.use_count, targetOverride: item.target })
                      return (
                        <div className="mt-2">
                          <div className="h-[3px] rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${w.worthItProgress}%`,
                                background: w.isWorthIt ? '#059669' : w.worthItProgress >= 75 ? '#d97706' : '#94a3b8',
                              }}
                            />
                          </div>
                          <span className="block text-[9.5px] font-semibold text-muted-foreground mt-1">
                            {item.use_count}× · {w.isWorthIt ? '✅ Worth It!' : `${w.targetUses - item.use_count} more to Worth It`}
                          </span>
                        </div>
                      )
                    })()}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'activities' && (
        <ActivitiesTab hobby={hobby.value} activities={activities} photos={photos} user={user} />
      )}

      {tab === 'moments' && (
        <MomentsTab hobby={hobby.value} photos={photos} user={user} />
      )}

      {addOpen && user && (
        <AddGearModal defaultHobby={hobby.value} onClose={() => setAddOpen(false)} />
      )}
    </div>
  )
}
