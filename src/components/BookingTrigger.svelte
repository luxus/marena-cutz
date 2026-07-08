<script lang="ts">
  import { bookingDrawer } from '../lib/ui.svelte.js';

  let {
    class: className = '',
    label = 'Termin',
    showIcons = true,
  }: { class?: string; label?: string; showIcons?: boolean } = $props();
</script>

<button
  type="button"
  aria-haspopup="dialog"
  onclick={() => (bookingDrawer.open = true)}
  class={className}
>
  {#if showIcons}
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  {/if}
  {label}
</button>
