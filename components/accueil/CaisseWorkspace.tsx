"use client";

// ============================================================================
// CAISSE — poste de travail unifié (cahier « reprise Accueil & caisse »
// 12/09/2026, §1-§3). UNE seule caisse, UNE seule session, deux modes de
// saisie présentés en onglets :
//   · Encaissement rapide (CaisseLibre) — clients de passage, saisie directe ;
//   · Vente catalogue (PosComptoir) — prestations enregistrées + dossier.
// Les deux onglets partagent la même session, la même route
// /api/accueil/pos, le même journal (quick_sales.session_id, trigger 091),
// les mêmes calculs (lib/caisse-server) et les mêmes reçus.
//
// Ordre d'affichage (§2) :
//   1. Session précédente soumise (a_cloturer) → état affiché, encaissements
//      bloqués (le trigger 091 les refuserait de toute façon).
//   2. Aucune session → écran « Ouvrir ma caisse » PRIORITAIRE : fonds
//      réellement compté, détail des coupures (facultatif mais vérifié),
//      observation, poste. L'encaissement n'apparaît qu'après confirmation
//      serveur de l'ouverture.
//   3. Session ouverte → onglets + bandeau de contexte permanent
//      (opératrice, poste, session, lien gestion).
// ============================================================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Banknote, Loader2, Lock, ShoppingCart, Wallet } from "lucide-react";
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

  // ── 1. Session soumise, en attente de validation : encaissements arrêtés ──
  if (session?.status === "a_cloturer") {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-sm border border-line bg-surface-elevated p-6 text-center">
          <Lock className="mx-auto h-8 w-8 text-ink-muted" aria-hidden />
          <h1 className="mt-3 font-display text-title text-ink">
            Journée soumise — encaissements arrêtés
          </h1>
          <p className="mt-2 text-body-sm text-ink-muted">
            Votre session du{" "}
            {new Date(session.opened_at).toLocaleString("fr-FR", {
              timeZone: "Africa/Bangui",
              day: "2-digit",
              month: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            est soumise et attend la validation financière. Aucun nouvel encaissement n&rsquo;est
            possible dans cette session — la protection est appliquée par la base de données,
            pas seulement par cet écran.
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
    );
  }

  // ── 2. Aucune session : ouverture obligatoire AVANT tout encaissement ──
  if (!session) {
    return <OuvrirMaCaisse caissiereNom={caissiereNom} poste={poste} />;
  }

  // ── 3. Session ouverte : bandeau de contexte + onglets ──
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-line bg-surface-elevated px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="inline-flex items-center gap-2 text-body-sm text-ink">
            <span className="h-2 w-2 rounded-full bg-status-success" aria-hidden />
            Caisse ouverte
          </span>
          <span className="text-body-sm text-ink-muted">
            {caissiereNom} · {poste} · depuis{" "}
            {new Date(session.opened_at).toLocaleTimeString("fr-FR", {
              timeZone: "Africa/Bangui",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <span className="text-body-sm text-ink-muted [font-variant-numeric:tabular-nums]">
            Espèces théoriques : {fcfa(session.especes_theoriques)}
          </span>
        </div>
        <Link
          href="/dashboard/accueil/session"
          className="whitespace-nowrap text-body-sm font-semibold text-ink underline-offset-2 hover:underline"
        >
          Gérer ma session
        </Link>
      </div>

      <div className="flex gap-1 border-b border-line" role="tablist">
        {(
          [
            ["rapide", "Encaissement rapide", Banknote],
            ["catalogue", "Vente catalogue (POS)", ShoppingCart],
          ] as const
        ).map(([key, label, Icon]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={cn(
              "inline-flex items-center gap-2 whitespace-nowrap rounded-t-sm border border-b-0 px-4 py-2.5 text-body-sm font-semibold transition-colors",
              tab === key
                ? "border-line bg-surface-elevated text-ink"
                : "border-transparent text-ink-muted hover:text-ink"
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </button>
        ))}
      </div>

      {/* Les deux modes restent montés sur la même session : changer d'onglet
          ne perd pas une saisie en cours. */}
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
    </div>
  );
}

// ── Écran d'ouverture obligatoire (§2) ───────────────────────────────────────
function OuvrirMaCaisse({ caissiereNom, poste }: { caissiereNom: string; poste: string }) {
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
      router.refresh();
    } finally {
      setOpening(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-sm border border-line bg-surface-elevated p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-surface-sunken">
            <Wallet className="h-5 w-5 text-ink" aria-hidden />
          </div>
          <div>
            <h1 className="font-display text-title text-ink">Ouvrir ma caisse</h1>
            <p className="text-caption text-ink-muted">
              {caissiereNom} · Poste : {poste} ·{" "}
              {new Date().toLocaleDateString("fr-FR", { timeZone: "Africa/Bangui" })}
            </p>
          </div>
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
