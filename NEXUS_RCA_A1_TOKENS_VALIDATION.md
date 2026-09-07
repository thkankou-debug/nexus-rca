# NEXUS RCA — TOKENS A1 : VALIDATION AMENDÉE
7 septembre 2026 · Réponse à l'échantillonnage soumis

**Verdict : option 1, avec quatre corrections.** L'échantillonnage est la bonne méthode et l'or relevé est juste. Trois familles de valeurs ne peuvent pas être retenues telles quelles, et un tiers du jeu de tokens manque — parce qu'il n'est pas échantillonnable.

---

## A. RETENU SANS RÉSERVE

| Token | Valeur | Rôle |
|---|---|---|
| `nexus-gold` | **#B99760** | Accent unique. Or désaturé tirant vers le bronze — c'est exactement le registre attendu |
| `nexus-ivory` | **#F5F3F0** | Surface claire |
| `nexus-navy` | **#021030** | Texte principal sur fond clair |

Le couple bouton — navy **#021030** sur or **#B99760** — mesure environ **6,8:1**. Il passe AA très confortablement, y compris pour du petit texte. C'est la confirmation que la règle « libellé bleu nuit sur bouton or » était la bonne : l'or clair ne supporterait pas du blanc.

---

## B. CORRECTION 1 — Trois bleus nuit non coordonnés

`#021321`, `#081926` et `#021030` sont trois valeurs proches mais issues de trois endroits sans rapport, dont deux prélevées **sur une photographie**. Un fond de couverture photographique n'est pas une couleur de marque : c'est un pixel d'image, qui changera le jour où l'image changera.

**À faire :** définir **une seule échelle de bleu nuit**, dérivée de `#021030` déjà validé comme texte, avec trois à quatre paliers cohérents (`navy-950` le plus sombre pour les fonds pleins, `navy-900`, `navy-800`). Le fond de couverture utilise un palier de cette échelle, pas un prélèvement d'image. Les valeurs `#021321` et `#081926` servent de repère de cible visuelle, pas de token.

Une échelle construite reste cohérente sous toutes les combinaisons ; trois échantillons indépendants divergent dès la première interpolation.

---

## C. CORRECTION 2 — L'or du titre n'est pas un second or

`#B89F70–#D1A962` est une plage, pas une couleur : c'est l'anti-crénelage du texte qui a été échantillonné, pas sa couleur. Un titre n'est jamais une zone de prélèvement fiable.

**À faire :** le titre utilise **`nexus-gold` #B99760**, le même token que le bouton, prélevé lui sur un aplat large. Un seul or dans toute la plateforme. S'il faut une variante pour un état ou un fond, elle est **dérivée** de celui-là, jamais échantillonnée ailleurs.

**Règle générale d'échantillonnage** : prélever uniquement sur des aplats larges et uniformes, en moyennant une zone de plusieurs pixels — jamais sur du texte, jamais sur un bord, jamais sur une photographie.

---

## D. CORRECTION 3 — Le gris secondaire est à construire, pas à relever

`#91959A` à 2,72:1 échoue AA, et le diagnostic est le bon : c'est de l'anti-crénelage. Mais la conclusion n'est pas « refaire le prélèvement » — c'est que **ce token ne s'échantillonne pas**.

**À faire :** dériver le gris secondaire de la famille bleu nuit, en assombrissant jusqu'à atteindre au moins **4,5:1 sur ivoire #F5F3F0**. Un gris bleuté autour de **#5A6270** atteint environ 5,6:1 — à mesurer et ajuster, pas à recopier. Deux raisons de le dériver plutôt que de le relever : le seuil AA est une contrainte de calcul, et `#91959A` est un gris **neutre chaud** dans une palette **bleutée** — il jurerait.

Même méthode pour `--text-muted` : dérivé, mesuré, jamais sous 4,5:1 pour du texte lisible.

---

## E. CORRECTION 4 — Un tiers des tokens manque, et il n'est pas échantillonnable

Sept valeurs ont été relevées. La couche sémantique en demande une vingtaine. Les manquantes ne sont dans aucune maquette :

**États** — or survol · or actif · or désactivé · anneau de focus · navy survol · fond de ligne survolée · fond de ligne sélectionnée. Tous **dérivés** de `nexus-gold` et de l'échelle navy, tous **mesurés** : E1 impose ≥ 3:1 pour les composants et les états de focus, ce qui exclut un survol obtenu par une simple baisse d'opacité.

**Bordures** — `--border` et `--border-strong`, dérivés de l'échelle navy à faible opacité, jamais un gris neutre.

**Sémantiques** — `--danger`, `--warning`, `--success`, `--info`. **Aucune n'existe dans la maquette**, et c'est la difficulté réelle : `--warning` est traditionnellement ambre, donc voisin de l'or. Dans une interface où l'or signifie « action principale », un ambre d'avertissement crée une confusion permanente. Deux options : décaler l'avertissement vers un orange nettement plus rouge et plus saturé que l'or, ou le distinguer par la forme (icône, bordure) et non par la seule couleur. **À trancher et à documenter avant A2**, sinon chaque composant réinventera sa propre alerte.

---

## F. UN POINT QUI N'EST PAS UNE QUESTION DE COULEUR

Le tableau d'avancement indique P1a-bis, P1b, P1c, A1 et A2 « ✅ terminée » au 5 septembre. Or je n'ai jamais reçu :

1. le **verdict sur l'auto-élévation de rôle** dans `profiles` — la question ouverte depuis P1a ;
2. les **sorties des sept tests de P1b** (`SET ROLE anon`, énumération par référence, par jeton, double déclaration) ;
3. la **confirmation de Thierry** qu'il a renvoyé les nouvelles URLs aux clients détenteurs de liens actifs — c'était un STOP explicite au milieu de P1b, avec une étape humaine ;
4. le **récapitulatif de A2** et la page `/dashboard/_design-system` à valider en ligne.

Une phase n'est terminée que lorsque son RÉCAP a été rendu et validé. Cocher la case sans le récap vide le tableau de sa fonction : il devient une liste d'intentions au lieu d'un état réel — et c'est précisément ce qui a permis de développer P10 alors que ses préalables n'étaient pas remplis.

**Avant de coder A1 : rendre les quatre récapitulatifs manquants**, ou repasser les phases concernées en « partielle » avec ce qui reste à faire. Ce n'est pas une formalité : le point 3 concerne des clients qui attendent peut-être encore de pouvoir payer.

---

## G. RÉPONSE À LA QUESTION POSÉE

**Option 1, amendée** : inscrire `nexus-gold #B99760`, `nexus-ivory #F5F3F0` et `nexus-navy #021030`, construire l'échelle navy par-dessus plutôt que de retenir les deux prélèvements photographiques, dériver le gris secondaire au lieu de le relever, puis compléter les états et les sémantiques.

Livrable avant tout composant : le tableau complet — nom du token, valeur, origine (échantillonné ou dérivé), et pour chaque couple utilisé le ratio mesuré avec son verdict AA. Y compris les états de survol, actif et focus.

**Le visuel de couverture reste ouvert** et n'est pas un sujet de tokens : c'est la décision de Thierry entre photographie réelle, composition graphique sobre et image sous licence. En attendant, aplat bleu nuit typographique.
