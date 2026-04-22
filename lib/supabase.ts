import { createClient } from "@supabase/supabase-js";

const PUBLIC_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const PUBLIC_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function hasSupabaseConfig(): boolean {
  return Boolean(PUBLIC_URL && PUBLIC_ANON_KEY);
}

export function hasSupabaseAdminConfig(): boolean {
  return hasSupabaseConfig() && Boolean(SERVICE_ROLE_KEY);
}

export function createSupabasePublicClient() {
  if (!PUBLIC_URL || !PUBLIC_ANON_KEY) {
    throw new Error("Supabase public env vars are missing.");
  }

  return createClient(PUBLIC_URL, PUBLIC_ANON_KEY, {
    auth: { persistSession: false }
  });
}

export function createSupabaseAdminClient() {
  if (!PUBLIC_URL || !SERVICE_ROLE_KEY) {
    throw new Error("Supabase admin env vars are missing.");
  }

  return createClient(PUBLIC_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });
}
