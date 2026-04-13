// ── Server-only Supabase clients ──────────────────────────────────────────────
// No exportar createBrowserSupabaseClient desde aquí — ese vive en supabase-browser.ts
// para evitar que next/headers se arrastre al bundle del cliente.
import { createServerClient as createSSRServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// ── Server client (cookies auth — RSC y Route Handlers) ───────────────────────
export async function createServerClient() {
  const cookieStore = await cookies();
  return createSSRServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Route Handler — cookies ya enviadas, ignorar
        }
      },
    },
  });
}

// ── Service role client (bypasses RLS — APIs y cron jobs) ─────────────────────
export function createServiceClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
