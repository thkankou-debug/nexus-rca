# NEXUS RCA — BLUEPRINT V3
**Spécification d'architecture + prompts maîtres d'exécution**
Version 3.0 — 4 septembre 2026
Architecte : Claude (chat) — Exécutant : Claude Code — Décideur : Thierry F. Kankou

---

## 0. RÈGLES DE MISSION (à respecter par l'exécutant)

| # | Règle | Statut |
|---|---|---|
| 0.1 | AUDIT → PLAN → **STOP** → GO → CODE → RÉCAP | Obligatoire |
| 0.2 | Aucune fonctionnalité existante utile supprimée | Bloquant |
| 0.3 | Aucune migration destructive (`DROP`, `TRUNCATE`, `ALTER … DROP COLUMN`) | Bloquant |
| 0.4 | Aucune variable d'environnement de production modifiée sans autorisation écrite | Bloquant |
| 0.5 | Zéro statistique codée en dur — toute métrique vient de Supabase | Bloquant |
| 0.6 | Zéro faux chiffre, faux partenaire, faux témoignage, faux logo | Bloquant |
| 0.7 | Fichiers complets, jamais de fragments | Obligatoire |
| 0.8 | Branche Git dédiée + tag de sauvegarde avant toute Phase | Obligatoire |
| 0.9 | Réponses en français, numérotées, courtes | Obligatoire |
| 0.10 | Une permission n'est jamais garantie par le masquage d'un bouton | Bloquant |

**Définition de « terminé » (Definition of Done) pour chaque phase :**
`tsc --noEmit` = 0 erreur · `lint` = 0 erreur · `build` = succès · tests de rôles passés · RÉCAP rédigé · aucune régression sur la checklist §11.

---

## 1. PROMPT MAÎTRE — PHASE 0 : AUDIT (à coller tel quel dans Claude Code)

```
CONTEXTE
Dépôt : plateforme Nexus RCA (Next.js + Supabase). Production : https://www.nexusrca.com
Rôle : tu es en mode AUDIT SEUL. Interdiction absolue d'écrire, modifier ou supprimer
le moindre fichier, la moindre migration, la moindre donnée pendant cette phase.

MISSION
Produire un rapport d'audit technique et fonctionnel exhaustif, dans un fichier
docs/AUDIT_V3.md, structuré exactement comme suit :

1. INVENTAIRE TECHNIQUE
   - versions : Next.js, React, TypeScript, Supabase JS, Tailwind, gestionnaire de paquets
   - App Router ou Pages Router ; server components vs client components (comptage)
   - dépendances inutilisées, dépendances obsolètes, dépendances en doublon
   - taille du dépôt, nombre de fichiers, fichiers > 500 lignes (liste)
   - contenu et respect effectif de CLAUDE.md

2. CARTOGRAPHIE DES ROUTES
   Trois tableaux : routes publiques / routes client / routes admin.
   Colonnes : chemin · fichier · protégée (O/N) · protégée où (middleware, layout, page,
   server action) · rôle(s) requis · données réelles ou simulées · état (OK / incomplet /
   mort / doublon).
   Signaler toute route atteignable sans contrôle serveur.

3. SCHÉMA SUPABASE
   - liste complète des tables, colonnes, types, contraintes, index, clés étrangères
   - tables sans clé primaire, sans index sur les colonnes filtrées, sans horodatage
   - migrations présentes vs état réel de la base (dérive éventuelle)
   - buckets Storage, leur politique publique/privée, la validation des fichiers
   - POUR CHAQUE TABLE : RLS activée O/N + liste littérale des policies
   - tables sans RLS = RISQUE CRITIQUE, à lister en tête de rapport

4. AUTHENTIFICATION ET RÔLES
   - mécanisme exact (Supabase Auth ? JWT custom ? cookies ? sessions ?)
   - où le rôle est stocké (table profiles ? app_metadata ? user_metadata ?)
   - RISQUE : le rôle est-il lisible/modifiable par le client ?
   - où le rôle est vérifié : client uniquement / middleware / serveur / base (RLS)
   - rafraîchissement de session, expiration, déconnexion, mots de passe oubliés

5. FONCTIONNALITÉS
   Trois listes distinctes et honnêtes :
   a) réellement opérationnelles (données réelles, bout en bout)
   b) partielles (UI présente, logique absente ou incomplète)
   c) simulées (mock, données codées en dur, TODO, boutons sans effet)
   Pour chaque élément : fichier + ligne.

6. QUALITÉ
   - résultat brut de `tsc --noEmit`, du lint et du build (coller les sorties)
   - usages de `any`, de `@ts-ignore`, de `!` non justifié
   - `console.log` restants, secrets en dur, clés service_role côté client (CRITIQUE)
   - duplications de composants et de logique métier
   - accessibilité : contrastes, labels, focus, navigation clavier
   - performance : images non optimisées, absence de pagination, requêtes N+1

7. SÉCURITÉ — classement par gravité
   CRITIQUE / ÉLEVÉ / MOYEN / FAIBLE, avec preuve (fichier:ligne) et impact métier.

8. SYNTHÈSE
   - 10 problèmes prioritaires, ordonnés
   - ce qui doit être conservé tel quel
   - ce qui doit être amélioré
   - ce qui doit être réécrit (et la justification)
   - liste des fichiers et des tables qui seront touchés en V3

CONTRAINTE FINALE
Ne propose aucun correctif dans cette phase. Termine par « AUDIT TERMINÉ — EN ATTENTE
DE VALIDATION » et arrête-toi. N'entame aucune modification sans mon GO explicite.
```

---

## 2. MATRICE RBAC — 9 RÔLES

### 2.1 Rôles et périmètre

| Code | Rôle | Périmètre |
|---|---|---|
| `super_admin` | Super-administrateur | Tout, y compris CMS, rôles, paramètres système |
| `admin` | Administrateur | Tout l'opérationnel, sauf paramètres système et rôles élevés |
| `dg` | Directeur général | Lecture globale + validation + rapports de direction |
| `daf` | Responsable financier | Finance complète, lecture dossiers, aucune écriture RH |
| `chef_service` | Responsable de service | Dossiers et agents de **son** service uniquement |
| `agent` | Agent / conseiller | Dossiers qui lui sont **affectés** uniquement |
| `comptable` | Comptable | Saisie financière, sans validation ni suppression |
| `moderateur` | Modérateur | Contenus, avis, messages ; aucun accès financier |
| `partenaire` | Partenaire | Dossiers explicitement partagés avec lui, en lecture + dépôt de décision |

### 2.2 Modèle de permissions (granulaire, pas de rôle codé en dur dans les pages)

Nomenclature : `ressource.action[.portée]`
Portées : `all` · `service` · `own`

```
dossier.read.all | dossier.read.service | dossier.read.own
dossier.create | dossier.update | dossier.assign | dossier.status.change
dossier.delete | dossier.archive | dossier.export
document.read | document.upload | document.validate | document.reject | document.delete
note_interne.read | note_interne.write
message.read | message.send
devis.create | devis.send | devis.validate
facture.create | facture.validate | facture.cancel
paiement.record | paiement.validate | paiement.refund
depense.create | depense.validate
caisse.read | caisse.close
commission.read | commission.validate
finance.report.read | finance.export
rh.user.create | rh.user.disable | rh.role.assign | rh.performance.read
cms.service.write | cms.content.write | cms.faq.write | cms.partenaire.write
notification.broadcast
audit.read
settings.write
```

### 2.3 Extrait de la matrice (à compléter en base, table `role_permissions`)

| Permission | super_admin | admin | dg | daf | chef_service | agent | comptable | moderateur | partenaire |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| dossier.read | all | all | all | all | service | own | — | — | partagés |
| dossier.assign | ✓ | ✓ | — | — | ✓ (service) | — | — | — | — |
| dossier.status.change | ✓ | ✓ | — | — | ✓ | ✓ (own) | — | — | décision seule |
| dossier.delete | ✓ | — | — | — | — | — | — | — | — |
| note_interne.read | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (own) | — | — | ✗ |
| devis.validate | ✓ | ✓ | ✓ | ✓ | — | — | — | — | — |
| facture.validate | ✓ | ✓ | — | ✓ | — | — | — | — | — |
| paiement.record | ✓ | ✓ | — | ✓ | — | — | ✓ | — | — |
| paiement.validate | ✓ | — | — | ✓ | — | — | ✗ | — | — |
| caisse.close | ✓ | — | — | ✓ | — | — | — | — | — |
| rh.role.assign | ✓ | — | — | — | — | — | — | — | — |
| cms.service.write | ✓ | — | — | — | — | — | — | — | — |
| cms.content.write | ✓ | ✓ | — | — | — | — | — | ✓ | — |
| audit.read | ✓ | ✓ | ✓ | — | — | — | — | — | — |
| settings.write | ✓ | — | — | — | — | — | — | — | — |

**Règle de séparation des tâches :** celui qui saisit ne valide pas. `comptable` saisit, `daf` valide. `agent` demande le changement de statut sensible, `chef_service` approuve.

### 2.4 Trois niveaux d'application obligatoires

1. **Base (RLS)** — vérité ultime, jamais contournable.
2. **Serveur (server actions / route handlers)** — `assertPermission(user, 'facture.validate')` en première ligne de chaque action mutante.
3. **Interface** — confort visuel uniquement (`<Can permission="…">`), jamais une garantie.

Le rôle est stocké **exclusivement** dans `profiles.role` + `auth.users.app_metadata` (non modifiable par le client). Jamais dans `user_metadata`.

---

## 3. SCHÉMA SUPABASE V3 (migrations additives uniquement)

### 3.1 Tables à créer ou compléter

```
-- Identité et organisation
profiles            (id, full_name, email, phone, role, service_id, is_active,
                     availability_status, avatar_url, created_at, updated_at)
services            (id, code, name, description, is_active, sort_order)
role_permissions    (role, permission)              -- source de vérité RBAC
user_permissions    (user_id, permission, granted)  -- dérogations individuelles

-- Cœur métier
dossiers            (id, reference, client_id, service_id, agent_id, status, priority,
                     deadline, source, amount_estimated, created_at, updated_at,
                     closed_at, archived_at)
dossier_etapes      (id, dossier_id, ordre, libelle, statut, done_at, done_by)
dossier_documents   (id, dossier_id, type, storage_path, statut, motif_rejet,
                     uploaded_by, validated_by, uploaded_at)
documents_requis    (id, service_id, libelle, obligatoire, description)
dossier_notes       (id, dossier_id, author_id, contenu, created_at)   -- INTERNE
dossier_messages    (id, dossier_id, sender_id, destinataire, contenu, lu_at)
dossier_historique  (id, dossier_id, action, ancien_statut, nouveau_statut, by, at)
rendez_vous         (id, dossier_id, client_id, agent_id, debut, fin, lieu, statut, notes)

-- Finance
devis               (id, numero, dossier_id, statut, total_ht, total_ttc, devise,
                     valide_jusqu_au, accepte_at, created_by)
devis_lignes        (id, devis_id, designation, quantite, prix_unitaire, remise)
factures            (id, numero, dossier_id, devis_id, statut, total, reste_du,
                     echeance, validated_by, validated_at)
facture_lignes      (id, facture_id, designation, quantite, prix_unitaire)
paiements           (id, facture_id, dossier_id, montant, mode, reference,
                     recu_le, saisi_par, valide_par, valide_at, statut)
echeanciers         (id, facture_id, ordre, montant, date_prevue, statut)
depenses            (id, categorie_id, montant, libelle, justificatif_path,
                     saisi_par, valide_par, statut, date_depense)
categories_compta   (id, code, libelle, type)        -- revenu | depense
caisse_sessions     (id, ouverte_le, fermee_le, solde_ouverture, solde_theorique,
                     solde_reel, ecart, fermee_par)
commissions         (id, beneficiaire_id, dossier_id, base, taux, montant, statut)

-- RH
taches              (id, titre, dossier_id, assigne_a, echeance, priorite, statut)
absences            (id, user_id, type, debut, fin, statut, validee_par)
affectations_hist   (id, dossier_id, de_user, vers_user, motif, at, by)

-- CMS
contenus_site       (id, cle, type, valeur_json, publie, updated_by, updated_at)
faq                 (id, service_id, question, reponse, ordre, publie)
partenaires         (id, nom, logo_path, url, verifie, publie, ordre)
temoignages         (id, auteur, fonction, contenu, verifie, publie, source)
pays_destinations   (id, code, nom, service_id, delai_indicatif, notes)
bureaux             (id, nom, adresse, ville, pays, telephone, email, horaires)

-- Transverse
notifications       (id, user_id, type, titre, corps, lien, lu_at, created_at)
notification_prefs  (user_id, canal, type, actif)     -- in_app | email | sms | whatsapp
audit_log           (id, user_id, role, action, entite, entite_id, ancienne_valeur,
                     nouvelle_valeur, ip, user_agent, at)
```

### 3.2 Règles de migration

- Un fichier par migration, horodaté, **jamais** réécrit après application.
- `ADD COLUMN` toujours `NULL` ou avec `DEFAULT`, jamais `NOT NULL` sec sur table peuplée.
- Renommage = nouvelle colonne + backfill + vue de compatibilité + suppression **en V3.1**, pas maintenant.
- Toute nouvelle table : `ALTER TABLE … ENABLE ROW LEVEL SECURITY;` dans la **même** migration, plus une policy `deny all` par défaut si les policies ne sont pas encore écrites.

### 3.3 Numérotation automatique

```
Dossier  : NRCA-{ANNÉE}-{SERVICE}-{SÉQUENCE 5 chiffres}   ex. NRCA-2026-VIS-00147
Devis    : DEV-{ANNÉE}-{SÉQUENCE}
Facture  : FAC-{ANNÉE}-{SÉQUENCE}
Reçu     : REC-{ANNÉE}-{SÉQUENCE}
```
Implémentation par séquence Postgres + trigger `BEFORE INSERT`, **jamais** par `count(*)+1` côté application (collisions garanties).

---

## 4. RLS — PATRONS DE RÉFÉRENCE

Fonctions utilitaires en base (`SECURITY DEFINER`, schéma privé) :

```sql
auth_role()             -- rôle de l'utilisateur courant
auth_service_id()       -- service de rattachement
has_permission(perm)    -- lit role_permissions + user_permissions
```

Patron pour `dossiers` :

```sql
-- Lecture
create policy "dossiers_read" on dossiers for select using (
     has_permission('dossier.read.all')
  or (has_permission('dossier.read.service') and service_id = auth_service_id())
  or (has_permission('dossier.read.own')     and agent_id  = auth.uid())
  or (client_id = auth.uid())
  or exists (select 1 from dossier_partages p
             where p.dossier_id = dossiers.id and p.partenaire_id = auth.uid())
);

-- Écriture : jamais de `using (true)`, jamais de `to public`
create policy "dossiers_update" on dossiers for update
  using (has_permission('dossier.update') and (
        has_permission('dossier.read.all')
     or service_id = auth_service_id()
     or agent_id = auth.uid()))
  with check (true);
```

**Interdits absolus en RLS :** `using (true)` sur une table métier · policy `to public` sur des données personnelles · lecture du rôle depuis `user_metadata` · clé `service_role` exposée côté navigateur.

**Cloisonnement client :** `dossier_notes` n'a **aucune** policy pour le rôle client. Le portail client ne lit jamais cette table, même indirectement (attention aux jointures et aux vues).

---

## 5. MACHINE À ÉTATS DES DOSSIERS

```
nouvelle_demande
   └→ qualification
        ├→ documents_demandes ⇄ dossier_incomplet
        │      └→ etude_faisabilite
        │            └→ devis_envoye
        │                  ├→ devis_accepte → paiement_attente → traitement
        │                  └→ refuse
        └→ annule

traitement
   └→ transmis_partenaire
        └→ decision_recue
             ├→ termine
             └→ refuse

(tout état) → annule → archive
termine / refuse        → archive
```

Règles : transitions déclarées dans un objet `TRANSITIONS` typé, validées **côté serveur** ; chaque transition écrit dans `dossier_historique` **et** `audit_log` ; certaines transitions exigent une permission (`devis.validate`, `dossier.archive`) ; retour arrière autorisé uniquement pour `admin`/`super_admin`, avec motif obligatoire.

---

## 6. DÉCOUPAGE EN PHASES

| Phase | Contenu | Sortie attendue | Risque |
|---|---|---|---|
| **P0** | Audit complet, aucune écriture | `docs/AUDIT_V3.md` + STOP | Nul |
| **P1** | Sécurité : RLS partout, rôle en `app_metadata`, protection serveur des routes, purge des secrets, rate limiting | Rapport de sécurité avant/après | Élevé — tester chaque rôle |
| **P2** | Socle RBAC : tables `role_permissions`, helpers `assertPermission`, composant `<Can>`, migration des rôles existants vers les 9 rôles | Matrice testée rôle par rôle | Élevé |
| **P3** | Schéma métier : dossiers, étapes, documents, historique, notifications, audit_log | Migrations additives + seed de dev | Moyen |
| **P4** | Admin — dossiers : liste, Kanban, fiche détaillée, filtres, actions groupées | Parcours agent complet | Moyen |
| **P5** | Admin — tableau de bord réel, métriques cliquables, filtres de période | Zéro chiffre codé en dur | Faible |
| **P6** | Finance : devis, factures, paiements, dépenses, caisse, commissions, PDF, exports | Rapprochement journalier fonctionnel | Élevé |
| **P7** | RH : comptes, affectations, tâches, charge, performances, absences | — | Faible |
| **P8** | CMS : services, tarifs, FAQ, partenaires, témoignages vérifiés, textes du site | Site public administrable | Moyen |
| **P9** | Portail client : suivi, dépôt de documents, devis, factures, messagerie, notifications | Cloisonnement vérifié | Élevé |
| **P10** | Site public : hiérarchie, 8 pôles, pages de service, formulaires, SEO, accessibilité, performance | Lighthouse ≥ 90 sur 4 axes | Faible |
| **P11** | Notifications multicanal (in-app d'abord, adaptateurs email/SMS/WhatsApp prêts) | File d'attente + préférences | Moyen |
| **P12** | Durcissement final : tests, documentation, journal des versions | `docs/V3.md` + RÉCAP | — |

**Ordre non négociable :** la sécurité (P1-P2) précède toute nouvelle fonctionnalité. Construire des modules sur un RBAC absent revient à multiplier la surface d'attaque.

---

## 7. EXIGENCES UI/UX ADMIN

- **Structure** : barre latérale par modules (Pilotage · Dossiers · Finance · RH · Contenus · Système), barre supérieure avec recherche globale (⌘K), centre de notifications, sélecteur de période persistant.
- **Densité** : tableaux confortables par défaut, mode compact optionnel ; 8 à 10 colonnes maximum, le reste dans la fiche.
- **Mobile** : les tableaux deviennent des cartes empilées — jamais de défilement horizontal.
- **États** : skeleton au chargement, état vide avec action utile, erreur avec cause et remède, confirmation obligatoire pour toute action destructive (saisie du nom de l'entité pour les suppressions).
- **Badges de statut** : une couleur par famille d'état, identique partout — neutre (nouveau), ambre (en attente), bleu (en cours), vert (terminé), rouge (refusé), gris (archivé).
- **Identité** : institutionnelle et sobre. Typographie hiérarchisée, espacements sur une échelle de 4 px, aucune ombre décorative, aucune carte sans donnée. Mode clair prioritaire ; mode sombre livré uniquement s'il est intégralement cohérent.
- **Interdits** : statistiques décoratives, cartes vides, dégradés de startup, emojis dans l'interface d'administration, chiffres illustratifs.

---

## 8. JOURNAL D'AUDIT IMMUABLE

- Table `audit_log` en `INSERT` seul : aucune policy `UPDATE` ni `DELETE`, pour aucun rôle, y compris `super_admin`.
- Écriture par trigger sur les tables sensibles **et** par appel explicite dans les server actions (les deux, pas l'un ou l'autre).
- Contenu : utilisateur, rôle au moment de l'action, action, entité, identifiant, ancienne valeur (JSON), nouvelle valeur (JSON), horodatage, IP, agent utilisateur.
- Champs personnels sensibles masqués dans les diffs (numéro de passeport, coordonnées bancaires).
- Consultation filtrable par utilisateur, entité, période ; export réservé à `super_admin`.
- Rétention : 24 mois en ligne, puis archivage froid.

---

## 9. NOTIFICATIONS

Architecture par événements : chaque action métier émet un événement (`dossier.cree`, `document.rejete`, `paiement.recu`, `echeance.proche`…). Un dispatcher lit `notification_prefs` et écrit dans `notifications` (canal in-app, seul actif en V3) ; les adaptateurs email/SMS/WhatsApp implémentent une interface commune `NotificationChannel` et restent désactivés tant que les fournisseurs ne sont pas configurés. Aucune dépendance dure à un fournisseur dans le code métier.

---

## 10. PROMPT MAÎTRE — PHASES D'EXÉCUTION (après validation)

```
Tu exécutes la Phase {N} du blueprint V3 de Nexus RCA.

AVANT
1. git checkout -b v3/phase-{N}-{slug} ; git tag backup-avant-phase-{N}
2. Relis docs/AUDIT_V3.md et la section correspondante du blueprint.
3. Annonce : fichiers à créer, fichiers à modifier, migrations à ajouter. Attends GO.

PENDANT
4. Migrations additives uniquement ; RLS activée dans la même migration que la table.
5. Toute action mutante commence par assertPermission().
6. Aucune donnée simulée : si la donnée n'existe pas encore, affiche un état vide honnête.
7. Fichiers complets. Aucun TODO laissé sans ticket dans docs/DETTE.md.

APRÈS
8. tsc --noEmit, lint, build : coller les sorties réelles.
9. Tester les 9 rôles sur les parcours touchés ; tableau résultat.
10. Vérifier la checklist de non-régression (section 11 du blueprint).
11. RÉCAP numéroté : ce qui a été fait, ce qui reste, risques ouverts, prochaine phase.

INTERDITS
Migration destructive · suppression de données · modification des variables de
production · refonte d'architecture non demandée · dépendance nouvelle non justifiée.
```

---

## 11. CHECKLIST DE NON-RÉGRESSION (à repasser après chaque phase)

**Authentification** — inscription · connexion · déconnexion · mot de passe oublié · expiration de session · accès direct à une URL admin en étant client (doit échouer côté serveur).

**Client** — voir ses dossiers uniquement · téléverser un document · ne jamais voir une note interne · ne jamais voir un autre dossier en changeant l'identifiant dans l'URL.

**Agent** — voir ses dossiers affectés · changer un statut autorisé · être refusé sur un statut non autorisé · ne pas accéder à la finance.

**Finance** — créer un devis · le convertir en facture · enregistrer un paiement partiel · vérifier le reste dû · générer le PDF (accents et caractères Unicode corrects) · exporter en CSV.

**Système** — chaque action sensible produit une ligne d'audit · les notifications arrivent au bon destinataire · le tableau de bord ne contient aucune valeur codée en dur · le site public s'affiche correctement sur 360 px de large.

---

## 12. INDICATEURS DE RÉUSSITE V3

| Indicateur | Cible |
|---|---|
| Tables sans RLS | 0 |
| Vérifications de permission côté client uniquement | 0 |
| Valeurs codées en dur dans les tableaux de bord | 0 |
| Erreurs TypeScript / lint | 0 |
| Couverture des 9 rôles par des tests de parcours | 100 % |
| Lighthouse public (perf / a11y / bonnes pratiques / SEO) | ≥ 90 |
| Admin utilisable sur téléphone sans défilement horizontal | 100 % des tableaux |
| Actions sensibles tracées dans `audit_log` | 100 % |

---

*Fin du blueprint. Étape suivante : exécuter la Phase 0 (audit), puis valider le plan avant toute modification.*
