'use client'

import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  async function signInWithGoogle() {
    const supabase = createClient()
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${siteUrl}/auth/callback` },
    })
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: '#F5F1EB', color: '#1C1917' }}
    >
      {/* Header */}
      <div className="px-6 pt-10">
        <p
          className="text-[11px] tracking-[0.22em] uppercase"
          style={{ color: '#9C9488', fontFamily: 'var(--font-manrope)' }}
        >
          Interestory
        </p>
      </div>

      {/* Hero */}
      <div className="flex-1 flex flex-col justify-center px-6">
        <h1
          className="font-medium italic leading-[1.0]"
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: 56,
            letterSpacing: '-0.5px',
            color: '#1C1917',
          }}
        >
          Your interest,<br />your story.
        </h1>
        <p
          className="mt-5 text-sm leading-relaxed"
          style={{ color: '#6B6560', fontFamily: 'var(--font-manrope)', maxWidth: 260 }}
        >
          Hobbies, wardrobe, gear — everything you care about, beautifully tracked.
        </p>
      </div>

      {/* CTA */}
      <div className="px-6 pb-12 flex flex-col gap-3">
        {error && (
          <p
            className="text-xs px-4 py-3"
            style={{ background: 'rgba(233,87,63,0.1)', color: '#C0392B' }}
          >
            Sign in failed. Please try again.
          </p>
        )}

        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 transition-opacity hover:opacity-75 active:opacity-60"
          style={{
            height: 52,
            background: '#1C1917',
            color: '#F5F1EB',
            fontFamily: 'var(--font-manrope)',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          <GoogleIcon color="#F5F1EB" />
          Continue with Google
        </button>

        <p
          className="text-[10px] text-center leading-[1.6] mt-2"
          style={{ color: '#B0A99F', fontFamily: 'var(--font-manrope)' }}
        >
          By continuing, you agree to our terms and privacy policy.
        </p>
      </div>
    </div>
  )
}

function GoogleIcon({ color = '#000' }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2045C17.64 8.5663 17.5827 7.9527 17.4764 7.3636H9V10.845H13.8436C13.635 11.97 13.0009 12.9231 12.0477 13.5613V15.8195H14.9564C16.6582 14.2527 17.64 11.9454 17.64 9.2045Z" fill="#4285F4" />
      <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5613C11.2418 14.1013 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8372 3.96409 10.71H0.957275V13.0418C2.43818 15.9831 5.48182 18 9 18Z" fill="#34A853" />
      <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.5931 3.68182 9C3.68182 8.4068 3.78409 7.83 3.96409 7.29V4.9581H0.957275C0.347727 6.1731 0 7.5477 0 9C0 10.4522 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05" />
      <path d="M9 3.5795C10.3214 3.5795 11.5077 4.0336 12.4405 4.9254L15.0218 2.344C13.4632 0.8918 11.4259 0 9 0C5.48182 0 2.43818 2.0168 0.957275 4.9581L3.96409 7.29C4.67182 5.1627 6.65591 3.5795 9 3.5795Z" fill="#EA4335" />
    </svg>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
