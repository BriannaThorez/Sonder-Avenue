---
address: DCA.Skill.DeepSeekFlash-v4_1.chief-code-qa.layer-3-deep-r186-composer-qa
layer: 3
parent_skill: "DCA.Skill.DeepSeekFlash-v4_1.chief-code-qa"
dca_version: "2.2.43"
---

# Layer 3 Reference: Deep Three.js r186 Composer, Shader & Memory Pipeline QA

## 1. Three.js r186 Instancing & Bi-Directional Address Picking
- All repeating architectural modules (wall piers, window sills, lintels, window frames, window panes, doorway portals, interior BSP walls, stairwell steps, roof ridges, streetlamps, bollards, trees, pilings, zebra crosswalks) MUST be bundled into `THREE.InstancedMesh` or `THREE.BatchedMesh`.
- Every `InstancedMesh` stores `userData.instanceAddresses: string[]` so raycasting `intersection.instanceId` resolves in $O(1)$ time to its canonical DCA dot-notation address.

## 2. TSL Procedural Shader & Post-Processing Discipline
- Facade and window `InstancedMesh` materials inject per-instance attributes (`aInstanceSeed`, `aWeatherGrime`, `aWindowLumState`) and uniforms (`uTimeOfDay`, `uWeatherWetness`, `uSelectedInstanceSeed`) to synthesize weathered PNW cedar/masonry micro-relief, coastal rain-streak patina, and interior parallax window illumination.
- Post-processing runs through `EffectComposer` (`RenderPass` $\rightarrow$ `UnrealBloomPass` $\rightarrow$ `SMAAPass`).

## 3. Mandatory `.dispose()` Memory Pipeline
- `SceneResourceDisposer` tracks every `BufferGeometry`, `Material`, `Texture`, `WebGLRenderTarget`, `InstancedMesh`, and `BatchedMesh` and frees 100% of GPU allocations on hot-reload or rebuild.
