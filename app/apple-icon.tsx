import { ImageResponse } from 'next/og'

export const dynamic = 'force-static'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0A0A0A',
          borderRadius: 40,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 112,
            height: 112,
            background: '#FFFFFF',
            borderRadius: 26,
          }}
        >
          <span
            style={{
              fontSize: 56,
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
    { ...size },
  )
}
