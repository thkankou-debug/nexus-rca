"use client";

import { useRef, useState, type DragEvent } from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileDropProps {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  hint?: string;
  className?: string;
}

export function FileDrop({ onFiles, accept, multiple = false, hint, className }: FileDropProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) onFiles(multiple ? files : [files[0]]);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      role="button"
      tabIndex={0}
      className={cn(
        "flex cursor-pointer flex-col items-center rounded-sm border border-dashed px-6 py-8 text-center transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
        isDragging ? "border-brand bg-brand-subtle/40" : "border-line-strong bg-surface-sunken",
        className
      )}
    >
      <UploadCloud className="h-6 w-6 text-ink-subtle" aria-hidden />
      <p className="mt-2 text-body-sm font-medium text-ink">
        Glissez un fichier ici, ou cliquez pour parcourir
      </p>
      {hint && <p className="mt-1 text-caption text-ink-muted">{hint}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length > 0) onFiles(files);
        }}
      />
    </div>
  );
}
