"use client";

import { useEffect, useRef, useState } from "react";
import { Search, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { NewClientModal, displayClientName, type AccueilClient } from "./NewClientModal";

const inputClass =
  "w-full rounded-sm border border-line bg-surface px-3 py-2 text-body-sm text-ink placeholder:text-ink-subtle focus:border-line-strong focus:outline-none focus:ring-2 focus:ring-focus";

export function ClientPicker({
  client,
  onChange,
  keepFieldsHint = true,
}: {
  client: AccueilClient | null;
  onChange: (c: AccueilClient | null) => void;
  keepFieldsHint?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<AccueilClient[]>([]);
  const [searching, setSearching] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    const q = query.trim();
    if (client || q.length < 2) {
      setHits([]);
      return;
    }
    timer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/accueil/clients?q=${encodeURIComponent(q)}`);
        const json = await res.json();
        if (json.success) setHits(json.clients || []);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [query, client]);

  if (client) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-line bg-surface px-3 py-2">
        <p className="text-body-sm font-semibold text-ink">
          {displayClientName(client)}
          <span className="ml-2 font-normal text-ink-muted">
            {[client.reference, client.telephone, client.email].filter(Boolean).join(" · ")}
          </span>
        </p>
        <button
          type="button"
          onClick={() => {
            onChange(null);
            setQuery("");
          }}
          className="rounded-sm border border-line px-3 py-1 text-caption font-semibold text-ink hover:border-line-strong"
        >
          Changer
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nom, téléphone, courriel ou référence…"
          className={cn(inputClass, "pl-9")}
        />
      </div>
      {searching ? <p className="mt-1 text-caption text-ink-muted">Recherche…</p> : null}
      {hits.map((c) => (
        <button
          key={c.id}
          type="button"
          className="mt-1 block w-full rounded-sm px-2 py-1.5 text-left text-body-sm hover:bg-surface-sunken"
          onClick={() => onChange(c)}
        >
          {displayClientName(c)} · {[c.telephone, c.reference].filter(Boolean).join(" · ")}
        </button>
      ))}
      {query.trim().length >= 2 && !searching && hits.length === 0 ? (
        <p className="mt-2 text-caption text-ink-muted">Aucun client — créez une fiche plutôt qu&rsquo;un doublon.</p>
      ) : null}
      <button
        type="button"
        onClick={() => setShowNew(true)}
        className="mt-2 inline-flex items-center gap-2 rounded-sm border border-line px-3 py-1.5 text-caption font-semibold text-ink hover:border-line-strong"
      >
        <UserPlus className="h-3.5 w-3.5" />
        Créer un nouveau client
        {keepFieldsHint ? " (saisie conservée)" : ""}
      </button>
      {showNew ? (
        <NewClientModal
          onClose={() => setShowNew(false)}
          onCreated={(c) => {
            setShowNew(false);
            onChange(c);
          }}
        />
      ) : null}
    </div>
  );
}
