/**
 * Progressive-enhancement gates for the hero WebGL craft piece.
 * Three.js must never be required to use the site.
 */

export type WebGLQuality = 'off' | 'low' | 'high';

type NavigatorWithConnection = Navigator & {
  connection?: { saveData?: boolean };
};

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function hasWebGL(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

export function getWebGLQuality(): WebGLQuality {
  if (prefersReducedMotion()) return 'off';
  if (typeof navigator !== 'undefined') {
    const conn = (navigator as NavigatorWithConnection).connection;
    if (conn?.saveData) return 'off';
  }
  if (!hasWebGL()) return 'off';

  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const mobile = /Mobi|Android|iPhone|iPad/i.test(ua);
  const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 8 : 8;
  if (mobile || cores <= 4) return 'low';
  return 'high';
}

export function shouldMountWebGL(): boolean {
  return getWebGLQuality() !== 'off';
}
