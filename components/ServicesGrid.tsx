import { SERVICES } from "@/lib/services";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { Section, SectionHeader } from "@/components/ui/Section";

// Grille services uniformisée — 3 colonnes desktop, sobre, structurée.
// Drop bento layout, TiltCard, gradient hovers et numéros filigrane :
// chaque service a la même importance visuelle (cohérent avec le ton cabinet).
export function ServicesGrid() {
  return (
    <Section
      id="services"
      variant="default"
      size="xl"
      className="overflow-hidden"
    >
      {/* Mesh très subtil — quasi imperceptible */}
      <div className="pointer-events-none absolute inset-0 bg-mesh-gradient-subtle" />

      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        <SectionHeader
          eyebrow="Nos expertises"
          title="Dix services. Une méthode commune."
          description="De l'identification du besoin à la délivrance du résultat, chaque service suit la même rigueur de cadrage, de structuration et de suivi."
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </Section>
  );
}
