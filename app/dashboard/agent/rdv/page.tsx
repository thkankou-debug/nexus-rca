import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Inbox,
  Phone,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { AppointmentActions } from "@/components/dashboard/AppointmentActions";

export const metadata = {
  title: "Mes rendez-vous - Agent",
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

export default async function AgentRdvPage() {
  const profile = await requireProfile(["agent"]);
  const supabase = createClient();

  const { data: assignedData } = await supabase
    .from("appointments")
    .select("*")
    .eq("agent_id", profile.id)
    .order("rdv_date", { ascending: false })
    .order("rdv_heure", { ascending: false });

  const { data: unassignedData } = await supabase
    .from("appointments")
    .select("*")
    .is("agent_id", null)
    .eq("statut", "en_attente")
    .order("rdv_date", { ascending: true })
    .order("rdv_heure", { ascending: true });

  const assigned = assignedData || [];
  const unassigned = unassignedData || [];

  const today = new Date().toISOString().split("T")[0];
  const aujourdhui = assigned.filter(
    (a) => a.rdv_date === today && ["en_attente", "confirme"].includes(a.statut)
  );
  const upcoming = assigned.filter(
    (a) => a.rdv_date > today && ["en_attente", "confirme"].includes(a.statut)
  );
  const past = assigned.filter(
    (a) => a.rdv_date < today || ["termine", "annule_client", "annule_agent", "absent"].includes(a.statut)
  );

  return (
    <>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-lg">
          <Calendar className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-nexus-blue-950 sm:text-3xl">
            Mes rendez-vous
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Vos consultations clients à confirmer et gérer.
          </p>
        </div>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Inbox} label="Non assignés" value={unassigned.length.toString()} accent="amber" />
        <StatCard icon={Calendar} label="Aujourd'hui" value={aujourdhui.length.toString()} accent="orange" />
        <StatCard icon={Clock} label="À venir" value={upcoming.length.toString()} accent="blue" />
        <StatCard icon={CheckCircle2} label="Total assignés" value={assigned.length.toString()} accent="green" />
      </div>

      {unassigned.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-amber-700">
            <Inbox className="h-5 w-5" />
            File d&apos;attente — RDV non assignés ({unassigned.length})
          </h2>
          <div className="space-y-3">
            {unassigned.map((rdv) => (
              <AppointmentRow key={rdv.id} rdv={rdv} agentId={profile.id} canTake />
            ))}
          </div>
        </div>
      )}

      {aujourdhui.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-nexus-orange-600">
            <Calendar className="h-5 w-5" />
            Aujourd&apos;hui ({aujourdhui.length})
          </h2>
          <div className="space-y-3">
            {aujourdhui.map((rdv) => (
              <AppointmentRow key={rdv.id} rdv={rdv} agentId={profile.id} highlight />
            ))}
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 font-display text-lg font-bold text-nexus-blue-950">
            À venir ({upcoming.length})
          </h2>
          <div className="space-y-3">
            {upcoming.map((rdv) => (
              <AppointmentRow key={rdv.id} rdv={rdv} agentId={profile.id} />
            ))}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h2 className="mb-4 font-display text-lg font-bold text-slate-700">
            Historique ({past.length})
          </h2>
          <div className="space-y-3">
            {past.map((rdv) => (
              <AppointmentRow key={rdv.id} rdv={rdv} agentId={profile.id} />
            ))}
          </div>
        </div>
      )}

      {assigned.length === 0 && unassigned.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 text-slate-600">
            Aucun rendez-vous pour le moment.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Les RDV des clients apparaîtront ici dès leur réservation.
          </p>
        </div>
      )}
    </>
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
  agentId,
  canTake = false,
  highlight = false,
}: {
  rdv: {
    id: string;
    reference: string;
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
  };
  agentId: string;
  canTake?: boolean;
  highlight?: boolean;
}) {
  const status = getStatusInfo(rdv.statut);
  const StatusIcon = status.icon;
  const serviceLabel = SERVICE_LABELS[rdv.service_type] || rdv.service_type;

  return (
    <div
      className={cn(
        "rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md",
        highlight ? "border-nexus-orange-200" : "border-slate-200"
      )}
    >
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

          <p className="mt-2 text-sm text-slate-700">
            <strong>{rdv.client_nom}</strong>
            <span className="ml-2 text-slate-600">{rdv.client_email}</span>
          </p>

          {rdv.client_telephone && (
            <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
              <Phone className="h-3.5 w-3.5 text-slate-400" />
              <a
                href={`tel:${rdv.client_telephone.replace(/\s+/g, "").replace(/\+/g, "")}`}
                className="hover:text-nexus-blue-950"
              >
                {rdv.client_telephone}
              </a>
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
          agents={[]}
          canTake={canTake}
          agentId={agentId}
        />
      </div>
    </div>
  );
}
