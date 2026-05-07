"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DownloadButtonProps {
  /** Endpoint qui retourne `{success, url}` (signed URL) */
  url: string;
  label?: string;
  variant?: "primary" | "secondary";
  className?: string;
}

export function DownloadButton({
  url,
  label = "Télécharger",
  variant = "secondary",
  className,
}: DownloadButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch(url);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Erreur");
      window.open(json.url, "_blank", "noopener,noreferrer");
    } catch (e) {
      console.error("[RH_DOWNLOAD_BTN]", e);
      alert((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const base =
    variant === "primary"
      ? "bg-nexus-orange-500 hover:bg-nexus-orange-600 text-white"
      : "border border-slate-200 bg-white hover:bg-slate-50 text-nexus-blue-950";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition disabled:opacity-60",
        base,
        className
      )}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {label}
    </button>
  );
}
