import { describe, expect, it } from 'vitest';
import { createShow } from '../stage/create-show';
import { stageProfile } from '../stage/profile';

describe('stageProfile', () => {
  it('keeps a full scissors-and-neon count on desktop', () => {
    const profile = stageProfile({
      viewportWidth: 1440,
      devicePixelRatio: 2,
      reducedMotion: false,
    });
    expect(profile.mobile).toBe(false);
    expect(profile.scissors).toBe(11);
    expect(profile.chairs).toBe(3);
    expect(profile.neonTubes).toBe(42);
    expect(profile.particles).toBe(420);
    expect(profile.dpr).toBe(1.6);
    expect(profile.antialias).toBe(true);
  });

  it('drops particle and tube counts on a phone', () => {
    const profile = stageProfile({
      viewportWidth: 390,
      devicePixelRatio: 3,
      reducedMotion: false,
    });
    expect(profile.mobile).toBe(true);
    expect(profile.scissors).toBeLessThan(11);
    expect(profile.neonTubes).toBeLessThan(42);
    expect(profile.particles).toBeLessThan(420);
    expect(profile.dpr).toBeLessThanOrEqual(1.15);
    expect(profile.antialias).toBe(false);
    expect(profile.chairs).toBe(3);
  });

  it('honours reduced motion and save-data', () => {
    const profile = stageProfile({
      viewportWidth: 1280,
      devicePixelRatio: 2,
      reducedMotion: true,
      saveData: true,
    });
    expect(profile.reducedMotion).toBe(true);
    expect(profile.saveData).toBe(true);
    expect(profile.particles).toBe(72);
    expect(profile.dpr).toBeLessThanOrEqual(1.15);
  });
});

describe('createShow', () => {
  it('builds chairs, flying scissors, and neon tubes', () => {
    const profile = stageProfile({
      viewportWidth: 1200,
      devicePixelRatio: 1,
      reducedMotion: true,
    });
    const show = createShow(profile);
    expect(show.scene.getObjectByName('mannequin')).toBeTruthy();
    expect(show.scene.getObjectByName('clipper')).toBeTruthy();
    expect(show.scene.getObjectByName('barber-angelo')).toBeTruthy();
    expect(show.scene.getObjectByName('barber-eros')).toBeTruthy();
    expect(show.targets).toHaveLength(2);
    expect(show.targets[0]?.userData.href).toBe('#barber-angelo');
    expect(show.targets[1]?.userData.href).toBe('#barber-eros');
    show.update(2, 0, 0);
    show.dispose();
  });
});
