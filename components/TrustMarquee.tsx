const PARTNERS = [
  "Western Union",
  "MoneyGram",
  "Ria",
  "IRCC Canada",
  "Espace Schengen",
  "Air France",
  "Royal Air Maroc",
  "Ethiopian Airlines",
  "Skyscanner",
  "TCF Canada",
  "Ambassade du Canada",
  "Google Flights",
];

export function TrustMarquee() {
  return (
    <section
      aria-label="Partenaires et destinations"
      className="relative border-y border-line bg-surface-sunken py-6 overflow-hidden"
    >
      {/* Fades latéraux pour effet d'apparition */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-surface-sunken to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-surface-sunken to-transparent" />

      <div className="flex">
        {/* Le track est dupliqué deux fois pour un défilement infini sans saut */}
        <div className="flex shrink-0 animate-marquee items-center gap-12 pr-12">
          {PARTNERS.map((p) => (
            <Item key={`a-${p}`} label={p} />
          ))}
        </div>
        <div
          aria-hidden
          className="flex shrink-0 animate-marquee items-center gap-12 pr-12"
        >
          {PARTNERS.map((p) => (
            <Item key={`b-${p}`} label={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Item({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-12">
      <span className="font-display text-headline tracking-tight text-ink-muted/70 whitespace-nowrap">
        {label}
      </span>
      <span
        aria-hidden
        className="h-1.5 w-1.5 rounded-full bg-ink-subtle/40"
      />
    </div>
  );
}
