'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { User } from '@supabase/supabase-js'
import { HOBBIES } from '@/lib/types'
import type { HobbyActivity, HobbyPhoto, WardrobeItem } from '@/lib/types'
import type { ActivityExportData } from '@/components/ActivityExportCard'
import { calcWorthIt } from '@/lib/worth'
import { formatDateLabel, formatTime } from '@/lib/date'
import { Card, CardContent } from '@/components/ui/card'

interface GalleryTabProps {
  user: User | null
  activities: HobbyActivity[]
  photos: HobbyPhoto[]
  worthItItems: WardrobeItem[]
  expandedPosts: Set<string>
  now: Date
  exporting: boolean
  onToggleExpanded: (id: string) => void
  onOpenActivity: (act: HobbyActivity) => void
  onFullscreenPhoto: (photo: HobbyPhoto) => void
  onTriggerExport: (data: ActivityExportData) => void
}

function EmptyState({ icon, title, desc, children }: { icon: string; title: string; desc: string; children?: React.ReactNode }) {
  return (
    <div className="py-7 text-center">
      <div className="w-13 h-13 rounded-[18px] bg-card border shadow-sm flex items-center justify-center mx-auto mb-2.5 text-[22px] w-[52px] h-[52px]">{icon}</div>
      <b className="block text-para-sm font-bold mb-1 font-sans">{title}</b>
      <p className="text-para-xs text-muted-foreground m-0">{desc}</p>
      {children}
    </div>
  )
}

const GalleryTab = React.memo(function GalleryTab({
  user,
  activities,
  photos,
  worthItItems,
  expandedPosts,
  now,
  exporting,
  onToggleExpanded,
  onOpenActivity,
  onFullscreenPhoto,
  onTriggerExport,
}: GalleryTabProps) {
  const feed = useMemo(() => {
    const noPhotoActs = activities.filter(act =>
      !photos.some(p => p.hobby === act.hobby && p.note === act.note)
    )
    return [
      ...photos.map(p => {
        const linked = activities.find(a => a.hobby === p.hobby && a.note === p.note)
          ?? activities.find(a => a.hobby === p.hobby)
        return { type: 'photo' as const, date: linked?.activity_at ?? p.created_at, photo: p }
      }),
      ...noPhotoActs.map(a => ({ type: 'activity' as const, date: a.activity_at, act: a })),
      ...worthItItems.filter(i => i.last_worn).map(i => ({ type: 'worth_it' as const, date: i.last_worn!, item: i })),
    ].sort((a, b) => b.date.localeCompare(a.date))
  }, [photos, activities, worthItItems])

  if (!user) {
    return (
      <div className="px-[18px] pt-4">
        <EmptyState icon="🖼️" title="Sign in to see gallery" desc="Your captured moments will appear here">
          <Link href="/login" className="font-bold text-para-sm mt-3 inline-block underline">Login</Link>
        </EmptyState>
      </div>
    )
  }

  if (feed.length === 0) {
    return (
      <div className="px-[18px] pt-4">
        <EmptyState icon="📸" title="No activity yet" desc="Capture moments or log activities from your hobbies" />
      </div>
    )
  }

  return (
    <div className="px-[18px] pt-4">
      <div className="flex flex-col gap-3 mt-1">
        {feed.map(item => {
          if (item.type === 'photo') {
            const p = item.photo
            const h = HOBBIES.find(x => x.value === p.hobby)
            const linkedActivity = activities.find(a => a.hobby === p.hobby && a.note === p.note)
              ?? activities.find(a => a.hobby === p.hobby)
            return (
              <Card key={`p-${p.id}`} className="overflow-hidden">
                <div onClick={() => onFullscreenPhoto(p)} className="cursor-pointer rounded-t-xl overflow-hidden">
                  <Image src={p.image_url} alt={p.hobby} width={800} height={800} className="w-full block object-cover max-h-[420px]" style={{ height: 'auto' }} sizes="(max-width: 768px) 100vw, 50vw" />
                </div>
                <CardContent className="p-[12px_14px_14px]">
                  {p.note && <p className="text-para-md font-semibold m-0 mb-2.5 leading-[1.4]">{p.note}</p>}
                  <div className="flex items-center justify-between gap-2.5">
                    <div className="flex gap-2.5 items-center flex-1 min-w-0">
                      <span className="text-[22px] flex-shrink-0">{h?.icon ?? '📷'}</span>
                      <b className="font-bold text-para-sm block font-sans">{h?.label ?? p.hobby}</b>
                    </div>
                    {(() => {
                      const ts = linkedActivity?.activity_at ?? p.created_at
                      return (
                        <span className="flex-shrink-0 text-para-xs font-semibold text-muted-foreground/60">
                          {formatDateLabel(ts, now)} · {formatTime(ts)}
                        </span>
                      )
                    })()}
                  </div>
                </CardContent>
              </Card>
            )
          } else if (item.type === 'worth_it') {
            const wi = item.item
            const { targetUses: wiTarget } = calcWorthIt({ purchasePrice: wi.price, actualUses: wi.wear_count, targetOverride: wi.target })
            return (
              <Link
                key={`wi-${wi.id}`}
                href={`/wardrobes?item=${wi.id}`}
                className="no-underline"
              >
                <div
                  className="rounded-xl overflow-hidden border border-border flex gap-3 items-center p-3"
                  style={{ background: 'linear-gradient(135deg, #FFF9E6 0%, #FFF3D1 100%)' }}
                >
                  {wi.image_url && (
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-black/10 relative">
                      <Image src={wi.image_url} alt={wi.name} fill className="object-cover" sizes="64px" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[15px]">🏆</span>
                        <span className="text-para-xs font-bold" style={{ color: '#B45309' }}>Worth It!</span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: '#1a1a1a' }}>
                        <span className="text-[10px]">⭐</span>
                        <span className="text-[11px] font-bold" style={{ color: '#f1f252' }}>+{wiTarget} pts</span>
                      </div>
                    </div>
                    <p className="m-0 text-para-sm font-bold leading-snug truncate" style={{ color: '#0A0A0A' }}>{wi.name}</p>
                    <p className="m-0 text-para-xs font-medium mt-0.5" style={{ color: '#78716C' }}>
                      {wi.category} · {formatDateLabel(wi.last_worn!, now)}
                    </p>
                    <p className="m-0 text-para-xs font-medium mt-1" style={{ color: '#92400E' }}>
                      Selamat! Item ini sudah mencapai batas worth it 🎉
                    </p>
                  </div>
                </div>
              </Link>
            )
          } else {
            const act = item.act
            const h = HOBBIES.find(x => x.value === act.hobby)
            const timeAgo = `${formatDateLabel(act.activity_at, now)} · ${formatTime(act.activity_at)}`
            const text = act.note ?? 'Session logged'
            const SHORT = 120
            const LONG  = 400
            const isShort = text.length <= SHORT
            const isVeryLong = text.length > LONG
            const isExpanded = expandedPosts.has(act.id)
            const toggleExpand = (e: React.MouseEvent) => {
              e.stopPropagation()
              onToggleExpanded(act.id)
            }
            const outfitSnapshotItems = act.outfit_snapshot && act.outfit_snapshot.length > 0 ? act.outfit_snapshot : null
            const outfitLinkedItems = act.outfits ? (act.outfits.outfit_items?.map((oi: { item_id: string; wardrobe_items: { id: string; image_url: string; name: string } }) => oi.wardrobe_items).filter(Boolean) ?? []) : null
            const outfitDisplayItems = outfitSnapshotItems ?? outfitLinkedItems
            const outfitLabel = act.outfits?.name ?? '👗 Outfit'

            if (outfitDisplayItems) {
              return (
                <div key={`a-${act.id}`} className="rounded-xl overflow-hidden border border-border cursor-pointer" style={{ background: 'var(--card)' }} onClick={() => onOpenActivity(act)}>
                  <div className="flex items-center justify-between px-4 pt-3 pb-2">
                    <span className="text-para-xs font-bold text-muted-foreground">{act.outfits ? `👗 ${outfitLabel}` : '👗 Outfit'}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-para-xs font-semibold text-muted-foreground/60">{timeAgo}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onTriggerExport({
                            type: 'outfit',
                            label: act.outfits ? `👗 ${outfitLabel}` : '👗 Outfit',
                            timestamp: timeAgo,
                            text: act.note ?? null,
                            items: outfitDisplayItems as { id: string; image_url: string; name: string }[],
                          })
                        }}
                        disabled={exporting}
                        className="text-para-xs font-semibold text-muted-foreground/50 hover:text-muted-foreground transition-colors disabled:opacity-40"
                      >
                        {exporting ? '...' : 'Export'}
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2 overflow-x-auto px-4 pb-3" style={{ scrollbarWidth: 'none' }}>
                    {outfitDisplayItems.map((outfitItem: { id: string; image_url: string; name: string }, i: number) => (
                      <div key={i} className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border border-border relative">
                        <Image src={outfitItem.image_url} alt={outfitItem.name} fill className="object-cover" sizes="80px" />
                      </div>
                    ))}
                  </div>
                  {act.note && (
                    <p className="m-0 px-4 pb-4 text-para-sm font-medium leading-relaxed" style={{ color: 'var(--foreground)' }}>{act.note}</p>
                  )}
                </div>
              )
            }

            if (isVeryLong) return (
              <div key={`a-${act.id}`} className="rounded-xl overflow-hidden border border-border" style={{ background: "var(--card)" }}>
                <div className="p-4 pb-3.5">
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="text-[18px]">{h?.icon ?? '✨'}</span>
                    <span className="text-para-sm font-semibold" style={{ color: 'var(--muted-foreground)' }}>{h?.label ?? act.hobby}</span>
                    <div className="ml-auto flex items-center gap-2">
                      <span className="text-para-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>{timeAgo}</span>
                      <button onClick={(e) => { e.stopPropagation(); onTriggerExport({ type: 'text', label: h?.label ?? act.hobby ?? '', labelIcon: h?.icon as string, timestamp: timeAgo, text, items: [] }) }} disabled={exporting} className="text-para-xs font-semibold text-muted-foreground/50 hover:text-muted-foreground transition-colors disabled:opacity-40">{exporting ? '...' : 'Export'}</button>
                    </div>
                  </div>
                  <p
                    onClick={() => onOpenActivity(act)}
                    className="m-0 text-para-sm font-medium leading-relaxed text-left break-words cursor-pointer overflow-hidden"
                    style={{
                      color: '#ffffff',
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: isExpanded ? 'unset' : 5,
                      overflow: 'hidden',
                    } as React.CSSProperties}
                  >
                    {text}
                  </p>
                  <button
                    onClick={toggleExpand}
                    className="bg-transparent border-0 pt-1.5 pb-0 px-0 text-para-sm font-bold cursor-pointer"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {isExpanded ? 'Show less' : 'Read more'}
                  </button>
                </div>
              </div>
            )
            if (!isShort) return (
              <div key={`a-${act.id}`} className="rounded-xl overflow-hidden border border-border" style={{ background: "var(--card)" }}>
                <div className="p-4 pb-3.5">
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="text-[18px]">{h?.icon ?? '✨'}</span>
                    <span className="text-para-sm font-semibold" style={{ color: 'var(--muted-foreground)' }}>{h?.label ?? act.hobby}</span>
                    <div className="ml-auto flex items-center gap-2">
                      <span className="text-para-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>{timeAgo}</span>
                      <button onClick={(e) => { e.stopPropagation(); onTriggerExport({ type: 'text', label: h?.label ?? act.hobby ?? '', labelIcon: h?.icon as string, timestamp: timeAgo, text, items: [] }) }} disabled={exporting} className="text-para-xs font-semibold text-muted-foreground/50 hover:text-muted-foreground transition-colors disabled:opacity-40">{exporting ? '...' : 'Export'}</button>
                    </div>
                  </div>
                  <p
                    onClick={() => onOpenActivity(act)}
                    className="m-0 text-para-sm font-medium leading-relaxed text-left break-words cursor-pointer"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {text}
                  </p>
                </div>
              </div>
            )
            return (
              <div
                key={`a-${act.id}`}
                onClick={() => onOpenActivity(act)}
                className="rounded-xl overflow-hidden min-h-[140px] flex flex-col justify-between cursor-pointer border border-border"
                style={{ background: 'var(--card)' }}
              >
                <div className="p-[20px_18px_12px] flex-1 flex flex-col justify-center items-center text-center" style={{ background: 'var(--muted)' }}>
                  <p className="m-0 text-h3 font-extrabold leading-[1.25] break-words font-sans" style={{ color: 'var(--foreground)' }}>
                    {text}
                  </p>
                </div>
                <div className="p-[12px_18px] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[18px]">{h?.icon ?? '✨'}</span>
                    <span className="text-para-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>{h?.label ?? act.hobby}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-para-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>{timeAgo}</span>
                    <button onClick={(e) => { e.stopPropagation(); onTriggerExport({ type: 'text', label: h?.label ?? act.hobby ?? '', labelIcon: h?.icon as string, timestamp: timeAgo, text, items: [] }) }} disabled={exporting} className="text-para-xs font-semibold text-muted-foreground/50 hover:text-muted-foreground transition-colors disabled:opacity-40">{exporting ? '...' : 'Export'}</button>
                  </div>
                </div>
              </div>
            )
          }
        })}
      </div>
    </div>
  )
})

export default GalleryTab
