import { Box3, Group, Vector3 } from 'three';
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
      model.position.sub(center);
      const pivot = new Group();
      pivot.add(model);
      scene.add(pivot);

      const radius = size.length() * 0.5;
      const view = root.dataset.view ?? 'three-quarter';
      const direction =
        view === 'top'
          ? new Vector3(0.4, 1.55, 0.62)
          : view === 'side'
            ? new Vector3(1.2, 0.38, 0.82)
            : new Vector3(0.95, 0.46, 1.2);

      const draw = () => {
        pivot.rotation.y = turn;
        const width = root.clientWidth || 1;
        const height = root.clientHeight || 1;
        camera.aspect = width / height;
        const vHalf = ((camera.fov * Math.PI) / 180) / 2;
        const hHalf = Math.atan(Math.tan(vHalf) * camera.aspect);
        const distance = (radius / Math.sin(Math.min(vHalf, hHalf))) * 1.32;
        camera.position.copy(direction.clone().normalize().multiplyScalar(distance));
        camera.near = Math.max(distance / 80, 0.001);
        camera.far = distance * 12;
        camera.lookAt(0, 0, 0);
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
