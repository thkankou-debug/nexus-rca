import { CheckCircle2 } from "lucide-react";

interface ServiceBodyProps {
  /** Paragraphes d'introduction, dans l'ordre */
  paragraphs: string[];
  /** Titre de la section prestations (ex. "Nos prestations") */
  prestationsTitle: string;
  prestations: string[];
  /** Section contextuelle optionnelle (ex. "Pourquoi ce réseau compte") */
  extraSection?: {
    title: string;
    body: string;
  };
}

export function ServiceBody({
  paragraphs,
  prestationsTitle,
  prestations,
  extraSection,
}: ServiceBodyProps) {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {paragraphs.length > 0 && (
          <div className="space-y-5">
            {paragraphs.map((p, i) => (
              <p
                key={i}
                className="text-base leading-relaxed text-slate-700 sm:text-lg"
              >
                {p}
              </p>
            ))}
          </div>
        )}

        <div className="mt-12">
          <h2 className="font-display text-2xl font-bold text-nexus-blue-950 sm:text-3xl">
            {prestationsTitle}
          </h2>
          <ul className="mt-6 space-y-3">
            {prestations.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-surface-ivory px-4 py-3.5 shadow-sm"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                <span className="text-sm font-medium text-nexus-blue-950 sm:text-base">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {extraSection && (
          <div className="mt-12 rounded-2xl border border-slate-200 bg-surface-ivory p-6 sm:p-8">
            <h3 className="font-display text-lg font-bold text-nexus-blue-950 sm:text-xl">
              {extraSection.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-700 sm:text-base">
              {extraSection.body}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
