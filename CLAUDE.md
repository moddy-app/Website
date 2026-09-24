@AGENTS.md

# moddy.app — guide du dépôt

Site vitrine de **Moddy**, le bot Discord tout-en-un. Ce fichier est la référence
pour toute personne (ou agent) qui travaille sur le site : lis-le en entier avant
de modifier quoi que ce soit.

## Stack

| Brique | Choix |
| --- | --- |
| Framework | **Next.js 16** (App Router, React 19, Server Components, Turbopack) |
| UI | **shadcn/ui** uniquement — style `radix-maia`, base **Radix**, thème `blue`, couleur de base `neutral` |
| CSS | **Tailwind CSS v4** (`app/globals.css`, pas de `tailwind.config`) |
| i18n | **next-intl 4** — `en` (défaut, sans préfixe) et `fr` (`/fr`) |
| Thèmes | **next-themes** — clair, sombre, système |
| Icônes | **Google Material Symbols (filled)** générées dans `components/icons.tsx` |
| Police | **Google Sans** (+ Google Sans Code) via `next/font`, auto-hébergée |
| Gestionnaire | **pnpm** |
| Hébergement | Vercel (`vercel.json` à la racine) |

> ⚠️ Next.js 16 a des changements cassants (params asynchrones, `proxy.ts` au lieu
> de `middleware.ts`…). La doc exacte de la version installée est dans
> `node_modules/next/dist/docs/` : lis-la plutôt que de te fier à ta mémoire.

## Commandes

```bash
pnpm dev          # serveur de dev (http://localhost:3000)
pnpm build        # build de production
pnpm start        # sert le build
pnpm lint         # ESLint
pnpm typecheck    # next typegen + tsc --noEmit
pnpm format       # Prettier (+ tri des classes Tailwind)
pnpm icons        # régénère components/icons.tsx
```

Avant chaque commit : `pnpm typecheck && pnpm lint && pnpm build` doivent passer.

`MODDY_API_MOCK=1 pnpm dev` remplace les appels à l'API publique par les fichiers
de `fixtures/` (utile hors ligne ou quand un endpoint n'est pas encore déployé).
Ignoré en production.

## Arborescence

```
app/
  [locale]/layout.tsx        layout racine : <html>, providers, header, bannière, footer, metadata
  [locale]/page.tsx          accueil
  [locale]/modules/          page Modules
  [locale]/premium/          page Moddy Max
  [locale]/[...rest]/        chemins inconnus : /redirects/lookup puis 404
  [locale]/not-found.tsx     404 (avec easter egg)
  [locale]/opengraph-image   image OG générée par langue
  globals.css                tokens de thème (shadcn + Moddy), utilitaires
  icon.svg, apple-icon, sitemap, robots, manifest
components/
  ui/                        composants shadcn (générés par le CLI, voir règles)
  icons.tsx                  icônes Material (GÉNÉRÉ — ne pas éditer)
  site/                      header, footer, navigation, bannière, logo, Section…
  home/ modules/ premium/    composants propres à chaque page
i18n/                        routing, navigation typée, request config, resolveLocale
messages/<locale>/<ns>.json  traductions, un fichier par namespace
lib/                         api (données serveur), auth (session), site-config, metadata, modules
fixtures/                    réponses d'API de test (MODDY_API_MOCK=1)
public/brand/                fichiers de marque officiels (logo, symbole, avatar, icône d'app)
scripts/generate-icons.mjs   générateur d'icônes
proxy.ts                     détection de langue / redirections next-intl
```

## Règles shadcn/ui (obligatoires)

Le skill officiel est versionné dans `.claude/skills/shadcn/` et le serveur MCP
shadcn est déclaré dans `.mcp.json`. **Lis `SKILL.md` et `rules/*.md`**, ils font foi.
L'essentiel :

- **Uniquement des composants shadcn** (`@/components/ui/*`). Avant d'utiliser un
  composant : `pnpm dlx shadcn@latest docs <composant>` puis lire les URLs.
- Ajouter un composant : `pnpm dlx shadcn@latest add <composant>`, puis
  **remplacer ses imports Phosphor par `@/components/icons`** (le CLI génère du
  Phosphor, ESLint le refuse), puis relire le fichier.
- `className` sert à la mise en page, pas à changer couleurs ou typographie des
  composants. Pour un nouveau style : ajouter une **variante** au composant.
- Couleurs : **tokens sémantiques uniquement** (`bg-primary`, `text-muted-foreground`,
  `bg-surface`…). Jamais `bg-blue-500`, jamais de `dark:` sur une couleur.
- `gap-*` (jamais `space-y-*`), `size-*` quand largeur = hauteur, `truncate`.
- Icônes dans un `Button` : `data-icon="inline-start|inline-end"`, sans classe de taille.
- `Card` complète (`CardHeader`/`CardTitle`/`CardContent`/`CardFooter`), `Avatar`
  toujours avec `AvatarFallback`, `Sheet`/`Dialog` toujours avec un titre.
- Chargement d'un bouton : `<Spinner data-icon="inline-start" />` + `disabled`.
- Chat / conversation : `Message`, `Bubble`, `Marker` (pas de div faites main).

### Personnalisations de composants (déjà en place)

- `Card` : `variant="default" | "primary" | "inverted"` (tuile bleue / tuile contrastée).
- `Avatar` : `shape="circle" | "squircle"` (icônes de serveurs façon app).
- Icônes des composants `ui/` passées de Phosphor à Material.

## Design

Minimaliste, inspiré d'apple.com : beaucoup d'air, titres larges en semi-gras avec
approche resserrée, textes courts, alignements parfaits. La perfection est dans
les détails : vérifier chaque page en 375 / 768 / 1280 px, en clair et en sombre.

- **Mise en page** : `Section` + `SectionHeader` (`components/site/section.tsx`)
  donnent largeur (`max-w-5xl`), espacements et styles de titres communs.
  Alterner `tone="default"` et `tone="surface"`.
- **Tokens Moddy** (`app/globals.css`) :
  - `--brand` / `--brand-wordmark` : couleur du logo, **#0046F8** en clair,
    **#BEC2FF** en sombre ;
  - `--surface` : fond des sections alternées ;
  - `--inverted` : tuiles contrastées (sombres en clair, claires en sombre) ;
  - `--success` : pastilles de statut.
- **Animations** : CSS uniquement (`tw-animate-css`, `animate-float`, utilitaire
  `reveal` basé sur le scroll). Tout est désactivé sous `prefers-reduced-motion`.
- **Logo** (`components/site/logo.tsx`) : tracés copiés à l'identique des
  fichiers officiels de `public/brand/`. **Seule la couleur peut changer** —
  ne jamais modifier les chemins ni la `viewBox`.

## Icônes

Google **Material Symbols**, style *outlined* rempli (= Material Icons « Filled »),
graisse 400, depuis le paquet officiel `@material-symbols/svg-400`. Logos de
marque (Discord) depuis Simple Icons.

- Importer depuis `@/components/icons` (fonctionne en Server et Client Components).
- Ajouter une icône : ajouter `NomExport: "nom_material"` dans `MATERIAL`
  (`scripts/generate-icons.mjs`), nom trouvé sur https://fonts.google.com/icons,
  puis `pnpm icons`.
- `@phosphor-icons/react` et `lucide-react` sont interdits par ESLint.

## Internationalisation

- Langues : `i18n/routing.ts`. Anglais sur `/`, français sur `/fr`, détection
  `Accept-Language` + cookie par `proxy.ts`.
- Traductions : `messages/<locale>/<namespace>.json` (`common`, `home`, `modules`,
  `premium`, `notFound`), typées depuis l'anglais : une clé manquante casse
  `pnpm typecheck`.
- **Ajouter une langue** : créer `messages/<locale>/` avec tous les namespaces,
  ajouter la locale dans `i18n/routing.ts` et son nom dans `common.locale`.
- Chaque page commence par `const locale = await resolveLocale(params)`
  (`@/i18n/server`) : 404 sur une langue inconnue + rendu statique.
- Liens internes : `Link` de `@/i18n/navigation` (jamais `next/link`).
- Métadonnées : `getAlternates(href, locale)` (`@/lib/metadata`) pour canonical + hreflang.
- Français : espace fine insécable (U+202F) avant `: ; ! ?` et dans « », apostrophe ’.
- La baseline **« Built to let you focus on your community »** reste en anglais
  dans toutes les langues : c'est la signature de marque.
- Liens vers la doc : `docsUrl(chemin, locale)` (`@/lib/site-config`).

## Données

Tout passe par `lib/api.ts`, **côté serveur** (ISR, revalidation 10 min) :
pages statiques, pas de CORS, et aucun faux chiffre en cas de panne (la section
concernée est masquée).

| Donnée | Source |
| --- | --- |
| Serveurs, utilisateurs | `GET https://api.moddy.app/public/stats` |
| Icônes du hero | `GET https://api.moddy.app/public/stats/top-guilds` (60 plus gros serveurs, recalculés chaque jour ; liste vide → tuiles neutres aux icônes des modules) |
| Disponibilité, état global | Better Stack : `https://status.moddy.app/index.json` |
| Badge de statut (footer) | iframe officielle `status.moddy.app/badge?theme=light|dark` |
| Bannières du site | `health.moddy.app/v1/status/banner?service=moddy-website`, sinon `GET /banners/active` (côté client, toutes les 60 s) |
| Redirections dynamiques | `GET /redirects/lookup?domain=&path=` sur les chemins inconnus |
| Langues du bot | constante `siteConfig.botLanguages` |
| Modules | `lib/modules.ts` (contenu tiré de docs.moddy.app) |

### Session et connexion

Cookie HttpOnly `session_token` posé par l'API sur `.moddy.app` après OAuth
Discord. Le site ne lit jamais le jeton : `GET /auth/me` (`credentials: "include"`)
dit qui est connecté. Conséquence : **la connexion ne fonctionne que sur
moddy.app** (pas sur les previews Vercel ni en local).

- Connexion : `getLoginUrl(redirect)` → `api.moddy.app/auth/login`
- Déconnexion : `POST /auth/logout`
- Installation du bot : `installUrl("<emplacement>")` → `api.moddy.app/install`
  avec `utm_medium=website` et `utm_content` (statistiques d'acquisition)
- Paiement Moddy Max : `POST /stripe/create-checkout` (`plan`, `return_url`)

## Redirections

Dans `next.config.ts` : `/install`, `/support`, `/status`, `/terms`, `/privacy`,
`/license`. Les chemins inconnus interrogent `/redirects/lookup` avant d'afficher
la 404.

## Déploiement

Vercel, framework Next.js, racine du dépôt. Aucune variable d'environnement
n'est requise en production.
