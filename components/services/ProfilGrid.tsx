/**
 * ProfilGrid — grille de cards "Pour qui ce service est conçu".
 * Pattern partagé par les pages services componentisées.
 */
type ProfilItem = { title: string; text: string };

export function ProfilGrid({ items }: { items: ProfilItem[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((p) => (
        <div
          key={p.title}
          className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2 transition hover:border-brand/40 hover:shadow-elev-3"
        >
          <h3 className="font-display text-headline text-ink">{p.title}</h3>
          <p className="mt-2 text-body-sm text-ink-muted">{p.text}</p>
        </div>
      ))}
    </div>
  );
}
