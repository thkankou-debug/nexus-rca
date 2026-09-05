import Link from "next/link";
import {
  Calendar,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Mes rendez-vous - NEXUS CONNECT",
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
      return {
        label: "En attente de confirmation",
        color: "bg-amber-100 text-amber-700 border-amber-200",
        icon: Clock,
      };
    case "confirme":
      return {
        label: "Confirmé",
        color: "bg-green-100 text-green-700 border-green-200",
        icon: CheckCircle2,
      };
    case "annule_client":
      return {
        label: "Annulé par vous",
        color: "bg-slate-100 text-slate-700 border-slate-200",
        icon: XCircle,
      };
    case "annule_agent":
      return {
        label: "Annulé par Nexus",
        color: "bg-red-100 text-red-700 border-red-200",
        icon: XCircle,
      };
    case "termine":
      return {
        label: "Terminé",
        color: "bg-blue-100 text-blue-700 border-blue-200",
        icon: CheckCircle2,
      };
    case "absent":
      return {
        label: "Absent",
        color: "bg-red-100 text-red-700 border-red-200",
        icon: AlertCircle,
      };
    default:
      return {
        label: statut || "—",
        color: "bg-slate-100 text-slate-700 border-slate-200",
        icon: AlertCircle,
      };
  }
}

export default async function ClientRdvPage() {
  const profile = await requireProfile([
    "client",
    "agent",
    "admin",
    "super_admin",
  ]);
  const supabase = createClient();

  const userEmail = (profile.email || "").toLowerCase().trim();

  const { data: appointmentsData } = await supabase
    .from("appointments")
    .select("*, agent:profiles!appointments_agent_id_fkey(prenom, nom, telephone, email, poste)")
    .or(`client_id.eq.${profile.id},client_email.eq.${userEmail}`)
    .order("rdv_date", { ascending: false })
    .order("rdv_heure", { ascending: false });

  const appointments = appointmentsData || [];

  const today = new Date().toISOString().split("T")[0];
  const upcoming = appointments.filter(
    (a) =>
      a.rdv_date >= today &&
      ["en_attente", "confirme"].includes(a.statut)
  );
  const past = appointments.filter(
    (a) =>
      a.rdv_date < today ||
      !["en_attente", "confirme"].includes(a.statut)
  );

  return (
    <DashboardShell profile={profile}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-lg">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-nexus-blue-950 sm:text-3xl">
              Mes rendez-vous
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Gérez vos consultations avec l&apos;équipe Nexus.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/client/rdv/nouveau"
          className="inline-flex items-center gap-2 rounded-full bg-nexus-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-nexus-orange-600"
        >
          <Plus className="h-4 w-4" />
          Réserver un rendez-vous
        </Link>
      </div>

      {appointments.length === 0 ? (
        <EmptyState
          icon={Calendar}
          tone="brand"
          title="Aucun rendez-vous pour le moment"
          description="Réservez votre premier rendez-vous avec un membre de l'équipe Nexus."
          action={
            <Link
              href="/dashboard/client/rdv/nouveau"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-body-sm font-semibold text-white shadow-elev-2 hover:bg-brand-hover hover:shadow-glow-orange"
            >
              <Sparkles className="h-4 w-4" />
              Réserver mon premier RDV
            </Link>
          }
        />
      ) : (
        <>
          {/* RDV À VENIR */}
          {upcoming.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-nexus-blue-950">
                <Sparkles className="h-5 w-5 text-nexus-orange-600" />
                À venir ({upcoming.length})
              </h2>
              <div className="space-y-3">
                {upcoming.map((rdv) => (
                  <AppointmentCard key={rdv.id} rdv={rdv} highlight />
                ))}
              </div>
            </div>
          )}

          {/* HISTORIQUE */}
          {past.length > 0 && (
            <div>
              <h2 className="mb-4 font-display text-lg font-bold text-slate-700">
                Historique ({past.length})
              </h2>
              <div className="space-y-3">
                {past.map((rdv) => (
                  <AppointmentCard key={rdv.id} rdv={rdv} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </DashboardShell>
  );
}

// ============================================================================
function AppointmentCard({
  rdv,
  highlight = false,
}: {
  rdv: {
    id: string;
    reference: string;
    service_type: string;
    rdv_date: string;
    rdv_heure: string;
    statut: string;
    notes_client?: string | null;
    agent?: {
      prenom?: string | null;
      nom?: string | null;
      telephone?: string | null;
      email?: string | null;
      poste?: string | null;
    } | null;
  };
  highlight?: boolean;
}) {
  const status = getStatusInfo(rdv.statut);
  const StatusIcon = status.icon;
  const serviceLabel = SERVICE_LABELS[rdv.service_type] || rdv.service_type;

  const agentName = rdv.agent
    ? [rdv.agent.prenom, rdv.agent.nom].filter(Boolean).join(" ")
    : "";

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
            <h3 className="font-display text-lg font-bold text-nexus-blue-950">
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
          </div>

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
                Vos notes
              </p>
              <p className="mt-1 text-sm text-slate-700">{rdv.notes_client}</p>
            </div>
          )}

          {agentName && (
            <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 bg-gradient-to-r from-nexus-blue-50 to-white p-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Agent assigné
                </p>
                <p className="text-sm font-semibold text-nexus-blue-950">
                  {agentName}
                </p>
                {rdv.agent?.poste && (
                  <p className="text-xs text-slate-500">{rdv.agent.poste}</p>
                )}
              </div>
              <div className="ml-auto flex gap-1.5">
                {rdv.agent?.telephone && (
                  <a
                    href={`tel:${rdv.agent.telephone.replace(/\s+/g, "").replace(/\+/g, "")}`}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 text-white shadow hover:bg-blue-600"
                    title="Appeler"
                  >
                    <Phone className="h-4 w-4" />
                  </a>
                )}
                {rdv.agent?.email && (
                  <a
                    href={`mailto:${rdv.agent.email}`}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-nexus-orange-500 text-white shadow hover:bg-nexus-orange-600"
                    title="Envoyer un email"
                  >
                    <Mail className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Référence
          </p>
          <p className="font-mono text-xs font-semibold text-slate-600">
            {rdv.reference}
          </p>
        </div>
      </div>
    </div>
  );
}
