"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Minus, Plus, Trash2, Send, ShoppingBag } from "lucide-react";
import {
  cartCount,
  CART_EVENT,
  clearCart,
  readCart,
  removeFromCart,
  setCartQty,
  type CartLine,
} from "@/lib/boutique-cart";
import { formatXaf, type BoutiqueOffre } from "@/lib/boutique";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export function CartView({
  offres,
  isAuthenticated,
}: {
  offres: BoutiqueOffre[];
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const [lines, setLines] = useState<CartLine[]>([]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const sync = () => setLines(readCart());
    sync();
    window.addEventListener(CART_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CART_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const bySlug = useMemo(() => {
    const m = new Map<string, BoutiqueOffre>();
    offres.forEach((o) => m.set(o.slug, o));
    return m;
  }, [offres]);

  const resolved = lines.map((l) => {
    const offre = bySlug.get(l.slug);
    return { line: l, offre };
  });
  const valid = resolved.filter(
    (r): r is { line: CartLine; offre: BoutiqueOffre } =>
      r.offre != null && r.offre.kind === "achetable" && Number(r.offre.tarif_montant) > 0
  );
  const stale = resolved.filter((r) => !r.offre || r.offre.kind !== "achetable");
  const total = valid.reduce(
    (s, r) => s + Number(r.offre.tarif_montant) * r.line.quantite,
    0
  );

  if (lines.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        tone="brand"
        title="Votre panier est vide"
        description="Parcourez le catalogue Nexus et ajoutez les prestations à tarif fixe."
        action={
          <Button href="/boutique" size="sm">
            Voir le catalogue
          </Button>
        }
      />
    );
  }

  const submit = async () => {
    if (!isAuthenticated) {
      router.push("/login?redirectTo=/panier");
      return;
    }
    if (valid.length === 0) {
      toast.error("Aucune offre achetable dans le panier");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/boutique/commandes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: valid.map((r) => ({
            slug: r.offre.slug,
            quantite: r.line.quantite,
          })),
          notes,
        }),
      });
      const json = (await res.json()) as {
        success?: boolean;
        error?: string;
        commande?: { id: string; reference: string };
      };
      if (!res.ok || !json.success || !json.commande) {
        toast.error(json.error || "Impossible de transmettre la commande");
        return;
      }
      clearCart();
      toast.success(`Commande ${json.commande.reference} transmise`);
      router.push(`/dashboard/client/commandes/${json.commande.id}`);
      router.refresh();
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-3 lg:col-span-2">
        {stale.length > 0 && (
          <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Certaines lignes ne sont plus achetable en ligne. Retirez-les pour continuer.
          </p>
        )}
        {resolved.map(({ line, offre }) => (
          <div
            key={line.slug}
            className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center"
          >
            <div className="min-w-0 flex-1">
              <p className="font-display text-base font-bold text-nexus-blue-950">
                {offre ? (
                  <Link href={`/boutique/${offre.slug}`} className="hover:underline">
                    {offre.nom}
                  </Link>
                ) : (
                  line.slug
                )}
              </p>
              <p className="text-sm text-slate-500">
                {offre && offre.kind === "achetable" && offre.tarif_montant != null
                  ? formatXaf(offre.tarif_montant, offre.devise)
                  : "Offre non achetable — retirez cette ligne"}
              </p>
            </div>
            {offre?.kind === "achetable" && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 hover:bg-slate-50"
                  onClick={() => setCartQty(line.slug, line.quantite - 1)}
                  aria-label="Diminuer"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center text-sm font-bold">{line.quantite}</span>
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 hover:bg-slate-50"
                  onClick={() => setCartQty(line.slug, line.quantite + 1)}
                  aria-label="Augmenter"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            )}
            <button
              type="button"
              className="inline-flex items-center gap-1.5 self-start rounded-full px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-red-600 sm:self-center"
              onClick={() => removeFromCart(line.slug)}
            >
              <Trash2 className="h-4 w-4" />
              Retirer
            </button>
          </div>
        ))}
      </div>

      <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold text-nexus-blue-950">Récapitulatif</h2>
        <p className="mt-1 text-sm text-slate-500">
          {cartCount(valid.map((v) => v.line))} article
          {cartCount(valid.map((v) => v.line)) > 1 ? "s" : ""}
        </p>
        <p className="mt-4 font-display text-3xl font-bold text-nexus-blue-950">
          {formatXaf(total)}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">
          Cette commande sera transmise à Nexus. Elle reste <strong>non payée</strong> tant
          qu’un encaissement réel n’est pas enregistré (caisse, devis ou facture).
        </p>
        <label className="mt-4 block text-xs font-bold uppercase tracking-wider text-slate-500">
          Note pour l’agence (optionnel)
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, 500))}
            rows={3}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-nexus-blue-950"
          />
        </label>
        <Button
          type="button"
          className="mt-4 w-full"
          disabled={submitting || valid.length === 0}
          onClick={submit}
        >
          <Send className="h-4 w-4" />
          {isAuthenticated ? "Transmettre la commande" : "Se connecter pour transmettre"}
        </Button>
      </aside>
    </div>
  );
}
