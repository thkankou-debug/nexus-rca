"use client";

import { useMemo, useState } from "react";
import {
  Download,
  FileBarChart,
  Mail,
  Sparkles,
  CalendarClock,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  TrendingUp,
  Users as UsersIcon,
  CreditCard,
  FileText,
  Settings as SettingsIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

export interface MonthlyReport {
  id: string;
  period_label: string; // ex: "Avril 2026"
  period_start: string; // ISO
  period_end: string;
  generated_at: string;
  status: "generated" | "sent" | "failed" | "queued";
  file_url?: string;
  file_size_kb?: number;
  recipients: string[];
  metrics: {
    revenus_xaf: number;
    nouvelles_demandes: number;
    dossiers_clotures: number;
    nouveaux_clients: number;
    paiements_count: number;
    taux_conversion: number; // %
  };
  notes?: string;
}

export interface RapportConfig {
  cron_schedule: string; // ex: "0 6 1 * *"
  cron_label: string;
  next_run: string;
  recipients: string[];
  format: "pdf";
  enabled: boolean;
}

const STATUS_META: Record<
  MonthlyReport["status"],
  { label: string; class: string; Icon: typeof CheckCircle2 }
> = {
  generated: {
    label: "Généré",
    class: "bg-blue-100 text-blue-700",
    Icon: FileBarChart,
  },
  sent: {
    label: "Envoyé",
    class: "bg-emerald-100 text-emerald-700",
    Icon: CheckCircle2,
  },
  queued: {
    label: "En attente",
    class: "bg-amber-100 text-amber-700",
    Icon: Clock,
  },
  failed: {
    label: "Échec",
    class: "bg-rose-100 text-rose-700",
    Icon: AlertTriangle,
  },
};

function formatXAF(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface Props {
  initialReports: MonthlyReport[];
  initialConfig: RapportConfig;
}

export function RapportsMensuelsClient({ initialReports, initialConfig }: Props) {
  const [reports, setReports] = useState<MonthlyReport[]>(initialReports);
  const [config, setConfig] = useState<RapportConfig>(initialConfig);
  const [generating, setGenerating] = useState(false);

  const stats = useMemo(() => {
    const total = reports.length;
    const sent = reports.filter((r) => r.status === "sent").length;
    const failed = reports.filter((r) => r.status === "failed").length;
    const lastRevenue = reports[0]?.metrics.revenus_xaf ?? 0;
    return { total, sent, failed, lastRevenue };
  }, [reports]);

  function handleGenerateNow() {
    setGenerating(true);
    toast.loading("Génération du rapport en cours…", { id: "gen-report" });

    setTimeout(() => {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const periodLabel = monthStart.toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
      });

      const newReport: MonthlyReport = {
        id: `rpt_${Date.now()}`,
        period_label: periodLabel.charAt(0).toUpperCase() + periodLabel.slice(1),
        period_start: monthStart.toISOString(),
        period_end: now.toISOString(),
        generated_at: now.toISOString(),
        status: "sent",
        file_url: "#",
        file_size_kb: 248,
        recipients: config.recipients,
        metrics: {
          revenus_xaf: 4_250_000,
          nouvelles_demandes: 12,
          dossiers_clotures: 8,
          nouveaux_clients: 6,
          paiements_count: 14,
          taux_conversion: 67,
        },
        notes: "Génération manuelle depuis la console super-admin.",
      };

      setReports((prev) => [newReport, ...prev]);
      setGenerating(false);
      toast.success("Rapport généré et envoyé aux destinataires", {
        id: "gen-report",
      });
    }, 1400);
  }

  function handleDownload(r: MonthlyReport) {
    if (r.status === "failed" || !r.file_url) {
      toast.error("Aucun fichier disponible pour ce rapport");
      return;
    }
    toast.success(`Téléchargement : ${r.period_label} (mock)`);
  }

  function handleResend(r: MonthlyReport) {
    toast.success(`Renvoi à ${r.recipients.length} destinataire(s) (mock)`);
  }

  function handleToggleEnabled() {
    setConfig((c) => ({ ...c, enabled: !c.enabled }));
    toast.success(
      !config.enabled
        ? "Génération automatique activée"
        : "Génération automatique désactivée"
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Stats summary ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          icon={FileBarChart}
          label="Rapports générés"
          value={String(stats.total)}
          tone="blue"
        />
        <StatTile
          icon={CheckCircle2}
          label="Envoyés avec succès"
          value={String(stats.sent)}
          tone="emerald"
        />
        <StatTile
          icon={AlertTriangle}
          label="Échecs"
          value={String(stats.failed)}
          tone="rose"
        />
        <StatTile
          icon={TrendingUp}
          label="Dernier revenu mensuel"
          value={formatXAF(stats.lastRevenue)}
          tone="orange"
        />
      </div>

      {/* ─── Configuration CRON ────────────────────────────────────── */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900 text-white">
              <CalendarClock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-nexus-blue-950">
                Génération automatique
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                CRON Vercel — exécuté chaque mois.
              </p>
            </div>
          </div>
          <label className="flex cursor-pointer items-center gap-3">
            <span
              className={cn(
                "text-xs font-semibold",
                config.enabled ? "text-emerald-600" : "text-slate-400"
              )}
            >
              {config.enabled ? "Activé" : "Désactivé"}
            </span>
            <button
              type="button"
              onClick={handleToggleEnabled}
              role="switch"
              aria-checked={config.enabled}
              className={cn(
                "relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors",
                config.enabled ? "bg-emerald-500" : "bg-slate-300"
              )}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
                  config.enabled ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <ConfigCard label="Planification" value={config.cron_label} mono={config.cron_schedule} />
          <ConfigCard label="Prochaine exécution" value={formatDateTime(config.next_run)} />
          <ConfigCard
            label="Destinataires"
            value={`${config.recipients.length} adresse${config.recipients.length > 1 ? "s" : ""}`}
            extra={config.recipients.join(", ")}
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Sparkles className="h-4 w-4 text-nexus-orange-500" />
            Vous pouvez générer un rapport manuellement à tout moment.
          </div>
          <button
            type="button"
            onClick={handleGenerateNow}
            disabled={generating}
            className="inline-flex items-center gap-2 rounded-lg bg-nexus-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-nexus-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Génération…
              </>
            ) : (
              <>
                <FileBarChart className="h-4 w-4" />
                Générer maintenant
              </>
            )}
          </button>
        </div>
      </section>

      {/* ─── Historique des rapports ───────────────────────────────── */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-nexus-blue-950">
              Historique des rapports
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {reports.length} rapport{reports.length > 1 ? "s" : ""} archivé
              {reports.length > 1 ? "s" : ""}.
            </p>
          </div>
        </div>

        {reports.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-slate-500">
            Aucun rapport pour l&apos;instant.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {reports.map((r) => {
              const meta = STATUS_META[r.status];
              const StatusIcon = meta.Icon;
              return (
                <li key={r.id} className="px-6 py-5 transition-colors hover:bg-slate-50">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900 text-white shadow-sm">
                        <FileBarChart className="h-6 w-6" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display text-base font-semibold text-nexus-blue-950">
                            {r.period_label}
                          </h3>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                              meta.class
                            )}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {meta.label}
                          </span>
                          {r.file_size_kb && (
                            <span className="text-xs text-slate-400">
                              · {r.file_size_kb} Ko
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          Période : {formatDate(r.period_start)} → {formatDate(r.period_end)}{" "}
                          · Généré le {formatDateTime(r.generated_at)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Envoyé à : {r.recipients.join(", ")}
                        </p>
                        {r.notes && (
                          <p className="mt-2 rounded-md bg-amber-50 px-2 py-1 text-xs italic text-amber-800">
                            {r.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleResend(r)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        Renvoyer
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownload(r)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-nexus-blue-950 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-nexus-blue-900"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Télécharger
                      </button>
                    </div>
                  </div>

                  {/* Metrics inline */}
                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 md:grid-cols-6">
                    <Metric icon={CreditCard} label="Revenus" value={formatXAF(r.metrics.revenus_xaf)} />
                    <Metric icon={FileText} label="Demandes" value={r.metrics.nouvelles_demandes.toString()} />
                    <Metric icon={CheckCircle2} label="Clôtures" value={r.metrics.dossiers_clotures.toString()} />
                    <Metric icon={UsersIcon} label="Nouveaux clients" value={r.metrics.nouveaux_clients.toString()} />
                    <Metric icon={CreditCard} label="Paiements" value={r.metrics.paiements_count.toString()} />
                    <Metric icon={TrendingUp} label="Conversion" value={`${r.metrics.taux_conversion}%`} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ─── Note technique ───────────────────────────────────────── */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
        <strong>Note technique :</strong> données mockées. La table{" "}
        <code className="rounded bg-amber-100 px-1 py-0.5 font-mono">monthly_reports</code>{" "}
        + le job CRON Vercel (Puppeteer/react-pdf + Resend) seront ajoutés en
        Phase 8. Les actions <em>Générer / Renvoyer / Télécharger</em> sont
        actuellement simulées.
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────

function StatTile({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof FileBarChart;
  label: string;
  value: string;
  tone: "blue" | "emerald" | "rose" | "orange";
}) {
  const toneClass: Record<typeof tone, string> = {
    blue: "from-blue-500 to-blue-700",
    emerald: "from-emerald-500 to-emerald-700",
    rose: "from-rose-500 to-rose-700",
    orange: "from-nexus-orange-500 to-nexus-orange-700",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white",
            toneClass[tone]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="truncate font-display text-xl font-bold text-nexus-blue-950">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function ConfigCard({
  label,
  value,
  mono,
  extra,
}: {
  label: string;
  value: string;
  mono?: string;
  extra?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 font-display text-base font-semibold text-nexus-blue-950">
        {value}
      </p>
      {mono && (
        <code className="mt-1 inline-block rounded bg-white px-2 py-0.5 font-mono text-xs text-slate-600 ring-1 ring-slate-200">
          {mono}
        </code>
      )}
      {extra && (
        <p className="mt-1 truncate text-xs text-slate-500" title={extra}>
          {extra}
        </p>
      )}
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FileBarChart;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className="truncate text-sm font-semibold text-nexus-blue-950">{value}</p>
      </div>
    </div>
  );
}
