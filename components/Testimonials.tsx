import { CheckCircle2, Quote, Star } from "lucide-react";

interface Testimonial {
  name: string;
  role: string;
  text: string;
  rating: number;
  /** Initiales affichees dans le cercle d'avatar (ex: "AM", "JN") */
  initials: string;
  /** Couleurs du dégradé de l'avatar */
  gradient: "orange" | "blue" | "purple";
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Aïcha M.",
    role: "Étudiante · Université de Montréal",
    text: "Dossier d'admission accepté du premier coup. L'équipe Nexus m'a accompagnée pour le TCF, le CAQ et le permis d'études. Aujourd'hui je suis à Montréal.",
    rating: 5,
    initials: "AM",
    gradient: "orange",
  },
  {
    name: "Jean-Paul N.",
    role: "Entrepreneur · Bangui",
    text: "Nexus a monté mon dossier de financement avec un sérieux que je n'avais vu nulle part. Projet validé, partenaire trouvé. Je recommande sans hésiter.",
    rating: 5,
    initials: "JN",
    gradient: "blue",
  },
  {
    name: "Mariam D.",
    role: "Visa travail · Canada",
    text: "Procédure visa claire, dossier impeccable. J'ai reçu mon permis de travail en six semaines. Merci Nexus pour le professionnalisme.",
    rating: 5,
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

const DOT_GRID_DARK: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at center, rgba(255,255,255,0.06) 1px, transparent 1px)",
  backgroundSize: "28px 28px",
};

export function Testimonials() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24 lg:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={DOT_GRID_DARK}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-1/4 h-[28rem] w-[28rem] rounded-full bg-nexus-orange-500/12 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 bottom-1/4 h-[28rem] w-[28rem] rounded-full bg-nexus-blue-500/15 blur-[120px]"
      />

      <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md">
            <Star className="h-3 w-3 fill-nexus-orange-400 text-nexus-orange-400" />
            Ils nous font confiance
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
            Des histoires vraies, des résultats concrets.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Des particuliers et entrepreneurs accompagnés sur leurs projets les
            plus importants.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <article
              key={i}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-7 backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-400/40 hover:bg-white/[0.08] sm:p-8"
            >
              {/* Glow corner au hover */}
              <div
                aria-hidden
                className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/20"
              />
              {/* Quote décoratif */}
              <Quote className="absolute right-5 top-5 h-10 w-10 text-nexus-orange-400/20" />

              <div className="relative">
                {/* Étoiles */}
                <div className="mb-5 flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, idx) => (
                    <Star
                      key={idx}
                      className="h-4 w-4 fill-nexus-orange-400 text-nexus-orange-400"
                    />
                  ))}
                </div>

                {/* Texte du témoignage */}
                <p className="mb-7 text-sm leading-relaxed text-slate-200 sm:text-base">
                  « {t.text} »
                </p>

                {/* Auteur avec avatar à initiales */}
                <div className="flex items-center gap-3 border-t border-white/10 pt-5">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${GRADIENT_CLASSES[t.gradient]} font-display text-sm font-bold text-white shadow-lg ring-2 ${RING_CLASSES[t.gradient]} transition-transform duration-300 ease-out group-hover:scale-105`}
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

        <p className="mt-10 text-center text-xs text-slate-500">
          Témoignages authentiques. Noms anonymisés pour préserver la
          confidentialité de nos clients.
        </p>
      </div>
    </section>
  );
}
