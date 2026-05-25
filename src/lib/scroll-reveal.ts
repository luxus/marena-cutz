/**
 * Lightweight scroll-reveal module.
 *
 * Usage in Astro static contexts:
 *   import { initScrollReveals } from '../lib/scroll-reveal';
 *   // call after first paint:
 *   requestAnimationFrame(() => requestAnimationFrame(initScrollReveals));
 *
 * All logic is gated by prefers-reduced-motion.
 */

export function initScrollReveals(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const revealEls = Array.from(document.querySelectorAll<HTMLElement>('.scroll-reveal'));
  if (!revealEls.length) return;

  // 1. Post-paint prep for offscreen elements (prevents any flash on initial visible paint)
  revealEls.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
    if (isInViewport) {
      el.classList.add('in-view');
    } else {
      el.classList.add('reveal-prep');
    }
  });

  // 2. IntersectionObserver with sibling-aware stagger (mirrors prior premium feel exactly)
  const pendingTimeouts = new Set<ReturnType<typeof setTimeout>>();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target as HTMLElement;
        const parent = el.parentElement;
        const siblings = Array.from(parent ? parent.children : []).filter(
          (c) =>
            c.classList.contains('scroll-reveal') &&
            c.classList.contains('reveal-prep') &&
            !c.classList.contains('in-view')
        );
        const idx = siblings.indexOf(el);
        const delay = idx >= 0 ? Math.min(idx * 65, 180) : 0;

        const tid = setTimeout(() => {
          pendingTimeouts.delete(tid);
          el.classList.remove('reveal-prep');
          el.classList.add('in-view');
          observer.unobserve(el);
        }, delay);
        pendingTimeouts.add(tid);
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  // Observe only the ones we prepped for reveal
  revealEls.forEach((el) => {
    if (el.classList.contains('reveal-prep')) {
      observer.observe(el);
    }
  });

  // Cleanup on unload (good hygiene)
  window.addEventListener(
    'beforeunload',
    () => {
      observer.disconnect();
      pendingTimeouts.forEach((tid) => clearTimeout(tid));
      pendingTimeouts.clear();
    },
    { once: true }
  );
}
