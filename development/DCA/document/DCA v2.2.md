# Distributed Cognitive Architecture (DCA v2.2) — Constitutional Specification

---
address: DCA.Document.Core.v2-2-specification
version: "2.2.43"
ratified_date: "2026-10-13"
licensee_key_hash: "8b5ce67b6e3a06d7032a2777e24dd991853db6e631ed3dcaf534ba5bc7fd6295"
---

## Section 1: Foundational Axioms & Addressing Doctrine (`DCR-2.2.40-01`)

1. **Address-as-Ontology**: Every stateful resource, cognitive trait, memory stratum, anatomical joint, and autonomic process within a DCA v2.2 system MUST be uniquely addressable via a cased, domained dot-notation identifier ending in a `kebab-case` word-native slug (`DCR-2.1.15-01`).
2. **Cache-Prefix Stability (`DCR-2.2.12-01`)**: Entity-scoped addresses begin with `citizen.[character-slug]` followed by one of the three triadic planes:
   - `.mind` — Epistemic, axiological ($\vec{\Psi} \in S^{23}$), persona, social, and stratified memory plane.
   - `.daemon` — Autonomic brainstem, 10Hz neurosymbolic reflex engine, DCA heartbeat (`DCR-2.2.39-01`), tripwires (`DCR-2.2.39-02`), and cortical packet router.
   - `.body` — Somatic 16-segment kinematic rig, bilateral joint angles ($\theta$), torque capacities ($\tau_{\max}$), PD spring stiffness ($k_p$), wardrobe tokens, and homeostatic drives.

## Section 2: Progressive Disclosure & Dual-Audience Files (`DCR-2.2.13-01`, `DCR-2.2.38-05`)

Every file in a citizen's VFS workspace MUST contain:
1. **Machine-Parseable YAML Frontmatter**: Exposes `address`, `citizen_slug`, scalar/vector weights, symbolic predicates, joint limits, and `last_heartbeat_tick` for $O(1)$ header inspection by `citizen.[id].daemon`.
2. **Human & Cortical Narrative Body**: Provides structured prose grounding for human inspection (via `DCR-2.2.16-01` DCA Cards) and higher LLM cortical synthesis.

## Section 3: Bicameral Neurosymbolic Execution (`DCR-2.1.17-01`, `DCR-2.2.0-02`)

1. **Subconscious Somatic Substrate (10Hz Reflexive Loop)**:
   - Operates continuously without LLM latency or API dependency (`DCR-2.2.38-02-counsel-anti-crutch`).
   - Evaluates environmental affordances (`lot.bremerton.*`, benches, queues, weather) using **Persona Calculus** ($\vec{\Psi}' = \hat{S}\vec{\Psi}$, Logic Gate $\mathcal{G}$, Synaptic Coupling $\Omega$, and Cultural Field Tensor $\mathcal{F}$).
   - Drives locomotion, obstacle avoidance, queue following, and 36-pose procedural kinematics across the 16-segment armature.
2. **Cortical Bus & Packet Protocol (`CorticalIntentPacket`)**:
   - Triggered on **DCA Heartbeat** pulses (`DCR-2.2.39-01`), **Salience/Stress Tripwires** (`DCR-2.2.39-02`), or direct player interaction (`whisper` / `chat`).
   - Places the citizen in **Active Somatic Masking** (displaying the overhead `• • • • •` bubble and expressive conversational gestures) while resolving a `CorticalIntentPacket` from either the deterministic neurosymbolic cortical engine or the server-side Gemini cortical bus.

## Section 4: Stratified Memory Lifecycle (`DCR-2.1.26-01`, `DCR-2.2.21-01`, `DCR-2.2.22-01`)

Memory is partitioned into four strata under `citizen.[id].mind.memory.*`:
- `sensory`: 60-second perceptual ring buffer of nearby citizens, weather, and lot affordances.
- `episodic`: Timestamped interaction and event records retrieved via **Mood-State Dependent Cosine Similarity**.
- `semantic`: Known spatial topology of Bremerton (`240 Burwell St`, Ferry Terminal, Waterfront Plaza).
- `biographical`: Consolidated long-term life epochs and identity anchors.

## Section 5: Degaming & Anti-Slop Enforcement (`DCR-2.1.19-01`, `DCR-2.1.23-01`, `DCR-2.1.25-01`)

- No arbitrary depleting game bars ("Fun: 42%"). Somatic homeostasis (`thermal-comfort`, `metabolic-energy`, `social-equilibrium`, `muscular-fatigue`) feeds directly into the **Allostatic Stress Matrix ($\hat{S}$)**, warping the 24-virtue manifold and postural stiffness $k_p$.
- No fake telemetry tickers or unwired controls (`DCR-2.2.19-01`). Every UI card reflects live VFS state and mutates the simulation when edited.
