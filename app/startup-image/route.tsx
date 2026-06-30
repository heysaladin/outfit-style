import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const w = parseInt(searchParams.get('w') || '1170')
  const h = parseInt(searchParams.get('h') || '2532')

  const iconSize = Math.min(w, h) * 0.18
  const radius = iconSize * 0.28

  return new ImageResponse(
    (
      <div
        style={{
          width: w,
          height: h,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0A0A0A',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: iconSize,
            height: iconSize,
            background: '#FFFFFF',
            borderRadius: radius,
          }}
        >
          <span
            style={{
              fontSize: iconSize * 0.5,
              fontWeight: 800,
              color: '#0A0A0A',
              fontFamily: 'sans-serif',
              letterSpacing: '-0.04em',
            }}
          >
            OS
          </span>
        </div>
      </div>
    ),
    { width: w, height: h },
  )
}
