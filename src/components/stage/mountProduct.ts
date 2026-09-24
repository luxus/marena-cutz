import { Box3, Vector3 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createStudio, readStageMode } from './studio';

export function mountProduct(root: HTMLElement, url: string) {
  const mode = readStageMode(root.clientWidth || window.innerWidth);
  root.dataset.mode = mode;
  let studio: ReturnType<typeof createStudio>;
  try {
    studio = createStudio(root, mode);
  } catch {
    root.dataset.ready = 'true';
    return;
  }

  const { renderer, scene, camera } = studio;
  const loader = new GLTFLoader();
  let turn = 0.5;
  let frame = 0;
  let running = true;

  loader.load(
    url,
    (gltf) => {
      const model = gltf.scene;
      const bounds = new Box3().setFromObject(model);
      const size = bounds.getSize(new Vector3());
      const center = bounds.getCenter(new Vector3());
      const maxDim = Math.max(size.x, size.y, size.z, 0.001);
      model.position.sub(center);
      scene.add(model);

      const fit = maxDim * 1.45;
      const thinY = size.y < size.x * 0.35 && size.y < size.z * 0.35;
      camera.position.set(thinY ? fit * 0.2 : fit * 0.62, thinY ? fit * 1.05 : fit * 0.42, fit * 0.72);
      camera.near = maxDim / 100;
      camera.far = maxDim * 20;
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();

      const draw = () => {
        model.rotation.y = turn;
        const width = root.clientWidth || 1;
        const height = root.clientHeight || 1;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
        renderer.render(scene, camera);
      };

      draw();
      root.dataset.ready = 'true';
      if (mode === 'still') return;

      const spin = () => {
        if (!running) return;
        turn += mode === 'lite' ? 0.004 : 0.008;
        draw();
        frame = requestAnimationFrame(spin);
      };
      spin();
    },
    undefined,
    () => {
      root.dataset.ready = 'true';
    }
  );

  return () => {
    running = false;
    cancelAnimationFrame(frame);
    renderer.dispose();
  };
}
