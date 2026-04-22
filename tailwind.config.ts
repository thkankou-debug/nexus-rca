import type { Config } from "tailwindcss";

const config: Config = {
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
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
        display: ["var(--font-syne)", "system-ui", "sans-serif"],
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
      boxShadow: {
        glow: "0 0 40px rgba(249, 115, 22, 0.4)",
        "glow-blue": "0 0 40px rgba(31, 63, 245, 0.4)",
        card: "0 8px 30px rgba(0, 0, 0, 0.06)",
        "card-hover": "0 20px 40px rgba(0, 0, 0, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
