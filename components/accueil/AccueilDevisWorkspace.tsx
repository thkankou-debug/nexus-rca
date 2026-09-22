"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ClientPicker } from "./ClientPicker";
import type { AccueilClient } from "./NewClientModal";
import type { RaccourciService } from "./CaisseLibre";
import { tarifLabel } from "@/lib/accueil-forms";

const inputClass =
  "w-full rounded-sm border border-line bg-surface px-3 py-2 text-body-sm text-ink placeholder:text-ink-subtle focus:border-line-strong focus:outline-none focus:ring-2 focus:ring-focus";

type DevisStatus = "brouillon" | "envoye" | "accepte" | "refuse" | "expire";

export interface AccueilDevisItem {
  id: string;
  reference: string | null;
  status: DevisStatus;
  amount: number;
  currency: string;
  valid_until: string | null;
  created_at: string;
  demande_id: string | null;
  demandes: { reference: string | null; nom_complet: string; service: string } | null;
}

interface DossierOpt {
  id: string;
  reference: string | null;
  service: string;
  objet?: string | null;
}

interface Line {
  description: string;
  quantity: number;
  unit_price: number;
}

const STATUS_LABEL: Record<DevisStatus, string> = {
  brouillon: "Brouillon",
  envoye: "Envoyé",
  accepte: "Accepté",
  refuse: "Refusé",
  expire: "Expiré",
};

function money(n: number, c = "XAF") {
  return `${Math.round(n).toLocaleString("fr-FR")} ${c === "XAF" ? "FCFA" : c}`;
}

export function AccueilDevisWorkspace({
  initialDevis,
  initialClient,
  initialDemandeId,
  catalogue,
}: {
  initialDevis: AccueilDevisItem[];
  initialClient: AccueilClient | null;
  initialDemandeId: string | null;
  catalogue: RaccourciService[];
}) {
  const router = useRouter();
  const [devis, setDevis] = useState(initialDevis);
  const [client, setClient] = useState<AccueilClient | null>(initialClient);
  const [dossiers, setDossiers] = useState<DossierOpt[]>([]);
  const [demandeId, setDemandeId] = useState(initialDemandeId || "");
  const [validUntil, setValidUntil] = useState("");
  const [lignes, setLignes] = useState<Line[]>([{ description: "", quantity: 1, unit_price: 0 }]);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!client) {
      setDossiers([]);
      if (!initialDemandeId) setDemandeId("");
      return;
    }
    (async () => {
      const res = await fetch(`/api/accueil/dossiers?client_id=${encodeURIComponent(client.id)}`);
      const json = await res.json();
      if (json.success) setDossiers(json.dossiers || []);
    })();
  }, [client, initialDemandeId]);

  const total = lignes.reduce((s, l) => s + Number(l.quantity || 0) * Number(l.unit_price || 0), 0);

  async function reload() {
    const res = await fetch("/api/devis");
    const json = await res.json();
    if (json.success) setDevis(json.devis);
  }

  async function createDevis() {
    if (!demandeId) {
      toast.error("Sélectionnez un dossier");
      return;
    }
    if (lignes.some((l) => !l.description.trim() || l.quantity <= 0)) {
      toast.error("Chaque ligne requiert une description et une quantité > 0");
      return;
    }
    if (lignes.some((l) => !Number.isFinite(l.unit_price) || l.unit_price < 0)) {
      toast.error("Saisissez un prix unitaire (aucun tarif n'est inventé)");
      return;
    }
    if (total <= 0) {
      toast.error("Le total doit être > 0");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/devis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          demande_id: demandeId,
          valid_until: validUntil || null,
          lignes: lignes.map((l) => ({
            description: l.description.trim(),
            quantity: Number(l.quantity),
            unit_price: Number(l.unit_price),
          })),
        }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Échec de la création du devis");
        return;
      }
      toast.success(`Devis ${json.devis.reference || ""} créé — non payé`);
      setLignes([{ description: "", quantity: 1, unit_price: 0 }]);
      await reload();
    } finally {
      setSaving(false);
    }
  }

  async function transition(id: string, status: DevisStatus) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/devis/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Transition refusée");
        return;
      }
      toast.success(`Devis ${STATUS_LABEL[status].toLowerCase()}`);
      await reload();
    } finally {
      setBusyId(null);
    }
  }

  async function facturer(id: string) {
    setBusyId(id);
    try {
      const res = await fetch("/api/accueil/factures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ devis_id: id }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Échec de la facture");
        return;
      }
      toast.success(
        `Facture ${json.facture.reference} émise — 0 payé${json.replayed ? " (déjà existante)" : ""}`
      );
      router.push("/dashboard/accueil/factures");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <section className="space-y-4">
        <div className="rounded-sm border border-line bg-surface-elevated p-4">
          <h2 className="font-display text-title text-ink">Nouveau devis</h2>
          <p className="mt-1 text-caption text-ink-muted">
            Lié à un dossier. Une facture n&rsquo;est pas un paiement : après acceptation, générez la
            facture sans encaisser.
          </p>
          <div className="mt-3 space-y-3">
            <ClientPicker client={client} onChange={setClient} keepFieldsHint={false} />
            <label className="block">
              <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">
                Dossier *
              </span>
              <select
                className={cn(inputClass, "mt-1")}
                value={demandeId}
                onChange={(e) => setDemandeId(e.target.value)}
                disabled={!client}
              >
                <option value="">{client ? "Sélectionner un dossier" : "Choisissez un client"}</option>
                {dossiers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.reference || d.id.slice(0, 8)} — {d.service}
                  </option>
                ))}
              </select>
            </label>
            {client && dossiers.length === 0 ? (
              <a
                href={`/dashboard/accueil/dossier/nouveau?client=${client.id}`}
                className="inline-block text-body-sm font-semibold text-ink underline-offset-2 hover:underline"
              >
                Ouvrir d&rsquo;abord un dossier
              </a>
            ) : null}
            <label className="block">
              <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">
                Validité (optionnel)
              </span>
              <input
                type="date"
                className={cn(inputClass, "mt-1")}
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
              />
            </label>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">
                  Lignes
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setLignes((l) => [...l, { description: "", quantity: 1, unit_price: 0 }])
                  }
                  className="inline-flex items-center gap-1 text-caption font-semibold text-ink"
                >
                  <Plus className="h-3.5 w-3.5" /> Ligne
                </button>
              </div>
              <p className="mt-1 text-caption text-ink-muted">
                Prix saisi au poste. Catalogue indicatif uniquement — aucun tarif n&rsquo;est inventé.
              </p>
              <div className="mt-2 space-y-2">
                {lignes.map((l, i) => (
                  <div key={i} className="grid gap-2 sm:grid-cols-[1fr_72px_110px_36px]">
                    <input
                      className={inputClass}
                      placeholder="Désignation"
                      value={l.description}
                      list="catalogue-devis"
                      onChange={(e) =>
                        setLignes((prev) =>
                          prev.map((x, j) => (j === i ? { ...x, description: e.target.value } : x))
                        )
                      }
                    />
                    <input
                      className={inputClass}
                      type="number"
                      min={1}
                      value={l.quantity}
                      onChange={(e) =>
                        setLignes((prev) =>
                          prev.map((x, j) =>
                            j === i ? { ...x, quantity: Number(e.target.value) } : x
                          )
                        )
                      }
                    />
                    <input
                      className={inputClass}
                      type="number"
                      min={0}
                      placeholder="Prix"
                      value={l.unit_price || ""}
                      onChange={(e) =>
                        setLignes((prev) =>
                          prev.map((x, j) =>
                            j === i ? { ...x, unit_price: Number(e.target.value) } : x
                          )
                        )
                      }
                    />
                    <button
                      type="button"
                      disabled={lignes.length === 1}
                      onClick={() => setLignes((prev) => prev.filter((_, j) => j !== i))}
                      className="text-ink-muted disabled:opacity-30"
                      aria-label="Retirer la ligne"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <datalist id="catalogue-devis">
                {catalogue.map((s) => (
                  <option key={s.id} value={s.nom}>
                    {tarifLabel(s.tarif_type, s.tarif_montant)}
                  </option>
                ))}
              </datalist>
              <p className="mt-2 text-right text-body-sm font-semibold text-ink">{money(total)}</p>
            </div>
            <button
              type="button"
              disabled={saving}
              onClick={createDevis}
              className="inline-flex items-center gap-2 rounded-sm bg-brand px-4 py-2 text-body-sm font-semibold text-on-brand hover:bg-brand-hover disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Enregistrer le devis
            </button>
          </div>
        </div>

        <div className="rounded-sm border border-line bg-surface-elevated p-4">
          <h2 className="font-display text-title text-ink">Devis du poste</h2>
          {devis.length === 0 ? (
            <p className="mt-3 text-body-sm text-ink-muted">Aucun devis pour le moment.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {devis.map((d) => (
                <li key={d.id} className="py-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-caption text-ink-muted">{d.reference}</p>
                      <p className="text-body-sm font-semibold text-ink">
                        {d.demandes?.nom_complet || "—"}
                      </p>
                      <p className="text-caption text-ink-muted">
                        {[d.demandes?.service, d.demandes?.reference].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-body-sm font-semibold text-ink">
                        {money(Number(d.amount), d.currency)}
                      </p>
                      <span className="rounded-sm border border-line px-2 py-0.5 text-caption font-semibold text-ink-muted">
                        {STATUS_LABEL[d.status] || d.status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <a
                      href={`/api/devis/${d.id}/pdf`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-sm border border-line px-3 py-1 text-caption font-semibold text-ink hover:border-line-strong"
                    >
                      PDF
                    </a>
                    {d.status === "brouillon" ? (
                      <button
                        type="button"
                        disabled={busyId === d.id}
                        onClick={() => transition(d.id, "envoye")}
                        className="rounded-sm border border-line px-3 py-1 text-caption font-semibold text-ink"
                      >
                        Envoyer
                      </button>
                    ) : null}
                    {d.status === "envoye" ? (
                      <>
                        <button
                          type="button"
                          disabled={busyId === d.id}
                          onClick={() => transition(d.id, "accepte")}
                          className="rounded-sm bg-brand px-3 py-1 text-caption font-semibold text-on-brand"
                        >
                          Marquer accepté
                        </button>
                        <button
                          type="button"
                          disabled={busyId === d.id}
                          onClick={() => transition(d.id, "refuse")}
                          className="rounded-sm border border-line px-3 py-1 text-caption font-semibold text-ink"
                        >
                          Refuser
                        </button>
                      </>
                    ) : null}
                    {d.status === "accepte" ? (
                      <button
                        type="button"
                        disabled={busyId === d.id}
                        onClick={() => facturer(d.id)}
                        className="rounded-sm bg-brand px-3 py-1 text-caption font-semibold text-on-brand"
                      >
                        Créer la facture (0 payé)
                      </button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <aside className="h-fit rounded-sm border border-line bg-surface-elevated p-4">
        <h2 className="font-display text-title text-ink">Parcours</h2>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-body-sm text-ink-muted">
          <li>Rechercher ou créer le client</li>
          <li>Ouvrir un dossier</li>
          <li>Établir le devis</li>
          <li>Acceptation → facture (non payée)</li>
          <li>Encaisser en caisse → reçu 80 mm</li>
        </ol>
        <a
          href="/dashboard/accueil/caisse"
          className="mt-4 inline-flex w-full items-center justify-center rounded-sm border border-line px-4 py-2 text-body-sm font-semibold text-ink hover:border-line-strong"
        >
          Aller à la caisse
        </a>
      </aside>
    </div>
  );
}
