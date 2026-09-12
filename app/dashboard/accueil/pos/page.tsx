import { redirect } from "next/navigation";

// Reprise Accueil & caisse (12/09/2026) : le Comptoir POS est devenu
// l'onglet « Vente catalogue (POS) » de la Caisse unifiée — même session,
// même journal, mêmes règles. L'URL reste servie : aucune ancienne route ne
// mène à un écran mort ni ne contourne le gate d'ouverture.
export default function PosRedirect() {
  redirect("/dashboard/accueil/caisse?onglet=catalogue");
}
