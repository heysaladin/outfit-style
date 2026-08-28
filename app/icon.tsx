import { ImageResponse } from 'next/og'

export const dynamic = 'force-static'

export function generateImageMetadata() {
  return [
    { contentType: 'image/png', size: { width: 192, height: 192 }, id: '192' },
    { contentType: 'image/png', size: { width: 512, height: 512 }, id: '512' },
    { contentType: 'image/png', size: { width: 512, height: 512 }, id: '512-maskable' },
  ]
}

export default function Icon({ id }: { id: string }) {
  const size = id === '192' ? 192 : 512
  const maskable = id === '512-maskable'

  // Maskable: full-bleed background, content within safe zone (80% centered)
  if (maskable) {
    const safe = size * 0.8
    const font = size * 0.28
    return new ImageResponse(
      (
        <div
          style={{
            width: size,
            height: size,
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
              width: safe,
              height: safe,
              background: '#FFFFFF',
              borderRadius: safe * 0.25,
            }}
          >
            <span
              style={{
                fontSize: font,
                fontWeight: 800,
                color: '#0A0A0A',
                fontFamily: 'sans-serif',
                letterSpacing: '-0.04em',
              }}
            >
              i
            </span>
          </div>
        </div>
      ),
      { width: size, height: size },
    )
  }

  const radius = size * 0.22
  const font = size * 0.32

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0A0A0A',
          borderRadius: radius,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: size * 0.62,
            height: size * 0.62,
            background: '#FFFFFF',
            borderRadius: radius * 0.7,
          }}
        >
          <span
            style={{
              fontSize: font,
              fontWeight: 800,
              color: '#0A0A0A',
              fontFamily: 'sans-serif',
              letterSpacing: '-0.04em',
            }}
          >
            i
          </span>
        </div>
      </div>
    ),
    { width: size, height: size },
  )
}
