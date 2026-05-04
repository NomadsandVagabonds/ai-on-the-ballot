import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/** Check if Supabase is configured with real credentials (not placeholders).
 *
 * This is a *connectivity* check — true when we *could* talk to Supabase.
 * It does NOT mean the site reads from Supabase. For that, gate on
 * `supabaseReadsEnabled()` instead. */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!(
    url && key &&
    !url.includes("your-project") &&
    !key.includes("your-")
  );
}

/** Whether queries should read from Supabase (vs the JSON mock layer).
 *
 * Controlled by the `DATA_SOURCE` env var (`"supabase"` or `"json"`,
 * defaulting to `"json"`). Returning Supabase reads requires credentials
 * to also be configured — otherwise we silently fall back to JSON to
 * keep the site up if env is misconfigured.
 *
 * Default is `"json"` so adding Supabase credentials never auto-flips
 * the site's read path. The cutover is a deliberate env change. */
export function supabaseReadsEnabled(): boolean {
  const source = (process.env.DATA_SOURCE || "json").toLowerCase();
  if (source !== "supabase") return false;
  return isSupabaseConfigured();
}

/** Server-side Supabase client for public reads.
 *
 * The site has no user auth — all reads are public, RLS-permitted, and
 * rely on the anon key. We deliberately don't use @supabase/ssr's cookie
 * integration here because read paths run inside generateStaticParams
 * (build time, no request) where cookies() throws.
 *
 * Async kept for source-compatibility with call sites that already await
 * this. */
export async function createServerSupabaseClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}

/** Service role client for data import/sync operations */
export function createServiceClient() {
  // Dynamic import to avoid bundling service role key in client code
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient } = require("@supabase/supabase-js") as typeof import("@supabase/supabase-js");
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
