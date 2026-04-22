"use client";

import { motion } from "framer-motion";
import { MessageCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { whatsappLink } from "@/lib/utils";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-24 lg:py-32">
      {/* Animated gradient background */}
      <div className="absolute inset-0 gradient-animate" />
      <div className="absolute inset-0 bg-nexus-blue-950/40" />
      <div className="absolute inset-0 grain" />

      <div className="relative mx-auto max-w-5xl px-4 text-center lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-display text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl">
            Prêt à passer à l'étape suivante ?
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-200">
            Un conseiller Nexus étudie votre situation et vous rappelle dans les 24 heures.
            Premier contact gratuit, sans engagement.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Button href="/demande" variant="primary" size="lg">
              <FileText className="h-5 w-5" /> Faire une demande
            </Button>
            <Button
              href={whatsappLink("Bonjour Nexus, je souhaite discuter de mon projet.")}
              external
              variant="white"
              size="lg"
            >
              <MessageCircle className="h-5 w-5" /> Parler sur WhatsApp
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
