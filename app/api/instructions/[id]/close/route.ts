// ============================================================================
// API ROUTE — POST /api/instructions/:id/close
// Clôture ou annulation par l'ÉMETTEUR (§10.3 : « la clôture appartient à
// la personne habilitée à vérifier l'exécution ») — super_admin peut agir
// en supervision. Annulation avec motif obligatoire ; rien n'est supprimé.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getFinanceAdminClient } from "@/lib/finance-server";
import { createNotification } from "@/lib/notifications";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

interface Body {
  decision: "cloturee" | "annulee";
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
    const { data: actor } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const role = (actor as { role?: string } | null)?.role || "";

    const body = (await request.json().catch(() => null)) as Body | null;
    if (!body || !["cloturee", "annulee"].includes(body.decision)) {
      return NextResponse.json({ success: false, error: "decision requise (cloturee | annulee)" }, { status: 400 });
    }
    if (body.decision === "annulee" && !body.note?.trim()) {
      return NextResponse.json({ success: false, error: "Motif d'annulation requis" }, { status: 400 });
    }

    const admin = getFinanceAdminClient();
    const { data: instruction } = await admin
      .from("instructions")
      .select("id, reference, subject, status, author_id")
      .eq("id", params.id)
      .single();
    if (!instruction) {
      return NextResponse.json({ success: false, error: "Instruction introuvable" }, { status: 404 });
    }
    const row = instruction as { id: string; reference: string; subject: string; status: string; author_id: string };
    if (row.author_id !== user.id && role !== "super_admin") {
      return NextResponse.json(
        { success: false, error: "Seul l'émetteur (ou le super admin) clôt une instruction" },
        { status: 403 }
      );
    }
    if (row.status !== "envoyee") {
      return NextResponse.json({ success: false, error: `Instruction déjà ${row.status}` }, { status: 400 });
    }

    const { error } = await admin
      .from("instructions")
      .update({
        status: body.decision,
        closed_by: user.id,
        closed_at: new Date().toISOString(),
        close_note: body.decision === "cloturee" ? body.note?.trim() || null : null,
        cancel_reason: body.decision === "annulee" ? body.note!.trim() : null,
      })
      .eq("id", row.id);
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const { data: recipients } = await admin
      .from("instruction_recipients")
      .select("recipient_id")
      .eq("instruction_id", row.id);
    await Promise.all(
      ((recipients || []) as { recipient_id: string }[]).map((r) =>
        createNotification(
          r.recipient_id,
          "info",
          `Instruction ${row.reference} ${body.decision === "cloturee" ? "clôturée" : "annulée"}`,
          row.subject,
          "/dashboard/instructions"
        )
      )
    );
    await logAudit({
      userId: user.id,
      userRole: role,
      action: body.decision === "cloturee" ? "instruction.cloturee" : "instruction.annulee",
      entityType: "instructions",
      entityId: row.id,
      newValue: { note: body.note?.trim() || null },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[INSTRUCTIONS] close EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
