# moddy.app

Le site de [Moddy](https://moddy.app), le bot Discord tout-en-un : modération par IA,
AltGuard, logs, tickets, messages de bienvenue, notifications sociales… configurés
depuis un dashboard web.

> Built to let you focus on your community.

## Démarrer

Prérequis : Node.js 20.9+ et pnpm.

```bash
pnpm install
pnpm dev                      # http://localhost:3000
MODDY_API_MOCK=1 pnpm dev     # avec les données de fixtures/ au lieu de l'API
```

| Commande | Rôle |
| --- | --- |
| `pnpm dev` | serveur de développement |
| `pnpm build` / `pnpm start` | build et service de production |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | types des routes + TypeScript |
| `pnpm format` | Prettier |
| `pnpm icons` | régénère les icônes Material |

## Stack

Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · shadcn/ui (radix-maia) ·
next-intl (anglais, français) · next-themes · icônes Google Material Symbols ·
police Google Sans.

## Pages

| Route | Contenu |
| --- | --- |
| `/` | accueil : serveurs qui utilisent Moddy, bento, chiffres |
| `/modules` | tous les modules, avec liens vers la documentation |
| `/premium` | Moddy Max : avantages, comparatif, abonnement |
| `/install`, `/support`, `/status`, `/terms`, `/privacy`, `/license` | redirections |

Chaque page existe aussi en français sous `/fr`.

## Documentation

Architecture, conventions (shadcn/ui, icônes, i18n, design), sources de données
et déploiement : voir [`CLAUDE.md`](./CLAUDE.md).

Documentation produit : [docs.moddy.app](https://docs.moddy.app).

## Licence

Le code de ce site est sous licence [MIT](./LICENSE).
