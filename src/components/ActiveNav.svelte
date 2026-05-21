<script>
  // Svelte 5.55 island that provides the desktop nav active-section underline behavior.
  // Renders nothing (pure enhancement of the static <nav> markup kept in Header.astro).
  // Uses $effect (runes) + IntersectionObserver; respects reduced-motion.
  // Replaces the entire vanilla IIFE that was in Header.astro.
  //
  // Hard-coded values (thresholds [0.25,0.5,0.75], rootMargin '-80px 0px -40% 0px', 0.6 viewport factor, 80px, 60ms timeout)
  // are deliberately identical to the original implementation. They form part of the established "restrained premium"
  // interaction contract for the desktop nav highlight (see past review history on scroll-reveal / active nav).
  // Changing them would alter the exact feel users expect.
  //
  // Contract (Issue 6): This island silently no-ops if the expected <header><nav> or the four #section ids
  // (preise, standort, ueber, barbers) are absent. This is intentional to support "smallest diff" and reuse on any page
  // that happens to have the desktop nav markup. On the marketing home page the elements are guaranteed by Header.astro + content.

  $effect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    // The nav is static in Header.astro; we enhance it from this island (smallest markup change)
    const nav = document.querySelector('header nav');
    if (!nav) return;

    const navLinks = nav.querySelectorAll('a.nav-link[href^="#"]');
    if (!navLinks.length) return;

    const sectionIds = ['preise', 'standort', 'ueber', 'barbers'];
    const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);

    if (!sections.length) return;

    const linkMap = new Map();
    navLinks.forEach((link) => {
      const id = link.getAttribute('href')?.slice(1);
      if (id) linkMap.set(id, link);
    });

    let currentActive = null;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the section with largest intersection ratio that is visible
        let best = null;
        let bestRatio = 0;
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            best = entry.target;
          }
        });
        if (!best) return;

        const id = best.id;
        const link = linkMap.get(id);
        if (!link || link === currentActive) return;

        if (currentActive) currentActive.classList.remove('active');
        link.classList.add('active');
        currentActive = link;
      },
      { threshold: [0.25, 0.5, 0.75], rootMargin: '-80px 0px -40% 0px' }
    );

    sections.forEach((sec) => observer.observe(sec));

    // Initial: activate first visible or first in list (same timing as old)
    const timer = setTimeout(() => {
      const firstVisible = sections.find((s) => {
        const r = s.getBoundingClientRect();
        return r.top < window.innerHeight * 0.6 && r.bottom > 80;
      });
      const initial = firstVisible || sections[0];
      const link = linkMap.get(initial.id);
      if (link) {
        link.classList.add('active');
        currentActive = link;
      }
    }, 60);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  });
</script>
