"use client";

import { motion } from "framer-motion";
import { Quote, Star, CheckCircle2 } from "lucide-react";

interface Testimonial {
  name: string;
  role: string;
  text: string;
  rating: number;
  /** Initiales affichees dans le cercle d avatar (ex: "AM", "JN") */
  initials: string;
  /** Couleurs du dégradé de l avatar */
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

export function Testimonials() {
  return (
    <section className="relative overflow-hidden bg-nexus-blue-950 py-24 lg:py-32 text-white">
      <div className="absolute inset-0 bg-mesh-gradient opacity-30" />
      <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-nexus-orange-500/10 blur-3xl" />
      <div className="absolute -right-32 bottom-1/4 h-96 w-96 rounded-full bg-nexus-blue-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <div className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-nexus-orange-300">
            Ils nous font confiance
          </div>
          <h2 className="font-display text-4xl font-bold sm:text-5xl">
            Des histoires vraies,{" "}
            <span className="text-gradient-orange">des résultats concrets.</span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-white/70 sm:text-lg">
            Des particuliers et entrepreneurs accompagnés sur leurs projets les
            plus importants.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-8 backdrop-blur-sm transition-all hover:border-nexus-orange-400/30 hover:bg-white/[0.08]"
            >
              {/* Quote decoratif */}
              <Quote className="absolute right-5 top-5 h-10 w-10 text-nexus-orange-400/20" />

              {/* Etoiles */}
              <div className="mb-5 flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, idx) => (
                  <Star
                    key={idx}
                    className="h-4 w-4 fill-nexus-orange-400 text-nexus-orange-400"
                  />
                ))}
              </div>

              {/* Texte du temoignage */}
              <p className="mb-7 text-base leading-relaxed text-slate-200">
                « {t.text} »
              </p>

              {/* Auteur avec avatar a initiales */}
              <div className="flex items-center gap-3 border-t border-white/10 pt-5">
                {/* Avatar avec initiales — cercle degrade premium */}
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${GRADIENT_CLASSES[t.gradient]} font-display text-base font-bold text-white shadow-lg ring-2 ${RING_CLASSES[t.gradient]}`}
                >
                  {t.initials}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate font-semibold text-white">
                      {t.name}
                    </span>
                    {/* Badge verifie discret */}
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
            </motion.div>
          ))}
        </div>

        {/* Note discrete sur l authenticite */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-10 text-center text-xs text-slate-500"
        >
          Témoignages authentiques. Noms anonymisés pour préserver la
          confidentialité de nos clients.
        </motion.p>
      </div>
    </section>
  );
}
