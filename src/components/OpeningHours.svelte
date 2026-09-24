<script lang="ts">
  import { getOpeningStatus, type OpeningHour } from '../lib/opening-status';

  let { hours }: { hours: OpeningHour[] } = $props();

  let status = $state<ReturnType<typeof getOpeningStatus> | null>(null);

  $effect(() => {
    status = getOpeningStatus(hours);
    const id = setInterval(() => {
      status = getOpeningStatus(hours);
    }, 60_000);
    return () => clearInterval(id);
  });
</script>

<div>
  <div class="mb-3 flex items-end justify-between gap-3">
    <h3 class="text-label-caps !text-on-surface">Öffnungszeiten</h3>
    {#if status}
      <span
        class="text-label-caps {status.open
          ? 'text-secondary-container'
          : 'text-on-surface-variant'}"
      >
        {status.open ? 'Geöffnet' : 'Geschlossen'}
      </span>
    {/if}
  </div>
  <div>
    {#each hours as item (item.day)}
      {@const isToday = status?.today.toLowerCase() === item.day.toLowerCase()}
      {@const closed = item.hours.toLowerCase().includes('geschlossen')}
      <div
        class="opening-hour-row flex items-center justify-between gap-2 border-b border-outline-variant py-2 last:border-0 text-xs tracking-wide"
        class:opening-hour-row--today={isToday}
      >
        <span class:list={['uppercase', isToday && 'text-primary']}>{item.day}</span>
        <span
          class:list={[
            'font-bold whitespace-nowrap',
            closed ? 'text-on-surface-variant' : 'text-on-surface',
            isToday && !closed && 'text-secondary',
          ]}
        >
          {item.hours}
        </span>
      </div>
    {/each}
  </div>
</div>
