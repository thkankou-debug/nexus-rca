"use client";

// ============================================================================
// NOUVEAU CLIENT — modale de création (Espace Accueil & Caisse, §3.2 étape
// Client). Partagée entre le Comptoir POS et la page Clients.
// - Détection de similitude côté serveur (409 + candidats) : jamais de
//   création silencieuse quand des fiches proches existent.
// - Les services NEXUS RCA sont listés et accessibles dès la création
//   (demande Thierry, 11/09/2026) : choisir un « service demandé » ouvre
//   et oriente immédiatement un dossier pour le nouveau client
//   (POST /api/accueil/dossiers — dossier.create).
// ============================================================================

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export interface AccueilClient {
  id: string;
  reference: string | null;
  type: string;
  nom: string;
  prenom: string | null;
  raison_sociale: string | null;
  email: string | null;
  telephone: string | null;
}

const inputClass =
  "w-full rounded-sm border border-line bg-surface px-3 py-2 text-body-sm text-ink placeholder:text-ink-subtle focus:border-line-strong focus:outline-none focus:ring-2 focus:ring-focus";

export function NewClientModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (client: AccueilClient) => void;
}) {
  const [form, setForm] = useState({ nom: "", prenom: "", telephone: "", email: "" });
  const [duplicates, setDuplicates] = useState<
    {
      id: string;
      reference: string | null;
      nom: string;
      prenom: string | null;
      telephone: string | null;
      email: string | null;
    }[]
  >([]);
  const [saving, setSaving] = useState(false);

  // Services NEXUS RCA (table `services`, lecture publique des actifs) —
  // groupés par pôle pour le choix « service demandé ».
  const [services, setServices] = useState<{ id: string; nom: string; categorie: string }[]>([]);
  const [serviceDemande, setServiceDemande] = useState("");
  const [motif, setMotif] = useState("");

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data } = await supabase
        .from("services")
        .select("id, nom, categorie")
        .eq("status", "actif")
        .order("ordre_affichage", { ascending: true })
        .order("nom", { ascending: true });
      setServices((data || []) as { id: string; nom: string; categorie: string }[]);
    })();
  }, []);

  const categories = Array.from(new Set(services.map((s) => s.categorie)));

  async function submit(force: boolean) {
    if (!form.nom.trim()) {
      toast.error("Le nom est requis");
      return;
    }
    if (serviceDemande && !motif.trim()) {
      toast.error("Précisez le motif de la demande pour ouvrir le dossier");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/accueil/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, force }),
      });
      const json = await res.json();
      if (res.status === 409 && json.duplicates) {
        setDuplicates(json.duplicates);
        return;
      }
      if (!json.success) {
        toast.error(json.error || "Échec de la création");
        return;
      }

      // Ouverture + orientation immédiates si un service est demandé.
      if (serviceDemande) {
        const dossierRes = await fetch("/api/accueil/dossiers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_record_id: json.client.id,
            service: serviceDemande,
            motif: motif.trim(),
          }),
        });
        const dossierJson = await dossierRes.json();
        if (dossierJson.success) {
          toast.success(
            `Fiche créée · dossier ${dossierJson.dossier.reference || ""} ouvert (${serviceDemande})`
          );
        } else {
          toast.error(
            `Fiche créée, mais l'ouverture du dossier a échoué : ${dossierJson.error || "erreur"}`
          );
        }
      } else {
        toast.success("Fiche client créée");
      }
      onCreated(json.client);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-sm border border-line bg-surface-elevated p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-title font-bold text-ink">Nouveau client</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm p-1 text-ink-subtle hover:bg-surface-sunken"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-1 text-caption text-ink-muted">
          Avant toute création, rechercher le client pour éviter les doublons.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">Nom *</span>
            <input
              type="text"
              value={form.nom}
              onChange={(e) => setForm((p) => ({ ...p, nom: e.target.value }))}
              className={cn(inputClass, "mt-1")}
            />
          </label>
          <label className="block">
            <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">Prénom</span>
            <input
              type="text"
              value={form.prenom}
              onChange={(e) => setForm((p) => ({ ...p, prenom: e.target.value }))}
              className={cn(inputClass, "mt-1")}
            />
          </label>
          <label className="block">
            <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">Téléphone</span>
            <input
              type="tel"
              value={form.telephone}
              onChange={(e) => setForm((p) => ({ ...p, telephone: e.target.value }))}
              className={cn(inputClass, "mt-1")}
            />
          </label>
          <label className="block">
            <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">E-mail</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              className={cn(inputClass, "mt-1")}
            />
          </label>
        </div>

        {/* Services NEXUS RCA — ouverture de dossier immédiate (optionnel) */}
        <div className="mt-5 rounded-sm border border-line bg-surface p-4">
          <p className="text-body-sm font-semibold text-ink">Service demandé (optionnel)</p>
          <p className="mt-0.5 text-caption text-ink-muted">
            Choisir un service ouvre et oriente immédiatement un dossier pour ce client.
          </p>
          <select
            value={serviceDemande}
            onChange={(e) => setServiceDemande(e.target.value)}
            className={cn(inputClass, "mt-3")}
          >
            <option value="">Aucun — fiche client seule</option>
            {categories.map((cat) => (
              <optgroup key={cat} label={cat}>
                {services
                  .filter((s) => s.categorie === cat)
                  .map((s) => (
                    <option key={s.id} value={s.nom}>
                      {s.nom}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
          {serviceDemande && (
            <label className="mt-3 block">
              <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">
                Motif de la demande *
              </span>
              <input
                type="text"
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                placeholder="Ex : visa Schengen court séjour, admission universitaire…"
                className={cn(inputClass, "mt-1")}
              />
            </label>
          )}
        </div>

        {duplicates.length > 0 && (
          <div className="mt-4 rounded-sm border border-status-waiting bg-surface p-3">
            <p className="text-body-sm font-semibold text-ink">Des fiches similaires existent déjà :</p>
            <ul className="mt-2 space-y-1">
              {duplicates.map((d) => (
                <li key={d.id} className="text-caption text-ink-muted">
                  {[d.prenom, d.nom].filter(Boolean).join(" ")} ·{" "}
                  {[d.reference, d.telephone, d.email].filter(Boolean).join(" · ")}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-caption text-ink-muted">
              Utilisez la recherche pour sélectionner une fiche existante, ou confirmez la création
              s&rsquo;il s&rsquo;agit bien d&rsquo;une autre personne.
            </p>
          </div>
        )}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm border border-line px-4 py-2 text-body-sm font-semibold text-ink hover:border-line-strong"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => submit(duplicates.length > 0)}
            className="rounded-sm bg-brand px-4 py-2 text-body-sm font-semibold text-on-brand hover:bg-brand-hover disabled:opacity-50"
          >
            {saving ? "Enregistrement…" : duplicates.length > 0 ? "Créer quand même" : "Créer la fiche"}
          </button>
        </div>
      </div>
    </div>
  );
}
