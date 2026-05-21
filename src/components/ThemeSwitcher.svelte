<script>
  // Full Svelte 5.55 rewrite of the theme/mode switcher.
  // - $state for dropdown open
  // - Shared $state from theme.svelte.js for cross-island reactivity
  // - $effect for outside-click / escape handling
  // - applyTheme uses document.startViewTransition (guarded by reduced-motion) exactly as before
  // - On every theme change: dataset, localStorage, history.replaceState, labels (via $derived), + fire-and-forget POST to /api/preferences (Cloudflare KV SESSION)
  // - Accessible: listbox / option roles, aria-expanded, aria-controls, Escape, outside click
  // Replaces the entire vanilla script + id-based DOM manipulation in the old .astro version.

  import { userTheme } from '../lib/theme.svelte.js';
  import { themes } from '../lib/themes';

  let dropdownOpen = $state(false);
  let dropdownBtn;
  let dropdownMenuEl;

  // Display values (reactive)
  const themeName = $derived(themes[userTheme.theme]?.name || userTheme.theme);
  const modeIcon = $derived(
    userTheme.mode === 'dark' ? '☾' : userTheme.mode === 'system' ? '◑' : '☀︎'
  );

  // Seed *synchronously* from DOM dataset (set by early inline script).
  // This runs once when the client:load island hydrates — no $effect, no double-run, no flash of default labels (Issue 8).
  if (typeof document !== 'undefined') {
    const html = document.documentElement;
    if (html.dataset.theme && html.dataset.theme !== userTheme.theme) {
      userTheme.theme = html.dataset.theme;
    }
    if (html.dataset.mode && html.dataset.mode !== userTheme.mode) {
      userTheme.mode = html.dataset.mode;
    }
  }

  // Outside click + Escape (only while open; proper cleanup)
  $effect(() => {
    if (!dropdownOpen || typeof document === 'undefined') return;

    const onDocClick = (e) => {
      if (
        dropdownBtn &&
        !dropdownBtn.contains(e.target) &&
        dropdownMenuEl &&
        !dropdownMenuEl.contains(e.target)
      ) {
        dropdownOpen = false;
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') dropdownOpen = false;
    };

    document.addEventListener('click', onDocClick, true);
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('click', onDocClick, true);
      document.removeEventListener('keydown', onKey);
    };
  });

  function applyTheme(newTheme, newMode) {
    const doChange = () => {
      userTheme.theme = newTheme;
      userTheme.mode = newMode;

      const html = document.documentElement;
      html.dataset.theme = newTheme;
      const resolvedMode =
        newMode === 'system'
          ? window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'
          : newMode;
      html.dataset.mode = resolvedMode;

      localStorage.setItem('theme', newTheme);
      localStorage.setItem('mode', newMode);

      const url = new URL(window.location.href);
      url.searchParams.set('theme', newTheme);
      url.searchParams.set('mode', newMode);
      history.replaceState(null, '', url.toString());

      // Persist to Cloudflare KV-backed session (via adapter SESSION binding)
      // Fire-and-forget; never blocks UI or view transition
      fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: newTheme, mode: newMode }),
      }).catch(() => {});
    };

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReduced && document.startViewTransition) {
      document.startViewTransition(doChange);
    } else {
      doChange();
    }

    dropdownOpen = false;
  }

  function toggleMode() {
    const cycle = { light: 'dark', dark: 'system', system: 'light' };
    applyTheme(userTheme.theme, cycle[userTheme.mode] ?? 'dark');
  }

  function selectTheme(key) {
    applyTheme(key, userTheme.mode);
  }
</script>

<div class="flex items-center gap-2 text-sm">
  <!-- Theme Dropdown -->
  <div class="relative">
    <button
      bind:this={dropdownBtn}
      class="flex items-center gap-2 rounded border border-outline-variant bg-surface px-3 py-1.5 text-on-surface hover:bg-surface-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary transition"
      aria-haspopup="listbox"
      aria-expanded={dropdownOpen}
      aria-controls="theme-dropdown-menu"
      onclick={() => (dropdownOpen = !dropdownOpen)}
      type="button"
    >
      <span class="text-label-caps hidden sm:inline">{themeName}</span>
      <svg
        class="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div
      bind:this={dropdownMenuEl}
      id="theme-dropdown-menu"
      class={`theme-menu absolute bottom-full right-0 mb-1.5 w-48 rounded border border-outline-variant bg-surface py-1 shadow-lg z-50 ${dropdownOpen ? 'open' : 'hidden'}`}
      role="listbox"
    >
      {#each Object.entries(themes) as [key, t]}
        <button
          type="button"
          data-theme={key}
          class="theme-option w-full px-4 py-2 text-left text-sm hover:bg-surface-container text-on-surface focus:bg-surface-container focus:outline-none flex items-center justify-between"
          role="option"
          aria-selected={key === userTheme.theme}
          onclick={() => selectTheme(key)}
        >
          <span>{t.name}</span>
        </button>
      {/each}
    </div>
  </div>

  <!-- Light / Dark Toggle -->
  <button
    class="flex h-8 w-8 items-center justify-center rounded border border-outline-variant bg-surface text-on-surface hover:bg-surface-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary transition"
    aria-label="Toggle light/dark/system mode"
    onclick={toggleMode}
    type="button"
  >
    <span class="text-lg" aria-hidden="true">{modeIcon}</span>
  </button>
</div>
