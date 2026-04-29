# Marena Cutz Website

Astro + Tailwind landingpage for Marena Cutz.

## Install

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Cloudflare Pages:

```txt
Build command: npm run build
Output directory: dist
```

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

## Design-Entscheidung

- Astro only, kein Svelte nötig
- Tailwind 4 via Vite Plugin
- Mobile Sticky-Bar: Preise / Buchen / Route
- Preise direkt nach Hero
- Stuhl, Clipper, Karte und Social-Previews als lokale Bildassets
