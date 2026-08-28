export default function OfitLoading() {
  return (
    <div className="h-dvh overflow-y-auto bg-background pb-24">

      {/* Header skeleton */}
      <div
        className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/40 px-5 pb-3"
        style={{ paddingTop: 'calc(14px + env(safe-area-inset-top,0px))' }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="space-y-1.5">
            <div className="h-5 w-24 rounded-lg bg-muted animate-pulse" />
            <div className="h-3 w-32 rounded-md bg-muted animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="w-9 h-9 rounded-xl bg-muted animate-pulse" />
            <div className="w-9 h-9 rounded-full bg-muted animate-pulse" />
          </div>
        </div>
        {/* Search bar skeleton */}
        <div className="h-9 w-full rounded-xl bg-muted animate-pulse mb-2" />
        {/* Filter chips skeleton */}
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-7 rounded-full bg-muted animate-pulse flex-shrink-0" style={{ width: `${56 + i * 8}px` }} />
          ))}
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-5 px-5 py-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="aspect-[3/4] rounded-2xl bg-muted animate-pulse" />
            <div className="h-3 w-3/4 rounded-md bg-muted animate-pulse" />
            <div className="h-2.5 w-1/2 rounded-md bg-muted animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
