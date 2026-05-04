"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

/**
 * PageTransition — fade + petite translation Y entre routes du dashboard.
 *
 * Pattern: AnimatePresence mode="wait" → l'exit anime à fond avant que
 * la nouvelle page ne mount. Évite l'overlap visuel sur les pages au
 * contenu très différent.
 *
 * `initial={false}` sur AnimatePresence empêche l'animation d'entrée
 * sur le tout premier render (l'utilisateur arrive sur la page X et
 * la voit immédiatement). Seules les navigations ultérieures animent.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return <>{children}</>;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
