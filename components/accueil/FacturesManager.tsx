"use client";

// ============================================================================
// FACTURES — Espace Accueil & caisse (cahier §8-§9, 12/09/2026).
// La réceptionniste crée, émet et suit les factures ; chaque règlement passe
// par la caisse (session ouverte obligatoire — serveur + base) et produit
// son reçu 80 mm ; les corrections passent par un avoir tracé. La facture
// décrit ce que le client doit ; le reçu atteste ce qu'il a payé.
// ============================================================================

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FileText, Loader2, Plus, Printer, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { generatePosTicketPdf, openPdfForPrint, type PosTicketLine } from "./pos-ticket";
import type { RaccourciService } from "./CaisseLibre";

const inputClass =
  "w-full rounded-sm border border-line bg-surface px-3 py-2 text-body-sm text-ink placeholder:text-ink-subtle focus:border-line-strong focus:outline-none focus:ring-2 focus:ring-focus";

const UNITES = ["prestation", "page", "pièce", "heure", "jour", "unité"] as const;

export interface FactureRow {
  id: string;
  reference: string;
  type: "facture" | "avoir";
  parent_id: string | null;
  motif: string | null;
  client_nom: string;
  client_coordonnees: string | null;
  lignes: { designation: string; quantite: number; unite?: string; prix_unitaire: number }[];
  total: number;
  total_regle: number;
  echeance: string | null;
  conditions: string | null;
  status: string;
  emitted_at: string | null;
  created_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  brouillon: "Brouillon",
  emise: "Émise",
  partiellement_reglee: "Partiellement réglée",
  reglee: "Réglée",
  annulee: "Annulée",
};

function fcfa(n: number): string {
  return `${Math.round(n).toLocaleString("fr-FR")} FCFA`;
}

interface DraftLine {
  key: string;
  designation: string;
  quantite: string;
  unite: string;
  prix_unitaire: string;
}

export function FacturesManager({
  initialFactures,
  catalogue,
  conditionsDefaut,
  caissiereNom,
  sessionOuverte,
}: {
  initialFactures: FactureRow[];
  catalogue: RaccourciService[];
  conditionsDefaut: string;
  caissiereNom: string;
  sessionOuverte: boolean;
}) {
  const router = useRouter();
  const [factures, setFactures] = useState<FactureRow[]>(initialFactures);
  const [showForm, setShowForm] = useState(false);
  const [reglement, setReglement] = useState<FactureRow | null>(null);
  const [avoirCible, setAvoirCible] = useState<FactureRow | null>(null);

  const avoirsParFacture = useMemo(() => {
    const map: Record<string, number> = {};
    for (const f of factures) {
      if (f.type === "avoir" && f.parent_id && f.emitted_at) {
        map[f.parent_id] = (map[f.parent_id] || 0) + Number(f.total);
      }
    }
    return map;
  }, [factures]);

  async function reload() {
    const res = await fetch("/api/accueil/factures");
    const json = await res.json();
    if (json.success) setFactures(json.factures);
  }

  async function emettre(f: FactureRow) {
    const res = await fetch(`/api/accueil/factures/${f.id}/emettre`, { method: "POST" });
    const json = await res.json();
    if (!json.success) {
      toast.error(json.error || "Échec de l'émission");
      return;
    }
    toast.success(`Facture ${f.reference} émise — son contenu est désormais figé`);
    await reload();
  }

  const listeFactures = factures.filter((f) => f.type === "facture");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-body-sm text-ink-muted">
          La facture décrit ce que le client doit payer ; le reçu atteste chaque règlement.
        </p>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 whitespace-nowrap rounded-sm bg-brand px-4 py-2 text-body-sm font-semibold text-on-brand hover:bg-brand-hover"
        >
          <Plus className="h-4 w-4" />
          Nouvelle facture
        </button>
      </div>

      {listeFactures.length === 0 ? (
        <div className="rounded-sm border border-dashed border-line px-4 py-10 text-center">
          <FileText className="mx-auto h-8 w-8 text-ink-subtle" aria-hidden />
          <p className="mt-2 text-body-sm text-ink-muted">Aucune facture pour le moment.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-sm border border-line bg-surface-elevated">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-line text-caption font-semibold uppercase tracking-wide text-ink-muted">
                <th className="px-3 py-2.5">Référence</th>
                <th className="px-3 py-2.5">Client</th>
                <th className="px-3 py-2.5">Statut</th>
                <th className="px-3 py-2.5 text-right">Total</th>
                <th className="px-3 py-2.5 text-right">Réglé</th>
                <th className="px-3 py-2.5 text-right">Reste dû</th>
                <th className="px-3 py-2.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {listeFactures.map((f) => {
                const avoirs = avoirsParFacture[f.id] || 0;
                const reste = Math.max(0, Number(f.total) - Number(f.total_regle) - avoirs);
                const reglable = ["emise", "partiellement_reglee"].includes(f.status) && reste > 0;
                return (
                  <tr key={f.id}>
                    <td className="px-3 py-2.5 font-mono text-caption text-ink">{f.reference}</td>
                    <td className="px-3 py-2.5 text-body-sm font-medium text-ink">{f.client_nom}</td>
                    <td className="px-3 py-2.5">
                      <span className="rounded-sm border border-line px-2 py-0.5 text-caption font-semibold text-ink-muted">
                        {STATUS_LABELS[f.status] || f.status}
                      </span>
                      {avoirs > 0 && (
                        <span className="ml-1.5 text-caption text-ink-subtle">avoir {fcfa(avoirs)}</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right text-body-sm text-ink [font-variant-numeric:tabular-nums]">
                      {fcfa(Number(f.total))}
                    </td>
                    <td className="px-3 py-2.5 text-right text-body-sm text-ink-muted [font-variant-numeric:tabular-nums]">
                      {fcfa(Number(f.total_regle))}
                    </td>
                    <td className="px-3 py-2.5 text-right text-body-sm font-semibold text-ink [font-variant-numeric:tabular-nums]">
                      {reste > 0 ? fcfa(reste) : "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap gap-1.5">
                        {f.status === "brouillon" && (
                          <button
                            type="button"
                            onClick={() => emettre(f)}
                            className="whitespace-nowrap rounded-sm border border-line-strong px-2.5 py-1 text-caption font-semibold text-ink hover:bg-surface-sunken"
                          >
                            Émettre
                          </button>
                        )}
                        {f.emitted_at && (
                          <a
                            href={`/api/accueil/factures/${f.id}/pdf`}
                            target="_blank"
                            rel="noreferrer"
                            className="whitespace-nowrap rounded-sm border border-line px-2.5 py-1 text-caption font-semibold text-ink hover:border-line-strong"
                          >
                            PDF
                          </a>
                        )}
                        {reglable && (
                          <button
                            type="button"
                            disabled={!sessionOuverte}
                            title={sessionOuverte ? undefined : "Ouvrez votre caisse pour encaisser"}
                            onClick={() => setReglement(f)}
                            className="whitespace-nowrap rounded-sm border border-line px-2.5 py-1 text-caption font-semibold text-ink hover:border-line-strong disabled:opacity-50"
                          >
                            Régler
                          </button>
                        )}
                        {f.emitted_at && reste > 0 && (
                          <button
                            type="button"
                            onClick={() => setAvoirCible(f)}
                            className="whitespace-nowrap rounded-sm border border-line px-2.5 py-1 text-caption font-semibold text-ink-muted hover:border-line-strong"
                          >
                            Avoir
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {!sessionOuverte && (
        <p className="text-caption text-ink-subtle">
          Les règlements exigent une session de caisse ouverte — même règle que tout encaissement.
        </p>
      )}

      {showForm && (
        <NouvelleFactureModal
          catalogue={catalogue}
          conditionsDefaut={conditionsDefaut}
          onClose={() => setShowForm(false)}
          onDone={async () => {
            setShowForm(false);
            await reload();
          }}
        />
      )}
      {reglement && (
        <ReglementFactureModal
          facture={reglement}
          resteDu={Math.max(
            0,
            Number(reglement.total) - Number(reglement.total_regle) - (avoirsParFacture[reglement.id] || 0)
          )}
          caissiereNom={caissiereNom}
          onClose={() => setReglement(null)}
          onDone={async () => {
            setReglement(null);
            await reload();
            router.refresh();
          }}
        />
      )}
      {avoirCible && (
        <AvoirModal
          facture={avoirCible}
          resteDu={Math.max(
            0,
            Number(avoirCible.total) - Number(avoirCible.total_regle) - (avoirsParFacture[avoirCible.id] || 0)
          )}
          onClose={() => setAvoirCible(null)}
          onDone={async () => {
            setAvoirCible(null);
            await reload();
          }}
        />
      )}
    </div>
  );
}

// ── Création ─────────────────────────────────────────────────────────────────
function NouvelleFactureModal({
  catalogue,
  conditionsDefaut,
  onClose,
  onDone,
}: {
  catalogue: RaccourciService[];
  conditionsDefaut: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [clientNom, setClientNom] = useState("");
  const [coordonnees, setCoordonnees] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([
    { key: "1", designation: "", quantite: "1", unite: "prestation", prix_unitaire: "" },
  ]);
  const [echeance, setEcheance] = useState("");
  const [conditions, setConditions] = useState(conditionsDefaut);
  const [saving, setSaving] = useState(false);

  const total = lines.reduce(
    (s, l) => s + (parseInt(l.quantite) || 0) * (parseFloat(l.prix_unitaire) || 0),
    0
  );

  function setLine(key: string, patch: Partial<DraftLine>) {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  }

  function onDesignation(key: string, v: string) {
    const hit = catalogue.find((s) => s.nom.toLowerCase() === v.trim().toLowerCase());
    setLine(key, {
      designation: v,
      ...(hit && hit.tarif_type === "fixe" && hit.tarif_montant !== null
        ? { prix_unitaire: String(hit.tarif_montant) }
        : {}),
    });
  }

  async function submit(emettre: boolean) {
    if (clientNom.trim().length < 2) {
      toast.error("Nom du client requis");
      return;
    }
    const payload = lines
      .filter((l) => l.designation.trim())
      .map((l) => ({
        designation: l.designation.trim(),
        quantite: parseInt(l.quantite) || 0,
        unite: l.unite,
        prix_unitaire: parseFloat(l.prix_unitaire) || 0,
      }));
    if (payload.length === 0 || payload.some((l) => l.quantite <= 0 || l.prix_unitaire <= 0)) {
      toast.error("Chaque ligne exige désignation, quantité et prix > 0");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/accueil/factures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client: { nom: clientNom.trim(), coordonnees: coordonnees.trim() || undefined },
          lignes: payload,
          echeance: echeance || undefined,
          conditions,
          emettre,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Échec de la création");
        return;
      }
      toast.success(
        emettre
          ? `Facture ${json.facture.reference} émise`
          : `Brouillon ${json.facture.reference} enregistré`
      );
      onDone();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4" onClick={onClose}>
      <div className="my-8 w-full max-w-3xl rounded-sm border border-line bg-surface-elevated p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-title font-bold text-ink">Nouvelle facture</h3>
          <button type="button" onClick={onClose} className="rounded-sm p-1 text-ink-subtle hover:bg-surface-sunken" aria-label="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">Client *</span>
            <input type="text" value={clientNom} onChange={(e) => setClientNom(e.target.value)} className={cn(inputClass, "mt-1")} autoFocus />
          </label>
          <label className="block">
            <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">
              Coordonnées de facturation (facultatif)
            </span>
            <input
              type="text"
              value={coordonnees}
              onChange={(e) => setCoordonnees(e.target.value)}
              placeholder="Téléphone, e-mail, adresse…"
              className={cn(inputClass, "mt-1")}
            />
          </label>
        </div>

        <p className="mt-4 text-caption font-semibold uppercase tracking-wide text-ink-muted">Prestations</p>
        <datalist id="facture-catalogue">
          {catalogue.map((s) => (
            <option key={s.id} value={s.nom} />
          ))}
        </datalist>
        <div className="mt-1.5 space-y-2">
          {lines.map((l) => (
            <div key={l.key} className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_80px_120px_130px_auto]">
              <input
                type="text"
                list="facture-catalogue"
                value={l.designation}
                onChange={(e) => onDesignation(l.key, e.target.value)}
                placeholder="Désignation — choisir ou saisir"
                className={inputClass}
              />
              <input
                type="number"
                min={1}
                value={l.quantite}
                onChange={(e) => setLine(l.key, { quantite: e.target.value })}
                placeholder="Qté"
                className={inputClass}
              />
              <select value={l.unite} onChange={(e) => setLine(l.key, { unite: e.target.value })} className={cn(inputClass, "min-w-[110px]")}>
                {UNITES.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={0}
                value={l.prix_unitaire}
                onChange={(e) => setLine(l.key, { prix_unitaire: e.target.value })}
                placeholder="P.U. FCFA"
                className={inputClass}
              />
              <button
                type="button"
                disabled={lines.length === 1}
                onClick={() => setLines((prev) => prev.filter((x) => x.key !== l.key))}
                className="rounded-sm border border-line p-2 text-ink-subtle hover:border-line-strong disabled:opacity-40"
                aria-label="Retirer la ligne"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            setLines((prev) => [
              ...prev,
              { key: String(Date.now()), designation: "", quantite: "1", unite: "prestation", prix_unitaire: "" },
            ])
          }
          className="mt-2 inline-flex items-center gap-1.5 rounded-sm border border-line px-3 py-1.5 text-caption font-semibold text-ink hover:border-line-strong"
        >
          <Plus className="h-3.5 w-3.5" />
          Ajouter une ligne
        </button>

        <div className="mt-4 grid gap-3 sm:grid-cols-[200px_1fr]">
          <label className="block">
            <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">
              Échéance (défaut : à réception)
            </span>
            <input type="date" value={echeance} onChange={(e) => setEcheance(e.target.value)} className={cn(inputClass, "mt-1")} />
          </label>
          <div className="flex items-end justify-end">
            <p className="text-body font-bold text-ink [font-variant-numeric:tabular-nums]">
              Total : {total > 0 ? fcfa(total) : "—"}
            </p>
          </div>
        </div>
        <label className="mt-3 block">
          <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">
            Conditions de règlement (modifiables)
          </span>
          <textarea
            value={conditions}
            onChange={(e) => setConditions(e.target.value)}
            rows={4}
            className={cn(inputClass, "mt-1 font-sans text-caption leading-5")}
          />
        </label>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-sm border border-line px-4 py-2 text-body-sm font-semibold text-ink hover:border-line-strong">
            Annuler
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => submit(false)}
            className="rounded-sm border border-line-strong px-4 py-2 text-body-sm font-semibold text-ink hover:bg-surface-sunken disabled:opacity-50"
          >
            Enregistrer en brouillon
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => submit(true)}
            className="rounded-sm bg-brand px-4 py-2 text-body-sm font-semibold text-on-brand hover:bg-brand-hover disabled:opacity-50"
          >
            {saving ? "…" : "Émettre la facture"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Règlement (chaque paiement produit SON reçu 80 mm) ───────────────────────
function ReglementFactureModal({
  facture,
  resteDu,
  caissiereNom,
  onClose,
  onDone,
}: {
  facture: FactureRow;
  resteDu: number;
  caissiereNom: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [montant, setMontant] = useState(String(resteDu));
  const [mode, setMode] = useState<"especes" | "mobile_money">("especes");
  const [confirmation, setConfirmation] = useState("");
  const [saving, setSaving] = useState(false);
  const keyRef = useState(() => crypto.randomUUID())[0];

  async function submit() {
    const paid = parseFloat(montant);
    if (!Number.isFinite(paid) || paid <= 0 || paid > resteDu) {
      toast.error(`Montant entre 1 et ${resteDu} FCFA requis`);
      return;
    }
    if (mode !== "especes" && !confirmation.trim()) {
      toast.error("Référence de confirmation requise");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/accueil/factures/${facture.id}/reglement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          montant: paid,
          mode_paiement: mode,
          confirmation_reference: confirmation.trim() || undefined,
          ticket_key: keyRef,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Échec du règlement");
        return;
      }
      const reference = (json.sales as { reference: string | null }[])[0]?.reference || "TICKET";
      const resteApres = Number(json.reste_du ?? Math.max(0, resteDu - paid));
      const lignes: PosTicketLine[] = [
        {
          label: `Règlement facture ${facture.reference}`,
          quantite: 1,
          unite: "prestation",
          prix_unitaire: paid,
          montant_total: paid,
        },
      ];
      const bytes = await generatePosTicketPdf({
        reference,
        date: new Date(),
        clientNom: facture.client_nom,
        lignes,
        total: Number(facture.total),
        devise: "FCFA",
        modePaiement: mode === "especes" ? "Espèces" : "Mobile Money",
        caissiereNom,
        reglementsPrecedents: Number(facture.total_regle),
        acompte: { paye: paid, resteDu: resteApres },
      });
      const ok = openPdfForPrint(bytes);
      if (!ok) toast.error("Fenêtre d'impression bloquée — reçu disponible dans Paiements & reçus");
      toast.success(
        resteApres > 0 ? `Règlement encaissé — reste dû ${fcfa(resteApres)}` : `Facture ${facture.reference} soldée`
      );
      onDone();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-sm border border-line bg-surface-elevated p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-title font-bold text-ink">Régler {facture.reference}</h3>
          <button type="button" onClick={onClose} className="rounded-sm p-1 text-ink-subtle hover:bg-surface-sunken" aria-label="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-1 text-caption text-ink-muted">
          {facture.client_nom} · déjà réglé {fcfa(Number(facture.total_regle))} · reste {fcfa(resteDu)} — chaque
          règlement produit son propre reçu.
        </p>
        <label className="mt-4 block">
          <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">Montant FCFA *</span>
          <input type="number" min={1} max={resteDu} value={montant} onChange={(e) => setMontant(e.target.value)} className={cn(inputClass, "mt-1")} autoFocus />
        </label>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {(
            [
              ["especes", "Espèces"],
              ["mobile_money", "Mobile Money"],
            ] as const
          ).map(([m2, label]) => (
            <button
              key={m2}
              type="button"
              onClick={() => setMode(m2)}
              className={cn(
                "rounded-sm border px-3 py-2 text-body-sm font-semibold",
                mode === m2 ? "border-line-strong bg-surface-sunken text-ink" : "border-line text-ink-muted hover:border-line-strong"
              )}
            >
              {label}
            </button>
          ))}
        </div>
        {mode !== "especes" && (
          <label className="mt-3 block">
            <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">
              Référence de confirmation vérifiée *
            </span>
            <input type="text" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} className={cn(inputClass, "mt-1")} />
          </label>
        )}
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-sm border border-line px-4 py-2 text-body-sm font-semibold text-ink hover:border-line-strong">
            Annuler
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={submit}
            className="inline-flex items-center gap-2 rounded-sm bg-brand px-4 py-2 text-body-sm font-semibold text-on-brand hover:bg-brand-hover disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
            Encaisser et imprimer le reçu
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Avoir (correction tracée) ────────────────────────────────────────────────
function AvoirModal({
  facture,
  resteDu,
  onClose,
  onDone,
}: {
  facture: FactureRow;
  resteDu: number;
  onClose: () => void;
  onDone: () => void;
}) {
  const [montant, setMontant] = useState(String(resteDu));
  const [motif, setMotif] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    const m = parseFloat(montant);
    if (!Number.isFinite(m) || m <= 0 || m > resteDu) {
      toast.error(`Montant entre 1 et ${resteDu} FCFA requis (les paiements encaissés ne s'annulent pas par avoir)`);
      return;
    }
    if (motif.trim().length < 3) {
      toast.error("Motif obligatoire — un avoir est un circuit tracé");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/accueil/factures/${facture.id}/avoir`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ montant: m, motif: motif.trim() }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Échec de l'avoir");
        return;
      }
      toast.success(`Avoir ${json.avoir.reference} émis — la facture d'origine reste intacte`);
      onDone();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-sm border border-line bg-surface-elevated p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-title font-bold text-ink">Avoir sur {facture.reference}</h3>
          <button type="button" onClick={onClose} className="rounded-sm p-1 text-ink-subtle hover:bg-surface-sunken" aria-label="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-1 text-caption text-ink-muted">
          L&rsquo;avoir réduit le reste dû ({fcfa(resteDu)}) et laisse la facture d&rsquo;origine
          intacte — jamais de réécriture invisible.
        </p>
        <label className="mt-4 block">
          <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">Montant FCFA *</span>
          <input type="number" min={1} max={resteDu} value={montant} onChange={(e) => setMontant(e.target.value)} className={cn(inputClass, "mt-1")} />
        </label>
        <label className="mt-3 block">
          <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">Motif *</span>
          <input
            type="text"
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            placeholder="Ex. remise commerciale, erreur de saisie corrigée…"
            className={cn(inputClass, "mt-1")}
            autoFocus
          />
        </label>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-sm border border-line px-4 py-2 text-body-sm font-semibold text-ink hover:border-line-strong">
            Annuler
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={submit}
            className="rounded-sm bg-brand px-4 py-2 text-body-sm font-semibold text-on-brand hover:bg-brand-hover disabled:opacity-50"
          >
            {saving ? "…" : "Émettre l'avoir"}
          </button>
        </div>
      </div>
    </div>
  );
}
