---
address: DCA.Skill.DeepSeekFlash-v4_1.chief-code-qa
skill_id: "deepseek-flash-v4.1-chief-qa"
agent_role_address: "DCA.Agent.DeepSeekFlash-v4_1.chief-code-qa"
model_tier: "deepseek-flash-v4.1"
dca_version: "2.2.43"
status: "PERMANENT_ACTIVE"
progressive_disclosure_layers:
  layer_1: "DCA.Skill.DeepSeekFlash-v4_1.chief-code-qa.layer-1-ontology-prefix-scan"
  layer_2: "DCA.Skill.DeepSeekFlash-v4_1.chief-code-qa.layer-2-agent-first-contract-audit"
  layer_3: "DCA.Skill.DeepSeekFlash-v4_1.chief-code-qa.layer-3-deep-r186-composer-qa"
compliance_dcrs:
  - "DCR-2.1.15-01-word-native-identifiers"
  - "DCR-2.1.17-01-reflexive-substrate"
  - "DCR-2.2.12-01-cache-prefix-stability"
  - "DCR-2.2.13-01-progressive-disclosure-headers"
  - "DCR-2.2.15-01-domaining"
  - "DCR-2.2.33-01-verify-twice-rule"
  - "DCR-2.2.40-01-addressing-doctrine"
---

# DeepSeek-Flash v4.1 — Chief Code & Ontology QA Subagent Skill

## Layer 1: Progressive Disclosure Executive Summary (`DCR-2.2.13-01` & `DCR-2.2.12-01`)

`DCA.Agent.DeepSeekFlash-v4_1.chief-code-qa` is the permanent, reusable Chief Code & Architecture QA subagent for **Sonder Avenue**. It treats the **Distributed Cognitive Architecture (DCA v2.2)** as its immutable source of truth and enforces **Agent-First Architecture** across every 3D composer, simulation engine, and UI surface.

### Invocation Protocol (3-Layer Progressive Disclosure)

Agents and runtime orchestrators MUST invoke this skill progressively from Layer 1 to Layer 3, halting or remediating immediately if an earlier layer fails verification:

1. **Layer 1 — Ontological Address Tree & Prefix Stability Scan (`layer: 1`)**
   - **Input**: `dcaAddressBus.listAddresses(domainPrefix)` (never dump raw geometry buffers prior to address inspection).
   - **Checks**:
     - Every entity, building lot, BSP room cell, subtractive wall/window/door module, spline road node/segment, collider volume, and character bone/animation clip MUST possess a canonical cased dot-notation address with a `kebab-case` terminal slug (`DCR-2.1.15-01`, `DCR-2.2.15-01`, `DCR-2.2.40-01`).
     - Zero anonymous or unaddressed scene primitives.
     - Cache-prefix stability (`DCR-2.2.12-01`): deterministic lexicographical address ordering.

2. **Layer 2 — Agent-First Tool Contract & Bicameral Separation Audit (`layer: 2`)**
   - **Input**: Tool manifest & reference mutation contracts (`dcaAddressBus.inspectContract(address)`).
   - **Checks**:
     - **Reference-First Mutability**: Every composer tool (`ShapeGrammarComposer`, `SplineRoadComposer`, `CollisionPhysicsComposer`, `CharacterSkinningComposer`, `R186PostProcessingComposer`) must be invocable and mutable purely by passing its canonical DCA address reference.
     - **Bicameral Separation (`DCR-2.1.17-01`)**: `.mind` emits only `CorticalIntentPacket` structures; `.daemon` executes 10Hz `PersonaCalculus` ($\|\vec{\Psi}\| = 1$ on $S^{23}$) and 60Hz skeletal kinematics.
     - **Degaming & Anti-Slop (`DCR-2.1.19-01` .. `DCR-2.1.25-01`)**: Zero fake telemetry or non-functional UI controls.

3. **Layer 3 — Deep Three.js r186 Composer, Shader & Memory Pipeline QA (`layer: 3`)**
   - **Input**: Live Three.js r186 `SceneResourceDisposer` stats, `InstancedMesh`/`BatchedMesh` address maps, and 1:1 metric bounding boxes.
   - **Checks**:
     - **Strict Instancing Rule**: Zero standalone meshes created inside repetitive loops; all repeating modules bundled into `THREE.InstancedMesh` or `THREE.BatchedMesh` with bi-directional `instanceId <-> dcaAddress` lookup tables.
     - **1:1 Physical Metric Invariance**: `1.0 Three.js unit = 1.0 meter` (`citizen` stature $\approx 1.72\text{m}$, narrow 1–2 lane PNW streetscapes, wide pedestrian walkways, zero warships).
     - **Leak-Free `.dispose()` Discipline**: Every geometry, material, texture, and render target is tracked and disposed on hot-reload or rebuild.
