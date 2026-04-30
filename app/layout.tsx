import type { Metadata, Viewport } from "next";
import { Syne, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { PWAInstaller } from "@/components/PWAInstaller";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.nexusrca.com"),
  title: {
    default: "Nexus RCA - Agence Internationale | Bangui",
    template: "%s | Nexus RCA",
  },
  description:
    "Agence internationale spécialisée en visa, bourses, TCF Canada, billets d'avion, transferts d'argent et services aux particuliers. Bangui, République Centrafricaine.",
  keywords: [
    "visa",
    "bourses",
    "TCF Canada",
    "billets avion",
    "transfert argent",
    "Bangui",
    "RCA",
    "Centrafrique",
    "agence internationale",
  ],
  authors: [{ name: "Nexus RCA" }],
  creator: "Nexus RCA",
  publisher: "Nexus RCA",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nexus RCA",
    startupImage: ["/icons/icon-512.png"],
  },
  applicationName: "Nexus RCA",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://www.nexusrca.com",
    siteName: "Nexus RCA",
    title: "Nexus RCA - Agence Internationale | Bangui",
    description:
      "Visa, bourses, TCF Canada, billets, transferts. Votre partenaire international depuis Bangui.",
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "Nexus RCA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nexus RCA - Agence Internationale",
    description:
      "Visa, bourses, TCF Canada, billets, transferts. Bangui, RCA.",
    images: ["/icons/icon-512.png"],
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/icons/icon-512.png",
        color: "#FF6600",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FF6600" },
    { media: "(prefers-color-scheme: dark)", color: "#0C1C40" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${syne.variable} ${plusJakarta.variable}`}
    >
      <head>
        {/* Meta tags PWA additionnels iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="default"
        />
        <meta name="apple-mobile-web-app-title" content="Nexus RCA" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Nexus RCA" />
        <meta name="msapplication-TileColor" content="#FF6600" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className="font-sans antialiased">
        {children}
        <PWAInstaller />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#0C1C40",
              color: "#fff",
              borderRadius: "12px",
            },
          }}
        />
      </body>
    </html>
  );
}
