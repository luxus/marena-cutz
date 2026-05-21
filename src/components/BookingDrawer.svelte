<script lang="ts">
  import { bookingDrawer } from '../lib/bookingDrawer.svelte.js';
  import Drawer from './Drawer.svelte';

  let {
    bookingUrl,
    drawerTitle = 'Wichtige Hinweise zur Terminbuchung',
    walkInsTitle = 'Walk-ins',
    walkInsText = '',
    cancellationTitle = 'Terminabsagen',
    cancellationText = '',
    latenessTitle = 'Verspätung',
    latenessText = '',
    ctaLabel = 'Ich habe verstanden — Termin buchen',
    cancelLabel = 'Abbrechen',
  }: {
    bookingUrl: string;
    drawerTitle?: string;
    walkInsTitle?: string;
    walkInsText?: string;
    cancellationTitle?: string;
    cancellationText?: string;
    latenessTitle?: string;
    latenessText?: string;
    ctaLabel?: string;
    cancelLabel?: string;
  } = $props();
</script>

<button
  onclick={() => (bookingDrawer.open = true)}
  class="group btn-primary w-full justify-between px-6 py-4 active:scale-[0.982]"
>
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
    ><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg
  >
  Termin buchen
</button>

<Drawer bind:open={bookingDrawer.open} title={drawerTitle}>
  <div class="space-y-5">
    {#if walkInsText}
      <div class="border-l-2 border-primary pl-4 space-y-1">
        <p class="text-title-sm !text-on-surface">{walkInsTitle}</p>
        <p class="text-sm text-on-surface-variant leading-relaxed">{walkInsText}</p>
      </div>
    {/if}
    {#if cancellationText}
      <div class="border-l-2 border-primary pl-4 space-y-1">
        <p class="text-title-sm !text-on-surface">{cancellationTitle}</p>
        <p class="text-sm text-on-surface-variant leading-relaxed">{cancellationText}</p>
      </div>
    {/if}
    {#if latenessText}
      <div class="border-l-2 border-primary pl-4 space-y-1">
        <p class="text-title-sm !text-on-surface">{latenessTitle}</p>
        <p class="text-sm text-on-surface-variant leading-relaxed">{latenessText}</p>
      </div>
    {/if}

    <div class="pt-2 flex flex-col gap-3">
      <a
        href={bookingUrl}
        target="_blank"
        rel="noreferrer"
        onclick={() => (bookingDrawer.open = false)}
        class="group btn-primary justify-between px-6 py-4 active:scale-[0.982]"
      >
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
          ><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg
        >
        {ctaLabel}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          aria-hidden="true"
          ><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline
            points="15 3 21 3 21 9"
          /><line x1="10" y1="14" x2="21" y2="3" /></svg
        >
      </a>
      <button
        onclick={() => (bookingDrawer.open = false)}
        class="btn-secondary px-6 py-3 text-label-caps"
      >
        {cancelLabel}
      </button>
    </div>
  </div>
</Drawer>
