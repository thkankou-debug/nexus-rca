"use client";

// ============================================================================
// IMPRIMANTE — état honnête du poste (§10 : jamais « Imprimé » sans preuve),
// test d'impression sans transaction, et prérequis matériels que Thierry
// doit fournir pour activer l'impression SILENCIEUSE (sans boîte de
// dialogue) : modèle exact, connexion, OS, navigateur — la solution
// (agent local type QZ Tray / spooler dédié / pilote fabricant) sera
// présentée AVANT toute installation sur le poste (§9).
// ============================================================================

import { useState } from "react";
import toast from "react-hot-toast";
import { Loader2, Printer } from "lucide-react";
import { generatePosTicketPdf, openPdfForPrint } from "./pos-ticket";

export function ImprimantePanel({ caissiereNom }: { caissiereNom: string }) {
  const [testing, setTesting] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  async function test() {
    setTesting(true);
    try {
      const bytes = await generatePosTicketPdf({
        reference: "TEST-IMPRIMANTE",
        date: new Date(),
        lignes: [
          {
            label: "Ligne de test — accents : é è à ç ù Ê Î ô · libellé volontairement long pour vérifier le retour à la ligne sans couper les montants",
            quantite: 3,
            unite: "page",
            prix_unitaire: 0,
            montant_total: 0,
          },
        ],
        total: 0,
        devise: "FCFA",
        modePaiement: "—",
        caissiereNom,
        test: true,
      });
      const ok = openPdfForPrint(bytes);
      setLastResult(
        ok
          ? "Boîte d'impression ouverte — vérifiez la sortie papier (la confirmation matérielle n'est pas disponible)."
          : "Fenêtre bloquée par le navigateur — autorisez les fenêtres pop-up pour ce site."
      );
      if (!ok) toast.error("Fenêtre d'impression bloquée");
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-sm border border-line bg-surface-elevated p-4">
        <h2 className="font-display text-title text-ink">État actuel du poste</h2>
        <dl className="mt-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <dt className="text-body-sm text-ink-muted">Mode d&rsquo;impression</dt>
            <dd className="text-body-sm font-semibold text-ink">Boîte de dialogue du navigateur</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-body-sm text-ink-muted">Impression silencieuse 80 mm</dt>
            <dd className="text-body-sm font-semibold text-ink">Non configurée</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-body-sm text-ink-muted">Confirmation matérielle (papier sorti)</dt>
            <dd className="text-body-sm font-semibold text-ink">Indisponible dans ce mode</dd>
          </div>
        </dl>
        <button
          type="button"
          disabled={testing}
          onClick={test}
          className="mt-4 inline-flex items-center gap-2 rounded-sm border border-line-strong px-4 py-2 text-body-sm font-semibold text-ink hover:bg-surface-sunken disabled:opacity-50"
        >
          {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
          Tester l&rsquo;imprimante
        </button>
        <p className="mt-2 text-caption text-ink-muted">
          Le test imprime un document clairement marqué « TEST IMPRIMANTE — AUCUNE TRANSACTION
          FINANCIÈRE » : accents, retours à la ligne et largeur 80 mm.
        </p>
        {lastResult && <p className="mt-2 text-body-sm text-ink">{lastResult}</p>}
      </section>

      <section className="rounded-sm border border-line bg-surface-elevated p-4">
        <h2 className="font-display text-title text-ink">
          Activer l&rsquo;impression automatique silencieuse
        </h2>
        <p className="mt-2 text-body-sm text-ink-muted">
          Pour que le reçu parte à l&rsquo;imprimante sans boîte de dialogue, un agent local
          d&rsquo;impression doit être configuré sur le poste de réception. Avant toute
          installation, fournissez ces quatre informations :
        </p>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-body-sm text-ink">
          <li>Le modèle exact de l&rsquo;imprimante thermique (marque et référence).</li>
          <li>Sa connexion : USB, réseau (adresse IP), Bluetooth ou autre.</li>
          <li>Le système d&rsquo;exploitation du poste de réception.</li>
          <li>Le navigateur utilisé sur ce poste.</li>
        </ol>
        <p className="mt-3 text-body-sm text-ink-muted">
          Une solution documentée (agent local d&rsquo;impression restreint à cette application et
          à ce poste, ou intégration prise en charge par le fabricant) sera alors présentée avec
          la liste exacte des changements — rien ne sera installé sans validation. En attendant,
          « Encaisser et imprimer » ouvre la boîte d&rsquo;impression du poste avec le reçu 80 mm
          déjà prêt : une touche Entrée suffit.
        </p>
      </section>
    </div>
  );
}
