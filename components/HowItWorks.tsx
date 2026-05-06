import { CheckCircle2, FileCheck, MessageSquare, Rocket } from "lucide-react";

const STEPS = [
  {
    icon: MessageSquare,
    title: "Contactez-nous",
    desc: "Via WhatsApp, le formulaire ou directement en agence à Bangui. Premier contact gratuit.",
  },
  {
    icon: FileCheck,
    title: "Analyse du dossier",
    desc: "Un conseiller étudie votre situation, identifie les démarches et prépare un plan clair.",
  },
  {
    icon: Rocket,
    title: "Exécution",
    desc: "Nous montons, déposons et suivons tous les dossiers — vous avez un interlocuteur unique.",
  },
  {
    icon: CheckCircle2,
    title: "Objectif atteint",
    desc: "Visa obtenu, financement débloqué, admission confirmée. Nous restons à vos côtés.",
  },
];

const DOT_GRID_LIGHT_SUBTLE: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at center, rgba(12,28,64,0.04) 1px, transparent 1px)",
  backgroundSize: "32px 32px",
};

export function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/40 to-white py-20 sm:py-24 lg:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={DOT_GRID_LIGHT_SUBTLE}
      />

      <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
            Comment ça marche
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
            Un processus clair, des résultats concrets.
          </h2>
        </div>

        <div className="relative grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {/* Connector line desktop */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-nexus-orange-300/60 to-transparent lg:block"
          />

          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <article
                key={i}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50/40 p-6 shadow-[0_16px_36px_-16px_rgba(12,28,64,0.16)] ring-1 ring-slate-100/80 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-300/60 hover:shadow-[0_22px_48px_-18px_rgba(255,102,0,0.22)]"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/15"
                />

                <div className="relative">
                  {/* Numéro + Icône */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div
                        aria-hidden
                        className="absolute inset-0 rounded-2xl bg-nexus-orange-500/30 opacity-50 blur-md transition-all duration-500 group-hover:opacity-90"
                      />
                      <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_8px_24px_-8px_rgba(255,102,0,0.5)] transition-transform duration-300 ease-out group-hover:scale-105">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <span className="font-display text-3xl font-bold tabular-nums text-slate-200 transition-colors duration-300 group-hover:text-nexus-orange-300">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-base font-bold leading-tight text-nexus-blue-950 sm:text-lg">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {step.desc}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
