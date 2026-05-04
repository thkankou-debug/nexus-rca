"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowRight, Calendar, Globe, Sparkles, FilePlus } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  // ─── Scroll-linked parallax ────────────────────────────────────────────
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, 150]);
  const orbsY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, 250]);
  const badgesY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, -80]);
  const contentY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, 60]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7, 1], [1, 1, 0]);
  const indicatorOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  // ─── Mouse-linked parallax (springs for smoothness) ────────────────────
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const sx = useSpring(mouseX, { stiffness: 60, damping: 20, mass: 0.5 });
  const sy = useSpring(mouseY, { stiffness: 60, damping: 20, mass: 0.5 });

  useEffect(() => {
    if (reduceMotion) return;
    const node = ref.current;
    if (!node) return;
    const onMove = (e: MouseEvent) => {
      const rect = node.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
      mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    };
    node.addEventListener("mousemove", onMove);
    return () => node.removeEventListener("mousemove", onMove);
  }, [mouseX, mouseY, reduceMotion]);

  // Orbes : multiplicateurs différents pour effet de profondeur
  const orb1X = useTransform(sx, (v) => v * 30);
  const orb1Y = useTransform(sy, (v) => v * 30);
  const orb2X = useTransform(sx, (v) => v * -50);
  const orb2Y = useTransform(sy, (v) => v * -50);
  const orb3X = useTransform(sx, (v) => v * 20);
  const orb3Y = useTransform(sy, (v) => v * 20);

  // Spotlight radial qui suit le curseur
  const spotBg = useTransform([sx, sy] as const, ([x, y]: number[]) => {
    const px = 50 + x * 25;
    const py = 50 + y * 25;
    return `radial-gradient(700px circle at ${px}% ${py}%, rgba(249,115,22,0.20), transparent 65%)`;
  });

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen items-center overflow-hidden bg-nexus-blue-950 pb-20 text-white"
    >
      {/* L1 — Image de fond (parallax lent, scale pour cacher les bords) */}
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <img
          src="https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=2000&q=80"
          alt=""
          className="h-full w-full scale-110 object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900/85 to-nexus-orange-900/40" />
      </motion.div>

      {/* L2 — Trois orbes colorés (parallax rapide + mouse-reactive) */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ y: orbsY }}
      >
        <motion.div
          style={{ x: orb1X, y: orb1Y }}
          className="absolute -left-20 top-1/4 h-[28rem] w-[28rem] rounded-full bg-nexus-orange-500/30 blur-3xl animate-float"
        />
        <motion.div
          style={{ x: orb2X, y: orb2Y, animationDelay: "2s" }}
          className="absolute -right-32 bottom-1/4 h-[32rem] w-[32rem] rounded-full bg-nexus-blue-500/30 blur-3xl animate-float"
        />
        <motion.div
          style={{ x: orb3X, y: orb3Y, animationDelay: "4s" }}
          className="absolute left-1/3 top-1/2 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl animate-float"
        />
      </motion.div>

      {/* L3 — Spotlight qui suit le curseur */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: spotBg }}
      />

      {/* L4 — Grain (statique) */}
      <div className="absolute inset-0 grain opacity-30" />

      {/* L5 — Vignette pour assombrir les bords (focalise l'attention) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 45%, rgba(2,7,31,0.55) 100%)",
        }}
      />

      {/* L6 — Badges flottants (parallax foreground = vitesse opposée) */}
      <motion.div
        style={{ y: badgesY }}
        className="pointer-events-none absolute right-6 top-32 hidden lg:block"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="pointer-events-auto rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl shadow-elev-3"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-orange-500 shadow-glow-orange">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-overline text-nexus-orange-300">
                Signature Nexus
              </div>
              <div className="text-title text-white">
                Solutions globales. Impact réel.
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        style={{ y: badgesY }}
        className="pointer-events-none absolute bottom-32 right-20 hidden lg:block"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          className="pointer-events-auto rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl shadow-elev-3"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-blue-700 shadow-glow-blue">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-overline text-nexus-blue-300">Basés à</div>
              <div className="text-title text-white">Bangui, RCA</div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Contenu principal (fade + push up au scroll) */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative mx-auto w-full max-w-7xl px-4 pt-32 pb-12 lg:px-8 lg:pb-20"
      >
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
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-body-sm backdrop-blur-md"
          >
            <Sparkles className="h-4 w-4 text-nexus-orange-400" />
            <span className="font-medium">
              Agence Internationale · Bangui, République Centrafricaine
            </span>
          </motion.div>

          {/* TITRE */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="font-display text-display-xl text-white lg:text-display-2xl"
            style={{ paddingBottom: "0.3em" }}
          >
            L&apos;accompagnement qui transforme{" "}
            <span className="text-gradient-orange">vos projets</span> en réalité
          </motion.h1>

          {/* Badge SIGNATURE NEXUS — version mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-xl lg:hidden"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-nexus-orange-500">
              <Globe className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-overline text-nexus-orange-300">
                Signature Nexus
              </div>
              <div className="text-body-sm font-semibold text-white">
                Solutions globales. Impact réel.
              </div>
            </div>
          </motion.div>

          {/* Sous-titre */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="mt-10 max-w-2xl text-body-lg text-slate-300"
          >
            Démarches administratives, projets internationaux, partenariats et
            financement. Un accompagnement structuré, fiable et axé sur des
            résultats concrets.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="mt-12 flex flex-col gap-3 sm:flex-row sm:gap-4"
          >
            <Button href="/demande/complet" size="lg">
              <FilePlus className="h-5 w-5" />
              Ouvrir un dossier
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button href="/rendez-vous" variant="outline" size="lg">
              <Calendar className="h-5 w-5" />
              Prendre rendez-vous
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.8 }}
            className="mt-4 text-caption text-slate-400"
          >
            Premier contact gratuit · Réponse sous 24h · 100% confidentiel
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="mt-16 grid max-w-2xl grid-cols-3 gap-6 border-t border-white/10 pt-10"
          >
            <div>
              <div className="font-display text-display-sm text-nexus-orange-400">
                10+
              </div>
              <div className="text-overline text-slate-400">
                Services experts
              </div>
            </div>
            <div>
              <div className="font-display text-display-sm text-nexus-orange-400">
                24h
              </div>
              <div className="text-overline text-slate-400">
                Délai de réponse
              </div>
            </div>
            <div>
              <div className="font-display text-display-sm text-nexus-orange-400">
                2
              </div>
              <div className="text-overline text-slate-400">
                Pôles internationaux
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Indicateur de scroll (fade-out au scroll) */}
      <motion.div
        style={{ opacity: indicatorOpacity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-white/30 p-1.5">
          <div className="h-2 w-1 animate-bounce rounded-full bg-white/70" />
        </div>
      </motion.div>
    </section>
  );
}
