"use client";

import { Phone, Mail, MessageCircle, UserCircle } from "lucide-react";

interface AgentInfo {
  id?: string;
  prenom?: string | null;
  nom?: string | null;
  email?: string | null;
  telephone?: string | null;
  poste?: string | null;
}

// Numero WhatsApp Nexus par defaut (RCA)
const DEFAULT_WHATSAPP = "23673269692";
const DEFAULT_PHONE = "+236 73 26 96 92";
const DEFAULT_EMAIL = "contact@nexusrca.com";

function cleanPhone(phone: string): string {
  return phone.replace(/\s+/g, "").replace(/\+/g, "");
}

export function AgentContactCard({
  agent,
  clientName,
}: {
  agent?: AgentInfo | null;
  clientName?: string;
}) {
  const hasAgent = agent && (agent.prenom || agent.nom);

  const fullName = hasAgent
    ? [agent?.prenom, agent?.nom].filter(Boolean).join(" ")
    : "L'équipe Nexus";

  const initials = hasAgent
    ? (agent?.prenom?.[0] || "") + (agent?.nom?.[0] || "")
    : "NX";

  const phoneRaw = agent?.telephone || DEFAULT_PHONE;
  const phoneForLink = cleanPhone(phoneRaw);
  const phoneForWhatsApp = agent?.telephone ? cleanPhone(agent.telephone) : DEFAULT_WHATSAPP;
  const phoneDisplay = agent?.telephone || DEFAULT_PHONE;
  const email = agent?.email || DEFAULT_EMAIL;

  // Message WhatsApp pre-rempli
  const greetingName = clientName ? clientName.split(" ")[0] : "";
  const whatsappMessage = encodeURIComponent(
    `Bonjour ${fullName}, je suis ${greetingName || "un client Nexus"} et je souhaite vous contacter au sujet de mon dossier.`
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header avec gradient */}
      <div className="relative bg-gradient-to-br from-nexus-blue-950 to-nexus-blue-800 p-6">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-nexus-orange-500/20 blur-2xl" />

        <div className="relative flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 font-display text-xl font-bold text-white shadow-lg">
            {initials.toUpperCase() || <UserCircle className="h-8 w-8" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-nexus-orange-400">
              {hasAgent ? "Votre agent dédié" : "Nous sommes là pour vous"}
            </p>
            <h3 className="mt-1 font-display text-lg font-bold text-white">
              {fullName}
            </h3>
            {agent?.poste && (
              <p className="mt-0.5 text-xs text-slate-300">{agent.poste}</p>
            )}
          </div>
        </div>
      </div>

      {/* Boutons d action */}
      <div className="space-y-2 p-4">
        <a
          href={`https://wa.me/${phoneForWhatsApp}?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 p-3 transition hover:-translate-y-0.5 hover:bg-green-100 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500 text-white shadow">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-green-900">WhatsApp</p>
              <p className="text-xs text-green-700">Réponse rapide</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-green-700">
            {phoneDisplay}
          </span>
        </a>

        <a
          href={`tel:${phoneForLink}`}
          className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 p-3 transition hover:-translate-y-0.5 hover:bg-blue-100 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-white shadow">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-blue-900">Appel direct</p>
              <p className="text-xs text-blue-700">Pour les urgences</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-blue-700">
            {phoneDisplay}
          </span>
        </a>

        <a
          href={`mailto:${email}?subject=Question concernant mon dossier Nexus`}
          className="flex items-center justify-between rounded-xl border border-nexus-orange-200 bg-nexus-orange-50 p-3 transition hover:-translate-y-0.5 hover:bg-nexus-orange-100 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-orange-500 text-white shadow">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-nexus-orange-900">Email</p>
              <p className="text-xs text-nexus-orange-700">Pour le détail</p>
            </div>
          </div>
          <span className="hidden text-xs font-semibold text-nexus-orange-700 sm:inline">
            Écrire
          </span>
        </a>
      </div>

      {!hasAgent && (
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-500">
          💡 Une fois votre première demande traitée, vous aurez un agent
          personnel attribué.
        </div>
      )}
    </div>
  );
}
