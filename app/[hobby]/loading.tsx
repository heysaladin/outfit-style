export default function HobbyLoading() {
  return (
    <div className="bg-background h-dvh overflow-y-auto text-foreground max-w-[430px] mx-auto">

      {/* Header skeleton */}
      <header
        className="sticky top-0 z-10 flex items-center gap-2.5 px-3.5 pb-2.5 bg-background/95 border-b border-border"
        style={{ paddingTop: 'calc(14px + env(safe-area-inset-top,0px))' }}
      >
        <div className="w-9 h-9 rounded-xl bg-muted animate-pulse flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-5 w-32 rounded-lg bg-muted animate-pulse" />
          <div className="h-3 w-24 rounded-md bg-muted animate-pulse" />
        </div>
      </header>

      {/* Segmented control skeleton */}
      <div className="px-4 pt-3 pb-3">
        <div className="h-9 w-full rounded-xl bg-muted animate-pulse" />
      </div>

      {/* Items grid skeleton */}
      <div className="px-4 pb-10">
        <div className="grid grid-cols-2 gap-2.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="aspect-square bg-muted animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-3.5 w-3/4 rounded-md bg-muted animate-pulse" />
                <div className="h-2.5 w-1/2 rounded-md bg-muted animate-pulse" />
                <div className="h-1 w-full rounded-full bg-muted animate-pulse mt-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
