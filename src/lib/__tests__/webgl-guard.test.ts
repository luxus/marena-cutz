import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getWebGLQuality, hasWebGL, prefersReducedMotion, shouldMountWebGL } from '../webgl-guard';

function stubMatchMedia(matches: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  );
}

describe('webgl-guard', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('prefersReducedMotion is false when the media query does not match', () => {
    stubMatchMedia(false);
    expect(prefersReducedMotion()).toBe(false);
  });

  it('returns quality off when reduced motion is requested', () => {
    stubMatchMedia(true);
    expect(getWebGLQuality()).toBe('off');
    expect(shouldMountWebGL()).toBe(false);
  });

  it('returns quality off when Save-Data is set', () => {
    stubMatchMedia(false);
    vi.stubGlobal('navigator', {
      ...navigator,
      connection: { saveData: true },
      userAgent: 'Mozilla/5.0',
      hardwareConcurrency: 8,
    });
    expect(getWebGLQuality()).toBe('off');
  });

  it('hasWebGL is false when canvas cannot create a context', () => {
    expect(hasWebGL()).toBe(false);
  });
});
