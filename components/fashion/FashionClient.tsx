'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import type { WardrobeItem, HobbyActivity, HobbyPhoto } from '@/lib/types'
import { ActivitiesTab } from '@/components/gear/ActivitiesTab'
import { MomentsTab } from '@/components/gear/MomentsTab'
import { postOutfitActivity } from '@/app/actions'
import { cn } from '@/lib/utils'
import { calcWorthIt } from '@/lib/worth'
import { ChevronLeft, Eye, EyeOff, Shirt, Home } from 'lucide-react'

// Cubicle mobileapp components
import { MobileEmptyState } from '@/components/ui/mobile-shims'
import { MobileSearchBar } from '@/components/ui/mobile-shims'

// Existing UI
import { FilterBar } from '@/components/wardrobe/FilterBar'
import { getCategoryDef } from '@/lib/types'
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'

type Tab = 'items' | 'activities' | 'moments'
type SortKey = 'wear_asc' | 'wear_desc' | 'price_desc' | 'price_asc' | 'date_desc' | 'date_asc' | 'last_used_desc' | 'worth_it_desc'

interface FashionClientProps {
  user: User | null
  activities: HobbyActivity[]
  photos: HobbyPhoto[]
  items: WardrobeItem[]
}

export function FashionClient({ user, activities, photos, items }: FashionClientProps) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('items')
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
  const [showPrivate,       setShowPrivate]       = useState(false)
  const [activePriceFilter, setActivePriceFilter] = useState<string | null>(null)
  const [usdRate,           setUsdRate]           = useState(16000)
  const [qpOpen, setQpOpen] = useState(false)
  const [qpSelected, setQpSelected] = useState<Set<string>>(new Set())
  const [qpCaption, setQpCaption] = useState('')
  const [qpSearch, setQpSearch] = useState('')
  const [qpPending, setQpPending] = useState(false)
  const [qpError, setQpError] = useState('')
  const [qpSuccess, setQpSuccess] = useState(false)

  const fetchUsdRate = useCallback(() => {
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(r => r.json())
      .then(d => { if (d.rates?.IDR) setUsdRate(Math.round(d.rates.IDR)) })
      .catch(() => {})
  }, [])

  useEffect(() => { fetchUsdRate() }, [fetchUsdRate])

  function openQP() {
    setQpOpen(true)
    setQpSelected(new Set())
    setQpCaption('')
    setQpSearch('')
    setQpError('')
    setQpSuccess(false)
  }

  const tabItems = [
    { key: 'items', label: 'Items', badge: items.length || undefined },
    { key: 'activities', label: 'Activities', badge: activities.length || undefined },
    { key: 'moments', label: 'Moments', badge: photos.length || undefined },
  ]

  const rawQ = search.toLowerCase().trim()
  const tagTokens = rawQ.match(/#\w+/g)?.map(t => t.slice(1)) ?? []
  const textQ = rawQ.replace(/#\w+/g, '').trim()

  const sortedItems = [...items]
    .filter(i => {
      if (!showPrivate && i.item_type === 'underwear') return false
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
      if (sort === 'worth_it_desc' && calcWorthIt({ purchasePrice: i.price, actualUses: i.wear_count, targetOverride: i.target }).isWorthIt) return false
      if (activePriceFilter) {
        const p = i.price ?? 0
        const r = usdRate
        if (activePriceFilter === 'free'  && p !== 0)                       return false
        if (activePriceFilter === '<1'    && !(p > 0 && p < 1 * r))         return false
        if (activePriceFilter === '<10'   && !(p >= 1 * r && p < 10 * r))   return false
        if (activePriceFilter === '<20'   && !(p >= 10 * r && p < 20 * r))  return false
        if (activePriceFilter === '<115'  && !(p >= 20 * r && p < 115 * r)) return false
        if (activePriceFilter === '>115'  && p < 115 * r)                   return false
      }
      return true
    })
    .sort((a, b) => {
      if (sort === 'wear_asc')       return a.wear_count - b.wear_count
      if (sort === 'wear_desc')      return b.wear_count - a.wear_count
      if (sort === 'price_desc')     return (b.price ?? -1) - (a.price ?? -1)
      if (sort === 'price_asc')      return (a.price ?? Infinity) - (b.price ?? Infinity)
      if (sort === 'date_asc')       return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      if (sort === 'last_used_desc') {
        if (!a.last_worn && !b.last_worn) return 0
        if (!a.last_worn) return 1
        if (!b.last_worn) return -1
        return new Date(b.last_worn).getTime() - new Date(a.last_worn).getTime()
      }
      if (sort === 'worth_it_desc') {
        const wa = calcWorthIt({ purchasePrice: a.price, actualUses: a.wear_count, targetOverride: a.target })
        const wb = calcWorthIt({ purchasePrice: b.price, actualUses: b.wear_count, targetOverride: b.target })
        return wb.worthItProgress - wa.worthItProgress
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  const filteredQPItems = items.filter(i =>
    !qpSearch.trim() ||
    [i.name, i.brand, ...(i.tags ?? [])].filter(Boolean).join(' ').toLowerCase().includes(qpSearch.toLowerCase())
  )

  return (
    <div className="h-dvh overflow-y-auto bg-background text-foreground">

      {/* ── Hero ── */}
      <div
        className="bg-neutral-950 rounded-b-[28px] px-3 pb-[46px] flex flex-col"
        style={{ paddingTop: 'calc(16px + env(safe-area-inset-top, 0px))' }}
      >
        <div className="h-9 flex items-center justify-between px-1">
          <button
            onClick={() => router.back()}
            aria-label="Back"
            className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-200 shrink-0"
          >
            <ChevronLeft size={16} strokeWidth={2} />
          </button>

          <div className="flex items-center gap-1.5">
            <Link
              href="/"
              aria-label="Home"
              className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-300 shrink-0"
            >
              <Home size={14} />
            </Link>
            <button
              onClick={() => setShowNames(v => !v)}
              aria-label={showNames ? 'Hide names' : 'Show names'}
              aria-pressed={showNames}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors',
                showNames ? 'bg-[#EEF040] text-neutral-950' : 'bg-neutral-800 text-neutral-300',
              )}
            >
              {showNames ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
            {user && (
              <button
                onClick={openQP}
                className="h-8 px-3 rounded-full bg-neutral-800 text-neutral-50 text-xs font-semibold shrink-0"
              >
                + Post
              </button>
            )}
            <Link
              href="/ofit"
              className="h-9 px-3.5 rounded-full bg-neutral-800 text-neutral-50 text-sm font-medium flex items-center gap-2 shrink-0"
            >
              <Shirt size={16} />
              Ofit
            </Link>
          </div>
        </div>

        <div className="pt-7 px-2 flex flex-col gap-2">
          <p className="text-sm font-medium uppercase tracking-[1.5px] text-neutral-400">{items.length} items</p>
          <h1 className="text-[30px] leading-[30px] tracking-[-1px] font-semibold text-neutral-50">Fashion</h1>
        </div>
      </div>

      {/* ── Segmented tabs ── */}
      <div className="-mt-[22px] mx-4 relative h-11 p-1 rounded-full bg-neutral-800 grid grid-cols-3 gap-1 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)]">
        {tabItems.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as Tab)}
            className={cn(
              'rounded-full text-sm font-semibold flex items-center justify-center transition-colors',
              tab === t.key ? 'bg-[#EEF040] text-neutral-950' : 'text-neutral-400',
            )}
          >
            {t.label}{t.badge ? ` ${t.badge}` : ''}
          </button>
        ))}
      </div>

      {/* ── Items tab ── */}
      {tab === 'items' && (
        <>
        <div className="mt-5">
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
          showPrivate={showPrivate}
          onShowPrivateChange={setShowPrivate}
          showStatusFilter={false}
          activePriceFilter={activePriceFilter} onPriceFilterChange={setActivePriceFilter}
          usdRate={usdRate} onUsdRateChange={setUsdRate} onFetchRate={fetchUsdRate}
        />
        </div>

        <div className="px-5 pt-4">
          <MobileSearchBar
            placeholder="Search name, brand, #tag…"
            aria-label="Search fashion items"
            value={search}
            onChange={setSearch}
          />
        </div>

        <div className="px-5 pt-5 pb-3 flex items-baseline justify-between">
          <h2 className="text-xl font-semibold text-foreground">All items</h2>
          <span className="text-sm font-mono text-muted-foreground">{sortedItems.length}</span>
        </div>

        <div className="px-5 pb-28">
          {/* Empty state */}
          {sortedItems.length === 0 && (
            <MobileEmptyState
              icon={<Shirt />}
              title={items.length === 0 ? 'No verified items yet' : 'No items match'}
              description={items.length === 0 ? 'Check back soon' : 'Adjust the filters above'}
            />
          )}

          {/* Grid */}
          {sortedItems.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {sortedItems.map(item => {
                const { worthItProgress, isWorthIt, targetUses } = calcWorthIt({ purchasePrice: item.price, actualUses: item.wear_count, targetOverride: item.target })
                const categoryLabel = getCategoryDef(item.category)?.label ?? item.category
                return (
                  <Link
                    key={item.id}
                    href={`/fashion/${item.id}`}
                    className="block bg-card rounded-xl overflow-hidden border border-border min-w-0"
                  >
                    <div className="relative aspect-square w-full bg-muted border-b border-border">
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                    </div>
                    <div className="p-3 pt-2.5 flex flex-col gap-2.5 min-w-0">
                      {showNames && (
                        <div className="flex flex-col min-w-0">
                          <p className="text-sm font-medium truncate leading-tight text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{item.brand || categoryLabel}</p>
                        </div>
                      )}
                      <div className="flex flex-col gap-1.5">
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn('h-full rounded-full transition-all', isWorthIt ? 'bg-[#EEF040]' : 'bg-foreground')}
                            style={{ width: `${worthItProgress}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-xs font-mono text-neutral-500">{item.wear_count}/{targetUses}</span>
                          <span className={cn('text-xs whitespace-nowrap', isWorthIt ? 'font-semibold text-foreground' : 'text-muted-foreground')}>
                            {isWorthIt ? 'Worth it' : `${targetUses - item.wear_count} to Worth it`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
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
            {qpSelected.size > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-3 mb-3" style={{ scrollbarWidth: 'none' }}>
                {items.filter(i => qpSelected.has(i.id)).map(item => (
                  <div key={item.id} className="w-16 h-16 shrink-0 rounded-xl overflow-hidden border-2 border-primary relative">
                    <Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="64px" />
                  </div>
                ))}
              </div>
            )}

            <MobileSearchBar
              placeholder="Search items..."
              aria-label="Search items for outfit"
              value={qpSearch}
              onChange={setQpSearch}
              className="px-0 mb-3"
            />

            <div className="grid grid-cols-3 gap-2 mb-4">
              {filteredQPItems.map(item => {
                const sel = qpSelected.has(item.id)
                return (
                  <button
                    key={item.id}
                    aria-label={item.name}
                    aria-pressed={sel}
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
                    <Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="(max-width: 768px) 33vw, 25vw" />
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

            <label htmlFor="qp-caption" className="sr-only">Caption (optional)</label>
            <textarea
              id="qp-caption"
              value={qpCaption}
              onChange={e => setQpCaption(e.target.value)}
              placeholder="Add a caption... (optional)"
              rows={2}
              className="w-full bg-card border border-border rounded-xl px-3.5 py-3 text-sm text-foreground outline-none resize-none placeholder:text-muted-foreground"
            />
            {qpSuccess && <p className="text-emerald-600 text-xs font-semibold mt-2">Outfit posted! ✅</p>}
            {qpError && <p className="text-destructive text-xs font-semibold mt-2">{qpError}</p>}
          </div>

          <DrawerFooter>
            <Button
              disabled={qpPending || qpSelected.size === 0}
              onClick={async () => {
                if (qpSelected.size === 0) return setQpError('Select at least 1 item')
                setQpPending(true)
                setQpError('')
                const selectedItems = items
                  .filter(i => qpSelected.has(i.id))
                  .map(i => ({ id: i.id, image_url: i.image_url, name: i.name }))
                const res = await postOutfitActivity(selectedItems, qpCaption)
                if (res.error) { setQpError(res.error); setQpPending(false); return }
                setQpSuccess(true)
                setQpSelected(new Set())
                setQpCaption('')
                setQpPending(false)
                setTimeout(() => { setQpOpen(false); setQpSuccess(false) }, 1200)
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
