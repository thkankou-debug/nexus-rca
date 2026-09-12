"use client";

// ============================================================================
// COMPTOIR POS — maquette POS ECRAN 1 (NEXUS_RCA_DASHBOARD_ADMINISTRATION.md
// §3.2). Parcours Client → Prestations → Dossier → Paiement sur un seul
// écran. Règles appliquées :
// - La recherche client précède toujours la création (barrière anti-doublon,
//   détection de similitude côté serveur : 409 + candidats).
// - Catalogue alimenté par la table `services` (jamais codé en dur) — tous
//   les tarifs réels sont "sur devis" à ce jour, le prix est saisi par la
//   caissière ("Tarifs issus du catalogue · Devis selon prestation").
// - Étape Dossier explicite, jamais implicite : vente au comptoir
//   (quick_sales, pas de dossier vide) OU rattachement à un dossier existant.
// - Encaissement bloqué tant que la session de caisse n'est pas ouverte,
//   motif visible (§3.1) — et re-vérifié côté serveur.
// - Paiement électronique : référence de confirmation vérifiée OBLIGATOIRE.
// - Après encaissement : reçu 80 mm (impression / téléchargement).
// ============================================================================

import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  Search,
  UserPlus,
  X,
  Lock,
  LockOpen,
  Trash2,
  Banknote,
  Smartphone,
  CreditCard,
  Printer,
  FileDown,
  ReceiptText,
  Send,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SessionSnapshot } from "@/lib/accueil-server";
import { generatePosTicketPdf, openPdfForPrint, downloadPdf } from "./pos-ticket";
import { NewClientModal } from "./NewClientModal";

export interface PosService {
  id: string;
  slug: string;
  nom: string;
  categorie: string;
  tarif_type: "fixe" | "sur_devis";
  tarif_montant: number | null;
}

export interface PosAgent {
  id: string;
  nom: string;
  prenom: string | null;
}

interface PosClient {
  id: string;
  reference: string | null;
  type: string;
  nom: string;
  prenom: string | null;
  raison_sociale: string | null;
  email: string | null;
  telephone: string | null;
}

interface PosDossier {
  id: string;
  reference: string | null;
  service: string;
  statut: string;
}

interface TicketLine {
  key: string;
  service_slug: string;
  label: string;
  quantite: number;
  prix_unitaire: number | "";
}

type PayMode = "especes" | "mobile_money" | "carte";

const PAY_MODES: { value: PayMode; label: string; icon: typeof Banknote }[] = [
  { value: "especes", label: "Espèces", icon: Banknote },
  { value: "mobile_money", label: "Mobile Money", icon: Smartphone },
  { value: "carte", label: "Carte", icon: CreditCard },
];

const PAY_MODE_LABELS: Record<PayMode, string> = {
  especes: "Espèces",
  mobile_money: "Mobile Money",
  carte: "Carte",
};

function clientDisplayName(c: PosClient): string {
  return c.type === "particulier"
    ? [c.prenom, c.nom].filter(Boolean).join(" ") || c.nom
    : c.raison_sociale || c.nom;
}

function formatMoney(n: number): string {
  return `${Math.round(n).toLocaleString("fr-FR")} FCFA`;
}

const inputClass =
  "w-full rounded-sm border border-line bg-surface px-3 py-2 text-body-sm text-ink placeholder:text-ink-subtle focus:border-line-strong focus:outline-none focus:ring-2 focus:ring-focus";

export function PosComptoir({
  services,
  agents,
  session,
  caissiereNom,
}: {
  services: PosService[];
  agents: PosAgent[];
  session: SessionSnapshot | null;
  caissiereNom: string;
}) {
  // ── Étape 1 · Client ──────────────────────────────────────────────────────
  const [clientQuery, setClientQuery] = useState("");
  const [clientResults, setClientResults] = useState<PosClient[]>([]);
  const [searching, setSearching] = useState(false);
  const [client, setClient] = useState<PosClient | null>(null);
  const [showNewClient, setShowNewClient] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Étape 3 · Dossier ─────────────────────────────────────────────────────
  const [dossiers, setDossiers] = useState<PosDossier[]>([]);
  const [dossierId, setDossierId] = useState<string | null>(null);

  // ── Étape 2 · Prestations / ticket ────────────────────────────────────────
  const [catalogFilter, setCatalogFilter] = useState<string>("Tous");
  const [catalogQuery, setCatalogQuery] = useState("");
  const [lines, setLines] = useState<TicketLine[]>([]);

  // ── Étape 4 · Paiement ────────────────────────────────────────────────────
  const [payMode, setPayMode] = useState<PayMode>("especes");
  const [montantRecu, setMontantRecu] = useState<string>("");
  const [confirmationRef, setConfirmationRef] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);
  const [lastTicket, setLastTicket] = useState<{
    reference: string;
    bytes: Uint8Array;
  } | null>(null);

  // ── Orientation du dossier ────────────────────────────────────────────────
  const [orientService, setOrientService] = useState("");
  const [orientAgent, setOrientAgent] = useState("");
  const [orientMotif, setOrientMotif] = useState("");
  const [orienting, setOrienting] = useState(false);

  const sessionOpen = session?.status === "ouverte";

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    const q = clientQuery.trim();
    if (q.length < 2) {
      setClientResults([]);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/accueil/clients?q=${encodeURIComponent(q)}`);
        const json = await res.json();
        if (json.success) setClientResults(json.clients);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [clientQuery]);

  async function selectClient(c: PosClient) {
    setClient(c);
    setClientQuery("");
    setClientResults([]);
    setDossierId(null);
    const res = await fetch(`/api/accueil/clients/${c.id}`);
    const json = await res.json();
    setDossiers(json.success ? json.dossiers : []);
  }

  function clearClient() {
    setClient(null);
    setDossiers([]);
    setDossierId(null);
  }

  const categories = useMemo(
    () => ["Tous", ...Array.from(new Set(services.map((s) => s.categorie)))],
    [services]
  );
  const filteredServices = useMemo(() => {
    const q = catalogQuery.trim().toLowerCase();
    return services.filter(
      (s) =>
        (catalogFilter === "Tous" || s.categorie === catalogFilter) &&
        (!q || s.nom.toLowerCase().includes(q))
    );
  }, [services, catalogFilter, catalogQuery]);

  function addLine(s: PosService) {
    setLines((prev) => [
      ...prev,
      {
        key: `${s.slug}-${Date.now()}`,
        service_slug: s.slug,
        label: s.nom,
        quantite: 1,
        prix_unitaire: s.tarif_type === "fixe" && s.tarif_montant !== null ? Number(s.tarif_montant) : "",
      },
    ]);
  }

  function updateLine(key: string, patch: Partial<TicketLine>) {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  }

  function removeLine(key: string) {
    setLines((prev) => prev.filter((l) => l.key !== key));
  }

  const total = lines.reduce(
    (s, l) => s + (typeof l.prix_unitaire === "number" ? l.prix_unitaire * l.quantite : 0),
    0
  );
  const linesReady =
    lines.length > 0 &&
    lines.every((l) => typeof l.prix_unitaire === "number" && l.prix_unitaire >= 0 && l.quantite > 0) &&
    total > 0;
  const recu = parseFloat(montantRecu) || 0;
  const monnaie = payMode === "especes" && recu > total ? recu - total : 0;

  const checkoutBlockedReason = !sessionOpen
    ? "Ouvrez votre caisse pour activer l'encaissement."
    : !linesReady
    ? "Ajoutez au moins une prestation avec son prix."
    : payMode !== "especes" && !confirmationRef.trim()
    ? "Saisissez la référence de confirmation du paiement électronique."
    : payMode === "especes" && recu < total
    ? "Le montant reçu est inférieur au total."
    : null;

  async function handleCheckout() {
    if (checkoutBlockedReason) return;
    setCheckingOut(true);
    try {
      const res = await fetch("/api/accueil/pos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client: client
            ? {
                record_id: client.id,
                nom: clientDisplayName(client),
                email: client.email,
                telephone: client.telephone,
              }
            : undefined,
          demande_id: dossierId,
          lignes: lines.map((l) => ({
            service_slug: l.service_slug,
            label: l.label,
            quantite: l.quantite,
            prix_unitaire: l.prix_unitaire,
          })),
          mode_paiement: payMode,
          montant_recu: payMode === "especes" ? recu : undefined,
          confirmation_reference: confirmationRef.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Échec de l'encaissement");
        return;
      }

      const reference =
        (json.sales as { reference: string | null }[])[0]?.reference || "TICKET";
      const dossierRef = dossierId
        ? dossiers.find((d) => d.id === dossierId)?.reference || null
        : null;
      const bytes = await generatePosTicketPdf({
        reference,
        date: new Date(),
        clientNom: client ? clientDisplayName(client) : null,
        dossierReference: dossierRef,
        lignes: lines.map((l) => ({
          label: l.label,
          quantite: l.quantite,
          prix_unitaire: typeof l.prix_unitaire === "number" ? l.prix_unitaire : 0,
          montant_total: (typeof l.prix_unitaire === "number" ? l.prix_unitaire : 0) * l.quantite,
        })),
        total,
        devise: "FCFA",
        modePaiement: PAY_MODE_LABELS[payMode],
        montantRecu: payMode === "especes" ? recu : null,
        monnaieRendue: payMode === "especes" ? monnaie : null,
        caissiereNom,
      });

      setLastTicket({ reference, bytes });
      setLines([]);
      setMontantRecu("");
      setConfirmationRef("");
      setDossierId(null);
      toast.success("Encaissement enregistré dans la session");
    } finally {
      setCheckingOut(false);
    }
  }

  async function handleOrient() {
    if (!client) {
      toast.error("Sélectionnez d'abord un client");
      return;
    }
    if (!orientService || !orientMotif.trim()) {
      toast.error("Service destinataire et motif requis");
      return;
    }
    setOrienting(true);
    try {
      const res = await fetch("/api/accueil/dossiers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_record_id: client.id,
          service: orientService,
          motif: orientMotif.trim(),
          agent_id: orientAgent || null,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Échec de l'ouverture du dossier");
        return;
      }
      toast.success(`Dossier ${json.dossier.reference || ""} ouvert et orienté`);
      setOrientMotif("");
      setOrientAgent("");
      // Le nouveau dossier devient rattachable au ticket immédiatement.
      const reload = await fetch(`/api/accueil/clients/${client.id}`);
      const reloadJson = await reload.json();
      if (reloadJson.success) setDossiers(reloadJson.dossiers);
    } finally {
      setOrienting(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      {/* ── Colonne gauche : client, catalogue, orientation ── */}
      <div className="space-y-6">
        {/* Bandeau session */}
        <div
          className={cn(
            "flex flex-wrap items-center justify-between gap-3 rounded-sm border p-4",
            sessionOpen ? "border-line bg-surface-elevated" : "border-status-waiting bg-surface-elevated"
          )}
        >
          <div className="flex items-center gap-3">
            {sessionOpen ? (
              <LockOpen className="h-5 w-5 text-ink-muted" aria-hidden />
            ) : (
              <Lock className="h-5 w-5 text-ink-muted" aria-hidden />
            )}
            <div>
              <p className="text-body-sm font-semibold text-ink">
                {sessionOpen
                  ? "Session de caisse ouverte"
                  : session?.status === "a_cloturer"
                  ? "Rapprochement soumis — en attente de validation"
                  : "Caisse non ouverte"}
              </p>
              {!sessionOpen && (
                <p className="text-caption text-ink-muted">
                  Encaissements bloqués jusqu&rsquo;à l&rsquo;ouverture de la session.
                </p>
              )}
            </div>
          </div>
          <a
            href="/dashboard/accueil/session"
            className="rounded-sm border border-line px-3 py-1.5 text-body-sm font-semibold text-ink hover:border-line-strong"
          >
            Gérer ma caisse
          </a>
        </div>

        {/* Étape 1 · Client */}
        <section className="rounded-sm border border-line bg-surface-elevated p-4">
          <h2 className="font-display text-title text-ink">1 · Client</h2>
          {client ? (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-sm border border-line bg-surface px-4 py-3">
              <div>
                <p className="text-body-sm font-semibold text-ink">{clientDisplayName(client)}</p>
                <p className="text-caption text-ink-muted">
                  {[client.reference, client.telephone, client.email].filter(Boolean).join(" · ") ||
                    "Aucune coordonnée"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`/dashboard/accueil/clients/${client.id}`}
                  className="text-body-sm font-semibold text-ink underline-offset-2 hover:underline"
                >
                  Fiche client
                </a>
                <button
                  type="button"
                  onClick={clearClient}
                  className="rounded-sm p-1.5 text-ink-subtle hover:bg-surface-sunken"
                  aria-label="Retirer le client"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
                  <input
                    type="text"
                    value={clientQuery}
                    onChange={(e) => setClientQuery(e.target.value)}
                    placeholder="Nom, téléphone ou référence client"
                    className={cn(inputClass, "pl-9")}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewClient(true)}
                  className="inline-flex items-center gap-2 rounded-sm border border-line px-3 py-2 text-body-sm font-semibold text-ink hover:border-line-strong"
                >
                  <UserPlus className="h-4 w-4" />
                  Nouveau client
                </button>
              </div>
              {searching && <p className="mt-2 text-caption text-ink-muted">Recherche…</p>}
              {clientResults.length > 0 && (
                <ul className="mt-2 divide-y divide-line rounded-sm border border-line bg-surface">
                  {clientResults.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => selectClient(c)}
                        className="flex w-full items-center justify-between px-4 py-2.5 text-left hover:bg-surface-sunken"
                      >
                        <span className="text-body-sm font-medium text-ink">{clientDisplayName(c)}</span>
                        <span className="text-caption text-ink-muted">
                          {[c.reference, c.telephone].filter(Boolean).join(" · ")}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {!searching && clientQuery.trim().length >= 2 && clientResults.length === 0 && (
                <p className="mt-2 text-caption text-ink-muted">
                  Aucun client trouvé — vérifiez l&rsquo;orthographe avant de créer une fiche.
                </p>
              )}
            </div>
          )}
        </section>

        {/* Étape 2 · Catalogue */}
        <section className="rounded-sm border border-line bg-surface-elevated p-4">
          <h2 className="font-display text-title text-ink">2 · Catalogue des prestations</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
              <input
                type="text"
                value={catalogQuery}
                onChange={(e) => setCatalogQuery(e.target.value)}
                placeholder="Rechercher une prestation…"
                className={cn(inputClass, "pl-9")}
              />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCatalogFilter(cat)}
                className={cn(
                  "rounded-sm border px-3 py-1.5 text-caption font-semibold transition-colors",
                  catalogFilter === cat
                    ? "border-line-strong bg-surface-sunken text-ink"
                    : "border-line text-ink-muted hover:border-line-strong"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {filteredServices.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => addLine(s)}
                className="flex items-center justify-between rounded-sm border border-line bg-surface px-4 py-3 text-left transition-colors hover:border-line-strong"
              >
                <div>
                  <p className="text-body-sm font-semibold text-ink">{s.nom}</p>
                  <p className="text-caption text-ink-muted">
                    {s.tarif_type === "fixe" && s.tarif_montant !== null
                      ? formatMoney(Number(s.tarif_montant))
                      : "Sur devis"}
                  </p>
                </div>
                <span className="text-ink-subtle" aria-hidden>
                  +
                </span>
              </button>
            ))}
            {filteredServices.length === 0 && (
              <p className="text-body-sm text-ink-muted sm:col-span-2">
                Aucune prestation ne correspond à cette recherche.
              </p>
            )}
          </div>
          <p className="mt-3 text-caption text-ink-muted">
            Tarifs issus du catalogue · Devis selon prestation
          </p>
        </section>

        {/* Orientation du dossier */}
        <section className="rounded-sm border border-line bg-surface-elevated p-4">
          <h2 className="font-display text-title text-ink">Orientation du dossier</h2>
          <p className="mt-1 text-caption text-ink-muted">
            La réception oriente, elle ne traite pas — affectation selon les règles du service.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">
                Service destinataire
              </span>
              <select
                value={orientService}
                onChange={(e) => setOrientService(e.target.value)}
                className={cn(inputClass, "mt-1")}
              >
                <option value="">Sélectionner un service</option>
                {services.map((s) => (
                  <option key={s.id} value={s.nom}>
                    {s.nom}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">
                Agent disponible (optionnel)
              </span>
              <select
                value={orientAgent}
                onChange={(e) => setOrientAgent(e.target.value)}
                className={cn(inputClass, "mt-1")}
              >
                <option value="">Sélectionner un agent</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {[a.prenom, a.nom].filter(Boolean).join(" ")}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="mt-3 block">
            <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">
              Motif de la demande
            </span>
            <input
              type="text"
              value={orientMotif}
              onChange={(e) => setOrientMotif(e.target.value)}
              placeholder="Ex : demande de visa Schengen, dossier d'études…"
              className={cn(inputClass, "mt-1")}
            />
          </label>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleOrient}
              disabled={orienting || !client}
              className="inline-flex items-center gap-2 rounded-sm border border-line px-4 py-2 text-body-sm font-semibold text-ink hover:border-line-strong disabled:cursor-not-allowed disabled:opacity-50"
            >
              {orienting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Enregistrer et orienter
            </button>
          </div>
          {!client && (
            <p className="mt-2 text-right text-caption text-ink-muted">
              Sélectionnez un client pour ouvrir un dossier.
            </p>
          )}
        </section>
      </div>

      {/* ── Colonne droite : ticket + règlement ── */}
      <div className="space-y-4">
        <section className="rounded-sm border border-line bg-surface-elevated p-4">
          <h2 className="font-display text-title text-ink">Ticket en cours</h2>
          <p className="text-caption text-ink-muted">
            {client ? `Client : ${clientDisplayName(client)}` : "Aucun client sélectionné"}
          </p>

          {/* Étape 3 · Dossier */}
          {client && (
            <div className="mt-3">
              <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">
                3 · Dossier
              </span>
              <select
                value={dossierId ?? ""}
                onChange={(e) => setDossierId(e.target.value || null)}
                className={cn(inputClass, "mt-1")}
              >
                <option value="">Vente au comptoir (sans suivi)</option>
                {dossiers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {[d.reference, d.service].filter(Boolean).join(" · ")}
                  </option>
                ))}
              </select>
            </div>
          )}

          {lines.length === 0 ? (
            <div className="mt-4 rounded-sm border border-dashed border-line px-4 py-8 text-center">
              <ReceiptText className="mx-auto h-6 w-6 text-ink-subtle" aria-hidden />
              <p className="mt-2 text-body-sm text-ink-muted">
                Ajoutez une prestation depuis le catalogue
              </p>
            </div>
          ) : (
            <ul className="mt-4 space-y-2">
              {lines.map((l) => (
                <li key={l.key} className="rounded-sm border border-line bg-surface p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-body-sm font-semibold text-ink">{l.label}</p>
                    <button
                      type="button"
                      onClick={() => removeLine(l.key)}
                      className="rounded-sm p-1 text-ink-subtle hover:bg-surface-sunken"
                      aria-label="Retirer la ligne"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <label className="flex items-center gap-1 text-caption text-ink-muted">
                      Qté
                      <input
                        type="number"
                        min={1}
                        value={l.quantite}
                        onChange={(e) =>
                          updateLine(l.key, { quantite: Math.max(1, parseInt(e.target.value) || 1) })
                        }
                        className={cn(inputClass, "w-16 px-2 py-1")}
                      />
                    </label>
                    <label className="flex flex-1 items-center gap-1 text-caption text-ink-muted">
                      Prix
                      <input
                        type="number"
                        min={0}
                        value={l.prix_unitaire}
                        onChange={(e) =>
                          updateLine(l.key, {
                            prix_unitaire: e.target.value === "" ? "" : Math.max(0, Number(e.target.value)),
                          })
                        }
                        placeholder="FCFA"
                        className={cn(inputClass, "px-2 py-1")}
                      />
                    </label>
                    <span className="whitespace-nowrap text-body-sm font-semibold text-ink [font-variant-numeric:tabular-nums]">
                      {typeof l.prix_unitaire === "number" ? formatMoney(l.prix_unitaire * l.quantite) : "—"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
            <span className="font-display text-title text-ink">TOTAL À RÉGLER</span>
            <span className="font-display text-title font-bold text-ink [font-variant-numeric:tabular-nums]">
              {formatMoney(total)}
            </span>
          </div>
        </section>

        {/* Étape 4 · Règlement */}
        <section className="rounded-sm border border-line bg-surface-elevated p-4">
          <h2 className="font-display text-title text-ink">4 · Règlement</h2>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {PAY_MODES.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setPayMode(m.value)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-sm border px-2 py-2.5 text-caption font-semibold transition-colors",
                  payMode === m.value
                    ? "border-line-strong bg-surface-sunken text-ink"
                    : "border-line text-ink-muted hover:border-line-strong"
                )}
              >
                <m.icon className="h-4 w-4" aria-hidden />
                {m.label}
              </button>
            ))}
          </div>

          {payMode === "especes" ? (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">
                  Montant reçu
                </span>
                <input
                  type="number"
                  min={0}
                  value={montantRecu}
                  onChange={(e) => setMontantRecu(e.target.value)}
                  placeholder="FCFA"
                  className={cn(inputClass, "mt-1")}
                />
              </label>
              <div>
                <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">
                  Monnaie à rendre
                </span>
                <p className="mt-1 rounded-sm border border-line bg-surface-sunken px-3 py-2 text-body-sm font-semibold text-ink [font-variant-numeric:tabular-nums]">
                  {formatMoney(monnaie)}
                </p>
              </div>
            </div>
          ) : (
            <label className="mt-3 block">
              <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">
                Référence de confirmation vérifiée
              </span>
              <input
                type="text"
                value={confirmationRef}
                onChange={(e) => setConfirmationRef(e.target.value)}
                placeholder="N° de transaction reçu et vérifié"
                className={cn(inputClass, "mt-1")}
              />
              <span className="mt-1 block text-caption text-ink-muted">
                Un paiement annoncé n&rsquo;est pas un paiement reçu : saisissez la référence
                vérifiée.
              </span>
            </label>
          )}

          <button
            type="button"
            onClick={handleCheckout}
            disabled={Boolean(checkoutBlockedReason) || checkingOut}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-brand px-4 py-3 text-body-sm font-semibold text-on-brand transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {checkingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ReceiptText className="h-4 w-4" />
            )}
            Encaisser et émettre le reçu
          </button>
          {checkoutBlockedReason && (
            <p className="mt-2 text-center text-caption text-ink-muted">{checkoutBlockedReason}</p>
          )}

          {lines.length > 0 && (
            <button
              type="button"
              onClick={() => setLines([])}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-sm border border-line px-4 py-2 text-body-sm font-semibold text-ink-muted hover:border-line-strong"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Vider le ticket
            </button>
          )}
        </section>

        {lastTicket && (
          <section className="rounded-sm border border-line bg-surface-elevated p-4">
            <p className="text-body-sm font-semibold text-ink">
              Reçu {lastTicket.reference} prêt
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => openPdfForPrint(lastTicket.bytes)}
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-line px-3 py-2 text-body-sm font-semibold text-ink hover:border-line-strong"
              >
                <Printer className="h-4 w-4" />
                Imprimer
              </button>
              <button
                type="button"
                onClick={() => downloadPdf(lastTicket.bytes, `${lastTicket.reference}.pdf`)}
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-line px-3 py-2 text-body-sm font-semibold text-ink hover:border-line-strong"
              >
                <FileDown className="h-4 w-4" />
                Télécharger
              </button>
            </div>
          </section>
        )}
      </div>

      {showNewClient && (
        <NewClientModal
          onClose={() => setShowNewClient(false)}
          onCreated={(c) => {
            setShowNewClient(false);
            void selectClient(c);
          }}
        />
      )}
    </div>
  );
}
