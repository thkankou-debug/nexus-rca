import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const VALID_ACTIONS = [
  "confirm",
  "cancel",
  "complete",
  "assign",
  "reopen",
  "mark_absent",
] as const;

type Action = (typeof VALID_ACTIONS)[number];

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const appointmentId = params.id;

    if (!appointmentId) {
      return NextResponse.json(
        { error: "ID rendez-vous manquant" },
        { status: 400 }
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
    }

    if (!["agent", "admin", "super_admin"].includes(profile.role)) {
      return NextResponse.json(
        { error: "Permission refusée" },
        { status: 403 }
      );
    }

    const { data: appointment } = await supabase
      .from("appointments")
      .select("*")
      .eq("id", appointmentId)
      .single();

    if (!appointment) {
      return NextResponse.json(
        { error: "Rendez-vous introuvable" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const action = body.action as Action;

    if (!VALID_ACTIONS.includes(action)) {
      return NextResponse.json(
        { error: `Action invalide. Doit être : ${VALID_ACTIONS.join(", ")}` },
        { status: 400 }
      );
    }

    const isAdmin = ["admin", "super_admin"].includes(profile.role);
    const isOwner = appointment.agent_id === profile.id;

    if (!isAdmin && !isOwner && action !== "assign") {
      return NextResponse.json(
        { error: "Vous ne pouvez agir que sur vos propres RDV" },
        { status: 403 }
      );
    }

    const updates: Record<string, unknown> = {};
    const now = new Date().toISOString();

    switch (action) {
      case "confirm":
        if (appointment.statut !== "en_attente") {
          return NextResponse.json(
            { error: "Seul un RDV en attente peut être confirmé" },
            { status: 400 }
          );
        }
        updates.statut = "confirme";
        updates.confirmed_at = now;
        updates.confirmed_by = profile.id;
        break;

      case "cancel":
        if (["termine", "annule_client", "annule_agent", "absent"].includes(appointment.statut)) {
          return NextResponse.json(
            { error: "Ce RDV ne peut plus être annulé" },
            { status: 400 }
          );
        }
        updates.statut = "annule_agent";
        updates.cancelled_at = now;
        updates.cancelled_by = profile.id;
        break;

      case "complete":
        if (appointment.statut !== "confirme") {
          return NextResponse.json(
            { error: "Seul un RDV confirmé peut être marqué terminé" },
            { status: 400 }
          );
        }
        updates.statut = "termine";
        break;

      case "mark_absent":
        if (appointment.statut !== "confirme") {
          return NextResponse.json(
            { error: "Seul un RDV confirmé peut être marqué absent" },
            { status: 400 }
          );
        }
        updates.statut = "absent";
        break;

      case "reopen":
        if (!isAdmin) {
          return NextResponse.json(
            { error: "Seul un admin peut réouvrir un RDV" },
            { status: 403 }
          );
        }
        updates.statut = "en_attente";
        updates.cancelled_at = null;
        updates.cancelled_by = null;
        updates.confirmed_at = null;
        updates.confirmed_by = null;
        break;

      case "assign": {
        const targetAgentId = body.agent_id;
        if (!targetAgentId) {
          return NextResponse.json(
            { error: "agent_id requis pour assignation" },
            { status: 400 }
          );
        }

        if (!isAdmin && targetAgentId !== profile.id) {
          return NextResponse.json(
            { error: "Vous ne pouvez vous assigner que vous-même" },
            { status: 403 }
          );
        }

        if (!isAdmin && appointment.agent_id !== null && appointment.agent_id !== profile.id) {
          return NextResponse.json(
            { error: "Ce RDV est déjà assigné à un autre agent" },
            { status: 400 }
          );
        }

        const { data: targetAgent } = await supabase
          .from("profiles")
          .select("id, role")
          .eq("id", targetAgentId)
          .single();

        if (!targetAgent || !["agent", "admin", "super_admin"].includes(targetAgent.role)) {
          return NextResponse.json(
            { error: "Agent cible invalide" },
            { status: 400 }
          );
        }

        updates.agent_id = targetAgentId;
        break;
      }
    }

    const { error: updateError } = await supabase
      .from("appointments")
      .update(updates)
      .eq("id", appointmentId);

    if (updateError) {
      console.error("Erreur update RDV:", updateError);
      return NextResponse.json(
        { error: updateError.message || "Erreur lors de la mise à jour" },
        { status: 500 }
      );
    }

    console.log(
      `[NEXUS RDV] Action ${action} sur ${appointment.reference} par ${profile.id}`
    );

    return NextResponse.json({
      success: true,
      action,
      appointment_id: appointmentId,
    });
  } catch (err) {
    console.error("Erreur API action:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
