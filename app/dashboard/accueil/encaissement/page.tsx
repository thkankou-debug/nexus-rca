import { redirect } from "next/navigation";

// Reprise Accueil & caisse (12/09/2026) : l'Encaissement libre est devenu
// l'onglet « Encaissement rapide » de la Caisse unifiée — une seule caisse,
// une seule session, deux modes de saisie. L'URL reste servie : aucune
// ancienne route ne mène à un écran mort ni ne contourne le gate d'ouverture.
export default function EncaissementRedirect() {
  redirect("/dashboard/accueil/caisse");
}
