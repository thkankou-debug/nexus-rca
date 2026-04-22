"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Aïcha Mbongo",
    role: "Étudiante · Université de Montréal",
    text: "Dossier d'admission accepté du premier coup. L'équipe Nexus m'a accompagnée pour le TCF, le CAQ et le permis d'études. Aujourd'hui je suis à Montréal.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Jean-Paul Ngakoutou",
    role: "Entrepreneur · Bangui",
    text: "Nexus a monté mon dossier de financement avec un sérieux que je n'avais vu nulle part. Projet validé, partenaire trouvé. Je recommande sans hésiter.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Mariam Doumbia",
    role: "Visa travail · Canada",
    text: "Procédure visa claire, dossier impeccable. J'ai reçu mon permis de travail en six semaines. Merci Nexus pour le professionnalisme.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
  },
];

export function Testimonials() {
  return (
    <section className="relative overflow-hidden bg-nexus-blue-950 py-24 lg:py-32 text-white">
      <div className="absolute inset-0 bg-mesh-gradient opacity-30" />
      <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-nexus-orange-500/10 blur-3xl" />

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
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="group relative rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all hover:bg-white/10"
            >
              <Quote className="absolute right-5 top-5 h-8 w-8 text-nexus-orange-400/30" />

              <div className="mb-4 flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, idx) => (
                  <Star
                    key={idx}
                    className="h-4 w-4 fill-nexus-orange-400 text-nexus-orange-400"
                  />
                ))}
              </div>

              <p className="mb-6 text-base leading-relaxed text-slate-200">
                « {t.text} »
              </p>

              <div className="flex items-center gap-3 border-t border-white/10 pt-5">
                <img
                  src={t.image}
                  alt={t.name}
                  className="h-11 w-11 rounded-full object-cover ring-2 ring-nexus-orange-500/30"
                />
                <div>
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-xs text-slate-400">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
