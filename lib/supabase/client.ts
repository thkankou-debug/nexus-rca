import { createBrowserClient } from "@supabase/ssr";

// Fallbacks placeholder pour permettre le prerender Next.js quand
// les env vars NEXT_PUBLIC_* ne sont pas exposées (ex: Vercel preview).
// En prod les vraies valeurs sont présentes — comportement identique.
// Si appelé en runtime sans env vars, les requêtes Supabase échoueront
// proprement plutôt que de faire crasher le build.
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key";

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
