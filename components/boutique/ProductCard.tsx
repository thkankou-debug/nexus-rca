import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { BoutiqueOffre } from "@/lib/boutique";
import { formatXaf, KIND_LABEL } from "@/lib/boutique";
import { AddToCartButton } from "@/components/boutique/AddToCartButton";
import { ServiceCover } from "@/components/services/ServiceCover";
import { cn } from "@/lib/utils";

export function ProductCard({ offre }: { offre: BoutiqueOffre }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <Link href={`/boutique/${offre.slug}`} className="block">
        <div className="relative">
          <ServiceCover
            slug={offre.slug}
            categorie={offre.categorie}
            className="h-44 w-full rounded-none aspect-auto"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-nexus-blue-950/75 via-nexus-blue-950/15 to-transparent"
          />
          <span className="absolute bottom-4 left-5 rounded-full border border-brand/40 bg-brand/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand backdrop-blur-sm">
            {KIND_LABEL[offre.kind]}
          </span>
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {offre.categorie}
        </p>
        <h2 className="mt-1 font-display text-lg font-bold text-nexus-blue-950">
          <Link href={`/boutique/${offre.slug}`} className="hover:text-nexus-blue-800">
            {offre.nom}
          </Link>
        </h2>
        {offre.description && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">
            {offre.description}
          </p>
        )}
        <div className="mt-auto pt-4">
          {offre.kind === "achetable" && offre.tarif_montant != null ? (
            <p className="mb-3 font-display text-xl font-bold text-nexus-blue-950">
              {formatXaf(offre.tarif_montant, offre.devise)}
            </p>
          ) : (
            <p className="mb-3 text-sm font-semibold text-slate-500">
              {offre.kind === "devis" ? "Tarif établi sur devis" : "Nous écrire pour cette offre"}
            </p>
          )}
          {offre.kind === "achetable" ? (
            <AddToCartButton slug={offre.slug} nom={offre.nom} size="sm" />
          ) : (
            <Link
              href={
                offre.kind === "devis"
                  ? `/demande/complet?service=${encodeURIComponent(offre.slug)}`
                  : "/contact"
              }
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full bg-nexus-blue-950 px-4 py-2 text-sm font-semibold text-white hover:bg-nexus-blue-900"
              )}
            >
              {offre.kind === "devis" ? "Demander un devis" : "Nous contacter"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}