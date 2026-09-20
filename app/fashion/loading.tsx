export default function FashionLoading() {
  return (
    <div className="h-dvh overflow-y-auto bg-background pb-24">

      {/* Header skeleton */}
      <div
        className="sticky top-0 z-10 bg-background border-b px-4 pb-2"
        style={{ paddingTop: 'calc(8px + env(safe-area-inset-top, 0px))' }}
      >
        <div className="flex items-center justify-between min-h-[44px]">
          <div className="h-5 w-12 rounded-lg bg-muted animate-pulse" />
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-lg bg-muted animate-pulse" />
            <div className="w-16 h-8 rounded-full bg-muted animate-pulse" />
            <div className="w-20 h-8 rounded-full bg-muted animate-pulse" />
          </div>
        </div>
        <div className="mt-1 pb-1 space-y-1.5">
          <div className="h-7 w-28 rounded-lg bg-muted animate-pulse" />
          <div className="h-4 w-20 rounded-md bg-muted animate-pulse" />
        </div>
        {/* Tab bar skeleton */}
        <div className="flex border-b border-border mt-1">
          {[80, 100, 80].map((w, i) => (
            <div key={i} className="px-4 py-2.5">
              <div className="h-4 rounded-md bg-muted animate-pulse" style={{ width: w }} />
            </div>
          ))}
        </div>
      </div>

      {/* Filter bar skeleton */}
      <div className="border-b border-border px-4 py-3 space-y-3">
        <div className="flex gap-1.5 overflow-hidden">
          {[40, 64, 72, 88, 80].map((w, i) => (
            <div key={i} className="h-7 rounded-full bg-muted animate-pulse flex-shrink-0" style={{ width: w }} />
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <div className="h-8 w-20 rounded-full bg-muted animate-pulse" />
          <div className="h-9 flex-1 rounded-xl bg-muted animate-pulse" />
        </div>
      </div>

      {/* Search skeleton */}
      <div className="px-4 pt-4">
        <div className="h-9 w-full rounded-xl bg-muted animate-pulse mb-3" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-2 gap-2.5 px-4 pb-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-card rounded-xl overflow-hidden border border-border">
            <div className="aspect-square bg-muted animate-pulse" />
            <div className="p-3 space-y-1.5">
              <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
              <div className="h-1 w-full rounded-full bg-muted animate-pulse" />
              <div className="h-2.5 w-1/2 rounded bg-muted animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
