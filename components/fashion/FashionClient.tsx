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
import { calcWorthIt } from '@/lib/worth'
import { ChevronLeft, AlignLeft, Shirt, Search } from 'lucide-react'

// Cubicle mobileapp components
import { MobileTopTabs } from '@/components/ui/mobile-shims'
import { MobileEmptyState } from '@/components/ui/mobile-shims'
import { MobileSearchBar } from '@/components/ui/mobile-shims'

// Existing UI
import { FilterBar } from '@/components/wardrobe/FilterBar'
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'

type Tab = 'items' | 'activities' | 'moments'
type SortKey = 'wear_asc' | 'wear_desc' | 'price_desc' | 'price_asc' | 'date_desc' | 'date_asc'

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
  const [sort, setSort] = useState<SortKey>('wear_asc')
  const [search, setSearch] = useState('')
  const [activeCategory,    setActiveCategory]    = useState<string | null>(null)
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null)
  const [activeColor,       setActiveColor]       = useState<string | null>(null)
  const [activeSeason,      setActiveSeason]      = useState<string | null>(null)
  const [activeOccasion,    setActiveOccasion]    = useState<string | null>(null)
  const [showVerified,      setShowVerified]      = useState(true)
  const [showDraft,         setShowDraft]         = useState(false)
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

  const rawQ = search.toLowerCase().trim()
  const tagTokens = rawQ.match(/#\w+/g)?.map(t => t.slice(1)) ?? []
  const textQ = rawQ.replace(/#\w+/g, '').trim()

  const sortedItems = items ? [...items]
    .filter(i => {
      if (activeCategory    && i.category    !== activeCategory)    return false
      if (activeSubcategory && i.subcategory !== activeSubcategory) return false
      if (activeColor       && i.color       !== activeColor)       return false
      if (activeSeason      && !(i.seasons ?? []).includes(activeSeason))   return false
      if (activeOccasion    && !(i.occasions ?? []).includes(activeOccasion)) return false
      if (tagTokens.length > 0) {
        const itemTags = (i.tags ?? []).map(t => t.toLowerCase())
        if (!tagTokens.every(t => itemTags.includes(t))) return false
      }
      if (textQ) {
        const hay = [i.name, i.brand, ...(i.tags ?? [])].filter(Boolean).join(' ').toLowerCase()
        if (!hay.includes(textQ)) return false
      }
      return true
    })
    .sort((a, b) => {
      if (sort === 'wear_asc')   return a.wear_count - b.wear_count
      if (sort === 'wear_desc')  return b.wear_count - a.wear_count
      if (sort === 'price_desc') return (b.price ?? -1) - (a.price ?? -1)
      if (sort === 'price_asc')  return (a.price ?? Infinity) - (b.price ?? Infinity)
      if (sort === 'date_asc')   return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
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
              <Link
                href="/ofit"
                className="h-8 px-3 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center active:opacity-90"
              >
                Wardrobe
              </Link>
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
        <>
        <FilterBar
          activeCategory={activeCategory}
          activeSubcategory={activeSubcategory}
          activeColor={activeColor}
          activeSeason={activeSeason}
          activeOccasion={activeOccasion}
          showVerified={showVerified}
          showDraft={showDraft}
          sort={sort}
          onSortChange={setSort}
          onCategoryChange={setActiveCategory}
          onSubcategoryChange={setActiveSubcategory}
          onColorChange={setActiveColor}
          onSeasonChange={setActiveSeason}
          onOccasionChange={setActiveOccasion}
          onShowVerifiedChange={setShowVerified}
          onShowDraftChange={setShowDraft}
          showStatusFilter={false}
        />
        <div className="px-4 pt-4 pb-24">

          {items && items.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex flex-1 items-center gap-2 rounded-xl bg-muted px-3 h-9">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                <input
                  placeholder="Search name, brand, #tag…"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  type="search"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
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
                    {(() => {
                      const { worthItProgress, isWorthIt, targetUses } = calcWorthIt({ purchasePrice: item.price, actualUses: item.wear_count })
                      return (
                        <div className={cn(showNames && 'mt-2')}>
                          <div className="h-1 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${worthItProgress}%`,
                                background: isWorthIt ? '#059669' : worthItProgress >= 75 ? '#d97706' : '#94a3b8',
                              }}
                            />
                          </div>
                          <p className="text-[10px] font-medium text-muted-foreground mt-1">
                            {item.wear_count}× · {isWorthIt ? '✅ Worth It!' : `${targetUses - item.wear_count} more to Worth It`}
                          </p>
                        </div>
                      )
                    })()}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        </>
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
