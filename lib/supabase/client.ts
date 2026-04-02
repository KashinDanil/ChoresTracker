import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { isSupabaseConfigured, supabaseEnv } from "@/lib/supabase/env";

let browserClient: SupabaseClient<Database> | null = null;

export function getSupabaseBrowserClient(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured) {
    return null;
  }

  if (!browserClient) {
    browserClient = createBrowserClient<Database>(
      supabaseEnv.url as string,
      supabaseEnv.anonKey as string,
    );
  }

  return browserClient;
}
