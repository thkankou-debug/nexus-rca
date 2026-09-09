import { useTranslations } from "next-intl";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { PublicHero } from "@/components/PublicHero";
import { ServiceBody } from "@/components/services/ServiceBody";
import { FinalCTA } from "@/components/FinalCTA";
import { FileText } from "lucide-react";

export const metadata = {
  title: "Réseau international | Nexus RCA — Bangui",
  description:
    "Bangui (siège), Canada (bureau) et Europe (représentation) : mise en relation professionnelle et coordination de projets transfrontaliers entre nos trois zones.",
};

const DEMANDE_HREF = `/demande/complet?service=${encodeURIComponent(
  "Réseau international"
)}`;

export default function ReseauInternationalPage() {
  const t = useTranslations("ServiceReseauInternational");

  const prestations = [1, 2, 3].map((i) => t(`presta_${i}`));

  return (
    <>
      <Navbar />
      <main>
        <PublicHero
          eyebrow={t("eyebrow")}
          titleStart={t("title_start")}
          accentWord={t("title_accent")}
          subtitle={t("intro_1")}
          ctaPrimary={{
            href: DEMANDE_HREF,
            label: t("cta_primary"),
            icon: FileText,
          }}
        />
        <ServiceBody
          paragraphs={[]}
          prestationsTitle={t("prestations_title")}
          prestations={prestations}
          extraSection={{
            title: t("context_title"),
            body: t("context_body"),
          }}
        />
        <FinalCTA />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
