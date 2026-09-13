# ÉCARTS SCHÉMA RÉEL vs `types/index.ts`
**Phase 0.5 — item 4.** Comparaison entre le schéma réel introspecté (base `yyoptsxdoekbmibkwikj`) et les types déclarés dans `types/index.ts`.

---

## 1. Tables réelles sans AUCUNE interface TypeScript dans `types/index.ts`

`types/index.ts` ne déclare que : `Profile`, `Demande`/`DemandeAvecDocuments`/`DemandeDocument`, `RendezVous`, `Contact`, et les types RH (`Employee`, `Payslip`, `LeaveRequest`, etc.). Les tables suivantes — dont plusieurs sont au cœur du système financier — **n'ont aucune interface centralisée** :

- `payments` (paiements — table la plus sensible du système)
- `payment_links` (liens de paiement multi-méthodes)
- `payment_events` (journal immuable des paiements)
- `stripe_webhook_log`
- `clients`
- `transferts`
- `quick_sales`
- `expenses`
- `appointments` (distinct de `rendez_vous`, qui lui est typé)
- `appointment_requests`
- `contact_demandes` (distinct de `contacts`, qui lui est typé)
- `visa_express_requests`
- `insurance_quotes`

**Conséquence concrète** : chaque composant qui manipule ces données (`PaymentReceipt.tsx`, `QuickSaleForm.tsx`, `ExpensesManager.tsx`, `VisaExpressManager.tsx`, etc.) redéfinit vraisemblablement ses propres types inline ou utilise des objets non typés — aucun moyen de vérifier la cohérence entre eux, ni de détecter automatiquement une dérive si une colonne change en base. C'est un facteur de risque silencieux pour `tsc --noEmit` : le compilateur ne peut pas protéger contre un mauvais accès de champ sur ces tables puisqu'il n'existe pas de type de référence à violer.

**Recommandation** : ajouter ces interfaces à `types/index.ts` en Phase 1/P2, générées idéalement via `generate_typescript_types` (outil MCP Supabase disponible) plutôt qu'à la main, pour garantir la fidélité exacte à la base réelle.

---

## 2. Écarts sur les tables déjà typées

### `Demande` (types/index.ts) vs `public.demandes` (réel)

Le type `Demande` est presque complet mais **omet une colonne réelle** :

| Colonne réelle | Présente dans `Demande` ? |
|---|:--:|
| `client_record_id` (uuid, FK → `clients.id`) | ❌ Absente |

Toutes les autres colonnes (y compris celles ajoutées par les migrations 030-032 : `sexe`, `date_naissance`, `nationalite`, `categorie_dossier`, `current_step`, etc.) sont correctement déclarées.

### `Contact` (types/index.ts) vs `public.contacts` (réel)

Le type `Contact` ne déclare que 8 champs (`id`, `nom`, `email`, `telephone`, `sujet`, `message`, `traite`, `created_at`). La table réelle en a 17, avec 9 colonnes absentes du type :

- `reference` (text, référence auto-générée)
- `status` (text, avec contrainte `CHECK` sur `nouveau|lu|repondu|archive` — remplace apparemment `traite` (boolean) par un statut plus riche)
- `ip`, `user_agent`, `source`
- `processed_at`, `processed_by`
- `notes_internes`
- `updated_at`

Le type `Contact` semble correspondre à une version antérieure de la table, avant l'ajout du statut enrichi et des métadonnées de traitement (probablement migration 021, déjà présente dans le dépôt — donc ce n'est pas lié au trou 001-017, c'est une dérive normale de maintenance à corriger).

### `Profile` (types/index.ts) vs `public.profiles` (réel)

**Aucun écart.** Les 14 colonnes déclarées correspondent exactement aux 14 colonnes réelles, enum `role` inclus (`super_admin | admin | agent | client` des deux côtés). Bon signe : ce type a été tenu à jour.

### `RendezVous` (types/index.ts) vs `public.rendez_vous` (réel)

Aucun écart — les 9 colonnes correspondent exactement. Note : cette table est à 0 ligne en production (cf. `docs/RLS_ETAT_REEL.md` §1), possiblement obsolète au profit de `appointments`/`appointment_requests` — à clarifier avec Thierry avant d'investir du temps à la maintenir.

---

## 3. Enums réels non modélisés en TypeScript

Le schéma Postgres définit des types enum (`user_role`, `demande_status`, `urgence_level`, `payment_method`, `payment_status`, `expense_category`, `expense_status`, `client_type`, `transfert_mode`, `transfert_statut`, `quick_service_type`) que `types/index.ts` ne reprend que partiellement :

- `UserRole`, `DemandeStatus`, `UrgenceLevel` : présents et fidèles aux enums réels.
- `payment_method`, `payment_status`, `expense_category`, `expense_status`, `client_type`, `transfert_mode`, `transfert_statut`, `quick_service_type` : **aucun type TypeScript correspondant** — cohérent avec le constat du §1 (tables non typées).

Point notable : l'enum réel `payment_status` contient **11 valeurs** (`non_paye, partiel, paye, rembourse, annule, pending, paid, failed, validated, refunded, voided`) — un mélange visible de deux vocabulaires (français : `non_paye/paye/rembourse/annule` et anglais : `pending/paid/failed/validated/refunded/voided`), signe d'une migration de nomenclature en cours ou inachevée sur la table `payments` (confirmé par la présence de colonnes dupliquées `statut`/`status`, `mode_paiement`/`method`, `montant_total`/`amount` sur la même table réelle). **À clarifier en priorité avant toute Phase 6 (finance)** : quelle paire de colonnes fait foi aujourd'hui ?

---

## 4. Synthèse

| Catégorie | Nombre |
|---|---:|
| Tables réelles sans type TS | 12 |
| Tables typées avec écart de colonnes | 1 (`Contact`, 9 colonnes manquantes) |
| Tables typées et fidèles | 2 (`Profile`, `RendezVous`) |
| Colonne manquante sur type sinon fidèle | 1 (`Demande.client_record_id`) |
| Enums réels sans équivalent TS | 8 |

Rien ici ne bloque la Phase 1. C'est une dette à traiter en P2/P3 lors de l'extension du schéma, idéalement en régénérant les types directement depuis la base plutôt qu'en les maintenant à la main.
