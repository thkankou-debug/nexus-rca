import { Settings } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import {
  ParametresAgenceClient,
  type AgencySettings,
} from "@/components/dashboard/ParametresAgenceClient";

export const metadata = {
  title: "Paramètres agence | Super Admin",
};

export const dynamic = "force-dynamic";

// ─── Données mockées (table agency_settings à créer en migration ultérieure) ─
const MOCK_SETTINGS: AgencySettings = {
  identite: {
    nom: "Nexus RCA",
    baseline: "L'expertise centrafricaine pour vos démarches internationales",
    slogan: "Confidentialité · Rigueur · Méthode",
    logo_url: "/logo.svg",
    favicon_url: "/favicon.ico",
    couleur_principale: "#FF6B00",
    couleur_secondaire: "#0C1C40",
  },
  contacts: {
    telephone_principal: "+236 73 26 96 92",
    telephone_secondaire: "+236 75 12 34 56",
    email_contact: "contact@nexusrca.com",
    email_support: "support@nexusrca.com",
    whatsapp_number: "+1 587 327 6344",
    adresse: "Croisement Marabena, Route de l'Aéroport",
    ville: "Bangui",
    pays: "République Centrafricaine",
    code_postal: "PO.BOX 1204",
  },
  horaires: [
    { jour: "Lundi", ouverture: "08:00", fermeture: "18:00", ferme: false },
    { jour: "Mardi", ouverture: "08:00", fermeture: "18:00", ferme: false },
    { jour: "Mercredi", ouverture: "08:00", fermeture: "18:00", ferme: false },
    { jour: "Jeudi", ouverture: "08:00", fermeture: "18:00", ferme: false },
    { jour: "Vendredi", ouverture: "08:00", fermeture: "17:00", ferme: false },
    { jour: "Samedi", ouverture: "09:00", fermeture: "13:00", ferme: false },
    { jour: "Dimanche", ouverture: "—", fermeture: "—", ferme: true },
  ],
  integrations: {
    resend: {
      enabled: true,
      api_key_set: true,
      from_email: "noreply@nexusrca.com",
      last_test: "2026-05-03T16:45:00Z",
      status: "operational",
    },
    stripe: {
      enabled: false,
      api_key_set: false,
      mode: "test",
      webhook_set: false,
      status: "not_configured",
    },
    whatsapp_business: {
      enabled: false,
      phone_id_set: false,
      access_token_set: false,
      status: "not_configured",
    },
    supabase: {
      enabled: true,
      url: "https://yyoptsxdoekbmibkwikj.supabase.co",
      service_key_set: true,
      status: "operational",
    },
  },
};

export default async function SuperAdminParametresPage() {
  const profile = await requireProfile(["super_admin"]);

  return (
    <DashboardShell profile={profile}>
      <BackButton fallbackHref="/dashboard/super-admin" label="Retour au tableau de bord" />

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-white shadow-lg">
          <Settings className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-nexus-blue-950">
            Paramètres agence
          </h1>
          <p className="mt-1 text-slate-600">
            Identité, contacts, horaires, intégrations système.
          </p>
        </div>
      </div>

      <ParametresAgenceClient initialSettings={MOCK_SETTINGS} />
    </DashboardShell>
  );
}
