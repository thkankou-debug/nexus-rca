"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  X,
  User,
  Building2,
  Landmark,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// ============================================================================
// TYPES (autonomes - pas d'import externe)
// ============================================================================
interface ClientOption {
  id: string;
  reference: string | null;
  type: "particulier" | "entreprise" | "institution";
  nom: string;
  prenom: string | null;
  raison_sociale: string | null;
  email: string | null;
  telephone: string | null;
  ville: string | null;
}

function getTypeIcon(type: string) {
  if (type === "entreprise") return Building2;
  if (type === "institution") return Landmark;
  return User;
}

function getTypeLabel(type: string): string {
  if (type === "entreprise") return "Entreprise";
  if (type === "institution") return "Institution";
  return "Particulier";
}

function getDisplayName(client: ClientOption): string {
  if (client.type === "particulier") {
    return [client.prenom, client.nom].filter(Boolean).join(" ") || client.nom;
  }
  return client.nom;
}

// ============================================================================
// COMPOSANT
// ============================================================================
export function ClientSelector({
  selectedClientId,
  onSelect,
  onClientPicked,
}: {
  /** ID du client actuellement sélectionné */
  selectedClientId: string | null;
  /** Appelé quand l'utilisateur sélectionne (ou désélectionne) un client */
  onSelect: (clientId: string | null) => void;
  /** Appelé quand l'utilisateur sélectionne un client : permet de pré-remplir nom/email/tel */
  onClientPicked?: (client: ClientOption) => void;
}) {
  const supabase = createClient();
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // Charge la liste des clients actifs au montage
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("clients")
        .select(
          "id, reference, type, nom, prenom, raison_sociale, email, telephone, ville"
        )
        .eq("actif", true)
        .order("created_at", { ascending: false })
        .limit(500);
      if (!cancelled) {
        setClients((data || []) as ClientOption[]);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  // Client actuellement sélectionné
  const selectedClient = useMemo(
    () => clients.find((c) => c.id === selectedClientId) || null,
    [clients, selectedClientId]
  );

  // Filtrage
  const filtered = useMemo(() => {
    if (!search.trim()) return clients.slice(0, 20);
    const q = search.toLowerCase();
    return clients
      .filter(
        (c) =>
          getDisplayName(c).toLowerCase().includes(q) ||
          (c.email || "").toLowerCase().includes(q) ||
          (c.telephone || "").toLowerCase().includes(q) ||
          (c.reference || "").toLowerCase().includes(q) ||
          (c.ville || "").toLowerCase().includes(q)
      )
      .slice(0, 20);
  }, [clients, search]);

  const handleSelect = (client: ClientOption) => {
    onSelect(client.id);
    if (onClientPicked) onClientPicked(client);
    setShowDropdown(false);
    setSearch("");
  };

  const handleClear = () => {
    onSelect(null);
    setSearch("");
  };

  return (
    <div className="relative">
      {/* Si un client est sélectionné, on l'affiche avec option de retirer */}
      {selectedClient ? (
        <div className="flex items-center gap-3 rounded-xl border-2 border-nexus-orange-300 bg-nexus-orange-50 p-3">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-nexus-orange-600" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-nexus-blue-950">
                {getDisplayName(selectedClient)}
              </span>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-600">
                {getTypeLabel(selectedClient.type)}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              {selectedClient.reference}
              {selectedClient.email && ` · ${selectedClient.email}`}
              {selectedClient.telephone && ` · ${selectedClient.telephone}`}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="shrink-0 rounded-full p-1.5 text-slate-400 hover:bg-white hover:text-slate-700"
            aria-label="Retirer le client"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <>
          {/* Champ de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Rechercher un client par nom, email, téléphone..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
            />
            {loading && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
            )}
          </div>

          {/* Dropdown de résultats */}
          {showDropdown && (search.trim() || filtered.length > 0) && (
            <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
              {filtered.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500">
                  Aucun client trouvé.
                  <br />
                  <span className="text-xs text-slate-400">
                    Tu peux quand même remplir manuellement les champs ci-dessous.
                  </span>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filtered.map((client) => {
                    const Icon = getTypeIcon(client.type);
                    return (
                      <button
                        key={client.id}
                        type="button"
                        onClick={() => handleSelect(client)}
                        className="flex w-full items-center gap-3 p-3 text-left transition hover:bg-slate-50"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-nexus-blue-100 to-nexus-blue-50 text-nexus-blue-700">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-nexus-blue-950">
                            {getDisplayName(client)}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {client.reference}
                            {client.email && ` · ${client.email}`}
                            {!client.email && client.telephone && ` · ${client.telephone}`}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Note d'aide */}
          <p className="mt-1.5 text-xs text-slate-500">
            Optionnel — sélectionner un client lie ce paiement à sa fiche.
          </p>
        </>
      )}
    </div>
  );
}
