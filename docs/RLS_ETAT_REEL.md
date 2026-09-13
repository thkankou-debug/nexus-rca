# ÉTAT RÉEL DES RLS — PRODUCTION
**Phase 0.5 du Plan V3 révisé — lecture seule, base `nexus-rca -new` (ref `yyoptsxdoekbmibkwikj`, ca-central-1)**
Date : 5 septembre 2026 · Source : `list_tables`, `get_advisors`, `execute_sql` (SELECT uniquement) via MCP Supabase

---

## ⚠️ SIGNALEMENT PRIORITAIRE — À LIRE EN PREMIER

**Aucune table ne manque de RLS.** Les 40 tables du schéma `public` ont `rowsecurity = true` (confirmé à la fois par `list_tables` et par une requête directe sur `pg_class`). Le point critique soulevé dans `docs/AUDIT_V3.md` (§3.2, §7) est donc **résolu** : aucune table contenant des données personnelles ne tourne sans RLS.

**Mais une policy équivaut en pratique à une absence de protection en lecture :**

> Table `public.payment_links`, policy `"Public can read payment_links by reference"` (SELECT) :
> `USING (true)`

Le nom de la policy suggère un accès scopé « par référence connue », mais la clause `USING` réelle est `true` sans condition — **n'importe qui, authentifié ou non, peut lire l'intégralité de la table `payment_links`** via l'API REST Supabase (`GET /rest/v1/payment_links?select=*`), pas seulement une ligne dont il connaît la référence. Cette table contient : nom, email, téléphone du client, montant, service, notes internes (`notes_staff`), numéro de transaction Mobile Money partiel. **C'est une fuite de données personnelles actuellement active en production**, distincte de l'absence de rate-limiting déjà notée dans l'audit P0 sur l'endpoint `declare`.

Recommandation immédiate (à valider avant/pendant P1) : remplacer `USING (true)` par une condition réellement scopée à la référence demandée (ex. via une fonction `current_setting`/paramètre de requête, ou en retirant l'accès `anon`/`public` du SELECT et en passant par une route API serveur qui vérifie la référence côté serveur avant de renvoyer les données minimales nécessaires à l'affichage de `/payer/[reference]`).

---

## 1. Inventaire complet — 40 tables, RLS et policies

| Table | RLS | Nb policies | Lignes (au 5/09) |
|---|:--:|---:|---:|
| profiles | ✅ | 6 | 20 |
| demandes | ✅ | 8 | 19 |
| rendez_vous | ✅ | 4 | 0 |
| contacts | ✅ | 5 | 4 |
| demande_documents | ✅ | 5 | 1 |
| appointment_requests | ✅ | 5 | 6 |
| payments | ✅ | 5 | 3 |
| expenses | ✅ | 8 | 3 |
| clients | ✅ | 7 | 2 |
| transferts | ✅ | 5 | 2 |
| quick_sales | ✅ | 6 | 9 |
| appointments | ✅ | 5 | 4 |
| payment_links | ✅ | 4 | 9 |
| payment_events | ✅ | 1 | 0 |
| stripe_webhook_log | ✅ | 1 | 0 |
| visa_express_requests | ✅ | 2 | 3 |
| notifications | ✅ | 2 | 138 |
| monthly_reports | ✅ | 1 | 5 |
| employees | ✅ | 2 | 7 |
| payslips | ✅ | 5 | 2 |
| payslip_validation_history | ✅ | 1 | 6 |
| hr_documents | ✅ | 2 | 7 |
| employee_notes | ✅ | 2 | 0 |
| company_documents | ✅ | 2 | 0 |
| leave_types | ✅ | 2 | 9 |
| leave_requests | ✅ | 4 | 1 |
| leave_balances | ✅ | 2 | 0 |
| holidays_car | ✅ | 2 | 12 |
| onboarding_templates | ✅ | 2 | 4 |
| employee_onboarding | ✅ | 2 | 0 |
| onboarding_tasks | ✅ | 2 | 0 |
| review_periods | ✅ | 2 | 1 |
| performance_reviews | ✅ | 3 | 2 |
| rh_settings | ✅ | 2 | 13 |
| insurance_quotes | ✅ | 2 | 1 |
| demande_status_history | ✅ | 2 | 0 |
| demande_documents_requests | ✅ | 2 | 0 |
| demande_messages | ✅ | 3 | 0 |
| demande_notes | ✅ | 1 | 0 |
| contact_demandes | ✅ | 3 | 0 |

**Total : 40/40 tables avec RLS activée, 0 table sans RLS, 128 policies au total.**

> Note sur les volumes : plusieurs tables « cœur métier » (`rendez_vous`, `demande_documents_requests`, `demande_messages`, `demande_notes`, `demande_status_history`, `employee_notes`, `employee_onboarding`, `onboarding_tasks`, `leave_balances`, `company_documents`) sont à **0 ligne**. Certaines sont normales pour un système jeune (historique pas encore accumulé), d'autres suggèrent un chantier commencé mais pas encore utilisé en conditions réelles (à vérifier fonctionnellement, hors périmètre lecture-seule de cette phase).

---

## 2. Détail des 15 tables « trou 001-017 » (non couvertes par les migrations 018-032 du dépôt)

Ce sont les tables identifiées dans `docs/AUDIT_V3.md` §3.2 comme dépourvues de fichier de migration local. Voici leur état RLS réel, policy par policy.

### `profiles`
| Policy | Commande | Condition (USING / WITH CHECK) |
|---|---|---|
| Users can view own profile | SELECT | `auth.uid() = id` |
| Users can update own profile | UPDATE | `auth.uid() = id` |
| Staff can view all profiles | SELECT | `is_staff(auth.uid())` |
| Super admin full access on profiles | ALL | `get_user_role(auth.uid()) = 'super_admin'` |
| Super admin can update any profile | UPDATE | `get_user_role(auth.uid()) = 'super_admin'` |
| Super admin can delete profiles | DELETE | `get_user_role(auth.uid()) = 'super_admin'` |

Verdict : sain. Un utilisateur ne peut modifier que son propre `role` via « Users can update own profile » **si** aucune restriction de colonne n'existe — à vérifier en Phase 1 si cette policy permet à un client de s'auto-promouvoir `role = 'admin'` (Postgres RLS ne restreint pas par colonne par défaut ; une `CHECK` ou un trigger séparé serait nécessaire pour bloquer l'auto-élévation de rôle). **Point à vérifier en priorité en P1.**

### `demandes`
8 policies. Client : lecture de ses propres demandes (par `client_id` ou par email correspondant à son profil). Staff (`is_staff`) : lecture/écriture large. `super_admin` : suppression. Insertion publique (`true`) — cohérent avec le formulaire public de demande. Verdict : sain, cloisonnement client correct.

### `clients`
7 policies. `is_admin`/`is_staff` pour la lecture/écriture staff, `auth.uid() = profile_id` pour l'auto-lecture. Verdict : sain.

### `payments`
5 policies. Lecture : super_admin/admin (tout), `created_by` ou `client_id` (le sien), ou agent assigné au dossier lié. **Suppression bloquée pour tous (`payments_no_delete` → `USING (false)`)** — conforme à la règle blueprint « aucune suppression sur les paiements ». Écriture (update) réservée à super_admin/admin. Verdict : sain, bon exemple de séparation des pouvoirs.

### `payment_links`
4 policies. **Voir signalement prioritaire ci-dessus** — SELECT publique sans condition. INSERT réservé au staff. DELETE réservé à super_admin. UPDATE ouverte si statut encore modifiable ou si staff.

### `payment_events`
1 policy, lecture réservée à super_admin/admin. Table conçue comme journal immuable (aucune policy UPDATE/DELETE) — bon pattern, cohérent avec la demande blueprint §8 sur `audit_log`.

### `stripe_webhook_log`
1 policy, lecture réservée à super_admin uniquement. Écriture faite exclusivement via la clé `service_role` côté webhook (pas de policy INSERT pour les rôles applicatifs) — sain.

### `appointments`
5 policies. Client : lecture/annulation de son propre RDV (par `client_id` ou email). Agent assigné : lecture. Admin/super_admin : lecture large, suppression réservée à super_admin.

### `appointment_requests`
5 policies. INSERT ouverte à `anon`+`authenticated` (formulaire public `/rendez-vous`). Lecture/mise à jour réservées au staff. Client peut lire ses propres demandes par email. Sain.

### `rendez_vous`
4 policies, cloisonnement client/staff correct (table à 0 ligne — probablement remplacée fonctionnellement par `appointments`/`appointment_requests`, à clarifier).

### `demande_documents`
5 policies. Lecture/suppression conditionnées à la propriété de la demande liée ou au statut staff. Sain.

### `expenses`
8 policies. Séparation claire agent (ses propres dépenses, uniquement si `en_attente`) / admin (tout) / super_admin (tout). Bon exemple de séparation des tâches (blueprint §2.2).

### `transferts`
5 policies, pattern identique à `expenses` (agent restreint à ses créations, admin/super_admin large).

### `quick_sales`
6 policies, même pattern.

### `contact_demandes`
3 policies. INSERT public (formulaire `/contact-pro`), lecture/update réservés à `agent`/`admin`/`super_admin`. Sain. Note : FK vers `auth.users` directement plutôt que `public.profiles` (seule table du dépôt à faire ça) — incohérence mineure de convention, sans impact RLS.

---

## 3. Fonctions `SECURITY DEFINER` recensées

| Fonction | Rôle | Search_path fixé ? |
|---|---|:--:|
| `is_staff(uuid)` | `role IN ('agent','admin','super_admin')` | ❌ (WARN advisor) |
| `is_admin(uuid)` | `role IN ('admin','super_admin')` | ❌ |
| `get_user_role(uuid)` | Retourne `profiles.role` | ❌ |
| `handle_new_user()` | Trigger `auth.users` → crée le profil avec `role='client'` par défaut | ❌ |
| `assign_demande_to_agent()`, `auto_link_appointment_to_client()`, `auto_link_demande_to_client()`, `auto_link_orphan_demandes_on_profile_creation()`, `find_available_agent()`, `gen_demande_ref()`, `gen_insurance_quote_ref()`, `get_occupied_slots()`, `notify_specialist_agents()` | Triggers/RPC métier | ❌ |

Le security advisor Supabase signale ces fonctions en **WARN** (`function_search_path_mutable`) : sans `SET search_path = public` explicite, une fonction `SECURITY DEFINER` est théoriquement exposée à un détournement de `search_path` par un rôle malveillant créant un objet de même nom dans un autre schéma prioritaire. Risque théorique, pas d'exploitation démontrée, mais correction simple (`ALTER FUNCTION ... SET search_path = public`) à faire en P1.

Le advisor signale aussi que plusieurs de ces fonctions (`assign_demande_to_agent`, `auto_link_*`, `find_available_agent`, `gen_demande_ref`, `get_occupied_slots`, `get_user_role`, `handle_new_user`, `is_admin`, `is_staff`, `notify_specialist_agents`) sont exécutables via RPC public (`/rest/v1/rpc/...`) par `anon` ET `authenticated`. Pour les fonctions de lecture pure (`is_staff`, `is_admin`, `get_user_role`) c'est sans risque (elles ne font que lire un rôle). Pour les fonctions qui modifient des données en tant que trigger (`assign_demande_to_agent`, `auto_link_*`) — **à vérifier en P1** si elles sont appelables directement en RPC avec des effets de bord non désirés, indépendamment de leur usage normal en tant que trigger interne.

---

## 4. Fonctions/triggers de génération de référence

Deux stratégies coexistent (incohérence mineure, sans risque immédiat car toutes les colonnes `reference` ont une contrainte `UNIQUE`) :

- **Par séquence** (garantie d'unicité) : `appointments` (`RDV-YYYY-NNNNNN` via `appointments_ref_seq`), `payment_links` (`PAY-LINK-YYYY-NNNNNN` via `payment_links_ref_seq`), `demandes` (`DEM-YYYY-NNNNNN` via `gen_demande_ref()` scannant le max existant — pattern légèrement différent, recalcul par `MAX(...)::integer + 1` au lieu d'une vraie séquence Postgres, donc théoriquement sujet à une race condition sous forte concurrence, atténuée par la contrainte `UNIQUE`).
- **Par suffixe aléatoire** (`md5(random())`, collision quasi nulle mais non garantie mathématiquement) : `clients` (`CL-YYYY-XXXXXX`), `expenses` (`DEP-YYYY-XXXXXX`), `payments` (`PAY-YYYY-XXXXXX`), `quick_sales` (`CR-YYYY-XXXXXX`), `transferts` (`TR-YYYY-XXXXXX`).

Aucun de ces formats ne suit la convention `NRCA-{ANNÉE}-{SERVICE}-{SÉQUENCE}` proposée par le blueprint §3.3 — la convention réelle est plus simple et déjà en production. **Ne pas la changer sans raison forte** (changerait le format de référence vu par des milliers de clients potentiels).

---

## 5. Performance (secondaire, non bloquant)

`get_advisors(type=performance)` renvoie 462 signalements, tous WARN/INFO (aucun ERROR) :
- 241 `multiple_permissive_policies` — plusieurs policies permissives sur la même table/action, réévaluées à chaque ligne.
- 118 `auth_rls_initplan` — `auth.uid()` appelé sans `(select auth.uid())`, réévalué par ligne au lieu d'une fois par requête.
- 61 `unused_index` — index jamais utilisés (candidats à la suppression, à confirmer avec plus d'historique de requêtes).
- 42 `unindexed_foreign_keys` — colonnes de clé étrangère sans index couvrant (ex. tous les `*_by`/`*_id` d'audit : `expenses_validated_by`, `payments_validated_by`, `transferts_validated_by`, etc.), qui ralentiront les jointures à mesure que le volume grandit.

Non bloquant pour la Phase 1, à traiter dans la même phase que le nettoyage RLS (P1) puisque les deux passent par les mêmes fichiers de policies.

---

## 6. Verdict final

**BASELINE ÉTABLIE — 40 tables, 0 sans RLS.**

Le seul point nécessitant une décision avant la suite est le signalement prioritaire du §0 (`payment_links` lisible publiquement en intégralité). Ce n'est pas une table « sans RLS » au sens strict de la consigne de la Phase 0.5, mais l'effet pratique — exposition de données personnelles de clients sans authentification — est équivalent. Je le traite donc avec la même urgence.

**EN ATTENTE DE GO** pour la Phase 1 (qui devra a minima : corriger la policy `payment_links` SELECT, fixer les `search_path` des fonctions `SECURITY DEFINER`, vérifier l'auto-élévation de rôle sur `profiles`, et traiter les 7 endpoints publics sans rate-limiting déjà identifiés dans `docs/AUDIT_V3.md`).
