// ============================================================================
// CRON — GET /api/cron/instruction-escalades (cahier §10.2, quotidien)
// Escalade des instructions EN RETARD : pour chaque instruction envoyée
// dont l'échéance est dépassée, notifier l'émetteur et les destinataires
// n'ayant pas terminé. Idempotent par jour : une seule relance par
// instruction et par jour (marqueur dans audit_log, vérifié avant envoi) —
// pas de délai contractuel inventé : l'échéance est celle saisie par
// l'émetteur sur chaque instruction.
// Auth via Bearer CRON_SECRET (patron rdv-reminders/monthly-report).
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createNotification } from "@/lib/notifications";
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

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const expected = process.env.CRON_SECRET;
    if (!expected) {
      console.error("[CRON ESCALADES] CRON_SECRET non configuré");
      return NextResponse.json({ error: "CRON_SECRET manquant" }, { status: 500 });
    }
    if (authHeader !== `Bearer ${expected}`) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const admin = getAdminClient();
    const today = new Date().toISOString().split("T")[0];

    const { data: overdue } = await admin
      .from("instructions")
      .select(
        "id, reference, subject, author_id, due_date, instruction_recipients(recipient_id, status)"
      )
      .eq("status", "envoyee")
      .not("due_date", "is", null)
      .lt("due_date", today);

    let escalated = 0;
    for (const ins of (overdue || []) as unknown as {
      id: string;
      reference: string;
      subject: string;
      author_id: string;
      due_date: string;
      instruction_recipients: { recipient_id: string; status: string }[];
    }[]) {
      // Idempotence par jour : un marqueur d'escalade dans audit_log.
      const { data: already } = await admin
        .from("audit_log")
        .select("id")
        .eq("entity_type", "instructions")
        .eq("entity_id", ins.id)
        .eq("action", "instruction.escalade")
        .gte("created_at", `${today}T00:00:00Z`)
        .limit(1);
      if (already && already.length > 0) continue;

      const laggards = ins.instruction_recipients.filter(
        (r) => r.status !== "terminee" && r.status !== "soumise"
      );

      await createNotification(
        ins.author_id,
        "info",
        `Instruction ${ins.reference} EN RETARD (échéance ${ins.due_date})`,
        `${ins.subject} — ${laggards.length} destinataire(s) n'ont pas terminé.`,
        "/dashboard/instructions"
      );
      await Promise.all(
        laggards.map((r) =>
          createNotification(
            r.recipient_id,
            "info",
            `Rappel — instruction ${ins.reference} en retard`,
            `Échéance ${ins.due_date} dépassée : ${ins.subject}`,
            "/dashboard/instructions"
          )
        )
      );
      await logAudit({
        userId: null,
        userRole: "system",
        action: "instruction.escalade",
        entityType: "instructions",
        entityId: ins.id,
        newValue: { due_date: ins.due_date, laggards: laggards.map((l) => l.recipient_id) },
      });
      escalated++;
    }

    console.log(`[CRON ESCALADES] ${escalated} instruction(s) escaladée(s)`);
    return NextResponse.json({ success: true, escalated });
  } catch (err) {
    console.error("[CRON ESCALADES] EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
