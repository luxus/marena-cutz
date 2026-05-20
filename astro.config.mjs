import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import svelte from '@astrojs/svelte';
import cloudflare from '@astrojs/cloudflare';
export default defineConfig({
  integrations: [svelte()],
  vite: { plugins: [tailwindcss()] },
  adapter: cloudflare()
});