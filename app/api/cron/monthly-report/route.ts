import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient as createSsrClient } from "@/lib/supabase/server";
import {
  aggregateMonth,
  monthBoundsFor,
  previousMonthBounds,
  getAdminSupabase,
} from "@/lib/monthly-report-data";
import { buildMonthlyReportPdf } from "@/lib/monthly-report-pdf";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // s — agrégation + PDF + email peut dépasser 10s

const STORAGE_BUCKET = "monthly-reports";
const FROM_PRIMARY = "Nexus RCA <noreply@nexusrca.com>";
const FROM_FALLBACK = "Nexus RCA <onboarding@resend.dev>";

function defaultRecipients(): string[] {
  const env = (process.env.MONTHLY_REPORT_RECIPIENTS || "").trim();
  if (env) {
    return env
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }
  // Destinataires officiels (cf. décision 2026-05-05) :
  //   - tkankou@gmail.com    : super_admin
  //   - contact@nexusrca.com : email principal de l'entreprise
  return ["tkankou@gmail.com", "contact@nexusrca.com"];
}

function buildHtmlEmail(periodLabel: string, totals: {
  revenus_xaf: number;
  paiements_count: number;
  nouvelles_demandes: number;
  dossiers_clotures: number;
  nouveaux_clients: number;
}, downloadUrl: string | null): string {
  const fmt = (n: number) =>
    n.toLocaleString("fr-FR") + " XAF";
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f1f5f9;">
  <table cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f1f5f9;padding:24px 0;">
    <tr><td align="center">
      <table cellspacing="0" cellpadding="0" border="0" width="600" style="background:#fff;border-radius:16px;overflow:hidden;">
        <tr><td style="background:linear-gradient(135deg,#0C1C40 0%,#1a2a5e 100%);padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">Rapport mensuel — ${periodLabel}</h1>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <p style="margin:0 0 20px 0;font-size:15px;color:#0C1C40;">Bonjour,</p>
          <p style="margin:0 0 20px 0;font-size:14px;color:#475569;line-height:1.55;">
            Le rapport mensuel automatique pour <strong>${periodLabel}</strong> a été généré.
            Le PDF complet est en pièce jointe${downloadUrl ? " et téléchargeable via le lien ci-dessous" : ""}.
          </p>
          <table cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:16px 0 24px 0;border-collapse:collapse;">
            <tr><td style="padding:10px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;">Revenus encaissés (XAF)</td><td style="padding:10px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-size:13px;color:#0C1C40;text-align:right;font-weight:700;">${fmt(totals.revenus_xaf)}</td></tr>
            <tr><td style="padding:10px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;">Paiements</td><td style="padding:10px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#0C1C40;text-align:right;font-weight:700;">${totals.paiements_count}</td></tr>
            <tr><td style="padding:10px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;">Nouvelles demandes</td><td style="padding:10px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-size:13px;color:#0C1C40;text-align:right;font-weight:700;">${totals.nouvelles_demandes}</td></tr>
            <tr><td style="padding:10px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;">Dossiers clôturés</td><td style="padding:10px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#0C1C40;text-align:right;font-weight:700;">${totals.dossiers_clotures}</td></tr>
            <tr><td style="padding:10px;background:#f8fafc;font-size:13px;color:#64748b;">Nouveaux clients</td><td style="padding:10px;background:#f8fafc;font-size:13px;color:#0C1C40;text-align:right;font-weight:700;">${totals.nouveaux_clients}</td></tr>
          </table>
          ${downloadUrl
            ? `<p style="text-align:center;margin:24px 0;"><a href="${downloadUrl}" style="display:inline-block;background:#FF6600;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;">Télécharger le PDF</a><br/><span style="font-size:11px;color:#94a3b8;">Lien valable 7 jours</span></p>`
            : ""}
        </td></tr>
        <tr><td style="background:#0C1C40;padding:20px 40px;text-align:center;">
          <p style="margin:0;font-size:13px;font-weight:700;color:#fff;">NEXUS RCA</p>
          <p style="margin:4px 0;font-size:11px;color:#94a3b8;">+236 73 26 96 92 · contact@nexusrca.com</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

interface RunResult {
  success: boolean;
  reportId?: string;
  status: "sent" | "failed" | "generated";
  storage_path?: string | null;
  download_url?: string | null;
  error?: string;
  period_label: string;
}

async function runReport(opts: {
  year: number;
  month: number;
  trigger: "cron" | "manual";
  generatedBy: string | null;
}): Promise<RunResult> {
  const admin = getAdminSupabase();
  const bounds = monthBoundsFor(opts.year, opts.month);

  console.log(`[CRON_MONTHLY] START period=${bounds.label} trigger=${opts.trigger}`);

  // ── 1) Agrégation
  let summary;
  try {
    summary = await aggregateMonth(admin, bounds);
    console.log(`[CRON_MONTHLY] aggregate OK revenus_xaf=${summary.totals.revenus_xaf} paiements=${summary.totals.paiements_count}`);
  } catch (err) {
    console.error("[CRON_MONTHLY] aggregate FAILED:", err);
    await admin.from("monthly_reports").upsert(
      {
        period_year: bounds.year,
        period_month: bounds.month,
        period_start: bounds.start,
        period_end: bounds.end,
        generated_by: opts.generatedBy,
        trigger: opts.trigger,
        status: "failed",
        recipients: defaultRecipients(),
        metrics: {},
        error_message: err instanceof Error ? err.message : "Erreur agrégation",
      },
      { onConflict: "period_year,period_month" }
    );
    return {
      success: false,
      status: "failed",
      period_label: bounds.label,
      error: "Erreur agrégation",
    };
  }

  // ── 2) Génération PDF
  let pdfBytes: Uint8Array;
  try {
    pdfBytes = await buildMonthlyReportPdf(summary);
    console.log(`[CRON_MONTHLY] pdf OK size=${pdfBytes.byteLength}o`);
  } catch (err) {
    console.error("[CRON_MONTHLY] pdf FAILED:", err);
    await admin.from("monthly_reports").upsert(
      {
        period_year: bounds.year,
        period_month: bounds.month,
        period_start: bounds.start,
        period_end: bounds.end,
        generated_by: opts.generatedBy,
        trigger: opts.trigger,
        status: "failed",
        recipients: defaultRecipients(),
        metrics: summary.totals as unknown as Record<string, unknown>,
        error_message: err instanceof Error ? err.message : "Erreur génération PDF",
      },
      { onConflict: "period_year,period_month" }
    );
    return {
      success: false,
      status: "failed",
      period_label: bounds.label,
      error: "Erreur génération PDF",
    };
  }

  // ── 3) Upload Storage
  const filename = `rapport-mensuel-${bounds.year}-${String(bounds.month).padStart(2, "0")}.pdf`;
  const storagePath = `${bounds.year}/${filename}`;
  let storageOk = false;
  try {
    const { error: upErr } = await admin.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, pdfBytes, {
        contentType: "application/pdf",
        upsert: true,
      });
    if (upErr) {
      console.error("[CRON_MONTHLY] storage upload FAILED:", upErr.message);
    } else {
      storageOk = true;
      console.log(`[CRON_MONTHLY] storage upload OK path=${storagePath}`);
    }
  } catch (err) {
    console.error("[CRON_MONTHLY] storage exception:", err);
  }

  // ── 4) Signed URL (7 jours) pour le mail
  let downloadUrl: string | null = null;
  if (storageOk) {
    try {
      const { data: urlData, error: urlErr } = await admin.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(storagePath, 7 * 24 * 60 * 60);
      if (urlErr) {
        console.error("[CRON_MONTHLY] signed URL FAILED:", urlErr.message);
      } else {
        downloadUrl = urlData?.signedUrl || null;
      }
    } catch (err) {
      console.error("[CRON_MONTHLY] signed URL exception:", err);
    }
  }

  // ── 5) Envoi email (Resend)
  const recipients = defaultRecipients();
  let emailOk = false;
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const html = buildHtmlEmail(bounds.label, summary.totals, downloadUrl);
    const attachments = [
      {
        filename,
        content: Buffer.from(pdfBytes).toString("base64"),
      },
    ];

    try {
      const result = await resend.emails.send({
        from: FROM_PRIMARY,
        to: recipients,
        subject: `Rapport mensuel Nexus RCA — ${bounds.label}`,
        html,
        attachments,
      });
      if (!result.error) {
        emailOk = true;
        console.log("[CRON_MONTHLY] email PRIMARY OK id=", result.data?.id);
      } else {
        console.error("[CRON_MONTHLY] email PRIMARY error:", result.error);
        // Fallback
        const r2 = await resend.emails.send({
          from: FROM_FALLBACK,
          to: recipients,
          subject: `Rapport mensuel Nexus RCA — ${bounds.label}`,
          html,
          attachments,
        });
        if (!r2.error) {
          emailOk = true;
          console.log("[CRON_MONTHLY] email FALLBACK OK id=", r2.data?.id);
        } else {
          console.error("[CRON_MONTHLY] email FALLBACK error:", r2.error);
        }
      }
    } catch (err) {
      console.error("[CRON_MONTHLY] email exception:", err);
    }
  } else {
    console.warn("[CRON_MONTHLY] RESEND_API_KEY absente, skip email");
  }

  // ── 6) Persistance row monthly_reports (UPSERT par (year, month))
  const status: "sent" | "generated" | "failed" =
    emailOk ? "sent" : storageOk ? "generated" : "failed";

  const { data: upserted, error: insertErr } = await admin
    .from("monthly_reports")
    .upsert(
      {
        period_year: bounds.year,
        period_month: bounds.month,
        period_start: bounds.start,
        period_end: bounds.end,
        generated_at: new Date().toISOString(),
        generated_by: opts.generatedBy,
        trigger: opts.trigger,
        status,
        storage_path: storageOk ? storagePath : null,
        file_size_bytes: pdfBytes.byteLength,
        recipients,
        metrics: {
          ...summary.totals,
          rdv_count: summary.rdvCount,
          rdv_termines: summary.rdvTermines,
          paiements_par_devise: summary.paiements,
          caisse_par_devise: summary.caisse,
        } as unknown as Record<string, unknown>,
        error_message: status === "failed" ? "PDF/Storage/Email partiellement KO" : null,
      },
      { onConflict: "period_year,period_month" }
    )
    .select("id")
    .single();

  if (insertErr) {
    console.error("[CRON_MONTHLY] upsert monthly_reports FAILED:", insertErr.message);
    return {
      success: false,
      status: "failed",
      period_label: bounds.label,
      error: insertErr.message,
    };
  }

  console.log(`[CRON_MONTHLY] DONE status=${status} id=${upserted?.id}`);

  return {
    success: true,
    reportId: upserted?.id,
    status,
    storage_path: storageOk ? storagePath : null,
    download_url: downloadUrl,
    period_label: bounds.label,
  };
}

// ─── GET (cron Vercel) ──────────────────────────────────────────────────────
// Vercel envoie `Authorization: Bearer $CRON_SECRET` automatiquement.
// On exécute le rapport pour le mois précédent.
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET) {
    return NextResponse.json(
      { error: "CRON_SECRET non configuré côté serveur" },
      { status: 500 }
    );
  }
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn("[CRON_MONTHLY] GET auth refused");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bounds = previousMonthBounds(new Date());
  const result = await runReport({
    year: bounds.year,
    month: bounds.month,
    trigger: "cron",
    generatedBy: null,
  });
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}

// ─── POST (déclenchement manuel super_admin) ────────────────────────────────
// Body optionnel : { year, month } sinon = mois précédent.
export async function POST(request: NextRequest) {
  // Auth Supabase user
  const supabase = createSsrClient();
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
  if (!profile || (profile.role !== "super_admin" && profile.role !== "admin")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  let year: number | undefined;
  let month: number | undefined;
  try {
    const body = await request.json().catch(() => ({}));
    if (typeof body?.year === "number" && typeof body?.month === "number") {
      year = body.year;
      month = body.month;
    }
  } catch {
    // ignore
  }

  let bounds;
  if (year && month) {
    bounds = monthBoundsFor(year, month);
  } else {
    bounds = previousMonthBounds(new Date());
  }

  const result = await runReport({
    year: bounds.year,
    month: bounds.month,
    trigger: "manual",
    generatedBy: profile.id,
  });
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}

