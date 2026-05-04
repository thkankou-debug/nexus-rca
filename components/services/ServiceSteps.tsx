interface Step {
  title: string;
  description: string;
}

interface ServiceStepsProps {
  steps: Step[];
}

export function ServiceSteps({ steps }: ServiceStepsProps) {
  return (
    <ol className="relative space-y-4">
      {steps.map((step, i) => (
        <li
          key={i}
          className="relative flex gap-5 rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2 transition hover:shadow-elev-3"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-800 to-nexus-orange-500 font-display text-xl font-bold text-white shadow-elev-2">
            {i + 1}
          </div>
          <div className="min-w-0 flex-1 pt-1">
            <h3 className="font-display text-headline text-ink">
              {step.title}
            </h3>
            <p className="mt-1.5 text-body-sm text-ink-muted">
              {step.description}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
