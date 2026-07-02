<script>
  import { openBarber } from '../lib/ui.svelte.js';

  /** @type {{
    name: string;
    position?: string;
    services: Array<{ name: string; duration?: string; price: string; featured?: boolean }>;
  }} */
  let { barber } = $props();

  const uid = $props.id();

  const services = $derived(barber.services || []);
  const primary = $derived(services[0]);
  const more = $derived(services.slice(1));
  const hasMore = $derived(more.length > 0);
  const slug = $derived(hasMore ? barber.name.replace(/\s+/g, '-').toLowerCase() : '');

  const open = $derived(hasMore ? openBarber.current === slug : false);

  function toggle() {
    if (!hasMore) return;
    openBarber.current = openBarber.current === slug ? '' : slug;
  }
</script>

<div class="barber-price">
  {#if hasMore}
    <button
      type="button"
      class="group w-full cursor-pointer text-left"
      aria-expanded={open}
      aria-controls={`${uid}-services`}
      onclick={toggle}
    >
      <div class="flex items-start justify-between gap-5">
        <div class="mb-4">
          <h3 class="text-title-md uppercase transition-colors group-hover:!text-primary">
            {barber.name}
          </h3>
          {#if barber.position}
            <p class="mt-1 text-label-caps text-secondary">{barber.position}</p>
          {/if}
        </div>
        <span
          class="barber-price__toggle grid h-8 w-8 place-items-center text-2xl leading-none text-secondary"
          class:barber-price__toggle--open={open}
          aria-hidden="true"
        >
          +
        </span>
      </div>
    </button>
  {:else}
    <div class="mb-4">
      <h3 class="text-title-md uppercase">{barber.name}</h3>
      {#if barber.position}
        <p class="mt-1 text-label-caps text-secondary">{barber.position}</p>
      {/if}
    </div>
  {/if}

  {#if primary}
    <div class="price-row grid grid-cols-[1fr_auto] gap-4 border-t border-outline-variant py-3">
      <div>
        <span class="text-body-lg text-on-surface">{primary.name}</span>
        {#if primary.duration}
          <p class="mt-1 text-label-caps text-on-surface-variant">{primary.duration}</p>
        {/if}
      </div>
      <span class="text-label-caps text-secondary">{primary.price}</span>
    </div>
  {/if}

  {#if hasMore}
    <div id={`${uid}-services`} class="price-more" class:price-more--open={open}>
      {#each more as service (service.name)}
        <div class="price-row grid grid-cols-[1fr_auto] gap-4 border-t border-outline-variant py-3">
          <div>
            <span class="text-body-lg text-on-surface">{service.name}</span>
            {#if service.duration}
              <p class="mt-1 text-label-caps text-on-surface-variant">{service.duration}</p>
            {/if}
          </div>
          <span class="text-label-caps text-secondary">{service.price}</span>
        </div>
      {/each}
    </div>
  {/if}
</div>