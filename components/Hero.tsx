"use client";

import { motion } from "framer-motion";
import { ArrowRight, Bot, Globe, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-nexus-blue-950 text-white">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=2000&q=80"
          alt=""
          className="h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900/85 to-nexus-orange-900/40" />
      </div>

      {/* Animated gradient orbs */}
      <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-nexus-orange-500/30 blur-3xl animate-float" />
      <div
        className="absolute -right-32 bottom-1/4 h-96 w-96 rounded-full bg-nexus-blue-500/30 blur-3xl animate-float"
        style={{ animationDelay: "2s" }}
      />

      {/* Grain overlay */}
      <div className="absolute inset-0 grain opacity-30" />

      {/* Floating badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="absolute right-6 top-32 hidden rounded-2xl bg-white/10 p-4 backdrop-blur-xl lg:block"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-orange-500">
            <Globe className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-nexus-orange-300">
              Global
            </div>
            <div className="font-semibold">Solutions globales. Impact réel.</div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        className="absolute bottom-32 right-20 hidden rounded-2xl bg-white/10 p-4 backdrop-blur-xl lg:block"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-blue-700">
            <Globe className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-nexus-blue-300">
              Basés à
            </div>
            <div className="font-semibold">Bangui, RCA</div>
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="relative mx-auto w-full max-w-7xl px-4 py-32 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur-md"
          >
            <Sparkles className="h-4 w-4 text-nexus-orange-400" />
            <span className="font-medium">
              Agence Internationale · Bangui, République Centrafricaine
            </span>
          </motion.div>

          {/* Headline */}
          <h1 className="font-display text-5xl font-bold leading-[1.2] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="block pb-3"
            >
              De Bangui
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="block pb-2"
            >
              <span className="text-gradient-orange">au monde</span> :
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="block text-3xl font-medium leading-[1.3] text-slate-200 sm:text-4xl md:text-5xl mt-3"
            >
              nous transformons vos projets en réalité.
            </motion.span>
          </h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="mt-8 max-w-2xl text-lg text-slate-300 sm:text-xl"
          >
            Visa, études, business, voyages — NEXUS vous accompagne de A à Z.
            Une expertise locale, des solutions internationales.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4"
          >
            <Button href="/rendez-vous" size="lg">
              Prendre rendez-vous <ArrowRight className="h-5 w-5" />
            </Button>
            <Button href="/services/nexus-ia" variant="outline" size="lg">
              <Bot className="h-5 w-5" /> Parler avec Nexus IA 🤖
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.8 }}
            className="mt-16 grid max-w-2xl grid-cols-3 gap-6 border-t border-white/10 pt-8"
          >
            <div>
              <div className="font-display text-3xl font-bold text-nexus-orange-400">
                9+
              </div>
              <div className="text-xs uppercase tracking-wider text-slate-400">
                Services experts
              </div>
            </div>
            <div>
              <div className="font-display text-3xl font-bold text-nexus-orange-400">
                24/7
              </div>
              <div className="text-xs uppercase tracking-wider text-slate-400">
                Assistance IA
              </div>
            </div>
            <div>
              <div className="font-display text-3xl font-bold text-nexus-orange-400">
                100%
              </div>
              <div className="text-xs uppercase tracking-wider text-slate-400">
                Dossiers suivis
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-white/30 p-1.5">
          <div className="h-2 w-1 animate-bounce rounded-full bg-white/70" />
        </div>
      </div>
    </section>
  );
}
