// ============================================================================
// INSTANT DE RÉFÉRENCE — R19 (cahier §18, 13/09/2026)
// « Chiffre puis clic vers la liste : égalité exacte au même instant de
// référence. » Les pages serveur calculent compteurs ET listes dans le même
// rendu (mêmes requêtes, même transaction de lecture) ; ce composant rend
// cet instant EXPLICITE à l'écran : l'utilisateur sait à quel moment les
// chiffres ont été figés, et un écart après navigation s'explique par le
// temps, pas par une incohérence. Server-safe (aucun hook).
// ============================================================================

export function DataTimestamp({ date = new Date() }: { date?: Date }) {
  const stamp = date.toLocaleString("fr-FR", {
    timeZone: "Africa/Bangui",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return (
    <p className="text-caption text-ink-subtle">
      Données au {stamp} (Bangui) — compteurs et listes calculés au même instant ;
      rechargez pour actualiser.
    </p>
  );
}
