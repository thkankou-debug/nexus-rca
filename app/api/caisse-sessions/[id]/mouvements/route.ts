// ============================================================================
// API ROUTE — /api/caisse-sessions/:id/mouvements
// Cahier « reprise Accueil & caisse » §5 (12/09/2026) : entrées/sorties de
// fonds hors vente. « Toute entrée ou sortie hors vente doit comporter un
// type, un montant, un motif, un auteur et les justificatifs ou
// autorisations nécessaires. Aucun ajustement direct et inexpliqué du
// solde. »
// GET  : liste des mouvements de la session (propriétaire ou supervision).
// POST : enregistre un mouvement sur SA session OUVERTE uniquement — le
//        trigger 093 en base refuse de toute façon une session non ouverte
//        et fige les mouvements après soumission/clôture.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const SUPERVISION_ROLES = ["admin", "super_admin", "daf", "comptable"];

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars manquantes");
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function loadContext(sessionId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 }) };

  const { data: actor } = await supabase
    .from("profiles")
    .select("role, is_test")
    .eq("id", user.id)
    .single();
  const role = (actor as { role?: string } | null)?.role || "";
  const isTest = Boolean((actor as { is_test?: boolean } | null)?.is_test);

  const admin = getAdminClient();
  const { data: session } = await admin
    .from("caisse_sessions")
    .select("id, agent_id, status")
    .eq("id", sessionId)
    .single();
  if (!session) {
    return { error: NextResponse.json({ success: false, error: "Session introuvable" }, { status: 404 }) };
  }
  const sessionRow = session as { id: string; agent_id: string; status: string };

  const isOwner = sessionRow.agent_id === user.id;
  if (!isOwner && !SUPERVISION_ROLES.includes(role)) {
    return { error: NextResponse.json({ success: false, error: "Accès refusé" }, { status: 403 }) };
  }

  return { user, role, isTest, admin, sessionRow, isOwner };
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ctx = await loadContext(params.id);
    if ("error" in ctx) return ctx.error;

    const { data: mouvements, error } = await ctx.admin
      .from("caisse_movements")
      .select("id, type, montant, motif, justificatif, created_by, created_at")
      .eq("session_id", ctx.sessionRow.id)
      .order("created_at", { ascending: false });
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, mouvements: mouvements || [] });
  } catch (err) {
    console.error("[CAISSE_MOUVEMENTS] GET EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

interface MovementBody {
  type: "entree" | "sortie";
  montant: number;
  motif: string;
  justificatif?: string;
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ctx = await loadContext(params.id);
    if ("error" in ctx) return ctx.error;

    // Un mouvement s'enregistre sur SA caisse — la supervision consulte,
    // elle ne manipule pas le tiroir d'une opératrice à sa place.
    if (!ctx.isOwner) {
      return NextResponse.json(
        { success: false, error: "Seule l'opératrice de la session enregistre ses mouvements de fonds" },
        { status: 403 }
      );
    }
    if (ctx.sessionRow.status !== "ouverte") {
      return NextResponse.json(
        { success: false, error: "Session non ouverte — aucun mouvement de fonds possible" },
        { status: 409 }
      );
    }

    const body = (await request.json().catch(() => null)) as MovementBody | null;
    const montant = Number(body?.montant);
    const motif = body?.motif?.trim() || "";
    if (!body || !["entree", "sortie"].includes(body.type)) {
      return NextResponse.json({ success: false, error: "type 'entree' ou 'sortie' requis" }, { status: 400 });
    }
    if (!Number.isFinite(montant) || montant <= 0) {
      return NextResponse.json({ success: false, error: "montant > 0 requis" }, { status: 400 });
    }
    if (motif.length < 3) {
      return NextResponse.json(
        { success: false, error: "Le motif est obligatoire (aucun ajustement inexpliqué du solde)" },
        { status: 400 }
      );
    }

    const { data: created, error: insertError } = await ctx.admin
      .from("caisse_movements")
      .insert({
        session_id: ctx.sessionRow.id,
        type: body.type,
        montant,
        motif: motif.slice(0, 300),
        justificatif: body.justificatif?.trim().slice(0, 300) || null,
        created_by: ctx.user.id,
        is_test: ctx.isTest,
      })
      .select("id, type, montant, motif, justificatif, created_at")
      .single();
    if (insertError || !created) {
      console.error("[CAISSE_MOUVEMENTS] insert error:", insertError?.message);
      return NextResponse.json(
        { success: false, error: insertError?.message || "Échec de l'enregistrement" },
        { status: 500 }
      );
    }

    await logAudit({
      userId: ctx.user.id,
      userRole: ctx.role,
      action: `caisse.mouvement.${body.type}`,
      entityType: "caisse_movements",
      entityId: (created as { id: string }).id,
      newValue: { session_id: ctx.sessionRow.id, montant, motif, justificatif: body.justificatif || null },
    });

    return NextResponse.json({ success: true, mouvement: created });
  } catch (err) {
    console.error("[CAISSE_MOUVEMENTS] POST EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
