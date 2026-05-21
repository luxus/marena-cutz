<script>
  import { slide, fade } from 'svelte/transition';
  import { openBarber } from '../lib/openBarber.svelte.js';

  /** @type {{ 
    name: string; 
    position?: string; 
    services: Array<{ name: string; duration?: string; price: string; featured?: boolean }> 
  }} */
  let { barber } = $props();

  const uid = $props.id();

  const services = $derived(barber.services || []);
  const primary = $derived(services[0]);
  const more = $derived(services.slice(1));
  const hasMore = $derived(more.length > 0);
  const slug = $derived(hasMore ? barber.name.replace(/\s+/g, '-').toLowerCase() : '');

  const open = $derived(hasMore ? openBarber.current === slug : false);
</script>

<button
  type="button"
  class="group w-full cursor-pointer text-left"
  aria-expanded={hasMore ? open : undefined}
  aria-controls={hasMore ? `${uid}-services` : undefined}
  onclick={() => {
    if (hasMore) openBarber.current = openBarber.current === slug ? '' : slug;
  }}
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
      class="grid h-8 w-8 place-items-center text-2xl leading-none text-secondary transition-transform duration-200 {open
        ? 'rotate-45'
        : ''}"
    >
      +
    </span>
  </div>

  {#if primary && !open}
    <div
      transition:fade={{ duration: 160 }}
      class="price-row grid grid-cols-[1fr_auto] gap-4 border-t border-outline-variant py-3"
    >
      <div>
        <span class="text-body-lg text-on-surface">{primary.name}</span>
        {#if primary.duration}
          <p class="mt-1 text-label-caps text-on-surface-variant">{primary.duration}</p>
        {/if}
      </div>
      <span class="text-label-caps text-secondary">{primary.price}</span>
    </div>
  {/if}

  {#if !open && hasMore}
    <div
      transition:fade={{ duration: 200, delay: 60 }}
      class="mt-3 max-h-11 overflow-hidden text-sm text-on-surface-variant [mask-image:linear-gradient(to_bottom,black,transparent)]"
    >
      {#each more.slice(0, 2) as service}
        <div class="grid grid-cols-[1fr_auto] gap-4 py-1">
          <span>{service.name}</span>
          <span class="text-label-caps">{service.price}</span>
        </div>
      {/each}
    </div>
  {/if}
</button>

{#if hasMore}
  <div id={`${uid}-services`}>
    {#if open}
      <div transition:slide={{ duration: 320, easing: (t) => t * t * (3 - 2 * t) }}>
        <!-- Primary service as first row when expanded -->
        {#if primary}
          <div
            class="price-row grid grid-cols-[1fr_auto] gap-4 border-t border-outline-variant py-3 transition-colors"
          >
            <div>
              <span class="text-body-lg text-on-surface">{primary.name}</span>
              {#if primary.duration}
                <p class="mt-1 text-label-caps text-on-surface-variant">{primary.duration}</p>
              {/if}
            </div>
            <span class="text-label-caps text-secondary">{primary.price}</span>
          </div>
        {/if}

        {#each more as service, i (service.name)}
          <div
            class="price-row grid grid-cols-[1fr_auto] gap-4 border-t border-outline-variant py-3 transition-colors"
            style="transition-delay: {i * 45}ms"
          >
            <div>
              <span
                class={service.featured
                  ? 'text-body-lg text-on-surface'
                  : 'text-sm text-on-surface-variant'}
              >
                {service.name}
              </span>
              {#if service.duration}
                <p class="mt-1 text-label-caps text-on-surface-variant">{service.duration}</p>
              {/if}
            </div>
            <span
              class={service.featured
                ? 'text-label-caps text-secondary'
                : 'text-label-caps text-on-surface-variant'}
            >
              {service.price}
            </span>
          </div>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<div class="mt-5 h-px bg-outline-variant"></div>
