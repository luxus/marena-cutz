import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initScrollReveals } from '../scroll-reveal';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeEl(inViewport = true): HTMLElement {
  const el = document.createElement('div');
  el.classList.add('scroll-reveal');
  // jsdom does not do layout — stub getBoundingClientRect
  el.getBoundingClientRect = vi.fn(() => ({
    top: inViewport ? 0 : 9999,
    bottom: inViewport ? 100 : 10099,
    left: 0,
    right: 100,
    width: 100,
    height: 100,
    x: 0,
    y: inViewport ? 0 : 9999,
    toJSON: () => ({}),
  }));
  return el;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('initScrollReveals', () => {
  beforeEach(() => {
    // Default: motion is allowed
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => ({
        matches: false, // prefers-reduced-motion: no-preference
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))
    );

    // Stub IntersectionObserver (must be a class/constructor)
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe = vi.fn();
        unobserve = vi.fn();
        disconnect = vi.fn();
        constructor(_cb: IntersectionObserverCallback, _opts?: IntersectionObserverInit) {}
      }
    );

    // Default innerHeight
    vi.stubGlobal('innerHeight', 768);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.unstubAllGlobals();
  });

  it('does nothing when prefers-reduced-motion is set', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
    );

    const el = makeEl();
    document.body.appendChild(el);
    initScrollReveals();

    expect(el.classList.contains('in-view')).toBe(false);
    expect(el.classList.contains('reveal-prep')).toBe(false);
  });

  it('does nothing when no .scroll-reveal elements exist', () => {
    // Should not throw
    expect(() => initScrollReveals()).not.toThrow();
  });

  it('immediately adds in-view to elements already in the viewport', () => {
    const el = makeEl(true);
    document.body.appendChild(el);
    initScrollReveals();

    expect(el.classList.contains('in-view')).toBe(true);
    expect(el.classList.contains('reveal-prep')).toBe(false);
  });

  it('adds reveal-prep (not in-view) to offscreen elements', () => {
    const el = makeEl(false);
    document.body.appendChild(el);
    initScrollReveals();

    expect(el.classList.contains('reveal-prep')).toBe(true);
    expect(el.classList.contains('in-view')).toBe(false);
  });

  it('creates an IntersectionObserver and observes offscreen elements', () => {
    const observeSpy = vi.fn();
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe = observeSpy;
        unobserve = vi.fn();
        disconnect = vi.fn();
        constructor(_cb: IntersectionObserverCallback, _opts?: IntersectionObserverInit) {}
      }
    );

    const el = makeEl(false);
    document.body.appendChild(el);
    initScrollReveals();

    expect(observeSpy).toHaveBeenCalledWith(el);
  });

  it('does NOT observe elements already in-view', () => {
    const observeSpy = vi.fn();
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe = observeSpy;
        unobserve = vi.fn();
        disconnect = vi.fn();
        constructor(_cb: IntersectionObserverCallback, _opts?: IntersectionObserverInit) {}
      }
    );

    const el = makeEl(true);
    document.body.appendChild(el);
    initScrollReveals();

    expect(observeSpy).not.toHaveBeenCalled();
  });
});
