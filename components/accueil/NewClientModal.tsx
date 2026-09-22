"use client";

// ============================================================================
// NOUVEAU CLIENT — modale de création (Espace Accueil & Caisse).
// Particulier / entreprise, adresse, e-mail optionnel, anti-doublon 409.
// ============================================================================

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { PAYS_ACCUEIL } from "@/lib/accueil-forms";

export interface AccueilClient {
  id: string;
  reference: string | null;
  type: string;
  nom: string;
  prenom: string | null;
  raison_sociale: string | null;
  email: string | null;
  telephone: string | null;
  adresse?: string | null;
  quartier?: string | null;
  ville?: string | null;
  pays?: string | null;
  numero_identification?: string | null;
}

const inputClass =
  "w-full rounded-sm border border-line bg-surface px-3 py-2 text-body-sm text-ink placeholder:text-ink-subtle focus:border-line-strong focus:outline-none focus:ring-2 focus:ring-focus";

export function displayClientName(c: AccueilClient): string {
  return c.type === "particulier"
    ? [c.prenom, c.nom].filter(Boolean).join(" ") || c.nom
    : c.raison_sociale || c.nom;
}

export function NewClientModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (client: AccueilClient) => void;
}) {
  const [type, setType] = useState<"particulier" | "entreprise">("particulier");
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    raison_sociale: "",
    telephone: "",
    email: "",
    adresse: "",
    quartier: "",
    ville: "Bangui",
    pays: "République Centrafricaine",
    numero_identification: "",
  });
  const [duplicates, setDuplicates] = useState<
    {
      id: string;
      reference: string | null;
      nom: string;
      prenom: string | null;
      raison_sociale?: string | null;
      telephone: string | null;
      email: string | null;
    }[]
  >([]);
  const [saving, setSaving] = useState(false);

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

  function patch<K extends keyof typeof form>(key: K, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function submit(force: boolean) {
    if (type === "entreprise" && !form.raison_sociale.trim()) {
      toast.error("La raison sociale est requise");
      return;
    }
    if (type === "particulier" && !form.nom.trim()) {
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
        body: JSON.stringify({
          type,
          nom: type === "entreprise" ? form.raison_sociale : form.nom,
          prenom: type === "particulier" ? form.prenom : "",
          raison_sociale: type === "entreprise" ? form.raison_sociale : "",
          telephone: form.telephone,
          email: form.email,
          adresse: form.adresse,
          quartier: form.quartier,
          ville: form.ville,
          pays: form.pays,
          numero_identification: form.numero_identification,
          force,
        }),
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

      if (serviceDemande) {
        const dossierRes = await fetch("/api/accueil/dossiers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_record_id: json.client.id,
            service: serviceDemande,
            motif: motif.trim(),
            objet: motif.trim(),
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
          Avant toute création, rechercher le client pour éviter les doublons. Le courriel n&rsquo;est
          pas obligatoire.
        </p>

        <div className="mt-3 flex gap-2">
          {(["particulier", "entreprise"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={cn(
                "rounded-sm border px-3 py-1.5 text-caption font-semibold",
                type === t ? "border-brand bg-brand-subtle text-ink" : "border-line text-ink-muted"
              )}
            >
              {t === "particulier" ? "Particulier" : "Entreprise"}
            </button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {type === "entreprise" ? (
            <label className="col-span-2 block">
              <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">
                Raison sociale *
              </span>
              <input
                type="text"
                value={form.raison_sociale}
                onChange={(e) => patch("raison_sociale", e.target.value)}
                className={cn(inputClass, "mt-1")}
              />
            </label>
          ) : (
            <>
              <label className="block">
                <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">
                  Nom *
                </span>
                <input
                  type="text"
                  value={form.nom}
                  onChange={(e) => patch("nom", e.target.value)}
                  className={cn(inputClass, "mt-1")}
                />
              </label>
              <label className="block">
                <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">
                  Prénom
                </span>
                <input
                  type="text"
                  value={form.prenom}
                  onChange={(e) => patch("prenom", e.target.value)}
                  className={cn(inputClass, "mt-1")}
                />
              </label>
            </>
          )}
          <label className="block">
            <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">
              Téléphone
            </span>
            <input
              type="tel"
              value={form.telephone}
              onChange={(e) => patch("telephone", e.target.value)}
              className={cn(inputClass, "mt-1")}
            />
          </label>
          <label className="block">
            <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">
              Courriel (si disponible)
            </span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => patch("email", e.target.value)}
              className={cn(inputClass, "mt-1")}
            />
          </label>
          <label className="col-span-2 block">
            <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">
              Adresse
            </span>
            <input
              type="text"
              value={form.adresse}
              onChange={(e) => patch("adresse", e.target.value)}
              className={cn(inputClass, "mt-1")}
            />
          </label>
          <label className="block">
            <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">
              Quartier
            </span>
            <input
              type="text"
              value={form.quartier}
              onChange={(e) => patch("quartier", e.target.value)}
              className={cn(inputClass, "mt-1")}
            />
          </label>
          <label className="block">
            <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">Ville</span>
            <input
              type="text"
              value={form.ville}
              onChange={(e) => patch("ville", e.target.value)}
              className={cn(inputClass, "mt-1")}
            />
          </label>
          <label className="block">
            <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">Pays</span>
            <select
              value={form.pays}
              onChange={(e) => patch("pays", e.target.value)}
              className={cn(inputClass, "mt-1")}
            >
              {PAYS_ACCUEIL.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
          {type === "entreprise" ? (
            <label className="block">
              <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">
                NUI / RCCM (si connu)
              </span>
              <input
                type="text"
                value={form.numero_identification}
                onChange={(e) => patch("numero_identification", e.target.value)}
                className={cn(inputClass, "mt-1")}
              />
            </label>
          ) : null}
        </div>

        <div className="mt-5 rounded-sm border border-line bg-surface p-4">
          <p className="text-body-sm font-semibold text-ink">Service demandé (optionnel)</p>
          <p className="mt-0.5 text-caption text-ink-muted">
            Choisir un service ouvre et oriente immédiatement un dossier. Un client peut en avoir
            plusieurs dans le temps.
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
                  {[d.prenom, d.nom, d.raison_sociale].filter(Boolean).join(" ")} ·{" "}
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
