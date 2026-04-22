interface Step {
  title: string;
  description: string;
}

interface ServiceStepsProps {
  steps: Step[];
}

export function ServiceSteps({ steps }: ServiceStepsProps) {
  return (
    <ol className="relative space-y-6">
      {steps.map((step, i) => (
        <li
          key={i}
          className="relative flex gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-blue-800 to-nexus-orange-500 font-display text-xl font-bold text-white shadow-lg">
            {i + 1}
          </div>
          <div className="min-w-0 flex-1 pt-1">
            <h3 className="font-display text-lg font-bold text-nexus-blue-950">
              {step.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
              {step.description}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}