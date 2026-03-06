import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useState } from 'react'
import * as WebBrowser from 'expo-web-browser'
import { makeRedirectUri } from 'expo-auth-session'
import { supabase } from '@/lib/supabase'

WebBrowser.maybeCompleteAuthSession()

export default function LoginScreen() {
  const [loading, setLoading] = useState(false)

  async function signInWithGoogle() {
    try {
      setLoading(true)
      const redirectTo = makeRedirectUri({ scheme: 'outfit-style', path: 'auth/callback' })

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, skipBrowserRedirect: true },
      })

      if (error || !data.url) throw error

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo)

      if (result.type === 'success' && result.url) {
        const url = new URL(result.url)
        const code = url.searchParams.get('code')
        if (code) {
          await supabase.auth.exchangeCodeForSession(code)
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="flex-1 bg-[#0A0A0A] items-center justify-center px-6">
      {/* Icon */}
      <View className="w-16 h-16 rounded-2xl bg-white items-center justify-center mb-6">
        <Text className="text-3xl">👔</Text>
      </View>

      <Text className="text-white text-2xl font-bold tracking-tight mb-1">Outfit Style</Text>
      <Text className="text-[#777777] text-sm mb-12">Your smart wardrobe planner</Text>

      <TouchableOpacity
        onPress={signInWithGoogle}
        disabled={loading}
        className="w-full max-w-xs h-12 bg-white rounded-2xl flex-row items-center justify-center gap-3"
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text className="text-black font-semibold text-sm">Continue with Google</Text>
        )}
      </TouchableOpacity>

      <Text className="text-[#444444] text-xs mt-10 text-center max-w-xs leading-5">
        By continuing, you agree to our terms and privacy policy.
      </Text>
    </View>
  )
}
