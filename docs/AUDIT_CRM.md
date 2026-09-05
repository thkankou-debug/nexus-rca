# AUDIT CRM — Phase C0
**Lecture seule. Aucune écriture effectuée pour produire ce rapport.**
Date : 5 septembre 2026 · Base auditée : `nexus-rca -new` (yyoptsxdoekbmibkwikj)

---

## 0. Résumé pour décision

La décision D7 proposée par la feuille de route est **confirmée par les données** : `clients` doit devenir l'entité personne canonique, `profiles` reste l'identité d'authentification. Mais un fait change la portée du travail restant :

> **`demandes.client_record_id` — la colonne censée relier un dossier à une fiche `clients` — est renseignée sur 0 des 16 dossiers réels, et n'est référencée dans aucun fichier de `app/`.** Ce n'est pas une colonne sous-utilisée, c'est une colonne morte : jamais lue, jamais écrite. Le module `clients` (14 fichiers, interface complète : liste, fiche, formulaire, sélecteur) fonctionne aujourd'hui **en vase clos**, déconnecté des dossiers qu'il est censé qualifier.

C'est le seul point réellement bloquant. Le reste (messages, notes, historique de statut) a une explication plus rassurante que redoutée : voir §4.

---

## 1. Inventaire des entités « personne »

| Table | Lignes | Colonnes d'identité | Qui écrit | Qui lit |
|---|---|---|---|---|
| `profiles` | 18 (17 client + 1 super_admin) | email, nom, prénom, téléphone, pays | Trigger `handle_new_user()` à l'inscription (rôle forcé à `client`) ; `UPDATE` staff pour élévation de rôle | Partout — c'est l'identité de session (`auth.uid()`) |
| `clients` | 2 | nom, prénom, raison_sociale, email, téléphone(x2), adresse, ville, pays, `profile_id` (lien vers profiles) | Formulaire `ClientForm.tsx`, `ClientSelector.tsx` (agent/admin) | `ClientsManager.tsx`, pages `/dashboard/{admin,super-admin}/clients`, `/dashboard/agent/clients` |
| `contacts` | 4 | nom, email, téléphone | Formulaire de contact public (`/contact`) | Boîte de réception staff (`contacts_select_staff`) — aucun lien vers `clients`/`profiles` en dehors de `processed_by` (qui a traité, pas qui est le contact) |
| `contact_demandes` | 0 | nom_complet, email, téléphone, organisation | Formulaire contact « pro » public | Idem — `user_id` référence `auth.users` directement (pas `profiles`), incohérent avec le reste du schéma qui référence systématiquement `profiles.id` |
| `appointment_requests` | 6 | full_name, email, phone, country, city | Formulaire prise de RDV public (avant compte) | `assigned_to` (agent), aucun lien vers `clients`/`profiles` |

**Personnes distinctes réelles** : 30 lignes brutes cumulées sur les 5 tables → **21 e-mails distincts** après normalisation (minuscules, espaces retirés). Confirme un recouvrement réel, pas un artefact de comptage — la même personne existe bien sous plusieurs formes aujourd'hui.

`clients` (2 lignes) : une fiche liée à un vrai profil (`GROTHER John-Mike`, `profile_id` → profil client réel), une fiche sans profil (`Jean Paul yangue`). Aucune des deux n'est reliée à un dossier `demandes` — voir §3.

---

## 2. Cartographie des relations

```
auth.users (id) ──CASCADE──► profiles (id)
                                 │
                                 ├──[client_id]──► demandes ◄──[client_record_id]── clients ──[profile_id]──► profiles
                                 │                    │                                                          ▲
                                 │                    ├─[agent_id]──► profiles (staff assigné)                  │
                                 │                    │                                                          │
                                 │                    ├──CASCADE──► demande_documents                           │
                                 │                    ├──CASCADE──► demande_status_history                      │
                                 │                    ├──CASCADE──► demande_messages                            │
                                 │                    ├──CASCADE──► demande_notes                                │
                                 │                    ├──CASCADE──► demande_documents_requests                  │
                                 │                    ├──SET NULL──► rendez_vous (obsolète, D3)                 │
                                 │                    └──SET NULL──► payments, payment_links                    │
                                 │                                                                              │
                                 ├──SET NULL──► appointments (agent_id, client_id, confirmed_by, cancelled_by)  │
                                 ├──SET NULL──► clients (created_by) ──────────────────────────────────────────┘
                                 ├──SET NULL──► contacts (processed_by)
                                 └──SET NULL──► appointment_requests (assigned_to)

auth.users (id) ──directement──► contact_demandes (user_id, traite_par)   ← incohérence : seule table à ne pas passer par profiles

contacts, contact_demandes, appointment_requests : AUCUNE colonne ne les relie entre eux ni à clients/demandes.
Ce sont trois boîtes de réception isolées — un même prospect qui remplit le formulaire de contact PUIS
demande un RDV PUIS soumet une demande de service apparaît potentiellement 3 fois, sans lien.
```

**Intégrité des liens** : toutes les FK ci-dessus sont de vraies contraintes Postgres (vérifiées via `pg_constraint`), sauf le rapprochement `demandes.email`/`profiles.email` qui n'est qu'une correspondance de valeur (exploitée par le trigger `auto_link_demande_to_client` — voir §3).

---

## 3. Doublons de colonnes

**`demandes` porte l'identité en triple** :
1. `client_id` (→ `profiles.id`) — peuplé sur **12/16** dossiers.
2. `client_record_id` (→ `clients.id`) — peuplé sur **0/16** dossiers, référencé dans **0 fichier** de `app/`. Colonne morte, pas seulement sous-utilisée.
3. Champs dénormalisés : `nom_complet`, `email`, `telephone`, `pays`, `ville`, `sexe`, `date_naissance`, `nationalite`, `adresse`, `situation_matrimoniale`, `profession`, `employeur` — une copie complète de l'identité au moment de la soumission, sur les 16 dossiers.

4 dossiers n'ont **ni** `client_id` **ni** `client_record_id` : 3 sont des soumissions de test de Thierry lui-même (email `thkankou@gmail.com`, nom fictif « Jean Paul yangue », `source` = `formulaire_simple`/`formulaire_complet`), le 4ᵉ (`NAGBATA NAOMIE JOLIVIA`, `formulaire_etudes`) est une soumission publique réelle sans compte créé.

Le mécanisme de rattachement existant (`auto_link_demande_to_client`, trigger sur `profiles` AFTER INSERT/UPDATE OF email) relie rétroactivement une demande orpheline au `client_id` quand un compte est créé avec le même e-mail — **mais ne touche jamais `client_record_id`ni la table `clients`**. C'est un rattachement partiel : ça répare le lien vers `profiles`, jamais vers `clients`.

**`payment_links`** : 9 lignes, 7 avec `client_id` renseigné, 2 avec seulement `client_nom`/`client_email` (liens créés pour un contact sans compte). Sur les 7 qui ont les deux, aucune divergence de valeur détectée. Bien plus sain que `demandes` — cohérent avec le durcissement fait en P1b (migration 035, ownership par `client_id`).

---

## 4. Ce qui est cassé, vide ou simulé

Diagnostic revu à la baisse en gravité par rapport à l'hypothèse de départ — **l'interface et le code d'écriture existent des deux côtés (client et staff) pour les 4 tables**, contrairement à ce qu'un simple comptage à 0 pourrait laisser croire :

| Table | Lignes | Backend d'écriture | Interface | Diagnostic |
|---|---|---|---|---|
| `demande_messages` | 0 | `POST /api/demandes/[id]/messages` — code complet, vérifié ligne par ligne, correct | `MessagesList.tsx`, monté sur `app/dashboard/client/demandes/[id]/page.tsx` | Backend + frontend présents des deux côtés. **Volume global très faible (16 dossiers) rend plausible que la fonctionnalité n'ait simplement jamais été utilisée**, pas qu'elle soit cassée. Non confirmé avec certitude : un test d'écriture réel le confirmerait en quelques minutes, mais c'est une écriture — hors périmètre C0 (lecture seule). |
| `demande_notes` | 0 | `POST /api/demandes/[id]/notes` — présent | `StaffNotes.tsx`, monté sur `StaffDossierDetail.tsx` (agent/admin/super-admin) | Même diagnostic : plomberie complète, jamais empruntée à ce jour. |
| `demande_status_history` | 0 | `POST /api/demandes/[id]/status` insère bien une ligne d'historique | `DossierStaffBanner.tsx` appelle la route | Des dossiers ont pourtant changé de statut (ex. `DEM-2026-000007` est passé à `complete`) sans laisser de trace ici — signe que **certains changements de statut ont eu lieu par une autre voie** (SQL direct, ou avant que cette route existe) et non que la route échoue silencieusement. À instrumenter en A5 (log applicatif) plutôt qu'à re-développer. |
| `demande_documents_requests` | 0 | `POST /api/demandes/[id]/documents-requests` insère, `.../documents` marque comme fourni | Non vérifié côté UI dans ce rapport (temps imparti) | Backend présent ; à vérifier le déclencheur UI en A5. |

**Conclusion §4** : aucune des 4 tables n'a de RLS bloquante identifiée (toutes ont des policies `INSERT`/`ALL` cohérentes pour staff et/ou client propriétaire). Le diagnostic le plus probable est **sous-utilisation réelle** dans un système à très faible volume (16 dossiers), pas une fonctionnalité cassée — mais ce rapport ne peut pas l'affirmer avec certitude sans un test d'écriture, explicitement hors périmètre d'une phase lecture seule.

---

## 5. Schéma cible proposé

Confirme D7 tel que posé par la feuille de route, sans modification :

- **`clients` devient l'entité personne unique** — prospect ou client, avec ou sans compte. Un prospect est un client sans dossier, pas une table séparée.
- **`profiles` reste l'identité d'authentification**, reliée par `clients.profile_id` (déjà présent, déjà peuplé correctement sur au moins 1 des 2 lignes existantes — le mécanisme fonctionne, il manque juste le volume et le rattachement aux dossiers).
- **`contacts`, `contact_demandes`, `appointment_requests` restent les canaux d'entrée** (boîte de réception), pas fusionnés — mais doivent gagner un moyen de rattachement vers `clients` (aujourd'hui : aucun des trois n'a de colonne vers `clients` ni entre eux).
- **`demandes.client_record_id` devient le lien canonique dossier → personne.** Concrètement : c'est une colonne qui existe, qui a une FK correcte, et qu'il faut commencer à peupler — le travail n'est pas un changement de schéma, c'est un changement de code (écrire dans cette colonne au lieu de/en plus de `client_id`) + un backfill des 16 lignes existantes.
- Les champs dénormalisés sur `demandes` sont conservés comme trace de la saisie d'origine, jamais relus comme source une fois `client_record_id` fiable.
- **Aucune table `dossiers` créée** : `demandes` est le dossier, confirmé par ce même audit — aucune structure parallèle trouvée qui ferait double emploi.

---

## 6. Stratégie de dédoublonnage

À la mesure du volume réel (21 personnes distinctes, pas des millions) :

- **Règle de rapprochement** : e-mail normalisé (`lower(trim(email))`) en clé primaire de rapprochement — déjà la logique du trigger `auto_link_demande_to_client` existant, à étendre à `clients`, `contacts`, `contact_demandes`, `appointment_requests`.
- **Téléphone** en clé secondaire (format international), utile pour les 4 dossiers sans e-mail correspondant à un compte.
- **Fusion toujours proposée à un humain**, jamais automatique — à ce volume (2 lignes dans `clients` aujourd'hui), le premier lot de rattachement peut même se faire manuellement par Thierry plutôt que par un algorithme, le temps que le volume justifie l'automatisation.
- Trace de fusion (qui, quand, quelles fiches) : dans `audit_log` une fois livré en P3, pas avant.

---

## 7. Plan de migration non destructif (préparatoire à P3)

1. `demandes.client_record_id` : backfill des 16 lignes — pour les 12 avec `client_id`, chercher ou créer la fiche `clients` correspondante (via `profiles.email`) puis renseigner `client_record_id`.
2. Corriger `handle_new_user()` ou le trigger d'auto-link pour qu'il peuple aussi `client_record_id` (aujourd'hui il ne touche que `client_id`).
3. Ajouter aux formulaires publics (`/contact`, prise de RDV, demande de service) une étape de rapprochement par e-mail avant insertion, pour que `contacts`/`contact_demandes`/`appointment_requests` créent ou retrouvent une fiche `clients` dès la soumission — actuellement, aucun des trois n'écrit dans `clients`.
4. `contact_demandes.user_id`/`traite_par` : migrer la FK de `auth.users` vers `profiles`, pour la cohérence avec le reste du schéma (actuellement seule exception).
5. Ne rien supprimer : `client_id` et les champs dénormalisés restent, marqués hérités dans la documentation une fois `client_record_id` fiable.

Aucune de ces étapes n'est exécutée dans cette phase — C0 est un audit, l'exécution est P3.

---

## 8. Parcours et pages du CRM — déjà là / à construire

**Déjà là et fonctionnel** : gestion `clients` (liste, fiche, formulaire, sélecteur — 14 fichiers), fiche dossier staff complète avec onglets Notes/Messages/Historique (composants montés et câblés), messagerie dossier bidirectionnelle (client ↔ staff) avec notification e-mail, changement de statut avec bannière staff.

**Manquant, pour A5/A6, pas un nouveau module CRM parallèle** : rattachement `clients` ↔ `demandes` (le vrai chantier, §5-7 ci-dessus) ; rattachement des 3 boîtes de réception (`contacts`, `contact_demandes`, `appointment_requests`) vers `clients` ; fiche client 360° (aujourd'hui `clients` n'agrège rien — ni dossiers, ni rendez-vous, ni paiements, puisque rien ne pointe vers elle) ; dédoublonnage outillé.

---

## Décision demandée

Confirmer D7 tel que reformulé au §5 — aucun écart proposé par rapport à la feuille de route. Le seul complément apporté par cet audit : le problème n'est pas un schéma à revoir, c'est du code de rattachement à écrire (le schéma cible existe déjà, `client_record_id` est prêt et inutilisé). GO nécessaire avant P3.
