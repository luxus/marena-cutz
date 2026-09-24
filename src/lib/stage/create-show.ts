import {
  AmbientLight,
  BoxGeometry,
  BufferGeometry,
  CircleGeometry,
  Color,
  CylinderGeometry,
  DoubleSide,
  Float32BufferAttribute,
  FogExp2,
  Group,
  CanvasTexture,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Points,
  PointsMaterial,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
  TextureLoader,
  TorusGeometry,
  type Material,
  type Object3D,
} from 'three';
import type { StageProfile } from './profile';

const PEACH = 0xffb68b;
const ORANGE = 0xff7a00;
const CYAN = 0x00eefc;
const PINK = 0xf8b2d9;
const TEAL = 0x14c8c4;

type NeonTube = {
  material: MeshBasicMaterial;
  base: Color;
  phase: number;
  speed: number;
};

type Scissor = {
  group: Group;
  blade: Object3D;
  phase: number;
  speed: number;
  baseX: number;
  baseY: number;
  baseZ: number;
};

type Chair = {
  group: Group;
  spin: number;
  phase: number;
  tilt: number;
};

export type CastMember = {
  name: string;
  position: string;
  image: string;
};

const DEFAULT_CAST: CastMember[] = [
  { name: 'Angelo', position: 'Master Barber', image: '/images/angelo.jpg' },
  { name: 'Eros', position: 'Barber', image: '/images/eros.jpg' },
];

export type CutShow = {
  scene: Scene;
  camera: PerspectiveCamera;
  targets: Object3D[];
  update: (time: number, pointerX: number, pointerY: number) => void;
  dispose: () => void;
};

type BarberRig = {
  group: Group;
  arms: Group[];
  phase: number;
  baseRot: number;
};

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function scissors(): Scissor {
  const group = new Group();
  const metal = new MeshStandardMaterial({
    color: 0xd7d7dc,
    metalness: 0.96,
    roughness: 0.16,
  });
  const edge = new MeshStandardMaterial({
    color: 0xf4f4f6,
    metalness: 1,
    roughness: 0.1,
  });

  const bladeGeo = new BoxGeometry(0.045, 1.15, 0.012);
  const fixed = new Mesh(bladeGeo, edge);
  fixed.position.y = 0.42;
  group.add(fixed);

  const pivot = new Group();
  const moving = new Mesh(bladeGeo, edge);
  moving.position.y = 0.42;
  pivot.add(moving);
  group.add(pivot);

  const loopGeo = new TorusGeometry(0.11, 0.02, 8, 18);
  const loopA = new Mesh(loopGeo, metal);
  loopA.position.y = -0.22;
  loopA.position.x = -0.08;
  const loopB = new Mesh(loopGeo, metal);
  loopB.position.y = -0.22;
  loopB.position.x = 0.08;
  group.add(loopA, loopB);

  const screw = new Mesh(new CylinderGeometry(0.035, 0.035, 0.04, 10), metal);
  screw.rotation.x = Math.PI / 2;
  group.add(screw);

  return {
    group,
    blade: pivot,
    phase: 0,
    speed: 1,
    baseX: 0,
    baseY: 0,
    baseZ: 0,
  };
}

function chair(color: number): Group {
  const group = new Group();
  const leather = new MeshStandardMaterial({
    color,
    roughness: 0.42,
    metalness: 0.08,
    emissive: color,
    emissiveIntensity: 0.22,
  });
  const chrome = new MeshStandardMaterial({
    color: 0xb9bcc4,
    metalness: 1,
    roughness: 0.18,
  });

  const base = new Mesh(new CylinderGeometry(0.42, 0.5, 0.08, 20), chrome);
  const pole = new Mesh(new CylinderGeometry(0.055, 0.07, 0.46, 12), chrome);
  pole.position.y = 0.28;
  const seat = new Mesh(new BoxGeometry(0.72, 0.16, 0.7), leather);
  seat.position.y = 0.58;
  const back = new Mesh(new BoxGeometry(0.68, 0.92, 0.12), leather);
  back.position.set(0, 1.08, -0.26);
  const head = new Mesh(new BoxGeometry(0.36, 0.16, 0.12), leather);
  head.position.set(0, 1.58, -0.26);
  const armGeo = new BoxGeometry(0.08, 0.06, 0.46);
  const armL = new Mesh(armGeo, chrome);
  armL.position.set(-0.4, 0.78, 0.02);
  const armR = new Mesh(armGeo, chrome);
  armR.position.set(0.4, 0.78, 0.02);
  const foot = new Mesh(new BoxGeometry(0.46, 0.05, 0.16), chrome);
  foot.position.set(0, 0.22, 0.38);

  group.add(base, pole, seat, back, head, armL, armR, foot);
  return group;
}

function neonTube(length: number, color: number): { mesh: Mesh; material: MeshBasicMaterial } {
  const material = new MeshBasicMaterial({
    color,
    toneMapped: false,
  });
  const mesh = new Mesh(new CylinderGeometry(0.028, 0.028, length, 6), material);
  mesh.rotation.z = Math.PI / 2;
  return { mesh, material };
}

function labelMaterial(name: string, role: string, accent: number): MeshBasicMaterial {
  const material = new MeshBasicMaterial({ color: 0x141414, toneMapped: false });
  if (typeof document === 'undefined') return material;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');
  if (!ctx) return material;
  ctx.fillStyle = '#0c0c0c';
  ctx.fillRect(0, 0, 512, 160);
  ctx.strokeStyle = `#${accent.toString(16).padStart(6, '0')}`;
  ctx.lineWidth = 10;
  ctx.strokeRect(8, 8, 496, 144);
  ctx.fillStyle = '#f4f1ee';
  ctx.font = '700 64px sans-serif';
  ctx.fillText(name.toUpperCase(), 28, 84);
  ctx.fillStyle = '#ffb68b';
  ctx.font = '700 28px monospace';
  ctx.fillText(role.toUpperCase(), 28, 124);
  material.map = new CanvasTexture(canvas);
  material.needsUpdate = true;
  return material;
}

function mannequinHead(mobile: boolean): {
  group: Group;
  pivot: Group;
  lineup: MeshBasicMaterial;
  flash: ShaderMaterial;
} {
  const group = new Group();
  group.name = 'mannequin';
  const skin = new MeshStandardMaterial({ color: 0xc48a62, roughness: 0.48, metalness: 0.04 });
  const hairMat = new MeshStandardMaterial({ color: 0x0c0c0e, roughness: 0.62 });
  const chrome = new MeshStandardMaterial({ color: 0xb9bcc4, metalness: 1, roughness: 0.18 });
  const segments = mobile ? 20 : 32;

  const base = new Mesh(new CylinderGeometry(0.34, 0.4, 0.08, 18), chrome);
  const pole = new Mesh(new CylinderGeometry(0.06, 0.08, 0.72, 12), chrome);
  pole.position.y = 0.4;
  const neck = new Mesh(new CylinderGeometry(0.09, 0.11, 0.22, 12), skin);
  neck.position.y = 0.86;

  const flash = new ShaderMaterial({
    uniforms: {
      uSkin: { value: new Color(0xc48a62) },
      uHair: { value: new Color(0x0c0c0e) },
      uRim: { value: new Color(PEACH) },
      uFlash: { value: 0.45 },
    },
    vertexShader: `
      varying vec3 vPos;
      varying vec3 vNormal;
      void main() {
        vPos = position;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uSkin;
      uniform vec3 uHair;
      uniform vec3 uRim;
      uniform float uFlash;
      varying vec3 vPos;
      varying vec3 vNormal;
      void main() {
        float side = smoothstep(0.15, 0.85, abs(vNormal.x));
        float hairline = mix(0.12, 0.0, side);
        float skinline = mix(-0.02, -0.22, side);
        float fade = smoothstep(hairline, skinline, vPos.y);
        vec3 col = mix(uHair, uSkin, fade);
        float lineup = smoothstep(0.018, 0.0, abs(vPos.y - hairline));
        col = mix(col, uRim, lineup * (0.35 + uFlash));
        float rim = pow(1.0 - max(dot(vNormal, vec3(0.0, 0.12, 1.0)), 0.0), 2.1);
        col += uRim * rim * uFlash;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });

  const pivot = new Group();
  const head = new Mesh(new SphereGeometry(0.34, segments, mobile ? 16 : 24), flash);
  head.scale.set(0.92, 1.08, 0.88);
  head.position.y = 1.18;
  const hair = new Mesh(
    new SphereGeometry(0.36, mobile ? 16 : 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.48),
    hairMat
  );
  hair.scale.set(1.04, 0.78, 1.06);
  hair.position.y = 1.28;
  const earGeo = new SphereGeometry(0.055, 8, 8);
  const earL = new Mesh(earGeo, skin);
  earL.position.set(-0.32, 1.14, 0.02);
  const earR = earL.clone();
  earR.position.x = 0.32;
  const nose = new Mesh(new BoxGeometry(0.05, 0.08, 0.06), skin);
  nose.position.set(0, 1.12, 0.3);
  const lineupMat = new MeshBasicMaterial({ color: PEACH, toneMapped: false });
  const lineup = new Mesh(new BoxGeometry(0.46, 0.012, 0.02), lineupMat);
  lineup.position.set(0, 1.22, 0.3);
  pivot.add(head, hair, earL, earR, nose, lineup);
  pivot.position.y = 0;

  const ringMat = new MeshBasicMaterial({ color: CYAN, toneMapped: false });
  const ring = new Mesh(new TorusGeometry(0.36, 0.012, 8, 24), ringMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.08;

  group.add(base, pole, neck, pivot, ring);
  return { group, pivot, lineup: lineupMat, flash };
}

function clipperTool(): { group: Group; teeth: MeshBasicMaterial } {
  const group = new Group();
  group.name = 'clipper';
  const bodyMat = new MeshStandardMaterial({
    color: 0x1a1a1c,
    metalness: 0.45,
    roughness: 0.35,
  });
  const metal = new MeshStandardMaterial({ color: 0xd5d7de, metalness: 1, roughness: 0.16 });
  const body = new Mesh(new BoxGeometry(0.16, 0.46, 0.1), bodyMat);
  const grip = new Mesh(new BoxGeometry(0.17, 0.08, 0.11), metal);
  grip.position.y = -0.12;
  const blade = new Mesh(new BoxGeometry(0.2, 0.05, 0.045), metal);
  blade.position.y = 0.26;
  const teethMat = new MeshBasicMaterial({ color: CYAN, toneMapped: false });
  const teeth = new Mesh(new BoxGeometry(0.2, 0.018, 0.05), teethMat);
  teeth.position.set(0, 0.29, 0.01);
  const accent = new Mesh(
    new BoxGeometry(0.12, 0.06, 0.02),
    new MeshBasicMaterial({ color: ORANGE, toneMapped: false })
  );
  accent.position.set(0, 0.05, 0.06);
  group.add(body, grip, blade, teeth, accent);
  return { group, teeth: teethMat };
}

function barberFigure(member: CastMember, index: number, loadPhotos: boolean): BarberRig {
  const group = new Group();
  const slug = member.name.toLowerCase().replace(/\s+/g, '-');
  group.name = `barber-${slug}`;
  group.userData.href = `#barber-${slug}`;
  const accent = index === 0 ? ORANGE : CYAN;
  const cloth = new MeshStandardMaterial({
    color: index === 0 ? 0x16110f : 0x101418,
    roughness: 0.5,
    metalness: 0.12,
  });
  const accentMat = new MeshStandardMaterial({
    color: accent,
    emissive: accent,
    emissiveIntensity: 0.45,
    roughness: 0.35,
  });
  const skin = new MeshStandardMaterial({
    color: index === 0 ? 0xc48a62 : 0xb87448,
    roughness: 0.55,
  });
  const hairMat = new MeshStandardMaterial({ color: 0x111114, roughness: 0.75 });

  const legGeo = new BoxGeometry(0.16, 0.62, 0.16);
  const legL = new Mesh(legGeo, cloth);
  legL.position.set(-0.1, 0.31, 0);
  const legR = new Mesh(legGeo, cloth);
  legR.position.set(0.1, 0.31, 0);
  const hip = new Mesh(new BoxGeometry(0.38, 0.16, 0.2), cloth);
  hip.position.y = 0.66;
  const torso = new Mesh(new BoxGeometry(0.44, 0.52, 0.22), cloth);
  torso.position.y = 1.02;
  const stripe = new Mesh(new BoxGeometry(0.05, 0.52, 0.015), accentMat);
  stripe.position.set(0.12, 1.02, 0.11);
  const armGeo = new BoxGeometry(0.1, 0.46, 0.1);
  const armL = new Group();
  armL.position.set(-0.3, 1.22, 0);
  const armLMesh = new Mesh(armGeo, cloth);
  armLMesh.position.y = -0.24;
  armL.add(armLMesh);
  const armR = new Group();
  armR.position.set(0.3, 1.22, 0);
  const armRMesh = new Mesh(armGeo, cloth);
  armRMesh.position.y = -0.24;
  armR.add(armRMesh);
  const neck = new Mesh(new CylinderGeometry(0.07, 0.08, 0.1, 10), skin);
  neck.position.y = 1.36;
  const head = new Mesh(new SphereGeometry(0.16, 16, 12), skin);
  head.scale.set(0.92, 1.06, 0.9);
  head.position.y = 1.56;
  const hair = new Mesh(
    new SphereGeometry(0.168, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.5),
    hairMat
  );
  hair.position.y = 1.6;
  const fade = new Mesh(
    new TorusGeometry(0.145, 0.01, 6, 14),
    new MeshStandardMaterial({ color: 0x4a403c, roughness: 0.6 })
  );
  fade.rotation.x = Math.PI / 2;
  fade.position.y = 1.48;
  const label = new Mesh(
    new PlaneGeometry(0.72, 0.22),
    labelMaterial(member.name, member.position, accent)
  );
  label.position.set(0, 0.02, 0.14);

  const cardMat = new MeshStandardMaterial({ color: 0x222018, roughness: 0.55 });
  const card = new Mesh(new PlaneGeometry(0.34, 0.44), cardMat);
  card.position.set(index === 0 ? -0.42 : 0.42, 1.15, 0.02);
  card.rotation.y = index === 0 ? 0.4 : -0.4;
  group.add(legL, legR, hip, torso, stripe, armL, armR, neck, head, hair, fade, label, card);

  if (loadPhotos && member.image && typeof window !== 'undefined') {
    const loader = new TextureLoader();
    loader.load(member.image, (tex) => {
      tex.colorSpace = SRGBColorSpace;
      cardMat.map = tex;
      cardMat.color.set(0xffffff);
      cardMat.needsUpdate = true;
    });
  }

  return { group, arms: [armL, armR], phase: index * 1.4, baseRot: index === 0 ? -0.4 : 0.45 };
}

export function createShow(
  profile: StageProfile,
  options?: { cast?: CastMember[]; loadPhotos?: boolean }
): CutShow {
  const rand = mulberry32(11);
  const scene = new Scene();
  scene.background = new Color(0x070708);
  scene.fog = new FogExp2(0x070708, profile.mobile ? 0.11 : 0.085);

  const camera = new PerspectiveCamera(42, 1, 0.1, 40);
  camera.position.set(0.35, 1.48, 5.15);

  scene.add(new AmbientLight(0xffe6d4, 0.35));
  const key = new PointLight(ORANGE, 28, 14, 2);
  key.position.set(2.4, 2.6, 1.4);
  const fill = new PointLight(CYAN, 18, 12, 2);
  fill.position.set(-2.2, 2.1, 0.4);
  const kick = new PointLight(PINK, 12, 10, 2);
  kick.position.set(0.2, 0.8, 2.4);
  scene.add(key, fill, kick);

  const floor = new Mesh(
    new CircleGeometry(6.5, 40),
    new MeshStandardMaterial({
      color: 0x101012,
      metalness: 0.82,
      roughness: 0.28,
      side: DoubleSide,
    })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.02;
  scene.add(floor);

  const neons: NeonTube[] = [];
  const head = mannequinHead(profile.mobile);
  head.group.position.set(0.42, 0, 0.15);
  head.group.scale.setScalar(profile.mobile ? 1.05 : 1.2);
  scene.add(head.group);
  neons.push({
    material: head.lineup,
    base: new Color(PEACH),
    phase: 0.4,
    speed: 9,
  });

  const tool = clipperTool();
  scene.add(tool.group);
  neons.push({
    material: tool.teeth,
    base: new Color(CYAN),
    phase: 1.2,
    speed: 16,
  });

  const cast = options?.cast?.length ? options.cast : DEFAULT_CAST;
  const loadPhotos = Boolean(options?.loadPhotos);
  const spots = [
    { x: 1.72, z: 0.28 },
    { x: 2.62, z: -0.08 },
  ];
  const rigs: BarberRig[] = cast.slice(0, profile.mobile ? 2 : 3).map((member, index) => {
    const rig = barberFigure(member, index, loadPhotos);
    const spot = spots[index] ?? { x: 1.7 + index, z: 0 };
    rig.group.position.set(spot.x, 0, spot.z);
    rig.group.scale.setScalar(profile.mobile ? 0.78 : 0.9);
    scene.add(rig.group);
    return rig;
  });
  const targets = rigs.map((rig) => rig.group);

  const chairSpecs = [
    { x: -1.7, z: -1.25, y: 0, color: TEAL, spin: 0.9, tilt: 0.14, rot: 0.5 },
    { x: 0.2, z: -1.65, y: 0, color: PINK, spin: -1.25, tilt: -0.18, rot: -0.3 },
    { x: 2.15, z: -1.35, y: 0, color: ORANGE, spin: 1.7, tilt: 0.22, rot: 0.8 },
  ];
  const chairs: Chair[] = chairSpecs.slice(0, profile.chairs).map((spec, i) => {
    const group = chair(spec.color);
    group.position.set(spec.x, spec.y, spec.z);
    group.rotation.y = spec.rot;
    group.scale.setScalar(profile.mobile ? 0.92 : 1);
    scene.add(group);
    return { group, spin: spec.spin, phase: i * 1.3, tilt: spec.tilt };
  });

  const neonColors = [PEACH, ORANGE, CYAN, PINK, 0xffffff];
  for (let i = 0; i < profile.neonTubes; i++) {
    const len = 1.1 + rand() * 3.4;
    const color = neonColors[i % neonColors.length]!;
    const { mesh, material } = neonTube(len, color);
    const holder = new Group();
    holder.add(mesh);
    holder.position.set((rand() - 0.5) * 7.2, 1.15 + rand() * 2.7, (rand() - 0.5) * 4.2);
    holder.rotation.set(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI);
    scene.add(holder);
    neons.push({
      material,
      base: new Color(color),
      phase: rand() * Math.PI * 2,
      speed: 2.2 + rand() * 7.5,
    });
  }

  const cuts: Scissor[] = [];
  for (let i = 0; i < profile.scissors; i++) {
    const cut = scissors();
    const angle = (i / profile.scissors) * Math.PI * 2;
    const radius = 1.35 + (i % 3) * 0.55;
    cut.baseX = Math.cos(angle) * radius + (i === 0 ? 1.1 : 0);
    cut.baseY = 0.85 + (i % 4) * 0.38;
    cut.baseZ = Math.sin(angle) * 1.15 + (i === 0 ? 1.35 : 0);
    cut.phase = angle;
    cut.speed = 1.15 + (i % 5) * 0.28;
    cut.group.scale.setScalar(i === 0 ? 1.25 : 0.62 + (i % 3) * 0.16);
    cut.group.position.set(cut.baseX, cut.baseY, cut.baseZ);
    cut.group.rotation.set(angle, angle * 0.4, 0.4);
    scene.add(cut.group);
    cuts.push(cut);
  }

  const particleCount = profile.particles;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const palette = [new Color(PEACH), new Color(CYAN), new Color(ORANGE), new Color(PINK)];
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (rand() - 0.5) * 8;
    positions[i * 3 + 1] = rand() * 4;
    positions[i * 3 + 2] = (rand() - 0.5) * 6;
    const c = palette[i % palette.length]!;
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  const sparkGeo = new BufferGeometry();
  sparkGeo.setAttribute('position', new Float32BufferAttribute(positions, 3));
  sparkGeo.setAttribute('color', new Float32BufferAttribute(colors, 3));
  const sparks = new Points(
    sparkGeo,
    new PointsMaterial({
      size: profile.mobile ? 0.045 : 0.035,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    })
  );
  scene.add(sparks);

  const scratch = new Color();

  const update = (time: number, pointerX: number, pointerY: number) => {
    const motion = profile.reducedMotion ? 0 : 1;
    const t = profile.reducedMotion ? 1.65 : time;

    chairs.forEach((item) => {
      item.group.rotation.y = item.phase + t * item.spin * (profile.reducedMotion ? 0.35 : 2.1);
      item.group.rotation.z = item.tilt * Math.sin(t * 1.4 + item.phase) * (0.25 + motion);
      item.group.position.y = Math.sin(t * 1.6 + item.phase) * 0.1 * motion;
    });

    head.pivot.rotation.y = 0.7 + (profile.reducedMotion ? 0 : t * 0.62 + pointerX * 0.35);
    const flash = profile.reducedMotion ? 0.55 : 0.25 + Math.abs(Math.sin(t * 9.5)) * 1.7;
    head.flash.uniforms.uFlash!.value = flash;

    const orbit = profile.reducedMotion ? 1.15 : t * 2.4;
    const hx = head.group.position.x;
    const hz = head.group.position.z;
    const hy = 1.22 * head.group.scale.y;
    tool.group.position.set(
      hx + Math.cos(orbit) * 0.72,
      hy + Math.sin(t * 3.2) * 0.1 * motion + Math.sin(t * 78) * 0.012 * motion,
      hz + Math.sin(orbit) * 0.72
    );
    tool.group.lookAt(hx, hy, hz);

    rigs.forEach((rig) => {
      rig.group.rotation.y = rig.baseRot + Math.sin(t * 1.7 + rig.phase) * 0.22 * motion;
      rig.group.position.y = Math.abs(Math.sin(t * 2.8 + rig.phase)) * 0.05 * motion;
      rig.arms.forEach((arm, armIndex) => {
        arm.rotation.x = Math.sin(t * 3.4 + rig.phase + armIndex) * 0.45 * motion;
      });
    });

    cuts.forEach((cut) => {
      const a = t * cut.speed + cut.phase;
      cut.group.position.set(
        cut.baseX + Math.sin(a) * 0.85 * (0.25 + motion),
        cut.baseY + Math.cos(a * 1.35) * 0.5 * motion,
        cut.baseZ + Math.sin(a * 0.72) * 0.45 * motion
      );
      cut.group.rotation.set(a * 0.9, a * 0.55, Math.sin(a) * 0.7);
      cut.blade.rotation.z = 0.18 + Math.abs(Math.sin(t * (4 + motion * 4) + cut.phase)) * 0.85;
    });

    neons.forEach((tube) => {
      const wave = 0.45 + 0.55 * Math.sin(t * tube.speed + tube.phase);
      const strobe = Math.sin(t * (14 + tube.speed) + tube.phase) > 0.38 ? 4.2 : 0.22;
      const burst = Math.pow(Math.max(0, Math.sin(t * 6.5 + tube.phase)), 8) * 3.1;
      const gain = profile.reducedMotion ? 1.55 : (0.2 + wave) * strobe + burst;
      scratch.copy(tube.base).multiplyScalar(gain);
      tube.material.color.copy(scratch);
    });

    key.intensity = profile.reducedMotion ? 26 : 8 + 48 * (0.5 + 0.5 * Math.sin(t * 8.5));
    fill.intensity = profile.reducedMotion
      ? 16
      : 6 + 36 * (Math.sin(t * 11.5 + 1) > 0.2 ? 1 : 0.15);
    kick.intensity = profile.reducedMotion ? 10 : 4 + 32 * (Math.sin(t * 17) > 0.45 ? 1 : 0.12);

    if (!profile.reducedMotion) {
      const pos = sparkGeo.getAttribute('position');
      for (let i = 0; i < particleCount; i++) {
        let y = (pos.getY(i) + 0.004 + (i % 5) * 0.001) % 4.2;
        if (y < 0) y += 4.2;
        pos.setY(i, y);
      }
      pos.needsUpdate = true;
    }

    const sway = profile.reducedMotion ? 0 : 1;
    camera.position.x = 0.15 + Math.sin(t * 0.45) * 0.42 * sway + pointerX * 0.55 * sway;
    camera.position.y = 1.52 + pointerY * 0.28 * sway;
    camera.position.z = 5.35;
    camera.lookAt(1.05, 1.22, 0);
  };

  const dispose = () => {
    const seen = new Set<Material | BufferGeometry>();
    scene.traverse((obj) => {
      const mesh = obj as Mesh;
      if (mesh.geometry && !seen.has(mesh.geometry)) {
        seen.add(mesh.geometry);
        mesh.geometry.dispose();
      }
      const material = mesh.material as Material | Material[] | undefined;
      const list = Array.isArray(material) ? material : material ? [material] : [];
      list.forEach((item) => {
        if (seen.has(item)) return;
        seen.add(item);
        item.dispose();
      });
    });
  };

  update(0, 0, 0);
  return { scene, camera, targets, update, dispose };
}
