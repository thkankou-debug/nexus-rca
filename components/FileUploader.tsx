"use client";

import { useState, useRef } from "react";
import { Upload, X, FileText, Image as ImageIcon, File } from "lucide-react";
import toast from "react-hot-toast";
import {
  FILE_ALLOWED_EXTENSIONS,
  FILES_MAX_COUNT,
  FILE_MAX_SIZE_MB,
  formatFileSize,
  validateFile,
} from "@/lib/demande-form";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
}

function iconForFile(file: File) {
  if (file.type.startsWith("image/")) return ImageIcon;
  if (file.type === "application/pdf") return FileText;
  return File;
}

export function FileUploader({ files, onChange, disabled }: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const addFiles = (incoming: FileList | File[]) => {
    const arr = Array.from(incoming);
    const accepted: File[] = [];
    const rejected: string[] = [];

    for (const f of arr) {
      if (files.length + accepted.length >= FILES_MAX_COUNT) {
        rejected.push(`${f.name} (max ${FILES_MAX_COUNT} fichiers)`);
        continue;
      }
      // Dédup sur nom+taille
      if (
        files.some((ex) => ex.name === f.name && ex.size === f.size) ||
        accepted.some((ex) => ex.name === f.name && ex.size === f.size)
      ) {
        rejected.push(`${f.name} (déjà ajouté)`);
        continue;
      }
      const v = validateFile(f);
      if (!v.valid) {
        rejected.push(`${f.name} : ${v.error}`);
        continue;
      }
      accepted.push(f);
    }

    if (accepted.length > 0) {
      onChange([...files, ...accepted]);
      toast.success(
        `${accepted.length} fichier${accepted.length > 1 ? "s" : ""} ajouté${
          accepted.length > 1 ? "s" : ""
        }`
      );
    }
    if (rejected.length > 0) {
      toast.error(rejected.slice(0, 3).join(" · "));
    }
  };

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!disabled) setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragActive(false);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragActive(false);
          if (disabled) return;
          if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
        }}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all",
          dragActive
            ? "border-nexus-orange-500 bg-nexus-orange-50"
            : "border-slate-300 bg-slate-50 hover:border-nexus-orange-400 hover:bg-nexus-orange-50/50",
          disabled && "pointer-events-none opacity-60"
        )}
      >
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
          <Upload className="h-5 w-5 text-nexus-orange-600" />
        </div>
        <p className="text-sm font-semibold text-nexus-blue-950">
          Cliquez ou glissez vos fichiers ici
        </p>
        <p className="mt-1 text-xs text-slate-500">
          PDF, JPG, PNG, DOC, DOCX · max {FILE_MAX_SIZE_MB} Mo par fichier · {FILES_MAX_COUNT} fichiers max
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={FILE_ALLOWED_EXTENSIONS.join(",")}
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            // Reset pour permettre de re-sélectionner le même fichier après suppression
            e.target.value = "";
          }}
          disabled={disabled}
        />
      </div>

      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((file, i) => {
            const Icon = iconForFile(file);
            return (
              <li
                key={`${file.name}-${file.size}-${i}`}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-nexus-blue-50 text-nexus-blue-700">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-nexus-blue-950">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  disabled={disabled}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40"
                  aria-label={`Retirer ${file.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
