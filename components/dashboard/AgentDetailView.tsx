"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Wallet,
  Users,
  FileText,
  Send,
  Receipt,
  Clock,
  TrendingUp,
  Calendar,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================
export interface AgentDetailData {
  agent: {
    id: string;
    nom: string;
    prenom: string | null;
    email: string;
    role: string;
  };
  paiements: {
    id: string;
    reference: string | null;
    client_nom: string;
    service: string;
    montant_recu: number;
    devise: string;
    statut: string;
    date_paiement: string;
  }[];
  clients: {
    id: string;
    reference: string | null;
    nom: string;
    prenom: string | null;
    type: string;
    created_at: string;
  }[];
  demandes: {
    id: string;
    objet: string | null;
    service: string;
    statut: string;
    created_at: string;
  }[];
  transferts: {
    id: string;
    reference: string | null;
    expediteur_nom: string;
    beneficiaire_nom: string;
    beneficiaire_pays: string;
    montant_envoye: number;
    devise: string;
    statut: string;
    created_at: string;
  }[];
  depenses: {
    id: string;
    reference: string | null;
    motif: string;
    montant: number;
    devise: string;
    statut: string;
    date_depense: string;
  }[];
}

// ============================================================================
// HELPERS
// ============================================================================
function formatMoney(amount: number, currency = "XAF"): string {
  return `${Math.round(amount).toLocaleString("fr-FR")} ${currency}`;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function getRoleBadge(role: string): { label: string; color: string } {
  if (role === "super_admin")
    return { label: "Super admin", color: "bg-rose-100 text-rose-700" };
  if (role === "admin")
    return { label: "Admin", color: "bg-amber-100 text-amber-700" };
  return { label: "Agent", color: "bg-emerald-100 text-emerald-700" };
}

// ============================================================================
// COMPOSANT
// ============================================================================
export function AgentDetailView({ data }: { data: AgentDetailData }) {
  const { agent, paiements, clients, demandes, transferts, depenses } = data;

  const stats = useMemo(() => {
    const totalEncaisse = paiements.reduce(
      (s, p) => s + Number(p.montant_recu),
      0
    );
    const moyenneEncaissement =
      paiements.length > 0 ? totalEncaisse / paiements.length : 0;

    const depensesValidees = depenses
      .filter((d) => d.statut === "valide")
      .reduce((s, d) => s + Number(d.montant), 0);
    const depensesEnAttente = depenses.filter(
      (d) => d.statut === "en_attente"
    ).length;
    const depensesRejetees = depenses.filter(
      (d) => d.statut === "rejete"
    ).length;

    // Activite par mois sur les 6 derniers mois
    const last6Months: { month: string; encaisse: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const monthLabel = d.toLocaleDateString("fr-FR", {
        month: "short",
      });
      const total = paiements
        .filter((p) => {
          if (!p.date_paiement) return false;
          const pd = new Date(p.date_paiement);
          return (
            pd.getFullYear() === d.getFullYear() &&
            pd.getMonth() === d.getMonth()
          );
        })
        .reduce((s, p) => s + Number(p.montant_recu), 0);
      last6Months.push({ month: monthLabel, encaisse: total });
    }

    const allDates = [
      ...paiements.map((p) => p.date_paiement),
      ...clients.map((c) => c.created_at),
      ...demandes.map((d) => d.created_at),
      ...transferts.map((t) => t.created_at),
      ...depenses.map((d) => d.date_depense),
    ].filter(Boolean);

    const derniereActivite =
      allDates.length > 0
        ? allDates.reduce((max, d) =>
            new Date(d) > new Date(max) ? d : max
          )
        : null;

    return {
      totalEncaisse,
      moyenneEncaissement,
      depensesValidees,
      depensesEnAttente,
      depensesRejetees,
      last6Months,
      derniereActivite,
    };
  }, [paiements, clients, demandes, transferts, depenses]);

  const role = getRoleBadge(agent.role);
  const initials =
    (agent.prenom?.[0] ?? "") + (agent.nom?.[0] ?? "");
  const displayName = [agent.prenom, agent.nom].filter(Boolean).join(" ");

  // Recents
  const recentPaiements = [...paiements]
    .sort(
      (a, b) =>
        new Date(b.date_paiement).getTime() -
        new Date(a.date_paiement).getTime()
    )
    .slice(0, 5);

  const recentClients = [...clients]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 5);

  const recentTransferts = [...transferts]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 5);

  const maxMonth = Math.max(...stats.last6Months.map((m) => m.encaisse), 1);

  return (
    <div className="space-y-6">
      {/* HEADER AGENT */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-800 to-nexus-orange-500 text-xl font-bold text-white shadow-lg">
            {initials.toUpperCase() || "U"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-nexus-blue-950">
                {displayName || agent.nom || "—"}
              </h1>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-bold uppercase",
                  role.color
                )}
              >
                {role.label}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-600">{agent.email}</p>
            {stats.derniereActivite && (
              <p className="mt-2 inline-flex items-center gap-1 text-xs text-slate-500">
                <Clock className="h-3.5 w-3.5" />
                Dernière activité : {formatDate(stats.derniereActivite)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* STATS PRINCIPALES */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <BigStatCard
          icon={Wallet}
          label="Total encaissé"
          value={formatMoney(stats.totalEncaisse)}
          sub={`${paiements.length} paiement${paiements.length > 1 ? "s" : ""}`}
          accent="green"
        />
        <BigStatCard
          icon={TrendingUp}
          label="Moyenne / paiement"
          value={formatMoney(stats.moyenneEncaissement)}
          sub="Par transaction"
          accent="orange"
        />
        <BigStatCard
          icon={Users}
          label="Clients créés"
          value={clients.length.toString()}
          sub="Fiches enregistrées"
          accent="blue"
        />
        <BigStatCard
          icon={FileText}
          label="Demandes traitées"
          value={demandes.length.toString()}
          sub="Dossiers gérés"
          accent="purple"
        />
      </div>

      {/* STATS SECONDAIRES */}
      <div className="grid gap-4 sm:grid-cols-3">
        <BigStatCard
          icon={Send}
          label="Transferts initiés"
          value={transferts.length.toString()}
          sub={`${transferts.filter((t) => t.statut === "effectue").length} effectués`}
          accent="indigo"
        />
        <BigStatCard
          icon={Receipt}
          label="Dépenses soumises"
          value={depenses.length.toString()}
          sub={`${stats.depensesEnAttente} en attente · ${stats.depensesRejetees} rejetées`}
          accent="amber"
        />
        <BigStatCard
          icon={CheckCircle2}
          label="Dépenses validées"
          value={formatMoney(stats.depensesValidees)}
          sub={`${depenses.filter((d) => d.statut === "valide").length} dépense${depenses.filter((d) => d.statut === "valide").length > 1 ? "s" : ""}`}
          accent="green"
        />
      </div>

      {/* GRAPHIQUE 6 MOIS */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-nexus-orange-600" />
          <h2 className="font-display text-lg font-bold text-nexus-blue-950">
            Évolution des encaissements (6 derniers mois)
          </h2>
        </div>
        <div className="flex items-end justify-between gap-2 h-40">
          {stats.last6Months.map((m, i) => {
            const heightPct = maxMonth > 0 ? (m.encaisse / maxMonth) * 100 : 0;
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div className="relative flex-1 w-full flex items-end">
                  <div
                    className={cn(
                      "w-full rounded-t-lg transition-all",
                      m.encaisse > 0
                        ? "bg-gradient-to-t from-nexus-orange-500 to-nexus-orange-300"
                        : "bg-slate-100"
                    )}
                    style={{ height: `${Math.max(2, heightPct)}%` }}
                    title={formatMoney(m.encaisse)}
                  />
                </div>
                <span className="text-[10px] font-semibold uppercase text-slate-500">
                  {m.month}
                </span>
                <span className="text-[10px] text-slate-700">
                  {m.encaisse > 0 ? formatMoney(m.encaisse).replace(" XAF", "") : "—"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* DERNIERES OPERATIONS */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Paiements recents */}
        <SectionList
          title="Derniers paiements"
          icon={Wallet}
          color="orange"
          count={paiements.length}
          viewAllHref="/dashboard/super-admin/paiements"
        >
          {recentPaiements.length === 0 ? (
            <p className="p-6 text-center text-sm text-slate-500">
              Aucun paiement.
            </p>
          ) : (
            recentPaiements.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3 hover:bg-slate-50">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-nexus-blue-950">
                    {p.client_nom}
                  </p>
                  <p className="text-xs text-slate-500">
                    {p.service} · {formatDate(p.date_paiement)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-nexus-blue-950">
                    {formatMoney(Number(p.montant_recu), p.devise)}
                  </p>
                </div>
              </div>
            ))
          )}
        </SectionList>

        {/* Clients recents */}
        <SectionList
          title="Derniers clients"
          icon={Users}
          color="blue"
          count={clients.length}
          viewAllHref="/dashboard/super-admin/clients"
        >
          {recentClients.length === 0 ? (
            <p className="p-6 text-center text-sm text-slate-500">
              Aucun client créé.
            </p>
          ) : (
            recentClients.map((c) => {
              const name =
                c.type === "particulier"
                  ? [c.prenom, c.nom].filter(Boolean).join(" ")
                  : c.nom;
              return (
                <Link
                  key={c.id}
                  href={`/dashboard/super-admin/clients/${c.id}`}
                  className="flex items-center gap-3 p-3 transition hover:bg-slate-50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-nexus-blue-950">
                      {name || c.nom}
                    </p>
                    <p className="text-xs text-slate-500">
                      {c.reference} · {formatDate(c.created_at)}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </Link>
              );
            })
          )}
        </SectionList>

        {/* Transferts recents */}
        <SectionList
          title="Derniers transferts"
          icon={Send}
          color="purple"
          count={transferts.length}
          viewAllHref="/dashboard/super-admin/transferts"
        >
          {recentTransferts.length === 0 ? (
            <p className="p-6 text-center text-sm text-slate-500">
              Aucun transfert.
            </p>
          ) : (
            recentTransferts.map((t) => (
              <div key={t.id} className="flex items-center gap-3 p-3 hover:bg-slate-50">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 text-sm font-semibold text-nexus-blue-950">
                    <span className="truncate">{t.expediteur_nom}</span>
                    <ArrowRight className="h-3 w-3 shrink-0 text-slate-400" />
                    <span className="truncate">{t.beneficiaire_nom}</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {t.beneficiaire_pays} · {formatDate(t.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-nexus-blue-950">
                    {formatMoney(Number(t.montant_envoye), t.devise)}
                  </p>
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase",
                      t.statut === "effectue"
                        ? "bg-green-100 text-green-700"
                        : t.statut === "valide"
                        ? "bg-blue-100 text-blue-700"
                        : t.statut === "rejete"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                    )}
                  >
                    {t.statut}
                  </span>
                </div>
              </div>
            ))
          )}
        </SectionList>

        {/* Demandes recentes */}
        <SectionList
          title="Demandes récentes"
          icon={FileText}
          color="indigo"
          count={demandes.length}
          viewAllHref="/dashboard/super-admin/demandes"
        >
          {demandes.length === 0 ? (
            <p className="p-6 text-center text-sm text-slate-500">
              Aucune demande.
            </p>
          ) : (
            demandes.slice(0, 5).map((d) => (
              <div key={d.id} className="flex items-center gap-3 p-3 hover:bg-slate-50">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-nexus-blue-950">
                    {d.objet || d.service}
                  </p>
                  <p className="text-xs text-slate-500">
                    {d.service} · {formatDate(d.created_at)}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-700">
                  {d.statut}
                </span>
              </div>
            ))
          )}
        </SectionList>
      </div>
    </div>
  );
}

function BigStatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
  accent: "green" | "orange" | "blue" | "purple" | "indigo" | "amber";
}) {
  const colorMap = {
    green: "from-emerald-400 to-emerald-600",
    orange: "from-nexus-orange-400 to-nexus-orange-600",
    blue: "from-nexus-blue-600 to-nexus-blue-800",
    purple: "from-purple-500 to-purple-700",
    indigo: "from-indigo-500 to-indigo-700",
    amber: "from-amber-400 to-amber-600",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 truncate font-display text-xl font-bold text-nexus-blue-950">
            {value}
          </p>
          <p className="mt-1 text-xs text-slate-500">{sub}</p>
        </div>
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg",
            colorMap[accent]
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function SectionList({
  title,
  icon: Icon,
  color,
  count,
  viewAllHref,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: "orange" | "blue" | "purple" | "indigo";
  count: number;
  viewAllHref: string;
  children: React.ReactNode;
}) {
  const colorMap = {
    orange: "text-nexus-orange-600",
    blue: "text-nexus-blue-700",
    purple: "text-purple-600",
    indigo: "text-indigo-600",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 p-4">
        <div className="flex items-center gap-2">
          <Icon className={cn("h-5 w-5", colorMap[color])} />
          <h3 className="font-display text-base font-bold text-nexus-blue-950">
            {title}
          </h3>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
            {count}
          </span>
        </div>
        <Link
          href={viewAllHref}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-nexus-blue-950"
        >
          Voir tout
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="divide-y divide-slate-100">{children}</div>
    </div>
  );
}
