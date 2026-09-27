'use client'

import { Plus, CheckSquare, Sun, Moon, ChevronLeft } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import Link from 'next/link'
import { UserAvatarMenu } from '@/components/UserAvatarMenu'
import { dateStrWIB } from '@/lib/date'
import { cn } from '@/lib/utils'

interface HeaderProps {
  user: { email?: string; user_metadata?: { full_name?: string; avatar_url?: string } } | null
  onUpload: () => void
  onSelectMode?: () => void
  selectMode?: boolean
  itemCount: number
  outfitCount: number
  wornThisWeekCount: number
}

export function Header({ user, onUpload, onSelectMode, selectMode, itemCount, outfitCount, wornThisWeekCount }: HeaderProps) {
  const { theme, toggle } = useTheme()

  return (
    <div>
      <div
        className="bg-neutral-950 rounded-b-[28px] px-3 pb-[58px] flex flex-col"
        style={{ paddingTop: 'calc(16px + env(safe-area-inset-top, 0px))' }}
      >
        <div className="h-9 flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <Link
              href="/fashion"
              aria-label="Back to Interestory"
              className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-200 shrink-0"
            >
              <ChevronLeft size={16} strokeWidth={2} />
            </Link>
            <span className="text-xl font-semibold tracking-tight text-[#EEF040]">Ofit</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-300 shrink-0"
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            {user && onSelectMode && (
              <button
                onClick={onSelectMode}
                aria-label="Select items"
                aria-pressed={selectMode}
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors',
                  selectMode ? 'bg-[#EEF040] text-neutral-950' : 'bg-neutral-800 text-neutral-300',
                )}
              >
                <CheckSquare size={14} />
              </button>
            )}
            {user ? (
              <>
                <button
                  onClick={onUpload}
                  aria-label="Add item"
                  className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-50 shrink-0"
                >
                  <Plus size={15} strokeWidth={2.5} />
                </button>
                <UserAvatarMenu buttonClassName="relative w-9 h-9 rounded-full bg-neutral-800 border-2 border-neutral-700 flex items-center justify-center overflow-hidden flex-shrink-0" />
              </>
            ) : (
              <Link href="/login" className="h-8 px-3.5 rounded-full bg-[#EEF040] text-neutral-950 text-xs font-semibold flex items-center shrink-0">
                Sign in
              </Link>
            )}
          </div>
        </div>

        <div className="pt-7 px-2 flex flex-col gap-2">
          <p className="text-sm font-medium uppercase tracking-[1.5px] text-neutral-400">{dateStrWIB()}</p>
          <h1 className="text-[30px] leading-[30px] tracking-[-1px] font-semibold text-neutral-50">
            What are you <span className="text-[#EEF040]">wearing</span> today?
          </h1>
        </div>
      </div>

      <div className="-mt-[34px] mx-3 relative bg-neutral-800 rounded-xl px-4 py-3.5 grid grid-cols-3 gap-3 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)]">
        {[
          { label: 'Items', value: itemCount },
          { label: 'Outfits', value: outfitCount },
          { label: 'Worn this week', value: wornThisWeekCount },
        ].map(stat => (
          <div key={stat.label} className="flex flex-col gap-0.5 min-w-0">
            <span className="text-2xl font-semibold tracking-[-0.5px] font-mono text-neutral-50">{stat.value}</span>
            <span className="text-xs text-neutral-400">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
