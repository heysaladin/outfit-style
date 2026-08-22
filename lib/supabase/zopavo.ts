import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createZopavoClient() {
  return createSupabaseClient(
    process.env.ZOPAVO_SUPABASE_URL!,
    process.env.ZOPAVO_SUPABASE_ANON_KEY!,
  )
}

export function createZopavoAdminClient() {
  return createSupabaseClient(
    process.env.ZOPAVO_SUPABASE_URL!,
    process.env.ZOPAVO_SUPABASE_SERVICE_ROLE_KEY!,
  )
}
