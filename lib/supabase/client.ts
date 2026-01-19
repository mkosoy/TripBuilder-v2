import { createBrowserClient as createClientFromSSR } from '@supabase/ssr'

let client: ReturnType<typeof createClientFromSSR> | null = null

function getSupabaseBrowserClient() {
  if (client) {
    return client
  }

  client = createClientFromSSR(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  return client
}

// Named export for singleton browser client
export function createBrowserClient() {
  return getSupabaseBrowserClient()
}

// Also export the getter function
export { getSupabaseBrowserClient }
