'use client'

import type { WardrobeItem } from '@/lib/types'
import { CATEGORY_TREE } from '@/lib/types'
import { BottomNav } from '@/components/BottomNav'

interface StatsClientProps { items: WardrobeItem[] }

export function StatsClient({ items }: StatsClientProps) {
  const total       = items.length
  const totalWears  = items.reduce((s, i) => s + i.wear_count, 0)
  const neverWorn   = items.filter(i => i.wear_count === 0)
  const mostWorn    = [...items].sort((a, b) => b.wear_count - a.wear_count).slice(0, 5)
  const leastWorn   = [...items].filter(i => i.wear_count > 0).sort((a, b) => a.wear_count - b.wear_count).slice(0, 5)
  const withPrice   = items.filter(i => i.price && i.wear_count > 0)
    .map(i => ({ ...i, cpw: i.price! / i.wear_count }))
    .sort((a, b) => a.cpw - b.cpw)

  const byCategory = CATEGORY_TREE.map(cat => ({
    ...cat,
    count: items.filter(i => i.category === cat.value).length,
  })).filter(c => c.count > 0)

  const maxCat = Math.max(...byCategory.map(c => c.count), 1)

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-16">
      <header className="sticky top-0 z-10 bg-[#0A0A0A]/95 backdrop-blur border-b border-[#1F1F1F] px-4 py-3">
        <h1 className="text-white font-bold text-lg">Style Stats</h1>
      </header>

      <div className="p-4 space-y-6 pb-24">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Items',       value: total },
            { label: 'Total Wears', value: totalWears },
            { label: 'Never Worn',  value: neverWorn.length },
          ].map(stat => (
            <div key={stat.label} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-3 text-center">
              <p className="text-white text-2xl font-bold">{stat.value}</p>
              <p className="text-[#555555] text-xs mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Category breakdown */}
        {byCategory.length > 0 && (
          <section>
            <h2 className="text-white font-semibold text-sm mb-3">By Category</h2>
            <div className="space-y-2">
              {byCategory.map(cat => (
                <div key={cat.value} className="flex items-center gap-3">
                  <span className="text-base w-6 text-center">{cat.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[#888888] text-xs">{cat.label}</span>
                      <span className="text-white text-xs font-medium">{cat.count}</span>
                    </div>
                    <div className="h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full transition-all"
                        style={{ width: `${(cat.count / maxCat) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Most worn */}
        {mostWorn.filter(i => i.wear_count > 0).length > 0 && (
          <section>
            <h2 className="text-white font-semibold text-sm mb-3">Most Worn</h2>
            <div className="space-y-2">
              {mostWorn.filter(i => i.wear_count > 0).map((item, idx) => (
                <ItemRow key={item.id} item={item} rank={idx + 1} />
              ))}
            </div>
          </section>
        )}

        {/* Least worn */}
        {leastWorn.length > 0 && (
          <section>
            <h2 className="text-white font-semibold text-sm mb-3">Least Worn</h2>
            <div className="space-y-2">
              {leastWorn.map((item, idx) => (
                <ItemRow key={item.id} item={item} rank={idx + 1} />
              ))}
            </div>
          </section>
        )}

        {/* Never worn */}
        {neverWorn.length > 0 && (
          <section>
            <h2 className="text-white font-semibold text-sm mb-3">Never Worn ({neverWorn.length})</h2>
            <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              {neverWorn.map(item => (
                <div key={item.id} className="flex-shrink-0 w-20 aspect-[3/4] rounded-xl overflow-hidden border border-[#2A2A2A]">
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Cost per wear */}
        {withPrice.length > 0 && (
          <section>
            <h2 className="text-white font-semibold text-sm mb-3">Cost Per Wear</h2>
            <div className="space-y-2">
              {withPrice.slice(0, 8).map(item => (
                <div key={item.id} className="flex items-center gap-3 bg-[#1A1A1A] rounded-xl p-3 border border-[#2A2A2A]">
                  <img src={item.image_url} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">{item.name}</p>
                    <p className="text-[#555555] text-xs">{item.wear_count} wears · ${item.price}</p>
                  </div>
                  <p className="text-white font-semibold text-sm">${item.cpw.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

function ItemRow({ item, rank }: { item: WardrobeItem; rank: number }) {
  return (
    <div className="flex items-center gap-3 bg-[#1A1A1A] rounded-xl p-3 border border-[#2A2A2A]">
      <span className="text-[#333333] text-xs font-bold w-4">{rank}</span>
      <img src={item.image_url} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
      <div className="flex-1 min-w-0">
        <p className="text-white text-xs font-medium truncate">{item.name}</p>
        <p className="text-[#555555] text-xs">
          {item.last_worn ? `Last ${new Date(item.last_worn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
        </p>
      </div>
      <span className="text-white font-semibold text-sm">{item.wear_count}×</span>
    </div>
  )
}
