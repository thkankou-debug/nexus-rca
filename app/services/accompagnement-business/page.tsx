import { useTranslations } from "next-intl";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { PublicHero } from "@/components/PublicHero";
import { ServiceBody } from "@/components/services/ServiceBody";
import { FinalCTA } from "@/components/FinalCTA";
import { FileText } from "lucide-react";

export const metadata = {
  title: "Accompagnement business | Nexus RCA — Bangui",
  description:
    "Stratégie et développement des affaires : diagnostic, planification stratégique et plans d'action pour structurer le développement de votre activité.",
};

const DEMANDE_HREF = `/demande/complet?service=${encodeURIComponent(
  "Accompagnement business"
)}`;

export default function AccompagnementBusinessPage() {
  const t = useTranslations("ServiceAccompagnementBusiness");

  const prestations = [1, 2, 3, 4, 5, 6].map((i) => t(`presta_${i}`));

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
          paragraphs={[t("intro_2")]}
          prestationsTitle={t("prestations_title")}
          prestations={prestations}
        />
        <FinalCTA />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
