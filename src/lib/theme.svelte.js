// Shared Svelte 5 runes state for theme + mode.
// Imported by ThemeSwitcher.svelte (and any future islands).
// Mutating .theme / .mode here provides reactive coordination across client:load islands.
// Bootstrap (no-FOUC + static-first) is still handled by the tiny inline script in BaseLayout + localStorage/cookies.
// Server session (Cloudflare KV via SESSION binding) is synced via /api/preferences POST (fire-and-forget).
export const userTheme = $state({
  theme: 'architectural',
  mode: 'dark'
});
