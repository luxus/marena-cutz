export type StageMode = 'still' | 'lite' | 'full';

export function stageMode(options: {
  reducedMotion: boolean;
  saveData: boolean;
  viewportWidth: number;
}): StageMode {
  if (options.reducedMotion) return 'still';
  if (options.saveData || options.viewportWidth < 768) return 'lite';
  return 'full';
}

export function pixelRatioFor(mode: StageMode, devicePixelRatio: number): number {
  const ratio = Number.isFinite(devicePixelRatio) && devicePixelRatio > 0 ? devicePixelRatio : 1;
  if (mode === 'lite') return 1;
  if (mode === 'still') return Math.min(ratio, 1.5);
  return Math.min(ratio, 1.75);
}
