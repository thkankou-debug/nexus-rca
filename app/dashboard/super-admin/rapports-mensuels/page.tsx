import { CalendarClock } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import {
  RapportsMensuelsClient,
  type MonthlyReport,
  type RapportConfig,
} from "@/components/dashboard/RapportsMensuelsClient";
import { getAdminSupabase } from "@/lib/monthly-report-data";

export const metadata = {
  title: "Rapports mensuels (CRON) | Super Admin",
};

export const dynamic = "force-dynamic";

const STORAGE_BUCKET = "monthly-reports";

const FR_MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

function defaultRecipients(): string[] {
  const env = (process.env.MONTHLY_REPORT_RECIPIENTS || "").trim();
  if (env) return env.split(",").map((s) => s.trim()).filter(Boolean);
  // Destinataires officiels : super_admin + email entreprise.
  return ["tkankou@gmail.com", "contact@nexusrca.com"];
}

function nextRunISO(): string {
  // Cron : 06:00 UTC le 1er de chaque mois.
  const now = new Date();
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 6, 0, 0));
  return next.toISOString();
}

interface DbReportRow {
  id: string;
  period_year: number;
  period_month: number;
  period_start: string;
  period_end: string;
  generated_at: string;
  status: "generated" | "sent" | "failed" | "queued";
  storage_path: string | null;
  file_size_bytes: number | null;
  recipients: string[] | null;
  metrics: Record<string, unknown> | null;
  error_message: string | null;
}

export default async function SuperAdminRapportsMensuelsPage() {
  const profile = await requireProfile(["super_admin"]);
  const supabase = createClient();

  // ─── Lecture des 24 derniers rapports ────────────────────────────────
  const { data: rows, error } = await supabase
    .from("monthly_reports")
    .select(
      "id, period_year, period_month, period_start, period_end, generated_at, status, storage_path, file_size_bytes, recipients, metrics, error_message"
    )
    .order("period_year", { ascending: false })
    .order("period_month", { ascending: false })
    .limit(24);

  if (error) {
    console.error("[rapports-mensuels page] error:", error.message);
  }

  // ─── Signed URLs (1h) pour les rapports stockés ──────────────────────
  const admin = getAdminSupabase();
  const reports: MonthlyReport[] = await Promise.all(
    ((rows || []) as DbReportRow[]).map(async (r) => {
      let file_url: string | undefined;
      if (r.storage_path) {
        const { data: urlData } = await admin.storage
          .from(STORAGE_BUCKET)
          .createSignedUrl(r.storage_path, 60 * 60);
        file_url = urlData?.signedUrl || undefined;
      }
      const m = (r.metrics as Record<string, number>) || {};
      const periodLabel = `${FR_MONTHS[r.period_month - 1]} ${r.period_year}`;
      return {
        id: r.id,
        period_label: periodLabel,
        period_start: r.period_start,
        period_end: r.period_end,
        generated_at: r.generated_at,
        status: r.status,
        file_url,
        file_size_kb: r.file_size_bytes
          ? Math.round(r.file_size_bytes / 1024)
          : undefined,
        recipients: r.recipients || [],
        metrics: {
          revenus_xaf: Number(m.revenus_xaf || 0),
          nouvelles_demandes: Number(m.nouvelles_demandes || 0),
          dossiers_clotures: Number(m.dossiers_clotures || 0),
          nouveaux_clients: Number(m.nouveaux_clients || 0),
          paiements_count: Number(m.paiements_count || 0),
          taux_conversion: 0, // non calculé en V1
        },
        notes: r.error_message || undefined,
      };
    })
  );

  const config: RapportConfig = {
    cron_schedule: "0 6 1 * *",
    cron_label: "1er du mois à 06:00 (UTC)",
    next_run: nextRunISO(),
    recipients: defaultRecipients(),
    format: "pdf",
    enabled: true,
  };

  return (
    <DashboardShell profile={profile}>
      <BackButton fallbackHref="/dashboard/super-admin" label="Retour au tableau de bord" />

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900 text-white shadow-lg">
          <CalendarClock className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-nexus-blue-950">
            Rapports mensuels — automatiques
          </h1>
          <p className="mt-1 text-slate-600">
            Génération PDF + envoi e-mail le 1er de chaque mois à 06:00 UTC.
          </p>
        </div>
      </div>

      <RapportsMensuelsClient initialReports={reports} initialConfig={config} />
    </DashboardShell>
  );
}
