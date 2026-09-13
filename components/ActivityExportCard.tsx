'use client'

import { forwardRef } from 'react'

export interface ActivityExportData {
  type: 'outfit' | 'text'
  label: string       // hobby label or outfit name
  labelIcon?: string  // hobby icon
  timestamp: string
  text: string | null
  items: { id: string; image_url: string; name: string }[]
}

const Logo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
    <div style={{
      width: 28, height: 28, borderRadius: 8,
      background: '#171717',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{ fontSize: 14 }}>✦</span>
    </div>
    <span style={{ fontSize: 14, fontWeight: 800, color: '#171717', letterSpacing: -0.3 }}>
      Interestory
    </span>
  </div>
)

export const ActivityExportCard = forwardRef<HTMLDivElement, { data: ActivityExportData }>(
  ({ data }, ref) => {
    if (data.type === 'outfit') {
      const cols = data.items.length <= 4 ? data.items.length : Math.ceil(Math.sqrt(data.items.length))
      const itemSize = cols <= 3 ? 120 : cols === 4 ? 96 : 80

      return (
        <div ref={ref} style={{
          width: 400, background: '#ffffff', borderRadius: 20,
          overflow: 'hidden', fontFamily: 'system-ui, -apple-system, sans-serif',
          boxSizing: 'border-box', border: '1px solid #e5e5e5',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px 14px', borderBottom: '1px solid #f0f0f0' }}>
            <Logo />
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#171717' }}>{data.label}</p>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: '#a3a3a3', fontWeight: 500 }}>{data.timestamp}</p>
            </div>
          </div>

          {/* Note */}
          {data.text && (
            <div style={{ padding: '14px 20px 10px' }}>
              <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#171717', lineHeight: 1.3 }}>{data.text}</p>
            </div>
          )}

          {/* Items grid */}
          {data.items.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gap: 8,
              padding: data.text ? '10px 20px 20px' : '14px 20px 20px',
            }}>
              {data.items.map((item) => (
                <div key={item.id} style={{
                  aspectRatio: '1', borderRadius: 12, overflow: 'hidden',
                  background: '#f5f5f5', border: '1px solid #e5e5e5',
                  height: itemSize, width: '100%', boxSizing: 'border-box',
                }}>
                  <img src={item.image_url} alt={item.name} crossOrigin="anonymous"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    // Text card
    const len = (data.text ?? '').length
    const isShort  = len <= 120
    const fontSize = isShort ? 36 : len <= 400 ? 22 : 15
    const fontWeight = isShort ? 900 : 700
    const textAlign = isShort ? 'center' : 'left'
    const minHeight = isShort ? 200 : undefined

    return (
      <div ref={ref} style={{
        width: 400, background: '#ffffff', borderRadius: 20,
        overflow: 'hidden', fontFamily: 'system-ui, -apple-system, sans-serif',
        boxSizing: 'border-box', border: '1px solid #e5e5e5',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px 14px', borderBottom: '1px solid #f0f0f0' }}>
          <Logo />
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#171717' }}>
              {data.labelIcon ? `${data.labelIcon} ${data.label}` : data.label}
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: '#a3a3a3', fontWeight: 500 }}>{data.timestamp}</p>
          </div>
        </div>

        {/* Text body */}
        <div style={{
          padding: '24px 24px 28px',
          minHeight,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: isShort ? 'center' : 'flex-start',
        }}>
          <p style={{
            margin: 0,
            fontSize,
            fontWeight,
            color: '#171717',
            lineHeight: isShort ? 1.2 : 1.55,
            textAlign,
            wordBreak: 'break-word',
          }}>
            {data.text}
          </p>
        </div>
      </div>
    )
  }
)

ActivityExportCard.displayName = 'ActivityExportCard'
