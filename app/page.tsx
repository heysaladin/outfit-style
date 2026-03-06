import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl">👔</span>
        </div>
        <h1 className="text-white text-2xl font-bold mb-2">Outfit Style</h1>
        <p className="text-[#777777] text-sm mb-1">
          Welcome, {user.user_metadata?.full_name ?? user.email}
        </p>
        <p className="text-[#555555] text-xs">Wardrobe catalog coming soon...</p>
      </div>
    </div>
  )
}
