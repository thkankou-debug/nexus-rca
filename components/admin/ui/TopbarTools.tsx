"use client";

// ============================================================================
// OUTILS DE LA BARRE SUPÉRIEURE (cahier des charges §4.1) — recherche
// globale et centre de notifications RÉELLEMENT câblés :
// - TopbarSearch → GET /api/search (route existante, portée par rôle côté
//   serveur — proposée uniquement aux rôles qu'elle autorise aujourd'hui :
//   agent, admin, super_admin ; l'élargir aux autres rôles est une décision
//   de portée, pas un câblage — voir docs/AUDIT_CDC.md).
// - TopbarNotifications → GET/PATCH /api/notifications (table notifications
// réelle, par utilisateur).
// ============================================================================

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { GlobalSearch, type GlobalSearchResult } from "./GlobalSearch";
import { NotificationCenter, type NotificationItem } from "./NotificationCenter";

interface SearchHit {
  id: string;
  title: string;
  subtitle: string | null;
  reference: string | null;
  url: string;
}
interface SearchResponse {
  clients: SearchHit[];
  demandes: SearchHit[];
  appointments: SearchHit[];
  payments: SearchHit[];
}

const CATEGORY_LABELS: [keyof SearchResponse, string][] = [
  ["clients", "Clients"],
  ["demandes", "Dossiers"],
  ["appointments", "Rendez-vous"],
  ["payments", "Paiements"],
];

export function TopbarSearch() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    const q = value.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        if (!res.ok) {
          setResults([]);
          return;
        }
        const json = (await res.json()) as SearchResponse;
        const flat: GlobalSearchResult[] = [];
        for (const [key, label] of CATEGORY_LABELS) {
          for (const hit of json[key] || []) {
            flat.push({
              id: `${key}-${hit.id}`,
              title: hit.title,
              subtitle: [hit.reference, hit.subtitle].filter(Boolean).join(" · ") || undefined,
              category: label,
              href: hit.url,
            });
          }
        }
        setResults(flat);
      } catch {
        setResults([]);
      }
    }, 300);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [value]);

  return (
    <GlobalSearch
      value={value}
      onValueChange={setValue}
      results={results}
      onSelect={(r) => {
        setValue("");
        setResults([]);
        router.push(r.href);
      }}
      placeholder="Rechercher un client, un dossier, un paiement…"
      className="mx-auto hidden sm:block"
    />
  );
}

interface NotificationRow {
  id: string;
  type: string | null;
  title: string;
  message: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
}

function formatWhen(d: string): string {
  try {
    return new Date(d).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return d;
  }
}

export function TopbarNotifications() {
  const router = useRouter();
  const [items, setItems] = useState<NotificationItem[]>([]);

  async function load() {
    try {
      const res = await fetch("/api/notifications?limit=15");
      if (!res.ok) return;
      const json = await res.json();
      const rows = (json.notifications || []) as NotificationRow[];
      setItems(
        rows.map((n) => ({
          id: n.id,
          title: n.title,
          description: n.message || undefined,
          timestamp: formatWhen(n.created_at),
          read: Boolean(n.read_at),
          href: n.link || undefined,
        }))
      );
    } catch {
      // silencieux : la cloche reste utilisable, pas de faux contenu
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <NotificationCenter
      notifications={items}
      onMarkAllRead={async () => {
        await fetch("/api/notifications", { method: "PATCH" });
        await load();
      }}
      onItemClick={(item) => {
        if (item.href) router.push(item.href);
      }}
    />
  );
}
