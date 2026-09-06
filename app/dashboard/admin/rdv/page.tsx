import Link from "next/link";
import { Calendar, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Rendez-vous | Admin",
};

export const dynamic = "force-dynamic";

function formatDateLong(dateStr: string): string {
  try {
    const d = new Date(dateStr + (dateStr.includes("T") ? "" : "T00:00:00"));
    return d.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function getStatusInfo(statut: string) {
  switch (statut) {
    case "en_attente":
      return { label: "En attente", color: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300", icon: Clock };
    case "confirme":
      return { label: "Confirmé", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300", icon: CheckCircle2 };
    case "annule_client":
    case "annule_agent":
    case "absent":
      return { label: "Annulé", color: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300", icon: XCircle };
    case "termine":
      return { label: "Terminé", color: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300", icon: CheckCircle2 };
    default:
      return { label: statut, color: "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300", icon: AlertCircle };
  }
}

export default async function AdminRdvPage() {
  const profile = await requireProfile(["admin", "super_admin"]);
  const supabase = createClient();

  // Charger tous les RDV des 30 derniers jours + futurs (90 jours)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const past30 = new Date(today);
  past30.setDate(past30.getDate() - 30);
  const future90 = new Date(today);
  future90.setDate(future90.getDate() + 90);

  // D3 : appointments est la table canonique (rendez_vous est obsolète,
  // voir migration 054 ; cette page lisait auparavant appointment_requests
  // avec des colonnes inexistantes — toujours vide en silence).
  const { data: rdvData, error } = await supabase
    .from("appointments")
    .select("id, rdv_date, rdv_heure, client_nom, client_telephone, service_type, statut")
    .gte("rdv_date", past30.toISOString().split("T")[0])
    .lte("rdv_date", future90.toISOString().split("T")[0])
    .order("rdv_date", { ascending: true })
    .order("rdv_heure", { ascending: true });

  if (error) {
    console.error("Erreur RDV (appointments) :", error.message);
  }

  type RdvRow = {
    id: string;
    rdv_date: string;
    rdv_heure: string;
    client_nom: string;
    client_telephone: string | null;
    service_type: string;
    statut: string;
  };
  const rdvs = (rdvData || []) as RdvRow[];

  // Grouper par date
  const byDate = new Map<string, RdvRow[]>();
  for (const r of rdvs) {
    const key = r.rdv_date;
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key)!.push(r);
  }
  const sortedDates = Array.from(byDate.keys()).sort();

  return (
    <DashboardShell profile={profile}>
      <BackButton fallbackHref="/dashboard/admin" label="Retour au tableau de bord" />

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900 text-white shadow-lg">
          <Calendar className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-nexus-blue-950">
            Rendez-vous
          </h1>
          <p className="mt-1 text-slate-600">
            Calendrier équipe : 30 derniers jours + 90 jours à venir.
          </p>
        </div>
      </div>

      {sortedDates.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="Aucun rendez-vous"
          description="Aucun rendez-vous prévu sur la période."
        />
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => {
            const list = byDate.get(date)!;
            return (
              <section
                key={date}
                className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2"
              >
                <h2 className="mb-4 font-display text-headline text-ink">
                  {formatDateLong(date)} <span className="text-caption text-ink-muted">({list.length})</span>
                </h2>
                <ul className="space-y-2">
                  {list.map((r) => {
                    const info = getStatusInfo(r.statut);
                    const Icon = info.icon;
                    return (
                      <li
                        key={r.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface-sunken px-4 py-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="rounded-lg bg-brand-subtle px-2.5 py-1 text-overline text-brand">
                            {r.rdv_heure}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-body-sm font-semibold text-ink">
                              {r.client_nom || "Anonyme"}
                            </p>
                            <p className="truncate text-caption text-ink-muted">
                              {r.service_type || "—"} {r.client_telephone ? `· ${r.client_telephone}` : ""}
                            </p>
                          </div>
                        </div>
                        <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-overline", info.color)}>
                          <Icon className="h-3 w-3" />
                          {info.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      <p className="mt-6 text-caption text-ink-muted">
        Pour la gestion fine des rendez-vous (création, annulation, redispatch), voir{" "}
        <Link
          href="/dashboard/super-admin/rdv"
          className="font-semibold text-brand hover:underline"
        >
          la page super-admin
        </Link>
        .
      </p>
    </DashboardShell>
  );
}
