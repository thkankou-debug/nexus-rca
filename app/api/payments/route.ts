// ============================================================================
// GET /api/payments — Lister les paiements (filtré par RLS payments_select)
//
// Authentication : auth requis.
// Visibilité     : RLS filtre automatiquement (super_admin/admin tout, agent
//                  ses créations + dossiers assignés, client ses paiements).
// Query params   :
//   - status (optionnel) : filtre sur status
//   - method (optionnel) : filtre sur method
//   - limit (default 50, max 200)
//   - offset (default 0)
// ============================================================================

import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuthenticated, toErrorResponse, jsonOk } from "@/lib/payments/http";
import { PAYMENT_METHODS, PAYMENT_STATUSES } from "@/lib/payments";
import type { PaymentMethod, PaymentStatus } from "@/lib/payments";

export const dynamic = "force-dynamic";

const MAX_LIMIT = 200;

export async function GET(request: NextRequest) {
  try {
    await requireAuthenticated();
    const supabase = createClient();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as PaymentStatus | null;
    const method = searchParams.get("method") as PaymentMethod | null;
    const limitRaw = parseInt(searchParams.get("limit") ?? "50", 10);
    const offsetRaw = parseInt(searchParams.get("offset") ?? "0", 10);

    const limit = Math.min(Math.max(Number.isFinite(limitRaw) ? limitRaw : 50, 1), MAX_LIMIT);
    const offset = Math.max(Number.isFinite(offsetRaw) ? offsetRaw : 0, 0);

    let query = supabase
      .from("payments")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && PAYMENT_STATUSES.includes(status)) {
      query = query.eq("status", status);
    }
    if (method && PAYMENT_METHODS.includes(method)) {
      query = query.eq("method", method);
    }

    const { data, error, count } = await query;
    if (error) {
      // Si l'utilisateur n'a accès à rien, RLS retourne juste 0 rows (pas une erreur)
      console.error("[GET /api/payments]", error);
      return jsonOk({ payments: [], total: 0, limit, offset });
    }

    return jsonOk({
      payments: data ?? [],
      total: count ?? 0,
      limit,
      offset,
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}
