import { Send } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import {
  MessagerieClient,
  type Thread,
  type Message,
} from "@/components/dashboard/MessagerieClient";

export const metadata = {
  title: "Messagerie | Super Admin",
};

export const dynamic = "force-dynamic";

// ─── Données mockées (table messages à créer en migration ultérieure) ──

const MOCK_MESSAGES_BY_THREAD: Record<string, Message[]> = {
  thread_1: [
    {
      id: "m1",
      thread_id: "thread_1",
      author: "Marc Ouattara",
      author_role: "client",
      body: "Bonjour, j'ai bien reçu mon e-Visa. Merci pour votre suivi rapide. Quelle est la prochaine étape ?",
      created_at: "2026-05-04T13:02:00Z",
    },
    {
      id: "m2",
      thread_id: "thread_1",
      author: "Marie Ngounio",
      author_role: "agent",
      body: "Bonjour Marc ! Félicitations 🎉 Pour la suite : je vous envoie d'ici demain le récapitulatif des documents à présenter à l'embarquement et les contacts utiles à Bangui pour la biométrie.",
      created_at: "2026-05-04T13:18:00Z",
    },
    {
      id: "m3",
      thread_id: "thread_1",
      author: "Marc Ouattara",
      author_role: "client",
      body: "Parfait, merci. Je dois aussi régler la 2ème tranche de paiement, comment je procède ?",
      created_at: "2026-05-04T14:31:00Z",
    },
  ],
  thread_2: [
    {
      id: "m4",
      thread_id: "thread_2",
      author: "Aïssatou Bamba",
      author_role: "client",
      body: "Bonjour, je voudrais savoir où en est mon dossier d'études Canada. La rentrée approche.",
      created_at: "2026-05-03T09:45:00Z",
    },
    {
      id: "m5",
      thread_id: "thread_2",
      author: "Patrick Mbongo",
      author_role: "admin",
      body: "Bonjour Aïssatou. Votre lettre d'admission est arrivée, nous montons le dossier de visa cette semaine. Je reviens vers vous vendredi avec le détail.",
      created_at: "2026-05-03T10:12:00Z",
    },
  ],
  thread_3: [
    {
      id: "m6",
      thread_id: "thread_3",
      author: "Joseph Dabi",
      author_role: "agent",
      body: "Salut équipe, j'ai un client qui demande un transfert urgent de 5M XAF vers le Maroc. Best practice ?",
      created_at: "2026-05-04T11:22:00Z",
    },
    {
      id: "m7",
      thread_id: "thread_3",
      author: "Patrick Mbongo",
      author_role: "admin",
      body: "Pour ce montant, on passe par Western Union avec un fractionnement en 2 envois. Demande au client une pièce d'ID + justificatif d'origine des fonds.",
      created_at: "2026-05-04T11:35:00Z",
    },
    {
      id: "m8",
      thread_id: "thread_3",
      author: "Joseph Dabi",
      author_role: "agent",
      body: "OK reçu, je le contacte 👍",
      created_at: "2026-05-04T11:36:00Z",
    },
  ],
  thread_4: [
    {
      id: "m9",
      thread_id: "thread_4",
      author: "Bernard Akouhou",
      author_role: "client",
      body: "Bonjour, mon paiement Stripe n'apparaît pas comme reçu. Pourtant ma carte a été débitée hier.",
      created_at: "2026-05-04T08:14:00Z",
    },
    {
      id: "m10",
      thread_id: "thread_4",
      author: "Marie Ngounio",
      author_role: "agent",
      body: "Bonjour Bernard, je vérifie immédiatement avec la comptabilité, je reviens vers vous dans la matinée.",
      created_at: "2026-05-04T08:22:00Z",
    },
  ],
  thread_5: [
    {
      id: "m11",
      thread_id: "thread_5",
      author: "Sandrine Kotto",
      author_role: "client",
      body: "Pouvez-vous m'envoyer les pièces justificatives du dossier visa ? J'en ai besoin pour mon dossier de bourse.",
      created_at: "2026-05-02T16:30:00Z",
    },
  ],
};

const MOCK_THREADS: Thread[] = [
  {
    id: "thread_1",
    title: "Marc Ouattara",
    subtitle: "Visa Schengen — France",
    participants: ["Marc Ouattara", "Marie Ngounio"],
    last_message: MOCK_MESSAGES_BY_THREAD["thread_1"][2].body,
    last_message_at: "2026-05-04T14:31:00Z",
    unread_count: 1,
    is_team_thread: false,
  },
  {
    id: "thread_2",
    title: "Aïssatou Bamba",
    subtitle: "Études Canada — Master Informatique",
    participants: ["Aïssatou Bamba", "Patrick Mbongo"],
    last_message: MOCK_MESSAGES_BY_THREAD["thread_2"][1].body,
    last_message_at: "2026-05-03T10:12:00Z",
    unread_count: 0,
    is_team_thread: false,
  },
  {
    id: "thread_3",
    title: "Équipe Nexus — Transferts",
    subtitle: "Discussion équipe",
    participants: ["Joseph Dabi", "Patrick Mbongo", "Marie Ngounio"],
    last_message: MOCK_MESSAGES_BY_THREAD["thread_3"][2].body,
    last_message_at: "2026-05-04T11:36:00Z",
    unread_count: 2,
    is_team_thread: true,
  },
  {
    id: "thread_4",
    title: "Bernard Akouhou",
    subtitle: "Paiement TCF Canada",
    participants: ["Bernard Akouhou", "Marie Ngounio"],
    last_message: MOCK_MESSAGES_BY_THREAD["thread_4"][1].body,
    last_message_at: "2026-05-04T08:22:00Z",
    unread_count: 0,
    is_team_thread: false,
  },
  {
    id: "thread_5",
    title: "Sandrine Kotto",
    subtitle: "Bourses — Demande de pièces",
    participants: ["Sandrine Kotto"],
    last_message: MOCK_MESSAGES_BY_THREAD["thread_5"][0].body,
    last_message_at: "2026-05-02T16:30:00Z",
    unread_count: 1,
    is_team_thread: false,
  },
];

export default async function SuperAdminMessageriePage() {
  const profile = await requireProfile(["super_admin"]);

  return (
    <DashboardShell profile={profile}>
      <BackButton fallbackHref="/dashboard/super-admin" label="Retour au tableau de bord" />

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-lg">
          <Send className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-nexus-blue-950">
            Messagerie
          </h1>
          <p className="mt-1 text-slate-600">
            Conversations équipe et clients — supervision complète.
          </p>
        </div>
      </div>

      <MessagerieClient
        initialThreads={MOCK_THREADS}
        initialMessagesByThread={MOCK_MESSAGES_BY_THREAD}
        currentUser={`${profile.prenom ?? ""} ${profile.nom ?? ""}`.trim() || "Vous"}
      />
    </DashboardShell>
  );
}
