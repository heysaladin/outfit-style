'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { WardrobeItem, HobbyActivity, HobbyPhoto } from '@/lib/types'
import { ActivitiesTab } from '@/components/gear/ActivitiesTab'
import { MomentsTab } from '@/components/gear/MomentsTab'
import { postOutfitActivity } from '@/app/actions'
import { cn } from '@/lib/utils'
import { ChevronLeft, AlignLeft, Shirt } from 'lucide-react'

// Cubicle mobileapp components
import { MobileTopTabs } from 'cubicle-ds/src/components/mobileapp/MobileTopTabs'
import { MobileEmptyState } from 'cubicle-ds/src/components/mobileapp/MobileEmptyState'
import { MobileSearchBar } from 'cubicle-ds/src/components/mobileapp/MobileSearchBar'

// Existing UI
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'

type Tab = 'items' | 'activities' | 'moments'
type SortKey = 'wear' | 'price' | 'date'

interface FashionClientProps {
  user: User | null
  activities: HobbyActivity[]
  photos: HobbyPhoto[]
}

export function FashionClient({ user, activities, photos }: FashionClientProps) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('items')
  const [items, setItems] = useState<WardrobeItem[] | null>(null)
  const [showNames, setShowNames] = useState(true)
  const [sort, setSort] = useState<SortKey>('wear')
  const [qpOpen, setQpOpen] = useState(false)
  const [qpSelected, setQpSelected] = useState<Set<string>>(new Set())
  const [qpCaption, setQpCaption] = useState('')
  const [qpSearch, setQpSearch] = useState('')
  const [qpPending, setQpPending] = useState(false)
  const [qpError, setQpError] = useState('')

  useEffect(() => {
    createClient()
      .from('wardrobe_items')
      .select('*')
      .eq('status', 'verified')
      .is('declutter_status', null)
      .order('wear_count', { ascending: true })
      .order('created_at', { ascending: false })
      .then(({ data }) => setItems(data ?? []))
  }, [])

  function openQP() {
    setQpOpen(true)
    setQpSelected(new Set())
    setQpCaption('')
    setQpSearch('')
    setQpError('')
  }

  const tabItems = [
    { key: 'items', label: 'Items', badge: items?.length || undefined },
    { key: 'activities', label: 'Activities', badge: activities.length || undefined },
    { key: 'moments', label: 'Moments', badge: photos.length || undefined },
  ]

  const sortedItems = items ? [...items].sort((a, b) => {
    if (sort === 'wear') return a.wear_count - b.wear_count || new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    if (sort === 'price') return (b.price ?? -1) - (a.price ?? -1)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  }) : []

  const filteredQPItems = items?.filter(i =>
    !qpSearch.trim() ||
    [i.name, i.brand, ...(i.tags ?? [])].filter(Boolean).join(' ').toLowerCase().includes(qpSearch.toLowerCase())
  ) ?? []

  return (
    <div className="h-dvh overflow-y-auto bg-background text-foreground">

      {/* ── Header — Cubicle MobileTopBar pattern ── */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div
          className="px-4 pb-2"
          style={{ paddingTop: 'calc(8px + env(safe-area-inset-top, 0px))' }}
        >
          <div className="flex items-center justify-between min-h-[44px]">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-0.5 text-primary text-sm font-medium -ml-1 px-1 py-1 rounded-lg active:bg-muted"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNames(v => !v)}
                title={showNames ? 'Hide names' : 'Show names'}
                className={cn(
                  'h-8 w-8 rounded-lg flex items-center justify-center transition-colors',
                  showNames ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground',
                )}
              >
                <AlignLeft className="h-4 w-4" />
              </button>
              {user && (
                <button
                  onClick={openQP}
                  className="h-8 px-3 rounded-full bg-card border border-border text-foreground text-xs font-semibold active:bg-muted"
                >
                  + Post
                </button>
              )}
              <a
                href="/ofit"
                className="h-8 px-3 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center active:opacity-90"
              >
                Wardrobe
              </a>
            </div>
          </div>

          <div className="mt-1 pb-1">
            <h1 className="text-2xl font-bold tracking-tight">Fashion</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{items?.length ?? 0} items</p>
          </div>
        </div>

        <MobileTopTabs
          tabs={tabItems}
          activeKey={tab}
          onChange={(k) => setTab(k as Tab)}
        />
      </div>

      {/* ── Items tab ── */}
      {tab === 'items' && (
        <div className="px-4 pt-4 pb-24">

          {items && items.length > 0 && (
            <div className="flex gap-2 mb-4">
              {(['wear', 'price', 'date'] as SortKey[]).map(key => (
                <button
                  key={key}
                  onClick={() => setSort(key)}
                  className={cn(
                    'h-8 px-4 rounded-full text-xs font-semibold capitalize transition-colors',
                    sort === key
                      ? 'bg-foreground text-background'
                      : 'bg-muted text-muted-foreground active:opacity-70',
                  )}
                >
                  {key}
                </button>
              ))}
            </div>
          )}

          {/* Skeleton */}
          {items === null && (
            <div className="grid grid-cols-2 gap-2.5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card rounded-xl aspect-square animate-pulse" />
              ))}
            </div>
          )}

          {/* Empty state */}
          {items !== null && items.length === 0 && (
            <MobileEmptyState
              icon={<Shirt />}
              title="No verified items yet"
              description="Check back soon"
            />
          )}

          {/* Grid */}
          {items !== null && items.length > 0 && (
            <div className="grid grid-cols-2 gap-2.5">
              {sortedItems.map(item => (
                <Link
                  key={item.id}
                  href={`/fashion/${item.id}`}
                  className="block bg-card rounded-xl overflow-hidden border border-border"
                >
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full block object-cover aspect-square"
                  />
                  <div className="p-3">
                    {showNames && (
                      <>
                        <p className="text-[13px] font-semibold truncate leading-tight">{item.name}</p>
                        {item.brand && (
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate mt-0.5">
                            {item.brand}
                          </p>
                        )}
                      </>
                    )}
                    <div className={cn(showNames && 'mt-2')}>
                      <div className="h-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            item.wear_count >= 20 ? 'bg-emerald-600' : item.wear_count >= 10 ? 'bg-amber-600' : 'bg-neutral-400',
                          )}
                          style={{ width: `${Math.min(item.wear_count / 20, 1) * 100}%` }}
                        />
                      </div>
                      <p className="text-[10px] font-medium text-muted-foreground mt-1">
                        {item.wear_count}× · {
                          item.wear_count >= 100 ? '💎 Excellent!'
                          : item.wear_count >= 20 ? `${100 - item.wear_count} more to Excellent`
                          : `${20 - item.wear_count} more to Worth it`
                        }
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'activities' && (
        <ActivitiesTab hobby="fashion" activities={activities} photos={photos} user={user} />
      )}

      {tab === 'moments' && (
        <MomentsTab hobby="fashion" photos={photos} user={user} />
      )}

      {/* ── Quick Post Outfit Drawer ── */}
      <Drawer open={qpOpen} onOpenChange={setQpOpen}>
        <DrawerContent className="max-h-[92dvh] flex flex-col">
          <DrawerHeader>
            <DrawerTitle>Post Outfit</DrawerTitle>
          </DrawerHeader>

          <div className="overflow-y-auto flex-1 px-4 pb-2">
            {/* Selected preview strip */}
            {qpSelected.size > 0 && items && (
              <div className="flex gap-2 overflow-x-auto pb-3 mb-3" style={{ scrollbarWidth: 'none' }}>
                {items.filter(i => qpSelected.has(i.id)).map(item => (
                  <div key={item.id} className="w-16 h-16 shrink-0 rounded-xl overflow-hidden border-2 border-primary">
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            <MobileSearchBar
              placeholder="Search items..."
              value={qpSearch}
              onChange={setQpSearch}
              className="px-0 mb-3"
            />

            {items && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {filteredQPItems.map(item => {
                  const sel = qpSelected.has(item.id)
                  return (
                    <button
                      key={item.id}
                      onClick={() => setQpSelected(s => {
                        const n = new Set(s)
                        sel ? n.delete(item.id) : n.add(item.id)
                        return n
                      })}
                      className={cn(
                        'relative aspect-square rounded-xl overflow-hidden border-2 p-0',
                        sel ? 'border-primary' : 'border-border',
                      )}
                    >
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      {sel && (
                        <div className="absolute inset-0 bg-black/15 flex items-end justify-center pb-1.5">
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                          </div>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            <textarea
              value={qpCaption}
              onChange={e => setQpCaption(e.target.value)}
              placeholder="Add a caption... (optional)"
              rows={2}
              className="w-full bg-card border border-border rounded-xl px-3.5 py-3 text-sm text-foreground outline-none resize-none placeholder:text-muted-foreground"
            />
            {qpError && <p className="text-destructive text-xs font-semibold mt-2">{qpError}</p>}
          </div>

          <DrawerFooter>
            <Button
              disabled={qpPending || qpSelected.size === 0}
              onClick={async () => {
                if (!items || qpSelected.size === 0) return setQpError('Pilih minimal 1 item')
                setQpPending(true)
                setQpError('')
                const selectedItems = items
                  .filter(i => qpSelected.has(i.id))
                  .map(i => ({ id: i.id, image_url: i.image_url, name: i.name }))
                const res = await postOutfitActivity(selectedItems, qpCaption)
                if (res.error) { setQpError(res.error); setQpPending(false); return }
                setQpOpen(false)
                setQpSelected(new Set())
                setQpCaption('')
                setQpPending(false)
              }}
              className="w-full h-12 text-[15px] font-bold"
            >
              {qpPending ? 'Posting…' : `Post & Log Wear (${qpSelected.size} item${qpSelected.size !== 1 ? 's' : ''})`}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
