"use client";

import { useState } from "react";
import Link from "next/link";
import { Link2, Loader2, Search, UserPlus, X } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import type { Client } from "@/types/client-types";

interface Props {
  clientRecordId: string | null;
  nom: string;
  email: string;
  telephone?: string | null;
  onAttached: (clientId: string) => void;
}

export function AttachClientAction({
  clientRecordId,
  nom,
  email,
  telephone,
  onAttached,
}: Props) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [matches, setMatches] = useState<Client[]>([]);
  const [searched, setSearched] = useState(false);
  const [saving, setSaving] = useState(false);

  async function search() {
    setSearching(true);
    setSearched(false);
    try {
      const orParts = [`email.ilike.${email}`];
      if (telephone) orParts.push(`telephone.eq.${telephone}`);
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .or(orParts.join(","))
        .is("merged_into_id", null)
        .limit(5);
      if (error) throw error;
      setMatches((data || []) as Client[]);
      setSearched(true);
    } catch (err) {
      console.error("[ATTACH_CLIENT] search error:", err);
      toast.error("Recherche impossible");
    } finally {
      setSearching(false);
    }
  }

  async function attach(clientId: string) {
    setSaving(true);
    try {
      onAttached(clientId);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function createAndAttach() {
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("clients")
        .insert({
          type: "particulier",
          nom,
          email: email || null,
          telephone: telephone || null,
          pays: "République Centrafricaine",
          actif: true,
        })
        .select()
        .single();
      if (error) throw error;
      const created = data as Client;
      onAttached(created.id);
      setOpen(false);
      toast.success("Fiche client créée et rattachée");
    } catch (err) {
      console.error("[ATTACH_CLIENT] create error:", err);
      toast.error(err instanceof Error ? err.message : "Création impossible");
    } finally {
      setSaving(false);
    }
  }

  if (clientRecordId) {
    return (
      <Link
        href={`/dashboard/super-admin/clients/${clientRecordId}`}
        className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
      >
        <Link2 className="h-3.5 w-3.5" />
        Voir la fiche client
      </Link>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          search();
        }}
        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-nexus-blue-700 transition-colors hover:bg-slate-50"
      >
        <UserPlus className="h-3.5 w-3.5" />
        Rattacher à un client
      </button>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
          Rattacher à un client
        </p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-slate-400 hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {searching ? (
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Recherche par email / téléphone…
        </div>
      ) : matches.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {matches.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/60 p-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-nexus-blue-950">
                  {[c.prenom, c.nom].filter(Boolean).join(" ") || c.nom}
                </p>
                <p className="truncate text-xs text-slate-500">{c.email || c.telephone}</p>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={() => attach(c.id)}
                className="shrink-0 rounded-lg bg-nexus-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-nexus-orange-600 disabled:opacity-50"
              >
                Rattacher
              </button>
            </li>
          ))}
        </ul>
      ) : searched ? (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
          <Search className="h-3.5 w-3.5" />
          Aucune fiche client existante avec cet email/téléphone.
        </p>
      ) : null}

      {searched && (
        <button
          type="button"
          disabled={saving}
          onClick={createAndAttach}
          className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-nexus-blue-950 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-nexus-blue-900 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <UserPlus className="h-3.5 w-3.5" />
          )}
          Créer une fiche client
        </button>
      )}
    </div>
  );
}
