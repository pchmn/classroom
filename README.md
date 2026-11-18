# Classroom

Activités de classe interactives (fractions, …) pour l'école primaire.

## Développement

Requires Node 24 and [Vite+](https://viteplus.dev) (`vp`).

```sh
vp install
vp dev          # dev server
vp check        # format, lint, type check
vp test         # unit tests
vp build        # static build in dist/
pnpm export 7 5 # grid PNG/SVG for Google Slides, in exports/
```

See [AGENTS.md](AGENTS.md) for the architecture and how to add an activity.

## Deploy

`pnpm run deploy:pages` builds and uploads `dist/` to the `classroom-work` Cloudflare Pages project, with your local `wrangler login`.
