# Recette de bout en bout — Caisse Accueil (cahier §12, 12/09/2026)

Déroulée le 12/09/2026 en HTTP authentifié sur le build de production
local (données de TEST uniquement : `test.superadmin` opère,
`test.daf` valide — la session de test de la réceptionniste n'a pas été
touchée). Chaque ligne correspond à une exigence du point 12 du cahier.

| # | Exigence | Résultat |
|---|---|---|
| 1 | Connexion sans caisse ouverte | ✅ écran Caisse avec « Session à ouvrir » |
| 2 | Refus d'encaissement dans les deux modes | ✅ 409 « Caisse non ouverte » (les deux onglets passent par la même route) ; **ancienne porte** (insert direct `quick_sales` via REST, comme la Caisse rapide agent) : ✅ refusée par le trigger 091 `CAISSE_FERMEE` |
| 3 | Ouverture avec fonds initial | ✅ 10 000 FCFA + coupures {10000×1} + observation + poste enregistrés |
| 4 | Encaissement rapide | ✅ 3 000 FCFA espèces (remis 5 000, monnaie 2 000, net enregistré) |
| 5 | Encaissement depuis le catalogue | ✅ 2 000 FCFA Mobile Money (référence de confirmation exigée) |
| 6 | Deux opérations dans la MÊME session | ✅ journal de session : 2 mouvements, `session_id` identique (trigger 091) ; théorique 13 000 = 10 000 + 3 000 (le Mobile Money reste hors tiroir) |
| 7 | Création d'une facture PDF | ✅ FC-2026-000006 émise (20 000), PDF A4 200 `application/pdf` |
| 8 | Paiement partiel puis complémentaire | ✅ 8 000 puis 4 000 puis solde 8 000 → statut « réglée », reste 0 ; chaque règlement = un passage caisse relié (`invoice_id`) |
| 9 | Impression des reçus 80 mm | ⚠️ PDF 80 mm générés et valides (hauteur exacte 2 passes) ; **l'impression matérielle silencieuse reste EN ATTENTE des 4 prérequis imprimante** (modèle, connexion, OS, navigateur) — test n°8 de la série précédente toujours pendant |
| 10 | Rapprochement des opérations | ✅ ventilation §5 exacte : fonds 10 000 · espèces 23 000 · MM 2 000 (hors tiroir) · sortie de fonds 2 000 (motif + justificatif) → théorique 31 000 |
| 11 | Comptage de fermeture et écart | ✅ compté 30 500 → écart −500 calculé par le serveur |
| 12 | Soumission puis validation | ✅ écart sans justification : 400 ; justifié : soumis (`a_cloturer`) ; **self-validation : 403** (défaut détecté par cette recette puis corrigé — séparation des tâches sans exception) ; validation par le DAF : clôturée |
| 13 | Refus de tout nouvel encaissement dans la session terminée | ✅ 409 côté route + transactions FIGÉES en base (`SESSION_CLOTUREE` sur modification directe) |
| 14 | Concordance journal / rapport / vues | ✅ session en base : expected 31 000, actual 30 500, écart −500 ; rapport PDF 200 avec la même ventilation ; les vues financières lisent les mêmes `quick_sales` |

## Tests d'erreurs exigés

- **Erreur d'impression** : le paiement reste enregistré (l'impression est
  postérieure à l'enregistrement) ; état honnête « fenêtre bloquée —
  réessayez » ; réimpression = DUPLICATA, jamais un nouvel encaissement. ✅
- **Coupure réseau / double clic** : même `ticket_key` rejoué → 200
  `replayed=true`, résultat initial, aucun second paiement. ✅
- **Accès directs aux anciennes routes** : `/dashboard/accueil/encaissement`
  et `/pos` redirigent vers la Caisse unifiée ; l'insert SQL direct est
  refusé par le trigger. ✅
- **Opérations concurrentes** : deux règlements simultanés sur le même
  reste dû → 200 + 409 (verrou optimiste sur `total_regle`). ✅

## Défauts détectés PAR la recette et corrigés dans la foulée

1. **Self-validation de clôture possible** (le préparateur pouvait valider
   sa propre session) → `/close` refuse désormais (403) le titulaire de la
   session, super_admin compris.
2. **Justification d'écart effacée à la validation** (`/close` écrasait
   `notes`) → la justification de soumission est conservée, la remarque du
   valideur s'AJOUTE (« — Validation : … »). Vérifié : les deux textes
   coexistent après clôture.

## Reste en attente (hors périmètre logiciel)

- Impression thermique silencieuse : 4 prérequis matériels à fournir par
  Thierry (modèle exact, connexion, OS, navigateur).
- NIF/RCCM : à recopier dans `lib/facture-config.ts` dès attribution.
