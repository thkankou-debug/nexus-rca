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

export const metadata: Metadata = {
  title: "NEXUS RCA – Agence Internationale | De Bangui au monde",
  description:
    "Agence internationale basée à Bangui. Visa, études au Canada, TCF, financement business, billets d'avion, transfert d'argent. Nexus vous accompagne de A à Z.",
  keywords: [
    "Nexus RCA",
    "Bangui",
    "visa Canada",
    "TCF Canada",
    "bourse études",
    "agence internationale",
    "Centrafrique",
  ],
  openGraph: {
    title: "NEXUS RCA – De Bangui au monde",
    description:
      "Visa, études, business, voyages — Nexus vous accompagne de A à Z.",
    type: "website",
    locale: "fr_FR",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${jakarta.variable} ${syne.variable}`}>
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
