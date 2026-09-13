// ============================================================================
// API ROUTE — /api/team/[id] (habilitations, demande Thierry 13/09/2026)
// PATCH : modifier le RÔLE et/ou l'état ACTIF d'un compte staff.
// Réservé au super_admin (§2.1 : « attribution des rôles » = super-admin
// uniquement ; l'admin ne fait pas les rôles élevés).
//
// Protections :
//   - jamais sur son PROPRE compte (ni rôle ni désactivation) — en plus du
//     trigger base anti-auto-élévation (P1a) ;
//   - impossible de désactiver ou rétrograder le DERNIER super_admin actif ;
//   - les comptes « client » ne se gèrent pas ici (parcours client dédié) ;
//   - désactivation = profiles.actif=false ET bannissement auth (la session
//     meurt, le login échoue) ; réactivation = l'inverse. R22 : middleware
//     et requireProfile refusent déjà actif=false.
// Chaque action est tracée dans audit_log.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const STAFF_ROLES = [
  "super_admin",
  "admin",
  "dg",
  "daf",
  "chef_service",
  "agent",
  "comptable",
  "moderateur",
  "partenaire",
  "accueil_caisse",
] as const;

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars manquantes");
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    const { data: caller } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();
    if (!caller || caller.role !== "super_admin") {
      return NextResponse.json(
        { error: "Accès refusé : réservé au super administrateur" },
        { status: 403 }
      );
    }

    if (params.id === caller.id) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas modifier votre propre compte ici" },
        { status: 403 }
      );
    }

    const body = (await request.json()) as { role?: string; actif?: boolean };
    const wantsRole = typeof body.role === "string";
    const wantsActif = typeof body.actif === "boolean";
    if (!wantsRole && !wantsActif) {
      return NextResponse.json(
        { error: "Rien à modifier (role ou actif attendu)" },
        { status: 400 }
      );
    }
    if (wantsRole && !STAFF_ROLES.includes(body.role as (typeof STAFF_ROLES)[number])) {
      return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
    }

    const admin = getAdminClient();
    const { data: target } = await admin
      .from("profiles")
      .select("id, email, prenom, nom, role, actif")
      .eq("id", params.id)
      .single();
    if (!target) {
      return NextResponse.json({ error: "Compte introuvable" }, { status: 404 });
    }
    if (target.role === "client") {
      return NextResponse.json(
        { error: "Les comptes clients ne se gèrent pas depuis les habilitations" },
        { status: 400 }
      );
    }

    // Dernier super_admin actif : ni désactivation ni rétrogradation.
    const removesSuperAdmin =
      target.role === "super_admin" &&
      ((wantsActif && body.actif === false) ||
        (wantsRole && body.role !== "super_admin"));
    if (removesSuperAdmin) {
      const { count } = await admin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "super_admin")
        .eq("actif", true);
      if ((count ?? 0) <= 1) {
        return NextResponse.json(
          { error: "Impossible : c'est le dernier super administrateur actif" },
          { status: 409 }
        );
      }
    }

    const updates: Record<string, unknown> = {};
    if (wantsRole) updates.role = body.role;
    if (wantsActif) updates.actif = body.actif;

    const { error: upErr } = await admin
      .from("profiles")
      .update(updates)
      .eq("id", target.id);
    if (upErr) {
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    }

    // Désactivation réelle côté auth : bannissement (login refusé, sessions
    // invalidées au refresh). Réactivation : levée du ban. Best effort avec
    // retour arrière du profil si l'auth échoue.
    if (wantsActif) {
      const { error: banErr } = await admin.auth.admin.updateUserById(
        target.id,
        { ban_duration: body.actif ? "none" : "876000h" }
      );
      if (banErr) {
        await admin
          .from("profiles")
          .update({ actif: target.actif })
          .eq("id", target.id);
        return NextResponse.json(
          { error: "Échec côté authentification : " + banErr.message },
          { status: 500 }
        );
      }
    }

    await logAudit({
      userId: caller.id,
      userRole: caller.role,
      action: wantsRole && wantsActif
        ? "habilitation.role_actif.update"
        : wantsRole
        ? "habilitation.role.update"
        : body.actif
        ? "habilitation.compte.reactive"
        : "habilitation.compte.desactive",
      entityType: "profile",
      entityId: target.id,
      oldValue: { role: target.role, actif: target.actif },
      newValue: updates,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur inconnue";
    console.error("[HABILITATIONS] erreur:", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
