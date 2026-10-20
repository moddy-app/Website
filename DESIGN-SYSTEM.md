# Moddy Design System

Référence unique du look de moddy.app, à copier dans tout autre service Moddy
(par ex. un réseau de type LinkedIn). Les valeurs viennent du code du site
(`site/site/css/global.css`, `site/site/css/home-page.css`, `site/site/_includes/default.html`).
Si le site change, ce fichier doit changer avec.

Un service Moddy doit avoir l'air d'avoir toujours fait partie du même site :
mêmes marges, mêmes cartes, même police, mêmes couleurs, même mouvement.

---

## 0. Stack à reprendre

| | |
|---|---|
| Composants | **Material Web** (`@material/web`), boutons, menus, champs, tooltips |
| Web components | Lit |
| Thème | Material 3, généré à partir d'une couleur seed (`@material/material-color-utilities`, `SchemeContent`) |
| Police | Google Sans (variable) + Google Sans Mono, auto-hébergées |
| Icônes | Material Symbols Outlined |
| Langues | Tout texte visible vient de fichiers i18n, jamais en dur |

Le thème est entièrement porté par des variables CSS `--md-sys-color-*`. C'est ce
qui permet un thème aléatoire, clair et sombre, sans rien casser.

---

## 1. Principes

1. **Bento minimal.** La page est une grille de cartes arrondies unies. Une idée
   par carte : un titre, une ou deux phrases, au plus une illustration ou quelques boutons.
2. **Rien de décoratif sans sens.** Pas de dégradé sur les cartes, pas de halo, pas
   d'ombre sur les cartes, pas de motif de fond, pas d'emoji. Un visuel montre le
   produit en train de faire quelque chose (un vrai message, une ligne de log, une
   ligne de tableau de bord), sinon il n'existe pas.
3. **Calme.** Le mouvement est rare et utile (section 8). Rien ne bouge seul,
   sauf à l'intérieur d'une illustration visible.
4. **Mêmes marges partout.** Une seule valeur d'espacement par niveau. Si deux
   écarts d'une page diffèrent, l'un des deux est faux.

---

## 2. Couleurs

### Règle absolue

**Uniquement les tokens Material** `--md-sys-color-*`. Jamais de valeur hex dans le CSS.
Le thème change à chaque chargement (seed aléatoire), en clair et en sombre : toute
couleur codée en dur jurera avec certains thèmes.

### Seeds du thème aléatoire

`#003BCC` (bleu Moddy), `#6750A4`, `#0B8A7A`, `#D6336C`, `#E8590C`, `#2F9E44`,
`#1C7ED6`, `#AE3EC9`, `#C2255C`, `#5C7CFA`. Seeds vifs, avec assez de chroma pour
avoir une identité. Chaque seed est transformé en thème complet (clair + sombre) au
build, la page n'a qu'à en appliquer un avant le premier rendu (aucun flash).
Si l'utilisateur en choisit un, le choix est verrouillé.

Rôles générés : `background`, `surface`, `surface-dim`, `surface-bright`,
`surface-container-lowest/low/(défaut)/high/highest`, `on-surface`,
`surface-variant`, `on-surface-variant`, `inverse-surface`, `inverse-on-surface`,
`outline`, `outline-variant`, `primary`, `on-primary`, `primary-container`,
`on-primary-container`, `inverse-primary`, idem `secondary-*` et `tertiary-*`,
`error`, `on-error`, `error-container`, `on-error-container`, `shadow`, `scrim`, `surface-tint`.

### Surfaces (la hiérarchie la plus importante)

| Élément | Token |
|---|---|
| Fond de page (mis sur `:root`) | `surface-container` |
| Cartes | `surface-container-lowest` (un cran plus clair que la page) |
| Panneaux intérieurs (chip, pill de chemin, ligne de liste, carte utilisateur du menu) | `surface-container` |
| Menus | `surface-container-lowest` |

### Zones colorées

- **Petites** (formes d'icône, badges) : conteneurs `primary-container`,
  `tertiary-container`, `secondary-container`, ou `primary` pour l'unique accent plein (`.tone-solid`).
- **Grandes** (tuiles, gros aplats) : teintes douces, jamais les conteneurs, trop
  vifs à cette taille :

```css
--tint-primary:   color-mix(in srgb, var(--md-sys-color-primary-container)   22%, var(--md-sys-color-surface-container-lowest));
--tint-tertiary:  color-mix(in srgb, var(--md-sys-color-tertiary-container)  22%, var(--md-sys-color-surface-container-lowest));
--tint-secondary: color-mix(in srgb, var(--md-sys-color-secondary-container) 45%, var(--md-sys-color-surface-container-lowest));
```

### Texte

| Usage | Token |
|---|---|
| Titres | `on-surface` |
| Corps et texte secondaire | `on-surface-variant` |
| Accents (chiffres, badges, liens) | `primary` |
| Erreurs, déconnexion, actions destructives | `error` uniquement |

### Seules couleurs calculées depuis un contenu

Les tuiles de serveur et l'anneau Moddy Max, tirés de l'image (`src/utils/main-color.ts`),
avec les couleurs du thème en repli. Pour un réseau type LinkedIn : cela peut
s'appliquer à la bannière d'un profil ou d'une entreprise, avec le même repli.

---

## 3. Typographie

### Polices

| | |
|---|---|
| Texte et titres | **Google Sans**, variable, poids 400 à 700 dans un seul fichier `variable.woff2` |
| Code, chemins, ids | **Google Sans Mono**, poids 400, `mono.woff2` |
| Repli | `'Google Sans', Roboto, system-ui` |
| Chargement | auto-hébergées, `font-display: swap`, préchargées, plage `unicode-range` latine |

```css
@font-face {
  font-family: 'Google Sans';
  font-style: normal;
  font-weight: 400 700;
  font-display: swap;
  src: url(/fonts/google-sans/variable.woff2) format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,
    U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215,
    U+FEFF, U+FFFD;
}
@font-face {
  font-family: 'Google Sans Mono';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(/fonts/google-sans/mono.woff2) format('woff2');
  /* même unicode-range + U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329 */
}
:root {
  font-family: 'Google Sans', Roboto, system-ui;
  --md-ref-typeface-plain: 'Google Sans', Roboto, system-ui; /* Material Web suit la même police */
}
```

Les fichiers de police sont dans `site/site/fonts/google-sans/` du dépôt : à copier tels quels.

### Poids

- **600** pour tous les titres (`h1`…`h6`) et les noms (`strong`, `b`), avec `-webkit-font-smoothing: antialiased`.
- **400 à 500** pour le texte.
- Jamais de 700 ni de gras synthétique.

### Échelle

| Usage | Taille | Interligne | Notes |
|---|---|---|---|
| `h1` de page (hero uniquement) | `clamp(38px, 5.2vw, 64px)` | 1.15 | `letter-spacing: -0.01em` |
| `h2` de carte | 28px (24px ≤ 600px) | 1.15 | |
| `h3` / sur-titre de carte | 15px | 1.15 | couleur `on-surface-variant` |
| Corps | 16px (`--catalog-body-l-font-size`, 14px ≤ 600px) | 1.5 | largeur max ~560px, `on-surface-variant` |
| Corps du hero | 18px | 1.5 | |
| Petit texte | 13 à 15px | | |
| Titre de ligne (`.row-title`) | 15px | | une ligne, `text-overflow: ellipsis` |
| Méta en mono (`.row-meta`) | 12px | | `Google Sans Mono`, `on-surface-variant` |
| Statut (`.status`) | 12px, poids 600 | | |
| Chip | 14px (`--catalog-body-m-font-size`) | | |

Variables d'échelle (copiées de la bibliothèque Material "mio", sur `:root`) :

```css
--catalog-display-xl-font-size: 88px;   /* 55px ≤ 600px */
--catalog-display-m-font-size: 45px;
--catalog-headline-s-font-size: 24px;
--catalog-title-l-font-size: 22px;      /* 16px ≤ 600px */
--catalog-title-m-font-size: 16px;
--catalog-title-s-font-size: 14px;
--catalog-body-l-font-size: 16px;       /* 14px ≤ 600px */
--catalog-body-m-font-size: 14px;       /* 12px ≤ 600px */
--catalog-label-s-font-size: 11px;
```

### Marges verticales d'un bloc de texte

Dans une carte : forme/icône, puis `h2` avec `margin: 20px 0 10px`, puis paragraphe
(`margin: 0`). Le premier enfant n'a pas de marge haute.

### Règles

- **Chiffres qui changent** (stats, compteurs, nombre de relations, de vues) :
  `font-variant-numeric: tabular-nums` et format de la langue (`Intl.NumberFormat`).
- **Valeurs dynamiques que l'utilisateur n'a pas écrites** (chemin, id, @handle
  technique) : dans une pill mono, jamais en ligne dans une phrase.
- Liens : `primary`, sans soulignement, soulignés au survol et au focus clavier.
- `scroll-margin-top` sur les titres pour qu'ils ne collent pas à la barre.

---

## 4. Espacement et mise en page

| Token | Bureau | ≤ 600px | Usage |
|---|---|---|---|
| `--page-gap` | 20px | 12px | marge de la page, écart entre cartes, espace au-dessus du footer |
| `--home-card-padding` (= `--space`) | 32px | 20px | padding des cartes **et** espace entre blocs dans une carte |
| `--home-card-radius` | 32px | 24px | angles des cartes |
| Largeur du contenu | max **1240px**, centré | pleine largeur | |
| Hauteur de la barre du haut | 72px (`48px + 2 × 12px`) | | `--catalog-top-app-bar-height` |

Échelle d'espacement interne : `--catalog-spacing-s` 8px, `-m` 12px, `-l` 16px,
`-xl` 28px (16px ≤ 600px). Formes : `--catalog-shape-xs` 4px, `-s` 8px, `-m` 12px,
`-l` 16px, `-xl` 28px.

### Grille bento

```css
.bento { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: var(--page-gap); }
.card  { grid-column: span 12; }            /* défaut : toute la largeur */
.span-3 … .span-8 { grid-column: span N; }
```

- Les cartes prennent `span-3` à `span-8`. **Les rangées doivent être pleines** :
  pas de trou, les spans d'une rangée font 12.
- ≤ 1100px : tout span ≥ 4 devient 12, `span-3` devient 6.
- ≤ 900px : `.card.split` (texte d'un côté, visuel de l'autre) passe en une colonne.
- ≤ 600px : rayon et padding réduits.
- **Vérifier à 390px de large : aucun défilement horizontal, jamais.**
- Les boutons restent en bas de leur carte (`.card-actions`, `margin-top: auto`,
  `gap: 12px`, `padding-top: var(--space)`).
- **Pages spéciales** (404 et similaires) : `hideFooter`, contenu plus étroit
  (~1040px, 640px une fois empilé) et centré dans les deux sens.

### Structure de page

```
.page-layout (colonne flex, min-height 100%)
 ├─ .page-topbar   sticky, top: 0, z-index 10   → barre du haut
 ├─ main.page-content   flex: 1; padding: var(--page-gap) var(--page-gap) 0
 │    └─ .home / .bento   (max-width 1240px, margin: 0 auto)
 └─ footer
```

---

## 5. Cartes

```html
<section class="card span-7">
  <span class="edge-caps" aria-hidden="true"><i class="cap-top"><b class="tl"></b><b class="tr"></b></i><span class="own"><b class="tl"></b><b class="tr"></b><b class="bl"></b><b class="br"></b></span><i class="cap-bottom"><b class="bl"></b><b class="br"></b></i></span>
  <h2>Titre</h2>
  <p>Une ou deux phrases.</p>
  <div class="card-actions">…</div>
</section>
```

- Fond `surface-container-lowest`, texte `on-surface`, `padding: var(--home-card-padding)`,
  `display: flex; flex-direction: column`.
- **`overflow: clip`** (pas `hidden`, qui casserait le sticky des coins).
- **Toute carte commence par le span `edge-caps`**, à copier tel quel. La carte n'a
  alors pas de `border-radius` : ses coins sont dessinés par de petites pièces dans la
  couleur de la page (`.own`), et deux paires sticky (`.cap-top`, `.cap-bottom`)
  gardent les coins ronds là où la carte rencontre la barre du haut et la marge du
  bas de la fenêtre (bande fixe `.bento::after`, haute d'une marge de page, que le
  footer recouvre).
- Sur les deux derniers rayons, les pièces rétrécissent avec `transform: scale()`
  sur la view timeline de la carte, la carte finit en pilule. **Seulement
  `transform`** : ça tourne sur le compositeur, au rythme du scroll. Ne jamais
  animer `border-radius`, une propriété custom, un clip-path ou autre au scroll :
  tout a été essayé et saccade sur téléphone. La pilule ne tourne qu'à la souris
  (`@media (hover: hover) and (pointer: fine)`), les téléphones gardent les pièces simples.
- Tout le CSS des `edge-caps` est dans `home-page.css`, section "Cards leave the
  screen with rounded corners" : à copier en bloc avec `.bento::after`.
- Titre de carte `h2` (`h1` seulement pour le hero de la page). Ordre : **titre →
  texte → (visuel) → actions**, séparés par `--space`.
- Variantes : `.card.split` (2 colonnes texte/visuel, `.reverse` inverse),
  `.card.hero` (contenu centré verticalement, une seule par page).
- **Survol : seulement si toute la carte est un lien.** Sinon, aucun hover sur les cartes.
- Un visuel dans une carte empilée (`.card-visual`) se place un `--space` sous le
  texte et un `--space` au-dessus des boutons, et grandit pour remplir (les cartes
  d'une rangée finissent égales, sans trou).

### Panneaux intérieurs

- `.panel` : `padding: 20px; border-radius: 24px; background: surface-container`.
- `.row` : ligne de liste, `padding: 12px 14px; border-radius: 16px; gap: 14px`,
  fond `surface-container`. Contenu : petite forme, deux lignes de texte
  (`.row-title` + `.row-meta`), un statut à droite.
- `.chip` : 36px de haut, `border: 1px solid outline-variant`, rayon 8px, texte 14px
  `on-surface-variant`, fond `surface-container-lowest`, icône 18px `primary` remplie.
  Un chip lien se remplit au survol et sa flèche glisse.
- `.status` : pill `padding: 4px 10px; border-radius: 999px`, 12px poids 600,
  `secondary-container` / `on-secondary-container`.

---

## 6. Icônes, formes et composants

### Icônes

**Material Symbols Outlined**, **remplies** (`'FILL' 1`) dans les formes, menus et
badges. Aucun emoji nulle part.

```css
font-variation-settings: 'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24;
```

### Formes d'icône

Une icône de fonctionnalité vit dans une **forme polygonale**, jamais un cercle ni un trèfle.

```html
<span class="shape shape-hexagon tone-tertiary"><span class="material-symbols-outlined">verified</span></span>
```

- Formes : `square`, `diamond`, `pentagon`, `hexagon`, `heptagon`, `octagon`
  (masques SVG à coins arrondis, définis dans `home-page.css`, section "Icon shapes").
- Tons : défaut (`primary-container`), `tone-secondary`, `tone-tertiary`,
  `tone-solid` (`primary` plein, texte `on-primary`).
- Tailles : 56px (icône 28px) ou `.small` 36px (icône 20px).
- La forme est un `::before` masqué, pour ne jamais rogner l'icône. Pentagone et
  heptagone ont leur centre visuel plus bas : l'icône est décalée de 5 % / 2,5 % de la hauteur.
- **Varier formes et tons entre cartes voisines.**

### Boutons

**Material Web uniquement.** `md-filled-button` pour l'unique action principale,
`md-outlined-button` pour les autres, **trois au maximum** par rangée. Aucun bouton
maison. Avant que le composant soit défini, il garde sa taille finale (40px de haut,
24px de padding) et reste caché pour ne jamais montrer son libellé brut.

### Menus (`md-menu`)

Conteneur `surface-container-lowest`, coins 24px, items de 48px de haut avec coins 16px
et marge latérale 8px, icônes de tête remplies, séparateur inset de 16px des deux
côtés, item destructif en `error`. Pas d'icône "lien externe".

### Tooltips

`inverse-surface` / `inverse-on-surface`, coins 4px, texte 12px, fondu d'opacité seulement.

### Avatars

Ronds, `object-fit: cover`. Les personnes d'exemple dans les illustrations utilisent
des avatars style Memoji (`site/site/images/avatars/*.webp`) et `moddy.webp` pour
Moddy. Jamais d'initiales ni de photos de stock.
Pour un réseau type LinkedIn : les vrais profils affichent la photo de l'utilisateur ;
les exemples (landing, états vides, captures) utilisent les Memoji.

### Menu utilisateur et barre du haut

- `@pseudo` + email, un badge de vérification rond (`check_circle`, 16px, `primary`,
  **une seule icône pour tous les types**, le type est dans son tooltip).
- Anneau autour de l'avatar de la barre pour Moddy Max (dans la barre seulement, pas
  dans le menu). Il est dessiné **à l'extérieur** de l'image : l'avatar garde ses 32px.
- Menu de thème (footer) : les couleurs du site en pastilles rondes (celle choisie
  devient un carré arrondi avec une coche), après une pastille "aléatoire à chaque
  visite", un panneau de couleur personnalisée (sélecteur + hex + curseurs HCT), et
  le mode de couleur en trois segments (clair / sombre / auto). Garder chacun de ces éléments.

---

## 7. Page de type réseau social (LinkedIn) : comment appliquer le système

Pas de composant à inventer : tout se compose avec les briques ci-dessus.

| Besoin | Brique |
|---|---|
| Fil d'actualité | une colonne de `.card` à `span-8`, un post = une carte, avatar rond + nom (600) + méta mono/petite en `on-surface-variant` |
| Colonne latérale (profil rapide, suggestions) | cartes `span-4` |
| En-tête de profil | carte pleine largeur, bannière tirée de l'image (couleur principale calculée, repli thème), avatar rond, nom en `h1` ou `h2` |
| Expériences, formations | `.rows` : une `.row` par entrée avec petite forme, titre, méta, statut/date |
| Compétences, tags | `.chip` |
| Offres d'emploi | `.row` avec forme, titre, entreprise en méta, statut en `.status` |
| Messagerie, notifications | `.rows` dans une carte, pastille de non-lu en `tone-solid` |
| Réactions, commentaires | boutons Material (`md-text-button` / `md-icon-button`), jamais de bouton maison |
| Compteurs (relations, vues) | `primary`, `tabular-nums`, `Intl.NumberFormat` |
| Formulaires | champs Material Web (`md-outlined-text-field`), action principale `md-filled-button` |
| Pseudos, ids, URLs de profil | pill mono |
| États vides | une carte, une forme, une phrase, un bouton |

Contraintes qui restent vraies même dans une app dense : une carte garde un seul
propos, les rangées de la grille sont pleines, pas de hover sur une carte qui n'est
pas un lien, pas de couleur en dur (y compris pour les statuts : utiliser
`primary` / `secondary` / `tertiary` / `error` et leurs conteneurs).

---

## 8. Mouvement

- **Tout le mouvement est dans `@media (prefers-reduced-motion: no-preference)`.**
  Sans cela, chaque illustration montre son état final et rien ne bouge.
- Easing `cubic-bezier(0.2, 0, 0, 1)` (`--ease`). **150 à 400ms** pour l'UI, plus
  lent seulement pour les boucles d'ambiance (une forme qui tourne en 24s).
- **Survol seulement sur ce qui réagit au pointeur** (liens, chips, boutons) et
  seulement quand ça dit quelque chose (un chip se remplit, sa flèche glisse). Pas de
  hover sur les stats, le texte ou les illustrations.
- Les illustrations sont de petites démos scriptées (`playDemo` / `stepper` avec
  `data-at`, `data-done-at`, `data-press-at`, dans `src/pages/home-page.ts`) qui
  tournent **seulement quand elles sont visibles** (`loopWhileVisible`). Aucune
  animation d'entrée au scroll sur les cartes.
- **Ne jamais calculer quoi que ce soit au scroll.** Préférer le CSS que le
  navigateur compose (sticky, transforms).
- **Chargement** : la page reste cachée (`html.booting`, `body { opacity: 0 }`) jusqu'à
  ce que les composants à l'écran soient définis et les polices chargées (1,5s max),
  puis elle apparaît en fondu (150ms `ease-out`). Les composants non définis gardent
  leur taille finale. Pas de flash de police de repli, de boutons bruts ou de noms d'icônes.

---

## 9. Rédaction

- Simple, précis, court. Dire ce que fait Moddy, avec de vraies fonctions et de vrais chiffres.
- Interdits : le remplissage marketing ("seamless", "powerful", "unlock", "elevate",
  "supercharge", "revolutionize", "next level" et équivalents), les questions
  rhétoriques, les triplets pour le rythme, les incises avec tirets cadratins.
- Une petite blague est permise sur une impasse (404), jamais dans le texte produit.
- La baseline "Built to let you focus on your community" reste **en anglais dans
  toutes les langues**.
- En cas de doute, écrire le français d'abord, puis traduire chaque langue
  correctement (expressions adaptées, pas mot à mot).

### i18n (obligatoire)

- Langues : en (à `/`), fr, es, pt-br, de (à `/fr`, `/es`, `/pt-br`, `/de`).
- Chaque chaîne visible vient de `i18n/<locale>.json`, **dans les 5 langues**. Le build
  échoue si une clé manque.
- Les composants reçoivent leur texte par un attribut JSON `labels`, jamais en dur.
- Nombres et prix : `formatNumber` / `formatPrice` (`Intl`).

---

## 10. Accessibilité et robustesse

- Focus clavier visible : `outline: 2px solid primary; outline-offset: 2px`.
- Contrastes assurés par les paires Material (`on-*` sur le conteneur correspondant), à ne pas mélanger.
- Éléments décoratifs en `aria-hidden="true"` (les `edge-caps`).
- Les URLs de scripts finissent par `?v=<version de build>` : les scripts gardent leur
  nom entre déploiements et le CDN les met en cache des heures, sans cela un visiteur
  qui revient exécute un ancien JS sur du nouveau HTML.
- Le site refuse d'être affiché dans un `iframe` : il redirige la fenêtre parente vers lui-même.

---

## 11. Checklist avant de pousser un changement visuel

1. Le build passe (y compris le contrôle des clés i18n).
2. Captures Playwright (Chromium à `/opt/pw-browsers/chromium`) à **1400px** et
   **390px**, clair et sombre, dans au moins **deux langues**. Les regarder.
3. Faire défiler une carte au-delà de la barre du haut et du bord bas : les coins restent ronds.
4. Recharger plusieurs fois : aucun saut de mise en page, et le thème aléatoire est bon avec chaque seed.
5. Aucune couleur hex, aucun emoji, aucun gradient, aucune ombre sur une carte.
6. Les rangées de la grille sont pleines et il n'y a pas de défilement horizontal à 390px.

---

## 12. Fichiers à copier pour démarrer un nouveau service

| Fichier du site | Contenu |
|---|---|
| `site/site/css/global.css` | `@font-face`, variables d'échelle, styles de base |
| `site/site/css/home-page.css` | cartes, bento, formes, panneaux, edge-caps, mouvement |
| `site/site/fonts/google-sans/` | `variable.woff2`, `mono.woff2` |
| `site/site/_data/palettes.js` | génération des thèmes à partir des seeds |
| `site/site/_includes/partials/random-theme.html` | application du thème avant le rendu |
| `site/site/_includes/default.html` | layout, `html.booting`, `--page-gap`, structure de page |
| `site/src/components/top-app-bar.ts` | barre du haut et menu utilisateur |
| `site/src/utils/main-color.ts` | couleur principale d'une image |
| `site/src/utils/material-color-helpers.ts` | génération de thème côté navigateur |
| `site/site/images/avatars/` | avatars Memoji d'exemple et `moddy.webp` |
