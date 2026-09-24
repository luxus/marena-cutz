/**
 * Architectural LED tubes for the hero — the shop’s ceiling lights, in 3D.
 * Lazy-imported, paused offscreen, skipped when reduced-motion / save-data / no WebGL.
 */
import {
  AdditiveBlending,
  CapsuleGeometry,
  Color,
  Group,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  Vector2,
  WebGLRenderer,
} from 'three';
import { getWebGLQuality, type WebGLQuality } from './webgl-guard';

export type LightTubesHandle = {
  destroy: () => void;
  live: boolean;
};

type TubeTone = 'primary' | 'hot' | 'cool';

type TubeSpec = {
  length: number;
  radius: number;
  position: [number, number, number];
  rotation: [number, number, number];
  tone: TubeTone;
};

/** Crossing linear fixtures, scaled to fill the dark hero stage — not random noise. */
const TUBE_LAYOUT: TubeSpec[] = [
  {
    length: 3.4,
    radius: 0.055,
    position: [-0.85, 1.15, 0],
    rotation: [0.15, 0.2, 0.95],
    tone: 'primary',
  },
  {
    length: 2.7,
    radius: 0.048,
    position: [0.55, 1.55, -0.35],
    rotation: [0.4, -0.1, -0.72],
    tone: 'hot',
  },
  {
    length: 3.8,
    radius: 0.05,
    position: [1.15, 0.15, -0.15],
    rotation: [-0.08, 0.25, 1.05],
    tone: 'primary',
  },
  {
    length: 2.2,
    radius: 0.04,
    position: [-0.2, 0.35, 0.45],
    rotation: [0.55, 0.05, 0.22],
    tone: 'cool',
  },
  {
    length: 3.1,
    radius: 0.052,
    position: [-1.35, -0.55, -0.2],
    rotation: [0.12, -0.3, -0.85],
    tone: 'primary',
  },
  {
    length: 2.5,
    radius: 0.044,
    position: [0.95, -1.15, 0.2],
    rotation: [-0.2, 0.18, 0.62],
    tone: 'hot',
  },
  {
    length: 1.8,
    radius: 0.036,
    position: [-0.15, -1.45, 0.55],
    rotation: [0.08, 0.4, -0.35],
    tone: 'cool',
  },
  {
    length: 3.2,
    radius: 0.05,
    position: [0.15, 0.85, -0.55],
    rotation: [0.05, -0.12, 1.25],
    tone: 'primary',
  },
];

function readCssColor(name: string, fallback: string): Color {
  if (typeof document === 'undefined') return new Color(fallback);
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  try {
    return new Color(raw || fallback);
  } catch {
    return new Color(fallback);
  }
}

function toneColor(tone: TubeTone): Color {
  if (tone === 'hot') return readCssColor('--color-primary-container', '#ff7a00');
  if (tone === 'cool') return readCssColor('--color-secondary-container', '#00eefc');
  return readCssColor('--color-primary', '#ffb68b');
}

export function mountLightTubes(
  canvas: HTMLCanvasElement,
  options: { root?: HTMLElement } = {}
): LightTubesHandle {
  const quality: WebGLQuality = getWebGLQuality();
  if (quality === 'off') {
    return { destroy() {}, live: false };
  }

  const root = options.root ?? canvas.parentElement ?? canvas;
  const isLow = quality === 'low';
  const layout = isLow
    ? TUBE_LAYOUT.filter((_, i) => i % 2 === 0 || i < 4).slice(0, 6)
    : TUBE_LAYOUT;

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: !isLow,
      powerPreference: 'low-power',
      stencil: false,
      depth: true,
    });
  } catch {
    return { destroy() {}, live: false };
  }

  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = SRGBColorSpace;

  const scene = new Scene();
  const camera = new PerspectiveCamera(38, 1, 0.1, 40);
  camera.position.set(0.15, 0.15, 6.1);
  camera.lookAt(0, 0.15, 0);

  const group = new Group();
  scene.add(group);

  const geometries: CapsuleGeometry[] = [];
  const materials: MeshBasicMaterial[] = [];
  const cores: Mesh[] = [];

  const radial = isLow ? 5 : 8;
  const cap = isLow ? 3 : 5;

  layout.forEach((spec) => {
    const color = toneColor(spec.tone);
    const geom = new CapsuleGeometry(spec.radius, spec.length, cap, radial);
    geometries.push(geom);

    const coreMat = new MeshBasicMaterial({
      color,
      transparent: true,
      opacity: spec.tone === 'cool' ? 0.72 : 0.92,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    materials.push(coreMat);
    const core = new Mesh(geom, coreMat);
    core.position.set(...spec.position);
    core.rotation.set(...spec.rotation);
    group.add(core);
    cores.push(core);

    if (!isLow) {
      const glowGeom = new CapsuleGeometry(spec.radius * 3.2, spec.length, cap, radial);
      geometries.push(glowGeom);
      const glowMat = new MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.28,
        blending: AdditiveBlending,
        depthWrite: false,
      });
      materials.push(glowMat);
      const glow = new Mesh(glowGeom, glowMat);
      glow.position.copy(core.position);
      glow.rotation.copy(core.rotation);
      group.add(glow);
    }
  });

  const t0 = performance.now();
  const pointer = new Vector2(0, 0);
  const pointerTarget = new Vector2(0, 0);
  let raf = 0;
  let running = false;
  let themeObs: MutationObserver | null = null;

  const setPixelRatio = () => {
    const capRatio = isLow ? 1.15 : 1.6;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, capRatio));
  };

  const resize = () => {
    const width = root.clientWidth || window.innerWidth;
    const height = root.clientHeight || window.innerHeight;
    if (width < 2 || height < 2) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    setPixelRatio();
    renderer.setSize(width, height, false);
  };

  const onPointer = (event: PointerEvent) => {
    const rect = root.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    pointerTarget.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointerTarget.y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
  };

  const renderFrame = () => {
    const t = (performance.now() - t0) / 1000;
    pointer.lerp(pointerTarget, 0.045);
    group.rotation.y = Math.sin(t * 0.11) * 0.07 + pointer.x * 0.16;
    group.rotation.x = Math.sin(t * 0.09 + 0.4) * 0.045 + pointer.y * 0.1;
    group.position.y = Math.sin(t * 0.07) * 0.06;

    cores.forEach((mesh, i) => {
      const mat = mesh.material as MeshBasicMaterial;
      const pulse = 0.78 + Math.sin(t * 1.15 + i * 0.7) * 0.18;
      mat.opacity = Math.min(1, pulse);
    });

    renderer.render(scene, camera);
  };

  const loop = () => {
    if (!running) {
      raf = 0;
      return;
    }
    raf = requestAnimationFrame(loop);
    renderFrame();
  };

  const play = () => {
    if (running) return;
    running = true;
    if (!raf) raf = requestAnimationFrame(loop);
  };

  const pause = () => {
    running = false;
    if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };

  const onVisibility = () => {
    if (document.hidden) pause();
    else if (intersecting) play();
  };

  let intersecting = true;
  const io = new IntersectionObserver(
    (entries) => {
      intersecting = entries.some(
        (entry) => entry.isIntersecting && entry.intersectionRatio > 0.02
      );
      if (intersecting && !document.hidden) play();
      else pause();
    },
    { threshold: [0, 0.02, 0.15] }
  );
  io.observe(root);

  const ro = new ResizeObserver(resize);
  ro.observe(root);

  root.addEventListener('pointermove', onPointer, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('pagehide', pause);

  themeObs = new MutationObserver(() => {
    layout.forEach((spec, i) => {
      const mesh = cores[i];
      if (!mesh) return;
      (mesh.material as MeshBasicMaterial).color.copy(toneColor(spec.tone));
    });
  });
  themeObs.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-mode', 'data-theme'],
  });

  resize();
  renderFrame();
  play();

  const destroy = () => {
    pause();
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    io.disconnect();
    ro.disconnect();
    themeObs?.disconnect();
    root.removeEventListener('pointermove', onPointer);
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('pagehide', pause);
    geometries.forEach((geom) => geom.dispose());
    materials.forEach((mat) => mat.dispose());
    renderer.dispose();
  };

  return { destroy, live: true };
}
