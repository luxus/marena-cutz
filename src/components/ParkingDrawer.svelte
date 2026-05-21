<script lang="ts">
  import Drawer from './Drawer.svelte';
  let open = $state(false);
</script>

<button
  onclick={() => (open = true)}
  class="inline-flex items-center gap-2 text-label-caps text-on-surface-variant hover:text-primary transition-colors"
>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
  </svg>
  Anfahrt & Parken
</button>

<Drawer bind:open title="Anfahrt & Parken">
  <div class="space-y-6 text-on-surface-variant text-sm leading-relaxed">

    <div class="space-y-2">
      <h3 class="text-label-caps !text-on-surface">Eingang</h3>
      <p>Der Eingang befindet sich direkt an der <strong class="text-on-surface">Kasernenstrasse 4</strong>. Das Klingelschild trägt den Namen <strong class="text-on-surface">Marena Cutz</strong>.</p>
    </div>

    <div class="space-y-2">
      <h3 class="text-label-caps !text-on-surface">Parkplätze</h3>
      <ul class="space-y-2">
        <li class="flex gap-3">
          <span class="mt-0.5 text-primary">→</span>
          <span>Direkt vor dem Gebäude stehen <strong class="text-on-surface">kostenlose Kurzparkplätze</strong> zur Verfügung (max. 30 Min.).</span>
        </li>
        <li class="flex gap-3">
          <span class="mt-0.5 text-primary">→</span>
          <span>Weitere Parkplätze sind in der <strong class="text-on-surface">Kasernengasse</strong> und am <strong class="text-on-surface">Bahnhof Bülach</strong> (ca. 5 Min. zu Fuss) verfügbar.</span>
        </li>
      </ul>
    </div>

    <div class="space-y-2">
      <h3 class="text-label-caps !text-on-surface">ÖV</h3>
      <p>Bahnhof Bülach — ca. <strong class="text-on-surface">5 Minuten</strong> zu Fuss.</p>
    </div>

    <a
      href="https://www.google.com/maps/search/?api=1&query=Marena+Cutz+Kasernenstrasse+4+8180+Bülach"
      target="_blank"
      rel="noreferrer"
      class="mt-2 inline-flex items-center gap-2 border border-outline-variant px-4 py-3 text-label-caps text-on-surface hover:border-primary hover:text-primary transition-colors"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
      In Google Maps öffnen
    </a>
  </div>
</Drawer>
