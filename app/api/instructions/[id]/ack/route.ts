// ============================================================================
// API ROUTE — POST /api/instructions/:id/ack
// Accusé de réception INDIVIDUEL (§10.1 : « une notification lue n'équivaut
// ni à une acceptation ni à une exécution » — l'accusé est un acte
// explicite du destinataire). Contrôle d'appartenance, pas de permission :
// seul le destinataire accuse pour lui-même.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getFinanceAdminClient } from "@/lib/finance-server";
import { createNotification } from "@/lib/notifications";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }
    const { data: actor } = await supabase.from("profiles").select("role, nom, prenom").eq("id", user.id).single();
    const actorRow = actor as { role?: string; nom?: string; prenom?: string | null } | null;

    const admin = getFinanceAdminClient();
    const { data: recipient } = await admin
      .from("instruction_recipients")
      .select("id, acked_at, instructions(id, reference, subject, status, author_id)")
      .eq("instruction_id", params.id)
      .eq("recipient_id", user.id)
      .maybeSingle();
    if (!recipient) {
      return NextResponse.json(
        { success: false, error: "Vous n'êtes pas destinataire de cette instruction" },
        { status: 403 }
      );
    }
    const row = recipient as unknown as {
      id: string;
      acked_at: string | null;
      instructions: { id: string; reference: string; subject: string; status: string; author_id: string };
    };
    if (row.instructions.status !== "envoyee") {
      return NextResponse.json(
        { success: false, error: `Instruction ${row.instructions.status} — accusé impossible` },
        { status: 400 }
      );
    }
    if (row.acked_at) {
      return NextResponse.json({ success: false, error: "Déjà accusé réception" }, { status: 400 });
    }

    const { error } = await admin
      .from("instruction_recipients")
      .update({ acked_at: new Date().toISOString(), status: "prise_en_charge" })
      .eq("id", row.id);
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const name = [actorRow?.prenom, actorRow?.nom].filter(Boolean).join(" ") || "Un destinataire";
    await createNotification(
      row.instructions.author_id,
      "info",
      `Accusé de réception — ${row.instructions.reference}`,
      `${name} a pris en charge : ${row.instructions.subject}`,
      "/dashboard/instructions"
    );
    await logAudit({
      userId: user.id,
      userRole: actorRow?.role || "",
      action: "instruction.accusee",
      entityType: "instructions",
      entityId: row.instructions.id,
      newValue: { recipient: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[INSTRUCTIONS] ack EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
