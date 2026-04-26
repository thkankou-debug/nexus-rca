import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { NEXUS_CONTACT } from "@/lib/contact";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatShortDate(date: string | Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

// ============================================================================
// WHATSAPP — utilise le numero RCA principal par defaut
// ============================================================================
// Le numero peut etre surcharge via NEXT_PUBLIC_WHATSAPP_NUMBER (Vercel env)
// Sinon, fallback sur le numero RCA centralise dans lib/contact.ts
// ============================================================================
export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || NEXUS_CONTACT.phoneRcaRaw;

/**
 * Construit un lien WhatsApp avec un message pre-rempli
 * IMPORTANT : utilise toujours WHATSAPP_NUMBER (numero RCA par defaut)
 */
export const whatsappLink = (message: string) => {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};
