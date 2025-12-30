# Guide de Syntaxe Markdown - Documentation Moddy

Ce guide documente toutes les syntaxes et fonctionnalités disponibles pour écrire la documentation de Moddy.

---

## 📋 Table des matières

1. [Frontmatter (Métadonnées)](#frontmatter)
2. [En-têtes et Titres](#en-têtes)
3. [Composants Custom HTML](#composants-html)
4. [Shortcodes Nunjucks](#shortcodes)
5. [Images et Médias](#images)
6. [Blocs de Citation](#citations)
7. [Listes](#listes)
8. [Liens](#liens)
9. [Code](#code)
10. [Tableaux](#tableaux)
11. [Commentaires Conditionnels](#commentaires)

---

## Frontmatter

Les métadonnées du fichier se placent en début de fichier, soit en YAML classique, soit en commentaire HTML.

### Format 1 : YAML Classique (Recommandé)

```yaml
---
name: Buttons
title: Buttons
dirname: button
order: 1
---
```

### Format 2 : YAML en Commentaire HTML

```html
<!-- catalog-only-start --><!-- ---
name: Buttons
dirname: button
-----><!-- catalog-only-end -->
```

### Propriétés Disponibles

| Propriété | Description | Exemple |
|-----------|-------------|---------|
| `name` | Nom affiché dans la navigation | `"Introduction"` |
| `title` | Titre de la page (SEO) | `"Introduction to Moddy"` |
| `dirname` | Nom du répertoire pour les exemples | `"button"` |
| `order` | Ordre d'affichage dans la navigation | `1`, `2`, `3` |

---

## En-têtes

### Hiérarchie des titres

```markdown
# Titre H1 - Titre principal de la page

## Titre H2 - Section principale

### Titre H3 - Sous-section

#### Titre H4 - Détails
```

**Note :** Les titres H2, H3, H4 génèrent automatiquement une table des matières (TOC) dans la sidebar.

---

## Composants HTML

### Component Header (En-tête avec Image Hero)

```html
<catalog-component-header>
<catalog-component-header-title slot="title">

# Buttons

</catalog-component-header-title>

<img
    class="hero"
    alt="Description de l'image"
    title="Titre de l'image"
    src="images/button/hero.webp">

</catalog-component-header>
```

**Utilisation :**
- Pour les pages de composants uniquement
- L'image hero s'affiche en grand en haut de la page
- Le titre est placé dans le slot "title"

---

## Shortcodes

### Playground Example (Démo Interactive)

```nunjucks
{% playgroundexample dirname=dirname %}
```

**Options :**

```nunjucks
{% playgroundexample dirname=dirname, previewHeight=600, editorHeight=600 %}
{% playgroundexample dirname=dirname, previewHeight=700 %}
```

| Paramètre | Description | Défaut |
|-----------|-------------|--------|
| `dirname` | Dossier contenant l'exemple | Variable du frontmatter |
| `previewHeight` | Hauteur de la prévisualisation (px) | `400` |
| `editorHeight` | Hauteur de l'éditeur (px) | `400` |

---

## Images

### Image Standard

```markdown
![Texte alternatif](images/button/usage.webp "Titre optionnel")
```

### Image Hero (Grande image d'en-tête)

```html
<img
    class="hero"
    alt="Description accessible"
    title="Titre affiché au survol"
    src="images/button/hero.webp">
```

### Images dans Figures

Les figures HTML sont injectées automatiquement depuis `docs/components/figures/`.

**Exemple :** Le fichier `docs/components/figures/button/theming-filled-button.html` sera injecté dans le markdown.

### Organisation des Images

```
docs/
├── components/
│   ├── images/
│   │   └── button/
│   │       ├── hero.webp
│   │       ├── usage.webp
│   │       └── types.webp
│   └── figures/
│       └── button/
│           └── theming-filled-button.html
```

---

## Citations

### Citation Standard (Note)

```markdown
> Note: Les checkboxes ne sont pas automatiquement labelisées par les éléments `<label>`.
```

### Citation Important

```markdown
> **Important:** Ceci est un message important.
```

### Citation Warning (Avertissement)

```markdown
> Warning: Cette fonctionnalité nécessite Chrome 114 ou Safari 17.
```

### Citation Tip (Conseil)

```markdown
> Tip: Utilisez les propriétés CSS `margin`, `height`, et `width` pour contrôler la taille.
```

**Rendu visuel :**
- Les blockquotes sont stylisés avec des couleurs de fond selon le contexte
- `Note:` = bleu/informatif
- `Important:` = violet/primaire
- `Warning:` = rouge/erreur
- `Tip:` = vert/succès

---

## Listes

### Liste à Puces

```markdown
* Premier élément
* Deuxième élément
  * Sous-élément
* Troisième élément
```

ou

```markdown
- Premier élément
- Deuxième élément
```

### Liste Numérotée

```markdown
1. Première étape
2. Deuxième étape
3. Troisième étape
```

### Liste de Liens (Navigation)

```markdown
*   [Design article](https://m3.material.io/components/buttons) <!-- {.external} -->
*   [API Documentation](#api)
*   [Source code](https://github.com/material-components/material-web/tree/main/button)
```

---

## Liens

### Lien Standard

```markdown
[Texte du lien](https://example.com)
```

### Lien Externe

```markdown
[Material Design](https://material.io/)<!-- {.external} -->
```

**Note :** Le commentaire `<!-- {.external} -->` ajoute un icône externe et ouvre dans un nouvel onglet.

### Lien Interne (Ancre)

```markdown
[Voir l'API](#api)
[Retour en haut](#top)
```

### Lien vers une Page de la Doc

```markdown
[Voir les boutons](./button.md)
[Theming Guide](../theming/README.md)
```

---

## Code

### Code Inline

```markdown
Utilisez l'attribut `aria-label` pour l'accessibilité.
```

### Bloc de Code avec Coloration Syntaxique

#### HTML

```markdown
\`\`\`html
<md-filled-button>
  Click me
</md-filled-button>
\`\`\`
```

#### TypeScript

```markdown
\`\`\`ts
const button = document.querySelector('md-filled-button');
button.addEventListener('click', () => {
  console.log('Clicked!');
});
\`\`\`
```

#### CSS

```markdown
\`\`\`css
md-filled-button {
  --md-filled-button-container-color: #6750a4;
  --md-filled-button-label-text-color: #ffffff;
}
\`\`\`
```

#### JavaScript

```markdown
\`\`\`js
document.getElementById('myButton').disabled = true;
\`\`\`
```

**Langages supportés :**
- `html`, `css`, `js`, `ts`, `typescript`, `json`, `yaml`, `markdown`, `bash`, `sh`

---

## Tableaux

### Tableau Standard

```markdown
| Propriété | Type | Description |
|-----------|------|-------------|
| `disabled` | `boolean` | Désactive le bouton |
| `label` | `string` | Texte du bouton |
| `type` | `string` | Type de bouton |
```

### Tableau avec Alignement

```markdown
| Gauche | Centre | Droite |
|:-------|:------:|-------:|
| A | B | C |
| D | E | F |
```

**Rendu :**
- Les tableaux sont automatiquement stylisés avec des bordures arrondies
- Les en-têtes ont un fond gris avec text-shadow

---

## Commentaires

### Commentaires Invisibles (Documentation Interne)

```html
<!--*
# Document freshness
freshness: { owner: 'username' reviewed: '2025-11-23' }
tag: 'docType:reference'
*-->
```

**Note :** Ces commentaires sont supprimés lors de la génération et n'apparaissent pas dans le HTML final.

### Commentaires Conditionnels

#### Catalog-only (Visible uniquement sur le site de documentation)

```html
<!-- catalog-only-start -->
Ce contenu n'apparaît que dans le catalogue web.
<!-- catalog-only-end -->
```

#### No-catalog (Masqué sur le site de documentation)

```html
<!-- no-catalog-start -->
Ce contenu est masqué dans le catalogue web (utile pour GitHub).
<!-- no-catalog-end -->
```

#### External-only (Visible uniquement hors Google)

```html
<!-- external-only-start -->
Ce contenu est visible uniquement en dehors de l'environnement Google.
<!-- external-only-end -->
```

**Cas d'usage :**
- `catalog-only` : Démos interactives, contenu spécifique au web
- `no-catalog` : Informations GitHub, images statiques
- `external-only` : Messages pour les utilisateurs externes

---

## Structure Recommandée d'une Page

```markdown
---
name: Ma Fonctionnalité
title: Ma Fonctionnalité - Documentation Moddy
dirname: ma-fonctionnalite
order: 1
---

<catalog-component-header>
<catalog-component-header-title slot="title">

# Ma Fonctionnalité

Description courte de la fonctionnalité.

</catalog-component-header-title>

<img
    class="hero"
    alt="Image d'illustration"
    src="images/ma-fonctionnalite/hero.webp">

</catalog-component-header>

*   [Guide de design](#design)
*   [API Documentation](#api)

## Interactive Demo

{% playgroundexample dirname=dirname %}

## Description

Texte descriptif complet...

## Usage

### Exemple de base

\`\`\`html
<mon-element>Contenu</mon-element>
\`\`\`

### Avec options

\`\`\`ts
const element = document.querySelector('mon-element');
element.option = 'value';
\`\`\`

## Configuration

| Propriété | Type | Description |
|-----------|------|-------------|
| `disabled` | `boolean` | Active/désactive |

> Note: Informations importantes ici.

## API

Documentation détaillée de l'API...
```

---

## Exemples Complets

### Page "About" Simple

```markdown
---
name: Introduction
title: Introduction
order: 1
---

# Introduction à Moddy

Moddy est un bot Discord qui vous aide à...

## Fonctionnalités

* Gestion des serveurs
* Modération
* Statistiques
* Et plus encore !

## Installation

Pour installer Moddy :

1. Allez sur [notre site](https://moddy.bot)
2. Cliquez sur "Ajouter à Discord"
3. Sélectionnez votre serveur

> Tip: Assurez-vous d'avoir les permissions administrateur !
```

### Page Composant Complète

```markdown
---
name: Buttons
dirname: button
---

<catalog-component-header>
<catalog-component-header-title slot="title">

# Boutons

Les boutons permettent aux utilisateurs de déclencher des actions.

</catalog-component-header-title>

<img class="hero" alt="Boutons" src="images/button/hero.webp">

</catalog-component-header>

## Types

Il existe 5 types de boutons :

* Elevated
* Filled
* Filled Tonal
* Outlined
* Text

![Types de boutons](images/button/types.webp)

## Usage

\`\`\`html
<md-filled-button>Click me</md-filled-button>
\`\`\`

## Propriétés

| Propriété | Type | Défaut | Description |
|-----------|------|--------|-------------|
| `disabled` | `boolean` | `false` | Désactive le bouton |
| `label` | `string` | `""` | Texte du bouton |
```

---

## Bonnes Pratiques

### ✅ À Faire

- **Toujours** ajouter un frontmatter avec au minimum `name`
- Utiliser des titres H2 pour les sections principales
- Ajouter des textes alternatifs descriptifs aux images
- Utiliser les blockquotes pour les notes/warnings/tips
- Organiser les images dans `docs/[section]/images/[nom-section]/`
- Utiliser `<!-- {.external} -->` pour les liens externes

### ❌ À Éviter

- Ne pas sauter de niveaux de titres (H1 → H3 sans H2)
- Ne pas utiliser de HTML inline sauf pour les composants custom
- Ne pas mettre d'espaces dans les noms de fichiers images
- Ne pas oublier les textes alternatifs sur les images

---

## Organisation des Fichiers

```
docs/
├── intro.md                    # Page d'introduction
├── quick-start.md             # Guide de démarrage
├── components/
│   ├── button.md              # Page du composant
│   ├── checkbox.md
│   ├── images/
│   │   ├── button/
│   │   │   ├── hero.webp
│   │   │   ├── usage.webp
│   │   │   └── types.webp
│   │   └── checkbox/
│   │       └── hero.webp
│   ├── figures/               # Figures HTML injectées
│   │   └── button/
│   │       └── theming.html
│   └── components.json        # Config pour Eleventy
├── theming/
│   ├── README.md
│   ├── color.md
│   └── images/
└── images/                     # Images globales
    └── material-web.gif
```

---

## Variables Disponibles

Dans les templates, vous avez accès à :

| Variable | Description | Exemple |
|----------|-------------|---------|
| `{{ name }}` | Nom de la page (frontmatter) | "Buttons" |
| `{{ title }}` | Titre de la page | "Buttons - Moddy Docs" |
| `{{ dirname }}` | Dossier des exemples | "button" |
| `{{ page.url }}` | URL de la page actuelle | "/components/button/" |

---

## CSS Classes Utiles

### Sur les Images

```html
<img class="hero" src="..." alt="...">
```

**Classes disponibles :**
- `hero` : Grande image d'en-tête (hauteur 50% du viewport)

### Sur les Blockquotes

Les blockquotes sont automatiquement stylisées selon leur premier mot :
- Commence par "Note:" → style informatif (bleu)
- Commence par "Warning:" → style erreur (rouge)
- Commence par "Tip:" → style succès (vert)
- Commence par "Important:" → style primaire (violet)

---

## Processus de Build

Quand vous ajoutez/modifiez un fichier markdown :

1. **Écrire** votre fichier dans `/docs/`
2. Le script `copy-docs.mjs` **copie** et **transforme** les fichiers vers `/catalog/site/`
3. **Eleventy** génère le HTML final dans `/catalog/_prod/`
4. Les **figures HTML** sont automatiquement injectées dans le markdown

**Workflow :**
```
/docs/components/button.md
  ↓ (copy-docs)
/catalog/site/components/button.md
  ↓ (Eleventy + injection figures)
/catalog/_prod/components/button/index.html
```

---

## Raccourcis Pratiques

### Créer une Nouvelle Page

1. Créer `/docs/ma-page.md`
2. Ajouter le frontmatter
3. Écrire le contenu
4. Rebuilder : `npm run build:prod`

### Ajouter des Images

1. Créer le dossier `docs/components/images/ma-section/`
2. Ajouter vos images `.webp`
3. Référencer dans le markdown : `![Alt](images/ma-section/hero.webp)`

### Créer une Figure Interactive

1. Créer `docs/components/figures/ma-section/demo.html`
2. Écrire votre HTML/CSS/JS
3. Le système l'injectera automatiquement

---

## Support et Aide

Pour toute question sur la syntaxe :

1. Regardez les exemples dans `/docs/components/button.md`
2. Consultez la documentation Eleventy : https://www.11ty.dev/
3. Consultez la documentation Markdown-it : https://markdown-it.github.io/

---

**Version du guide :** 1.0
**Dernière mise à jour :** Décembre 2025
**Pour :** Documentation Moddy Bot Discord
