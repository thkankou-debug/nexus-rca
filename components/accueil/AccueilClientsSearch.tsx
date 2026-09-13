"use client";

// ============================================================================
// CLIENTS — page de recherche de l'espace Accueil & caisse. La recherche
// précède toujours la création (§3.2) : pas de liste exhaustive des clients
// de l'agence ici, la réception cherche une personne précise (nom, téléphone
// ou référence) puis ouvre sa fiche de réception.
// ============================================================================

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, UserPlus, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { NewClientModal, type AccueilClient } from "./NewClientModal";

const inputClass =
  "w-full rounded-sm border border-line bg-surface px-3 py-2 text-body-sm text-ink placeholder:text-ink-subtle focus:border-line-strong focus:outline-none focus:ring-2 focus:ring-focus";

function displayName(c: AccueilClient): string {
  return c.type === "particulier"
    ? [c.prenom, c.nom].filter(Boolean).join(" ") || c.nom
    : c.raison_sociale || c.nom;
}

export function AccueilClientsSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AccueilClient[]>([]);
  const [searching, setSearching] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    timer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/accueil/clients?q=${encodeURIComponent(q)}`);
        const json = await res.json();
        if (json.success) setResults(json.clients);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [query]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nom, téléphone ou référence…"
            className={cn(inputClass, "pl-9")}
          />
        </div>
        <button
          type="button"
          onClick={() => setShowNew(true)}
          className="inline-flex items-center gap-2 rounded-sm bg-brand px-4 py-2 text-body-sm font-semibold text-on-brand hover:bg-brand-hover"
        >
          <UserPlus className="h-4 w-4" />
          Nouveau client
        </button>
      </div>

      {searching && <p className="text-caption text-ink-muted">Recherche…</p>}

      {results.length > 0 && (
        <ul className="divide-y divide-line rounded-sm border border-line bg-surface-elevated">
          {results.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => router.push(`/dashboard/accueil/clients/${c.id}`)}
                className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-left hover:bg-surface-sunken"
              >
                <span className="text-body-sm font-semibold text-ink">{displayName(c)}</span>
                <span className="text-caption text-ink-muted">
                  {[c.reference, c.telephone, c.email].filter(Boolean).join(" · ")}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {!searching && query.trim().length >= 2 && results.length === 0 && (
        <div className="rounded-sm border border-line bg-surface-elevated px-6 py-10 text-center">
          <Users className="mx-auto h-8 w-8 text-ink-subtle" aria-hidden />
          <p className="mt-3 font-display text-title text-ink">Aucun client trouvé</p>
          <p className="mt-1 text-body-sm text-ink-muted">
            Vérifiez l&rsquo;orthographe ou un autre numéro avant de créer une fiche.
          </p>
        </div>
      )}

      {query.trim().length < 2 && (
        <div className="rounded-sm border border-dashed border-line px-6 py-10 text-center">
          <Search className="mx-auto h-8 w-8 text-ink-subtle" aria-hidden />
          <p className="mt-3 text-body-sm text-ink-muted">
            Recherchez un client pour ouvrir sa fiche de réception. La recherche précède toujours
            la création.
          </p>
        </div>
      )}

      {showNew && (
        <NewClientModal
          onClose={() => setShowNew(false)}
          onCreated={(c) => {
            setShowNew(false);
            router.push(`/dashboard/accueil/clients/${c.id}`);
          }}
        />
      )}
    </div>
  );
}
