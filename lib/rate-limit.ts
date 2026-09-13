import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// ============================================================================
// Rate-limiting par fenêtre glissante, en base (table rate_limit_hits).
// Migration 037. Phase 1b, point 9 — protège les endpoints publics sans
// authentification qui acceptent des écritures (formulaires, déclaration de
// paiement) contre le spam/l'abus.
// ============================================================================

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars manquantes");
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

/**
 * Vérifie et enregistre un appel pour `key` (ex: "contact:203.0.113.4").
 * Fenêtre glissante de `windowSeconds`, max `max` appels dans la fenêtre.
 * Best-effort : si la vérification échoue techniquement (base indisponible),
 * on laisse passer plutôt que de bloquer un client légitime sur une panne
 * infrastructurelle sans rapport avec de l'abus.
 */
export async function checkRateLimit(
  key: string,
  { windowSeconds = 300, max = 10 }: { windowSeconds?: number; max?: number } = {}
): Promise<RateLimitResult> {
  try {
    const admin = getAdminClient();
    const since = new Date(Date.now() - windowSeconds * 1000).toISOString();

    // Nettoyage opportuniste des entrées hors fenêtre pour cette clé.
    await admin.from("rate_limit_hits").delete().eq("rl_key", key).lt("created_at", since);

    const { count } = await admin
      .from("rate_limit_hits")
      .select("id", { count: "exact", head: true })
      .eq("rl_key", key)
      .gte("created_at", since);

    const current = count ?? 0;
    if (current >= max) {
      return { allowed: false, remaining: 0 };
    }

    await admin.from("rate_limit_hits").insert({ rl_key: key });
    return { allowed: true, remaining: max - current - 1 };
  } catch (err) {
    console.error("[RATE-LIMIT] vérification impossible, requête autorisée par défaut:", err);
    return { allowed: true, remaining: 0 };
  }
}

/**
 * Helper de commodité pour les route handlers : renvoie une réponse 429
 * toute prête si la limite est dépassée, ou `null` si la requête peut continuer.
 */
// Pas d'annotation de retour explicite : elle figerait le générique de
// NextResponse à `unknown` et casserait l'assignabilité vers les types
// `NextResponse<SubmitResult>` déclarés par les routes appelantes. On laisse
// TypeScript inférer `NextResponse<{ success: false; error: string }> | null`.
export async function rateLimitOrNull(
  request: NextRequest,
  endpoint: string,
  opts?: { windowSeconds?: number; max?: number }
) {
  const ip = getClientIp(request);
  const result = await checkRateLimit(`${endpoint}:${ip}`, opts);
  if (!result.allowed) {
    // `success: false` (plutôt qu'un simple `{ error }`) pour rester
    // structurellement compatible avec les types `SubmitResult` des routes
    // appelantes (`{ success: boolean; error?: string; reference?: string }`).
    return NextResponse.json(
      { success: false, error: "Trop de requêtes. Merci de réessayer dans quelques minutes." },
      { status: 429 }
    );
  }
  return null;
}
