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
      "Avant tout engagement financier, nous remettons un bilan de faisabilité honnête. Si la voie n'est pas crédible, nous le disons — clairement, par écrit.",
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
      "Liaisons consulaires officielles (TLS, VFS, Yaoundé), opérateurs aériens et hôteliers reconnus, plateformes e-Visa : un canal unifié pour vos démarches transfrontalières.",
  },
];

const COMMITMENTS: { label: string; sub: string }[] = [
  { label: "Étude initiale gratuite", sub: "Aucun engagement préalable" },
  { label: "Devis fixé avant ouverture", sub: "Aucune surprise tarifaire" },
  { label: "Filières officielles uniquement", sub: "Traçabilité complète" },
  { label: "Adresse physique permanente", sub: "Bangui — Relais Sica" },
];

const PAPER_GRAIN: React.CSSProperties = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 320 320' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.05 0 0 0 0 0.06 0 0 0 0 0.08 0 0 0 0.6 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23p)'/%3E%3C/svg%3E\")",
};

export function WhyTrust() {
  return (
    <section className="relative overflow-hidden bg-[#F9F6F1] py-24 sm:py-28 lg:py-32">
      {/* === Grain papier premium === */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.10] mix-blend-multiply"
        style={PAPER_GRAIN}
      />
      {/* === Vignette ombre === */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at center, transparent 50%, rgba(12,28,64,0.06) 100%)",
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
            <span className="italic font-medium text-nexus-blue-900/80">
              et rien que nous ne puissions tenir.
            </span>
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-nexus-blue-950/70 sm:text-lg">
            Aucune ambassade, aucune institution financière, aucun établissement
            académique ne délègue sa décision à un intermédiaire. Nexus refuse
            donc toute promesse de résultat. En revanche, nous tenons quatre
            engagements vérifiables qui structurent chaque mandat.
          </p>
        </div>

        {/* === 4 piliers split-design === */}
        <div className="grid gap-5 sm:grid-cols-2 lg:gap-6">
          {PILIERS.map((p) => {
            const Icon = p.icon;
            return (
              <article
                key={p.num}
                className="group relative grid grid-cols-[auto,1fr] overflow-hidden rounded-3xl border border-nexus-blue-950/10 bg-white shadow-[0_2px_0_0_rgba(12,28,64,0.04),0_24px_48px_-32px_rgba(12,28,64,0.18)] transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_2px_0_0_rgba(255,102,0,0.10),0_30px_60px_-30px_rgba(12,28,64,0.28)]"
              >
                {/* Côté gauche navy */}
                <div className="relative flex w-20 flex-col items-center justify-between overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 px-3 py-7 sm:w-24">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-30"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at center, rgba(255,255,255,0.08) 1px, transparent 1px)",
                      backgroundSize: "16px 16px",
                    }}
                  />
                  <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15 backdrop-blur-md transition-transform duration-500 group-hover:scale-105">
                    <Icon className="h-5 w-5 text-nexus-orange-300" />
                  </div>
                  <span className="relative font-display text-2xl font-bold tabular-nums text-white/40 transition-colors duration-500 group-hover:text-nexus-orange-300">
                    {p.num}
                  </span>
                </div>

                {/* Côté droit ivoire */}
                <div className="relative px-6 py-7 sm:px-8 sm:py-8">
                  <h3 className="font-display text-lg font-bold leading-snug text-nexus-blue-950 sm:text-xl">
                    {p.title}
                  </h3>
                  <div
                    aria-hidden
                    className="my-4 h-px w-10 bg-gradient-to-r from-nexus-orange-500 to-transparent"
                  />
                  <p className="text-sm leading-relaxed text-nexus-blue-950/75">
                    {p.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        {/* === Bandeau engagements (rapport institutionnel) === */}
        <div className="relative mt-14 overflow-hidden rounded-3xl bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 shadow-[0_30px_80px_-30px_rgba(12,28,64,0.55)]">
          {/* Texture intérieure */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.5]"
            style={{
              backgroundImage:
                "radial-gradient(circle at center, rgba(255,255,255,0.06) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-nexus-orange-500/20 blur-[100px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-nexus-blue-500/15 blur-[100px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-400/40 to-transparent"
          />

          <div className="relative grid gap-10 p-8 sm:p-10 lg:grid-cols-[2fr,3fr] lg:items-center lg:gap-12">
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

            <ul className="grid gap-px overflow-hidden rounded-2xl bg-white/[0.06] sm:grid-cols-2">
              {COMMITMENTS.map((c, i) => (
                <li
                  key={i}
                  className="group/item relative bg-nexus-blue-950/80 px-5 py-4 transition-colors hover:bg-nexus-blue-950/60"
                >
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">
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
