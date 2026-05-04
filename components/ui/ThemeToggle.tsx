"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  readTheme,
  resolveTheme,
  setTheme as persistTheme,
  THEME_EVENT,
  type Theme,
} from "@/lib/theme";

const MEDIA_QUERY = "(prefers-color-scheme: dark)";

const OPTIONS: { value: Theme; label: string; icon: LucideIcon }[] = [
  { value: "light", label: "Clair", icon: Sun },
  { value: "dark", label: "Sombre", icon: Moon },
  { value: "system", label: "Système", icon: Monitor },
];

export function ThemeToggle({
  variant = "auto",
  className,
}: {
  variant?: "auto" | "ink" | "light";
  className?: string;
}) {
  const [theme, setTheme] = useState<Theme>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync au mount
  useEffect(() => {
    setMounted(true);
    const stored = readTheme();
    setTheme(stored);
    setResolved(resolveTheme(stored));
  }, []);

  // Écoute les changements de thème déclenchés ailleurs (palette, autre tab)
  useEffect(() => {
    const onChange = (e: Event) => {
      const next = (e as CustomEvent<Theme>).detail;
      if (next) {
        setTheme(next);
        setResolved(resolveTheme(next));
      }
    };
    window.addEventListener(THEME_EVENT, onChange);
    return () => window.removeEventListener(THEME_EVENT, onChange);
  }, []);

  // Suivi de la pref OS quand on est en mode "system"
  useEffect(() => {
    if (!mounted || theme !== "system") return;
    const mq = window.matchMedia(MEDIA_QUERY);
    const onMQ = (e: MediaQueryListEvent) => {
      setResolved(e.matches ? "dark" : "light");
      document.documentElement.classList.toggle("dark", e.matches);
    };
    mq.addEventListener("change", onMQ);
    return () => mq.removeEventListener("change", onMQ);
  }, [theme, mounted]);

  // Fermeture popover (clic extérieur / Escape)
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const select = (next: Theme) => {
    persistTheme(next); // déclenche aussi THEME_EVENT
    setOpen(false);
  };

  const buttonColors =
    variant === "ink"
      ? "text-ink hover:bg-surface-sunken border-line"
      : variant === "light"
        ? "text-white hover:bg-white/10 border-white/20"
        : "text-ink hover:bg-surface-sunken border-line";

  const showMonitor = mounted && theme === "system";
  const showMoon = mounted && !showMonitor && resolved === "dark";

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Changer le thème"
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "relative inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors",
          buttonColors
        )}
      >
        <Sun
          className={cn(
            "absolute h-4 w-4 transition-all duration-300",
            mounted && !showMonitor && !showMoon
              ? "scale-100 rotate-0 opacity-100"
              : "scale-0 rotate-90 opacity-0"
          )}
        />
        <Moon
          className={cn(
            "absolute h-4 w-4 transition-all duration-300",
            showMoon
              ? "scale-100 rotate-0 opacity-100"
              : "scale-0 -rotate-90 opacity-0"
          )}
        />
        <Monitor
          className={cn(
            "absolute h-4 w-4 transition-all duration-300",
            showMonitor
              ? "scale-100 rotate-0 opacity-100"
              : "scale-0 rotate-180 opacity-0"
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-2xl border border-line bg-surface-overlay shadow-elev-4"
        >
          <ul className="py-1">
            {OPTIONS.map(({ value, label, icon: Icon }) => {
              const active = theme === value;
              return (
                <li key={value}>
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={active}
                    onClick={() => select(value)}
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-2 text-body-sm transition-colors",
                      active
                        ? "bg-surface-sunken text-ink font-semibold"
                        : "text-ink-muted hover:bg-surface-sunken hover:text-ink"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-left">{label}</span>
                    {active && <Check className="h-4 w-4 text-brand" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
