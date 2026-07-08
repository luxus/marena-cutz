<script lang="ts">
  import { bookingDrawer } from '../lib/ui.svelte.js';
  import Drawer from './Drawer.svelte';

  let {
    bookingUrl,
    drawerTitle = 'Wichtige Hinweise zur Terminbuchung',
    paymentNote = '',
    availabilityTitle = 'Terminverfügbarkeit',
    availabilityText = '',
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
    paymentNote?: string;
    availabilityTitle?: string;
    availabilityText?: string;
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

<Drawer bind:open={bookingDrawer.open} title={drawerTitle}>
  <div class="space-y-5">
    {#if paymentNote}
      <div class="border border-error bg-error/10 px-4 py-3">
        <p class="text-sm font-medium text-error">{paymentNote}</p>
      </div>
    {/if}
    {#if availabilityText}
      <div class="border-l-2 border-primary pl-4 space-y-1">
        <p class="text-title-sm !text-on-surface">{availabilityTitle}</p>
        <p class="text-sm text-on-surface-variant leading-relaxed">{availabilityText}</p>
      </div>
    {/if}
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
        rel="noopener noreferrer"
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
        type="button"
        onclick={() => (bookingDrawer.open = false)}
        class="btn-secondary px-6 py-3 text-label-caps"
      >
        {cancelLabel}
      </button>
    </div>
  </div>
</Drawer>
