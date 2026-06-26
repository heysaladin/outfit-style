'use client'

import { ChevronDown, LayoutGrid, Table2, Settings2, Search, SlidersHorizontal } from 'lucide-react'

type ViewMode = 'board' | 'table'

type Avatar = {
  src?: string
  initials?: string
}

type CardHeaderProps = {
  title: string
  viewMode?: ViewMode
  onViewModeChange?: (mode: ViewMode) => void
  onColumnsClick?: () => void
  assignees?: Avatar[]
  searchQuery?: string
  searchPlaceholder?: string
  onSearchChange?: (query: string) => void
  onFilterClick?: () => void
}

export function CardHeader({
  title,
  viewMode = 'table',
  onViewModeChange,
  onColumnsClick,
  assignees,
  searchQuery = '',
  searchPlaceholder = 'Search...',
  onSearchChange,
  onFilterClick,
}: CardHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      {/* Left: Title + View Controls */}
      <div className="flex items-center gap-10">
        <h2 className="text-[23.5px] font-semibold text-primary leading-[30px] whitespace-nowrap">
          {title}
        </h2>

        <div className="flex items-center gap-3 h-10">
          {/* Board / Table toggle group */}
          <div className="flex items-center border border-border rounded-lg overflow-hidden shadow-sm">
            <button
              onClick={() => onViewModeChange?.('board')}
              className={`flex items-center gap-2 pl-3.5 pr-4 py-2 text-sm font-medium border-r border-border transition-colors ${
                viewMode === 'board'
                  ? 'bg-muted text-foreground'
                  : 'bg-background text-muted-foreground hover:bg-muted/50'
              }`}
            >
              <LayoutGrid className="size-[18px] shrink-0" />
              Board
            </button>
            <button
              onClick={() => onViewModeChange?.('table')}
              className={`flex items-center gap-2 pl-3.5 pr-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-muted text-foreground'
                  : 'bg-background text-muted-foreground hover:bg-muted/50'
              }`}
            >
              <Table2 className="size-[18px] shrink-0" />
              Table
            </button>
          </div>

          {/* Columns button */}
          <button
            onClick={onColumnsClick}
            className="flex items-center gap-1 pl-3.5 pr-4 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-lg shadow-sm hover:bg-muted/50 transition-colors"
          >
            <Settings2 className="size-[18px] shrink-0" />
            Columns
          </button>
        </div>
      </div>

      {/* Right: Assignees + Search + Filter */}
      <div className="flex items-center gap-3">
        {/* Avatar group */}
        {assignees && assignees.length > 0 && (
          <button className="flex items-center gap-1 pr-1">
            <div className="flex items-center">
              {assignees.slice(0, 5).map((a, i) => (
                <div
                  key={i}
                  className="size-8 rounded-full border-2 border-background overflow-hidden flex items-center justify-center bg-muted text-xs font-medium text-muted-foreground"
                  style={{ zIndex: 5 - i, marginLeft: i > 0 ? '-8px' : '0' }}
                >
                  {a.src ? (
                    <img src={a.src} alt="" className="size-full object-cover" />
                  ) : (
                    <span>{a.initials ?? '?'}</span>
                  )}
                </div>
              ))}
            </div>
            <ChevronDown className="size-4 text-muted-foreground" />
          </button>
        )}

        {/* Search */}
        <div className="flex items-center gap-2 w-64 px-3.5 py-2.5 bg-background border border-border rounded-lg shadow-sm">
          <Search className="size-[18px] text-muted-foreground shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={searchPlaceholder}
            className="flex-1 text-sm text-foreground placeholder:text-muted-foreground bg-transparent outline-none min-w-0"
          />
          <ChevronDown className="size-4 text-muted-foreground shrink-0" />
        </div>

        {/* Filter */}
        <button
          onClick={onFilterClick}
          className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-foreground bg-background border border-border rounded-lg shadow-sm hover:bg-muted/50 transition-colors whitespace-nowrap"
        >
          <SlidersHorizontal className="size-[18px] shrink-0" />
          Filter
          <ChevronDown className="size-4" />
        </button>
      </div>
    </div>
  )
}
