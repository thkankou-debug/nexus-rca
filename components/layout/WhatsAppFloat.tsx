"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";

const WHATSAPP_NUMBER = "15873276344";
const WHATSAPP_MESSAGE = "Bonjour Nexus, j'aimerais obtenir plus d'informations.";

export function WhatsAppFloat() {
  const [visible, setVisible] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  // Apparait apres un leger scroll (200px) pour ne pas dominer le hero
  useEffect(() => {
    const handler = () => {
      setVisible(window.scrollY > 200);
    };
    handler();
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Affiche le tooltip apres 4 secondes (une seule fois par session)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = sessionStorage.getItem("nexus_wa_tooltip_seen");
    if (seen || !visible) return;

    const timer = setTimeout(() => {
      setTooltipOpen(true);
      sessionStorage.setItem("nexus_wa_tooltip_seen", "1");
      // Auto-hide apres 5 secondes
      setTimeout(() => setTooltipOpen(false), 5000);
    }, 4000);

    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    WHATSAPP_MESSAGE
  )}`;

  return (
    <div className="fixed bottom-5 right-5 z-40 sm:bottom-6 sm:right-6">
      {/* Tooltip discret au-dessus du bouton */}
      {tooltipOpen && (
        <div className="absolute bottom-full right-0 mb-3 flex w-max max-w-[260px] items-start gap-2 rounded-2xl bg-white p-3 pr-2 shadow-lg ring-1 ring-slate-200 animate-in fade-in slide-in-from-bottom-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-nexus-blue-950">
              Une question ?
            </p>
            <p className="mt-0.5 text-xs text-slate-600">
              Notre équipe répond rapidement sur WhatsApp.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setTooltipOpen(false)}
            className="shrink-0 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Fermer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          {/* Petite fleche en bas du tooltip */}
          <div className="absolute -bottom-1.5 right-6 h-3 w-3 rotate-45 bg-white ring-1 ring-slate-200" />
        </div>
      )}

      {/* Bouton flottant — taille reduite, design premium */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="Contacter Nexus sur WhatsApp"
        className="group flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white shadow-md ring-1 ring-green-600/20 transition-all hover:scale-105 hover:bg-green-600 hover:shadow-lg sm:h-14 sm:w-14"
      >
        <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
        {/* Petit point pulsant pour indiquer la disponibilite */}
        <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-green-400 ring-2 ring-white" />
        </span>
      </a>
    </div>
  );
}
