"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DOCUMENT_CATEGORIES } from "@/lib/demande-complete-form";
import { isFinancementService, type PrioriteAccueil } from "@/lib/accueil-forms";
import { ClientPicker } from "./ClientPicker";
import { displayClientName, type AccueilClient } from "./NewClientModal";

const inputClass =
  "w-full rounded-sm border border-line bg-surface px-3 py-2 text-body-sm text-ink placeholder:text-ink-subtle focus:border-line-strong focus:outline-none focus:ring-2 focus:ring-focus";

export type AccueilService = { id: string; nom: string; categorie: string; slug?: string };
export type AccueilAgent = { id: string; nom: string; prenom: string | null };

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
    <label className={cn("block", className)}>
      <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function ServiceSpecificFields({
  service,
  values,
  set,
}: {
  service: string;
  values: Record<string, string>;
  set: (k: string, v: string) => void;
}) {
  const f = (label: string, key: string, extra?: { type?: string; placeholder?: string }) => (
    <Field label={label}>
      <input
        className={inputClass}
        type={extra?.type || "text"}
        placeholder={extra?.placeholder}
        value={values[key] || ""}
        onChange={(e) => set(key, e.target.value)}
      />
    </Field>
  );
  const sel = (label: string, key: string, opts: string[]) => (
    <Field label={label}>
      <select className={inputClass} value={values[key] || ""} onChange={(e) => set(key, e.target.value)}>
        <option value="">—</option>
        {opts.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </Field>
  );
  const n = service.toLowerCase();
  if (n.includes("visa")) {
    return (
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {sel("Type de visa", "type_visa", [
          "tourisme",
          "études",
          "affaires",
          "travail",
          "transit",
          "regroupement familial",
        ])}
        {f("Destination", "destination", { placeholder: "France, Canada…" })}
        {f("Date de voyage souhaitée", "date_voyage", { type: "date" })}
        {sel("Passeport disponible", "passeport_disponible", ["Oui, valide", "Non, à faire"])}
        {sel("Documents déjà prêts", "documents_status", ["Aucun", "Partiel", "Complet"])}
      </div>
    );
  }
  if (n.includes("billet") || n.includes("hôtel") || n.includes("hotel")) {
    return (
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {f("Ville de départ", "ville_depart", { placeholder: "Bangui" })}
        {f("Destination", "destination")}
        {f("Date aller", "date_depart", { type: "date" })}
        {f("Date retour", "date_retour", { type: "date" })}
        {f("Nombre de voyageurs", "voyageurs")}
        {sel("Classe", "classe", ["Économique", "Premium", "Business", "Première"])}
      </div>
    );
  }
  if (n.includes("assurance")) {
    return (
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {f("Destination", "destination")}
        {f("Date aller", "date_depart", { type: "date" })}
        {f("Date retour", "date_retour", { type: "date" })}
        {f("Nombre d'assurés", "assures")}
      </div>
    );
  }
  if (n.includes("tcf") || n.includes("étude") || n.includes("etude") || n.includes("bourse")) {
    return (
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {f("Pays visé", "pays_vise", { placeholder: "Canada" })}
        {sel("Niveau", "niveau", ["Licence / Bachelor", "Master", "Doctorat", "Formation pro", "Cégep / DEC"])}
        {f("Domaine / filière", "domaine")}
        {f("Rentrée cible", "annee_cible", { type: "month" })}
        {f("Établissement visé (si connu)", "etablissement_vise")}
      </div>
    );
  }
  if (n.includes("transfert")) {
    return (
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {f("Montant", "montant")}
        {f("Devise", "devise", { placeholder: "XAF" })}
        {f("Destinataire", "destinataire")}
        {f("Pays de destination", "pays_destination")}
      </div>
    );
  }
  if (n.includes("change")) {
    return (
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {f("Devise source", "devise_source")}
        {f("Devise cible", "devise_cible")}
        {f("Montant", "montant")}
      </div>
    );
  }
  if (n.includes("digital") || n.includes("nexus ia") || n.includes("administratif")) {
    return (
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {f("Besoin", "besoin")}
        {sel("Délai souhaité", "delai", ["Sous 24h", "Sous 48h", "Dans la semaine", "Flexible"])}
      </div>
    );
  }
  return null;
}

export function NouveauDossierForm({
  services,
  agents,
  initialClient,
}: {
  services: AccueilService[];
  agents: AccueilAgent[];
  initialClient: AccueilClient | null;
}) {
  const router = useRouter();
  const [client, setClient] = useState<AccueilClient | null>(initialClient);
  const [serviceId, setServiceId] = useState(services[0]?.id || "");
  const [typeDemande, setTypeDemande] = useState("");
  const [objet, setObjet] = useState("");
  const [description, setDescription] = useState("");
  const [priorite, setPriorite] = useState<PrioriteAccueil>("normale");
  const [echeance, setEcheance] = useState("");
  const [agentId, setAgentId] = useState("");
  const [specifics, setSpecifics] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<{ file: File; cat: string }[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialClient) setClient(initialClient);
  }, [initialClient]);

  const service = services.find((s) => s.id === serviceId);
  const serviceNom = service?.nom || "";

  async function uploadPieces(demandeId: string) {
    for (const f of files) {
      const fd = new FormData();
      fd.append("file", f.file);
      fd.append("categorie", f.cat);
      const res = await fetch(`/api/demandes/${demandeId}/documents`, { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        toast.error(`Pièce « ${f.file.name} » : ${json.error || "échec d'envoi"}`);
      }
    }
  }

  async function save(draft: boolean) {
    if (!client) {
      toast.error("Sélectionnez ou créez un client. La saisie du dossier est conservée.");
      return;
    }
    if (!serviceNom) {
      toast.error("Choisissez un service");
      return;
    }
    if (!draft && !objet.trim()) {
      toast.error("L'objet est indispensable à l'ouverture");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/accueil/dossiers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_record_id: client.id,
          service: serviceNom,
          service_id: serviceId || null,
          objet: objet.trim(),
          description: description.trim(),
          motif: objet.trim() || description.trim(),
          type_procedure: typeDemande.trim() || null,
          priorite,
          echeance: echeance || null,
          agent_id: agentId || null,
          details_service: { type_demande: typeDemande, specifics },
          draft,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Échec de l'ouverture du dossier");
        return;
      }
      if (files.length) await uploadPieces(json.dossier.id);
      toast.success(
        `Dossier ${json.dossier.reference || ""} ${draft ? "enregistré en brouillon" : "ouvert"}`
      );
      if (isFinancementService(serviceNom)) {
        router.push(`/dashboard/accueil/financement?client=${client.id}&demande=${json.dossier.id}`);
        return;
      }
      router.push(`/dashboard/accueil/clients/${client.id}`);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-body-sm text-ink-muted">
        Indispensables : client, service, objet. Le reste peut être complété plus tard. Formats : PDF,
        JPG, PNG — 10 Mo max.
      </p>

      <section className="rounded-sm border border-line bg-surface-elevated p-4">
        <h2 className="font-display text-title text-ink">Client</h2>
        <div className="mt-3">
          <ClientPicker client={client} onChange={setClient} />
        </div>
      </section>

      <section className="rounded-sm border border-line bg-surface-elevated p-4">
        <h2 className="font-display text-title text-ink">Demande</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Service *">
            <select
              className={inputClass}
              value={serviceId}
              onChange={(e) => {
                setServiceId(e.target.value);
                setSpecifics({});
              }}
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nom}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Type de demande">
            <input className={inputClass} value={typeDemande} onChange={(e) => setTypeDemande(e.target.value)} />
          </Field>
          <Field label="Objet *" className="sm:col-span-2">
            <input className={inputClass} value={objet} onChange={(e) => setObjet(e.target.value)} />
          </Field>
          <Field label="Description du besoin" className="sm:col-span-2">
            <textarea
              className={inputClass}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>
          <Field label="Priorité">
            <select
              className={inputClass}
              value={priorite}
              onChange={(e) => setPriorite(e.target.value as PrioriteAccueil)}
            >
              <option value="normale">Normale</option>
              <option value="urgente">Urgente</option>
              <option value="critique">Critique</option>
            </select>
          </Field>
          <Field label="Échéance (optionnel)">
            <input className={inputClass} type="date" value={echeance} onChange={(e) => setEcheance(e.target.value)} />
          </Field>
          <Field label="Agent responsable (optionnel)" className="sm:col-span-2">
            <select className={inputClass} value={agentId} onChange={(e) => setAgentId(e.target.value)}>
              <option value="">À affecter</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {[a.prenom, a.nom].filter(Boolean).join(" ")}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <p className="mt-3 text-caption font-semibold uppercase tracking-wide text-ink-muted">
          Informations spécifiques au service (complément)
        </p>
        <ServiceSpecificFields
          service={serviceNom}
          values={specifics}
          set={(k, v) => setSpecifics((p) => ({ ...p, [k]: v }))}
        />
        {isFinancementService(serviceNom) ? (
          <p className="mt-3 text-body-sm text-ink-muted">
            Après enregistrement, le formulaire Financement & Incubateur s&rsquo;ouvre pour le projet, le
            budget et les pièces.
          </p>
        ) : null}
      </section>

      <section className="rounded-sm border border-line bg-surface-elevated p-4">
        <h2 className="font-display text-title text-ink">Pièces justificatives</h2>
        <p className="mt-1 text-caption text-ink-muted">
          PDF, JPG, PNG — 10 Mo. Catégorie par fichier. La réception collecte ; le service compétent
          valide.
        </p>
        <input
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          className="mt-3 text-body-sm"
          onChange={(e) => {
            const list = e.target.files;
            if (!list) return;
            const next: { file: File; cat: string }[] = [];
            Array.from(list).forEach((file) => {
              if (file.size > 10 * 1024 * 1024) {
                toast.error(`${file.name} trop volumineux (10 Mo max)`);
                return;
              }
              next.push({ file, cat: "documents_complementaires" });
            });
            setFiles((prev) => [...prev, ...next]);
            e.target.value = "";
          }}
        />
        <ul className="mt-2 divide-y divide-line text-body-sm">
          {files.map((f, i) => (
            <li key={`${f.file.name}-${i}`} className="grid gap-2 py-2 sm:grid-cols-[1fr_220px_auto]">
              <span className="font-medium text-ink">
                {f.file.name}
                <span className="block text-caption text-ink-muted">
                  {Math.round(f.file.size / 1024)} Ko
                </span>
              </span>
              <select
                className={inputClass}
                value={f.cat}
                onChange={(e) =>
                  setFiles((prev) => prev.map((x, j) => (j === i ? { ...x, cat: e.target.value } : x)))
                }
              >
                {DOCUMENT_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="text-caption font-semibold text-ink-muted hover:text-ink"
                onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
              >
                Retirer
              </button>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={() => save(false)}
          className="inline-flex items-center gap-2 rounded-sm bg-brand px-4 py-2.5 text-body-sm font-semibold text-on-brand hover:bg-brand-hover disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Enregistrer le dossier
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => save(true)}
          className="rounded-sm border border-line px-4 py-2.5 text-body-sm font-semibold text-ink hover:border-line-strong disabled:opacity-50"
        >
          Enregistrer en brouillon
        </button>
        {client ? (
          <a
            href={`/dashboard/accueil/clients/${client.id}`}
            className="rounded-sm px-4 py-2.5 text-body-sm font-semibold text-ink-muted hover:text-ink"
          >
            Fiche {displayClientName(client)}
          </a>
        ) : null}
      </div>
    </div>
  );
}
