import { Globe } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import {
  I18nClient,
  type Language,
  type TranslationKey,
} from "@/components/dashboard/I18nClient";

export const metadata = {
  title: "Multi-langue | Super Admin",
};

export const dynamic = "force-dynamic";

// ─── Données mockées (table i18n_translations à créer en migration ultérieure) ─

const MOCK_LANGUAGES: Language[] = [
  {
    code: "fr",
    label: "Français",
    native_label: "Français",
    flag: "🇫🇷",
    enabled: true,
    is_default: true,
    completion: 100,
  },
  {
    code: "en",
    label: "Anglais",
    native_label: "English",
    flag: "🇬🇧",
    enabled: true,
    is_default: false,
    completion: 78,
  },
  {
    code: "sg",
    label: "Sango",
    native_label: "Sängö",
    flag: "🇨🇫",
    enabled: false,
    is_default: false,
    completion: 12,
  },
  {
    code: "ar",
    label: "Arabe",
    native_label: "العربية",
    flag: "🇸🇦",
    enabled: false,
    is_default: false,
    completion: 0,
  },
];

const MOCK_KEYS: TranslationKey[] = [
  // ─── Navbar ─────────────────────────────────────────────────
  {
    id: "k_001",
    namespace: "navbar",
    key: "menu.home",
    values: { fr: "Accueil", en: "Home", sg: "Da" },
  },
  {
    id: "k_002",
    namespace: "navbar",
    key: "menu.services",
    values: { fr: "Services", en: "Services", sg: "Akua" },
  },
  {
    id: "k_003",
    namespace: "navbar",
    key: "menu.about",
    values: { fr: "À propos", en: "About", sg: "" },
  },
  {
    id: "k_004",
    namespace: "navbar",
    key: "menu.contact",
    values: { fr: "Contact", en: "Contact" },
  },
  {
    id: "k_005",
    namespace: "navbar",
    key: "cta.login",
    values: { fr: "Se connecter", en: "Sign in" },
  },
  // ─── Hero ───────────────────────────────────────────────────
  {
    id: "k_006",
    namespace: "hero",
    key: "title",
    values: {
      fr: "L'expertise centrafricaine pour vos démarches internationales",
      en: "Central African expertise for your international procedures",
    },
  },
  {
    id: "k_007",
    namespace: "hero",
    key: "subtitle",
    values: {
      fr: "Visa, études, bourses, transferts d'argent, formation TCF — accompagnement de A à Z depuis Bangui.",
      en: "Visa, studies, scholarships, money transfers, TCF training — full support from Bangui.",
    },
  },
  {
    id: "k_008",
    namespace: "hero",
    key: "cta.primary",
    values: { fr: "Démarrer ma démarche", en: "Start my procedure" },
  },
  // ─── Dashboard ──────────────────────────────────────────────
  {
    id: "k_009",
    namespace: "dashboard",
    key: "greeting.morning",
    values: { fr: "Bonjour", en: "Good morning" },
  },
  {
    id: "k_010",
    namespace: "dashboard",
    key: "greeting.afternoon",
    values: { fr: "Bon après-midi", en: "Good afternoon" },
  },
  {
    id: "k_011",
    namespace: "dashboard",
    key: "stats.total_demandes",
    values: { fr: "Demandes totales", en: "Total requests" },
  },
  {
    id: "k_012",
    namespace: "dashboard",
    key: "stats.dossiers_actifs",
    values: { fr: "Dossiers actifs", en: "Active cases" },
  },
  {
    id: "k_013",
    namespace: "dashboard",
    key: "actions.new_request",
    values: { fr: "Nouvelle demande", en: "New request" },
  },
  // ─── Forms ──────────────────────────────────────────────────
  {
    id: "k_014",
    namespace: "forms",
    key: "field.firstname",
    values: { fr: "Prénom", en: "First name" },
  },
  {
    id: "k_015",
    namespace: "forms",
    key: "field.lastname",
    values: { fr: "Nom", en: "Last name" },
  },
  {
    id: "k_016",
    namespace: "forms",
    key: "field.email",
    values: { fr: "E-mail", en: "Email" },
  },
  {
    id: "k_017",
    namespace: "forms",
    key: "field.phone",
    values: { fr: "Téléphone", en: "" },
  },
  {
    id: "k_018",
    namespace: "forms",
    key: "validation.required",
    values: { fr: "Ce champ est obligatoire", en: "This field is required" },
  },
  // ─── Emails ─────────────────────────────────────────────────
  {
    id: "k_019",
    namespace: "emails",
    key: "welcome.subject",
    values: {
      fr: "Bienvenue chez Nexus RCA",
      en: "Welcome to Nexus RCA",
    },
  },
  {
    id: "k_020",
    namespace: "emails",
    key: "welcome.body_intro",
    values: {
      fr: "Bonjour {prenom}, votre compte Nexus RCA a été créé avec succès.",
      en: "Hello {prenom}, your Nexus RCA account has been successfully created.",
    },
  },
  {
    id: "k_021",
    namespace: "emails",
    key: "payment.confirmation_subject",
    values: {
      fr: "Confirmation de paiement — {ref}",
      en: "Payment confirmation — {ref}",
    },
  },
  // ─── Errors ─────────────────────────────────────────────────
  {
    id: "k_022",
    namespace: "errors",
    key: "auth.invalid_credentials",
    values: {
      fr: "Identifiants invalides",
      en: "Invalid credentials",
    },
  },
  {
    id: "k_023",
    namespace: "errors",
    key: "network.offline",
    values: {
      fr: "Connexion réseau indisponible",
      en: "Network connection unavailable",
    },
  },
  {
    id: "k_024",
    namespace: "errors",
    key: "permission.denied",
    values: { fr: "Accès refusé", en: "Access denied" },
  },
];

export default async function SuperAdminI18nPage() {
  const profile = await requireProfile(["super_admin"]);

  return (
    <DashboardShell profile={profile}>
      <BackButton fallbackHref="/dashboard/super-admin" label="Retour au tableau de bord" />

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900 text-white shadow-lg">
          <Globe className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-nexus-blue-950">
            Multi-langue
          </h1>
          <p className="mt-1 text-slate-600">
            Configuration des langues et gestion des traductions.
          </p>
        </div>
      </div>

      <I18nClient initialLanguages={MOCK_LANGUAGES} initialKeys={MOCK_KEYS} />
    </DashboardShell>
  );
}
