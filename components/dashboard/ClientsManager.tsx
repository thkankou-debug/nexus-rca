"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Plus,
  Search,
  Trash2,
  Edit3,
  AlertTriangle,
  Users,
  Mail,
  Phone,
  MapPin,
  User,
  Building2,
  Landmark,
  Eye,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { ClientForm } from "./ClientForm";
import {
  type Client,
  type ClientType,
  CLIENT_TYPE_LABELS,
} from "@/types/client-types";

const TYPE_ICONS: Record<ClientType, typeof User> = {
  particulier: User,
  entreprise: Building2,
  institution: Landmark,
};

const TYPE_COLORS: Record<ClientType, string> = {
  particulier: "bg-blue-100 text-blue-700",
  entreprise: "bg-purple-100 text-purple-700",
  institution: "bg-emerald-100 text-emerald-700",
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

function getDisplayName(client: Client): string {
  if (client.type === "particulier") {
    return [client.prenom, client.nom].filter(Boolean).join(" ");
  }
  return client.nom;
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================
export function ClientsManager({
  initialClients,
  currentUserId,
  canDelete = false,
}: {
  initialClients: Client[];
  currentUserId: string;
  canDelete?: boolean;
}) {
  const supabase = createClient();
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [filter, setFilter] = useState<ClientType | "all" | "inactif">("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Client | null>(null);

  const filtered = useMemo(() => {
    let list = clients;

    if (filter === "inactif") {
      list = list.filter((c) => !c.actif);
    } else if (filter !== "all") {
      list = list.filter((c) => c.actif && c.type === filter);
    } else {
      list = list.filter((c) => c.actif);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          getDisplayName(c).toLowerCase().includes(q) ||
          (c.email || "").toLowerCase().includes(q) ||
          (c.telephone || "").toLowerCase().includes(q) ||
          (c.reference || "").toLowerCase().includes(q) ||
          (c.ville || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [clients, filter, search]);

  const counts = useMemo(() => {
    const actifs = clients.filter((c) => c.actif);
    return {
      all: actifs.length,
      particulier: actifs.filter((c) => c.type === "particulier").length,
      entreprise: actifs.filter((c) => c.type === "entreprise").length,
      institution: actifs.filter((c) => c.type === "institution").length,
      inactif: clients.filter((c) => !c.actif).length,
    };
  }, [clients]);

  const handleSaved = (saved: Client) => {
    setClients((list) => {
      const idx = list.findIndex((c) => c.id === saved.id);
      if (idx >= 0) {
        const next = [...list];
        next[idx] = saved;
        return next;
      }
      return [saved, ...list];
    });
    setShowForm(false);
    setEditingClient(null);
  };

  const handleDelete = async (client: Client) => {
    const { error } = await supabase
      .from("clients")
      .delete()
      .eq("id", client.id);

    if (error) {
      toast.error("Suppression refusée : " + error.message);
      return;
    }
    setClients((list) => list.filter((c) => c.id !== client.id));
    setConfirmDelete(null);
    toast.success("Client supprimé");
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatBlock
          icon={Users}
          label="Total clients actifs"
          value={counts.all}
          accent="blue"
        />
        <StatBlock
          icon={User}
          label="Particuliers"
          value={counts.particulier}
          accent="indigo"
        />
        <StatBlock
          icon={Building2}
          label="Entreprises"
          value={counts.entreprise}
          accent="purple"
        />
        <StatBlock
          icon={Landmark}
          label="Institutions"
          value={counts.institution}
          accent="green"
        />
      </div>

      {/* Barre d action */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Rechercher par nom, email, téléphone, ville..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingClient(null);
            setShowForm(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-nexus-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-nexus-orange-500/30 transition hover:bg-nexus-orange-600"
        >
          <Plus className="h-4 w-4" />
          Nouveau client
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2">
        <FilterChip
          label={`Tous (${counts.all})`}
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
        <FilterChip
          label={`Particuliers (${counts.particulier})`}
          active={filter === "particulier"}
          onClick={() => setFilter("particulier")}
        />
        <FilterChip
          label={`Entreprises (${counts.entreprise})`}
          active={filter === "entreprise"}
          onClick={() => setFilter("entreprise")}
        />
        <FilterChip
          label={`Institutions (${counts.institution})`}
          active={filter === "institution"}
          onClick={() => setFilter("institution")}
        />
        {counts.inactif > 0 && (
          <FilterChip
            label={`Inactifs (${counts.inactif})`}
            active={filter === "inactif"}
            onClick={() => setFilter("inactif")}
          />
        )}
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-slate-400" />
          <p className="mt-3 text-slate-600">
            {clients.length === 0
              ? "Aucun client enregistré pour le moment."
              : "Aucun client pour ce filtre."}
          </p>
          {clients.length === 0 && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-nexus-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-nexus-orange-600"
            >
              <Plus className="h-4 w-4" />
              Créer le premier client
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <ClientCard
              key={c.id}
              client={c}
              canDelete={canDelete}
              onEdit={() => {
                setEditingClient(c);
                setShowForm(true);
              }}
              onDelete={() => setConfirmDelete(c)}
            />
          ))}
        </div>
      )}

      {/* Modal formulaire */}
      {showForm && (
        <ClientForm
          initialData={editingClient}
          currentUserId={currentUserId}
          onClose={() => {
            setShowForm(false);
            setEditingClient(null);
          }}
          onSaved={handleSaved}
        />
      )}

      {/* Modal suppression */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-lg font-bold text-nexus-blue-950">
                  Supprimer ce client ?
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  <strong>{getDisplayName(confirmDelete)}</strong>
                </p>
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  ⚠️ Si ce client a des paiements ou des dossiers liés, ils
                  seront orphelinés (mais pas supprimés). Pense à plutôt le
                  marquer comme <strong>inactif</strong> si tu veux préserver
                  l'historique.
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDelete)}
                className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Oui, supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CARTE CLIENT
// ============================================================================
function ClientCard({
  client,
  canDelete,
  onEdit,
  onDelete,
}: {
  client: Client;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const Icon = TYPE_ICONS[client.type];
  const displayName = getDisplayName(client);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-blue-100 to-nexus-blue-50 text-nexus-blue-700">
              <Icon className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-nexus-blue-700">
                  {client.reference || "—"}
                </span>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    TYPE_COLORS[client.type]
                  )}
                >
                  {CLIENT_TYPE_LABELS[client.type]}
                </span>
                {!client.actif && (
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
                    Inactif
                  </span>
                )}
              </div>
              <h3 className="mt-1 font-display text-lg font-bold text-nexus-blue-950">
                {displayName}
              </h3>
              {client.raison_sociale && (
                <p className="text-xs text-slate-500">
                  {client.raison_sociale}
                </p>
              )}

              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                {client.email && (
                  <span className="inline-flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    {client.email}
                  </span>
                )}
                {client.telephone && (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    {client.telephone}
                  </span>
                )}
                {client.ville && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {client.ville}
                    {client.pays ? `, ${client.pays}` : ""}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          <Link
            href={`/dashboard/super-admin/clients/${client.id}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-nexus-blue-950 px-3 py-1.5 text-xs font-semibold text-white hover:bg-nexus-blue-900"
          >
            <Eye className="h-3.5 w-3.5" />
            Voir la fiche
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 rounded-full border border-nexus-blue-200 bg-nexus-blue-50 px-3 py-1.5 text-xs font-semibold text-nexus-blue-700 hover:bg-nexus-blue-100"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Modifier
          </button>
          {canDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Supprimer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANTS
// ============================================================================
function StatBlock({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  accent: "blue" | "indigo" | "purple" | "green";
}) {
  const colorMap = {
    blue: "from-nexus-blue-600 to-nexus-blue-800",
    indigo: "from-blue-400 to-indigo-600",
    purple: "from-purple-400 to-purple-600",
    green: "from-emerald-400 to-emerald-600",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 font-display text-2xl font-bold text-nexus-blue-950">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg",
            colorMap[accent]
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

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
        "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
        active
          ? "border-nexus-blue-950 bg-nexus-blue-950 text-white"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
      )}
    >
      {label}
    </button>
  );
}
