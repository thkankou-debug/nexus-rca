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
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

// ─── ServicesGrid — Écosystème Nexus ────────────────────────────────────────
// Bento : 1 hero card (Visa) + 7 cards compactes premium.
// Chaque compacte = icône + titre + description courte + 2 tags + lien.
// Tonalités chromatiques par card (anti-uniformité).
// 100% navy + glass, dense, lisible, haut de gamme.
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

// Piliers dont le titre/description/lien viennent de `services` (P8) —
// slug réel de la table. "business" et "reseau" restent en dur : le
// premier n'a aucun service réel derrière lui à ce jour (pôle
// "Accompagnement business" volontairement vide, voir docs/DETTE.md),
// le second décrit la présence de bureaux, pas un service — ni l'un ni
// l'autre ne correspond à une ligne `services` existante (décision
// confirmée par Thierry le 06/09/2026, P10 lot 2).
const PILIER_SLUGS: Record<string, string> = {
  visa: "visa",
  digital: "digitalisation",
  financement: "financement",
  etudes: "etudes",
  assurance: "assurance",
  admin: "administratif",
};

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
 * Construit les 8 piliers : titre/description/lien dynamiques depuis
 * `services` pour les 6 qui ont une ligne réelle, valeurs en dur
 * conservées pour "business"/"reseau" (voir commentaire ci-dessus) et
 * pour tout ce que le repli d'erreur réseau/DB impose. Icône, ton,
 * tags et position bento restent des choix de design (P10 lot 2,
 * confirmé par Thierry) — jamais éditables depuis le CMS.
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
          href: `/services/${slug}`,
        };
      }
    }
  } catch (err) {
    console.error("[SERVICES_GRID] exception:", err);
  }

  return piliers;
}

// Map ton chromatique → classes (subtil, pas dominant)
const TONE_STYLES: Record<
  Tone,
  {
    iconBg: string;
    iconColor: string;
    glowHover: string;
    accent: string;
    borderHover: string;
    tagBg: string;
  }
> = {
  orange: {
    iconBg: "bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700",
    iconColor: "text-white",
    glowHover: "group-hover:bg-nexus-orange-500/20",
    accent: "text-nexus-orange-300",
    borderHover: "hover:border-nexus-orange-400/50",
    tagBg: "bg-nexus-orange-500/10 text-nexus-orange-200 border-nexus-orange-400/30",
  },
  tech: {
    iconBg:
      "bg-gradient-to-br from-sky-500/30 to-sky-700/20 ring-1 ring-sky-400/30",
    iconColor: "text-sky-300",
    glowHover: "group-hover:bg-sky-500/15",
    accent: "text-sky-300",
    borderHover: "hover:border-sky-400/40",
    tagBg: "bg-sky-500/10 text-sky-200 border-sky-400/30",
  },
  academic: {
    iconBg:
      "bg-gradient-to-br from-violet-500/30 to-violet-700/20 ring-1 ring-violet-400/30",
    iconColor: "text-violet-300",
    glowHover: "group-hover:bg-violet-500/15",
    accent: "text-violet-300",
    borderHover: "hover:border-violet-400/40",
    tagBg: "bg-violet-500/10 text-violet-200 border-violet-400/30",
  },
  secure: {
    iconBg:
      "bg-gradient-to-br from-emerald-500/30 to-emerald-700/20 ring-1 ring-emerald-400/30",
    iconColor: "text-emerald-300",
    glowHover: "group-hover:bg-emerald-500/15",
    accent: "text-emerald-300",
    borderHover: "hover:border-emerald-400/40",
    tagBg: "bg-emerald-500/10 text-emerald-200 border-emerald-400/30",
  },
  finance: {
    iconBg:
      "bg-gradient-to-br from-amber-500/30 to-amber-700/20 ring-1 ring-amber-400/30",
    iconColor: "text-amber-300",
    glowHover: "group-hover:bg-amber-500/15",
    accent: "text-amber-300",
    borderHover: "hover:border-amber-400/40",
    tagBg: "bg-amber-500/10 text-amber-200 border-amber-400/30",
  },
  navy: {
    iconBg: "bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900",
    iconColor: "text-white",
    glowHover: "group-hover:bg-nexus-blue-500/20",
    accent: "text-nexus-blue-300",
    borderHover: "hover:border-nexus-blue-400/40",
    tagBg: "bg-nexus-blue-500/15 text-nexus-blue-200 border-nexus-blue-400/30",
  },
  neutral: {
    iconBg:
      "bg-gradient-to-br from-slate-500/30 to-slate-700/20 ring-1 ring-slate-400/30",
    iconColor: "text-slate-300",
    glowHover: "group-hover:bg-slate-500/15",
    accent: "text-slate-300",
    borderHover: "hover:border-slate-400/40",
    tagBg: "bg-slate-500/10 text-slate-200 border-slate-400/30",
  },
  world: {
    iconBg:
      "bg-gradient-to-br from-teal-500/30 to-teal-700/20 ring-1 ring-teal-400/30",
    iconColor: "text-teal-300",
    glowHover: "group-hover:bg-teal-500/15",
    accent: "text-teal-300",
    borderHover: "hover:border-teal-400/40",
    tagBg: "bg-teal-500/10 text-teal-200 border-teal-400/30",
  },
};

const DOT_GRID_DARK: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at center, rgba(255,255,255,0.06) 1px, transparent 1px)",
  backgroundSize: "28px 28px",
};

export async function ServicesGrid() {
  const PILIERS = await getPiliers();

  return (
    <section
      id="services"
      className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24 lg:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={DOT_GRID_DARK}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-32 h-[36rem] w-[36rem] rounded-full bg-nexus-orange-500/12 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 bottom-32 h-[36rem] w-[36rem] rounded-full bg-nexus-blue-500/15 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/30 to-transparent"
      />

      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-nexus-orange-500/30 bg-nexus-orange-500/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md">
            <Sparkles className="h-3 w-3" />
            Notre écosystème
          </span>
          <h2 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl">
            Huit piliers d&rsquo;accompagnement,{" "}
            <span className="bg-gradient-to-r from-nexus-orange-400 via-nexus-orange-500 to-nexus-orange-600 bg-clip-text text-transparent">
              un seul interlocuteur
            </span>
            .
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            De la première démarche à l&rsquo;activation internationale.
            Chaque pilier est piloté avec la même méthode et le même niveau
            d&rsquo;exigence.
          </p>
        </div>

        {/* ─── Bento dense ─── */}
        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:gap-5">
          {/* Hero Visa — col-span-7 row-span-2 */}
          <HeroCard pilier={PILIERS.visa} />

          {/* 2 signatures verticales (col-span-5) */}
          <CompactSignatureCard pilier={PILIERS.digital} className="lg:col-span-5" />
          <CompactSignatureCard
            pilier={PILIERS.financement}
            className="lg:col-span-5"
          />

          {/* 2 signatures horizontales larges (col-span-6) */}
          <CompactSignatureWide
            pilier={PILIERS.business}
            className="lg:col-span-6"
          />
          <CompactSignatureWide
            pilier={PILIERS.reseau}
            className="lg:col-span-6"
          />

          {/* 3 simples compactes (col-span-4) */}
          <CompactSimpleCard pilier={PILIERS.etudes} className="lg:col-span-4" />
          <CompactSimpleCard
            pilier={PILIERS.assurance}
            className="lg:col-span-4"
          />
          <CompactSimpleCard pilier={PILIERS.admin} className="lg:col-span-4" />
        </div>

        {/* CTA fin de section */}
        <div className="mt-12 flex justify-center">
          <Link
            href="/services"
            className="group/cta relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl border border-white/15 bg-white/[0.05] px-7 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-nexus-orange-400/40 hover:bg-white/[0.08]"
          >
            Voir le détail des services
            <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// ─── Hero card — Visa (préservée) ──────────────────────────────────────────
// ============================================================================
function HeroCard({ pilier }: { pilier: Pilier }) {
  const Icon = pilier.icon;
  const tone = TONE_STYLES[pilier.tone];

  return (
    <Link
      href={pilier.href}
      className="group relative overflow-hidden rounded-3xl border border-nexus-orange-400/30 bg-gradient-to-br from-nexus-orange-500/12 via-white/[0.05] to-white/[0.02] ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_28px_60px_-24px_rgba(255,102,0,0.30)] transition-all duration-500 hover:-translate-y-1 hover:border-nexus-orange-400/60 sm:col-span-2 lg:col-span-7 lg:row-span-2"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-nexus-orange-500/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-nexus-blue-500/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-300/60 to-transparent"
      />

      <div className="relative flex h-full flex-col p-7 sm:p-8 lg:p-10">
        <div className="flex items-start justify-between gap-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-nexus-orange-500/30 bg-nexus-orange-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md">
            Pilier signature
          </span>
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl ${tone.iconBg} ${tone.iconColor} shadow-[0_10px_28px_-10px_rgba(255,102,0,0.7)] ring-1 ring-white/15 transition-transform duration-300 group-hover:scale-105`}
          >
            <Icon className="h-7 w-7" />
          </div>
        </div>

        <div className="mt-7 flex-1">
          <h3 className="font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.4rem]">
            {pilier.title}
          </h3>
          <p className="mt-4 max-w-md text-base leading-relaxed text-slate-300 sm:text-lg">
            {pilier.description}
          </p>
        </div>

        {/* Mini-KPIs */}
        <div className="mt-8 grid grid-cols-3 gap-3 border-t border-white/10 pt-6">
          <KpiPill value="Schengen" label="Standard UE" />
          <KpiPill value="Canada" label="IRCC" />
          <KpiPill value="e-Visa" label="50+ pays" />
        </div>

        <div className="mt-7 inline-flex items-center gap-2 self-start text-sm font-bold text-nexus-orange-300 transition-colors group-hover:text-nexus-orange-200">
          Découvrir
          <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

function KpiPill({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-center backdrop-blur">
      <p className="font-display text-xs font-bold text-white sm:text-sm">
        {value}
      </p>
      <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-white/55">
        {label}
      </p>
    </div>
  );
}

// ============================================================================
// ─── Compact signature card (vertical) — Digital + Financement ─────────────
// ============================================================================
function CompactSignatureCard({
  pilier,
  className,
}: {
  pilier: Pilier;
  className?: string;
}) {
  const Icon = pilier.icon;
  const tone = TONE_STYLES[pilier.tone];

  return (
    <Link
      href={pilier.href}
      className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.06] sm:p-6 ${tone.borderHover} ${className || ""}`}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-3xl transition-all duration-500 ${tone.glowHover}`}
      />
      <div className="relative flex h-full flex-col">
        {/* Header — icône + eyebrow */}
        <div className="flex items-start justify-between gap-3">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone.iconBg} ${tone.iconColor} transition-transform duration-300 group-hover:scale-105`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <span
            className={`text-[9px] font-bold uppercase tracking-[0.18em] ${tone.accent}`}
          >
            Signature
          </span>
        </div>

        {/* Titre */}
        <h3 className="mt-4 font-display text-lg font-bold leading-tight text-white sm:text-xl">
          {pilier.title}
        </h3>

        {/* Description courte */}
        <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-300">
          {pilier.description}
        </p>

        {/* 2 tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {pilier.tags.map((tag) => (
            <span
              key={tag}
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] backdrop-blur-md ${tone.tagBg}`}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Lien Découvrir */}
        <div
          className={`mt-4 inline-flex items-center gap-1.5 self-start text-xs font-semibold ${tone.accent} transition-colors`}
        >
          Découvrir
          <ArrowRight className="h-3 w-3 transition-transform duration-300 ease-out group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}

// ============================================================================
// ─── Compact signature wide (horizontal) — Accompagnement + Réseau ─────────
// ============================================================================
function CompactSignatureWide({
  pilier,
  className,
}: {
  pilier: Pilier;
  className?: string;
}) {
  const Icon = pilier.icon;
  const tone = TONE_STYLES[pilier.tone];

  return (
    <Link
      href={pilier.href}
      className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.06] sm:p-6 ${tone.borderHover} ${className || ""}`}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-nexus-orange-500/0 blur-3xl transition-all duration-500 ${tone.glowHover}`}
      />
      <div className="relative flex items-start gap-5">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tone.iconBg} ${tone.iconColor} transition-transform duration-300 group-hover:scale-105`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h3 className="font-display text-base font-bold leading-tight text-white sm:text-lg">
              {pilier.title}
            </h3>
            <span
              className={`text-[9px] font-bold uppercase tracking-[0.18em] ${tone.accent}`}
            >
              Signature
            </span>
          </div>

          <p className="mt-2 text-xs leading-relaxed text-slate-300 sm:text-sm">
            {pilier.description}
          </p>

          {/* 2 tags + Découvrir alignés */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {pilier.tags.map((tag) => (
              <span
                key={tag}
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] backdrop-blur-md ${tone.tagBg}`}
              >
                {tag}
              </span>
            ))}
            <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-white/85">
              <span className={tone.accent}>Découvrir</span>
              <ArrowRight
                className={`h-3 w-3 ${tone.accent} transition-transform duration-300 ease-out group-hover:translate-x-0.5`}
              />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ============================================================================
// ─── Compact simple — Études, Assurance, Administratifs ───────────────────
// ============================================================================
function CompactSimpleCard({
  pilier,
  className,
}: {
  pilier: Pilier;
  className?: string;
}) {
  const Icon = pilier.icon;
  const tone = TONE_STYLES[pilier.tone];

  return (
    <Link
      href={pilier.href}
      className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06] sm:p-6 ${className || ""}`}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/0 blur-2xl transition-all duration-500 group-hover:bg-white/5`}
      />
      <div className="relative flex h-full flex-col">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone.iconBg} ${tone.iconColor} transition-transform duration-300 group-hover:scale-105`}
        >
          <Icon className="h-4 w-4" />
        </div>

        <h3 className="mt-4 font-display text-base font-bold leading-tight text-white sm:text-lg">
          {pilier.title}
        </h3>
        <p className="mt-1.5 flex-1 text-xs leading-relaxed text-slate-400">
          {pilier.description}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {pilier.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/70 backdrop-blur"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-3 inline-flex items-center gap-1 self-start text-xs font-semibold text-white/85 transition-colors group-hover:text-nexus-orange-200">
          Découvrir
          <ArrowRight className="h-3 w-3 transition-transform duration-300 ease-out group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}
