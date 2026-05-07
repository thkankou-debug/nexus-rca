"use client";

import { useRef, useState, type DragEvent } from "react";
import { Upload, FileCheck2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  accept?: string;
  maxSizeMb?: number;
  onSelect: (file: File) => void;
  /** Texte au-dessus de l'input (ex: "Contrat de travail") */
  label?: string;
  /** Texte d'aide (ex: "PDF, JPG, PNG · 10 Mo max") */
  hint?: string;
  /** Permet de réinitialiser depuis le parent — toggler tout simplement */
  resetSignal?: number;
}

const DEFAULT_ACCEPT = "application/pdf,image/jpeg,image/png,image/webp";

export function FileUploader({
  accept = DEFAULT_ACCEPT,
  maxSizeMb = 10,
  onSelect,
  label,
  hint,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file: File | null) => {
    setError(null);
    if (!file) {
      setSelected(null);
      return;
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`Fichier trop volumineux (max ${maxSizeMb} Mo)`);
      setSelected(null);
      return;
    }
    setSelected(file);
    onSelect(file);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    handleFile(file);
  };

  const reset = () => {
    setSelected(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      {label && (
        <label className="mb-2 block text-sm font-semibold text-nexus-blue-950">
          {label}
        </label>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center transition",
          dragOver
            ? "border-nexus-orange-400 bg-nexus-orange-50/40"
            : "border-slate-300 bg-slate-50/60 hover:border-nexus-orange-300 hover:bg-slate-50"
        )}
      >
        {selected ? (
          <div className="flex w-full items-center justify-between gap-3 rounded-xl bg-white p-3 shadow-sm">
            <div className="flex min-w-0 items-center gap-2">
              <FileCheck2 className="h-5 w-5 shrink-0 text-emerald-600" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-nexus-blue-950">
                  {selected.name}
                </p>
                <p className="text-xs text-slate-500">
                  {(selected.size / 1024).toFixed(0)} Ko
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={reset}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
              aria-label="Retirer le fichier"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
              <Upload className="h-5 w-5 text-nexus-orange-500" />
            </div>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-sm font-semibold text-nexus-blue-950 underline-offset-2 hover:text-nexus-orange-600 hover:underline"
            >
              Cliquez pour sélectionner un fichier
            </button>
            <p className="text-xs text-slate-500">
              {hint ?? `ou glissez-déposez · max ${maxSizeMb} Mo`}
            </p>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
      </div>

      {error && <p className="mt-2 text-xs font-semibold text-rose-600">{error}</p>}
    </div>
  );
}
