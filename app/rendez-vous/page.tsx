import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { AppointmentForm } from "@/components/AppointmentForm";
import {
  Zap,
  FilePlus,
  Phone,
  MapPin,
  Lightbulb,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { whatsappLink } from "@/lib/utils";

export const metadata = {
  title: "Prendre un rendez-vous | Nexus RCA",
  description:
    "Reservez un echange structure avec l'equipe Nexus RCA pour analyser votre besoin, clarifier votre situation et definir les prochaines etapes.",
};

const REASSURANCE_POINTS = [
  "Reponse claire et professionnelle",
  "Orientation adaptee a votre service",
  "Confirmation apres verification de disponibilite",
];

export default function RendezVousPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50">
        {/* HERO */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 pt-32 pb-16 text-white">
          <div className="absolute inset-0 bg-mesh-gradient opacity-40" />
          <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-nexus-orange-500/20 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur-md">
                <span className="flex h-2 w-2 rounded-full bg-green-400" />
                <span className="font-medium">Prise de rendez-vous en ligne</span>
              </div>

              <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
                Prendre un rendez-vous avec{" "}
                <span className="text-gradient-orange">Nexus RCA</span>
              </h1>

              <p className="mt-5 text-lg leading-relaxed text-slate-300 sm:text-xl">
                Reservez un echange structure avec notre equipe pour analyser
                votre besoin, clarifier votre situation et definir les
                prochaines etapes.
              </p>

              {/* Reassurance points */}
              <ul className="mt-8 grid gap-3 sm:grid-cols-3">
                {REASSURANCE_POINTS.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur"
                  >
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-nexus-orange-400" />
                    <span className="text-sm font-medium text-white/90">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CONTENT */}
        <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* LEFT - Form */}
            <div className="lg:col-span-2">
              <AppointmentForm />
            </div>

            {/* RIGHT - Sidebar */}
            <aside className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 space-y-5">
                {/* 1. Urgent / WhatsApp */}
                <div className="relative overflow-hidden rounded-2xl border-2 border-nexus-orange-300 bg-gradient-to-br from-nexus-orange-50 to-white p-6 shadow-lg">
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-nexus-orange-500/10" />
                  <div className="relative">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-orange-500 text-white">
                        <Zap className="h-5 w-5" />
                      </div>
                      <h3 className="font-display text-lg font-bold text-nexus-blue-950">
                        Besoin urgent ?
                      </h3>
                    </div>
                    <p className="mb-4 text-sm leading-relaxed text-slate-700">
                      Pour une reponse immediate, contactez-nous directement sur
                      WhatsApp. Notre equipe repond rapidement.
                    </p>
                    <a
                      href={whatsappLink(
                        "Bonjour Nexus, j'ai un besoin urgent."
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-green-500 to-green-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-green-500/30 transition hover:shadow-xl"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Ouvrir WhatsApp
                    </a>
                  </div>
                </div>

                {/* 2. Dossier complet avec documents */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-blue-100 text-nexus-blue-700">
                      <FilePlus className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-nexus-blue-950">
                      Dossier complet avec documents
                    </h3>
                  </div>
                  <p className="mb-4 text-sm leading-relaxed text-slate-600">
                    Si vous souhaitez deposer un dossier complet avec
                    documents et pieces justificatives, utilisez plutot notre
                    formulaire dedie.
                  </p>
                  <Link
                    href="/demande/complet"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-nexus-blue-900 bg-white px-5 py-2.5 text-sm font-semibold text-nexus-blue-900 transition hover:bg-nexus-blue-900 hover:text-white"
                  >
                    Ouvrir un dossier
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                {/* 3. Nous joindre */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-blue-100 text-nexus-blue-700">
                      <Phone className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-nexus-blue-950">
                      Nous joindre
                    </h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-nexus-orange-500" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Agence
                        </p>
                        <p className="mt-0.5 text-slate-700">
                          Relais Sica, vers Hopital General
                          <br />
                          Bangui, Republique Centrafricaine
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="mt-0.5 h-4 w-4 shrink-0 text-nexus-orange-500" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          WhatsApp
                        </p>
                        <p className="mt-0.5 text-slate-700">
                          +1 587 327 6344
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Conseil */}
                <div className="rounded-2xl border border-nexus-blue-200 bg-gradient-to-br from-nexus-blue-50 to-white p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-blue-900 text-white">
                      <Lightbulb className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-nexus-blue-950">
                      Conseil
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-700">
                    Plus votre demande est precise, plus notre reponse sera
                    rapide. Decrivez clairement votre situation et vos
                    objectifs dans le formulaire.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
