"use client";

import { useState } from "react";
import {
  Building2,
  Phone,
  Clock,
  Plug,
  Save,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Mail,
  CreditCard,
  MessageCircle,
  Database,
  type LucideIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────

export interface AgencySettings {
  identite: {
    nom: string;
    baseline: string;
    slogan: string;
    logo_url: string;
    favicon_url: string;
    couleur_principale: string;
    couleur_secondaire: string;
  };
  contacts: {
    telephone_principal: string;
    telephone_secondaire: string;
    email_contact: string;
    email_support: string;
    whatsapp_number: string;
    adresse: string;
    ville: string;
    pays: string;
    code_postal: string;
  };
  horaires: Array<{
    jour: string;
    ouverture: string;
    fermeture: string;
    ferme: boolean;
  }>;
  integrations: {
    resend: {
      enabled: boolean;
      api_key_set: boolean;
      from_email: string;
      last_test: string | null;
      status: "operational" | "not_configured" | "error";
    };
    stripe: {
      enabled: boolean;
      api_key_set: boolean;
      mode: "test" | "live";
      webhook_set: boolean;
      status: "operational" | "not_configured" | "error";
    };
    whatsapp_business: {
      enabled: boolean;
      phone_id_set: boolean;
      access_token_set: boolean;
      status: "operational" | "not_configured" | "error";
    };
    supabase: {
      enabled: boolean;
      url: string;
      service_key_set: boolean;
      status: "operational" | "not_configured" | "error";
    };
  };
}

type TabKey = "identite" | "contacts" | "horaires" | "integrations";

const TABS: { key: TabKey; label: string; icon: LucideIcon }[] = [
  { key: "identite", label: "Identité", icon: Building2 },
  { key: "contacts", label: "Contacts", icon: Phone },
  { key: "horaires", label: "Horaires", icon: Clock },
  { key: "integrations", label: "Intégrations", icon: Plug },
];

// ─── Composant principal ─────────────────────────────────────────────────

export function ParametresAgenceClient({
  initialSettings,
}: {
  initialSettings: AgencySettings;
}) {
  const [tab, setTab] = useState<TabKey>("identite");
  const [settings, setSettings] = useState<AgencySettings>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const update = <K extends keyof AgencySettings>(
    section: K,
    next: AgencySettings[K]
  ) => {
    setSettings((s) => ({ ...s, [section]: next }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    // Mock: simule l'enregistrement (en attendant la table agency_settings)
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setHasChanges(false);
    toast.success("Paramètres enregistrés (mock — table agency_settings à créer)");
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl border border-line bg-surface-elevated p-1.5 shadow-elev-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-body-sm font-semibold transition",
                active
                  ? "bg-nexus-blue-950 text-white shadow-elev-2 dark:bg-brand"
                  : "text-ink-muted hover:bg-surface-sunken hover:text-ink"
              )}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2 sm:p-8">
        {tab === "identite" && (
          <IdentiteTab
            value={settings.identite}
            onChange={(v) => update("identite", v)}
          />
        )}
        {tab === "contacts" && (
          <ContactsTab
            value={settings.contacts}
            onChange={(v) => update("contacts", v)}
          />
        )}
        {tab === "horaires" && (
          <HorairesTab
            value={settings.horaires}
            onChange={(v) => update("horaires", v)}
          />
        )}
        {tab === "integrations" && <IntegrationsTab value={settings.integrations} />}
      </div>

      {/* Save bar */}
      <div className="sticky bottom-4 flex items-center justify-between rounded-2xl border border-line bg-surface-elevated p-4 shadow-elev-3">
        <p className="text-body-sm text-ink-muted">
          {hasChanges ? (
            <>
              <AlertTriangle className="mr-1.5 inline h-4 w-4 text-amber-500" />
              Modifications non enregistrées
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-1.5 inline h-4 w-4 text-emerald-500" />
              Tout est synchronisé
            </>
          )}
        </p>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-body-sm font-semibold shadow-elev-2 transition",
            hasChanges && !saving
              ? "bg-brand text-white hover:bg-brand-hover hover:shadow-glow-orange"
              : "cursor-not-allowed bg-surface-sunken text-ink-muted"
          )}
        >
          <Save className="h-4 w-4" />
          {saving ? "Enregistrement…" : "Enregistrer les paramètres"}
        </button>
      </div>
    </div>
  );
}

// ─── Onglet Identité ─────────────────────────────────────────────────────

function IdentiteTab({
  value,
  onChange,
}: {
  value: AgencySettings["identite"];
  onChange: (v: AgencySettings["identite"]) => void;
}) {
  const set = <K extends keyof typeof value>(k: K, v: (typeof value)[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <div className="space-y-6">
      <Section title="Identité de l'agence" subtitle="Nom, baseline, slogan, logo et palette.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nom de l'agence" value={value.nom} onChange={(v) => set("nom", v)} />
          <Field label="Slogan court" value={value.slogan} onChange={(v) => set("slogan", v)} />
          <div className="sm:col-span-2">
            <Field
              label="Baseline (sous-titre principal)"
              value={value.baseline}
              onChange={(v) => set("baseline", v)}
            />
          </div>
          <Field label="URL du logo" value={value.logo_url} onChange={(v) => set("logo_url", v)} />
          <Field
            label="URL du favicon"
            value={value.favicon_url}
            onChange={(v) => set("favicon_url", v)}
          />
          <ColorField
            label="Couleur principale"
            value={value.couleur_principale}
            onChange={(v) => set("couleur_principale", v)}
          />
          <ColorField
            label="Couleur secondaire"
            value={value.couleur_secondaire}
            onChange={(v) => set("couleur_secondaire", v)}
          />
        </div>
      </Section>

      <Section title="Aperçu" subtitle="Rendu visuel des éléments d'identité.">
        <div className="rounded-2xl border-2 border-dashed border-line bg-surface-sunken p-6">
          <div className="flex items-center gap-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-elev-2"
              style={{
                background: `linear-gradient(135deg, ${value.couleur_secondaire}, ${value.couleur_principale})`,
              }}
            >
              N
            </div>
            <div>
              <h3 className="font-display text-display-sm" style={{ color: value.couleur_secondaire }}>
                {value.nom}
              </h3>
              <p className="text-body-sm text-ink-muted">{value.baseline}</p>
              <p
                className="mt-1 inline-block rounded-full px-2 py-0.5 text-overline"
                style={{
                  background: `${value.couleur_principale}15`,
                  color: value.couleur_principale,
                }}
              >
                {value.slogan}
              </p>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

// ─── Onglet Contacts ─────────────────────────────────────────────────────

function ContactsTab({
  value,
  onChange,
}: {
  value: AgencySettings["contacts"];
  onChange: (v: AgencySettings["contacts"]) => void;
}) {
  const set = <K extends keyof typeof value>(k: K, v: (typeof value)[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <div className="space-y-6">
      <Section title="Téléphones & e-mails" subtitle="Visibles en pied de page et sur les e-mails sortants.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Téléphone principal"
            value={value.telephone_principal}
            onChange={(v) => set("telephone_principal", v)}
            placeholder="+236 ..."
          />
          <Field
            label="Téléphone secondaire (optionnel)"
            value={value.telephone_secondaire}
            onChange={(v) => set("telephone_secondaire", v)}
          />
          <Field
            label="WhatsApp Business"
            value={value.whatsapp_number}
            onChange={(v) => set("whatsapp_number", v)}
            placeholder="+1 587 ..."
          />
          <Field
            label="E-mail contact"
            value={value.email_contact}
            onChange={(v) => set("email_contact", v)}
            type="email"
          />
          <Field
            label="E-mail support"
            value={value.email_support}
            onChange={(v) => set("email_support", v)}
            type="email"
          />
        </div>
      </Section>

      <Section title="Adresse" subtitle="Affichée sur les reçus PDF et le pied de page.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Adresse" value={value.adresse} onChange={(v) => set("adresse", v)} />
          </div>
          <Field label="Ville" value={value.ville} onChange={(v) => set("ville", v)} />
          <Field label="Pays" value={value.pays} onChange={(v) => set("pays", v)} />
          <Field
            label="Code postal / BP"
            value={value.code_postal}
            onChange={(v) => set("code_postal", v)}
          />
        </div>
      </Section>
    </div>
  );
}

// ─── Onglet Horaires ─────────────────────────────────────────────────────

function HorairesTab({
  value,
  onChange,
}: {
  value: AgencySettings["horaires"];
  onChange: (v: AgencySettings["horaires"]) => void;
}) {
  const updateRow = (
    idx: number,
    patch: Partial<AgencySettings["horaires"][number]>
  ) => {
    const next = [...value];
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  };

  return (
    <Section
      title="Horaires d'ouverture"
      subtitle="Affichés sur la page contact et le footer."
    >
      <div className="overflow-hidden rounded-2xl border border-line">
        <table className="w-full">
          <thead className="border-b border-line bg-surface-sunken">
            <tr className="text-left">
              <th className="px-4 py-3 text-overline text-ink-muted">Jour</th>
              <th className="px-4 py-3 text-overline text-ink-muted">Ouverture</th>
              <th className="px-4 py-3 text-overline text-ink-muted">Fermeture</th>
              <th className="px-4 py-3 text-overline text-ink-muted">Fermé</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {value.map((row, i) => (
              <tr key={row.jour} className="bg-surface-elevated">
                <td className="px-4 py-3 text-body-sm font-semibold text-ink">{row.jour}</td>
                <td className="px-4 py-3">
                  <input
                    type="time"
                    value={row.ferme ? "" : row.ouverture}
                    disabled={row.ferme}
                    onChange={(e) => updateRow(i, { ouverture: e.target.value })}
                    className="rounded-lg border border-line-strong bg-surface-elevated px-2 py-1 text-body-sm text-ink disabled:opacity-50"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="time"
                    value={row.ferme ? "" : row.fermeture}
                    disabled={row.ferme}
                    onChange={(e) => updateRow(i, { fermeture: e.target.value })}
                    className="rounded-lg border border-line-strong bg-surface-elevated px-2 py-1 text-body-sm text-ink disabled:opacity-50"
                  />
                </td>
                <td className="px-4 py-3">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={row.ferme}
                      onChange={(e) => updateRow(i, { ferme: e.target.checked })}
                      className="h-4 w-4 cursor-pointer rounded border-line-strong text-brand focus:ring-brand/30"
                    />
                    <span className="text-caption text-ink-muted">Fermé toute la journée</span>
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

// ─── Onglet Intégrations ─────────────────────────────────────────────────

function IntegrationsTab({ value }: { value: AgencySettings["integrations"] }) {
  return (
    <div className="space-y-6">
      <Section
        title="Statut des intégrations"
        subtitle="Lecture seule. Configurer via les variables d'environnement."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <IntegrationCard
            name="Resend (e-mails)"
            icon={Mail}
            status={value.resend.status}
            details={[
              { label: "API key", ok: value.resend.api_key_set },
              { label: "Domaine vérifié", ok: value.resend.api_key_set },
            ]}
            extra={
              <p className="text-caption text-ink-muted">
                From : <code className="font-mono">{value.resend.from_email}</code>
              </p>
            }
          />
          <IntegrationCard
            name="Stripe (paiements)"
            icon={CreditCard}
            status={value.stripe.status}
            details={[
              { label: "Secret key", ok: value.stripe.api_key_set },
              { label: "Webhook configuré", ok: value.stripe.webhook_set },
            ]}
            extra={
              <p className="text-caption text-ink-muted">
                Mode : <strong>{value.stripe.mode === "live" ? "PRODUCTION" : "TEST"}</strong>
              </p>
            }
          />
          <IntegrationCard
            name="WhatsApp Business"
            icon={MessageCircle}
            status={value.whatsapp_business.status}
            details={[
              { label: "Phone ID", ok: value.whatsapp_business.phone_id_set },
              { label: "Access token", ok: value.whatsapp_business.access_token_set },
            ]}
          />
          <IntegrationCard
            name="Supabase (DB & Auth)"
            icon={Database}
            status={value.supabase.status}
            details={[
              { label: "URL configurée", ok: !!value.supabase.url },
              { label: "Service role key", ok: value.supabase.service_key_set },
            ]}
            extra={
              <p className="truncate text-caption text-ink-muted">
                <code className="font-mono">{value.supabase.url}</code>
              </p>
            }
          />
        </div>
      </Section>

      <div className="rounded-2xl border border-line bg-surface-sunken p-4 text-caption text-ink-muted">
        <strong>Note sécurité.</strong> Les clés (API, tokens) sont gérées exclusivement via les
        variables d&apos;environnement (<code className="font-mono">.env.local</code> en dev,
        Vercel env vars en prod). Aucune clé n&apos;est stockée en base de données ni n&apos;est éditable
        depuis cette interface.
      </div>
    </div>
  );
}

// ─── Sous-composants utilitaires ─────────────────────────────────────────

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-4">
        <h2 className="font-display text-headline text-ink">{title}</h2>
        {subtitle && <p className="mt-1 text-body-sm text-ink-muted">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-caption font-semibold text-ink">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-line-strong bg-surface-elevated px-3 py-2.5 text-body-sm text-ink placeholder:text-ink-subtle focus:border-brand focus:outline-none"
      />
    </label>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-caption font-semibold text-ink">{label}</span>
      <div className="flex items-center gap-2 rounded-xl border border-line-strong bg-surface-elevated px-3 py-2.5">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-14 cursor-pointer rounded border border-line"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent font-mono text-body-sm text-ink focus:outline-none"
        />
      </div>
    </label>
  );
}

function IntegrationCard({
  name,
  icon: Icon,
  status,
  details,
  extra,
}: {
  name: string;
  icon: LucideIcon;
  status: "operational" | "not_configured" | "error";
  details: Array<{ label: string; ok: boolean }>;
  extra?: React.ReactNode;
}) {
  const statusInfo = {
    operational: {
      label: "Opérationnel",
      class: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    },
    not_configured: {
      label: "Non configuré",
      class: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    },
    error: {
      label: "Erreur",
      class: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
    },
  }[status];

  return (
    <div className="rounded-2xl border border-line bg-surface-elevated p-5 shadow-elev-1">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-subtle text-brand">
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="font-display text-title text-ink">{name}</h3>
        </div>
        <span className={cn("rounded-full px-2.5 py-0.5 text-overline", statusInfo.class)}>
          {statusInfo.label}
        </span>
      </div>
      <ul className="mb-3 space-y-1.5">
        {details.map((d) => (
          <li key={d.label} className="flex items-center gap-2 text-body-sm">
            {d.ok ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
            ) : (
              <XCircle className="h-4 w-4 shrink-0 text-rose-500" />
            )}
            <span className={d.ok ? "text-ink" : "text-ink-muted"}>{d.label}</span>
          </li>
        ))}
      </ul>
      {extra}
    </div>
  );
}
