# Recette formelle R01→R24 (cahier §18) — consolidée le 13/09/2026

> Chaque scénario : méthode, preuve datée, statut. Les preuves « HTTP » sont
> rejouées sur le build de production local avec les comptes de TEST
> (docs/COMPTES_TEST.md) ; les preuves « SQL » sont des simulations
> DO+ROLLBACK sans trace ; les renvois pointent des recettes antérieures
> datées (docs/RECETTE_CDC.md du 12/09, docs/RECETTE_CAISSE_F.md du 12/09).

| # | Scénario | Preuve | Statut |
|---|---|---|---|
| R01 | Connexion des 11 profils → route/menu du rôle | homeForRole + /dashboard vérifiés par rôle (12/09, RECETTE_CDC) ; atterrissages re-testés au fil des lots (accueil→/caisse 13/09) | ✅ |
| R02 | URL/API d'un rôle non autorisé | 13/09 HTTP : accueil→`/close` **403** ; accueil→`/dashboard/tresorerie` **307 → sa page** ; agent→gestion partages **403** | ✅ |
| R03 | Client change l'identifiant du dossier | IDOR corrigées et recettées (P9 lot 0 : factures/devis PDF ; pages client gardées par client_id/email) — 12/09 RECETTE_CDC | ✅ |
| R04 | Agent consulte un dossier non affecté | Garde `agent_id !== profile.id → notFound` (page) + routes contrôle/lien-temporaire 403 (13/09 : partages 403) | ✅ |
| R05 | Chef hors de son service (recherche/export incl.) | 13/09 HTTP : `/api/search` en chef → clients=0, payments=0 (portée pôle uniquement, G6) ; pages Mon service bornées (12/09) | ✅ |
| R06 | Accueil crée puis oriente un dossier | File d'accueil + orientation recettées le 12/09 (RECETTE_CDC, reception_visits 085) | ✅ |
| R07 | Encaissement sans session / par agent ordinaire | 13/09 HTTP : agent sans session → **403** ; 12/09 recette F : accueil sans session 409 + insert direct refusé par trigger 091 (`CAISSE_FERMEE`) | ✅ |
| R08 | Double clic / reprise après interruption | 12/09 recette F8b : même ticket_key rejoué → `replayed=true`, aucun second paiement (CAI-05, contrainte UNIQUE 084) | ✅ |
| R09 | Deux encaissements concurrents sur un reste dû | 12/09 recette F8a : Promise.all → 200 + **409** (verrou optimiste total_regle) ; idem pos_credits (SQL 12/09) | ✅ |
| R10 | Espèces vs électronique | 12/09 recette F6/F10 : Mobile Money jamais dans le tiroir (ventilation + solde théorique) | ✅ |
| R11 | Paiement partiel puis complémentaire | 12/09 recette F8c : 8000+4000+8000 → « réglée », reste 0, chaque règlement relié (invoice_id) et en caisse | ✅ |
| R12 | Validation par le saisisseur / non autorisé | Chaîne paiements : self-validation refusée (12/09 SQL) ; clôture caisse : **défaut détecté et corrigé par la recette F** → 403 titulaire, re-testé 13/09 (G2b) | ✅ |
| R13 | Clôture avec écart | 12/09 F11 : écart sans justification 400 ; justifié → soumis ; validation par un TIERS ; 13/09 : justification CONSERVÉE à la validation (défaut corrigé) | ✅ |
| R14 | Remboursements partiels répétés/concurrents | Cautions : Σ remboursements ≤ caution (SQL 12/09, G3 caution) ; avoirs : plafonnés au reste dû (12/09, test 5a « dépassement 400 ») ; remboursement de prestation = avoir uniquement (AR-04 acté 13/09) | ✅ |
| R15 | Instruction DG → équipe → compte-rendu | Recette instructions du 12/09 (INS-2026-000001 : accusés individuels, avancement, clôture, notifications) | ✅ |
| R16 | Blocage agent puis escalade | Blocage sur instruction + escalade quotidienne (cron idempotent) recettés 12/09 ; escalade d'affectation ajoutée 13/09 (G1) | ✅ |
| R17 | Partage partenaire puis révocation | 13/09 HTTP : partage 200 → accès partenaire OK → révocation → page rendue = **404** (aucune donnée du dossier dans la réponse ; statut de transport 200 = streaming Next sur notFound, vérifié sans fuite) ; API/dépôt fermés (086) | ✅ |
| R18 | Message client vs note interne | Deux circuits distincts recettés 12/09 (notes_internes jamais dans le payload client — vue réception restreinte A6) | ✅ |
| R19 | Chiffre → liste au même instant | Compteurs et listes calculés dans le MÊME rendu serveur (mêmes requêtes) ; formalisé le 13/09 : horodatage de référence AFFICHÉ (« Données au JJ/MM HH:MM:SS Bangui ») sur Vue d'ensemble, Trésorerie, Pilotage, Compta (composant DataTimestamp) | ✅ |
| R20 | Tarif modifié après émission | Par construction : lignes COPIÉES sur devis/factures (P8) + contenu de facture FIGÉ par trigger 094 (preuve SQL 12/09) | ✅ |
| R21 | Connexion dégradée / échec d'impression | Paiement enregistré avant impression ; état honnête « fenêtre bloquée » ; réimpression = DUPLICATA sans encaissement (12/09) ; recherche client : états visibles réseau coupé (12/09) | ✅ |
| R22 | Compte désactivé / délégation expirée | Middleware + requireProfile : actif=false → 403 API / redirect login (recetté 12/09, R22 originel) ; délégations : non modélisées (AR-02/05 ouverts) | ✅ (délégations : N/A tant qu'AR-02) |
| R23 | Donnée institutionnelle modifiée | Trigger de révocation de vérification + publication bloquée (P8, recetté 12/09) | ✅ |
| R24 | Déploiement du nouvel espace | Marqueur `build <sha>` dans la barre latérale + vérifications HTTP authentifiées sur préversion à chaque lot (méthode standard depuis le 12/09) | ✅ |

**Bilan : 24/24 ✅ (R19 clôturé le 13/09 — instant de référence affiché).**
Hors périmètre logiciel restant : impression matérielle (test n°8), mesures
§16 (responsive/perf outillées — AR-07), délégations (AR-02/05).
