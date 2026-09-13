// L2 — donnees TEST_ (is_test). Voir BRIEF_L2_L3_POUR_CLAUDE_CODE.md et
// migration 074.
//
// Il n'y a PAS de helper générique excludeTestRows() ici : une première
// version en avait un, mais faire porter le type réel d'un query builder
// Postgrest (très profondément générique) à travers une fonction générique
// fait exploser l'instanciation de type de TypeScript (TS2589) — de façon
// non déterministe selon le cache incrémental (`tsc --noEmit` peut passer
// alors que `next build`, qui repart d'un état propre, échoue sur le même
// code). Reproduit sur plusieurs formes de contrainte generique, y compris
// des contraintes très permissives. La règle appliquée à la place : chaque
// requête d'agrégation ajoute `.eq("is_test", false)` inline — même colonne,
// même valeur partout, juste pas de couche d'indirection générique.

/**
 * Un utilisateur ne peut voir les donnees de test que s'il est super_admin
 * ET a explicitement demande `?includeTest=1`. Non memorise entre sessions
 * (le paramètre doit être répété à chaque navigation).
 */
export function canIncludeTestData(
  role: string | null | undefined,
  searchParams: URLSearchParams | { get(name: string): string | null }
): boolean {
  return role === "super_admin" && searchParams.get("includeTest") === "1";
}
