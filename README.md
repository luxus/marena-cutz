# Marena Cutz Website

Astro 7 + Svelte islands + Tailwind landing page for Marena Cutz.

## Install

```bash
npm install
npm run dev
```

Dev server: `http://localhost:4321`

## Build

```bash
npm run build
```

Preview the Workers build locally:

```bash
npm run preview
```

(`astro check && astro build`, then `wrangler dev` for worker `marena-cutz`.)

Cloudflare Pages (static, native GitHub integration):

```txt
Build command: npm run build
Output directory: dist
Node: 24 (.node-version)
```

Worker name: `marena-cutz`.

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
- Mobile Sticky-Bar: Preise / Über uns / Termin / Barbers / Standort
- Preise direkt nach Hero
- Full-bleed salon photo. The photo fades in after a short delay so the shop LEDs feel like they power on. No WebGL.
