"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionStyle,
} from "framer-motion";
import { cn } from "@/lib/utils";

const SPRING = { stiffness: 200, damping: 22, mass: 0.5 };

/**
 * TiltCard — wrapper qui applique un tilt 3D piloté par la souris,
 * plus une lueur radiale qui suit le curseur. Le contenu peut utiliser
 * `[transform-style:preserve-3d]` et `translate-z-N` pour créer
 * de la profondeur supplémentaire.
 */
export function TiltCard({
  children,
  className,
  maxTilt = 7,
  glow = true,
  glowOpacity = 0.12,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  /** Inclinaison max en degrés sur chaque axe */
  maxTilt?: number;
  /** Affiche un radial-gradient blanc qui suit le curseur */
  glow?: boolean;
  glowOpacity?: number;
  as?: "div" | "article" | "section";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  // Mouse position normalisée -0.5 .. 0.5
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, SPRING);
  const sy = useSpring(my, SPRING);

  // Tilt : axe X (vertical mouse) inversé pour le sens "naturel"
  const rotateX = useTransform(sy, (v) =>
    reduceMotion ? 0 : -v * maxTilt * 2
  );
  const rotateY = useTransform(sx, (v) =>
    reduceMotion ? 0 : v * maxTilt * 2
  );

  // Glow follows cursor (en pourcentage du conteneur)
  const glowBg = useTransform(
    [sx, sy] as const,
    ([x, y]: number[]) =>
      `radial-gradient(450px circle at ${50 + x * 100}% ${50 + y * 100}%, rgba(255,255,255,${glowOpacity}), transparent 55%)`
  );

  const onMove = (e: React.MouseEvent) => {
    if (reduceMotion) return;
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  const MotionTag = (motion as any)[Tag];

  return (
    <MotionTag
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        transformPerspective: 1000,
      } as MotionStyle}
      className={cn("relative", className)}
    >
      {children}
      {glow && !reduceMotion && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: glowBg }}
        />
      )}
    </MotionTag>
  );
}
