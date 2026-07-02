// Theme allowlists and display names.
// Colour values live exclusively in src/styles/global.css ([data-theme][data-mode] blocks).
// To add a theme later:
//   1. Add the key + display name here
//   2. Add [data-theme="<key>"][data-mode="dark|light"] blocks to global.css
//   3. Sync validThemes in BaseLayout.astro inline bootstrap (cannot import modules)
//   4. Wire a picker in ThemeSwitcher when you have more than one theme

export const themeNames: Record<string, string> = {
  architectural: 'Architectural Neon',
};

export type ThemeName = keyof typeof themeNames;
export type ThemeMode = 'light' | 'dark' | 'system';

export const defaultTheme: ThemeName = 'architectural';
export const defaultMode: ThemeMode = 'dark';

// Canonical allowlists used by the early bootstrap script in BaseLayout.
// IMPORTANT: The is:inline script in BaseLayout.astro cannot import modules, so the string
// literals are duplicated there with an explicit "keep in sync" comment. Adding a theme
// requires updating both.
export const VALID_THEMES = Object.keys(themeNames) as readonly ThemeName[];
export const VALID_MODES = ['light', 'dark', 'system'] as const;
