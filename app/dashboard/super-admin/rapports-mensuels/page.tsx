import { CalendarClock } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import {
  RapportsMensuelsClient,
  type MonthlyReport,
  type RapportConfig,
} from "@/components/dashboard/RapportsMensuelsClient";

export const metadata = {
  title: "Rapports mensuels (CRON) | Super Admin",
};

export const dynamic = "force-dynamic";

// ─── Données mockées (table monthly_reports à créer en migration ultérieure) ─

const MOCK_CONFIG: RapportConfig = {
  cron_schedule: "0 6 1 * *",
  cron_label: "1er du mois à 06:00 (UTC)",
  next_run: "2026-06-01T06:00:00Z",
  recipients: [
    "tkankou@gmail.com",
    "patrick.mbongo@nexusrca.com",
    "marie.ngounio@nexusrca.com",
  ],
  format: "pdf",
  enabled: true,
};

const MOCK_REPORTS: MonthlyReport[] = [
  {
    id: "rpt_2026_04",
    period_label: "Avril 2026",
    period_start: "2026-04-01T00:00:00Z",
    period_end: "2026-04-30T23:59:59Z",
    generated_at: "2026-05-01T06:00:42Z",
    status: "sent",
    file_url: "#",
    file_size_kb: 312,
    recipients: [
      "tkankou@gmail.com",
      "patrick.mbongo@nexusrca.com",
      "marie.ngounio@nexusrca.com",
    ],
    metrics: {
      revenus_xaf: 8_450_000,
      nouvelles_demandes: 23,
      dossiers_clotures: 18,
      nouveaux_clients: 14,
      paiements_count: 27,
      taux_conversion: 78,
    },
  },
  {
    id: "rpt_2026_03",
    period_label: "Mars 2026",
    period_start: "2026-03-01T00:00:00Z",
    period_end: "2026-03-31T23:59:59Z",
    generated_at: "2026-04-01T06:00:38Z",
    status: "sent",
    file_url: "#",
    file_size_kb: 287,
    recipients: [
      "tkankou@gmail.com",
      "patrick.mbongo@nexusrca.com",
      "marie.ngounio@nexusrca.com",
    ],
    metrics: {
      revenus_xaf: 7_820_000,
      nouvelles_demandes: 19,
      dossiers_clotures: 15,
      nouveaux_clients: 11,
      paiements_count: 22,
      taux_conversion: 72,
    },
  },
  {
    id: "rpt_2026_02",
    period_label: "Février 2026",
    period_start: "2026-02-01T00:00:00Z",
    period_end: "2026-02-28T23:59:59Z",
    generated_at: "2026-03-01T06:00:15Z",
    status: "sent",
    file_url: "#",
    file_size_kb: 271,
    recipients: ["tkankou@gmail.com", "patrick.mbongo@nexusrca.com"],
    metrics: {
      revenus_xaf: 6_340_000,
      nouvelles_demandes: 16,
      dossiers_clotures: 12,
      nouveaux_clients: 9,
      paiements_count: 18,
      taux_conversion: 69,
    },
  },
  {
    id: "rpt_2026_01",
    period_label: "Janvier 2026",
    period_start: "2026-01-01T00:00:00Z",
    period_end: "2026-01-31T23:59:59Z",
    generated_at: "2026-02-01T06:01:22Z",
    status: "failed",
    recipients: ["tkankou@gmail.com", "patrick.mbongo@nexusrca.com"],
    metrics: {
      revenus_xaf: 5_120_000,
      nouvelles_demandes: 14,
      dossiers_clotures: 10,
      nouveaux_clients: 7,
      paiements_count: 15,
      taux_conversion: 65,
    },
    notes:
      "Échec d'envoi Resend (quota dépassé en sandbox). PDF généré mais non distribué — réessayer manuellement.",
  },
  {
    id: "rpt_2025_12",
    period_label: "Décembre 2025",
    period_start: "2025-12-01T00:00:00Z",
    period_end: "2025-12-31T23:59:59Z",
    generated_at: "2026-01-01T06:00:09Z",
    status: "sent",
    file_url: "#",
    file_size_kb: 295,
    recipients: ["tkankou@gmail.com"],
    metrics: {
      revenus_xaf: 9_780_000,
      nouvelles_demandes: 28,
      dossiers_clotures: 24,
      nouveaux_clients: 17,
      paiements_count: 32,
      taux_conversion: 84,
    },
    notes: "Mois record — pic visa pèlerinage + dossiers Canada rentrée 2026.",
  },
];

export default async function SuperAdminRapportsMensuelsPage() {
  const profile = await requireProfile(["super_admin"]);

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
            Génération PDF + envoi e-mail le 1er de chaque mois.
          </p>
        </div>
      </div>

      <RapportsMensuelsClient
        initialReports={MOCK_REPORTS}
        initialConfig={MOCK_CONFIG}
      />
    </DashboardShell>
  );
}
