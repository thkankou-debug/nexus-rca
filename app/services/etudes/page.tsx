import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import {
  GraduationCap,
  School,
  Building2,
  FileText,
  Plane,
  Calendar,
  ArrowRight,
  ClipboardCheck,
  Search,
  ShieldCheck,
} from "lucide-react";
import { whatsappLink } from "@/lib/utils";

export const metadata = {
  title: "Études au Canada — admission & permis | Nexus RCA",
  description:
    "Accès structuré aux établissements canadiens et sécurisation du permis d'études. De l'identification du programme à la délivrance du permis IRCC, accompagnement encadré depuis Bangui.",
};

const ETAPES = [
  {
    num: "01",
    icon: Search,
    title: "Identification du programme",
    description:
      "Cartographie des établissements (universités, cégeps, instituts) compatibles avec votre parcours académique, vos objectifs professionnels et votre calendrier de rentrée.",
  },
  {
    num: "02",
    icon: ClipboardCheck,
    title: "Constitution du dossier d'admission",
    description:
      "Lettre de motivation cadrée selon les exigences du programme cible, CV académique, traductions certifiées, relevés et diplômes mis en conformité, gestion des délais d'envoi.",
  },
  {
    num: "03",
    icon: ShieldCheck,
    title: "CAQ + permis d'études IRCC",
    description:
      "Une fois l'admission obtenue : montage du dossier de Certificat d'acceptation du Québec (le cas échéant) puis du permis d'études IRCC, biométrie à Yaoundé, suivi jusqu'à la décision.",
  },
  {
    num: "04",
    icon: Plane,
    title: "Préparation au départ",
    description:
      "Confirmation d'inscription, logement, billet aller, assurance, premières démarches à l'arrivée. Transmission complète du dossier au client avant le départ.",
  },
];

const ETABLISSEMENTS = [
  {
    icon: Building2,
    title: "Universités",
    description:
      "Baccalauréats, maîtrises et doctorats — francophones et anglophones, dans toutes les provinces.",
  },
  {
    icon: School,
    title: "Collèges (Cégeps)",
    description:
      "Formations techniques de 1 à 3 ans, fortement orientées emploi, voie d'accès rapide à un permis post-diplôme.",
  },
  {
    icon: GraduationCap,
    title: "Instituts spécialisés",
    description:
      "Programmes ciblés (santé, ingénierie, IT, métiers réglementés) avec critères d'admission spécifiques.",
  },
];

export default function EtudesPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* 1. HERO INSTITUTIONNEL ─────────────────────────────────── */}
        <section className="relative overflow-hidden bg-nexus-blue-950 pt-40 pb-24 text-white">
          <div className="absolute inset-0 bg-mesh-gradient opacity-50" />
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-nexus-orange-500/30 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-nexus-blue-500/30 blur-3xl" />
          <div className="grain pointer-events-none absolute inset-0 opacity-20" />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-overline text-nexus-orange-300 backdrop-blur">
                <GraduationCap className="h-3.5 w-3.5" />
                Service études Canada
              </div>

              <h1
                className="font-display text-display-xl text-white lg:text-display-2xl"
                style={{ paddingBottom: "0.15em" }}
              >
                <span className="text-gradient-orange">
                  Accès structuré
                </span>{" "}
                aux établissements canadiens et sécurisation du permis d'études.
              </h1>

              <p className="mx-auto mt-8 max-w-3xl text-body-lg text-slate-300">
                De l'identification du programme aligné à votre parcours
                jusqu'à la délivrance du permis d'études IRCC, nous opérons un
                accompagnement encadré, étape par étape, selon les standards
                exigés par les établissements et les autorités canadiennes.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
                <Link
                  href="/services/bourses/demarrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-8 py-4 text-body font-semibold text-white shadow-elev-3 transition hover:bg-brand-hover hover:shadow-glow-orange"
                >
                  <FileText className="h-5 w-5" />
                  Soumettre ma demande
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/rendez-vous?service=etudes"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/30 bg-white/5 px-8 py-4 text-body font-semibold text-white backdrop-blur transition hover:bg-white/10"
                >
                  <Calendar className="h-5 w-5" />
                  Prendre rendez-vous
                </Link>
              </div>

              <p className="mt-5 text-caption text-slate-400">
                Étude initiale gratuite · Bilan de faisabilité écrit avant tout engagement.
              </p>
            </div>
          </div>
        </section>

        {/* 2. MÉTHODOLOGIE ────────────────────────────────────────── */}
        <section className="bg-surface-elevated py-24">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="text-overline text-brand">Méthode</div>
              <h2 className="mt-4 font-display text-display-md text-ink">
                Quatre étapes encadrées, du programme cible au départ.
              </h2>
              <p className="mt-4 text-body text-ink-muted">
                Chaque étape produit un livrable validé avec vous avant le
                passage à la suivante. Pas de raccourci, pas de zone d'ombre.
              </p>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-2">
              {ETAPES.map((etape) => (
                <article
                  key={etape.num}
                  className="rounded-3xl border border-line bg-white p-7 shadow-elev-1 transition hover:shadow-elev-2"
                >
                  <div className="flex items-start gap-5">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-brand-subtle text-brand">
                      <etape.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-overline text-brand">
                        Étape {etape.num}
                      </div>
                      <h3 className="mt-1 font-display text-display-sm text-ink">
                        {etape.title}
                      </h3>
                      <p className="mt-3 text-body-sm text-ink-muted">
                        {etape.description}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 3. ÉTABLISSEMENTS ──────────────────────────────────────── */}
        <section className="bg-surface-sunken py-24">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="text-overline text-brand">Périmètre</div>
              <h2 className="mt-4 font-display text-display-md text-ink">
                Trois familles d'établissements canadiens couvertes.
              </h2>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {ETABLISSEMENTS.map((eta) => (
                <article
                  key={eta.title}
                  className="rounded-3xl border border-line bg-white p-7 shadow-elev-1"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-subtle text-brand">
                    <eta.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-display text-display-sm text-ink">
                    {eta.title}
                  </h3>
                  <p className="mt-3 text-body-sm text-ink-muted">
                    {eta.description}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-12 rounded-3xl border border-line bg-white p-7 text-center shadow-elev-1">
              <p className="text-body-sm text-ink-muted">
                Vous cherchez un{" "}
                <strong className="text-ink">financement académique</strong>{" "}
                (bourses, aides, programmes ciblés) ?{" "}
                <Link
                  href="/services/bourses"
                  className="font-semibold text-brand hover:underline"
                >
                  Voir le service Bourses →
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* 4. CTA FINAL ───────────────────────────────────────────── */}
        <section className="bg-nexus-blue-950 py-24 text-white">
          <div className="mx-auto max-w-4xl px-4 text-center lg:px-8">
            <h2 className="font-display text-display-md text-white">
              Engagez la procédure dans les conditions exigées.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-body-lg text-slate-300">
              Soumettez votre demande pour qu'un conseiller Nexus étudie votre
              dossier. Réponse écrite avec bilan de faisabilité avant tout
              engagement.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <Link
                href="/services/bourses/demarrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-8 py-4 text-body font-semibold text-white shadow-elev-3 transition hover:bg-brand-hover hover:shadow-glow-orange"
              >
                <FileText className="h-5 w-5" />
                Soumettre ma demande
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href={whatsappLink("Bonjour, je souhaite étudier au Canada.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/30 bg-white/5 px-8 py-4 text-body font-semibold text-white backdrop-blur transition hover:bg-white/10"
              >
                Question rapide sur WhatsApp
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
