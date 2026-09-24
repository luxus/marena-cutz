import { Color, type MeshStandardMaterial, type Vector3 } from 'three';

const PEACH = new Color('#ffb68b');
const HAIR = new Color('#16110e');

/** Skin fade + peach lineup in object space. Bounds come from the scan mesh. */
export function applySkinFade(material: MeshStandardMaterial, min: Vector3, size: Vector3) {
  material.roughness = Math.min(material.roughness, 0.48);
  material.metalness = 0;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uMin = { value: min };
    shader.uniforms.uSize = { value: size };
    shader.uniforms.uPeach = { value: PEACH };
    shader.uniforms.uHair = { value: HAIR };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vLocal;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvLocal = position;');
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
         varying vec3 vLocal;
         uniform vec3 uMin;
         uniform vec3 uSize;
         uniform vec3 uPeach;
         uniform vec3 uHair;`
      )
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>
         vec3 unit = clamp((vLocal - uMin) / max(uSize, vec3(0.0001)), 0.0, 1.0);
         float up = unit.y;
         float side = abs(unit.x - 0.5);
         float faceKeep = smoothstep(0.5, 0.72, unit.z) * (1.0 - smoothstep(0.66, 0.84, up));
         float crown = smoothstep(0.5, 0.68, up);
         float fade = smoothstep(0.32, 0.56, up) * smoothstep(0.0, 0.22, side);
         float hair = clamp(max(crown, fade) * (1.0 - faceKeep), 0.0, 1.0);
         float lineup = smoothstep(0.18, 0.42, hair) * (1.0 - smoothstep(0.48, 0.7, hair));
         diffuseColor.rgb = mix(diffuseColor.rgb, uHair, hair);
         diffuseColor.rgb = mix(diffuseColor.rgb, uPeach, lineup);`
      );
  };
  const cacheKey = material.customProgramCacheKey.bind(material);
  material.customProgramCacheKey = () => `${cacheKey()}|skin-fade`;
}
