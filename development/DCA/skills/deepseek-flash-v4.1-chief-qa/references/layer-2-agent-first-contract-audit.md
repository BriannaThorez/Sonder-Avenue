---
address: DCA.Skill.DeepSeekFlash-v4_1.chief-code-qa.layer-2-agent-first-contract-audit
layer: 2
parent_skill: "DCA.Skill.DeepSeekFlash-v4_1.chief-code-qa"
dca_version: "2.2.43"
---

# Layer 2 Reference: Agent-First Tool Contract & Bicameral Separation Audit

## 1. Reference-First Tool Invocation (`DCR-2.2.23-01` & `DCR-2.2.40-01`)
Every toolset and 3D composer in Sonder Avenue must be usable by an autonomous agent purely via **domained cased dot-notation addresses with `kebab-case` terminal slugs**:
- **Generative Shape Grammar Composer (`shape-grammar-composer`)**:
  - Root lot address: `world.bremerton.<block-slug>.<plot-slug>`
  - Style rule token address: `world.bremerton.<block-slug>.<plot-slug>.style.<style-slug>`
  - Story BSP plan address: `world.bremerton.<block-slug>.<plot-slug>.floor-<nn>.room.<zone-slug>`
  - Subtractive facade module address: `world.bremerton.<block-slug>.<plot-slug>.floor-<nn>.facade-<edge>.bay-<bb>.<module-slug>`
- **Spline Road Composer (`spline-road-composer`)**:
  - Node address: `world.bremerton.roads.node.<node-slug>`
  - Curve segment address: `world.bremerton.roads.segment.<segment-slug>`
  - Streetlamp & bollard instanced address: `world.bremerton.roads.fixture.<fixture-slug>`
- **Collision Physics Composer (`collision-physics-composer`)**:
  - Collider volume address: `world.bremerton.physics.collider.<shape>.<collider-slug>`
- **Character Skinning & Additive Blending Composer (`character-skinning-composer`)**:
  - Skeletal bone address: `citizen.<citizen-slug>.body.skeleton.<bone-slug>`
  - Base locomotion clip address: `citizen.<citizen-slug>.body.anim-base.<clip-slug>`
  - Additive pose clip address: `citizen.<citizen-slug>.body.anim-additive.<pose-slug>`

## 2. Bicameral Daemon Separation (`DCR-2.1.17-01`)
- `.mind` never manipulates raw `THREE.Bone` quaternions; it dispatches `CorticalIntentPacket` structures referencing canonical world or citizen addresses.
- `.daemon` evaluates 10Hz `PersonaCalculus` ($\vec{\Psi} \in S^{23}$) and drives 60Hz `THREE.SkinnedMesh` harnesses.
