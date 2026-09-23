import "server-only";

import { createClient } from "@supabase/supabase-js";

export const DEMO_ORGANIZATION_ID = "113037d0-f952-4ae2-a90d-71614131e656";

/**
 * Privileged client for the public demo's server-side operations.
 * Bypasses RLS: callers must scope queries and inserts to DEMO_ORGANIZATION_ID.
 * Never accept an organization ID or arbitrary queries from the browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();

  if (!url) {
    throw new Error("Falta configurar NEXT_PUBLIC_SUPABASE_URL en el servidor.");
  }

  if (!secretKey) {
    throw new Error("Falta configurar SUPABASE_SECRET_KEY en el servidor.");
  }

  return createClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
