/**
 * Highlights desktop + mobile nav links for the section currently in view.
 * Also drives a 1px scroll-progress rule on the header.
 */

const DEFAULT_IDS = ['preise', 'standort', 'ueber', 'barbers', 'social'];

export function initSectionNav(sectionIds: string[] = DEFAULT_IDS): void {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-nav-section]'));
  const progress = document.getElementById('scroll-progress');
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter((el): el is HTMLElement => Boolean(el));

  if (!links.length && !progress) return;

  const setActive = (id: string | null) => {
    links.forEach((link) => {
      const match = id !== null && link.dataset.navSection === id;
      link.classList.toggle('is-active', match);
      if (match) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };

  const updateProgress = () => {
    if (!progress) return;
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    progress.style.transform = `scaleX(${ratio})`;
  };

  const visible = new Map<string, number>();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          visible.set(entry.target.id, entry.intersectionRatio);
        } else {
          visible.delete(entry.target.id);
        }
      });

      let bestId: string | null = null;
      let bestRatio = 0;
      visible.forEach((ratio, id) => {
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestId = id;
        }
      });
      setActive(bestId);
    },
    {
      threshold: [0.18, 0.35, 0.55],
      rootMargin: '-18% 0px -42% 0px',
    }
  );

  sections.forEach((section) => observer.observe(section));
  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });

  window.addEventListener(
    'beforeunload',
    () => {
      observer.disconnect();
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    },
    { once: true }
  );
}
