"use client";

import { motion } from "framer-motion";
import { MessageSquare, FileCheck, Rocket, CheckCircle2 } from "lucide-react";

const STEPS = [
  {
    icon: MessageSquare,
    title: "Contactez-nous",
    desc: "Via WhatsApp, le formulaire ou directement en agence à Bangui. Premier contact gratuit.",
  },
  {
    icon: FileCheck,
    title: "Analyse du dossier",
    desc: "Un conseiller étudie votre situation, identifie les démarches et prépare un plan clair.",
  },
  {
    icon: Rocket,
    title: "Exécution",
    desc: "Nous montons, déposons et suivons tous les dossiers — vous avez un interlocuteur unique.",
  },
  {
    icon: CheckCircle2,
    title: "Objectif atteint",
    desc: "Visa obtenu, financement débloqué, admission confirmée. Nous restons à vos côtés.",
  },
];

export function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <div className="mb-4 inline-block rounded-full bg-nexus-blue-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-nexus-blue-800">
            Comment ça marche
          </div>
          <h2 className="font-display text-4xl font-bold text-nexus-blue-950 sm:text-5xl">
            Un processus <span className="text-gradient-nexus">clair</span>, des résultats concrets.
          </h2>
        </motion.div>

        <div className="relative grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* connector line */}
          <div className="absolute left-0 right-0 top-10 hidden h-px bg-gradient-to-r from-transparent via-nexus-orange-300 to-transparent lg:block" />

          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative"
              >
                <div className="relative z-10 mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-800 to-nexus-orange-500 shadow-xl">
                  <Icon className="h-9 w-9 text-white" />
                  <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-bold text-nexus-blue-900 shadow">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mb-2 text-center font-display text-lg font-bold text-nexus-blue-950">
                  {step.title}
                </h3>
                <p className="text-center text-sm leading-relaxed text-slate-600">
                  {step.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
