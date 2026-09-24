import { describe, expect, it } from 'vitest';
import { pixelRatioFor, stageMode } from '../stage-mode';

describe('stageMode', () => {
  it('keeps a composed still frame when motion is reduced', () => {
    expect(stageMode({ reducedMotion: true, saveData: false, viewportWidth: 1440 })).toBe('still');
  });

  it('uses the lighter path for save-data and narrow viewports', () => {
    expect(stageMode({ reducedMotion: false, saveData: true, viewportWidth: 1440 })).toBe('lite');
    expect(stageMode({ reducedMotion: false, saveData: false, viewportWidth: 390 })).toBe('lite');
  });

  it('runs the full stage on a desktop connection', () => {
    expect(stageMode({ reducedMotion: false, saveData: false, viewportWidth: 1280 })).toBe('full');
  });
});

describe('pixelRatioFor', () => {
  it('caps retina ratios and locks the lite path to 1', () => {
    expect(pixelRatioFor('lite', 3)).toBe(1);
    expect(pixelRatioFor('full', 3)).toBe(1.75);
    expect(pixelRatioFor('still', 3)).toBe(1.5);
  });
});
