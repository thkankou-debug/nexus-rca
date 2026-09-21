"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ShoppingBag } from "lucide-react";
import { addToCart } from "@/lib/boutique-cart";
import { Button } from "@/components/ui/Button";

export function AddToCartButton({
  slug,
  nom,
  size = "md",
}: {
  slug: string;
  nom: string;
  size?: "sm" | "md" | "lg";
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <Button
      type="button"
      size={size}
      disabled={busy}
      onClick={() => {
        setBusy(true);
        addToCart(slug, 1);
        toast.success(`${nom} ajouté au panier`);
        setBusy(false);
        router.refresh();
      }}
    >
      <ShoppingBag className="h-4 w-4" />
      Ajouter au panier
    </Button>
  );
}
