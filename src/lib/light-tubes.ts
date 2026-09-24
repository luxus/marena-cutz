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

/** Designed cluster echoing the salon’s crossing linear fixtures — not random noise. */
const TUBE_LAYOUT: TubeSpec[] = [
  {
    length: 5.8,
    radius: 0.032,
    position: [-2.15, 1.7, -0.55],
    rotation: [0.16, 0.22, 1.08],
    tone: 'primary',
  },
  {
    length: 4.5,
    radius: 0.028,
    position: [0.35, 2.12, -1.05],
    rotation: [0.42, -0.18, -0.88],
    tone: 'primary',
  },
  {
    length: 6.2,
    radius: 0.03,
    position: [1.85, 1.42, -0.18],
    rotation: [-0.12, 0.32, 0.96],
    tone: 'hot',
  },
  {
    length: 3.5,
    radius: 0.024,
    position: [-0.55, 2.22, 0.28],
    rotation: [0.52, 0.08, 0.18],
    tone: 'cool',
  },
  {
    length: 5.15,
    radius: 0.03,
    position: [2.55, 1.92, -0.82],
    rotation: [0.18, -0.38, -1.18],
    tone: 'primary',
  },
  {
    length: 4.7,
    radius: 0.026,
    position: [-2.72, 1.12, 0.38],
    rotation: [-0.22, 0.2, 0.72],
    tone: 'hot',
  },
  {
    length: 3.15,
    radius: 0.022,
    position: [0.18, 1.52, 0.85],
    rotation: [0.1, 0.58, -0.42],
    tone: 'cool',
  },
  {
    length: 5.4,
    radius: 0.03,
    position: [1.05, 2.38, -0.28],
    rotation: [0.06, -0.12, 1.32],
    tone: 'primary',
  },
  {
    length: 4.05,
    radius: 0.025,
    position: [-1.42, 0.95, -0.95],
    rotation: [0.34, 0.24, -0.58],
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
  const camera = new PerspectiveCamera(32, 1, 0.1, 40);
  camera.position.set(0, 1.15, 8.4);
  camera.lookAt(0, 1.35, 0);

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
        opacity: 0.14,
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
