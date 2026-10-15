# Harmonized Character Psychology: Soul, Memory, and Vector Architecture

---
address: SYSTEM.Architecture.Psychology.harmonized-character-vfs
dca_version: "2.2.43"
ratified_dcr: "DCR-2.2.40-01-addressing-doctrine"
licensee_pointer: "../../dca_key.md"
status: "RATIFIED_CANONICAL"
created_date: "2026-10-14"
---

## 1. Overview & Architectural Unification

This document specifies the unified, agent-first pointer architecture that harmonizes:
1. **The 24 Character Strengths & Virtues (VIA Classification)**: Represented as a continuous unit hypersphere vector $\vec{\Psi} \in S^{23}$ (`vector://embeddings/[id]/virtues_24`).
2. **`soul.md` (Progressive Disclosure L0 $\rightarrow$ L4)**: A structured psychological dossier that acts as a symbolic state-machine and defense mechanism registry.
3. **`memory.md`**: A stratified episodic, semantic, sensory, and biographical memory ledger with emotional valence indexing.
4. **`citizen.[id].daemon`**: The 10Hz reflexive substrate that queries symbolic pointers during emotional triggers, evaluates the Stress Operator $\hat{S}$, and drives 60Hz kinematics.

---

## 2. Address-as-Ontology Grammar (Cased Dot Notation with Slugs)

In compliance with `DCR-2.1.15-01` and `DCR-2.2.40-01`, addresses serve as database keys, file paths, and self-documenting semantic summaries:

```text
citizen.[citizenId].[systemSubDomain].[TaxonomicCategory].[semantic-kebab-slug]
```

- **Root & Entity ID (`camelCase` / `kebab-case`)**: `citizen.[id]`
- **System Sub-Domains (`camelCase`)**: `.mind`, `.body`, `.daemon`, `.psyche`, `.affect`, `.cognition`, `.linguistics`
- **Taxonomic Categories (`PascalCase`)**: `.IdentityAnchor`, `.TraitMatrix`, `.DefenseMechanisms`, `.AttachmentStyle`, `.CognitiveDistortion`, `.Prosody`, `.Trigger`
- **Semantic Slugs (`kebab-case`)**: `.detached-hedonic-observer`, `.intellectualization-via-irony`, `.tactile-purity-absolutism`

---

## 3. Progressive Disclosure Levels in `soul.md`

Every citizen workspace exposes a durable `soul.md` structured into five distinct operational depths:

### [L0] Core Identity & Ontological Anchor
- **Address**: `citizen.[id].mind.soul.L0.IdentityAnchor.[slug]`
- **Clinical Baseline**: Subclinical personality traits (e.g. OCPD traits, Narcissistic shielding, Schizotypal eccentricity).
- **Homeostatic Drive**: Core emotional imperative (e.g., preservation of autonomy, avoidance of effort/humiliation, status validation).

### [L1] Psychometric Matrix & 24-Virtue Hypersphere
- **Address**: `citizen.[id].mind.soul.L1.TraitMatrix.[slug]`
- **Vector Pointer**: `vector://embeddings/[id]/virtues_24`
- **Five-Factor OCEAN Baseline**:
  - Openness (0–100)
  - Conscientiousness (0–100)
  - Extraversion (0–100)
  - Agreeableness (0–100)
  - Neuroticism (0–100)
- **VIA 24 Character Strengths**: Normalized to $\|\vec{\Psi}\| = 1.0$, dynamically modulated by the Stress Operator eigenvalues $\Lambda$.

### [L2] Cognitive Schemas & Defense Mechanisms
- **Address**: `citizen.[id].mind.soul.L2.DefenseMechanisms.[slug]`
- **Primary Defenses**: e.g. `intellectualization-via-irony`, `externalization-and-mythomania`, `reaction-formation-and-displacement`.
- **Attachment Schema**: `citizen.[id].mind.soul.L2.AttachmentStyle.[slug]` (Dismissive-Avoidant, Fearful-Avoidant, Anxious-Ambivalent).
- **Distortions / Filters**: `citizen.[id].mind.soul.L2.CognitiveDistortion.[slug]`.

### [L3] Interpersonal & Linguistic Signatures
- **Pragmatic Register**: `citizen.[id].mind.soul.L3.Linguistics.[slug]` (e.g. `hyper-analytical-mock-gravity`, `litigious-pleading`).
- **Prosodic Contour**: `citizen.[id].mind.soul.L3.Prosody.[slug]` (vocal cadence, pitch shifts, staccato inflections).
- **Kinesics & Posture**: `citizen.[id].mind.soul.L3.Kinesics.[slug]` (facial micro-expressions, postural tonus coupling).

### [L4] Episodic Behavioral Triggers (State Machine)
- **Address**: `citizen.[id].mind.soul.L4.Trigger.[slug]`
- **Formal Grammar**:
  - `Condition`: Specific environmental or interpersonal stimulus (e.g., `Invasion_Of_Purity`, `Status_Threat`, `Boundary_Breach`).
  - `Execution Path`: Step-by-step psychological reaction:
    1. Suppress baseline affective filter
    2. Activate specific defense mechanism
    3. Dispatch `CorticalIntentPacket` with corresponding motor action and posture synergy
    4. Append event to `memory.md` with calculated emotional valence.

---

## 4. Machine-Readable Frontmatter Specification

```yaml
---
entity_id: citizen.jane-do
version: "2.2.0"
schema_type: agent.soul.architecture
pointers:
  vector_virtues: "vector://embeddings/jane-do/virtues_24"
  memory_fs: "fs://workspace/jane-do/memory.md"
  active_daemon: "citizen.jane-do.daemon"
current_state:
  active_trigger: null
  affective_valence: 0.72
  defensive_posture: "detached-observational-curiosity"
---
```

---

## 5. Bidirectional Memory & Daemon Integration

1. When a stimulus occurs, the daemon measures cosine similarity against active memory embeddings and checks active L4 triggers in `soul.md`.
2. When an L4 trigger fires, the daemon mutates the 24-virtue stress eigenvalues via the Stress Operator $\hat{S}$, emits a `CorticalIntentPacket`, and logs the interaction in `memory.md`.
3. This creates a closed neurosymbolic feedback loop between continuous vector math and symbolic behavioral rules.
