// ============================================================================
// NAVIGATION ADMIN — A3
//
// Structure des 6 groupes / 18 modules de la feuille de route V3 (§A3).
// getEffectiveNav() calcule le menu réel côté serveur à partir des
// permissions effectives (has_permission — P2), pas d'un rôle codé en dur.
// Un module de vague 2 n'apparaît JAMAIS tant que sa phase backend n'est
// pas livrée (pas grisé, pas "bientôt disponible" — absent).
//
// N'est PAS branché sur une vraie page (A3 = démonstration isolée, voir
// docs/DETTE.md). DashboardShell.tsx (gelé) reste la navigation réelle.
// ============================================================================

import { createClient } from "@/lib/supabase/server";

export type AdminModuleWave = 1 | 2;

export interface AdminNavModule {
  key: string;
  label: string;
  permission: string;
  table: string;
  wave: AdminModuleWave;
  href: string;
}

export interface AdminNavGroup {
  key: string;
  label: string;
  modules: AdminNavModule[];
}

// Tableau complet — y compris les modules de vague 2, filtrés à l'affichage.
// Permissions mappées sur le catalogue reel de role_permissions (P2), pas
// toujours le libelle exact (informel) du tableau A3 de la feuille de
// route : "dossier.read.*" -> "dossier.read.own" (la portee la plus etroite
// suffit, has_permission() considere qu'une portee plus large la couvre) ;
// "client.read"/"rdv.read" -> variantes ".own" scopees, seules seedees en
// P2 ; "rh.read" -> "rh.user.read", seule permission RH reellement seedee.
export const ADMIN_NAV_STRUCTURE: AdminNavGroup[] = [
  {
    key: "pilotage",
    label: "Pilotage",
    modules: [
      // Permission "—" dans la feuille de route : tout staff.
      { key: "vue-ensemble", label: "Vue d'ensemble", permission: "__staff__", table: "agrégats", wave: 1, href: "#pilotage-vue-ensemble" },
      { key: "rapports", label: "Rapports", permission: "finance.report.read", table: "agrégats", wave: 2, href: "#pilotage-rapports" },
    ],
  },
  {
    key: "activite",
    label: "Activité",
    modules: [
      { key: "dossiers", label: "Dossiers", permission: "dossier.read.own", table: "demandes", wave: 1, href: "/dashboard/dossiers" },
      { key: "clients", label: "Clients", permission: "client.read.own", table: "clients, profiles", wave: 1, href: "/dashboard/clients" },
      { key: "rdv", label: "Rendez-vous", permission: "rdv.read.own", table: "appointments", wave: 1, href: "/dashboard/rdv" },
      { key: "taches", label: "Tâches", permission: "tache.read", table: "taches", wave: 2, href: "#activite-taches" },
    ],
  },
  {
    key: "finances",
    label: "Finances",
    modules: [
      { key: "finances-vue-ensemble", label: "Vue d'ensemble", permission: "finance.report.read", table: "agrégats", wave: 2, href: "#finances-vue-ensemble" },
      { key: "caisse", label: "Caisse et transactions", permission: "caisse.read", table: "payments, expenses", wave: 2, href: "#finances-caisse" },
      { key: "devis-factures", label: "Devis et factures", permission: "devis.validate", table: "devis, factures", wave: 2, href: "#finances-devis-factures" },
    ],
  },
  {
    key: "organisation",
    label: "Organisation",
    modules: [
      { key: "rh", label: "Ressources humaines", permission: "rh.user.read", table: "module RH", wave: 1, href: "#organisation-rh" },
      { key: "employes-acces", label: "Employés et accès", permission: "rh.user.read", table: "profiles", wave: 1, href: "#organisation-employes" },
      { key: "partenaires", label: "Partenaires", permission: "cms.partenaire.write", table: "partenaires", wave: 2, href: "#organisation-partenaires" },
    ],
  },
  {
    key: "contenus",
    label: "Contenus",
    modules: [
      { key: "services-tarifs", label: "Services et tarifs", permission: "cms.service.write", table: "services", wave: 2, href: "#contenus-services" },
      { key: "communications", label: "Communications", permission: "message.read", table: "demande_messages", wave: 1, href: "#contenus-communications" },
      { key: "documents", label: "Documents", permission: "document.read", table: "Storage", wave: 2, href: "#contenus-documents" },
    ],
  },
  {
    key: "systeme",
    label: "Système",
    modules: [
      // Permission "—" dans la feuille de route : accessible a tout le
      // staff, sans permission specifique (sentinelle __staff__, voir
      // getEffectiveNav).
      { key: "notifications", label: "Notifications", permission: "__staff__", table: "notifications", wave: 1, href: "#systeme-notifications" },
      { key: "audit", label: "Journal d'audit", permission: "audit.read", table: "audit_log", wave: 2, href: "#systeme-audit" },
      { key: "parametres", label: "Paramètres", permission: "settings.write", table: "agency_settings", wave: 2, href: "#systeme-parametres" },
    ],
  },
];

/**
 * Calcule le menu réel pour l'utilisateur connecté : ne garde que les
 * modules de vague 1 dont la permission est accordée. Un groupe sans
 * module visible est retiré entièrement.
 */
export async function getEffectiveNav(): Promise<AdminNavGroup[]> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const allModules = ADMIN_NAV_STRUCTURE.flatMap((g) => g.modules);
  const checks = await Promise.all(
    allModules.map((m) =>
      m.permission === "__staff__"
        ? supabase.rpc("is_staff", { user_id: user?.id ?? "" })
        : supabase.rpc("has_permission", { perm: m.permission })
    )
  );
  const allowed = new Set(
    allModules
      .filter((_, i) => checks[i].data === true)
      .map((m) => m.key)
  );

  return ADMIN_NAV_STRUCTURE.map((group) => ({
    ...group,
    modules: group.modules.filter((m) => m.wave === 1 && allowed.has(m.key)),
  })).filter((group) => group.modules.length > 0);
}
