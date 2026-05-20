import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import svelte from '@astrojs/svelte';
import cloudflare from '@astrojs/cloudflare';
export default defineConfig({
  integrations: [svelte()],
  vite: { plugins: [tailwindcss()] },
  adapter: cloudflare(),
  // Explicit session configuration (Issue 10). The Cloudflare adapter will use the SESSION KV binding
  // declared in wrangler.jsonc. Replace the placeholder KV ID in wrangler.jsonc for real production deploys.
  // Theme/mode preference cookies have a matching 1-year lifetime; the KV TTL acts as server-side safety net.
  session: {
    ttl: 60 * 60 * 24 * 365
  }
});
