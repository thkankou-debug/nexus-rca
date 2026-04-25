"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  Mail,
  Phone,
  MapPin,
  ChevronDown,
  Globe,
  Calendar,
  Clock,
  Zap,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================
export type AppointmentStatus =
  | "nouveau"
  | "confirme"
  | "en_attente"
  | "annule"
  | "termine";

export interface AppointmentRequest {
  id: string;
  reference: string | null;
  created_at: string;
  updated_at: string;

  service: string;
  appointment_object: string;
  meeting_type: "whatsapp" | "phone" | "video" | "onsite";
  duration: string;
  urgency: "normal" | "prioritaire" | "tres_urgent";

  preferred_date: string;
  preferred_time: string;
  alternative_availability: string | null;
  timezone: string | null;

  full_name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  language: string | null;
  specific_subject: string;
  situation: string;
  has_existing_file: string | null;
  file_number: string | null;
  has_documents_ready: string | null;

  consent_accuracy: boolean;
  consent_contact: boolean;
  consent_validation: boolean;

  status: AppointmentStatus;
  admin_notes: string | null;
  assigned_to: string | null;
}

// ============================================================================
// LABELS & HELPERS
// ============================================================================
const STATUSES: AppointmentStatus[] = [
  "nouveau",
  "confirme",
  "en_attente",
  "annule",
  "termine",
];

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  nouveau: "Nouveau",
  confirme: "Confirmé",
  en_attente: "En attente",
  annule: "Annulé",
  termine: "Terminé",
};

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  nouveau: "bg-blue-100 text-blue-700 border-blue-200",
  confirme: "bg-green-100 text-green-700 border-green-200",
  en_attente: "bg-yellow-100 text-yellow-700 border-yellow-200",
  annule: "bg-red-100 text-red-700 border-red-200",
  termine: "bg-slate-100 text-slate-700 border-slate-200",
};

const URGENCY_LABELS: Record<string, string> = {
  normal: "Normal",
  prioritaire: "Prioritaire",
  tres_urgent: "Très urgent",
};

const URGENCY_COLORS: Record<string, string> = {
  normal: "bg-slate-100 text-slate-700",
  prioritaire: "bg-nexus-orange-100 text-nexus-orange-700",
  tres_urgent: "bg-red-100 text-red-700",
};

const MEETING_TYPE_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  phone: "Téléphone",
  video: "Visio",
  onsite: "Sur place",
};

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

function formatDateTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================
export function AppointmentRequestsManager({
  initialRequests,
  canDelete = false,
}: {
  initialRequests: AppointmentRequest[];
  canDelete?: boolean;
}) {
  const supabase = createClient();
  const [requests, setRequests] = useState<AppointmentRequest[]>(initialRequests);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<AppointmentStatus | "all">("all");
  const [savingId, setSavingId] = useState<string | null>(null);

  const filtered =
    filter === "all"
      ? requests
      : requests.filter((r) => r.status === filter);

  const counts = {
    all: requests.length,
    nouveau: requests.filter((r) => r.status === "nouveau").length,
    confirme: requests.filter((r) => r.status === "confirme").length,
    en_attente: requests.filter((r) => r.status === "en_attente").length,
    annule: requests.filter((r) => r.status === "annule").length,
    termine: requests.filter((r) => r.status === "termine").length,
  };

  const updateStatus = async (id: string, status: AppointmentStatus) => {
    setSavingId(id);
    const { error } = await supabase
      .from("appointment_requests")
      .update({ status })
      .eq("id", id);
    setSavingId(null);
    if (error) {
      console.error("Erreur update :", error);
      toast.error("Erreur de mise à jour");
      return;
    }
    setRequests((list) =>
      list.map((r) => (r.id === id ? { ...r, status } : r))
    );
    toast.success("Statut mis à jour");
  };

  const deleteRequest = async (id: string) => {
    if (!confirm("Supprimer définitivement cette demande ?")) return;
    const { error } = await supabase
      .from("appointment_requests")
      .delete()
      .eq("id", id);
    if (error) {
      toast.error("Erreur de suppression");
      return;
    }
    setRequests((list) => list.filter((r) => r.id !== id));
    toast.success("Demande supprimée");
  };

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <div className="flex flex-wrap gap-2">
        <FilterChip
          label={`Toutes (${counts.all})`}
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
        {STATUSES.map((s) => (
          <FilterChip
            key={s}
            label={`${STATUS_LABELS[s]} (${counts[s]})`}
            active={filter === s}
            onClick={() => setFilter(s)}
          />
        ))}
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-slate-400" />
          <p className="mt-3 text-slate-600">
            Aucune demande de rendez-vous pour ce filtre.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => (
            <div
              key={req.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
            >
              {/* En-tete */}
              <button
                type="button"
                onClick={() =>
                  setExpandedId(expandedId === req.id ? null : req.id)
                }
                className="flex w-full items-start justify-between gap-4 p-5 text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-nexus-blue-700">
                      {req.reference || "sans-réf"}
                    </span>
                    <span
                      className={cn(
                        "rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                        STATUS_COLORS[req.status]
                      )}
                    >
                      {STATUS_LABELS[req.status]}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        URGENCY_COLORS[req.urgency]
                      )}
                    >
                      {URGENCY_LABELS[req.urgency]}
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-lg font-bold text-nexus-blue-950">
                    {req.full_name}
                  </h3>
                  <p className="mt-0.5 text-sm text-slate-600">
                    {req.service} —{" "}
                    <span className="text-slate-500">
                      {req.appointment_object}
                    </span>
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(req.preferred_date)} à {req.preferred_time}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {req.duration}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Globe className="h-3.5 w-3.5" />
                      {MEETING_TYPE_LABELS[req.meeting_type]}
                    </span>
                    <span className="text-slate-400">
                      Reçu le {formatDateTime(req.created_at)}
                    </span>
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 text-slate-400 transition-transform",
                    expandedId === req.id && "rotate-180"
                  )}
                />
              </button>

              {/* Details */}
              {expandedId === req.id && (
                <div className="border-t border-slate-200 bg-slate-50 p-5 space-y-5">
                  {/* Coordonnees */}
                  <div>
                    <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Coordonnées
                    </h4>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <InfoRow
                        icon={Mail}
                        label="Email"
                        value={req.email}
                        href={`mailto:${req.email}`}
                      />
                      <InfoRow
                        icon={Phone}
                        label="Téléphone"
                        value={req.phone}
                        href={`tel:${req.phone}`}
                      />
                      <InfoRow
                        icon={MapPin}
                        label="Pays / Ville"
                        value={`${req.country}, ${req.city}`}
                      />
                      <InfoRow
                        icon={Globe}
                        label="Langue"
                        value={req.language || "—"}
                      />
                    </div>
                  </div>

                  {/* Contexte */}
                  <div>
                    <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Contexte
                    </h4>
                    <div className="rounded-xl bg-white p-4 border border-slate-200">
                      <p className="text-sm font-semibold text-nexus-blue-950">
                        {req.specific_subject}
                      </p>
                      <p className="mt-2 whitespace-pre-line text-sm text-slate-700">
                        {req.situation}
                      </p>
                      {req.alternative_availability && (
                        <p className="mt-3 text-xs text-slate-500">
                          <strong>Autres disponibilités :</strong>{" "}
                          {req.alternative_availability}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Dossier / Docs */}
                  {(req.has_existing_file === "oui" ||
                    req.has_documents_ready === "oui") && (
                    <div className="grid gap-2 sm:grid-cols-2 text-xs">
                      {req.has_existing_file === "oui" && (
                        <div className="rounded-xl border border-nexus-blue-200 bg-nexus-blue-50 p-3">
                          <p className="font-semibold text-nexus-blue-900">
                            Dossier existant
                          </p>
                          <p className="mt-0.5 font-mono text-nexus-blue-800">
                            {req.file_number || "non précisé"}
                          </p>
                        </div>
                      )}
                      {req.has_documents_ready === "oui" && (
                        <div className="rounded-xl border border-green-200 bg-green-50 p-3">
                          <p className="font-semibold text-green-900">
                            Documents prêts
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div>
                    <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Changer le statut
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {STATUSES.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => updateStatus(req.id, s)}
                          disabled={req.status === s || savingId === req.id}
                          className={cn(
                            "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                            req.status === s
                              ? cn("ring-2 ring-offset-1", STATUS_COLORS[s])
                              : "border-slate-300 bg-white text-slate-700 hover:border-slate-400",
                            savingId === req.id && "opacity-50"
                          )}
                        >
                          {STATUS_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {canDelete && (
                    <div className="border-t border-slate-200 pt-4">
                      <button
                        type="button"
                        onClick={() => deleteRequest(req.id)}
                        className="text-xs font-semibold text-red-600 hover:text-red-800"
                      >
                        Supprimer définitivement
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANTS
// ============================================================================
function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-semibold transition",
        active
          ? "border-nexus-blue-900 bg-nexus-blue-900 text-white"
          : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
      )}
    >
      {label}
    </button>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-nexus-orange-500" />
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <p className="truncate text-sm text-slate-800">{value}</p>
      </div>
    </div>
  );
  if (href) {
    return (
      <a href={href} className="block rounded-lg hover:bg-white p-1 -m-1">
        {content}
      </a>
    );
  }
  return <div className="p-1 -m-1">{content}</div>;
}
