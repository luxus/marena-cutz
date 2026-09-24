import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../webgl-guard', () => ({
  getWebGLQuality: vi.fn(() => 'off'),
}));

describe('mountFadeRibbon', () => {
  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('stays inert when WebGL is off so the CSS fade remains the hero', async () => {
    const { mountFadeRibbon } = await import('../fade-ribbon');
    const canvas = document.createElement('canvas');
    const handle = mountFadeRibbon(canvas);
    expect(handle.live).toBe(false);
    expect(() => handle.destroy()).not.toThrow();
  });
});
