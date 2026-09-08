# P10 — Livrables de validation (Étape 1, avant tout développement)

Rapport produit le 07/09/2026, conformément à la feuille de route V3, §"Livrables à présenter avant tout développement de P10". Aucun composant de production modifié à cette étape — uniquement une migration additive (072) nécessaire pour produire le point E3 honnêtement.

---

## E1 — Contrastes mesurés (WCAG, formule officielle, pas à l'œil)

Calculés sur les valeurs réelles des tokens A1 (`app/globals.css`) et du navy public gelé `nexus-blue-950` (`#02071F`, CLAUDE.md — non modifié).

| Paire | Ratio | Texte normal (≥4,5:1) | Grand texte / composant (≥3:1) |
|---|---|---|---|
| Or `#B99760` sur Navy public `#02071F` (accent, icône) | 7,27:1 | OK | OK |
| Navy `#021030` sur Or `#B99760` (texte bouton CTA or) | 6,84:1 | OK | OK |
| Blanc `#FFFFFF` sur Navy public `#02071F` (titre héros) | 19,95:1 | OK | OK |
| Slate-300 `#CBD5E1` sur Navy public `#02071F` (sous-titre) | 13,44:1 | OK | OK |
| Or-hover `#A3854A` sur Navy public `#02071F` (lien survolé) | 5,71:1 | OK | OK |
| Navy `#021030` sur Or-hover `#A3854A` (bouton CTA survolé) | 5,37:1 | OK | OK |
| Navy `#02071F` sur Blanc `#FFFFFF` (texte sur fond clair) | 19,95:1 | OK | OK |
| **Or `#B99760` sur Blanc `#FFFFFF` (texte sur carte claire)** | **2,74:1** | **ÉCHEC** | **ÉCHEC** |

**Verdict** : une seule paire échoue, et c'est justement l'usage que la feuille de route interdit déjà explicitement — *"L'or est une couleur d'accent, jamais une couleur de petit texte"* (E1). Règle à appliquer strictement en P10 : l'or ne sert jamais de couleur de texte sur fond clair (cartes, footer clair, contenu éditorial) — seulement comme fond de bouton (avec texte navy dessus), bordure, ou icône de taille suffisante. Sur navy, l'or passe partout, y compris en texte normal.

**Hors périmètre mesuré ici** (noté, pas oublié) : la teinte "ivoire" pour les surfaces publiques n'a pas de token dédié — A1 l'a explicitement laissée de côté (*"Hors périmètre de ce lot : surfaces ivoire vs blanc ... pour le site public"*, docs/DETTE.md). Tant qu'elle n'existe pas, le site public utilise blanc et navy, ce qui est sûr (19,95:1) mais pas la nuance visée par D8. À trancher : est-ce qu'on introduit ce token avant la suite de P10, ou est-ce que "ivoire" reste une intention pour une version ultérieure ?

---

## E2 — Inventaire réel des appels à l'action

Le libellé officiel unique (*"Soumettre une demande"*) est déjà en place à plusieurs endroits, vestige d'un lot antérieur (commit `7bd64d5`, git log : "feat(p10): lot 1 - token or mesure + CTA harmonise (navbar/hero/footer)") :

| Fichier | Libellé actuel | Couleur actuelle | Conforme E2 ? |
|---|---|---|---|
| `components/layout/Navbar.tsx` (`open_dossier`) | Soumettre une demande | `bg-brand` (or) | Oui |
| `components/layout/Footer.tsx` | — (icônes sociales seulement, hover `bg-brand`) | `bg-brand` (or) | N/A |
| `components/Hero.tsx` (home, `cta_primary`) | Soumettre une demande | `bg-nexus-orange-500` | Libellé oui, couleur non migrée |
| `components/Hero.tsx` (home, `cta_secondary`) | Prendre rendez-vous | `bg-nexus-orange-500` | **Non** — E2 réserve "Découvrir nos expertises" au secondaire de couverture |
| `components/FinalCTA.tsx` | **Soumettre mon dossier** | `bg-nexus-orange-500` | **Non** — libellé divergent |
| `app/rendez-vous/page.tsx` | Soumettre une demande | à vérifier | Oui (libellé) |
| `app/nexus-connect/page.tsx` (×3) | Soumettre une demande | à vérifier | Oui (libellé) |

**Constat central** : la migration vers le token or (`bg-brand`) s'est arrêtée à mi-chemin sur la branche `v3/integration-v3` — `Navbar`/`Footer` sont sur l'or, `Hero`/`FinalCTA` encore sur l'orange brut `nexus-orange-500`. **Rien de tout cela n'est en production** (seul `main` déploie, CLAUDE.md) — c'est un état intermédiaire de la branche de travail, pas une régression visible des clients. Mais c'est un point à trancher avant la suite : je recommande de finir la migration (tout sur `bg-brand`) plutôt que de revenir en arrière, puisque `Navbar`/`Footer` sont déjà validés ainsi.

**Pages `services/*` et `TravelCTA.tsx`** : non auditées individuellement à cette étape (11 pages, chacune 1200+ lignes) — ce passage systématique fait partie du "reste de la phase", pas de ce livrable de cadrage.

---

## E3 — CMS des 8 pôles : requête, correspondance, écarts réels

Migration **072** appliquée (`is_featured boolean DEFAULT true`, `display_order integer`, backfillé depuis `ordre_affichage` existant — vérifié, 14/14 lignes). Types TypeScript régénérés (`types/database.ts`, 4691 lignes).

Requête de production pour la grille des 8 pôles (page d'accueil et page `/services`) :
```sql
select slug, nom, categorie, description, display_order
from services
where status = 'actif' and is_featured = true
order by display_order;
```

**État réel des 8 pôles officiels dans `services`** (vérifié en direct, pas supposé) :

| Pôle officiel | Slug(s) en base | Page `app/services/...` existante ? |
|---|---|---|
| Visa et mobilité | `visa` | Oui |
| Services administratifs | `administratif` | Oui |
| Financement et incubation | `financement` | Oui |
| Digitalisation et technologie | `digitalisation` | Oui |
| Assurance et voyage | `assurance`, `billets` | Oui (2 pages) |
| Études internationales | `etudes`, `bourses`, `tcf` | Oui (3 pages) |
| Réseau international | `change`, `transfert`, `reseau-international` | `change`/`transfert` oui — **`reseau-international` non** |
| Accompagnement business | `accompagnement-business` | **Non** |

Hors 8 pôles officiels : `nexus-ia` (`categorie = 'transverse'`), déjà avec sa propre page — à ne pas afficher dans la grille des 8 pôles si elle est filtrée strictement sur les 8 catégories officielles (un `where categorie <> 'transverse'` ou équivalent, à trancher selon la présentation retenue).

**Écart réel, pas dans la feuille de route** : le dépôt compte aujourd'hui **12 dossiers `app/services/*`** (et non 7 comme écrit dans la feuille de route au 5 septembre — le compte a bougé depuis). Sur ces 12, **2 pôles officiels n'ont toujours aucune page** : `accompagnement-business` et le pôle "Réseau international" pris comme ensemble (il a 2 pages spécifiques, `change` et `transfert`, mais pas de page fédératrice — la ligne `services` au slug `reseau-international` n'a rien où pointer).

**Décision à prendre par vous, je ne peux pas trancher seul** :
1. `accompagnement-business` : construire une nouvelle page de service, ou est-ce un pôle qui n'a pas encore d'offre commerciale concrète (auquel cas on l'affiche avec un contenu minimal "en développement", jamais un faux contenu) ?
2. Le slug `reseau-international` en base : devient-il une page sommaire qui renvoie vers `change` et `transfert`, ou est-ce une ligne à retirer (le pôle reste représenté par ses 2 pages existantes sans page-pôle dédiée) ?

**Redirections 301** : aucune nécessaire pour l'instant — aucune URL de service existante ne change dans ce plan (les 10 pages déjà en place gardent leur slug).

---

## E4 — Inventaire des visuels disponibles

- `maquette-site-public.png` (racine du dépôt, non versionné) : référence de composition et de ton uniquement, validée par vous le 5 septembre — **ne se publie jamais telle quelle** (E4).
- `public/team/thierry-kankou.jpg`, `public/team/orson-dibert.jpg` : **photos réelles déjà utilisées publiquement** sur `app/a-propos/page.tsx` — donc déjà autorisées pour diffusion publique dans ce contexte. Réutilisables pour la crédibilité institutionnelle (E8) sans démarche supplémentaire, si vous confirmez que l'autorisation couvre aussi une réutilisation en page d'accueil.
- `public/og-image.jpg` : image de partage réseaux sociaux existante, à vérifier si elle convient comme solution de repli pour la couverture ou si elle est trop basse résolution / pas au bon ratio.
- **Aucune photographie des bureaux de Bangui trouvée dans le dépôt.** Pour l'image de couverture (E4), il faut soit une photo réelle des bureaux/de l'équipe en situation, soit — à défaut — la composition graphique institutionnelle sobre prévue en repli par la feuille de route elle-même.

---

## Ce qui reste bloqué sur vous (E5 à E8, et le point 6 des livrables)

Rien à cet endroit ne peut être produit sans donnée réelle de votre part :

1. **E8 — Données institutionnelles vérifiables** : dénomination juridique exacte, forme juridique, numéro RCCM, numéro fiscal publiable, horaires/conditions de réception, interlocuteurs nommés autorisés à apparaître publiquement.
2. **E4 / point de droit** : photo(s) réelle(s) des bureaux et/ou de l'équipe en situation, avec autorisation écrite pour toute personne identifiable au-delà de vous et Orson (déjà couverts pour `/a-propos`).
3. **Maquette mobile** : seule la version desktop existe (`maquette-site-public.png`). Dites-moi si je la dérive moi-même pour votre relecture, ou si vous en fournissez une.
4. **Décisions E3** ci-dessus (pôles `accompagnement-business` et `reseau-international`).
5. **Décision E2** : je termine la migration or (`Hero.tsx`, `FinalCTA.tsx` → `bg-brand`) et j'harmonise `FinalCTA.tsx` sur "Soumettre une demande" — confirmez que c'est la bonne direction avant que je le fasse, puisque ce n'est pas un simple constat mais une modification de code.
6. **Décision E1** : token "ivoire" public — à créer maintenant ou à reporter ?

Tant que 1 et 2 ne sont pas fournis, les champs concernés n'affichent rien (règle du chiffre honnête, `is_verified`/`is_published`) — ce n'est pas un blocage technique, c'est le comportement voulu.
