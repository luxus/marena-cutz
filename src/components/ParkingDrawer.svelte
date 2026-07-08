<script lang="ts">
  import { parkingDrawer } from '../lib/ui.svelte.js';
  import Drawer from './Drawer.svelte';

  let {
    title = 'Hinweise zur Anfahrt & Parken',
    image = '',
    entrance = '',
    parking = '',
    transit = '',
    mapsUrl = '',
  }: {
    title?: string;
    image?: string;
    entrance?: string;
    parking?: string;
    transit?: string;
    mapsUrl?: string;
  } = $props();
</script>

<Drawer bind:open={parkingDrawer.open} {title}>
  <div class="space-y-6 text-on-surface-variant text-sm leading-relaxed">
    {#if entrance}
      <div class="space-y-2">
        <h3 class="text-label-caps !text-on-surface">Eingang</h3>
        <p>{entrance}</p>
      </div>
    {/if}
    {#if parking}
      <div class="space-y-2">
        <h3 class="text-label-caps !text-on-surface">Parkplätze</h3>
        <p>{parking}</p>
      </div>
    {/if}
    {#if transit}
      <div class="space-y-2">
        <h3 class="text-label-caps !text-on-surface">ÖV</h3>
        <p>{transit}</p>
      </div>
    {/if}
    {#if mapsUrl}
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        class="mt-2 inline-flex items-center gap-2 border border-outline-variant px-4 py-3 text-label-caps text-on-surface hover:border-primary hover:text-primary transition-colors"
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
          ><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle
            cx="12"
            cy="10"
            r="3"
          /></svg
        >
        In Google Maps öffnen
      </a>
    {/if}
    {#if image}
      <img
        src={image}
        alt="Parkplatz"
        class="w-full object-cover border border-outline-variant"
        loading="lazy"
      />
    {/if}
  </div>
</Drawer>
