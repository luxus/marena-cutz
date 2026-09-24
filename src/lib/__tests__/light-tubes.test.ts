import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../webgl-guard', () => ({
  getWebGLQuality: vi.fn(() => 'off'),
}));

describe('mountLightTubes', () => {
  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('does not require WebGL — returns a inert handle when quality is off', async () => {
    const { mountLightTubes } = await import('../light-tubes');
    const canvas = document.createElement('canvas');
    const handle = mountLightTubes(canvas);
    expect(handle.live).toBe(false);
    expect(() => handle.destroy()).not.toThrow();
  });
});
