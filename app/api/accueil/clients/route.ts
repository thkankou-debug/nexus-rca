// ============================================================================
// API ROUTE — /api/accueil/clients
// Espace Accueil & Caisse (§3.2 étape Client). GET : recherche par nom,
// téléphone ou référence — la recherche précède toujours la création.
// POST : création d'une fiche clients minimale, avec détection de similitude
// sur téléphone normalisé et e-mail AVANT enregistrement (409 + candidats,
// sauf force=true explicite).
// Service-role après assertPermission : accueil_caisse n'est pas couvert par
// is_staff(), la RLS clients lui refuserait la lecture directe.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { assertPermission, ForbiddenError } from "@/lib/permissions";
import { getAccueilAdminClient, normalizePhone } from "@/lib/accueil-server";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const SEARCH_LIMIT = 20;

async function getSessionUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, is_test")
    .eq("id", user.id)
    .single();
  return profile as { id: string; role: string; is_test?: boolean } | null;
}

export async function GET(request: NextRequest) {
  try {
    await assertPermission("client.read");
    const actor = await getSessionUser();
    if (!actor) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }

    const q = (request.nextUrl.searchParams.get("q") || "").trim();
    if (q.length < 2) {
      return NextResponse.json({ success: true, clients: [] });
    }

    const admin = getAccueilAdminClient();
    const like = `%${q.replace(/[%_]/g, "")}%`;
    let query = admin
      .from("clients")
      .select("id, reference, type, nom, prenom, raison_sociale, email, telephone, ville")
      .or(
        `nom.ilike.${like},prenom.ilike.${like},raison_sociale.ilike.${like},telephone.ilike.${like},reference.ilike.${like},email.ilike.${like}`
      )
      .is("merged_into_id", null)
      .eq("actif", true)
      .order("created_at", { ascending: false })
      .limit(SEARCH_LIMIT);
    if (!actor.is_test) query = query.eq("is_test", false);

    const { data, error } = await query;
    if (error) {
      console.error("[ACCUEIL_CLIENTS] search error:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, clients: data || [] });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[ACCUEIL_CLIENTS] GET EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

interface CreateClientBody {
  nom: string;
  prenom?: string;
  telephone?: string;
  email?: string;
  ville?: string;
  /** true = l'utilisatrice a vu les candidats doublons et confirme la création. */
  force?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    await assertPermission("client.create");
    const actor = await getSessionUser();
    if (!actor) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as CreateClientBody | null;
    const nom = body?.nom?.trim();
    if (!nom) {
      return NextResponse.json({ success: false, error: "Le nom est requis" }, { status: 400 });
    }
    const telephone = body?.telephone?.trim() || null;
    const email = body?.email?.trim().toLowerCase() || null;

    const admin = getAccueilAdminClient();

    // Détection de similitude avant enregistrement (§3.2) : téléphone
    // normalisé et e-mail. On renvoie les candidats, on ne fusionne jamais
    // automatiquement (leçon A6 : deux personnes peuvent partager un numéro).
    if (!body?.force && (telephone || email)) {
      const checks: string[] = [];
      if (email) checks.push(`email.ilike.${email}`);
      if (telephone) {
        const normalized = normalizePhone(telephone);
        if (normalized.length >= 6) checks.push(`telephone.ilike.%${normalized.slice(-8)}%`);
      }
      if (checks.length > 0) {
        const { data: similar } = await admin
          .from("clients")
          .select("id, reference, nom, prenom, telephone, email")
          .or(checks.join(","))
          .is("merged_into_id", null)
          .limit(5);
        if (similar && similar.length > 0) {
          return NextResponse.json(
            {
              success: false,
              error: "Des fiches similaires existent déjà",
              duplicates: similar,
            },
            { status: 409 }
          );
        }
      }
    }

    const { data: created, error } = await admin
      .from("clients")
      .insert({
        type: "particulier",
        nom,
        prenom: body?.prenom?.trim() || null,
        telephone,
        email,
        ville: body?.ville?.trim() || null,
        created_by: actor.id,
        is_test: Boolean(actor.is_test),
      })
      .select("id, reference, type, nom, prenom, raison_sociale, email, telephone, ville")
      .single();

    if (error || !created) {
      console.error("[ACCUEIL_CLIENTS] insert error:", error?.message);
      return NextResponse.json(
        { success: false, error: error?.message || "Échec de la création" },
        { status: 500 }
      );
    }

    await logAudit({
      userId: actor.id,
      userRole: actor.role,
      action: "accueil.client.cree",
      entityType: "clients",
      entityId: (created as { id: string }).id,
      newValue: { nom, telephone, email },
    });

    return NextResponse.json({ success: true, client: created });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[ACCUEIL_CLIENTS] POST EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
