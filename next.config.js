const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin("./i18n.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
    ],
  },
  // Marqueur de build visible dans la barre latérale d'administration :
  // permet de savoir instantanément quel commit un navigateur affiche
  // (diagnostic « ancien écran », 12/09/2026).
  env: {
    NEXT_PUBLIC_BUILD_SHA: (process.env.VERCEL_GIT_COMMIT_SHA || "local").slice(0, 7),
  },
};

module.exports = withNextIntl(nextConfig);
