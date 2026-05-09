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
    <section className="relative overflow-hidden bg-[#F5F1EA] py-24 sm:py-28 lg:py-32">
      {/* === Vignette ombre subtle === */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at center, transparent 50%, rgba(12,28,64,0.08) 100%)",
        }}
      />
      {/* === Hairline top === */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nexus-blue-950/20 to-transparent"
      />

      <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
        {/* === Header style rapport === */}
        <div className="mb-16 max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="h-px w-12 bg-nexus-orange-600" />
            <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-nexus-orange-700">
              Cadre déontologique
            </span>
          </div>
          <h2 className="mt-6 font-display text-3xl font-bold leading-[1.1] tracking-tight text-nexus-blue-950 sm:text-4xl lg:text-5xl">
            Quatre engagements,<br />
            <span className="italic font-medium text-nexus-blue-900/85">
              et rien que nous ne puissions tenir.
            </span>
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-nexus-blue-950/80 sm:text-lg">
            Aucune ambassade, aucune institution financière, aucun établissement
            académique ne délègue sa décision à un intermédiaire. Nexus refuse
            donc toute promesse de résultat. En revanche, nous tenons quatre
            engagements vérifiables qui structurent chaque mandat.
          </p>
        </div>

        {/* === 4 piliers — cards entièrement navy sur fond ivoire (contraste max) === */}
        <div className="grid gap-5 sm:grid-cols-2 lg:gap-6">
          {PILIERS.map((p) => {
            const Icon = p.icon;
            return (
              <article
                key={p.num}
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 p-7 shadow-[0_30px_70px_-25px_rgba(12,28,64,0.45)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_40px_80px_-25px_rgba(12,28,64,0.6)] sm:p-8"
              >
                {/* Texture intérieure dot grid */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-30"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at center, rgba(255,255,255,0.06) 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                  }}
                />
                {/* Glow corner hover */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-nexus-orange-500/0 blur-3xl transition-all duration-700 group-hover:bg-nexus-orange-500/30"
                />

                <div className="relative">
                  {/* Numéro romain XL + icône */}
                  <div className="flex items-start justify-between">
                    <span className="font-display text-5xl font-black leading-none text-nexus-orange-400">
                      {p.num}
                    </span>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur-md transition-transform duration-500 group-hover:scale-105">
                      <Icon className="h-5 w-5 text-nexus-orange-300" />
                    </div>
                  </div>

                  {/* Hairline */}
                  <div
                    aria-hidden
                    className="my-5 h-px w-full bg-gradient-to-r from-nexus-orange-400/50 via-white/10 to-transparent"
                  />

                  {/* Titre blanc pur */}
                  <h3 className="font-display text-lg font-bold leading-snug text-white sm:text-xl">
                    {p.title}
                  </h3>

                  {/* Description slate-200 */}
                  <p className="mt-3 text-sm leading-relaxed text-slate-200">
                    {p.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        {/* === Bandeau engagements (ivoire chaud avec accent navy) === */}
        <div className="relative mt-14 overflow-hidden rounded-3xl border-2 border-nexus-blue-950/15 bg-white p-8 shadow-[0_30px_60px_-25px_rgba(12,28,64,0.25)] sm:p-10">
          <div className="grid gap-10 lg:grid-cols-[2fr,3fr] lg:items-center lg:gap-12">
            <div>
              <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-nexus-orange-700">
                <ShieldCheck className="h-3 w-3" />
                Engagements vérifiables
              </span>
              <p className="mt-4 font-display text-2xl font-bold leading-[1.15] text-nexus-blue-950 sm:text-3xl">
                Quatre repères qui structurent chaque mandat — et que vous pouvez exiger à toute étape.
              </p>
              <p className="mt-4 inline-flex items-center gap-2 text-sm text-nexus-blue-950/70">
                <MapPin className="h-3.5 w-3.5 text-nexus-orange-600" />
                Bureau permanent · Bangui, Relais Sica
              </p>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2">
              {COMMITMENTS.map((c, i) => (
                <li
                  key={i}
                  className="rounded-xl border border-nexus-blue-950/15 bg-[#F9F6F1] px-4 py-3"
                >
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-nexus-orange-700">
                    {c.sub}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-nexus-blue-950">
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
