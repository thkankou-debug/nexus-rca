import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Service } from "@/lib/services";
import { cn } from "@/lib/utils";

// Card service uniformisée — sobre, structurée, sans tilt ni glow.
// 4 zones strictes : icône | titre | description courte | flèche "Découvrir →"
interface ServiceCardProps {
  service: Service;
  className?: string;
}

export function ServiceCard({ service, className }: ServiceCardProps) {
  const Icon = service.icon;

  return (
    <Link
      href={`/services/${service.slug}`}
      className={cn(
        "group relative flex h-full flex-col rounded-2xl border border-line bg-surface-elevated p-6 transition-colors duration-200",
        "hover:border-line-strong",
        className
      )}
    >
      {/* Icône — accent neutre, pas de gradient agressif */}
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-subtle text-brand">
        <Icon className="h-6 w-6" />
      </div>

      {/* Titre */}
      <h3 className="font-display text-headline text-ink">{service.title}</h3>

      {/* Description courte */}
      <p className="mt-2 text-body-sm text-ink-muted">{service.shortDesc}</p>

      {/* CTA flèche — orange en accent uniquement, sans translate */}
      <div className="mt-6 inline-flex items-center gap-1.5 text-caption font-semibold text-brand">
        Découvrir
        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
