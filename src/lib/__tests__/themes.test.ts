import { describe, expect, it } from 'vitest';
import {
  VALID_MODES,
  VALID_THEMES,
  defaultMode,
  defaultTheme,
  themeNames,
} from '../themes';

describe('themeNames', () => {
  it('has at least one entry', () => {
    expect(Object.keys(themeNames).length).toBeGreaterThan(0);
  });

  it('every key maps to a non-empty display name', () => {
    for (const [key, name] of Object.entries(themeNames)) {
      expect(name, `themeNames["${key}"] should be a non-empty string`).toBeTruthy();
    }
  });
});

describe('VALID_THEMES', () => {
  it('matches Object.keys(themeNames)', () => {
    expect([...VALID_THEMES].sort()).toEqual(Object.keys(themeNames).sort());
  });

  it('includes the default theme', () => {
    expect(VALID_THEMES).toContain(defaultTheme);
  });
});

describe('VALID_MODES', () => {
  it('contains light, dark, system', () => {
    expect(VALID_MODES).toContain('light');
    expect(VALID_MODES).toContain('dark');
    expect(VALID_MODES).toContain('system');
  });

  it('includes the default mode', () => {
    expect(VALID_MODES).toContain(defaultMode);
  });
});

describe('defaults', () => {
  it('defaultTheme is a known theme', () => {
    expect(themeNames).toHaveProperty(defaultTheme);
  });

  it('defaultMode is light, dark, or system', () => {
    expect(['light', 'dark', 'system']).toContain(defaultMode);
  });
});
