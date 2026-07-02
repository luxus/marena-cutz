<script>
  import { userTheme } from '../lib/ui.svelte.js';
  import { defaultTheme } from '../lib/themes';

  const theme = defaultTheme;

  const modeIcon = $derived(userTheme.mode === 'dark' ? '☾' : '☀︎');

  if (typeof document !== 'undefined') {
    const html = document.documentElement;
    if (html.dataset.mode && html.dataset.mode !== userTheme.mode) {
      userTheme.mode = html.dataset.mode;
    }
    userTheme.theme = theme;
    html.dataset.theme = theme;
  }

  function applyMode(newMode) {
    const doChange = () => {
      userTheme.theme = theme;
      userTheme.mode = newMode;

      const html = document.documentElement;
      html.dataset.theme = theme;
      html.dataset.mode = newMode;

      localStorage.setItem('theme', theme);
      localStorage.setItem('mode', newMode);

      const url = new URL(window.location.href);
      url.searchParams.set('theme', theme);
      url.searchParams.set('mode', newMode);
      history.replaceState(null, '', url.toString());
    };

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReduced && document.startViewTransition) {
      document.startViewTransition(doChange);
    } else {
      doChange();
    }
  }

  function toggleMode() {
    applyMode(userTheme.mode === 'dark' ? 'light' : 'dark');
  }
</script>

<button
  class="flex h-8 w-8 items-center justify-center rounded border border-outline-variant bg-surface text-on-surface hover:bg-surface-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary transition"
  aria-label="Hell- oder Dunkelmodus umschalten"
  onclick={toggleMode}
  type="button"
>
  <span class="text-lg" aria-hidden="true">{modeIcon}</span>
</button>