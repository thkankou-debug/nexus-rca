import { ShieldAlert } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { AuditLogClient, type AuditEntry } from "@/components/dashboard/AuditLogClient";

export const metadata = {
  title: "Audit log | Super Admin",
};

export const dynamic = "force-dynamic";

// ─── DONNÉES MOCKÉES (table audit_log à créer en migration ultérieure) ──
const MOCK_ENTRIES: AuditEntry[] = [
  {
    id: "evt_001",
    created_at: "2026-05-04T14:32:18Z",
    actor: "Thierry Kankou",
    actor_role: "super_admin",
    event_type: "role_change",
    target: "Marie Ngounio",
    description: "Promu(e) de agent à admin",
    severity: "high",
    ip: "41.207.45.12",
  },
  {
    id: "evt_002",
    created_at: "2026-05-04T11:08:42Z",
    actor: "Système",
    actor_role: "system",
    event_type: "login_admin",
    target: "Patrick Mbongo",
    description: "Connexion réussie depuis Bangui (RCA)",
    severity: "info",
    ip: "41.207.103.88",
  },
  {
    id: "evt_003",
    created_at: "2026-05-03T16:45:11Z",
    actor: "Patrick Mbongo",
    actor_role: "admin",
    event_type: "paiement_void",
    target: "NX-PAY-A1B2C3D4",
    description: "Paiement annulé administrativement (raison : doublon client)",
    severity: "high",
    ip: "41.207.103.88",
  },
  {
    id: "evt_004",
    created_at: "2026-05-03T09:12:33Z",
    actor: "Patrick Mbongo",
    actor_role: "admin",
    event_type: "dossier_assign",
    target: "NX-VISA-A86BE5",
    description: "Dossier assigné à Marie Ngounio",
    severity: "info",
    ip: "41.207.103.88",
  },
  {
    id: "evt_005",
    created_at: "2026-05-02T17:55:21Z",
    actor: "Thierry Kankou",
    actor_role: "super_admin",
    event_type: "user_disable",
    target: "test-user@example.com",
    description: "Compte désactivé (compte test)",
    severity: "high",
    ip: "41.207.45.12",
  },
  {
    id: "evt_006",
    created_at: "2026-05-02T14:20:08Z",
    actor: "Marie Ngounio",
    actor_role: "agent",
    event_type: "paiement_create",
    target: "NX-PAY-77FC62",
    description: "Paiement Visa Schengen créé (250 000 FCFA, espèces)",
    severity: "info",
  },
  {
    id: "evt_007",
    created_at: "2026-05-02T10:35:47Z",
    actor: "Thierry Kankou",
    actor_role: "super_admin",
    event_type: "service_config_update",
    target: "Bourses Canada",
    description: "Tarif accompagnement modifié (2 500 000 → 2 800 000 FCFA)",
    severity: "medium",
    ip: "41.207.45.12",
  },
  {
    id: "evt_008",
    created_at: "2026-05-01T18:02:14Z",
    actor: "Patrick Mbongo",
    actor_role: "admin",
    event_type: "demande_force_close",
    target: "NX-FIN-0BBA12",
    description: "Demande clôturée (raison : non-éligibilité confirmée)",
    severity: "medium",
  },
  {
    id: "evt_009",
    created_at: "2026-05-01T12:48:56Z",
    actor: "Marie Ngounio",
    actor_role: "agent",
    event_type: "rdv_create",
    target: "RDV-2026-04-29-MARC",
    description: "Rendez-vous créé pour le client Marc Ouattara",
    severity: "info",
  },
  {
    id: "evt_010",
    created_at: "2026-05-01T09:15:02Z",
    actor: "Thierry Kankou",
    actor_role: "super_admin",
    event_type: "export_data",
    target: "Clients CSV",
    description: "Export complet des clients (47 lignes)",
    severity: "medium",
    ip: "41.207.45.12",
  },
  {
    id: "evt_011",
    created_at: "2026-04-30T16:33:18Z",
    actor: "Système",
    actor_role: "system",
    event_type: "rapport_mensuel_generated",
    target: "Avril 2026",
    description: "Rapport mensuel généré et envoyé (3 destinataires)",
    severity: "info",
  },
  {
    id: "evt_012",
    created_at: "2026-04-30T14:09:44Z",
    actor: "Patrick Mbongo",
    actor_role: "admin",
    event_type: "user_invite",
    target: "joseph.dabi@nexusrca.com",
    description: "Invitation envoyée pour rôle agent",
    severity: "info",
  },
  {
    id: "evt_013",
    created_at: "2026-04-29T19:22:01Z",
    actor: "Thierry Kankou",
    actor_role: "super_admin",
    event_type: "agence_settings_update",
    target: "Paramètres agence",
    description: "Logo et baseline mis à jour",
    severity: "low",
  },
  {
    id: "evt_014",
    created_at: "2026-04-29T13:45:38Z",
    actor: "Marie Ngounio",
    actor_role: "agent",
    event_type: "client_create",
    target: "Aïssatou Bamba",
    description: "Nouvelle fiche client créée",
    severity: "info",
  },
  {
    id: "evt_015",
    created_at: "2026-04-28T17:11:09Z",
    actor: "Patrick Mbongo",
    actor_role: "admin",
    event_type: "paiement_validate",
    target: "NX-PAY-A86BE5",
    description: "Paiement validé après réception espèces (150 000 FCFA)",
    severity: "info",
  },
  {
    id: "evt_016",
    created_at: "2026-04-28T11:25:51Z",
    actor: "Système",
    actor_role: "system",
    event_type: "login_failed",
    target: "agent.fake@email.com",
    description: "Tentative de connexion échouée (3e essai)",
    severity: "medium",
    ip: "188.166.42.71",
  },
  {
    id: "evt_017",
    created_at: "2026-04-27T20:48:33Z",
    actor: "Thierry Kankou",
    actor_role: "super_admin",
    event_type: "role_change",
    target: "Joseph Dabi",
    description: "Promu(e) de client à agent",
    severity: "high",
    ip: "41.207.45.12",
  },
  {
    id: "evt_018",
    created_at: "2026-04-27T15:32:18Z",
    actor: "Patrick Mbongo",
    actor_role: "admin",
    event_type: "dossier_assign",
    target: "NX-TCF-CA94D3",
    description: "Dossier réassigné de Marie à Joseph",
    severity: "info",
  },
  {
    id: "evt_019",
    created_at: "2026-04-27T09:18:42Z",
    actor: "Système",
    actor_role: "system",
    event_type: "stripe_webhook",
    target: "NX-PAY-D7D403",
    description: "Webhook Stripe : paiement confirmé (carte)",
    severity: "info",
  },
  {
    id: "evt_020",
    created_at: "2026-04-26T22:05:14Z",
    actor: "Thierry Kankou",
    actor_role: "super_admin",
    event_type: "config_export",
    target: "Audit log",
    description: "Export CSV du log d'audit (avril 2026)",
    severity: "low",
    ip: "41.207.45.12",
  },
];

export default async function SuperAdminAuditLogPage() {
  const profile = await requireProfile(["super_admin"]);

  return (
    <DashboardShell profile={profile}>
      <BackButton fallbackHref="/dashboard/super-admin" label="Retour au tableau de bord" />

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-lg">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-nexus-blue-950">
            Audit log
          </h1>
          <p className="mt-1 text-slate-600">
            Traçabilité des actions sensibles sur la plateforme.
          </p>
        </div>
      </div>

      <AuditLogClient initialEntries={MOCK_ENTRIES} />
    </DashboardShell>
  );
}
