"use client";

export interface CartLine {
  slug: string;
  quantite: number;
}

const KEY = "nexus-boutique-cart-v1";
const EVENT = "nexus-boutique-cart";

export function readCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((row) => {
        const slug = typeof row?.slug === "string" ? row.slug.trim() : "";
        const quantite = Number(row?.quantite);
        if (!slug || !Number.isInteger(quantite) || quantite < 1) return null;
        return { slug, quantite: Math.min(quantite, 99) };
      })
      .filter((x): x is CartLine => x !== null)
      .slice(0, 20);
  } catch {
    return [];
  }
}

function persist(items: CartLine[]) {
  window.localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EVENT));
}

export function addToCart(slug: string, quantite = 1): CartLine[] {
  const clean = slug.trim();
  const qty = Math.min(99, Math.max(1, Math.floor(quantite)));
  const items = readCart();
  const i = items.findIndex((l) => l.slug === clean);
  if (i >= 0) {
    items[i] = { slug: clean, quantite: Math.min(99, items[i].quantite + qty) };
  } else {
    if (items.length >= 20) return items;
    items.push({ slug: clean, quantite: qty });
  }
  persist(items);
  return items;
}

export function setCartQty(slug: string, quantite: number): CartLine[] {
  const items = readCart();
  const next =
    quantite < 1
      ? items.filter((l) => l.slug !== slug)
      : items.map((l) =>
          l.slug === slug
            ? { slug, quantite: Math.min(99, Math.max(1, Math.floor(quantite))) }
            : l
        );
  persist(next);
  return next;
}

export function removeFromCart(slug: string): CartLine[] {
  const next = readCart().filter((l) => l.slug !== slug);
  persist(next);
  return next;
}

export function clearCart(): void {
  persist([]);
}

export function cartCount(items: CartLine[]): number {
  return items.reduce((s, l) => s + l.quantite, 0);
}

export const CART_EVENT = EVENT;
