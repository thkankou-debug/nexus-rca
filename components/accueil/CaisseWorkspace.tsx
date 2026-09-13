"use client";

// ============================================================================
// CAISSE — poste de travail unifié, fidèle à la maquette « espace acceui et
// caisse.png » (Thierry, 12/09/2026) : barre « Caisse » + état de session +
// bouton « Ouvrir la caisse » (modal fonds/coupures/observation), onglets
// « Saisie rapide | Catalogue » avec « Nouvelle vente » à droite. Les deux
// modes partagent la même session, la même route /api/accueil/pos, le même
// journal (quick_sales.session_id, trigger 091) et les mêmes reçus.
// Caisse fermée : la saisie reste visible (maquette) mais AUCUN
// encaissement ne passe — bouton désactivé « Ouvrez la caisse pour
// encaisser. », refus serveur 409 et refus base (trigger 091).
// Journée soumise (a_cloturer) : encaissements arrêtés, état affiché (§6).
// ============================================================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Banknote, Loader2, Lock, Plus, ShoppingCart, Wallet, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SessionSnapshot } from "@/lib/accueil-server";
import { CaisseLibre, type RaccourciService } from "./CaisseLibre";
import { PosComptoir, type PosService, type PosAgent, type PosCredit } from "./PosComptoir";

const inputClass =
  "w-full rounded-sm border border-line bg-surface px-3 py-2 text-body-sm text-ink placeholder:text-ink-subtle focus:border-line-strong focus:outline-none focus:ring-2 focus:ring-focus";

// Coupures XAF en circulation (billets) + total des pièces en un champ.
const BILLETS = [10000, 5000, 2000, 1000, 500] as const;

function fcfa(n: number): string {
  return `${Math.round(n).toLocaleString("fr-FR")} FCFA`;
}

export function CaisseWorkspace({
  session,
  caissiereNom,
  poste = "Réception",
  raccourcis,
  catalogue,
  credits,
  services,
  agents,
  initialTab = "rapide",
}: {
  session: SessionSnapshot | null;
  caissiereNom: string;
  poste?: string;
  raccourcis: RaccourciService[];
  catalogue: RaccourciService[];
  credits: PosCredit[];
  services: PosService[];
  agents: PosAgent[];
  initialTab?: "rapide" | "catalogue";
}) {
  const [tab, setTab] = useState<"rapide" | "catalogue">(initialTab);
  const [showOuverture, setShowOuverture] = useState(false);

  const sessionOpen = session?.status === "ouverte";
  const soumise = session?.status === "a_cloturer";

  // Session interrompue (§6) : ouverte un jour précédent (heure de Bangui).
  const jourBangui = (d: string | Date) =>
    new Date(d).toLocaleDateString("fr-CA", { timeZone: "Africa/Bangui" });
  const sessionAnterieure = sessionOpen && jourBangui(session!.opened_at) < jourBangui(new Date());

  return (
    <div className="space-y-4">
      {/* ── Barre supérieure (maquette) : Caisse · état session · action ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <h1 className="font-display text-display-sm text-ink">Caisse</h1>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-elevated px-4 py-2 text-body-sm text-ink">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                sessionOpen ? "bg-status-success" : soumise ? "bg-status-waiting" : "bg-status-inert"
              )}
              aria-hidden
            />
            {sessionOpen ? "Session ouverte" : soumise ? "Journée soumise" : "Session à ouvrir"}
          </span>
          {!session && (
            <button
              type="button"
              onClick={() => setShowOuverture(true)}
              className="whitespace-nowrap rounded-sm border border-line-strong bg-surface-elevated px-4 py-2 text-body-sm font-semibold text-ink hover:bg-surface-sunken"
            >
              Ouvrir la caisse
            </button>
          )}
          {sessionOpen && (
            <span className="text-body-sm text-ink-muted [font-variant-numeric:tabular-nums]">
              {caissiereNom} · {poste} · espèces théoriques {fcfa(session!.especes_theoriques)}
            </span>
          )}
        </div>
      </div>

      {sessionAnterieure && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-status-waiting bg-surface-elevated px-4 py-2.5">
          <p className="text-body-sm font-semibold text-ink">
            Session ouverte depuis le{" "}
            {new Date(session!.opened_at).toLocaleDateString("fr-FR", { timeZone: "Africa/Bangui" })} —
            terminez la journée précédente (comptage et soumission) avant de poursuivre.
          </p>
          <Link
            href="/dashboard/accueil/session"
            className="whitespace-nowrap text-body-sm font-semibold text-ink underline-offset-2 hover:underline"
          >
            Terminer ma journée
          </Link>
        </div>
      )}

      {soumise ? (
        <div className="mx-auto max-w-2xl">
          <div className="rounded-sm border border-line bg-surface-elevated p-6 text-center">
            <Lock className="mx-auto h-8 w-8 text-ink-muted" aria-hidden />
            <h2 className="mt-3 font-display text-title text-ink">
              Journée soumise — encaissements arrêtés
            </h2>
            <p className="mt-2 text-body-sm text-ink-muted">
              Votre session attend la validation financière. Aucun nouvel encaissement n&rsquo;est
              possible dans cette session — la protection est appliquée par la base de données, pas
              seulement par cet écran.
            </p>
            <Link
              href="/dashboard/accueil/session"
              className="mt-4 inline-flex items-center gap-2 rounded-sm border border-line px-4 py-2 text-body-sm font-semibold text-ink hover:border-line-strong"
            >
              <Wallet className="h-4 w-4" />
              Voir l&rsquo;état de ma session
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* ── Onglets (maquette) + Nouvelle vente ── */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line">
            <div className="flex gap-1" role="tablist">
              {(
                [
                  ["rapide", "Saisie rapide", Banknote],
                  ["catalogue", "Catalogue", ShoppingCart],
                ] as const
              ).map(([key, label, Icon]) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={tab === key}
                  onClick={() => setTab(key)}
                  className={cn(
                    "inline-flex items-center gap-2 whitespace-nowrap rounded-t-sm border-b-2 px-4 py-2.5 text-body-sm font-semibold transition-colors",
                    tab === key
                      ? "border-brand text-ink"
                      : "border-transparent text-ink-muted hover:text-ink"
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {label}
                </button>
              ))}
            </div>
            {/* Vrai bouton (retour Thierry 12/09 : pas un simple texte). */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("nexus-caisse-nouvelle-vente"))}
              className="mb-1.5 inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm bg-brand px-4 py-2 text-body-sm font-semibold text-on-brand transition-colors hover:bg-brand-hover"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Nouvelle vente
            </button>
          </div>

          {/* Les deux modes restent montés : changer d'onglet ne perd rien. */}
          <div className={tab === "rapide" ? "" : "hidden"}>
            <CaisseLibre
              session={session}
              caissiereNom={caissiereNom}
              raccourcis={raccourcis}
              catalogue={catalogue}
              credits={credits}
              embedded
            />
          </div>
          <div className={tab === "catalogue" ? "" : "hidden"}>
            <PosComptoir
              services={services}
              agents={agents}
              session={session}
              caissiereNom={caissiereNom}
              credits={credits}
            />
          </div>
        </>
      )}

      {showOuverture && (
        <OuvrirMaCaisseModal
          caissiereNom={caissiereNom}
          poste={poste}
          onClose={() => setShowOuverture(false)}
        />
      )}
    </div>
  );
}

// ── Modal d'ouverture obligatoire (§2) : fonds réellement compté, coupures
//    vérifiées (client ET serveur), observation, poste, opératrice. ─────────
function OuvrirMaCaisseModal({
  caissiereNom,
  poste,
  onClose,
}: {
  caissiereNom: string;
  poste: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [fonds, setFonds] = useState("");
  const [avecCoupures, setAvecCoupures] = useState(false);
  const [billets, setBillets] = useState<Record<number, string>>({});
  const [pieces, setPieces] = useState("");
  const [note, setNote] = useState("");
  const [opening, setOpening] = useState(false);

  const totalCoupures =
    BILLETS.reduce((s, b) => s + b * (parseInt(billets[b] || "0") || 0), 0) +
    (parseInt(pieces) || 0);
  const fondsNum = parseFloat(fonds);
  const coupuresIncoherentes =
    avecCoupures && totalCoupures > 0 && Number.isFinite(fondsNum) && totalCoupures !== Math.round(fondsNum);

  async function ouvrir() {
    if (!Number.isFinite(fondsNum) || fondsNum < 0) {
      toast.error("Saisissez le fonds d'ouverture réellement compté");
      return;
    }
    if (coupuresIncoherentes) {
      toast.error("Le détail des coupures ne correspond pas au fonds compté");
      return;
    }
    setOpening(true);
    try {
      const breakdown: Record<string, number> = {};
      if (avecCoupures) {
        for (const b of BILLETS) {
          const n = parseInt(billets[b] || "0") || 0;
          if (n > 0) breakdown[String(b)] = n;
        }
        const p = parseInt(pieces) || 0;
        if (p > 0) breakdown.pieces = p;
      }
      const res = await fetch("/api/caisse-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opening_balance: fondsNum,
          opening_breakdown: Object.keys(breakdown).length > 0 ? breakdown : undefined,
          opening_note: note.trim() || undefined,
          poste,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Échec de l'ouverture");
        return;
      }
      toast.success("Caisse ouverte — bonne journée !");
      onClose();
      router.refresh();
    } finally {
      setOpening(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4" onClick={onClose}>
      <div className="my-8 w-full max-w-2xl rounded-sm border border-line bg-surface-elevated p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-surface-sunken">
              <Wallet className="h-5 w-5 text-ink" aria-hidden />
            </div>
            <div>
              <h2 className="font-display text-title text-ink">Ouvrir ma caisse</h2>
              <p className="text-caption text-ink-muted">
                {caissiereNom} · Poste : {poste} ·{" "}
                {new Date().toLocaleDateString("fr-FR", { timeZone: "Africa/Bangui" })}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-sm p-1 text-ink-subtle hover:bg-surface-sunken" aria-label="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-4 rounded-sm bg-surface-sunken px-3 py-2 text-body-sm text-ink-muted">
          Aucun encaissement n&rsquo;est possible avant l&rsquo;ouverture — la règle est appliquée
          par le serveur et la base de données, sur tous les écrans.
        </p>

        <label className="mt-4 block">
          <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">
            Fonds d&rsquo;ouverture réellement compté · FCFA *
          </span>
          <input
            type="number"
            min={0}
            value={fonds}
            onChange={(e) => setFonds(e.target.value)}
            placeholder="Comptez le tiroir puis saisissez le montant"
            className={cn(inputClass, "mt-1")}
            autoFocus
          />
        </label>

        <label className="mt-3 flex cursor-pointer items-center gap-2 text-body-sm text-ink">
          <input
            type="checkbox"
            checked={avecCoupures}
            onChange={(e) => setAvecCoupures(e.target.checked)}
            className="h-4 w-4 accent-[rgb(var(--brand))]"
          />
          Détailler les coupures comptées (recommandé)
        </label>

        {avecCoupures && (
          <div className="mt-2 rounded-sm border border-line p-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {BILLETS.map((b) => (
                <label key={b} className="block">
                  <span className="text-caption font-semibold text-ink-muted">
                    {b.toLocaleString("fr-FR")} FCFA ×
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={billets[b] || ""}
                    onChange={(e) => setBillets((prev) => ({ ...prev, [b]: e.target.value }))}
                    className={cn(inputClass, "mt-1 py-1.5")}
                  />
                </label>
              ))}
              <label className="block">
                <span className="text-caption font-semibold text-ink-muted">Pièces · total FCFA</span>
                <input
                  type="number"
                  min={0}
                  value={pieces}
                  onChange={(e) => setPieces(e.target.value)}
                  className={cn(inputClass, "mt-1 py-1.5")}
                />
              </label>
            </div>
            <p
              className={cn(
                "mt-2 text-body-sm font-semibold [font-variant-numeric:tabular-nums]",
                coupuresIncoherentes ? "text-status-failure" : "text-ink"
              )}
            >
              Total des coupures : {fcfa(totalCoupures)}
              {coupuresIncoherentes && " — ne correspond pas au fonds saisi"}
            </p>
            <button
              type="button"
              disabled={totalCoupures <= 0}
              onClick={() => setFonds(String(totalCoupures))}
              className="mt-1 rounded-sm border border-line px-2 py-1 text-caption font-semibold text-ink hover:border-line-strong disabled:opacity-50"
            >
              Utiliser ce total comme fonds d&rsquo;ouverture
            </button>
          </div>
        )}

        <label className="mt-3 block">
          <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">
            Observation (facultatif)
          </span>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ex. fonds remis par la direction, billet abîmé…"
            className={cn(inputClass, "mt-1")}
          />
        </label>

        <button
          type="button"
          disabled={opening}
          onClick={ouvrir}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-brand px-4 py-3 text-body font-semibold text-on-brand transition-colors hover:bg-brand-hover disabled:opacity-60"
        >
          {opening ? <Loader2 className="h-5 w-5 animate-spin" /> : <Wallet className="h-5 w-5" />}
          Ouvrir ma caisse et commencer la journée
        </button>
      </div>
    </div>
  );
}
