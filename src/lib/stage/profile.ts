export type StageProfile = {
  mobile: boolean;
  reducedMotion: boolean;
  saveData: boolean;
  dpr: number;
  scissors: number;
  chairs: number;
  neonTubes: number;
  particles: number;
  antialias: boolean;
};

export function stageProfile(opts: {
  viewportWidth: number;
  devicePixelRatio: number;
  reducedMotion: boolean;
  saveData?: boolean;
}): StageProfile {
  const mobile = opts.viewportWidth < 768;
  const saveData = Boolean(opts.saveData);
  const light = mobile || saveData;
  const cap = light ? 1.15 : 1.6;
  const raw = Number.isFinite(opts.devicePixelRatio) ? opts.devicePixelRatio : 1;
  const dpr = Math.min(Math.max(raw, 1), cap);

  return {
    mobile,
    reducedMotion: opts.reducedMotion,
    saveData,
    dpr,
    scissors: light ? 4 : 11,
    chairs: 3,
    neonTubes: light ? 16 : 42,
    particles: light ? 72 : 420,
    antialias: !light,
  };
}
