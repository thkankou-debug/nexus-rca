import Link from "next/link";
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  TrendingUp,
  Users,
  Phone,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { cn } from "@/lib/utils";
import { AppointmentActions } from "@/components/dashboard/AppointmentActions";

export const metadata = {
  title: "Rendez-vous - Super Admin",
};

export const dynamic = "force-dynamic";

const SERVICE_LABELS: Record<string, string> = {
  visa: "Visa / e-Visa",
  bourse: "Études / Bourses",
  tcf: "TCF / Test de français",
  billet: "Billet d'avion",
  hotel: "Hôtel",
  transfert: "Transfert d'argent",
  consultation_generale: "Consultation générale",
  autre: "Autre",
};

type FilterValue = "all" | "en_attente" | "confirme" | "termine" | "annule";

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "en_attente", label: "En attente" },
  { value: "confirme", label: "Confirmés" },
  { value: "termine", label: "Terminés" },
  { value: "annule", label: "Annulés" },
];

function matchesFilter(statut: string, filter: FilterValue): boolean {
  if (filter === "all") return true;
  if (filter === "en_attente") return statut === "en_attente";
  if (filter === "confirme") return statut === "confirme";
  if (filter === "termine") return statut === "termine";
  if (filter === "annule") return statut === "annule_client" || statut === "annule_agent" || statut === "absent";
  return true;
}

function formatDateLong(dateStr: string): string {
  try {
    const d = new Date(dateStr + "T00:00:00");
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
      return { label: "En attente", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock };
    case "confirme":
      return { label: "Confirmé", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 };
    case "annule_client":
      return { label: "Annulé client", color: "bg-slate-100 text-slate-700 border-slate-200", icon: XCircle };
    case "annule_agent":
      return { label: "Annulé Nexus", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle };
    case "termine":
      return { label: "Terminé", color: "bg-blue-100 text-blue-700 border-blue-200", icon: CheckCircle2 };
    case "absent":
      return { label: "Absent", color: "bg-red-100 text-red-700 border-red-200", icon: AlertCircle };
    default:
      return { label: statut || "—", color: "bg-slate-100 text-slate-700 border-slate-200", icon: AlertCircle };
  }
}

export default async function SuperAdminRdvPage({
  searchParams,
}: {
  searchParams?: { status?: string };
}) {
  const profile = await requireProfile(["admin", "super_admin"]);
  const supabase = createClient();

  const rawFilter = (searchParams?.status || "all").toLowerCase();
  const activeFilter: FilterValue = (
    ["all", "en_attente", "confirme", "termine", "annule"].includes(rawFilter)
      ? rawFilter
      : "all"
  ) as FilterValue;

  const { data: appointmentsData } = await supabase
    .from("appointments")
    .select("*, agent:profiles!appointments_agent_id_fkey(id, prenom, nom, telephone, email, poste)")
    .order("rdv_date", { ascending: false })
    .order("rdv_heure", { ascending: false });

  const allAppointments = appointmentsData || [];
  const list = allAppointments.filter((a) => matchesFilter(a.statut || "", activeFilter));

  const total = allAppointments.length;
  const enAttente = allAppointments.filter((a) => a.statut === "en_attente").length;
  const confirmes = allAppointments.filter((a) => a.statut === "confirme").length;
  const today = new Date().toISOString().split("T")[0];
  const aujourdhui = allAppointments.filter(
    (a) => a.rdv_date === today && ["en_attente", "confirme"].includes(a.statut || "")
  ).length;

  const { data: agentsData } = await supabase
    .from("profiles")
    .select("id, prenom, nom")
    .eq("role", "agent");
  const agents = agentsData || [];

  return (
    <DashboardShell profile={profile}>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-lg">
          <Calendar className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-nexus-blue-950 sm:text-3xl">
            Rendez-vous
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Tous les rendez-vous de l&apos;agence Nexus.
          </p>
        </div>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Calendar} label="Total RDV" value={total.toString()} accent="blue" />
        <StatCard icon={Clock} label="En attente" value={enAttente.toString()} accent="amber" />
        <StatCard icon={CheckCircle2} label="Confirmés" value={confirmes.toString()} accent="green" />
        <StatCard icon={TrendingUp} label="Aujourd'hui" value={aujourdhui.toString()} accent="orange" />
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="flex shrink-0 items-center gap-1.5 px-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Filter className="h-3.5 w-3.5" />
            Filtrer
          </span>
          {FILTERS.map((f) => {
            const isActive = activeFilter === f.value;
            const count = allAppointments.filter((a) => matchesFilter(a.statut || "", f.value)).length;
            const href =
              f.value === "all"
                ? "/dashboard/super-admin/rdv"
                : `/dashboard/super-admin/rdv?status=${f.value}`;
            return (
              <Link
                key={f.value}
                href={href}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition",
                  isActive
                    ? "bg-nexus-blue-950 text-white shadow"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                )}
              >
                {f.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                    isActive ? "bg-white/20 text-white" : "bg-white text-slate-700"
                  )}
                >
                  {count}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 text-slate-600">
            {activeFilter === "all"
              ? "Aucun rendez-vous enregistré pour le moment."
              : `Aucun rendez-vous dans la catégorie "${FILTERS.find((f) => f.value === activeFilter)?.label}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((rdv) => (
            <AppointmentRow key={rdv.id} rdv={rdv} agents={agents} />
          ))}
        </div>
      )}
    </DashboardShell>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent: "blue" | "amber" | "green" | "orange";
}) {
  const colorMap = {
    blue: "from-nexus-blue-700 to-nexus-blue-900",
    amber: "from-amber-500 to-amber-700",
    green: "from-green-500 to-green-700",
    orange: "from-nexus-orange-500 to-nexus-orange-700",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-1 font-display text-2xl font-bold text-nexus-blue-950">{value}</p>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg",
            colorMap[accent]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function AppointmentRow({
  rdv,
  agents,
}: {
  rdv: {
    id: string;
    reference: string;
    client_id: string | null;
    client_nom: string;
    client_email: string;
    client_telephone: string | null;
    service_type: string;
    rdv_date: string;
    rdv_heure: string;
    statut: string;
    notes_client?: string | null;
    notes_agent?: string | null;
    agent_id: string | null;
    agent?: {
      id: string;
      prenom?: string | null;
      nom?: string | null;
      telephone?: string | null;
      email?: string | null;
      poste?: string | null;
    } | null;
  };
  agents: { id: string; prenom?: string | null; nom?: string | null }[];
}) {
  const status = getStatusInfo(rdv.statut);
  const StatusIcon = status.icon;
  const serviceLabel = SERVICE_LABELS[rdv.service_type] || rdv.service_type;
  const agentName = rdv.agent
    ? [rdv.agent.prenom, rdv.agent.nom].filter(Boolean).join(" ")
    : null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-base font-bold text-nexus-blue-950">
              {serviceLabel}
            </h3>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase",
                status.color
              )}
            >
              <StatusIcon className="h-2.5 w-2.5" />
              {status.label}
            </span>
            <span className="font-mono text-[10px] text-slate-400">{rdv.reference}</span>
          </div>

          <div className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
            <p className="text-slate-700">
              <Users className="mr-1 inline h-3.5 w-3.5 text-slate-400" />
              <strong>{rdv.client_nom}</strong>
            </p>
            <p className="text-slate-600">{rdv.client_email}</p>
          </div>

          {rdv.client_telephone && (
            <p className="mt-1 text-sm text-slate-600">
              <Phone className="mr-1 inline h-3.5 w-3.5 text-slate-400" />
              {rdv.client_telephone}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-nexus-orange-600" />
              {formatDateLong(rdv.rdv_date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-nexus-orange-600" />
              {rdv.rdv_heure}
            </span>
          </div>

          <div className="mt-2 text-sm">
            {agentName ? (
              <span className="text-slate-700">
                Assigné à : <strong className="text-nexus-blue-950">{agentName}</strong>
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">
                ⚠ Non assigné
              </span>
            )}
          </div>

          {rdv.notes_client && (
            <div className="mt-3 rounded-xl bg-slate-50 p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Notes client
              </p>
              <p className="mt-1 text-sm text-slate-700">{rdv.notes_client}</p>
            </div>
          )}

          {rdv.notes_agent && (
            <div className="mt-2 rounded-xl bg-blue-50 p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
                Notes internes
              </p>
              <p className="mt-1 text-sm text-blue-900">{rdv.notes_agent}</p>
            </div>
          )}
        </div>

        <AppointmentActions
          appointmentId={rdv.id}
          currentStatus={rdv.statut}
          currentAgentId={rdv.agent_id}
          agents={agents}
          isSuperAdmin
        />
      </div>
    </div>
  );
}
