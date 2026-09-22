"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { DOCUMENT_CATEGORIES } from "@/lib/demande-complete-form";
import {
  APPORTS_PROJET,
  MONTANTS_FOURCHETTE,
  PROFILS_PORTEUR,
  SECTEURS_PROJET,
  STADES_PROJET,
} from "@/lib/accueil-forms";
import { ClientPicker } from "./ClientPicker";
import { displayClientName, type AccueilClient } from "./NewClientModal";

const inputClass =
  "w-full rounded-sm border border-line bg-surface px-3 py-2 text-body-sm text-ink placeholder:text-ink-subtle focus:border-line-strong focus:outline-none focus:ring-2 focus:ring-focus";

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={className ? `block ${className}` : "block"}>
      <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

const PIECES_FIN = [
  { value: "documents_financiers", label: "Plan d'affaires / budget" },
  { value: "documents_administratifs", label: "Documents de l'entreprise" },
  { value: "piece_identite", label: "Pièce d'identité" },
  { value: "documents_complementaires", label: "Pitch / devis / autre" },
];

export function FinancementAccueilForm({
  initialClient,
  serviceNom,
  serviceId,
}: {
  initialClient: AccueilClient | null;
  serviceNom: string;
  serviceId: string | null;
}) {
  const router = useRouter();
  const [client, setClient] = useState<AccueilClient | null>(initialClient);
  const [stade, setStade] = useState("idee");
  const [nomProjet, setNomProjet] = useState("");
  const [secteur, setSecteur] = useState("");
  const [localisation, setLocalisation] = useState("Bangui");
  const [desc, setDesc] = useState("");
  const [montant, setMontant] = useState("");
  const [montantFourchette, setMontantFourchette] = useState("");
  const [devise, setDevise] = useState("XAF");
  const [budget, setBudget] = useState("");
  const [usage, setUsage] = useState("");
  const [apport, setApport] = useState("");
  const [structure, setStructure] = useState("personne_physique");
  const [immat, setImmat] = useState("");
  const [revenus, setRevenus] = useState("");
  const [charges, setCharges] = useState("");
  const [previsions, setPrevisions] = useState("");
  const [incubation, setIncubation] = useState("");
  const [calendrier, setCalendrier] = useState("");
  const [profil, setProfil] = useState("");
  const [equipe, setEquipe] = useState("");
  const [files, setFiles] = useState<{ file: File; cat: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const enCreation = stade === "idee" || stade === "etude" || stade === "pre_lancement";

  async function persist(draft: boolean) {
    if (!client) {
      toast.error("Sélectionnez d'abord le porteur (client).");
      return;
    }
    if (!draft && !nomProjet.trim()) {
      toast.error("Le nom du projet est indispensable.");
      return;
    }
    setSaving(true);
    try {
      const specifics = {
        stade,
        secteur,
        localisation,
        structure,
        immat,
        revenus,
        charges,
        previsions,
        calendrier,
        apport,
        budget,
        usage,
        incubation,
        montant,
        montant_fourchette: montantFourchette,
        devise,
        profil,
        equipe,
      };
      const description = [desc, montant && `Montant ${montant} ${devise}`, usage, incubation]
        .filter(Boolean)
        .join(" · ");
      const res = await fetch("/api/accueil/dossiers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_record_id: client.id,
          service: serviceNom,
          service_id: serviceId,
          objet: nomProjet.trim() || "Brouillon financement",
          description,
          motif: nomProjet.trim() || "Brouillon financement",
          type_procedure: "Financement",
          details_service: { pole: "financement_incubateur", specifics },
          draft,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Échec de l'enregistrement");
        return;
      }
      for (const f of files) {
        const fd = new FormData();
        fd.append("file", f.file);
        fd.append("categorie", f.cat);
        const up = await fetch(`/api/demandes/${json.dossier.id}/documents`, { method: "POST", body: fd });
        const upJson = await up.json().catch(() => ({}));
        if (!up.ok || !upJson.success) {
          toast.error(`Pièce « ${f.file.name} » : ${upJson.error || "échec"}`);
        }
      }
      toast.success(`Dossier ${json.dossier.reference || ""} enregistré`);
      router.push(`/dashboard/accueil/clients/${client.id}`);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-body-sm text-ink-muted">
        Un projet en création n&rsquo;est pas bloqué par des documents d&rsquo;entreprise. Compléments
        possibles plus tard.
      </p>

      <section className="rounded-sm border border-line bg-surface-elevated p-4">
        <h2 className="font-display text-title text-ink">Identité du porteur</h2>
        <div className="mt-3">
          <ClientPicker client={client} onChange={setClient} />
        </div>
        {client ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <p className="text-body-sm text-ink">
              <span className="block text-caption uppercase text-ink-muted">Coordonnées</span>
              {[client.telephone, client.email].filter(Boolean).join(" · ") || "—"}
            </p>
            <Field label="Profil du porteur">
              <select className={inputClass} value={profil} onChange={(e) => setProfil(e.target.value)}>
                <option value="">—</option>
                {PROFILS_PORTEUR.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </Field>
            <Field label="Équipe">
              <select className={inputClass} value={equipe} onChange={(e) => setEquipe(e.target.value)}>
                <option value="">—</option>
                <option>Seul porteur</option>
                <option>Binôme</option>
                <option>Petite équipe</option>
                <option>Projet familial</option>
              </select>
            </Field>
          </div>
        ) : null}
      </section>

      <section className="rounded-sm border border-line bg-surface-elevated p-4">
        <h2 className="font-display text-title text-ink">Projet</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Nom du projet *" className="sm:col-span-2">
            <input className={inputClass} value={nomProjet} onChange={(e) => setNomProjet(e.target.value)} />
          </Field>
          <Field label="Secteur">
            <select className={inputClass} value={secteur} onChange={(e) => setSecteur(e.target.value)}>
              <option value="">—</option>
              {SECTEURS_PROJET.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </Field>
          <Field label="Stade">
            <select className={inputClass} value={stade} onChange={(e) => setStade(e.target.value)}>
              {STADES_PROJET.map((x) => (
                <option key={x.v} value={x.v}>
                  {x.l}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Localisation" className="sm:col-span-2">
            <input className={inputClass} value={localisation} onChange={(e) => setLocalisation(e.target.value)} />
          </Field>
          <Field label="Présentation" className="sm:col-span-2">
            <textarea className={inputClass} rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} />
          </Field>
        </div>
      </section>

      <section className="rounded-sm border border-line bg-surface-elevated p-4">
        <h2 className="font-display text-title text-ink">Financement demandé</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Field label="Montant demandé">
            <input
              className={inputClass}
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              placeholder="Si chiffré"
            />
          </Field>
          <Field label="Fourchette">
            <select
              className={inputClass}
              value={montantFourchette}
              onChange={(e) => setMontantFourchette(e.target.value)}
            >
              <option value="">—</option>
              {MONTANTS_FOURCHETTE.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </Field>
          <Field label="Devise">
            <select className={inputClass} value={devise} onChange={(e) => setDevise(e.target.value)}>
              <option>XAF</option>
              <option>EUR</option>
              <option>USD</option>
              <option>CAD</option>
            </select>
          </Field>
          <Field label="Apport personnel">
            <select className={inputClass} value={apport} onChange={(e) => setApport(e.target.value)}>
              <option value="">—</option>
              {APPORTS_PROJET.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </Field>
          <Field label="Budget du projet" className="sm:col-span-2">
            <input className={inputClass} value={budget} onChange={(e) => setBudget(e.target.value)} />
          </Field>
          <Field label="Utilisation prévue des fonds" className="sm:col-span-3">
            <textarea className={inputClass} rows={2} value={usage} onChange={(e) => setUsage(e.target.value)} />
          </Field>
        </div>
      </section>

      <section className="rounded-sm border border-line bg-surface-elevated p-4">
        <h2 className="font-display text-title text-ink">Situation</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Statut juridique">
            <select className={inputClass} value={structure} onChange={(e) => setStructure(e.target.value)}>
              <option value="personne_physique">Personne physique / en création</option>
              <option value="entreprise">Entreprise immatriculée</option>
              <option value="association">Association / GIE</option>
            </select>
          </Field>
          <Field label="Immatriculation (si connue)">
            <input
              className={inputClass}
              value={immat}
              onChange={(e) => setImmat(e.target.value)}
              placeholder={enCreation ? "Non bloquant à ce stade" : "NUI / RCCM"}
            />
          </Field>
          {enCreation ? (
            <p className="sm:col-span-2 text-caption text-ink-muted">
              Projet en création : l&rsquo;immatriculation n&rsquo;est pas exigée pour ouvrir le dossier.
            </p>
          ) : null}
          <Field label="Revenus actuels">
            <input className={inputClass} value={revenus} onChange={(e) => setRevenus(e.target.value)} />
          </Field>
          <Field label="Charges">
            <input className={inputClass} value={charges} onChange={(e) => setCharges(e.target.value)} />
          </Field>
          <Field label="Prévisions" className="sm:col-span-2">
            <textarea
              className={inputClass}
              rows={2}
              value={previsions}
              onChange={(e) => setPrevisions(e.target.value)}
            />
          </Field>
          <Field label="Besoins d'incubation" className="sm:col-span-2">
            <textarea
              className={inputClass}
              rows={2}
              value={incubation}
              onChange={(e) => setIncubation(e.target.value)}
            />
          </Field>
          <Field label="Calendrier" className="sm:col-span-2">
            <input className={inputClass} value={calendrier} onChange={(e) => setCalendrier(e.target.value)} />
          </Field>
        </div>
      </section>

      <section className="rounded-sm border border-line bg-surface-elevated p-4">
        <h2 className="font-display text-title text-ink">Pièces</h2>
        <p className="mt-1 text-caption text-ink-muted">
          Plan d&rsquo;affaires, budget, devis, documents entreprise — facultatifs à l&rsquo;ouverture.
        </p>
        <input
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          className="mt-3 text-body-sm"
          onChange={(e) => {
            const list = e.target.files;
            if (!list) return;
            setFiles((prev) => [
              ...prev,
              ...Array.from(list).map((file) => ({ file, cat: "documents_financiers" })),
            ]);
            e.target.value = "";
          }}
        />
        <ul className="mt-2 divide-y divide-line text-body-sm">
          {files.map((f, i) => (
            <li key={`${f.file.name}-${i}`} className="grid gap-2 py-2 sm:grid-cols-[1fr_240px]">
              <span>{f.file.name}</span>
              <select
                className={inputClass}
                value={f.cat}
                onChange={(e) =>
                  setFiles((prev) => prev.map((x, j) => (j === i ? { ...x, cat: e.target.value } : x)))
                }
              >
                {PIECES_FIN.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
                {DOCUMENT_CATEGORIES.filter((c) => !PIECES_FIN.some((p) => p.value === c.value)).map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={() => persist(false)}
          className="inline-flex items-center gap-2 rounded-sm bg-brand px-4 py-2.5 text-body-sm font-semibold text-on-brand hover:bg-brand-hover disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Enregistrer le dossier
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => persist(true)}
          className="rounded-sm border border-line px-4 py-2.5 text-body-sm font-semibold text-ink hover:border-line-strong disabled:opacity-50"
        >
          Brouillon
        </button>
        {client ? (
          <a
            href={`/dashboard/accueil/clients/${client.id}`}
            className="rounded-sm px-4 py-2.5 text-body-sm font-semibold text-ink-muted"
          >
            Fiche {displayClientName(client)}
          </a>
        ) : null}
      </div>
    </div>
  );
}
