import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        nexus: {
          blue: {
            50: "#eef4ff",
            100: "#dbe6ff",
            200: "#bfd3ff",
            300: "#93b4ff",
            400: "#608aff",
            500: "#3b63ff",
            600: "#1f3ff5",
            700: "#182fd8",
            800: "#0a1a6b",
            900: "#050f3d",
            950: "#02071f",
          },
          orange: {
            50: "#fff7ed",
            100: "#ffedd5",
            200: "#fed7aa",
            300: "#fdba74",
            400: "#fb923c",
            500: "#f97316",
            600: "#ea580c",
            700: "#c2410c",
            800: "#9a3412",
            900: "#7c2d12",
          },
        },
        // Tokens sémantiques (light/dark via CSS vars)
        surface: {
          DEFAULT: "rgb(var(--surface) / <alpha-value>)",
          elevated: "rgb(var(--surface-elevated) / <alpha-value>)",
          sunken: "rgb(var(--surface-sunken) / <alpha-value>)",
          overlay: "rgb(var(--surface-overlay) / <alpha-value>)",
        },
        ink: {
          DEFAULT: "rgb(var(--ink) / <alpha-value>)",
          muted: "rgb(var(--ink-muted) / <alpha-value>)",
          subtle: "rgb(var(--ink-subtle) / <alpha-value>)",
          inverted: "rgb(var(--ink-inverted) / <alpha-value>)",
        },
        line: {
          DEFAULT: "rgb(var(--line) / <alpha-value>)",
          strong: "rgb(var(--line-strong) / <alpha-value>)",
        },
        brand: {
          DEFAULT: "rgb(var(--brand) / <alpha-value>)",
          hover: "rgb(var(--brand-hover) / <alpha-value>)",
          subtle: "rgb(var(--brand-subtle) / <alpha-value>)",
        },
        // Texte pose sur un fond --brand (bouton or) : toujours bleu nuit,
        // constant en clair/sombre — distinct de `ink` qui s'inverse avec
        // le theme (D8 : "texte bleu nuit sur bouton or, jamais blanc").
        "on-brand": "rgb(var(--on-brand) / <alpha-value>)",
        // A1 — anneau de focus clavier, distinct de brand (voir globals.css)
        focus: "rgb(var(--focus) / <alpha-value>)",
        // A1 — six familles de statuts (admin), jamais quinze couleurs
        status: {
          neutral: "rgb(var(--status-neutral) / <alpha-value>)",
          waiting: "rgb(var(--status-waiting) / <alpha-value>)",
          progress: "rgb(var(--status-progress) / <alpha-value>)",
          success: "rgb(var(--status-success) / <alpha-value>)",
          failure: "rgb(var(--status-failure) / <alpha-value>)",
          inert: "rgb(var(--status-inert) / <alpha-value>)",
        },
        // A1 (07/09/2026) — sémantiques génériques d'alerte (toasts,
        // bannières), distinctes des 6 statuts ci-dessus (badges de cycle
        // de vie). warning volontairement rouge-orangé, pas ambre : un
        // ambre serait confondu avec l'accent or (voir globals.css).
        danger: "rgb(var(--danger) / <alpha-value>)",
        warning: "rgb(var(--warning) / <alpha-value>)",
        success: "rgb(var(--success) / <alpha-value>)",
        info: "rgb(var(--info) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
        display: ["var(--font-syne)", "system-ui", "sans-serif"],
      },
      // Échelle typographique cabinet/institutionnel — réduite vs v1, sobre
      // v2 : ~20% plus petit sur les display, letter-spacing détendu pour
      // un rendu moins "marketing flashy", plus "publication officielle".
      fontSize: {
        "display-2xl": [
          "clamp(2.75rem, 5.5vw, 4.5rem)",
          { lineHeight: "1.02", letterSpacing: "-0.025em", fontWeight: "700" },
        ],
        "display-xl": [
          "clamp(2.25rem, 4.5vw, 3.5rem)",
          { lineHeight: "1.05", letterSpacing: "-0.022em", fontWeight: "700" },
        ],
        "display-lg": [
          "clamp(1.875rem, 3.5vw, 2.75rem)",
          { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "600" },
        ],
        "display-md": [
          "clamp(1.5rem, 2.5vw, 2rem)",
          { lineHeight: "1.15", letterSpacing: "-0.018em", fontWeight: "600" },
        ],
        "display-sm": [
          "1.375rem",
          { lineHeight: "1.25", letterSpacing: "-0.015em", fontWeight: "600" },
        ],
        headline: [
          "1.1875rem",
          { lineHeight: "1.35", letterSpacing: "-0.01em", fontWeight: "600" },
        ],
        title: [
          "1.0625rem",
          { lineHeight: "1.4", letterSpacing: "-0.005em", fontWeight: "600" },
        ],
        "body-lg": ["1.125rem", { lineHeight: "1.65", fontWeight: "400" }],
        body: ["1rem", { lineHeight: "1.65", fontWeight: "400" }],
        "body-sm": ["0.9375rem", { lineHeight: "1.6", fontWeight: "400" }],
        caption: [
          "0.8125rem",
          { lineHeight: "1.5", letterSpacing: "0.005em", fontWeight: "500" },
        ],
        overline: [
          "0.75rem",
          { lineHeight: "1.3", letterSpacing: "0.1em", fontWeight: "600" },
        ],
      },
      // Système de rayons cohérent
      borderRadius: {
        xs: "0.375rem",
        sm: "0.5rem",
        DEFAULT: "0.75rem",
        md: "0.875rem",
        lg: "1rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
        "4xl": "2.5rem",
      },
      animation: {
        "fade-in": "fadeIn 0.8s ease-out forwards",
        "fade-up": "fadeUp 0.8s ease-out forwards",
        "slide-in": "slideIn 0.6s ease-out forwards",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        "gradient-x": "gradientX 8s ease infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        gradientX: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      backgroundImage: {
        // v1 — preserved for homepage flagship hero only
        "nexus-gradient":
          "linear-gradient(135deg, #050f3d 0%, #0a1a6b 50%, #f97316 100%)",
        "nexus-hero":
          "linear-gradient(135deg, rgba(5,15,61,0.95) 0%, rgba(10,26,107,0.85) 50%, rgba(249,115,22,0.3) 100%)",
        // v2 — institutional dark for service pages (no orange dominance)
        "nexus-hero-institutional":
          "linear-gradient(180deg, rgba(2,7,31,1) 0%, rgba(5,15,61,1) 100%)",
        "mesh-gradient":
          "radial-gradient(at 20% 20%, rgba(249,115,22,0.06) 0px, transparent 55%), radial-gradient(at 80% 80%, rgba(31,63,245,0.08) 0px, transparent 55%)",
        // Subtler accent variant for institutional sections
        "mesh-gradient-subtle":
          "radial-gradient(at 30% 0%, rgba(249,115,22,0.04) 0px, transparent 60%), radial-gradient(at 70% 100%, rgba(31,63,245,0.05) 0px, transparent 60%)",
      },
      // Vocabulaire d'ombres élargi — layered shadows premium
      boxShadow: {
        "elev-1":
          "0 1px 2px rgb(15 23 42 / 0.04), 0 1px 3px rgb(15 23 42 / 0.06)",
        "elev-2":
          "0 2px 4px rgb(15 23 42 / 0.04), 0 4px 12px rgb(15 23 42 / 0.06)",
        "elev-3":
          "0 4px 8px rgb(15 23 42 / 0.04), 0 12px 24px rgb(15 23 42 / 0.08)",
        "elev-4":
          "0 8px 16px rgb(15 23 42 / 0.05), 0 24px 48px rgb(15 23 42 / 0.12)",
        "elev-5":
          "0 12px 24px rgb(15 23 42 / 0.06), 0 32px 64px rgb(15 23 42 / 0.16)",
        // v2 — glows atténués pour ton institutionnel (orange en accent, pas dominant)
        "glow-orange":
          "0 0 0 1px rgb(249 115 22 / 0.08), 0 4px 12px rgb(249 115 22 / 0.12), 0 8px 24px rgb(249 115 22 / 0.08)",
        "glow-blue":
          "0 0 0 1px rgb(31 63 245 / 0.08), 0 4px 12px rgb(31 63 245 / 0.12), 0 8px 24px rgb(31 63 245 / 0.08)",
        "inset-line": "inset 0 0 0 1px rgb(255 255 255 / 0.08)",
        // Backwards-compat — atténués aussi
        glow: "0 0 24px rgba(249, 115, 22, 0.18)",
        card: "0 8px 30px rgba(0, 0, 0, 0.06)",
        "card-hover": "0 20px 40px rgba(0, 0, 0, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
