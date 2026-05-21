<script lang="ts">
  import { bookingDrawer } from '../lib/bookingDrawer.svelte.js';
  import Drawer from './Drawer.svelte';

  let { bookingUrl }: { bookingUrl: string } = $props();
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

<Drawer bind:open={bookingDrawer.open} title="Wichtige Hinweise zur Terminbuchung">
  <div class="space-y-5">
    <div class="border-l-2 border-primary pl-4 space-y-1">
      <p class="text-title-sm !text-on-surface">Walk-ins</p>
      <p class="text-sm text-on-surface-variant leading-relaxed">
        Walk-ins sind bei uns <strong class="text-on-surface"
          >leider nur sehr begrenzt möglich</strong
        >. Um Wartezeiten zu vermeiden, empfehlen wir dringend, im Voraus einen Termin zu buchen.
      </p>
    </div>

    <div class="border-l-2 border-primary pl-4 space-y-1">
      <p class="text-title-sm !text-on-surface">Terminabsagen</p>
      <p class="text-sm text-on-surface-variant leading-relaxed">
        Termine, die <strong class="text-on-surface"
          >nicht mindestens 24 Stunden im Voraus abgesagt</strong
        >
        werden, werden <strong class="text-on-surface">in Rechnung gestellt</strong>. Bitte sage
        deinen Termin rechtzeitig ab, damit andere Kunden nachrücken können.
      </p>
    </div>

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
        Ich habe verstanden — Termin buchen
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
        Abbrechen
      </button>
    </div>
  </div>
</Drawer>
