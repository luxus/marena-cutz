<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    open = $bindable(false),
    title = '',
    children,
  }: { open: boolean; title: string; children?: Snippet } = $props();

  let panel: HTMLDivElement | undefined = $state();
  let previouslyFocused: HTMLElement | null = null;

  function close() {
    open = false;
  }

  function getFocusable(root: HTMLElement): HTMLElement[] {
    const selector =
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
    return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(
      (el) => el.tabIndex !== -1 && !el.hasAttribute('disabled')
    );
  }

  function onKeydown(e: KeyboardEvent) {
    if (!open) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }

    if (e.key !== 'Tab' || !panel) return;

    const focusable = getFocusable(panel);
    if (focusable.length === 0) {
      e.preventDefault();
      panel.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (e.shiftKey) {
      if (active === first || !panel.contains(active)) {
        e.preventDefault();
        last.focus();
      }
    } else if (active === last || !panel.contains(active)) {
      e.preventDefault();
      first.focus();
    }
  }

  // Focus management: move into dialog on open, restore on close.
  $effect(() => {
    if (!open) return;

    previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const id = requestAnimationFrame(() => {
      if (!panel) return;
      const focusable = getFocusable(panel);
      (focusable[0] ?? panel).focus();
    });

    return () => {
      cancelAnimationFrame(id);
      if (previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus();
      }
      previouslyFocused = null;
    };
  });

  // Portal action: moves the element into document.body so fixed positioning
  // is never clipped by an ancestor overflow/transform.
  // Uses $effect teardown per Svelte 5 current practice.
  function portal(node: HTMLElement) {
    document.body.appendChild(node);
    $effect(() => () => node.remove());
  }
</script>

<svelte:window onkeydown={onKeydown} />

{#if open}
  <!-- Backdrop -->
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div
    use:portal
    class="drawer-backdrop fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
    onclick={close}
    aria-hidden="true"
  ></div>

  <!-- Sheet: full-width on mobile, centered max-w-lg on desktop -->
  <div
    use:portal
    bind:this={panel}
    role="dialog"
    aria-modal="true"
    aria-label={title}
    tabindex="-1"
    class="drawer-sheet fixed bottom-0 z-[101] max-h-[85dvh] overflow-y-auto border border-outline-variant bg-surface outline-none"
    style="left: 50%; transform: translateX(-50%); width: min(100%, 32rem);"
  >
    <!-- Handle -->
    <div class="flex justify-center pt-3 pb-1">
      <div class="h-1 w-10 rounded-full bg-outline-variant"></div>
    </div>

    <!-- Header -->
    <div class="flex items-center justify-between border-b border-outline-variant px-5 py-4">
      <h2 class="text-label-caps text-on-surface">{title}</h2>
      <button
        type="button"
        onclick={close}
        aria-label="Schließen"
        class="grid h-8 w-8 place-items-center text-on-surface-variant hover:text-on-surface transition-colors"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          aria-hidden="true"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Content -->
    <div class="px-5 py-6">
      {@render children?.()}
    </div>
  </div>
{/if}
