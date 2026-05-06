import {
  ClipboardCheck,
  FileSignature,
  MapPin,
  Network,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

// ─── WhyTrust ──────────────────────────────────────────────────────────────
// Section homepage : preuves qualitatives de fiabilité.
// Aucun chiffre inventé — uniquement engagements méthodologiques vérifiables.
// ──────────────────────────────────────────────────────────────────────────

interface Pilier {
  icon: typeof ShieldCheck;
  title: string;
  description: string;
}

const PILIERS: Pilier[] = [
  {
    icon: ClipboardCheck,
    title: "Méthodologie écrite, étape par étape",
    description:
      "Soumission, analyse de faisabilité, accompagnement structuré, suivi jusqu'au résultat. Chaque étape est documentée et communiquée.",
  },
  {
    icon: FileSignature,
    title: "Bilan de faisabilité avant tout engagement",
    description:
      "Étude initiale gratuite, bilan écrit honnête. Si nous estimons que votre dossier n'a pas de chance réelle, nous vous le disons franchement.",
  },
  {
    icon: UserCheck,
    title: "Un interlocuteur unique du début à la fin",
    description:
      "Le même conseiller suit votre dossier de la première prise de contact à la décision finale. Pas de transfert d'un service à l'autre.",
  },
  {
    icon: Network,
    title: "Coordination internationale depuis Bangui",
    description:
      "Liaisons consulaires (TLS, VFS, Yaoundé), partenaires hôteliers et compagnies aériennes officielles, plateformes e-Visa : un canal unique pour vos démarches transfrontalières.",
  },
];

const COMMITMENTS: { label: string; sub: string }[] = [
  { label: "Étude initiale gratuite", sub: "Sans engagement" },
  { label: "Devis fixe communiqué à l'avance", sub: "Aucune surprise" },
  { label: "Compagnies & circuits officiels", sub: "Traçabilité complète" },
  { label: "Bureau physique à Bangui", sub: "Accueil sur rendez-vous" },
];

export function WhyTrust() {
  return (
    <section className="relative bg-surface py-24 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-nexus-orange-600">
            Crédibilité
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-nexus-blue-950 sm:text-4xl">
            Pourquoi nous faire confiance
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600">
            Nous ne promettons jamais une obtention de visa ou un résultat
            garanti. En revanche, nous tenons quatre engagements structurels
            que vous pouvez vérifier à chaque étape.
          </p>
        </div>

        {/* 4 piliers */}
        <div className="grid gap-5 sm:grid-cols-2">
          {PILIERS.map((p, i) => {
            const Icon = p.icon;
            return (
              <article
                key={i}
                className="group relative rounded-3xl border border-slate-200 bg-white p-7 transition-colors hover:border-nexus-orange-200/70"
              >
                {/* Numéro discret en filigrane */}
                <span
                  aria-hidden
                  className="absolute right-7 top-6 font-display text-2xl font-bold text-slate-100"
                >
                  0{i + 1}
                </span>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-900 to-nexus-blue-950 text-white shadow-sm">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-lg font-bold leading-snug text-nexus-blue-950">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {p.description}
                </p>
              </article>
            );
          })}
        </div>

        {/* Bandeau engagements */}
        <div className="mt-12 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 p-8 text-white shadow-lg sm:p-10">
          <div className="grid gap-8 sm:grid-cols-2 sm:items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-nexus-orange-300">
                <ShieldCheck className="h-3 w-3" />
                Nos engagements
              </span>
              <p className="mt-3 font-display text-xl font-bold leading-snug text-white sm:text-2xl">
                Quatre repères qui structurent chaque dossier.
              </p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-slate-300">
                <MapPin className="h-3.5 w-3.5 text-nexus-orange-300" />
                Bureau Nexus RCA — Bangui, Relais Sica
              </p>
            </div>

            <ul className="grid gap-px overflow-hidden rounded-2xl bg-white/10">
              {COMMITMENTS.map((c, i) => (
                <li key={i} className="bg-nexus-blue-950/70 px-4 py-3.5">
                  <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
                    {c.sub}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-white">
                    {c.label}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
