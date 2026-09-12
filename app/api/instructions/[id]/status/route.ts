// ============================================================================
// API ROUTE — POST /api/instructions/:id/status
// Avancement PAR DESTINATAIRE (§10.1) : prise_en_charge → en_cours →
// soumise / bloquee / terminee. Un blocage exige une note (cause, impact,
// décision attendue — §10.2) et notifie l'émetteur.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getFinanceAdminClient } from "@/lib/finance-server";
import { createNotification } from "@/lib/notifications";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const ALLOWED = ["prise_en_charge", "en_cours", "bloquee", "soumise", "terminee"] as const;
type RecipientStatus = (typeof ALLOWED)[number];

interface Body {
  status: RecipientStatus;
  note?: string;
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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

    const body = (await request.json().catch(() => null)) as Body | null;
    if (!body || !ALLOWED.includes(body.status)) {
      return NextResponse.json({ success: false, error: "status invalide" }, { status: 400 });
    }
    if (body.status === "bloquee" && !body.note?.trim()) {
      return NextResponse.json(
        { success: false, error: "Un blocage exige une note (cause, impact, décision attendue)" },
        { status: 400 }
      );
    }

    const admin = getFinanceAdminClient();
    const { data: recipient } = await admin
      .from("instruction_recipients")
      .select("id, acked_at, status, instructions(id, reference, subject, status, author_id, requires_ack)")
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
      status: string;
      instructions: {
        id: string;
        reference: string;
        subject: string;
        status: string;
        author_id: string;
        requires_ack: boolean;
      };
    };
    if (row.instructions.status !== "envoyee") {
      return NextResponse.json(
        { success: false, error: `Instruction ${row.instructions.status} — avancement figé` },
        { status: 400 }
      );
    }
    if (row.instructions.requires_ack && !row.acked_at) {
      return NextResponse.json(
        { success: false, error: "Accusez d'abord réception de l'instruction" },
        { status: 400 }
      );
    }

    const { error } = await admin
      .from("instruction_recipients")
      .update({ status: body.status, status_note: body.note?.trim() || null })
      .eq("id", row.id);
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    if (body.status === "bloquee" || body.status === "soumise" || body.status === "terminee") {
      const name = [actorRow?.prenom, actorRow?.nom].filter(Boolean).join(" ") || "Un destinataire";
      const label =
        body.status === "bloquee" ? "signale un BLOCAGE" : body.status === "soumise" ? "soumet au contrôle" : "a terminé";
      await createNotification(
        row.instructions.author_id,
        "info",
        `${row.instructions.reference} — ${name} ${label}`,
        body.note?.trim() || row.instructions.subject,
        "/dashboard/instructions"
      );
    }
    await logAudit({
      userId: user.id,
      userRole: actorRow?.role || "",
      action: "instruction.avancement",
      entityType: "instructions",
      entityId: row.instructions.id,
      oldValue: { status: row.status },
      newValue: { status: body.status, note: body.note?.trim() || null },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[INSTRUCTIONS] status EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
