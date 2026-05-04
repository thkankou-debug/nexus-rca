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
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
        display: ["var(--font-syne)", "system-ui", "sans-serif"],
      },
      // Échelle typographique stratifiée — display tight, body lisible
      fontSize: {
        "display-2xl": [
          "clamp(3.5rem, 7vw, 6rem)",
          { lineHeight: "0.95", letterSpacing: "-0.04em", fontWeight: "700" },
        ],
        "display-xl": [
          "clamp(2.75rem, 5.5vw, 4.5rem)",
          { lineHeight: "1", letterSpacing: "-0.035em", fontWeight: "700" },
        ],
        "display-lg": [
          "clamp(2.25rem, 4vw, 3.5rem)",
          { lineHeight: "1.05", letterSpacing: "-0.03em", fontWeight: "700" },
        ],
        "display-md": [
          "clamp(1.875rem, 3vw, 2.5rem)",
          { lineHeight: "1.1", letterSpacing: "-0.025em", fontWeight: "600" },
        ],
        "display-sm": [
          "1.5rem",
          { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "600" },
        ],
        headline: [
          "1.25rem",
          { lineHeight: "1.3", letterSpacing: "-0.015em", fontWeight: "600" },
        ],
        title: [
          "1.0625rem",
          { lineHeight: "1.4", letterSpacing: "-0.01em", fontWeight: "600" },
        ],
        "body-lg": ["1.125rem", { lineHeight: "1.6", fontWeight: "400" }],
        body: ["1rem", { lineHeight: "1.6", fontWeight: "400" }],
        "body-sm": ["0.9375rem", { lineHeight: "1.55", fontWeight: "400" }],
        caption: [
          "0.8125rem",
          { lineHeight: "1.45", letterSpacing: "0.005em", fontWeight: "500" },
        ],
        overline: [
          "0.75rem",
          { lineHeight: "1.3", letterSpacing: "0.12em", fontWeight: "600" },
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
        "nexus-gradient":
          "linear-gradient(135deg, #050f3d 0%, #0a1a6b 50%, #f97316 100%)",
        "nexus-hero":
          "linear-gradient(135deg, rgba(5,15,61,0.95) 0%, rgba(10,26,107,0.85) 50%, rgba(249,115,22,0.3) 100%)",
        "mesh-gradient":
          "radial-gradient(at 20% 20%, rgba(249,115,22,0.15) 0px, transparent 50%), radial-gradient(at 80% 80%, rgba(31,63,245,0.15) 0px, transparent 50%)",
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
        "glow-orange":
          "0 0 0 1px rgb(249 115 22 / 0.1), 0 8px 24px rgb(249 115 22 / 0.25), 0 16px 48px rgb(249 115 22 / 0.15)",
        "glow-blue":
          "0 0 0 1px rgb(31 63 245 / 0.1), 0 8px 24px rgb(31 63 245 / 0.25), 0 16px 48px rgb(31 63 245 / 0.15)",
        "inset-line": "inset 0 0 0 1px rgb(255 255 255 / 0.08)",
        // Backwards-compat
        glow: "0 0 40px rgba(249, 115, 22, 0.4)",
        card: "0 8px 30px rgba(0, 0, 0, 0.06)",
        "card-hover": "0 20px 40px rgba(0, 0, 0, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
