# AGENTS.md — Distributed Cognitive Architecture (DCA v2.2) Agent Constitution

---
address: SYSTEM.Governance.Agents.root-constitution
dca_version: "2.2.43"
licensee_pointer: "./dca_key.md"
sources_of_truth:
  - "https://threejs.org/docs/"
  - "./development/00-distributed-cognitive-architecture.md"
  - "./development/DCA/document/DCA v2.2.md"
  - "./appmanifest/app-manifest-spec.md"
  - "./development/implementation-plans/01-sonder-avenue-plan.md"
compliance_dcr_range: "DCR-2.1.15-01 .. DCR-2.2.43-01"
---

## 1. DCA Licensee Binding & Cryptographic Pointer

All autonomous agents, `citizen.[id].daemon` runners, and cortical LLM buses operating within **Sonder Avenue** are bound by the **DCA v2.2** specification located in `development/DCA/`.

- **Canonical 3D & WebGL2 / r186 Reference**: [`https://threejs.org/docs/`](https://threejs.org/docs/) (Three.js r186 official documentation — pinned for `InstancedMesh`, `BatchedMesh`, TSL shaders, `EffectComposer`, `SkinnedMesh`, and mandatory `.dispose()` memory pipelines).
- **DCA Licensee Key Pointer**: [`./dca_key.md`](./dca_key.md) (`gitignored` local credential file containing `DCA Licensee key = 8b5ce67b6e3a06d7032a2777e24dd991853db6e631ed3dcaf534ba5bc7fd6295`).
- **Primary Development Source of Truth**: [`./development/00-distributed-cognitive-architecture.md`](./development/00-distributed-cognitive-architecture.md) and [`./development/DCA/`](./development/DCA/).
- **Application Manifest**: [`./appmanifest/app-manifest-spec.md`](./appmanifest/app-manifest-spec.md).

## 2. Core Agentic Doctrines (Mandatory Enforcement)

1. **Address-as-Ontology (`DCR-2.2.40-01-addressing-doctrine` & `DCR-2.2.15-01-domaining`)**:
   - Every citizen workspace, body joint, persona trait, and daemon stream uses word-native, cased domained dot-notation with `kebab-case` terminal slugs:
     - `citizen.[id].mind.soul.<virtue-domain>.<strength-slug>.md`
     - `citizen.[id].mind.persona.<category>.<slug>.md`
     - `citizen.[id].mind.memory.<stratum>.<slug>.md`
     - `citizen.[id].body.<region>.<segment-or-joint>.md`
     - `citizen.[id].daemon.<subsystem>.<slug>.md`
   - Agents must inspect the address tree (`vfs.listAddresses()`) before reading file bodies (`DCR-2.2.12-01-cache-prefix-stability`).
2. **Bicameral Daemon Separation (`DCR-2.1.17-01-reflexive-substrate` & `DCR-2.2.18-01-daemon-ontology-naming`)**:
   - **Cortical Layer (`.mind`)**: Emits high-level `CorticalIntentPacket` structures (`NAVIGATE_TO`, `JOIN_QUEUE`, `SIT_BENCH`, `LEAN_WALL`, `PICKUP_OBJECT`, `CONVERSE`, `IDLE_GESTURE`). Never outputs raw skeletal keyframes or bone quaternions.
   - **Subconscious Reflexive Pilot (`.daemon`)**: Evaluates **Persona Calculus** ($\vec{\Psi} \in S^{23}$, Stress Operator $\hat{S}$, Logic Gate $\mathcal{G}$, Synaptic Coupling $\Omega$, and Cultural Field Tensor $\mathcal{F}$) at 10Hz and drives the 16-segment WebGL2 armature (`citizen.[id].body.*`) at 60Hz.
3. **Degaming & Anti-Slop Integrity (`DCR-2.1.19-01`, `DCR-2.1.23-01`, `DCR-2.1.24-01`, `DCR-2.1.25-01`)**:
   - Prohibit shallow, gamified scalar bars or theatrical fake telemetry. All character actions emerge deterministically from the normalized 24-virtue hypersphere ($S^{23}$) and somatic feedback loops.
4. **Verify-Twice Specification Rule (`DCR-2.2.33-01` & `DCR-2.2.38-01`)**:
   - All Factory character manifests (`citizen.jane-do` and derived citizens) must pass anatomical proportion clamping (`[-1.0, +1.0]` $\rightarrow \pm 18\%$), hyperspherical virtue normalization ($\|\vec{\Psi}\| = 1$), and DCA slug grammar verification prior to instantiation.
