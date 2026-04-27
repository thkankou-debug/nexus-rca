import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Syne } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

// ============================================================================
// SEO — METADATA COMPLETE
// ============================================================================
const SITE_URL = "https://www.nexusrca.com";
const SITE_NAME = "NEXUS RCA";
const SITE_TITLE = "NEXUS RCA — Agence Internationale | Visa, Études, Financement à Bangui";
const SITE_DESCRIPTION =
  "Agence internationale basée à Bangui (RCA). Visa Canada/Europe, études, TCF, financement business, partenariats, digitalisation. Accompagnement structuré de A à Z, premier contact gratuit, réponse sous 24h.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | NEXUS RCA",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    // Marque
    "Nexus RCA",
    "Nexus Centrafrique",
    "agence Bangui",
    "agence internationale Bangui",
    "agence Centrafrique",
    // Visa
    "visa Canada Bangui",
    "visa Centrafrique",
    "visa étudiant Canada",
    "visa Schengen RCA",
    "e-visa Bangui",
    // Études
    "études Canada depuis Bangui",
    "bourse études Canada",
    "TCF Canada Bangui",
    "préparation TCF",
    "université Canada Centrafrique",
    // Business
    "financement projet RCA",
    "incubateur Centrafrique",
    "partenariat business Bangui",
    "investissement projet RCA",
    // Autres services
    "transfert d'argent Bangui",
    "Western Union Bangui",
    "billets d'avion Centrafrique",
    "digitalisation entreprise RCA",
    "site web Bangui",
  ],
  authors: [{ name: "Nexus RCA" }],
  creator: "Nexus RCA",
  publisher: "Nexus RCA",

  // ==========================================================================
  // OPEN GRAPH — pour les partages WhatsApp / Facebook / LinkedIn
  // ==========================================================================
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og-image.jpg", // À placer dans /public — voir notes ci-dessous
        width: 1200,
        height: 630,
        alt: "NEXUS RCA — Agence Internationale à Bangui",
      },
    ],
  },

  // ==========================================================================
  // TWITTER CARD — pour les partages sur X / Twitter
  // ==========================================================================
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/og-image.jpg"],
  },

  // ==========================================================================
  // ROBOTS — directives pour Google et autres moteurs
  // ==========================================================================
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ==========================================================================
  // CANONICAL — éviter le contenu dupliqué
  // ==========================================================================
  alternates: {
    canonical: SITE_URL,
  },

  // ==========================================================================
  // ICONS — à placer dans /public quand tu auras les fichiers
  // ==========================================================================
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  // ==========================================================================
  // FORMAT DETECTION — empeche iOS de transformer les numeros en liens auto
  // ==========================================================================
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },

  // Verification (a remplir si tu utilises Google Search Console plus tard)
  // verification: {
  //   google: "ton-code-google-search-console",
  // },
};

// ============================================================================
// SCHEMA.ORG — LocalBusiness (Google comprend que tu es une agence a Bangui)
// ============================================================================
const SCHEMA_LOCAL_BUSINESS = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${SITE_URL}/#organization`,
  name: "Nexus RCA — Agence Internationale",
  alternateName: "Nexus RCA",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  image: `${SITE_URL}/og-image.jpg`,
  description: SITE_DESCRIPTION,
  telephone: "+23673269692",
  email: "contact@nexusrca.com",
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Relais Sica, vers Hôpital Général",
    addressLocality: "Bangui",
    addressCountry: "CF", // Code ISO Centrafrique
  },
  areaServed: [
    {
      "@type": "Country",
      name: "République Centrafricaine",
    },
    {
      "@type": "Country",
      name: "Canada",
    },
    {
      "@type": "Place",
      name: "Europe",
    },
  ],
  founders: [
    {
      "@type": "Person",
      name: "Thierry F. Kankou",
      jobTitle: "Cofondateur & Responsable International",
    },
    {
      "@type": "Person",
      name: "Orson Dibert L.",
      jobTitle: "Cofondateur & Responsable International (Europe-RCA)",
    },
  ],
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+23673269692",
      contactType: "customer service",
      areaServed: "CF",
      availableLanguage: ["French"],
    },
    {
      "@type": "ContactPoint",
      telephone: "+15873276344",
      contactType: "customer service",
      areaServed: "CA",
      availableLanguage: ["French", "English"],
    },
  ],
  sameAs: [
    // Ajoute ici tes profils sociaux quand tu en auras
    // "https://www.facebook.com/nexusrca",
    // "https://www.linkedin.com/company/nexusrca",
    // "https://www.instagram.com/nexusrca",
  ],
  serviceType: [
    "Visa et e-Visa",
    "Études au Canada",
    "Préparation TCF Canada",
    "Bourses d'études",
    "Financement business et partenariat",
    "Services administratifs",
    "Billets d'avion",
    "Change de devises",
    "Transfert d'argent",
    "Digitalisation et développement d'activité",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${jakarta.variable} ${syne.variable}`}>
      <head>
        {/* Schema.org LocalBusiness — JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(SCHEMA_LOCAL_BUSINESS),
          }}
        />
      </head>
      <body className="min-h-screen antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#050f3d",
              color: "#fff",
              border: "1px solid rgba(249,115,22,0.3)",
            },
            success: { iconTheme: { primary: "#f97316", secondary: "#fff" } },
          }}
        />
      </body>
    </html>
  );
}
