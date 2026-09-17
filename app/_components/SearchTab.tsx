'use client'

import React from 'react'
import Link from 'next/link'
import { HOBBIES } from '@/lib/types'
import type { HobbyActivity } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

const TINTS = ['#FFE9DB','#DDF4EA','#FFF3D1','#EDE6FD','#DCE8F5','#FBE0DC']

interface HobbyLink {
  label: string
  icon: string
  href: string
  value: string
}

interface SearchTabProps {
  searchQ: string
  searchRef: React.RefObject<HTMLInputElement | null>
  filteredHobbies: HobbyLink[]
  filteredActivities: HobbyActivity[]
  gearCounts: Record<string, number>
  lastActive: Record<string, string>
  now: Date
  onSearchChange: (q: string) => void
  onOpenActivity: (act: HobbyActivity) => void
}

function EmptyState({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="py-7 text-center">
      <div className="w-13 h-13 rounded-[18px] bg-card border shadow-sm flex items-center justify-center mx-auto mb-2.5 text-[22px] w-[52px] h-[52px]">{icon}</div>
      <b className="block text-para-sm font-bold mb-1 font-sans">{title}</b>
      <p className="text-para-xs text-muted-foreground m-0">{desc}</p>
    </div>
  )
}

const SearchTab = React.memo(function SearchTab({
  searchQ,
  searchRef,
  filteredHobbies,
  filteredActivities,
  gearCounts,
  lastActive,
  onSearchChange,
  onOpenActivity,
}: SearchTabProps) {
  const q = searchQ.toLowerCase().trim()

  return (
    <div className="px-[18px] pt-4">
      <div className="relative mb-[18px]">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
        </svg>
        <Input
          ref={searchRef}
          autoFocus
          value={searchQ}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search hobbies or activities…"
          className="pl-[42px] pr-10 h-[50px] rounded-full text-para-md font-medium bg-secondary border-0"
        />
        {searchQ && (
          <button onClick={() => onSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-0 cursor-pointer text-muted-foreground/60 p-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        )}
      </div>

      {!q && (
        <EmptyState icon="🔍" title="Search anything" desc="Type to find hobbies, activities, or sessions" />
      )}

      {q && filteredHobbies.length === 0 && filteredActivities.length === 0 && (
        <EmptyState icon="😶" title="No results" desc={`Nothing matches "${searchQ}"`} />
      )}

      {filteredHobbies.length > 0 && (
        <>
          <p className="text-caption font-bold tracking-caption uppercase text-muted-foreground/60 mb-2.5 ml-0.5">Interests</p>
          <div className="grid grid-cols-2 gap-[11px] mb-[22px]">
            {filteredHobbies.map(({ label, icon, href, value }, i) => {
              const count = gearCounts[value] ?? 0
              const last = lastActive[value]
              return (
                <Link key={value} href={href} prefetch={false} className="block no-underline">
                  <Card className="hover:shadow-md transition-shadow h-full">
                    <CardContent className="p-[15px_14px_13px] flex flex-col gap-2.5">
                      <div className="flex items-center justify-between">
                        <span className="w-10 h-10 rounded-[14px] flex items-center justify-center text-[21px]" style={{ background: TINTS[i % TINTS.length] }}>{icon}</span>
                        <Badge variant="secondary" className="text-para-xs font-bold">{count} items</Badge>
                      </div>
                      <div className="font-bold text-para-sm font-sans">{label}</div>
                      <span className="text-para-xs font-semibold text-muted-foreground/60">{last ?? 'not started'}</span>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </>
      )}

      {filteredActivities.length > 0 && (
        <>
          <p className="text-caption font-bold tracking-caption uppercase text-muted-foreground/60 mb-2.5 ml-0.5">Activities</p>
          <div className="flex flex-col gap-[9px]">
            {filteredActivities.map(act => {
              const h = HOBBIES.find(x => x.value === act.hobby)
              return (
                <Card key={act.id} className="cursor-pointer" onClick={() => onOpenActivity(act)}>
                  <CardContent className="flex gap-3 p-3.5 items-center">
                    <Link href={`/${act.hobby}`} className="w-[42px] h-[42px] rounded-[14px] flex items-center justify-center text-[19px] flex-shrink-0 no-underline bg-neutral-100" onClick={e => e.stopPropagation()}>
                      {h?.icon ?? '✨'}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <b className="text-para-sm font-bold block overflow-hidden text-ellipsis whitespace-nowrap">{act.note ?? 'Session logged'}</b>
                      <span className="text-para-xs text-muted-foreground">{h?.label ?? act.hobby}{act.location ? ` · ${act.location}` : ''}</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
})

export default SearchTab
