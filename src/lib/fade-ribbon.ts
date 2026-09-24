/**
 * Fade Ribbon — one soft sheet over the hero headline.
 * Dark and dense at one edge, peach and light at the other: a hair fade, not a light fixture.
 * Lazy-imported. Paused offscreen. Skipped when reduced-motion / save-data / no WebGL.
 */
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  Vector2,
  WebGLRenderer,
} from 'three';
import { getWebGLQuality, type WebGLQuality } from './webgl-guard';

export type FadeRibbonHandle = {
  destroy: () => void;
  live: boolean;
};

function mix(a: Color, b: Color, t: number, out: Color): Color {
  return out.copy(a).lerp(b, t);
}

function buildRibbon(cols: number, rows: number): BufferGeometry {
  const dense = new Color('#140e0b');
  const hot = new Color('#ff7a00');
  const peach = new Color('#ffb68b');
  const cool = new Color('#7fd8df');
  const tmp = new Color();

  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  for (let y = 0; y <= rows; y++) {
    const v = y / rows;
    for (let x = 0; x <= cols; x++) {
      const u = x / cols;
      const wave = Math.sin(u * Math.PI * 1.35) * 0.42 + Math.sin(u * Math.PI * 0.5) * 0.18;
      const half = 0.72;
      positions.push((u - 0.5) * 9.2, (v - 0.5) * half * 2 + wave, Math.sin(u * Math.PI) * 0.35);

      const along =
        u < 0.45 ? mix(dense, hot, u / 0.45, tmp) : mix(hot, peach, (u - 0.45) / 0.55, tmp);
      if (u > 0.82) mix(along, cool, (u - 0.82) * 0.35, along);
      const across = 0.55 + v * 0.45;
      colors.push(along.r * across, along.g * across, along.b * across);
    }
  }

  const stride = cols + 1;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const a = y * stride + x;
      indices.push(a, a + 1, a + stride, a + 1, a + stride + 1, a + stride);
    }
  }

  const geom = new BufferGeometry();
  geom.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  geom.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

export function mountFadeRibbon(
  canvas: HTMLCanvasElement,
  options: { root?: HTMLElement; pointerRoot?: HTMLElement } = {}
): FadeRibbonHandle {
  const quality: WebGLQuality = getWebGLQuality();
  if (quality === 'off') return { destroy() {}, live: false };

  const root = options.root ?? canvas.parentElement ?? canvas;
  const pointerRoot = options.pointerRoot ?? root;
  const isLow = quality === 'low';

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: !isLow,
      powerPreference: 'low-power',
      stencil: false,
      depth: false,
    });
  } catch {
    return { destroy() {}, live: false };
  }

  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = SRGBColorSpace;

  const scene = new Scene();
  const camera = new PerspectiveCamera(28, 1, 0.1, 30);
  camera.position.set(0, 0, 6.4);
  camera.lookAt(0, 0, 0);

  const geom = buildRibbon(isLow ? 36 : 80, isLow ? 5 : 10);
  const material = new MeshBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.72,
    depthWrite: false,
    side: DoubleSide,
    toneMapped: false,
  });
  const mesh = new Mesh(geom, material);
  scene.add(mesh);

  const pointer = new Vector2();
  const pointerTarget = new Vector2();
  const t0 = performance.now();
  let raf = 0;
  let running = false;

  const resize = () => {
    const width = root.clientWidth || 1;
    const height = root.clientHeight || 1;
    if (width < 2 || height < 2) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isLow ? 1.15 : 1.5));
    renderer.setSize(width, height, false);
  };

  const onPointer = (event: PointerEvent) => {
    const rect = pointerRoot.getBoundingClientRect();
    if (rect.width < 1) return;
    pointerTarget.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointerTarget.y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
  };

  const renderFrame = () => {
    const t = (performance.now() - t0) / 1000;
    pointer.lerp(pointerTarget, 0.06);
    mesh.rotation.z = Math.sin(t * 0.17) * 0.045 + pointer.x * 0.06;
    mesh.rotation.x = Math.sin(t * 0.11) * 0.04 + pointer.y * 0.05;
    mesh.position.y = Math.sin(t * 0.23) * 0.08;
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
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  };

  let intersecting = true;
  const io = new IntersectionObserver(
    (entries) => {
      intersecting = entries.some((entry) => entry.isIntersecting);
      if (intersecting && !document.hidden) play();
      else pause();
    },
    { threshold: [0, 0.05] }
  );
  io.observe(root);

  const onVisibility = () => {
    if (document.hidden) pause();
    else if (intersecting) play();
  };

  const ro = new ResizeObserver(resize);
  ro.observe(root);
  pointerRoot.addEventListener('pointermove', onPointer, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('pagehide', pause);

  resize();
  renderFrame();
  play();

  return {
    live: true,
    destroy() {
      pause();
      io.disconnect();
      ro.disconnect();
      pointerRoot.removeEventListener('pointermove', onPointer);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', pause);
      geom.dispose();
      material.dispose();
      renderer.dispose();
    },
  };
}
