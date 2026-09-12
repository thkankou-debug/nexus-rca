"use client";

// ============================================================================
// ENCAISSEMENT LIBRE — page d'accueil de la réception (maquette « page
// d'encaissement libre.png », instruction Thierry 12/09/2026).
// Poste de caisse professionnel : saisie de prestation AU PREMIER PLAN,
// client de passage sans fiche, ticket multi-lignes avec unité, mise en
// attente/reprise (brouillons locaux du poste), paiement, reçu 80 mm avec
// impression automatique (boîte de dialogue du poste — l'impression
// silencieuse attend la configuration matérielle, voir page Imprimante).
// États d'impression honnêtes (§10) : jamais « Imprimé » sans preuve.
// Différences volontaires avec la maquette (§14) : pas de mention
// maquette ; « Carte » masquée (aucun terminal configuré — Mobile Money
// reste, avec référence de confirmation vérifiée) ; états réels partout.
// ============================================================================

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Banknote,
  FileDown,
  Loader2,
  Pause,
  Play,
  Plus,
  Printer,
  RotateCcw,
  Search,
  Shield,
  Smartphone,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SessionSnapshot } from "@/lib/accueil-server";
import {
  generatePosTicketPdf,
  openPdfForPrint,
  downloadPdf,
  pdfBlobUrl,
  type PosTicketLine,
} from "./pos-ticket";
import type { PosCredit } from "./PosComptoir";

const inputClass =
  "w-full rounded-sm border border-line bg-surface px-3 py-2 text-body-sm text-ink placeholder:text-ink-subtle focus:border-line-strong focus:outline-none focus:ring-2 focus:ring-focus";

const UNITES = ["prestation", "page", "pièce", "heure", "jour", "unité"] as const;

export interface RaccourciService {
  id: string;
  nom: string;
  tarif_type: "fixe" | "sur_devis";
  tarif_montant: number | null;
}

interface FoundClient {
  id: string;
  reference: string | null;
  type: string;
  nom: string;
  prenom: string | null;
  raison_sociale: string | null;
  email: string | null;
  telephone: string | null;
}

interface Dossier {
  id: string;
  reference: string | null;
  service: string;
}

interface Line {
  key: string;
  label: string;
  description?: string;
  quantite: number;
  unite: string;
  prix_unitaire: number;
  nature: "prestation" | "caution";
}

interface Draft {
  id: string;
  savedAt: string;
  clientNom: string | null;
  lines: Line[];
}

type PrintStatus = "idle" | "attente" | "envoye" | "echec";

const DRAFTS_KEY = "nexus_caisse_drafts";
const AUTOPRINT_KEY = "nexus_caisse_autoprint";

function clientName(c: FoundClient): string {
  return c.type === "particulier"
    ? [c.prenom, c.nom].filter(Boolean).join(" ") || c.nom
    : c.raison_sociale || c.nom;
}

function fcfa(n: number): string {
  return `${Math.round(n).toLocaleString("fr-FR")} FCFA`;
}

export function CaisseLibre({
  session,
  caissiereNom,
  raccourcis,
  catalogue = [],
  credits = [],
  embedded = false,
}: {
  session: SessionSnapshot | null;
  caissiereNom: string;
  raccourcis: RaccourciService[];
  /** Catalogue complet des services actifs — la désignation se choisit OU se saisit. */
  catalogue?: RaccourciService[];
  credits?: PosCredit[];
  /** true = monté dans le poste de travail Caisse (onglet) : le bandeau de
      contexte du workspace remplace le titre et le pill session locaux. */
  embedded?: boolean;
}) {
  const router = useRouter();
  const sessionOpen = session?.status === "ouverte";

  // ── 1 · Client ──
  const [clientMode, setClientMode] = useState<"passage" | "recherche">("passage");
  const [passageNom, setPassageNom] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [results, setResults] = useState<FoundClient[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchDone, setSearchDone] = useState(false);
  const [client, setClient] = useState<FoundClient | null>(null);
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [dossierId, setDossierId] = useState<string | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Retour Thierry 12/09 (« la recherche ne marche pas ») : chaque état est
  // désormais VISIBLE — recherche en cours, zéro résultat, erreur (session
  // expirée, permission, réseau). Plus jamais un écran muet.
  useEffect(() => {
    if (clientMode !== "recherche") return;
    if (searchTimer.current) clearTimeout(searchTimer.current);
    const q = searchQ.trim();
    if (q.length < 2) {
      setResults([]);
      setSearchError(null);
      setSearchDone(false);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      setSearchError(null);
      try {
        const res = await fetch(`/api/accueil/clients?q=${encodeURIComponent(q)}`);
        const json = await res.json();
        if (json.success) {
          setResults(json.clients);
          setSearchDone(true);
        } else {
          setResults([]);
          setSearchDone(false);
          setSearchError(
            res.status === 401 || res.status === 403
              ? "Session expirée ou accès refusé — rechargez la page (F5) et reconnectez-vous."
              : json.error || "Recherche impossible — réessayez."
          );
        }
      } catch {
        setResults([]);
        setSearchDone(false);
        setSearchError("Réseau indisponible — vérifiez la connexion puis réessayez.");
      } finally {
        setSearching(false);
      }
    }, 300);
  }, [searchQ, clientMode]);

  async function pickClient(c: FoundClient) {
    setClient(c);
    setSearchQ("");
    setResults([]);
    setSearchDone(false);
    setDossierId(null);
    try {
      const res = await fetch(`/api/accueil/clients/${c.id}`);
      const json = await res.json();
      if (json.success) {
        setDossiers(json.dossiers);
      } else {
        setDossiers([]);
        toast.error(json.error || "Dossiers du client indisponibles — l'encaissement reste possible");
      }
    } catch {
      setDossiers([]);
      toast.error("Dossiers du client indisponibles — l'encaissement reste possible");
    }
  }

  // ── 2 · Prestation ──
  const [designation, setDesignation] = useState("");
  const [qty, setQty] = useState("1");
  const [unite, setUnite] = useState<string>("prestation");
  const [pu, setPu] = useState("");
  const [description, setDescription] = useState("");
  const [isCaution, setIsCaution] = useState(false);
  const designationRef = useRef<HTMLInputElement>(null);
  const puRef = useRef<HTMLInputElement>(null);

  const lineTotal = (parseInt(qty) || 0) * (parseFloat(pu) || 0);

  // Choisir OU saisir : si la désignation correspond exactement à un service
  // du catalogue à tarif fixe, le prix se préremplit (modifiable ensuite).
  function onDesignationChange(v: string) {
    setDesignation(v);
    const hit = catalogue.find((s) => s.nom.toLowerCase() === v.trim().toLowerCase());
    if (hit && hit.tarif_type === "fixe" && hit.tarif_montant !== null) {
      setPu(String(hit.tarif_montant));
    }
  }

  // ── 3 · Ticket ──
  const [lines, setLines] = useState<Line[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [showDrafts, setShowDrafts] = useState(false);

  useEffect(() => {
    try {
      setDrafts(JSON.parse(localStorage.getItem(DRAFTS_KEY) || "[]"));
    } catch {
      setDrafts([]);
    }
  }, []);

  function persistDrafts(next: Draft[]) {
    setDrafts(next);
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(next));
  }

  function addLine() {
    const q = parseInt(qty) || 0;
    const p = parseFloat(pu);
    if (!designation.trim()) {
      toast.error("La désignation de la prestation est obligatoire");
      designationRef.current?.focus();
      return;
    }
    if (q <= 0 || !Number.isFinite(p) || p <= 0) {
      toast.error("Quantité et prix unitaire valides requis");
      return;
    }
    setLines((prev) => [
      ...prev,
      {
        key: `${Date.now()}-${prev.length}`,
        label: designation.trim(),
        description: description.trim() || undefined,
        quantite: q,
        unite,
        prix_unitaire: p,
        nature: isCaution ? "caution" : "prestation",
      },
    ]);
    setDesignation("");
    setQty("1");
    setUnite("prestation");
    setPu("");
    setDescription("");
    setIsCaution(false);
    designationRef.current?.focus();
  }

  function applyRaccourci(r: RaccourciService) {
    setDesignation(r.nom);
    setUnite("prestation");
    if (r.tarif_type === "fixe" && r.tarif_montant !== null) setPu(String(r.tarif_montant));
    designationRef.current?.focus();
  }

  // Ligne en cours de saisie : si elle est complète, elle est comptée et
  // encaissée AUTOMATIQUEMENT — pas besoin de cliquer « Ajouter au ticket »
  // pour un encaissement simple (consigne Thierry 12/09 : rapide, un clic).
  const pending = useMemo<Line | null>(() => {
    const q = parseInt(qty) || 0;
    const p = parseFloat(pu);
    if (!designation.trim() || q <= 0 || !Number.isFinite(p) || p <= 0) return null;
    return {
      key: "__pending__",
      label: designation.trim(),
      description: description.trim() || undefined,
      quantite: q,
      unite,
      prix_unitaire: p,
      nature: isCaution ? "caution" : "prestation",
    };
  }, [designation, qty, pu, description, unite, isCaution]);

  const allLines = pending ? [...lines, pending] : lines;
  const total = allLines.reduce((s, l) => s + l.quantite * l.prix_unitaire, 0);
  const cautionTotal = allLines
    .filter((l) => l.nature === "caution")
    .reduce((s, l) => s + l.quantite * l.prix_unitaire, 0);
  const hasCaution = cautionTotal > 0;

  // ── Paiement ──
  const [payMode, setPayMode] = useState<"especes" | "mobile_money">("especes");
  const [montantRecu, setMontantRecu] = useState("");
  const [confirmationRef, setConfirmationRef] = useState("");
  const [partiel, setPartiel] = useState(false);
  const [montantAffecte, setMontantAffecte] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);
  const ticketKeyRef = useRef<string | null>(null);

  const affecte = parseFloat(montantAffecte) || 0;
  const duMaintenant = partiel ? affecte : total;
  const recu = parseFloat(montantRecu) || 0;
  const monnaie = payMode === "especes" && recu > duMaintenant ? recu - duMaintenant : 0;

  const blocked = !sessionOpen
    ? "Ouvrez la caisse pour encaisser."
    : allLines.length === 0
    ? "Saisissez une prestation (désignation + prix) pour encaisser."
    : partiel && hasCaution
    ? "Une caution se paie comptant — retirez-la ou désactivez le paiement partiel."
    : partiel && (affecte <= 0 || affecte >= total)
    ? "Saisissez un montant partiel entre 1 et le total."
    : payMode !== "especes" && !confirmationRef.trim()
    ? "Référence de confirmation Mobile Money requise (vérifiée, pas annoncée)."
    : payMode === "especes" && recu < duMaintenant
    ? "Le montant reçu est inférieur au montant à encaisser."
    : null;

  // ── Reçu & impression ──
  const [lastReceipt, setLastReceipt] = useState<{
    reference: string;
    bytes: Uint8Array;
    url: string;
  } | null>(null);
  const [printStatus, setPrintStatus] = useState<PrintStatus>("idle");
  const [autoPrint, setAutoPrint] = useState(true);
  useEffect(() => {
    setAutoPrint(localStorage.getItem(AUTOPRINT_KEY) !== "0");
  }, []);

  function doPrint(bytes: Uint8Array) {
    setPrintStatus("attente");
    const ok = openPdfForPrint(bytes);
    // §10 : jamais « Imprimé » sur la seule ouverture d'une fenêtre — l'état
    // dit ce qui est prouvable : la boîte d'impression a été ouverte, ou pas.
    setPrintStatus(ok ? "envoye" : "echec");
    if (!ok) toast.error("Fenêtre d'impression bloquée — utilisez Réimprimer");
  }

  async function checkout() {
    if (blocked) return;
    if (!ticketKeyRef.current) ticketKeyRef.current = crypto.randomUUID();
    setCheckingOut(true);
    try {
      const res = await fetch("/api/accueil/pos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticket_key: ticketKeyRef.current,
          client: client
            ? { record_id: client.id, nom: clientName(client), email: client.email, telephone: client.telephone }
            : passageNom.trim()
            ? { nom: passageNom.trim() }
            : undefined,
          demande_id: dossierId,
          lignes: allLines.map((l) => ({
            label: l.label,
            description: l.description,
            quantite: l.quantite,
            unite: l.unite,
            prix_unitaire: l.prix_unitaire,
            nature: l.nature,
          })),
          mode_paiement: payMode,
          montant_recu: payMode === "especes" ? recu : undefined,
          confirmation_reference: confirmationRef.trim() || undefined,
          montant_affecte: partiel ? affecte : undefined,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Échec de l'encaissement");
        return;
      }

      const reference = (json.sales as { reference: string | null }[])[0]?.reference || "TICKET";
      const credit = json.credit as { reste_du: number } | undefined;
      const ticketLines: PosTicketLine[] = allLines.map((l) => ({
        label: l.label + (l.description ? ` — ${l.description}` : ""),
        quantite: l.quantite,
        unite: l.unite,
        prix_unitaire: l.prix_unitaire,
        montant_total: l.quantite * l.prix_unitaire,
        caution: l.nature === "caution",
      }));
      const bytes = await generatePosTicketPdf({
        reference,
        date: new Date(),
        clientNom: client ? clientName(client) : passageNom.trim() || null,
        dossierReference: dossierId ? dossiers.find((d) => d.id === dossierId)?.reference || null : null,
        lignes: ticketLines,
        total,
        devise: "FCFA",
        modePaiement: payMode === "especes" ? "Espèces" : "Mobile Money",
        montantRecu: payMode === "especes" ? recu : null,
        monnaieRendue: payMode === "especes" ? monnaie : null,
        caissiereNom,
        cautionTotal: hasCaution ? cautionTotal : null,
        acompte: credit ? { paye: duMaintenant, resteDu: credit.reste_du } : null,
      });
      setLastReceipt({ reference, bytes, url: pdfBlobUrl(bytes) });

      // Nouvelle transaction propre (formulaire de saisie compris).
      setLines([]);
      setDesignation("");
      setQty("1");
      setUnite("prestation");
      setPu("");
      setDescription("");
      setIsCaution(false);
      setMontantRecu("");
      setConfirmationRef("");
      setPartiel(false);
      setMontantAffecte("");
      setDossierId(null);
      setPassageNom("");
      setClient(null);
      setDossiers([]);
      ticketKeyRef.current = null;
      toast.success(
        json.replayed
          ? "Ticket déjà enregistré — résultat initial repris, aucun doublon"
          : credit
          ? `Acompte enregistré — reste dû ${fcfa(credit.reste_du)} (créance suivie)`
          : "Paiement enregistré"
      );
      if (autoPrint) doPrint(bytes);
      if (credit) router.refresh();
    } finally {
      setCheckingOut(false);
    }
  }

  // Règlement d'une créance (reste dû existant).
  const [reglement, setReglement] = useState<PosCredit | null>(null);

  async function testerImprimante() {
    const bytes = await generatePosTicketPdf({
      reference: "TEST-IMPRIMANTE",
      date: new Date(),
      lignes: [
        { label: "Ligne de test — accents : é è à ç ù Ê Î ô", quantite: 1, unite: "prestation", prix_unitaire: 0, montant_total: 0 },
      ],
      total: 0,
      devise: "FCFA",
      modePaiement: "—",
      caissiereNom,
      test: true,
    });
    doPrint(bytes);
  }

  function nouvelleTransaction() {
    if (allLines.length > 0 && !confirm("Le ticket en cours n'est pas enregistré. L'abandonner ?")) return;
    setLines([]);
    setDesignation("");
    setQty("1");
    setUnite("prestation");
    setPu("");
    setDescription("");
    setIsCaution(false);
    setClient(null);
    setDossiers([]);
    setDossierId(null);
    setPassageNom("");
    setMontantRecu("");
    setConfirmationRef("");
    setPartiel(false);
    setMontantAffecte("");
    ticketKeyRef.current = null;
    designationRef.current?.focus();
  }

  // ── Ouverture de caisse rapide (barre supérieure) ──
  const [fonds, setFonds] = useState("");
  const [opening, setOpening] = useState(false);
  async function ouvrirCaisse() {
    const v = parseFloat(fonds);
    if (!Number.isFinite(v) || v < 0) {
      toast.error("Saisissez le fonds initial réellement compté");
      return;
    }
    setOpening(true);
    try {
      const res = await fetch("/api/caisse-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opening_balance: v }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Échec de l'ouverture");
        return;
      }
      toast.success("Caisse ouverte");
      router.refresh();
    } finally {
      setOpening(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* ── Barre supérieure : titre, transaction, session, imprimante ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        {!embedded && (
          <div>
            <h1 className="font-display text-display-sm text-ink">Encaissement libre</h1>
            <p className="mt-0.5 text-body-sm text-ink-muted">Page d&rsquo;accueil de la réception</p>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={nouvelleTransaction}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm border border-line px-3 py-2 text-body-sm font-semibold text-ink hover:border-line-strong"
          >
            <Plus className="h-4 w-4" />
            Nouvelle transaction
          </button>
          {!embedded && (
          <div className="flex items-center gap-2 rounded-sm border border-line bg-surface-elevated px-3 py-1.5">
            <span
              className={cn("h-2 w-2 rounded-full", sessionOpen ? "bg-status-success" : "bg-status-failure")}
              aria-hidden
            />
            <span className="text-body-sm text-ink">
              Session de caisse : {sessionOpen ? "ouverte" : session?.status === "a_cloturer" ? "soumise" : "à ouvrir"}
            </span>
            {!sessionOpen && session?.status !== "a_cloturer" && (
              <>
                <input
                  type="number"
                  min={0}
                  value={fonds}
                  onChange={(e) => setFonds(e.target.value)}
                  placeholder="Fonds initial"
                  className={cn(inputClass, "w-32 py-1")}
                />
                <button
                  type="button"
                  disabled={opening}
                  onClick={ouvrirCaisse}
                  className="rounded-sm border border-line-strong px-3 py-1 text-body-sm font-semibold text-ink hover:bg-surface-sunken disabled:opacity-50"
                >
                  {opening ? "Ouverture…" : "Ouvrir la caisse"}
                </button>
              </>
            )}
          </div>
          )}
          <div className="flex items-center gap-2 rounded-sm border border-line bg-surface-elevated px-3 py-2">
            <Printer className="h-4 w-4 text-ink-muted" aria-hidden />
            <span className="text-body-sm text-ink-muted">
              Impression : boîte de dialogue du poste
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_400px]">
        {/* ══ Colonne principale ══ */}
        <div className="space-y-4">
          {/* 1 · Client */}
          <section className="rounded-sm border border-line bg-surface-elevated p-4">
            <h2 className="font-display text-title text-ink">1. Client</h2>
            <div className="mt-2 flex flex-wrap gap-4">
              {(
                [
                  ["passage", "Client de passage"],
                  ["recherche", "Rechercher un client"],
                ] as const
              ).map(([mode, label]) => (
                <label key={mode} className="flex cursor-pointer items-center gap-2 text-body-sm text-ink">
                  <input
                    type="radio"
                    checked={clientMode === mode}
                    onChange={() => {
                      setClientMode(mode);
                      if (mode === "passage") {
                        setClient(null);
                        setDossiers([]);
                        setDossierId(null);
                      }
                    }}
                    className="h-4 w-4 accent-[rgb(var(--brand))]"
                  />
                  {label}
                </label>
              ))}
            </div>
            <div className={cn("mt-3 grid gap-3", clientMode === "recherche" && "sm:grid-cols-[2fr_1fr]")}>
              {clientMode === "passage" ? (
                <label className="block">
                  <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">
                    Nom / téléphone (facultatif)
                  </span>
                  <input
                    type="text"
                    value={passageNom}
                    onChange={(e) => setPassageNom(e.target.value)}
                    placeholder="Saisir un nom ou un numéro de téléphone"
                    className={cn(inputClass, "mt-1")}
                  />
                </label>
              ) : client ? (
                <div className="flex items-center justify-between rounded-sm border border-line-strong bg-surface px-3 py-2">
                  <div>
                    <p className="text-body-sm font-semibold text-ink">{clientName(client)}</p>
                    <p className="text-caption text-ink-muted">
                      {[client.reference, client.telephone, client.email].filter(Boolean).join(" · ") ||
                        "Fiche sans coordonnées"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setClient(null);
                      setDossiers([]);
                      setDossierId(null);
                    }}
                    className="rounded-sm p-1 text-ink-subtle hover:bg-surface-sunken"
                    aria-label="Retirer le client"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">
                    Rechercher (nom, téléphone, référence)
                  </span>
                  <div className="relative mt-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
                    <input
                      type="text"
                      value={searchQ}
                      onChange={(e) => setSearchQ(e.target.value)}
                      className={cn(inputClass, "pl-9")}
                    />
                  </div>
                  {results.length > 0 && (
                    <ul className="absolute z-10 mt-1 w-full divide-y divide-line rounded-sm border border-line bg-surface-overlay shadow-lg">
                      {results.map((c) => (
                        <li key={c.id}>
                          <button
                            type="button"
                            onClick={() => pickClient(c)}
                            className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-surface-sunken"
                          >
                            <span className="text-body-sm text-ink">{clientName(c)}</span>
                            <span className="text-caption text-ink-muted">{c.telephone || c.reference}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {searching && <p className="mt-1 text-caption text-ink-muted">Recherche…</p>}
                  {searchError && (
                    <p className="mt-1 rounded-sm border border-status-failure px-2 py-1 text-caption font-semibold text-status-failure">
                      {searchError}
                    </p>
                  )}
                  {!searching && !searchError && searchDone && results.length === 0 && (
                    <p className="mt-1 text-caption text-ink-muted">
                      Aucun client trouvé pour « {searchQ.trim()} » — vérifiez l&rsquo;orthographe ou
                      créez la fiche dans Clients &amp; dossiers.
                    </p>
                  )}
                </div>
              )}
              {/* Le rattachement à un dossier n'existe qu'avec une fiche
                  client — en mode passage le sélecteur n'apparaît pas
                  (retour Thierry 12/09 : le bouton grisé semblait cassé). */}
              {clientMode === "recherche" && (
                <div>
                  <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">
                    Dossier (facultatif)
                  </span>
                  {client && dossiers.length > 0 ? (
                    <select
                      value={dossierId ?? ""}
                      onChange={(e) => setDossierId(e.target.value || null)}
                      className={cn(inputClass, "mt-1")}
                    >
                      <option value="">Aucun rattachement</option>
                      {dossiers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {[d.reference, d.service].filter(Boolean).join(" · ")}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="mt-1 rounded-sm border border-dashed border-line px-3 py-2 text-body-sm text-ink-subtle">
                      {client
                        ? "Ce client n'a aucun dossier — l'encaissement reste possible sans rattachement."
                        : "Choisissez d'abord un client pour voir ses dossiers."}
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* 2 · Prestation à encaisser */}
          <section className="rounded-sm border border-line bg-surface-elevated p-4">
            <h2 className="font-display text-title text-ink">2. Prestation à encaisser</h2>
            <label className="mt-3 block">
              <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">
                Désignation de la prestation * — choisir dans la liste ou saisir librement
              </span>
              <input
                ref={designationRef}
                type="text"
                list="caisse-catalogue"
                value={designation}
                onChange={(e) => onDesignationChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    puRef.current?.focus();
                  }
                }}
                placeholder="Ex. Photocopies, Visa Schengen… ou tout autre service à préciser"
                className={cn(inputClass, "mt-1")}
              />
              {/* Choisir OU saisir : tout le catalogue actif est proposé,
                  la saisie libre reste toujours possible (caisse ouverte). */}
              <datalist id="caisse-catalogue">
                {catalogue.map((s) => (
                  <option key={s.id} value={s.nom} />
                ))}
              </datalist>
            </label>
            <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-[minmax(96px,0.6fr)_minmax(136px,0.8fr)_minmax(150px,1.2fr)_minmax(130px,1fr)]">
              <label className="block">
                <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">Quantité *</span>
                <input
                  type="number"
                  min={1}
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  className={cn(inputClass, "mt-1")}
                />
              </label>
              <label className="block">
                <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">Unité</span>
                <select
                  value={unite}
                  onChange={(e) => setUnite(e.target.value)}
                  className={cn(inputClass, "mt-1 min-w-[136px] pr-8")}
                >
                  {UNITES.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="whitespace-nowrap text-caption font-semibold uppercase tracking-wide text-ink-muted">
                  Prix unitaire · FCFA *
                </span>
                <input
                  ref={puRef}
                  type="number"
                  min={0}
                  value={pu}
                  onChange={(e) => setPu(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addLine();
                    }
                  }}
                  className={cn(inputClass, "mt-1")}
                />
              </label>
              <div>
                <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">Total · FCFA</span>
                <p className="mt-1 rounded-sm border border-line bg-surface-sunken px-3 py-2 text-body-sm font-semibold text-ink [font-variant-numeric:tabular-nums]">
                  {lineTotal > 0 ? Math.round(lineTotal).toLocaleString("fr-FR") : "—"}
                </p>
              </div>
            </div>
            <label className="mt-3 block">
              <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">
                Description facultative
              </span>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ajouter une précision (facultatif)"
                className={cn(inputClass, "mt-1")}
              />
            </label>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={addLine}
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-sm border border-line-strong px-4 py-2 text-body-sm font-semibold text-ink hover:bg-surface-sunken"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter au ticket
                </button>
                <span className="text-caption text-ink-subtle">
                  Facultatif pour une seule prestation — « Encaisser » la prend automatiquement.
                </span>
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-body-sm text-ink">
                <input
                  type="checkbox"
                  checked={isCaution}
                  onChange={(e) => setIsCaution(e.target.checked)}
                  className="h-4 w-4 accent-[rgb(var(--brand))]"
                />
                <Shield className="h-3.5 w-3.5 text-ink-muted" aria-hidden />
                Caution de location (remboursable — jamais une recette)
              </label>
            </div>
            {raccourcis.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-line pt-3">
                <span className="text-caption font-semibold text-ink-muted">Raccourcis rapides :</span>
                {raccourcis.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => applyRaccourci(r)}
                    className="rounded-sm border border-line px-2.5 py-1 text-caption font-semibold text-ink hover:border-line-strong"
                    title={r.tarif_type === "fixe" && r.tarif_montant !== null ? fcfa(Number(r.tarif_montant)) : "Prix à saisir"}
                  >
                    {r.nom}
                  </button>
                ))}
                <span className="text-caption text-ink-subtle">
                  (configurables dans « Services et tarifs »)
                </span>
              </div>
            )}
          </section>

          {/* 3 · Ticket en cours */}
          <section className="rounded-sm border border-line bg-surface-elevated p-4">
            <h2 className="font-display text-title text-ink">3. Ticket en cours</h2>
            {allLines.length === 0 ? (
              <div className="mt-3 rounded-sm border border-dashed border-line px-4 py-8 text-center">
                <p className="text-body-sm text-ink-muted">Saisissez votre première prestation ci-dessus</p>
                <p className="text-caption text-ink-subtle">
                  Dès que désignation et prix sont remplis, la ligne apparaît ici.
                </p>
              </div>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-line text-caption font-semibold uppercase tracking-wide text-ink-muted">
                      <th className="py-2 pr-3">Prestation</th>
                      <th className="py-2 pr-3">Qté</th>
                      <th className="py-2 pr-3">Unité</th>
                      <th className="py-2 pr-3 text-right">Prix · FCFA</th>
                      <th className="py-2 pr-3 text-right">Total · FCFA</th>
                      <th className="py-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {lines.map((l) => (
                      <tr key={l.key}>
                        <td className="py-2 pr-3 text-body-sm font-medium text-ink">
                          {l.label}
                          {l.nature === "caution" && (
                            <span className="ml-1.5 rounded-sm border border-line px-1 py-0.5 text-caption font-semibold text-ink-muted">
                              Caution
                            </span>
                          )}
                          {l.description && (
                            <span className="block text-caption text-ink-muted">{l.description}</span>
                          )}
                        </td>
                        <td className="py-2 pr-3">
                          <input
                            type="number"
                            min={1}
                            value={l.quantite}
                            onChange={(e) =>
                              setLines((prev) =>
                                prev.map((x) =>
                                  x.key === l.key ? { ...x, quantite: Math.max(1, parseInt(e.target.value) || 1) } : x
                                )
                              )
                            }
                            className={cn(inputClass, "w-16 px-2 py-1")}
                          />
                        </td>
                        <td className="py-2 pr-3 text-body-sm text-ink-muted">{l.unite}</td>
                        <td className="py-2 pr-3 text-right">
                          <input
                            type="number"
                            min={0}
                            value={l.prix_unitaire}
                            onChange={(e) =>
                              setLines((prev) =>
                                prev.map((x) =>
                                  x.key === l.key ? { ...x, prix_unitaire: Math.max(0, Number(e.target.value)) } : x
                                )
                              )
                            }
                            className={cn(inputClass, "w-24 px-2 py-1 text-right")}
                          />
                        </td>
                        <td className="py-2 pr-3 text-right text-body-sm font-semibold text-ink [font-variant-numeric:tabular-nums]">
                          {Math.round(l.quantite * l.prix_unitaire).toLocaleString("fr-FR")}
                        </td>
                        <td className="py-2 text-right">
                          <button
                            type="button"
                            onClick={() => setLines((prev) => prev.filter((x) => x.key !== l.key))}
                            className="rounded-sm p-1 text-ink-subtle hover:bg-surface-sunken"
                            aria-label="Retirer la ligne"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {pending && (
                      <tr className="bg-surface-sunken/50">
                        <td className="py-2 pr-3 text-body-sm font-medium italic text-ink-muted">
                          {pending.label}
                          <span className="ml-1.5 rounded-sm border border-dashed border-line px-1 py-0.5 text-caption font-semibold not-italic text-ink-subtle">
                            En saisie — incluse à l&rsquo;encaissement
                          </span>
                        </td>
                        <td className="py-2 pr-3 text-body-sm text-ink-muted">{pending.quantite}</td>
                        <td className="py-2 pr-3 text-body-sm text-ink-muted">{pending.unite}</td>
                        <td className="py-2 pr-3 text-right text-body-sm text-ink-muted [font-variant-numeric:tabular-nums]">
                          {Math.round(pending.prix_unitaire).toLocaleString("fr-FR")}
                        </td>
                        <td className="py-2 pr-3 text-right text-body-sm font-semibold text-ink [font-variant-numeric:tabular-nums]">
                          {Math.round(pending.quantite * pending.prix_unitaire).toLocaleString("fr-FR")}
                        </td>
                        <td className="py-2" />
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mt-3 flex flex-wrap gap-2 border-t border-line pt-3">
              <button
                type="button"
                disabled={allLines.length === 0}
                onClick={() => {
                  persistDrafts([
                    {
                      id: crypto.randomUUID(),
                      savedAt: new Date().toISOString(),
                      clientNom: client ? clientName(client) : passageNom.trim() || null,
                      // La ligne en cours de saisie part aussi en attente.
                      lines: allLines.map((l) =>
                        l.key === "__pending__" ? { ...l, key: `${Date.now()}-p` } : l
                      ),
                    },
                    ...drafts,
                  ]);
                  setLines([]);
                  setDesignation("");
                  setQty("1");
                  setUnite("prestation");
                  setPu("");
                  setDescription("");
                  setIsCaution(false);
                  ticketKeyRef.current = null;
                  toast.success("Ticket mis en attente (sur ce poste)");
                }}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm border border-line px-3 py-2 text-body-sm font-semibold text-ink hover:border-line-strong disabled:opacity-50"
              >
                <Pause className="h-4 w-4" />
                Mettre en attente
              </button>
              <button
                type="button"
                disabled={drafts.length === 0}
                onClick={() => setShowDrafts(true)}
                className="inline-flex items-center gap-1.5 rounded-sm border border-line px-3 py-2 text-body-sm font-semibold text-ink whitespace-nowrap hover:border-line-strong disabled:opacity-50"
              >
                <Play className="h-4 w-4" />
                Reprendre un ticket ({drafts.length})
              </button>
              <button
                type="button"
                disabled={allLines.length === 0}
                onClick={() => {
                  if (confirm("Vider le ticket en cours ?")) {
                    setLines([]);
                    setDesignation("");
                    setQty("1");
                    setUnite("prestation");
                    setPu("");
                    setDescription("");
                    setIsCaution(false);
                    ticketKeyRef.current = null;
                  }
                }}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm border border-status-failure px-3 py-2 text-body-sm font-semibold text-status-failure hover:bg-surface-sunken disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Vider le ticket
              </button>
            </div>
          </section>
        </div>

        {/* ══ Colonne paiement + reçu ══ */}
        <div className="space-y-4">
          {/* Paiement */}
          <section className="rounded-sm border border-line bg-surface-elevated p-4">
            <h2 className="font-display text-title text-ink">Paiement</h2>
            <div className="mt-3 flex items-center justify-between rounded-sm bg-surface-sunken px-4 py-3">
              <span className="text-body-sm font-semibold text-ink">Total à payer</span>
              <span className="font-display text-display-sm text-ink [font-variant-numeric:tabular-nums]">
                {total > 0 ? fcfa(total) : "— FCFA"}
              </span>
            </div>

            {/* Retour Thierry 12/09 : le paiement partiel était une case à
                cocher discrète et le reste dû n'apparaissait qu'en espèces.
                Désormais : choix explicite, montant, et RESTE DÛ affiché en
                clair quel que soit le mode de paiement. */}
            <p className="mt-3 text-caption font-semibold uppercase tracking-wide text-ink-muted">
              Le client paie
            </p>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setPartiel(false);
                  setMontantAffecte("");
                }}
                className={cn(
                  "whitespace-nowrap rounded-sm border px-3 py-2 text-body-sm font-semibold",
                  !partiel
                    ? "border-line-strong bg-surface-sunken text-ink"
                    : "border-line text-ink-muted hover:border-line-strong"
                )}
              >
                La totalité
              </button>
              <button
                type="button"
                disabled={hasCaution}
                onClick={() => setPartiel(true)}
                title={hasCaution ? "Une caution se paie toujours comptant" : undefined}
                className={cn(
                  "whitespace-nowrap rounded-sm border px-3 py-2 text-body-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50",
                  partiel
                    ? "border-line-strong bg-surface-sunken text-ink"
                    : "border-line text-ink-muted hover:border-line-strong"
                )}
              >
                Une partie (acompte)
              </button>
            </div>
            {hasCaution && (
              <p className="mt-1 text-caption text-ink-subtle">
                Une caution se paie toujours comptant — l&rsquo;acompte est désactivé.
              </p>
            )}
            {partiel && (
              <div className="mt-2 space-y-2">
                <label className="block">
                  <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">
                    Montant payé maintenant · FCFA *
                  </span>
                  <input
                    type="number"
                    min={1}
                    value={montantAffecte}
                    onChange={(e) => setMontantAffecte(e.target.value)}
                    placeholder="Ex. 10 000"
                    className={cn(inputClass, "mt-1")}
                  />
                </label>
                <div className="rounded-sm border border-line bg-surface-sunken px-3 py-2">
                  <div className="flex items-center justify-between text-body-sm text-ink-muted">
                    <span>Total de la prestation</span>
                    <span className="[font-variant-numeric:tabular-nums]">{fcfa(total)}</span>
                  </div>
                  <div className="flex items-center justify-between text-body-sm text-ink-muted">
                    <span>Payé maintenant</span>
                    <span className="[font-variant-numeric:tabular-nums]">
                      {affecte > 0 ? fcfa(affecte) : "—"}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between border-t border-line pt-1 text-body-sm font-bold text-ink">
                    <span>Reste dû par le client</span>
                    <span className="[font-variant-numeric:tabular-nums]">
                      {affecte > 0 && affecte < total ? fcfa(total - affecte) : "—"}
                    </span>
                  </div>
                </div>
                <p className="text-caption text-ink-muted">
                  Le reste dû est enregistré comme créance — réglable plus tard depuis « Restes
                  dus » ci-dessous, sur la même créance (jamais une seconde).
                </p>
              </div>
            )}

            <p className="mt-3 text-caption font-semibold uppercase tracking-wide text-ink-muted">
              Mode de paiement
            </p>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {(
                [
                  ["especes", "Espèces", Banknote],
                  ["mobile_money", "Mobile Money", Smartphone],
                ] as const
              ).map(([mode, label, Icon]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPayMode(mode)}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-sm border px-3 py-2.5 text-body-sm font-semibold",
                    payMode === mode
                      ? "border-line-strong bg-surface-sunken text-ink"
                      : "border-line text-ink-muted hover:border-line-strong"
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-1 text-caption text-ink-subtle">
              Carte : aucun terminal configuré — non proposée.
            </p>

            {payMode === "especes" ? (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="whitespace-nowrap text-caption font-semibold uppercase tracking-wide text-ink-muted">
                    Montant reçu
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={montantRecu}
                    onChange={(e) => setMontantRecu(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !blocked && !checkingOut) {
                        e.preventDefault();
                        checkout();
                      }
                    }}
                    className={cn(inputClass, "mt-1")}
                  />
                  <button
                    type="button"
                    disabled={duMaintenant <= 0}
                    onClick={() => setMontantRecu(String(Math.round(duMaintenant)))}
                    className="mt-1 whitespace-nowrap rounded-sm border border-line px-2 py-1 text-caption font-semibold text-ink hover:border-line-strong disabled:opacity-50"
                  >
                    Montant exact
                  </button>
                </label>
                <div>
                  <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">Monnaie</span>
                  <p className="mt-1 rounded-sm border border-line bg-surface-sunken px-2 py-2 text-body-sm font-semibold text-ink [font-variant-numeric:tabular-nums]">
                    {monnaie > 0 ? Math.round(monnaie).toLocaleString("fr-FR") : "—"}
                  </p>
                </div>
              </div>
            ) : (
              <label className="mt-3 block">
                <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">
                  Référence de confirmation vérifiée *
                </span>
                <input
                  type="text"
                  value={confirmationRef}
                  onChange={(e) => setConfirmationRef(e.target.value)}
                  placeholder="N° de transaction reçu et vérifié"
                  className={cn(inputClass, "mt-1")}
                />
              </label>
            )}

            {credits.length > 0 && (
              <div className="mt-3 border-t border-line pt-3">
                <p className="text-caption font-semibold uppercase tracking-wide text-ink-muted">
                  Restes dus (créances de comptoir)
                </p>
                <ul className="mt-1.5 space-y-1">
                  {credits.slice(0, 4).map((c) => (
                    <li key={c.id} className="flex items-center justify-between gap-2">
                      <span className="truncate text-body-sm text-ink">{c.client_nom || "Client de passage"}</span>
                      <button
                        type="button"
                        onClick={() => setReglement(c)}
                        disabled={!sessionOpen}
                        className="rounded-sm border border-line px-2 py-1 text-caption font-semibold text-ink hover:border-line-strong disabled:opacity-50"
                      >
                        reste {fcfa(Number(c.total_du) - Number(c.total_regle))} — régler
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="button"
              disabled={Boolean(blocked) || checkingOut}
              onClick={checkout}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-brand px-4 py-3.5 text-body font-semibold text-on-brand transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-ink-subtle"
            >
              {checkingOut ? <Loader2 className="h-5 w-5 animate-spin" /> : <Printer className="h-5 w-5" />}
              Encaisser et imprimer
            </button>
            <p className="mt-1.5 text-center text-caption text-ink-muted">
              {blocked || "Le reçu 80 mm part à l'impression dès l'enregistrement du paiement."}
            </p>
          </section>

          {/* Reçu & impression */}
          <section className="rounded-sm border border-line bg-surface-elevated p-4">
            <h2 className="font-display text-title text-ink">Reçu &amp; impression</h2>
            {/* 260 px ≈ 80 mm à l'écran : l'aperçu montre le reçu entier,
                montants compris (retour Thierry 12/09 : aperçu tronqué). */}
            <div className="mt-3 grid gap-3 sm:grid-cols-[260px_1fr]">
              <div>
                <p className="text-caption font-semibold uppercase tracking-wide text-ink-muted">Aperçu · 80 mm</p>
                {lastReceipt ? (
                  <iframe
                    title={`Reçu ${lastReceipt.reference}`}
                    src={`${lastReceipt.url}#toolbar=0&view=FitH`}
                    className="mt-1 h-80 w-full rounded-sm border border-line bg-white"
                  />
                ) : (
                  <div className="mt-1 h-80 w-full rounded-sm border border-line bg-white p-3 font-mono text-[10px] leading-4 text-slate-800">
                    <p className="text-center font-bold">NEXUS RCA</p>
                    <p className="text-center">REÇU DE PAIEMENT</p>
                    <p className="mt-2">Date&nbsp;: —</p>
                    <p>Référence&nbsp;: —</p>
                    <p className="mt-2 border-t border-dashed border-slate-400 pt-1">
                      {allLines.length === 0 ? "Prestation : —" : null}
                    </p>
                    {allLines.slice(0, 6).map((l) => (
                      <p key={l.key} className="truncate">
                        {l.label} ×{l.quantite} — {Math.round(l.quantite * l.prix_unitaire).toLocaleString("fr-FR")}
                      </p>
                    ))}
                    <p className="mt-1 border-t border-dashed border-slate-400 pt-1 font-bold">
                      TOTAL {total > 0 ? Math.round(total).toLocaleString("fr-FR") : "—"} FCFA
                    </p>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <label className="flex cursor-pointer items-center gap-2 text-body-sm text-ink">
                  <input
                    type="checkbox"
                    checked={autoPrint}
                    onChange={(e) => {
                      setAutoPrint(e.target.checked);
                      localStorage.setItem(AUTOPRINT_KEY, e.target.checked ? "1" : "0");
                    }}
                    className="h-4 w-4 accent-[rgb(var(--brand))]"
                  />
                  Impression automatique après paiement enregistré
                </label>
                <div>
                  <p className="text-caption font-semibold uppercase tracking-wide text-ink-muted">Imprimante</p>
                  <select className={cn(inputClass, "mt-1")} defaultValue="dialog">
                    <option value="dialog">Boîte de dialogue du poste (imprimante par défaut)</option>
                  </select>
                  <p className="mt-1 text-caption text-ink-muted">
                    Impression silencieuse 80 mm : en attente de la configuration matérielle — voir
                    la page Imprimante.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={testerImprimante}
                    className="inline-flex items-center gap-1.5 rounded-sm border border-line px-3 py-2 text-body-sm font-semibold text-ink hover:border-line-strong"
                  >
                    <Printer className="h-4 w-4" />
                    Tester
                  </button>
                  <button
                    type="button"
                    disabled={!lastReceipt}
                    onClick={() => lastReceipt && doPrint(lastReceipt.bytes)}
                    className="inline-flex items-center gap-1.5 rounded-sm border border-line px-3 py-2 text-body-sm font-semibold text-ink hover:border-line-strong disabled:opacity-50"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Réimprimer
                  </button>
                  <button
                    type="button"
                    disabled={!lastReceipt}
                    onClick={() => lastReceipt && downloadPdf(lastReceipt.bytes, `${lastReceipt.reference}.pdf`)}
                    className="inline-flex items-center gap-1.5 rounded-sm border border-line px-3 py-2 text-body-sm font-semibold text-ink hover:border-line-strong disabled:opacity-50"
                  >
                    <FileDown className="h-4 w-4" />
                    PDF
                  </button>
                </div>
                <p className="text-body-sm text-ink-muted">
                  Suivi :{" "}
                  <span className="font-semibold text-ink">
                    {printStatus === "idle"
                      ? "en attente d'un paiement"
                      : printStatus === "attente"
                      ? "préparation…"
                      : printStatus === "envoye"
                      ? "boîte d'impression ouverte (confirmation matérielle indisponible)"
                      : "échec — fenêtre bloquée, réessayez"}
                  </span>
                </p>
                {lastReceipt && (
                  <p className="text-caption text-ink-muted">
                    Dernier reçu : <span className="font-mono">{lastReceipt.reference}</span> — la
                    réimpression ne crée aucun paiement.
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Reprendre un ticket en attente */}
      {showDrafts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowDrafts(false)}>
          <div className="w-full max-w-md rounded-sm border border-line bg-surface-elevated p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-title font-bold text-ink">Tickets en attente (ce poste)</h3>
              <button type="button" onClick={() => setShowDrafts(false)} className="rounded-sm p-1 text-ink-subtle hover:bg-surface-sunken" aria-label="Fermer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <ul className="mt-4 divide-y divide-line">
              {drafts.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-2 py-2.5">
                  <div>
                    <p className="text-body-sm font-medium text-ink">{d.clientNom || "Client de passage"}</p>
                    <p className="text-caption text-ink-muted">
                      {d.lines.length} ligne{d.lines.length > 1 ? "s" : ""} ·{" "}
                      {fcfa(d.lines.reduce((s, l) => s + l.quantite * l.prix_unitaire, 0))} ·{" "}
                      {new Date(d.savedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (lines.length > 0 && !confirm("Remplacer le ticket en cours ?")) return;
                        setLines(d.lines);
                        persistDrafts(drafts.filter((x) => x.id !== d.id));
                        setShowDrafts(false);
                        ticketKeyRef.current = null;
                      }}
                      className="rounded-sm border border-line px-3 py-1.5 text-caption font-semibold text-ink hover:border-line-strong"
                    >
                      Reprendre
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("Supprimer ce brouillon ?")) persistDrafts(drafts.filter((x) => x.id !== d.id));
                      }}
                      className="rounded-sm border border-line p-1.5 text-ink-subtle hover:border-line-strong"
                      aria-label="Supprimer le brouillon"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Règlement d'une créance */}
      {reglement && (
        <ReglementCreanceModal
          credit={reglement}
          caissiereNom={caissiereNom}
          onClose={() => setReglement(null)}
          onDone={(receipt) => {
            setReglement(null);
            setLastReceipt(receipt);
            if (autoPrint) doPrint(receipt.bytes);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

// ── Règlement complémentaire d'une créance de comptoir (reçu §11 :
//    paiement du jour, règlements précédents, nouveau reste dû) ───────────
function ReglementCreanceModal({
  credit,
  caissiereNom,
  onClose,
  onDone,
}: {
  credit: PosCredit;
  caissiereNom: string;
  onClose: () => void;
  onDone: (receipt: { reference: string; bytes: Uint8Array; url: string }) => void;
}) {
  const reste = Number(credit.total_du) - Number(credit.total_regle);
  const [montant, setMontant] = useState(String(reste));
  const [mode, setMode] = useState<"especes" | "mobile_money">("especes");
  const [confirmation, setConfirmation] = useState("");
  const [saving, setSaving] = useState(false);
  const keyRef = useRef<string | null>(null);

  async function submit() {
    const paid = parseFloat(montant);
    if (!Number.isFinite(paid) || paid <= 0 || paid > reste) {
      toast.error(`Montant entre 1 et ${reste} FCFA requis`);
      return;
    }
    if (mode !== "especes" && !confirmation.trim()) {
      toast.error("Référence de confirmation requise");
      return;
    }
    if (!keyRef.current) keyRef.current = crypto.randomUUID();
    setSaving(true);
    try {
      const res = await fetch("/api/accueil/pos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticket_key: keyRef.current,
          mode_paiement: mode,
          confirmation_reference: confirmation.trim() || undefined,
          credit_reglement: { credit_id: credit.id, montant: paid },
        }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Échec du règlement");
        return;
      }
      const reference = (json.sales as { reference: string | null }[])[0]?.reference || "TICKET";
      const resteApres = json.credit ? Number(json.credit.reste_du) : Math.max(0, reste - paid);
      const bytes = await generatePosTicketPdf({
        reference,
        date: new Date(),
        clientNom: credit.client_nom,
        lignes: [
          { label: "Règlement d'une créance de comptoir", quantite: 1, unite: "prestation", prix_unitaire: paid, montant_total: paid },
        ],
        total: Number(credit.total_du),
        devise: "FCFA",
        modePaiement: mode === "especes" ? "Espèces" : "Mobile Money",
        caissiereNom,
        reglementsPrecedents: Number(credit.total_regle),
        acompte: { paye: paid, resteDu: resteApres },
      });
      toast.success(resteApres > 0 ? `Règlement encaissé — reste dû ${fcfa(resteApres)}` : "Créance soldée");
      onDone({ reference, bytes, url: pdfBlobUrl(bytes) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-sm border border-line bg-surface-elevated p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-title font-bold text-ink">Régler une créance</h3>
          <button type="button" onClick={onClose} className="rounded-sm p-1 text-ink-subtle hover:bg-surface-sunken" aria-label="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-1 text-caption text-ink-muted">
          {credit.client_nom || "Client de passage"} · déjà réglé {fcfa(Number(credit.total_regle))} · reste{" "}
          {fcfa(reste)} — la même créance est rechargée, jamais une seconde.
        </p>
        <label className="mt-4 block">
          <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">Montant FCFA *</span>
          <input type="number" min={1} max={reste} value={montant} onChange={(e) => setMontant(e.target.value)} className={cn(inputClass, "mt-1")} autoFocus />
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
            className="rounded-sm bg-brand px-4 py-2 text-body-sm font-semibold text-on-brand hover:bg-brand-hover disabled:opacity-50"
          >
            {saving ? "Encaissement…" : "Encaisser et imprimer"}
          </button>
        </div>
      </div>
    </div>
  );
}
