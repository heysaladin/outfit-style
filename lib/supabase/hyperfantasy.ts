import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Read-only client (anon key) for public endpoints
export function createHyperfantasyClient() {
  return createSupabaseClient(
    process.env.HYPERFANTASY_SUPABASE_URL!,
    process.env.HYPERFANTASY_SUPABASE_ANON_KEY!,
  )
}

// Service role client for admin write operations (auth checked separately via interestory session)
export function createHyperfantasyAdminClient() {
  return createSupabaseClient(
    process.env.HYPERFANTASY_SUPABASE_URL!,
    process.env.HYPERFANTASY_SUPABASE_SERVICE_ROLE_KEY!,
  )
}
