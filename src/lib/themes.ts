// Theme allowlists and display names.
// Colour values live exclusively in src/styles/global.css ([data-theme][data-mode] blocks).
// Adding a theme requires:
//   1. Adding the key here
//   2. Adding [data-theme="<key>"][data-mode="dark"] and [data-theme="<key>"][data-mode="light"]
//      blocks to global.css
//   3. Updating the is:inline bootstrap script in BaseLayout.astro (validThemes array)

export const themeNames: Record<string, string> = {
  architectural: 'Architectural Neon',
};

export type ThemeName = keyof typeof themeNames;
export type ThemeMode = 'light' | 'dark' | 'system';

export const defaultTheme: ThemeName = 'architectural';
export const defaultMode: ThemeMode = 'dark';

// Canonical allowlists used by API validation and the early bootstrap script.
// IMPORTANT: The is:inline script in BaseLayout.astro cannot import modules, so the string
// literals are duplicated there with an explicit "keep in sync" comment. Adding a theme
// requires updating both.
export const VALID_THEMES = Object.keys(themeNames) as readonly ThemeName[];
export const VALID_MODES = ['light', 'dark', 'system'] as const;
