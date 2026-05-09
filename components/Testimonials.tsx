import { CheckCircle2, Quote, Sparkles } from "lucide-react";

interface Testimonial {
  name: string;
  role: string;
  text: string;
  initials: string;
  gradient: "orange" | "blue" | "purple";
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Aïcha M.",
    role: "Étudiante · Université de Montréal",
    text: "Dossier d'admission accepté du premier coup. L'équipe Nexus m'a accompagnée pour le TCF, le CAQ et le permis d'études. Aujourd'hui je suis à Montréal.",
    initials: "AM",
    gradient: "orange",
  },
  {
    name: "Jean-Paul N.",
    role: "Entrepreneur · Bangui",
    text: "Nexus a monté mon dossier de financement avec un sérieux que je n'avais vu nulle part. Projet validé, partenaire trouvé. Je recommande sans hésiter.",
    initials: "JN",
    gradient: "blue",
  },
  {
    name: "Mariam D.",
    role: "Visa travail · Canada",
    text: "Procédure claire, dossier impeccable. J'ai reçu mon permis de travail en six semaines. Merci Nexus pour le professionnalisme.",
    initials: "MD",
    gradient: "purple",
  },
];

const GRADIENT_CLASSES: Record<Testimonial["gradient"], string> = {
  orange: "from-nexus-orange-500 to-nexus-orange-700",
  blue: "from-nexus-blue-600 to-nexus-blue-800",
  purple: "from-purple-500 to-indigo-700",
};

const RING_CLASSES: Record<Testimonial["gradient"], string> = {
  orange: "ring-nexus-orange-500/40",
  blue: "ring-nexus-blue-500/40",
  purple: "ring-purple-500/40",
};

export function Testimonials() {
  return (
    <section className="relative overflow-hidden bg-nexus-blue-950 py-24 sm:py-28 lg:py-32">
      {/* === Dot grid === */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />
      {/* === Orbes ambiantes === */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-1/4 h-[28rem] w-[28rem] rounded-full bg-nexus-orange-500/15 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 bottom-1/4 h-[28rem] w-[28rem] rounded-full bg-indigo-500/15 blur-[120px]"
      />
      {/* === Quote géant en arrière-plan === */}
      <Quote
        aria-hidden
        className="pointer-events-none absolute right-12 top-12 hidden h-64 w-64 text-nexus-orange-500/[0.04] lg:block"
      />
      {/* === Hairline top === */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/40 to-transparent"
      />

      <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
        {/* === Header éditorial === */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-nexus-orange-500/30 bg-nexus-orange-500/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-nexus-orange-300">
            <Sparkles className="h-3 w-3" />
            Trajectoires
          </span>
          <h2 className="mt-5 font-display text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-5xl">
            Trois trajectoires.
            <br />
            <span className="text-nexus-orange-400">Une même méthode.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Particuliers, étudiants, entrepreneurs — chacun avec un projet,
            chacun avec une décision portée par Nexus jusqu&apos;à son
            aboutissement.
          </p>
        </div>

        {/* === 3 cards premium === */}
        <div className="grid gap-5 md:grid-cols-3 lg:gap-6">
          {TESTIMONIALS.map((t) => (
            <article
              key={t.initials}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0F1B40] via-nexus-blue-900 to-[#0F1B40] p-7 shadow-[0_30px_60px_-25px_rgba(0,0,0,0.6)] transition-all duration-500 hover:-translate-y-1 hover:border-nexus-orange-400/40 hover:shadow-[0_40px_80px_-25px_rgba(255,102,0,0.40)] sm:p-8"
            >
              {/* Glow corner hover */}
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-nexus-orange-500/0 blur-3xl transition-all duration-700 group-hover:bg-nexus-orange-500/35"
              />
              {/* Quote décoratif coin */}
              <Quote
                aria-hidden
                className="pointer-events-none absolute right-5 top-5 h-12 w-12 text-nexus-orange-400/20 transition-all duration-500 group-hover:text-nexus-orange-400/40 group-hover:scale-110"
              />

              <div className="relative">
                {/* Citation typographie éditoriale */}
                <p className="mt-2 font-display text-base italic leading-relaxed text-white sm:text-lg">
                  « {t.text} »
                </p>

                {/* Hairline */}
                <div
                  aria-hidden
                  className="my-6 h-px w-16 bg-gradient-to-r from-nexus-orange-400 to-transparent"
                />

                {/* Auteur avec avatar à initiales */}
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${GRADIENT_CLASSES[t.gradient]} font-display text-sm font-bold text-white shadow-lg ring-2 ${RING_CLASSES[t.gradient]} transition-all duration-500 group-hover:scale-110 group-hover:ring-4`}
                  >
                    {t.initials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate font-bold text-white">
                        {t.name}
                      </span>
                      <CheckCircle2
                        className="h-3.5 w-3.5 shrink-0 text-nexus-orange-400"
                        aria-label="Témoignage authentique"
                      />
                    </div>
                    <div className="truncate text-xs text-slate-400">
                      {t.role}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* === Note de bas === */}
        <p className="mt-12 text-center text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400">
          Témoignages authentiques · Noms anonymisés pour protéger la confidentialité de nos clients.
        </p>
      </div>
    </section>
  );
}
