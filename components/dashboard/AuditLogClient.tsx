"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Filter,
  Download,
  Activity,
  AlertTriangle,
  Info,
  ShieldAlert,
  User as UserIcon,
  Settings as SettingsIcon,
  CreditCard,
  FileText,
  LogIn,
  Mail,
  RotateCw,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

export interface AuditEntry {
  id: string;
  created_at: string;
  actor: string;
  actor_role: "super_admin" | "admin" | "agent" | "client" | "system";
  event_type: string;
  target: string;
  description: string;
  severity: "info" | "low" | "medium" | "high";
  ip?: string;
}

const EVENT_ICONS: Record<string, LucideIcon> = {
  role_change: ShieldAlert,
  user_invite: Mail,
  user_disable: XCircle,
  login_admin: LogIn,
  login_failed: AlertTriangle,
  paiement_create: CreditCard,
  paiement_validate: CreditCard,
  paiement_void: XCircle,
  stripe_webhook: CreditCard,
  dossier_assign: FileText,
  demande_force_close: XCircle,
  client_create: UserIcon,
  rdv_create: FileText,
  rapport_mensuel_generated: FileText,
  service_config_update: SettingsIcon,
  agence_settings_update: SettingsIcon,
  config_export: Download,
  export_data: Download,
};

const EVENT_LABELS: Record<string, string> = {
  role_change: "Changement de rôle",
  user_invite: "Invitation utilisateur",
  user_disable: "Désactivation compte",
  login_admin: "Connexion admin",
  login_failed: "Connexion échouée",
  paiement_create: "Création paiement",
  paiement_validate: "Validation paiement",
  paiement_void: "Annulation paiement",
  stripe_webhook: "Webhook Stripe",
  dossier_assign: "Assignation dossier",
  demande_force_close: "Clôture forcée",
  client_create: "Création client",
  rdv_create: "Création RDV",
  rapport_mensuel_generated: "Rapport mensuel généré",
  service_config_update: "Modif. config service",
  agence_settings_update: "Modif. paramètres agence",
  config_export: "Export configuration",
  export_data: "Export de données",
};

const SEVERITY_CLASS: Record<AuditEntry["severity"], string> = {
  info: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  low: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  high: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
};

const ROLE_CLASS: Record<AuditEntry["actor_role"], string> = {
  super_admin: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  admin: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  agent: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  client: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  system: "bg-slate-200 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300",
};

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function AuditLogClient({ initialEntries }: { initialEntries: AuditEntry[] }) {
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const eventTypes = useMemo(
    () => Array.from(new Set(initialEntries.map((e) => e.event_type))).sort(),
    [initialEntries]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return initialEntries.filter((e) => {
      if (q) {
        const hay = [e.actor, e.target, e.description, e.event_type].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (eventFilter !== "all" && e.event_type !== eventFilter) return false;
      if (severityFilter !== "all" && e.severity !== severityFilter) return false;
      if (roleFilter !== "all" && e.actor_role !== roleFilter) return false;
      return true;
    });
  }, [initialEntries, search, eventFilter, severityFilter, roleFilter]);

  const stats = useMemo(() => {
    return {
      total: initialEntries.length,
      high: initialEntries.filter((e) => e.severity === "high").length,
      today: initialEntries.filter((e) => {
        const d = new Date(e.created_at);
        const now = new Date();
        return d.toDateString() === now.toDateString();
      }).length,
      systemEvents: initialEntries.filter((e) => e.actor_role === "system").length,
    };
  }, [initialEntries]);

  const handleExportCsv = () => {
    const headers = ["timestamp", "actor", "actor_role", "event_type", "target", "description", "severity", "ip"];
    const rows = filtered.map((e) => [
      e.created_at,
      e.actor,
      e.actor_role,
      e.event_type,
      e.target,
      e.description.replace(/"/g, '""'),
      e.severity,
      e.ip ?? "",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${filtered.length} entrées exportées`);
  };

  return (
    <div className="space-y-6">
      {/* ─── Stats summary ───────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total entrées" value={stats.total} icon={Activity} accent="blue" />
        <StatCard label="Sévérité haute" value={stats.high} icon={ShieldAlert} accent="rose" />
        <StatCard label="Aujourd'hui" value={stats.today} icon={Info} accent="emerald" />
        <StatCard label="Événements système" value={stats.systemEvents} icon={SettingsIcon} accent="slate" />
      </div>

      {/* ─── Filtres + Export ────────────────────────────────── */}
      <section className="rounded-3xl border border-line bg-surface-elevated p-5 shadow-elev-2 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-brand" />
            <h2 className="font-display text-headline text-ink">Filtres</h2>
          </div>
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 rounded-full bg-nexus-blue-950 px-4 py-2 text-body-sm font-semibold text-white shadow-elev-2 transition hover:bg-nexus-blue-900 dark:bg-brand dark:hover:bg-brand-hover"
          >
            <Download className="h-4 w-4" />
            Export CSV ({filtered.length})
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher acteur, cible, description…"
              className="w-full rounded-xl border border-line-strong bg-surface-elevated py-2.5 pl-10 pr-3 text-body-sm text-ink placeholder:text-ink-subtle focus:border-brand focus:outline-none"
            />
          </div>

          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="rounded-xl border border-line-strong bg-surface-elevated px-3 py-2.5 text-body-sm text-ink focus:border-brand focus:outline-none"
          >
            <option value="all">Tous les événements</option>
            {eventTypes.map((t) => (
              <option key={t} value={t}>
                {EVENT_LABELS[t] ?? t}
              </option>
            ))}
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="rounded-xl border border-line-strong bg-surface-elevated px-3 py-2.5 text-body-sm text-ink focus:border-brand focus:outline-none"
          >
            <option value="all">Toutes sévérités</option>
            <option value="high">Haute</option>
            <option value="medium">Moyenne</option>
            <option value="low">Faible</option>
            <option value="info">Info</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-line-strong bg-surface-elevated px-3 py-2.5 text-body-sm text-ink focus:border-brand focus:outline-none"
          >
            <option value="all">Tous les rôles</option>
            <option value="super_admin">Super admin</option>
            <option value="admin">Admin</option>
            <option value="agent">Agent</option>
            <option value="client">Client</option>
            <option value="system">Système</option>
          </select>
        </div>
      </section>

      {/* ─── Tableau ──────────────────────────────────────────── */}
      <section className="overflow-hidden rounded-3xl border border-line bg-surface-elevated shadow-elev-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-sunken text-ink-muted">
              <Search className="h-6 w-6" />
            </div>
            <p className="font-display text-headline text-ink">Aucune entrée</p>
            <p className="mt-1 text-caption text-ink-muted">Modifiez vos filtres ou la recherche.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-line bg-surface-sunken">
                <tr className="text-left">
                  <th className="px-5 py-3 text-overline text-ink-muted">Date/heure</th>
                  <th className="px-5 py-3 text-overline text-ink-muted">Acteur</th>
                  <th className="px-5 py-3 text-overline text-ink-muted">Événement</th>
                  <th className="px-5 py-3 text-overline text-ink-muted">Cible</th>
                  <th className="px-5 py-3 text-overline text-ink-muted">Description</th>
                  <th className="px-5 py-3 text-overline text-ink-muted">Sév.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((entry) => {
                  const Icon = EVENT_ICONS[entry.event_type] ?? Activity;
                  const eventLabel = EVENT_LABELS[entry.event_type] ?? entry.event_type;
                  return (
                    <tr key={entry.id} className="transition hover:bg-surface-sunken">
                      <td className="whitespace-nowrap px-5 py-4 text-caption text-ink">
                        {formatDateTime(entry.created_at)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-body-sm font-semibold text-ink">{entry.actor}</span>
                          <span
                            className={cn(
                              "inline-flex w-fit items-center rounded-full px-2 py-0.5 text-overline",
                              ROLE_CLASS[entry.actor_role]
                            )}
                          >
                            {entry.actor_role}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-brand" />
                          <span className="text-body-sm text-ink">{eventLabel}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-md bg-surface-sunken px-2 py-1 font-mono text-caption text-ink">
                          {entry.target}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-body-sm text-ink-muted">{entry.description}</td>
                      <td className="px-5 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-overline",
                            SEVERITY_CLASS[entry.severity]
                          )}
                        >
                          {entry.severity}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="text-caption text-ink-muted">
        ⚠️ Données mockées en attendant la création de la table <code className="rounded bg-surface-sunken px-1 font-mono">audit_log</code>{" "}
        + writers sur les actions sensibles. Lecture super_admin uniquement (RLS strict).
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  accent: "blue" | "rose" | "emerald" | "slate";
}) {
  const ACCENT_BG: Record<typeof accent, string> = {
    blue: "from-nexus-blue-100 to-nexus-blue-50 text-nexus-blue-700 dark:from-blue-500/15 dark:to-blue-500/10 dark:text-blue-300",
    rose: "from-rose-100 to-rose-50 text-rose-700 dark:from-rose-500/15 dark:to-rose-500/10 dark:text-rose-300",
    emerald:
      "from-emerald-100 to-emerald-50 text-emerald-700 dark:from-emerald-500/15 dark:to-emerald-500/10 dark:text-emerald-300",
    slate: "from-slate-100 to-slate-50 text-slate-700 dark:from-slate-500/15 dark:to-slate-500/10 dark:text-slate-300",
  };
  return (
    <div className="rounded-3xl border border-line bg-surface-elevated p-5 shadow-elev-1">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-caption text-ink-muted">{label}</p>
          <p className="mt-1 font-display text-display-sm text-ink">{value}</p>
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br", ACCENT_BG[accent])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
