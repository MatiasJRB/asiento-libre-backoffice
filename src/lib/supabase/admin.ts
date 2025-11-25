import { createClient } from '@supabase/supabase-js'

// Cliente de Supabase con Service Role para bypass de RLS
// ⚠️ SOLO usar en server-side (API routes, Server Components, Server Actions)
// NUNCA exponer este cliente al cliente/browser
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined')
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
