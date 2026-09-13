'use client'

import { forwardRef } from 'react'
import type { WardrobeItem } from '@/lib/types'
import { CATEGORY_TREE } from '@/lib/types'

interface StatsShareCardProps {
  items: WardrobeItem[]
  username?: string
}

export const StatsShareCard = forwardRef<HTMLDivElement, StatsShareCardProps>(
  ({ items, username }, ref) => {
    const total      = items.length
    const totalWears = items.reduce((s, i) => s + i.wear_count, 0)
    const neverWorn  = items.filter(i => i.wear_count === 0).length
    const avgWears   = total > 0 ? (totalWears / total).toFixed(1) : '0'

    const byCategory = CATEGORY_TREE
      .filter(cat => cat.value !== 'fashion')
      .map(cat => ({
        ...cat,
        count: items.filter(i => i.category === cat.value).length,
      }))
      .filter(c => c.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    const maxCat = Math.max(...byCategory.map(c => c.count), 1)

    const mostWorn = [...items]
      .sort((a, b) => b.wear_count - a.wear_count)
      .filter(i => i.wear_count > 0)
      .slice(0, 3)

    const today = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

    return (
      <div
        ref={ref}
        style={{
          width: 360,
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          borderRadius: 24,
          padding: 28,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: '#ffffff',
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <p style={{ fontSize: 11, color: '#94a3b8', margin: 0, letterSpacing: 1, textTransform: 'uppercase' }}>
              Interestory
            </p>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: '4px 0 0', color: '#ffffff' }}>
              Style Stats
            </h2>
            {username && (
              <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>{username}</p>
            )}
          </div>
          <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>{today}</p>
        </div>

        {/* Summary grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
          {[
            { label: 'Items',      value: total },
            { label: 'Wears',      value: totalWears },
            { label: 'Avg/Item',   value: avgWears },
            { label: 'Never Worn', value: neverWorn },
          ].map(stat => (
            <div key={stat.label} style={{
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 12,
              padding: '10px 8px',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#fbbf24' }}>{stat.value}</p>
              <p style={{ fontSize: 9, color: '#94a3b8', margin: '3px 0 0', lineHeight: 1.2 }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Category bars */}
        {byCategory.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 10px', letterSpacing: 0.5, textTransform: 'uppercase' }}>
              By Category
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {byCategory.map(cat => (
                <div key={cat.value}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: '#e2e8f0' }}>{cat.icon} {cat.label}</span>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>{cat.count}</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${(cat.count / maxCat) * 100}%`,
                      background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                      borderRadius: 4,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Most worn */}
        {mostWorn.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 10px', letterSpacing: 0.5, textTransform: 'uppercase' }}>
              Most Worn
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {mostWorn.map((item, idx) => (
                <div key={item.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: 10,
                  padding: '8px 10px',
                }}>
                  <span style={{ fontSize: 10, color: '#475569', fontWeight: 700, width: 14 }}>{idx + 1}</span>
                  <img
                    src={item.image_url}
                    alt={item.name}
                    style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                    crossOrigin="anonymous"
                  />
                  <span style={{ fontSize: 12, color: '#e2e8f0', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.name}
                  </span>
                  <span style={{ fontSize: 12, color: '#fbbf24', fontWeight: 700 }}>{item.wear_count}×</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: 12,
          display: 'flex',
          justifyContent: 'center',
        }}>
          <p style={{ fontSize: 10, color: '#475569', margin: 0 }}>interestory.app</p>
        </div>
      </div>
    )
  }
)

StatsShareCard.displayName = 'StatsShareCard'
