"use client";

import { useEffect, useState } from "react";
import { Download, X, Smartphone } from "lucide-react";
import toast from "react-hot-toast";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "nexus-pwa-install-dismissed";
const DISMISS_DURATION_DAYS = 7;

export function PWAInstaller() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Detection iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(ios);

    // Detection mode standalone (deja installee)
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error - iOS Safari
      window.navigator.standalone === true;
    setIsStandalone(standalone);

    // Si deja installee, ne rien montrer
    if (standalone) return;

    // Verifier si on a deja dismiss recemment
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const daysSince =
        (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < DISMISS_DURATION_DAYS) return;
    }

    // ENREGISTRER LE SERVICE WORKER (necessaire pour l installation)
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js", { scope: "/" })
          .then((reg) => {
            console.log("[PWA] Service Worker enregistre :", reg.scope);
          })
          .catch((err) => {
            console.error("[PWA] Echec enregistrement SW :", err);
          });
      });
    }

    // Listener pour l evenement d installation Chrome/Edge/Android
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // iOS : montrer le bandeau apres 5s
    if (ios) {
      const timer = setTimeout(() => setShowBanner(true), 5000);
      window.addEventListener("appinstalled", () => {
        setShowBanner(false);
        setInstallPrompt(null);
        toast.success("Nexus RCA installé sur ton appareil 🎉");
      });
      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handler);
      };
    }

    // Listener post-installation
    window.addEventListener("appinstalled", () => {
      setShowBanner(false);
      setInstallPrompt(null);
      toast.success("Nexus RCA installé sur ton appareil 🎉");
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;

    if (choice.outcome === "accepted") {
      toast.success("Installation en cours...");
      setShowBanner(false);
    }

    setInstallPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, new Date().toISOString());
    setShowBanner(false);
  };

  // Si deja installee, rien a afficher
  if (isStandalone) return null;

  return (
    <>
      {/* Bandeau installation Chrome/Edge/Android */}
      {showBanner && installPrompt && !isIOS && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white shadow-2xl print:hidden">
          <div className="mx-auto flex max-w-3xl items-center gap-3 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-lg">
              <Smartphone className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-nexus-blue-950">
                Installer Nexus RCA
              </p>
              <p className="text-xs text-slate-600">
                Accès rapide depuis ton écran d'accueil, plein écran.
              </p>
            </div>
            <button
              type="button"
              onClick={handleInstall}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-nexus-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-nexus-orange-500/30 hover:bg-nexus-orange-600"
            >
              <Download className="h-4 w-4" />
              Installer
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="shrink-0 rounded-full p-2 text-slate-400 hover:bg-slate-100"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Bandeau iOS (instructions manuelles) */}
      {showBanner && isIOS && (
        <>
          <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white shadow-2xl print:hidden">
            <div className="mx-auto flex max-w-3xl items-center gap-3 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-lg">
                <Smartphone className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-nexus-blue-950">
                  Installer sur iPhone
                </p>
                <p className="text-xs text-slate-600">
                  Touche le bouton Partager puis "Sur l'écran d'accueil".
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSInstructions(true)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-nexus-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-nexus-orange-500/30 hover:bg-nexus-orange-600"
              >
                Voir comment
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="shrink-0 rounded-full p-2 text-slate-400 hover:bg-slate-100"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {showIOSInstructions && (
            <IOSInstructionsModal onClose={() => setShowIOSInstructions(false)} />
          )}
        </>
      )}
    </>
  );
}

function IOSInstructionsModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h3 className="font-display text-xl font-bold text-nexus-blue-950">
            Installer Nexus RCA sur iPhone
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <Step number={1} title="Touche le bouton Partager">
            <p className="text-sm text-slate-600">
              Le carré avec une flèche vers le haut, en bas de Safari.
            </p>
            <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2">
              <span className="text-2xl">⬆️</span>
              <span className="text-xs font-mono text-slate-700">Partager</span>
            </div>
          </Step>

          <Step number={2} title="Fais défiler et touche">
            <p className="text-sm text-slate-600">
              "Sur l'écran d'accueil"
            </p>
            <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2">
              <span className="text-2xl">➕</span>
              <span className="text-xs font-mono text-slate-700">
                Sur l'écran d'accueil
              </span>
            </div>
          </Step>

          <Step number={3} title="Confirme">
            <p className="text-sm text-slate-600">
              Touche "Ajouter" en haut à droite. L'icône Nexus apparaît sur ton
              écran d'accueil.
            </p>
          </Step>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-full bg-nexus-blue-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-nexus-blue-800"
        >
          J'ai compris
        </button>
      </div>
    </div>
  );
}

function Step({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-nexus-orange-500 text-sm font-bold text-white">
        {number}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-nexus-blue-950">{title}</p>
        {children}
      </div>
    </div>
  );
}
