// ============================================================================
// API ROUTE — /api/caisse-sessions
// P6, lot Caisse. GET (liste, scope agent = ses sessions / staff = toutes),
// POST (ouverture d'une session — solde d'ouverture déclaré par l'agent).
// Une seule session "ouverte" à la fois par agent (contrainte applicative,
// pas de contrainte DB — cohérent avec le reste du dépôt qui privilégie la
// validation serveur explicite sur cette table sensible).
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { hasPermission, ForbiddenError } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars manquantes");
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

interface OpenSessionBody {
  opening_balance: number;
  /** §2 cahier 12/09 : détail des coupures comptées, ex. {"10000":2,"pieces":250}. */
  opening_breakdown?: Record<string, number>;
  opening_note?: string;
  poste?: string;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }

    const { data: actor } = await supabase.from("profiles").select("id, role").eq("id", user.id).single();
    const role = (actor as { role?: string } | null)?.role || "";

    const admin = getAdminClient();
    let query = admin
      .from("caisse_sessions")
      .select("id, agent_id, opened_at, closed_at, opening_balance, expected_balance, actual_balance, discrepancy, status, notes, created_at, profiles(nom, prenom)")
      .order("opened_at", { ascending: false });

    // accueil_caisse : même portée que l'agent — uniquement ses propres
    // sessions (Espace Accueil & Caisse, §3.3 : la caissière ne voit pas
    // les sessions des autres postes).
    if (role === "agent" || role === "accueil_caisse") {
      query = query.eq("agent_id", user.id);
    }

    const { data, error } = await query;
    if (error) {
      console.error("[CAISSE_SESSIONS] list error:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, sessions: data });
  } catch (err) {
    console.error("[CAISSE_SESSIONS] GET EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Espace Accueil & Caisse (10/09/2026) : accueil_caisse ouvre sa session
    // via caisse.session.open, distincte de caisse.write (agent/admin) —
    // même route, deux permissions possibles plutôt qu'une troisième route
    // dupliquée pour la même action.
    if (!(await hasPermission("caisse.write")) && !(await hasPermission("caisse.session.open"))) {
      throw new ForbiddenError("Permission 'caisse.write' ou 'caisse.session.open' requise");
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }

    const { data: actor } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const role = (actor as { role?: string } | null)?.role || "";

    const body = (await request.json().catch(() => null)) as OpenSessionBody | null;
    if (!body || !Number.isFinite(body.opening_balance) || body.opening_balance < 0) {
      return NextResponse.json({ success: false, error: "opening_balance requis (nombre >= 0)" }, { status: 400 });
    }

    // Coupures (facultatives) : entiers >= 0, et si fournies leur total doit
    // correspondre au fonds déclaré — le fonds est un comptage, pas une saisie.
    let breakdown: Record<string, number> | null = null;
    if (body.opening_breakdown && typeof body.opening_breakdown === "object") {
      breakdown = {};
      let sum = 0;
      for (const [k, v] of Object.entries(body.opening_breakdown)) {
        const n = Number(v);
        if (!Number.isInteger(n) || n < 0) {
          return NextResponse.json(
            { success: false, error: `Coupure « ${k} » invalide (entier >= 0 requis)` },
            { status: 400 }
          );
        }
        if (n === 0) continue;
        breakdown[k] = n;
        sum += k === "pieces" ? n : Number(k) * n;
      }
      if (Object.keys(breakdown).length === 0) {
        breakdown = null;
      } else if (sum !== Math.round(body.opening_balance)) {
        return NextResponse.json(
          {
            success: false,
            error: `Le détail des coupures (${sum} FCFA) ne correspond pas au fonds déclaré (${Math.round(body.opening_balance)} FCFA)`,
          },
          { status: 400 }
        );
      }
    }

    const admin = getAdminClient();

    const { data: existingOpen } = await admin
      .from("caisse_sessions")
      .select("id")
      .eq("agent_id", user.id)
      .eq("status", "ouverte")
      .maybeSingle();

    if (existingOpen) {
      return NextResponse.json(
        { success: false, error: "Une session est déjà ouverte pour cet agent" },
        { status: 400 }
      );
    }

    const { data: created, error: insertError } = await admin
      .from("caisse_sessions")
      .insert({
        agent_id: user.id,
        opening_balance: body.opening_balance,
        opening_breakdown: breakdown,
        opening_note: body.opening_note?.trim().slice(0, 500) || null,
        poste: body.poste?.trim().slice(0, 80) || "Réception",
      })
      .select("id, opened_at, opening_balance, status, poste")
      .single();

    if (insertError || !created) {
      console.error("[CAISSE_SESSIONS] insert error:", insertError?.message);
      return NextResponse.json({ success: false, error: insertError?.message || "Échec d'ouverture" }, { status: 500 });
    }

    await logAudit({
      userId: user.id,
      userRole: role,
      action: "caisse_session.ouverte",
      entityType: "caisse_sessions",
      entityId: (created as { id: string }).id,
      newValue: {
        opening_balance: body.opening_balance,
        opening_breakdown: breakdown,
        opening_note: body.opening_note?.trim() || null,
        poste: body.poste?.trim() || "Réception",
      },
    });

    return NextResponse.json({ success: true, session: created });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[CAISSE_SESSIONS] POST EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
