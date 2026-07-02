# Marena Cutz Website

Astro 7 + Svelte islands + Tailwind landing page for Marena Cutz.

## Install

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Cloudflare Pages (static):

```txt
Build command: npm run build
Output directory: dist
```

Important: output must be `dist`, not `dist/client` (that was only with the old Cloudflare adapter).

Deploy on push to `main` runs in the CI workflow after tests pass. Required GitHub repo secrets:

- `CLOUDFLARE_API_TOKEN` — Pages Edit permission
- `CLOUDFLARE_ACCOUNT_ID` — from Cloudflare dashboard

If the native Cloudflare Pages GitHub integration is still enabled, either disable it (to avoid double deploys) or set its output directory to `dist` and retry the failed build.

No Cloudflare adapter — fully static site, `astro dev` runs on Vite (no workerd).

## Content bearbeiten

Die wichtigsten Inhalte liegen in Markdown-Frontmatter:

```txt
src/content/home.md
src/content/prices.md
src/content/about.md
```

Bilder liegen in:

```txt
public/images/
```

## Themes

Nur **Architectural Neon** ist aktiv. Weitere Themes: siehe Kommentar in `src/lib/themes.ts` (Key in `themes.ts`, CSS-Blöcke in `global.css`, `validThemes` in `BaseLayout.astro`).

## Design-Entscheidung

- Astro static-first, Svelte 5 islands für Drawer/Accordion/Carousel
- Tailwind 4 via Vite Plugin
- Mobile Sticky-Bar: Preise / Buchen / Route
- Preise direkt nach Hero