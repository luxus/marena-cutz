import {
  ACESFilmicToneMapping,
  Color,
  DirectionalLight,
  PMREMGenerator,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { pixelRatioFor, stageMode, type StageMode } from '../../lib/stage-mode';

export function readStageMode(width: number): StageMode {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const connection = navigator as Navigator & { connection?: { saveData?: boolean } };
  const saveData = connection.connection?.saveData === true;
  return stageMode({ reducedMotion, saveData, viewportWidth: width });
}

export function createStudio(root: HTMLElement, mode: StageMode) {
  const renderer = new WebGLRenderer({
    antialias: mode !== 'lite',
    alpha: false,
    powerPreference: mode === 'lite' ? 'low-power' : 'high-performance',
  });
  renderer.setPixelRatio(pixelRatioFor(mode, window.devicePixelRatio));
  renderer.setSize(root.clientWidth, root.clientHeight);
  renderer.outputColorSpace = 'srgb';
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.28;
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  root.appendChild(renderer.domElement);

  const scene = new Scene();
  scene.background = new Color('#0e0e0e');
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  const camera = new PerspectiveCamera(
    32,
    Math.max(root.clientWidth, 1) / Math.max(root.clientHeight, 1),
    0.01,
    50
  );

  const key = new DirectionalLight('#fff0e4', 4.2);
  key.position.set(1.2, 1.8, 2.8);
  const rim = new DirectionalLight('#00eefc', 2.4);
  rim.position.set(-2.4, 1.2, -1.2);
  const fill = new DirectionalLight('#ffb68b', 1.1);
  fill.position.set(-0.4, 0.2, 2.2);
  scene.add(key, rim, fill);

  return { renderer, scene, camera, key, rim };
}
