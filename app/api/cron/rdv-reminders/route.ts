import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { sendWhatsApp } from "@/lib/whatsapp";
import { tplRdvReminder } from "@/lib/whatsapp-templates";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// ─── Cron : rappel WhatsApp J-1 pour les RDV de demain ─────────────────────
// Déclenché par Vercel Cron tous les jours à 08:00 UTC (09:00 Bangui).
// Auth via Bearer CRON_SECRET (cohérent avec monthly-report).

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars manquantes");
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Format YYYY-MM-DD pour Supabase */
function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

interface AppointmentRow {
  id: string;
  reference: string;
  client_nom: string;
  client_telephone: string | null;
  service_type: string;
  rdv_heure: string;
  statut: string;
}

export async function GET(request: NextRequest) {
  try {
    // Auth Bearer
    const authHeader = request.headers.get("authorization");
    const expected = process.env.CRON_SECRET;
    if (!expected) {
      console.error("[CRON RDV-REMINDERS] CRON_SECRET non configuré");
      return NextResponse.json(
        { error: "Configuration manquante" },
        { status: 500 }
      );
    }
    if (authHeader !== `Bearer ${expected}`) {
      console.warn("[CRON RDV-REMINDERS] auth refusée");
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const admin = getAdminClient();

    // Date de demain (UTC pour cohérence cron)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const targetDate = toIsoDate(tomorrow);

    console.log(
      `[CRON RDV-REMINDERS] scan RDV pour ${targetDate}`
    );

    const { data, error } = await admin
      .from("appointments")
      .select(
        "id, reference, client_nom, client_telephone, service_type, rdv_heure, statut"
      )
      .eq("rdv_date", targetDate)
      .in("statut", ["en_attente", "confirme"]);

    if (error) {
      console.error("[CRON RDV-REMINDERS] query error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows = (data || []) as AppointmentRow[];
    const withPhone = rows.filter((r) => r.client_telephone);

    console.log(
      `[CRON RDV-REMINDERS] ${rows.length} RDV trouvés, ${withPhone.length} avec téléphone`
    );

    let sent = 0;
    let failed = 0;

    for (const rdv of withPhone) {
      const result = await sendWhatsApp(
        rdv.client_telephone!,
        tplRdvReminder({
          nom: rdv.client_nom,
          service: rdv.service_type,
          heure: rdv.rdv_heure,
          reference: rdv.reference,
        }),
        `rdv-reminder:${rdv.reference}`
      );
      if (result.success) sent += 1;
      else failed += 1;
    }

    console.log(
      `[CRON RDV-REMINDERS] ✅ envoyés=${sent} échoués=${failed} sur ${withPhone.length}`
    );

    return NextResponse.json({
      success: true,
      target_date: targetDate,
      total: rows.length,
      with_phone: withPhone.length,
      sent,
      failed,
    });
  } catch (err) {
    console.error("[CRON RDV-REMINDERS] EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
