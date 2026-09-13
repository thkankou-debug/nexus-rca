# Décisions AR-01 → AR-07 — registre consolidé (13/09/2026)

> Thierry a donné GO le 13/09/2026 pour trancher les points restants avec
> les défauts les plus sûrs. Chaque décision ci-dessous est APPLIQUÉE (ou
> documentée comme procédure) et reste révocable par une nouvelle décision
> explicite de Thierry. Les décisions déjà actées avant ce jour sont
> rappelées pour que ce fichier soit LE registre unique.

## AR-01 — Exclusivité de l'encaissement (acté le 12/09)
La réception est le seul point d'encaissement humain ; identifiant de rôle
`accueil_caisse` définitif. Renforcé depuis au niveau BASE (trigger 091 :
aucun encaissement sans session ouverte, quelle que soit la porte).

## AR-02 / AR-05 — Titulaires, suppléants, délégations, postes (tranché 13/09)
- **Un seul poste de caisse physique : « Réception »** (valeur par défaut
  de `caisse_sessions.poste`). Un second poste ne sera modélisé que si
  l'agence en ouvre un réellement.
- **Remplacement de la réceptionniste** : la remplaçante utilise SON
  PROPRE compte `accueil_caisse` (créé par l'admin dans Utilisateurs) et
  ouvre SA PROPRE session — **le partage de compte est interdit** (toute
  la traçabilité repose sur l'identité de session). La titulaire absente
  soumet sa session avant son départ quand c'est possible ; sinon la
  session « interrompue » est signalée à sa reconnexion (bandeau) et
  clôturée en priorité.
- **Délégations nominatives bornées** (ex. le DAF délègue la validation) :
  **non modélisées pour l'instant** — l'agence a une personne par rôle ;
  en absence du DAF, le super-admin (personne distincte du préparateur,
  règle 403 inchangée) valide. Une table de délégations sera proposée si
  le besoin réel apparaît. Décision par défaut : la sécurité avant la
  flexibilité.

## AR-03 — Canoniques (acté le 13/09)
Statuts financiers `déclaré → rapproché → validé` (D6) et fiche client
canonique `clients` (D7) : **DÉFINITIFS**.

## AR-04 — Remises, remboursements, frais de tiers (acté le 13/09)
- **Aucune remise en caisse.** Toute réduction ou remboursement de
  PRESTATION passe par un **avoir tracé** (module factures de comptoir :
  motif obligatoire, plafonné au reste dû, la facture d'origine reste
  intacte). Les paiements encaissés ne s'annulent jamais par avoir.
- **Cautions** : remboursables en espèces à la réception (bornées au
  montant reçu, session ouverte, tracées — G3 caution, 12/09).
- **Trop-perçu** : rendu en monnaie immédiatement (montants stockés nets) ;
  aucun trop-perçu conservé.
- **« Frais de tiers » / débours** : non modélisés — chaque prestation
  facturée est une prestation NEXUS. Si des débours réels apparaissent
  (frais consulaires avancés…), une catégorie dédiée sera proposée avant
  tout enregistrement. Pas de taxe ni TVA (12/09) ; NIF/RCCM attendus
  (lib/facture-config.ts).

## AR-06 — Portées de lecture officielles (tranché 13/09)
Les portées IMPLÉMENTÉES deviennent la règle officielle (miroir exact des
écrans livrés) :
| Rôle | Portée |
|---|---|
| super_admin / admin | Global (opérations + supervision) |
| dg | LECTURE globale (dossiers, paiements, RDV, indicateurs) — aucune saisie opérationnelle |
| daf | Finance globale (paiements, sessions, dépenses) + validation ; demande de correction |
| comptable | Saisie & rapprochement des paiements ; lecture de ses files |
| chef_service | Son PÔLE uniquement (mapping POLE_TO_CATEGORIES), recherche comprise |
| agent | Ses dossiers/RDV/paiements ; acceptation d'affectation |
| accueil_caisse | Réception + SA caisse + factures courantes + agenda équipe (sans notes confidentielles) |
| partenaire | Dossiers PARTAGÉS uniquement (révocation immédiate) ; partage = acte admin/super_admin |
| moderateur | Contenus/FAQ/témoignages |
| client | Ses propres données |

## AR-07 — Bascule production & mesures §16 (tranché 13/09)
**Critères de GO production (tous remplis sauf le dernier)** :
1. ✅ `tsc` + `next build` 0 erreur ;
2. ✅ Recette caisse de bout en bout 14/14 (docs/RECETTE_CAISSE_F.md) ;
3. ✅ Recette formelle R01→R24 : 24/24 (R19 clôturé le 13/09 — instant de
   référence affiché sur Vue d'ensemble/Trésorerie/Pilotage/Compta) ;
4. ✅ Migrations 018→099 toutes committées ET appliquées ;
5. ⏳ **GO explicite de Thierry** — procédure : tag de sauvegarde
   `backup-pre-v3-<date>` sur main → merge → push → vérification
   post-déploiement (connexion des 11 profils + pages clés en 200 sur
   www.nexusrca.com) → en cas de problème : `git revert` du merge (ou
   redéploiement du tag depuis Vercel). Fenêtre conseillée : hors heures
   d'ouverture de l'agence (soir, heure de Bangui).

**Mesures §16 (13/09, build de production)** — poids first-load des pages
clés : Caisse 404 kB (la plus lourde — pdf-lib embarqué pour les reçus,
assumé), Factures 391 kB (idem), Agenda 184 kB, Trésorerie 184 kB,
Compta 182 kB, Vue d'ensemble 177 kB, Pilotage 175 kB, Agent 101 kB.
Objectif de reprise : garder les nouvelles pages < 200 kB hors modules
PDF. **Responsive/WCAG outillés** : non mesurables depuis cet
environnement — procédure manuelle pour Thierry : ouvrir la préversion
sur téléphone (360 px), vérifier Caisse/Session/Factures/Agenda (aucun
défilement horizontal, boutons atteignables au pouce) ; les écrans neufs
utilisent des grilles fluides et ont été conçus pour 360→1440.

## Fusion des registres de factures (tranché 13/09)
**Deux registres MAINTENUS** : `FAC-` (factures de dossier — devis,
espace client) et `FC-`/`AV-` (factures de comptoir — caisse). Séries
distinctes = lecture comptable claire, aucun risque sur l'historique ;
une fusion n'apporterait rien d'opérationnel aujourd'hui.

## MFA (SEC-02) — choix du mécanisme (tranché 13/09, activation différée)
Mécanisme retenu : **TOTP via Supabase Auth MFA** (application
d'authentification), à imposer aux rôles super_admin, admin, daf.
**Non activé** : l'activation change les accès réels (risque de
verrouillage) — elle sera implémentée et déployée sur GO explicite,
avec procédure d'enrôlement accompagnée.

## Données toujours attendues de Thierry
- Imprimante 80 mm : modèle exact, connexion (USB/réseau/Bluetooth), OS
  du poste, navigateur → active l'impression silencieuse + test n°8.
- NIF et RCCM → à recopier dans `lib/facture-config.ts`.
