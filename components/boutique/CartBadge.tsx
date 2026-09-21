"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { cartCount, CART_EVENT, readCart } from "@/lib/boutique-cart";
import { cn } from "@/lib/utils";

export function CartBadge({ inverted = false }: { inverted?: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => setCount(cartCount(readCart()));
    sync();
    window.addEventListener(CART_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CART_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <Link
      href="/panier"
      className={cn(
        "relative inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors",
        inverted
          ? "text-white hover:bg-white/10"
          : "text-nexus-blue-950 hover:bg-slate-100"
      )}
      aria-label={count > 0 ? `Panier, ${count} article${count > 1 ? "s" : ""}` : "Panier"}
    >
      <ShoppingBag className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-on-brand">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
