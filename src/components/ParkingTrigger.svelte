<script lang="ts">
  import { parkingDrawer } from '../lib/parkingDrawer.svelte.js';

  let {
    class: className = '',
    label = 'Hinweise zur Anfahrt & Parken',
  }: { class?: string; label?: string } = $props();
</script>

<button
  onclick={() => (parkingDrawer.open = true)}
  class="group/parking inline-flex items-center gap-2 text-label-caps text-on-surface-variant hover:text-primary transition-colors duration-150 {className}"
>
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
  </svg>
  <span class="nav-link group-hover/parking:[&::after]:scale-x-100">{label}</span>
</button>
