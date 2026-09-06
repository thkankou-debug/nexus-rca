// ============================================================================
// LIB — Export CSV générique (BOM UTF-8 + champs entre guillemets)
// P6, lot Rapprochement/Exports. Même format que l'export déjà éprouvé de
// AgentStats.tsx (non partagé de là-bas pour ne pas toucher un fichier qui
// marche — voir CLAUDE.md), réutilisable par les nouveaux managers P6.
// ============================================================================

export function downloadCsv(filename: string, headers: string[], rows: string[][]): void {
  const csvContent = [
    headers.map((h) => `"${h}"`).join(","),
    ...rows.map((row) => row.map((c) => `"${(c ?? "").replace(/"/g, '""')}"`).join(",")),
  ].join("\n");

  const BOM = "﻿";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
