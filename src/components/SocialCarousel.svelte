<script lang="ts">
  type Item = {
    platform: string;
    imageUrl: string;
    alt: string;
    permalink: string;
    featured?: boolean;
  };

  let { items }: { items: Item[] } = $props();

  let track: HTMLDivElement | undefined = $state();
  let paused = $state(false);
  let interval: ReturnType<typeof setInterval> | undefined;

  $effect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    interval = setInterval(() => {
      if (paused || !track) return;
      const tileW = track.firstElementChild
        ? (track.firstElementChild as HTMLElement).offsetWidth + 12
        : 160;
      const maxScroll = track.scrollWidth - track.clientWidth;
      if (track.scrollLeft >= maxScroll - 2) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        track.scrollBy({ left: tileW, behavior: 'smooth' });
      }
    }, 3000);

    return () => {
      if (interval !== undefined) clearInterval(interval);
    };
  });
</script>

<div
  role="region"
  aria-label="Social Media Carousel"
  aria-roledescription="Karussell"
  class="relative"
  onmouseenter={() => (paused = true)}
  onmouseleave={() => (paused = false)}
  ontouchstart={() => (paused = true)}
  ontouchend={() => (paused = false)}
>
  <div
    bind:this={track}
    class="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
  >
    {#each items as item}
      <a
        href={item.permalink}
        target="_blank"
        rel="noopener noreferrer"
        class="social-tile group relative flex-none w-[38vw] md:w-[22%] lg:w-[18%] snap-start overflow-hidden border bg-surface {item.featured
          ? 'border-primary'
          : 'border-outline-variant'}"
      >
        <img
          src={item.imageUrl}
          alt={item.alt}
          class="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <span
          class="absolute left-2 top-2 bg-surface/75 p-1.5 backdrop-blur transition-colors group-hover:bg-primary/90 group-hover:text-on-primary text-on-surface"
        >
          {#if item.platform === 'Instagram'}
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
              ><rect x="2" y="2" width="20" height="20" rx="5" /><circle
                cx="12"
                cy="12"
                r="4"
              /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg
            >
          {:else}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
              ><path
                d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"
              /></svg
            >
          {/if}
        </span>
      </a>
    {/each}
  </div>
  <!-- Fade-out rechts -->
  <div
    class="pointer-events-none absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-background to-transparent"
  ></div>
</div>
