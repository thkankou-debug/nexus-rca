import {
  ClipboardCheck,
  FileSignature,
  MapPin,
  Network,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

interface Pilier {
  num: string;
  icon: typeof ShieldCheck;
  title: string;
  description: string;
}

const PILIERS: Pilier[] = [
  {
    num: "I",
    icon: ClipboardCheck,
    title: "Méthodologie documentée",
    description:
      "Chaque étape est consignée, communiquée et traçable. Aucune décision n'est prise hors de votre vue. Aucune action ne reste sans piste écrite.",
  },
  {
    num: "II",
    icon: FileSignature,
    title: "Bilan préalable inconditionnel",
    description:
      "Avant tout engagement financier, nous remettons un bilan de faisabilité honnête. Si la voie n'est pas crédible, nous le disons par écrit.",
  },
  {
    num: "III",
    icon: UserCheck,
    title: "Interlocuteur unique",
    description:
      "Le conseiller qui ouvre votre dossier le suit jusqu'à la décision finale. Aucun transfert, aucun cloisonnement interne, aucune perte d'information.",
  },
  {
    num: "IV",
    icon: Network,
    title: "Coordination internationale",
    description:
      "Liaisons consulaires officielles, opérateurs aériens et hôteliers reconnus, partenaires financiers, établissements académiques, circuits de transferts agréés. Un canal unifié pour vos démarches transfrontalières.",
  },
];

const COMMITMENTS: { label: string; sub: string }[] = [
  { label: "Étude initiale gratuite", sub: "Aucun engagement préalable" },
  { label: "Devis fixé avant ouverture", sub: "Aucune surprise tarifaire" },
  { label: "Filières officielles uniquement", sub: "Traçabilité complète" },
  { label: "Adresse physique permanente", sub: "Bangui — Relais Sica" },
];

export function WhyTrust() {
  return (
    <section className="relative overflow-hidden bg-nexus-blue-950 py-20 sm:py-24 lg:py-28">
      {/* === Orbes ambiantes === */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-0 h-[30rem] w-[30rem] rounded-full bg-nexus-orange-500/15 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 bottom-0 h-[28rem] w-[28rem] rounded-full bg-nexus-blue-500/15 blur-[120px]"
      />
      {/* === Hairline top === */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/40 to-transparent"
      />

      <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
        {/* === Header éditorial === */}
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-nexus-orange-500/30 bg-nexus-orange-500/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-nexus-orange-300">
            <ShieldCheck className="h-3 w-3" />
            Cadre déontologique
          </span>
          <h2 className="mt-5 font-display text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-5xl">
            Quatre engagements,
            <br />
            <span className="text-nexus-orange-400">
              et rien que nous ne puissions tenir.
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Aucune ambassade, aucune institution financière, aucun établissement
            académique ne délègue sa décision à un intermédiaire. Nexus refuse
            donc toute promesse de résultat. En revanche, nous tenons quatre
            engagements vérifiables qui structurent chaque mandat.
          </p>
        </div>

        {/* === 4 piliers cards solides === */}
        <div className="grid gap-5 sm:grid-cols-2 lg:gap-6">
          {PILIERS.map((p) => {
            const Icon = p.icon;
            return (
              <article
                key={p.num}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0F1B40] p-6 shadow-[0_20px_50px_-25px_rgba(0,0,0,0.6)] transition-all duration-500 hover:-translate-y-1 hover:border-nexus-orange-500/50 hover:shadow-[0_30px_60px_-25px_rgba(255,102,0,0.4)] sm:p-7"
              >
                {/* Glow corner hover */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-nexus-orange-500/0 blur-3xl transition-all duration-700 group-hover:bg-nexus-orange-500/30"
                />

                <div className="relative">
                  {/* Numéro romain XL + icône */}
                  <div className="flex items-center justify-between">
                    <span className="font-display text-5xl font-black leading-none text-nexus-orange-500">
                      {p.num}
                    </span>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-nexus-orange-500/10 ring-1 ring-nexus-orange-500/30 backdrop-blur-md transition-transform duration-500 group-hover:scale-105">
                      <Icon className="h-5 w-5 text-nexus-orange-300" />
                    </div>
                  </div>

                  {/* Hairline */}
                  <div
                    aria-hidden
                    className="my-5 h-px w-full bg-gradient-to-r from-nexus-orange-500/40 via-white/10 to-transparent"
                  />

                  {/* Titre */}
                  <h3 className="font-display text-lg font-bold leading-snug text-white sm:text-xl">
                    {p.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">
                    {p.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        {/* === Bandeau engagements === */}
        <div className="relative mt-12 overflow-hidden rounded-2xl border border-nexus-orange-500/30 bg-gradient-to-br from-[#0F1B40] via-[#0F1B40] to-nexus-blue-950 p-6 shadow-[0_30px_70px_-30px_rgba(255,102,0,0.4)] sm:p-8 lg:p-10">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-nexus-orange-500/20 blur-[80px]"
          />

          <div className="relative grid gap-8 lg:grid-cols-[2fr,3fr] lg:items-center lg:gap-10">
            <div>
              <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-nexus-orange-300">
                <ShieldCheck className="h-3 w-3" />
                Engagements vérifiables
              </span>
              <p className="mt-4 font-display text-2xl font-bold leading-[1.15] text-white sm:text-3xl">
                Quatre repères qui structurent chaque mandat — et que vous pouvez exiger à toute étape.
              </p>
              <p className="mt-4 inline-flex items-center gap-2 text-sm text-slate-300">
                <MapPin className="h-3.5 w-3.5 text-nexus-orange-300" />
                Bureau permanent · Bangui, Relais Sica
              </p>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2">
              {COMMITMENTS.map((c, i) => (
                <li
                  key={i}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-md"
                >
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-nexus-orange-300/80">
                    {c.sub}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
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
