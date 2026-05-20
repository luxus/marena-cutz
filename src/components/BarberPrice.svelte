<script>
  /** @type {{ 
    name: string; 
    position?: string; 
    services: Array<{ name: string; duration?: string; price: string; featured?: boolean }> 
  }} */
  let { 
    barber, 
    isOpen = false, 
    onToggle 
  } = $props();

  const services = $derived(barber.services || []);
  const primary = $derived(services[0]);
  const more = $derived(services.slice(1));
  const hasMore = $derived(more.length > 0);
  const slug = $derived(hasMore ? barber.name.replace(/\s+/g, '-').toLowerCase() : '');

  let highlightedIndex = $state(-1);

  $effect(() => {
    if (isOpen) {
      highlightedIndex = -1;
      more.forEach((_, index) => {
        setTimeout(() => {
          highlightedIndex = index;
          setTimeout(() => {
            if (highlightedIndex === index) highlightedIndex = -1;
          }, 650);
        }, index * 95);
      });
    } else {
      highlightedIndex = -1;
    }
  });
</script>

  <button
    type="button"
    class="w-full cursor-pointer text-left"
    aria-expanded={hasMore ? isOpen : undefined}
    aria-controls={hasMore ? `barber-services-${slug}` : undefined}
    onclick={onToggle}
  >
    <div class="flex items-start justify-between gap-5">
      <div>
        <h3 class="text-title-md uppercase">{barber.name}</h3>
        {#if barber.position}
          <p class="mt-1 text-label-caps text-secondary">{barber.position}</p>
        {/if}
      </div>
      <span
        class="grid h-8 w-8 place-items-center text-2xl leading-none text-secondary transition-transform {open ? 'rotate-45' : ''}"
      >
        +
      </span>
    </div>

    {#if primary}
      <div class="mt-4 grid grid-cols-[1fr_auto] gap-4 border-t border-outline-variant pt-4">
        <div>
          <span class="text-body-lg text-on-surface">{primary.name}</span>
          {#if primary.duration}
            <p class="mt-1 text-label-caps text-on-surface-variant">{primary.duration}</p>
          {/if}
        </div>
        <span class="text-label-caps text-secondary">{primary.price}</span>
      </div>
    {/if}

    {#if !isOpen && hasMore}
      <div
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
    <div id={`barber-services-${slug}`} class="pt-2">
      {#if isOpen}
        {#each more as service, i (service.name)}
          <div
            class="grid grid-cols-[1fr_auto] gap-4 border-t border-outline-variant py-3"
            class:highlight={i === highlightedIndex}
            transition:fly={{
              y: 14,
              duration: reduced ? 0 : 300,
              delay: reduced ? 0 : i * 90
            }}
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
      {/if}
    </div>
  {/if}

  <div class="mt-5 h-px bg-outline-variant"></div>

