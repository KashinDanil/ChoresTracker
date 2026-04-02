export function getSupabaseEnv() {
  // Server-side: prefer non-prefixed vars (read at runtime, not inlined at build)
  // Client-side: use NEXT_PUBLIC_ vars (inlined at build time)
  const url =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey =
    process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return { url, anonKey, isConfigured: Boolean(url && anonKey) };
}
