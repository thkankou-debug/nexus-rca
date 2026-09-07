import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  ClipboardCheck,
  Code,
  GraduationCap,
  HandCoins,
  Network,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

// ─── ServicesGrid — "Une expertise intégrée, un seul partenaire" ───────────
// Restyle P10 lot 6 (structure maquette) : fond blanc, photo Bangui à
// gauche (placeholder tant que la photo réelle n'est pas fournie — voir
// docs/DETTE.md), liste 2 colonnes des 8 piliers à droite. Contenu et
// données (getPiliers/PILIERS_FALLBACK, P10 lot 2) inchangés : seule la
// présentation change, jamais le fond éditorial des piliers.
// ────────────────────────────────────────────────────────────────────────────

type Tone =
  | "orange"
  | "tech"
  | "academic"
  | "secure"
  | "finance"
  | "navy"
  | "neutral"
  | "world";

type Pilier = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  tone: Tone;
  tags: [string, string];
};

// Les 8 piliers ont désormais tous une ligne `services` réelle (migration
// 067 : ajout d'"accompagnement-business" et "reseau-international", qui
// n'avaient aucune page dédiée mais existent maintenant comme entrées CMS
// pour titre/description). "href" reste géré ici pour ces deux-là (pas de
// route /services/accompagnement-business ni /services/reseau-international)
// — voir NO_DEDICATED_PAGE plus bas et docs/DETTE.md.
const PILIER_SLUGS: Record<string, string> = {
  visa: "visa",
  digital: "digitalisation",
  financement: "financement",
  business: "accompagnement-business",
  reseau: "reseau-international",
  etudes: "etudes",
  assurance: "assurance",
  admin: "administratif",
};

// Piliers sans page /services/<slug> dédiée : le titre/la description
// viennent du CMS mais le lien de la carte pointe vers une page existante
// pertinente plutôt que vers une route inexistante.
const NO_DEDICATED_PAGE = new Set(["business", "reseau"]);

const PILIERS_FALLBACK = {
  visa: {
    id: "visa",
    title: "Visa & mobilité",
    description:
      "Préparation de dossier conforme aux standards consulaires — Schengen, Canada, e-Visa. Diagnostic, structuration, suivi jusqu'à la décision.",
    icon: ShieldCheck,
    href: "/services/visa",
    tone: "orange" as Tone,
    tags: ["Schengen", "Canada"] as [string, string],
  },
  digital: {
    id: "digital",
    title: "Digitalisation & technologie",
    description:
      "Sites, e-commerce, présence digitale durable. Du brief à la mise en ligne avec accompagnement opérationnel.",
    icon: Code,
    href: "/services/digitalisation",
    tone: "tech" as Tone,
    tags: ["Sites web", "E-commerce"] as [string, string],
  },
  financement: {
    id: "financement",
    title: "Financement & incubation",
    description:
      "Structuration de projet, recherche de financement, mise en relation investisseurs, incubateur Nexus.",
    icon: HandCoins,
    href: "/services/financement",
    tone: "finance" as Tone,
    tags: ["Incubation", "Investisseurs"] as [string, string],
  },
  business: {
    id: "business",
    title: "Accompagnement business",
    description:
      "Stratégie, partenariats, entrée de marché. Pour entrepreneurs et entreprises ambitieuses.",
    icon: Briefcase,
    href: "/services/financement",
    tone: "navy" as Tone,
    tags: ["Stratégie", "Partenariats"] as [string, string],
  },
  reseau: {
    id: "reseau",
    title: "Réseau international",
    description:
      "Trois pôles actifs : Bangui (siège), Europe, Canada. Une équipe, une méthode, partout.",
    icon: Network,
    href: "/a-propos",
    tone: "world" as Tone,
    tags: ["3 continents", "10+ services"] as [string, string],
  },
  etudes: {
    id: "etudes",
    title: "Études internationales",
    description:
      "Canada, France, Europe — choix de programme, dossier admissions, CAQ, Campus France, TCF.",
    icon: GraduationCap,
    href: "/services/etudes",
    tone: "academic" as Tone,
    tags: ["Canada", "France"] as [string, string],
  },
  assurance: {
    id: "assurance",
    title: "Assurance & voyage",
    description:
      "Cabinet de courtage : couverture Schengen, santé internationale, assistance médicale, rapatriement.",
    icon: ShieldCheck,
    href: "/services/assurance",
    tone: "secure" as Tone,
    tags: ["Schengen", "Santé intl"] as [string, string],
  },
  admin: {
    id: "admin",
    title: "Services administratifs",
    description:
      "Démarches officielles complexes traitées avec rigueur — légalisations, attestations, courriers.",
    icon: ClipboardCheck,
    href: "/services/administratif",
    tone: "neutral" as Tone,
    tags: ["Légalisations", "Attestations"] as [string, string],
  },
} satisfies Record<string, Pilier>;

/**
 * Construit les 8 piliers : titre/description dynamiques depuis `services`
 * pour les 8 (migration 067), valeurs en dur conservées uniquement comme
 * repli en cas d'erreur réseau/DB. Icône et lien des 2 piliers sans page
 * dédiée restent fixés dans le composant (voir NO_DEDICATED_PAGE) —
 * jamais éditables depuis le CMS.
 */
async function getPiliers(): Promise<Record<string, Pilier>> {
  const piliers: Record<string, Pilier> = { ...PILIERS_FALLBACK };

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("services")
      .select("slug, nom, description")
      .in("slug", Object.values(PILIER_SLUGS));

    if (error) {
      console.error("[SERVICES_GRID] chargement services:", error.message);
      return piliers;
    }

    const bySlug = new Map((data || []).map((s) => [s.slug, s]));
    for (const [pilierId, slug] of Object.entries(PILIER_SLUGS)) {
      const service = bySlug.get(slug);
      if (service?.nom) {
        piliers[pilierId] = {
          ...piliers[pilierId],
          title: service.nom,
          description: service.description || piliers[pilierId].description,
          href: NO_DEDICATED_PAGE.has(pilierId)
            ? piliers[pilierId].href
            : `/services/${slug}`,
        };
      }
    }
  } catch (err) {
    console.error("[SERVICES_GRID] exception:", err);
  }

  return piliers;
}

// Palette institutionnelle uniquement (retour Thierry 06/09/2026) : plus de
// tons multicolores (sky/violet/emerald/amber/teal) — icônes uniformément
// bleu nuit, comme sur la maquette. Le champ `tone` est conservé sur les
// données (pas de migration de schéma) mais n'est plus utilisé pour choisir
// une couleur différente par pilier.
const ICON_COLOR: Record<Tone, string> = {
  orange: "text-nexus-blue-800",
  tech: "text-nexus-blue-800",
  academic: "text-nexus-blue-800",
  secure: "text-nexus-blue-800",
  finance: "text-nexus-blue-800",
  navy: "text-nexus-blue-800",
  neutral: "text-nexus-blue-800",
  world: "text-nexus-blue-800",
};

// Ordre des 8 pôles officiels tel que fixé par Thierry (06/09/2026). Reste
// une séquence fixe dans le composant, pas encore pilotée par un champ
// d'ordre dédié aux pôles (le `ordre_affichage` de `services` sert au
// catalogue /services complet, pas à ce regroupement par pôle) — limitation
// documentée dans docs/DETTE.md.
const PILIER_ORDER: (keyof typeof PILIERS_FALLBACK)[] = [
  "visa",
  "digital",
  "financement",
  "business",
  "reseau",
  "etudes",
  "assurance",
  "admin",
];

export async function ServicesGrid() {
  const PILIERS = await getPiliers();

  return (
    <section id="services" className="relative overflow-hidden bg-white py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          {/* ─── Colonne gauche — intro + visuel Bangui (provisoire) ─── */}
          <div className="lg:col-span-4">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-nexus-blue-900 via-nexus-blue-950 to-black shadow-[0_20px_50px_-20px_rgba(2,7,31,0.35)]">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-brand/20 blur-3xl"
              />
              <div className="absolute bottom-6 left-6 right-6 text-[11px] font-bold uppercase tracking-[0.22em] text-white/70">
                Bangui · au cœur des connectivités africaines
              </div>
            </div>

            <span className="mt-8 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-brand">
              <span aria-hidden className="h-px w-6 bg-brand" />
              Nos expertises
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold leading-[1.1] tracking-tight text-nexus-blue-950 sm:text-4xl">
              Une expertise intégrée, un seul partenaire.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-500 sm:text-base">
              Des solutions sur mesure pour transformer vos projets en
              opportunités durables, en République centrafricaine et à
              l&rsquo;international.
            </p>
          </div>

          {/* ─── Colonne droite — 8 piliers, 2 colonnes ─── */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2">
              {PILIER_ORDER.map((key) => (
                <PilierRow key={key} pilier={PILIERS[key]} />
              ))}
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Des projets au service d&rsquo;un avenir plus ouvert
              </span>
              <Link
                href="/services"
                className="group/cta inline-flex shrink-0 items-center gap-2 text-sm font-bold text-nexus-blue-900 transition-colors hover:text-brand"
              >
                Voir le détail des services
                <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PilierRow({ pilier }: { pilier: Pilier }) {
  const Icon = pilier.icon;
  const iconColor = ICON_COLOR[pilier.tone];

  return (
    <Link href={pilier.href} className="group flex items-start gap-4">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center ${iconColor}`}
      >
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <h3 className="font-display text-base font-bold text-nexus-blue-950 transition-colors group-hover:text-brand">
          {pilier.title}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-500">
          {pilier.description}
        </p>
      </div>
    </Link>
  );
}
