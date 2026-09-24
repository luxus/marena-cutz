import { Box3, CylinderGeometry, Mesh, MeshStandardMaterial, Vector3 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createStudio, readStageMode } from '../stage/studio';
import { applySkinFade } from './fadeMaterial';

export function mountHero(root: HTMLElement) {
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
  let subject: { rotation: { y: number } } | null = null;
  let frame = 0;
  let running = true;

  if (mode === 'full') {
    const tubeMat = (color: string) =>
      new MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 2.2,
        roughness: 0.4,
        metalness: 0,
      });
    const vertical = new Mesh(new CylinderGeometry(0.012, 0.012, 1.6, 16), tubeMat('#00eefc'));
    vertical.position.set(-0.95, 0.2, -0.85);
    const horizontal = new Mesh(new CylinderGeometry(0.01, 0.01, 1.8, 16), tubeMat('#ff7a00'));
    horizontal.rotation.z = Math.PI / 2.4;
    horizontal.position.set(0.2, 0.7, -1.05);
    scene.add(vertical, horizontal);
  }

  const loader = new GLTFLoader();
  loader.load(
    '/models/head.glb',
    (gltf) => {
      const model = gltf.scene;
      const bounds = new Box3().setFromObject(model);
      const size = bounds.getSize(new Vector3());
      const center = bounds.getCenter(new Vector3());
      const scale = 1.85 / Math.max(size.y, 0.001);
      model.scale.setScalar(scale);
      model.position.copy(center).multiplyScalar(-scale);
      model.position.x += 0.18;
      model.rotation.y = 0.95;

      model.traverse((child) => {
        if (!(child instanceof Mesh)) return;
        const source = child.material;
        const material = (Array.isArray(source) ? source[0] : source) as MeshStandardMaterial;
        if (!material || !('roughness' in material)) return;
        if (material.normalMap) material.normalScale.set(1.4, 1.4);
        child.geometry.computeBoundingBox();
        const box = child.geometry.boundingBox;
        if (!box) return;
        applySkinFade(material, box.min.clone(), box.getSize(new Vector3()));
        child.material = material;
      });

      scene.add(model);
      subject = model;
      frameShot(0);
      root.dataset.ready = 'true';
      if (mode !== 'still') loop();
    },
    undefined,
    () => {
      root.dataset.ready = 'true';
    }
  );

  function frameShot(time: number) {
    const width = root.clientWidth || 1;
    const height = root.clientHeight || 1;
    if (renderer.domElement.width !== Math.floor(width * renderer.getPixelRatio())) {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    const sway = mode === 'still' ? 0 : Math.sin(time * 0.35) * 0.08;
    camera.position.set(0.05 + sway, 0.08, 1.7);
    camera.lookAt(0.12, 0.02, 0);
    if (subject && mode === 'full') subject.rotation.y = 0.95 + Math.sin(time * 0.25) * 0.12;
    renderer.render(scene, camera);
  }

  function loop() {
    if (!running) return;
    frame = requestAnimationFrame(() => {
      frameShot(performance.now() / 1000);
      loop();
    });
  }

  const onResize = () => frameShot(performance.now() / 1000);
  window.addEventListener('resize', onResize);

  return () => {
    running = false;
    cancelAnimationFrame(frame);
    window.removeEventListener('resize', onResize);
    renderer.dispose();
  };
}
