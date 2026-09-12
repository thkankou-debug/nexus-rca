# Addendum au cahier des charges — Caisse ouverte à toutes les prestations

> Instruction de Thierry F. Kankou, 12/09/2026. Ce texte **complète et
> corrige** toute formulation antérieure du cahier des charges qui
> limiterait l'encaissement aux prestations du catalogue, aux huit pôles,
> aux pages du site, ou qui exigerait systématiquement un devis approuvé et
> un dossier préalable. Il tranche également la question ouverte AR-04 sur
> le statut de l'« encaissement libre » : **autorisé pour la réceptionniste
> habilitée**, prix saisi librement, sans blocage.

## A. Exigence normative (reprise intégrale des 7 points)

1. **La caisse couvre toutes les activités de NEXUS RCA** — pressing,
   pressing avec repassage, scan/numérisation, saisie et mise en forme de
   textes, traduction, photocopies, plastification, location de matériel,
   et toute prestation ponctuelle ou ajoutée progressivement. Liste
   évolutive : jamais limitée aux huit pôles, aux pages du site ou au
   catalogue enregistré.
2. **Deux possibilités d'encaissement** : prestation du catalogue (tarif
   pré-rempli quand il existe) OU prestation libre (libellé explicite,
   description si nécessaire, quantité, prix unitaire, total). Une
   prestation libre ne crée jamais de page publique et ne modifie pas le
   catalogue officiel.
3. **Vente simple au comptoir** : encaissement rapide pour un client de
   passage sans compte ; rattachement à une fiche client, un dossier, une
   facture ou une commande seulement quand c'est utile. Pas de faux profil
   « Client comptoir » : une vente de passage s'enregistre sans fiche
   nominative, retrouvable par sa référence de transaction.
4. **Ticket multi-lignes** avec calcul du montant ; acompte puis règlement
   complémentaire avec suivi du reste dû quand nécessaire. Pour les
   locations : la **caution remboursable n'est pas une recette**.
5. **Reçu pour chaque paiement** : identité NEXUS RCA, référence unique,
   date/heure, caisse et opératrice, détail des prestations, montant et
   moyen, reste dû s'il existe, remis/monnaie pour les espèces, identité
   client si renseignée. Imprimable, PDF, réimprimable depuis l'historique
   sans nouvel encaissement. Une transaction électronique non confirmée ne
   produit pas un reçu affirmant la confirmation.
6. **Caisse ouverte = capable d'encaisser tout**, MAIS session quotidienne,
   fonds initial, journal, comptage et clôture restent obligatoires. Chaque
   encaissement (y compris libre) alimente : journal de caisse, session,
   suivi comptable, vues financières DAF/direction, fiche client/dossier si
   rattaché. Doubles encaissements prévenus, saisie ≠ validation,
   corrections/remboursements tracés, aucun paiement effacé.
7. **Catalogue de prestations internes** dans les paramètres, avec
   **visibilité publique indépendante** : un service peut être vendu à
   l'agence sans être publié sur le site.

**Critère d'acceptation (CA-1)** : session ouverte → la réceptionniste
saisit une prestation absente du catalogue, encaisse, imprime le reçu —
sans développeur ni page service — et l'opération se retrouve dans la
caisse et les espaces financiers autorisés.

## B. État de conformité au 12/09/2026 (vérifié dans le dépôt)

| Point | État | Détail |
|---|---|---|
| 1 · Caisse universelle | **Conforme** | « Encaissement libre — autre service Nexus RCA » au POS (11/09) : libellé + montant libres, même circuit quick_sales/session/reçu. Aucune contrainte catalogue/pôle sur la route. |
| 2 · Catalogue OU libre | **Conforme (à enrichir)** | Catalogue ✔ (tarif pré-rempli si `fixe`) ; libre ✔ mais la saisie initiale ne propose pas description ni quantité (modifiables ensuite sur la ligne pour la quantité). Aucune création de page publique ni écriture au catalogue ✔. |
| 3 · Vente de passage | **Conforme** | Le POS encaisse SANS client sélectionné (aucune fiche créée) ; `quick_sales.reference` (séquence) = référence de transaction ; rattachements fiche (`client_record_id`) et dossier (`demande_id`) optionnels et explicites. Aucun profil fictif. |
| 4 · Multi-lignes | **Partiel** | Multi-lignes ✔ (quantités, prix, total, clé de ticket). **Acompte/reste dû comptoir : absent** (G2). **Caution de location : absente** (G3). |
| 5 · Reçu complet | **Partiel** | Référence, date/heure, identité NEXUS, détail lignes, total, moyen, remis/monnaie espèces, client si renseigné, opératrice, réimpression DUPLICATA depuis la base ✔. **Manquent : identification du poste de caisse** (AR-05 — aucun poste physique modélisé) **et reste dû** (dépend G2). Électronique : la confirmation vérifiée est exigée AVANT encaissement — aucun reçu ne peut donc affirmer une confirmation absente ✔. |
| 6 · Traçabilité | **Conforme (1 trou mineur)** | Journal ✔ session ✔ Trésorerie/Pilotage (ventes comptoir distinctes des paiements validés) ✔ fiche client/dossier ✔ idempotence ✔ soumission ≠ clôture ✔ aucune suppression ✔. **Trou G6 : l'écran « Saisie du jour » du comptable n'affiche pas les ventes comptoir du jour.** Remboursements : non construits (AR-04, inchangé). |
| 7 · Visibilité publique indépendante | **Non conforme** | `services.status='actif'` implique aujourd'hui la lecture publique (policy P8). Il manque un drapeau de **publication publique distinct** (G5) pour vendre à l'agence sans publier sur le site. |
| CA-1 | **Satisfait dès aujourd'hui** | Parcours complet livré (11-12/09). Preuve d'insertion en SQL annulé ; le déroulé visuel appartient à la recette de Thierry (pas de test d'écriture réel : `quick_sales` n'a pas de colonne is_test — voir G7). |

## C. Écarts construits — phase « Caisse ouverte » LIVRÉE le 12/09/2026 (GO Thierry ; décision : la réceptionniste rembourse la caution, traçabilité complète)

**G1 (livré) — Prestation libre enrichie** (léger, aucun schéma) : le formulaire
d'encaissement libre gagne description (optionnelle) et quantité dès la
saisie. Libellé explicite exigé.

**G2 (livré) — Acompte et reste dû au comptoir** (schéma, proposition §14.2) :
table `pos_credits` — 1 ligne = 1 créance de comptoir ouverte par un
ticket partiellement réglé : `ticket_key`, client éventuel, total dû,
somme des règlements (chaque règlement = une ligne `quick_sales` reliée),
statut (ouverte/soldee), jamais supprimée. Le reçu porte le reste dû ; un
règlement complémentaire recharge la même créance (pas de seconde
créance — règle « charger une facture existante ne crée pas une seconde
créance » étendue au comptoir). Verrou : deux règlements concurrents ne
dépassent jamais le total (même patron que CAI-05/R09).

**G3 (livré) — Caution de location** (schéma) : `quick_sales.nature`
(`prestation` par défaut | `caution` | `caution_remboursement`). Une
caution entre dans le TIROIR (espèces théoriques) mais **jamais dans les
recettes** (Trésorerie/Pilotage/rapports l'excluent explicitement) ; son
remboursement est un mouvement compensatoire lié à l'original, borné au
montant remboursable. Affichée à part sur le reçu.

**G4 (reste lié à AR-05) — Reçu : poste de caisse** : dépend d'AR-05 (postes physiques non
modélisés). En attendant : le reçu porte déjà l'opératrice ; la mention
de poste sera ajoutée avec AR-05.

**G5 (livré) — Catalogue interne / visibilité publique indépendante** (schéma +
retouches publiques) : `services.visibilite_publique boolean NOT NULL
DEFAULT true` (backfill true = comportement actuel inchangé). La policy
publique et les consommateurs publics (pages /services, grille d'accueil)
ne lisent que `actif AND visibilite_publique` ; le POS et l'écran
« Services et tarifs » lisent tout ce qui est `actif`. Les prestations de
proximité (pressing, photocopies, plastification, traduction, location…)
pourront alors être créées comme services INTERNES par Thierry dans
l'écran Services et tarifs — tarif pré-rempli au POS — sans jamais
apparaître sur le site. Aucune ligne créée par le développement (règle
« aucune prestation inventée »).

**G6 (livré) — Ventes comptoir dans « Saisie du jour »** (léger) : bloc lecture
des quick_sales du jour chez le comptable (suivi comptable, point 6).

**G7 (livré, R25 automatisable) — Recette** : scénario **R25 = CA-1** ajouté au cahier de recette,
plus `quick_sales.is_test` (colonne additive) pour pouvoir dérouler R25
avec le compte de test sans polluer la caisse réelle — même règle L2 que
les 8 tables déjà couvertes.

Ordre proposé : G1+G6+G7 (légers, sans risque) → G5 (catalogue interne)
→ G2+G3 (acompte/caution — le plus structurant). Chaque migration
proposée reste additive, RLS dès création, aucune donnée supprimée.

## D. Impact permissions / recette

- Aucune permission nouvelle pour G1/G5/G6 : `paiement.record` couvre
  l'encaissement libre (décision de ce jour — la « tension AR-04 » notée
  dans AUDIT_CDC est levée pour la saisie libre ; restent ouverts dans
  AR-04 : remises, remboursements, trop-perçu).
- G2/G3 : `paiement.record` pour encaisser un règlement/acompte ; le
  remboursement de caution suivra la règle générale des remboursements
  (autorisation préalable — AR-04) ou, à défaut d'arbitrage, sera réservé
  à la même opératrice avec traçabilité complète — à trancher au GO.
- Recette : R11 (paiement partiel) deviendra exécutable après G2 ; R25
  après G7.
