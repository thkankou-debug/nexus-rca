"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GitMerge, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import type { Client } from "@/types/client-types";

interface Props {
  survivorId: string;
  candidates: Client[];
}

function displayName(c: Client): string {
  return [c.prenom, c.nom].filter(Boolean).join(" ") || c.nom;
}

export function ClientMergeAction({ survivorId, candidates }: Props) {
  const router = useRouter();
  const [mergingId, setMergingId] = useState<string | null>(null);

  async function merge(duplicate: Client) {
    if (
      !confirm(
        `Fusionner "${displayName(duplicate)}" dans cette fiche ? La fiche "${displayName(
          duplicate
        )}" ne sera pas supprimée mais tous ses dossiers, paiements, messages et demandes de rendez-vous seront rattachés ici. Action tracée, réversible manuellement.`
      )
    ) {
      return;
    }
    setMergingId(duplicate.id);
    try {
      const res = await fetch(`/api/clients/${survivorId}/merge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duplicateId: duplicate.id }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
      };
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Erreur serveur");
      }
      toast.success("Fiches fusionnées");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Fusion impossible");
    } finally {
      setMergingId(null);
    }
  }

  if (candidates.length === 0) return null;

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <div className="flex items-center gap-2">
        <GitMerge className="h-5 w-5 text-amber-700" />
        <h2 className="font-display text-base font-bold text-amber-900">
          Doublons potentiels
        </h2>
      </div>
      <p className="mt-1 text-xs text-amber-800">
        Même email ou téléphone qu&apos;une autre fiche. Vérifiez avant de
        fusionner — la fusion n&apos;est jamais automatique.
      </p>
      <ul className="mt-3 space-y-2">
        {candidates.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-white p-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-nexus-blue-950">
                {displayName(c)}
              </p>
              <p className="truncate text-xs text-slate-500">
                {c.email || "—"} {c.telephone ? `· ${c.telephone}` : ""}
              </p>
            </div>
            <button
              type="button"
              disabled={mergingId === c.id}
              onClick={() => merge(c)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-amber-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
            >
              {mergingId === c.id ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <GitMerge className="h-3.5 w-3.5" />
              )}
              Fusionner ici
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
