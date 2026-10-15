# Declarative Semantic Pipeline: LLM Native Spatial Comprehension & Procedural 3D Printing

---
address: SYSTEM.Architecture.Spatiality.declarative-semantic-pipeline
dca_version: "2.2.43"
ratified_dcr: "DCR-2.2.40-01-addressing-doctrine"
licensee_pointer: "../../dca_key.md"
status: "ARCHITECTURAL_TREATISE_CANONICAL"
created_date: "2026-10-14"
---

## 1. Executive Summary & Core Philosophy: Translator and Builder Architecture

To construct high-fidelity spatial worlds without manual hand-coding or hallucinated floating-point vertex math, the architecture separates responsibilities into two distinct cognitive layers:

1. **The Translator (The Large Language Model)**:
   - Takes high-level conceptual descriptions, situational drama, sitcom scripts, or urban agendas and translates them into a highly structured, text-based declarative blueprint using domained cased dot-notation with lower-kebab slugs.
   - Operates in discrete structural space (grids, topologies, relational hierarchies, state machines).
2. **The Builder (WebGL2 Canvas / Three.js / React Three Fiber / Drei)**:
   - Reads the parsed semantic blueprint and physically "prints" the 3D scene.
   - Executes procedural extrusion, boolean CSG cuts, material assignment, Inverse Kinematics (IK), and animation crossfading deterministically.

Because LLMs excel at processing structural hierarchies, semantic relationships, and serialized grammars, this **Declarative Semantic Pipeline** completely avoids raw 3D mesh math and aligns directly with the core cognitive strengths of modern language models.

---

## 2. Core Spatial Concepts Natively Understood by LLMs

While LLMs struggle to calculate raw 3D vertex positions and floating-point geometry (e.g., placing an object at `[1.3421, 0.5218, -4.8912]`), they possess exceptional fluency with specific spatial logic structures:

### 2.1 Semantic Graph Topology (Relational Space)
- The model understands space *relationally* rather than numerically.
- It understands that:
  - An "interior room" is bounded by "exterior walls".
  - A "kitchen counter" must be placed adjacent to a "kitchen wall".
  - A "chair" or "bench" has a sitting surface that faces an "open plaza" or "table".
- The 3D environment is structured as a nested parent-child tree:
  `world.bremerton.burwell-street.harborside-cafe.terrace.table-01.chair-north`

### 2.2 Serialized Grammar Enforcements (Context-Free Grammars)
- LLMs are native pattern-matching machines.
- By enforcing a rigid schema or Context-Free Grammar (CFG) via system prompts and type contracts, the LLM outputs exact domain-cased dot notations without syntax drift or structural errors.

### 2.3 Discrete Coordinate Grids (Integer Spatial Allocation)
- LLMs fail at floating-point trigonometry, but possess near-perfect reasoning on **Discrete Integer Spatial Allocation**.
- By locking the 3D world to a localized uniform grid matrix (e.g., a digital chessboard where each unit cell represents exactly $0.5\text{m}$ or $1.0\text{m}$), the AI navigates, places structures, and routes paths using whole numbers:
  `structure.wall.grid-origin: [12, -4]; grid-span: [6, 0]`

---

## 3. The Three Structural Layers of the 3D Printer

```
┌────────────────────────────────────────────────────────────────────────┐
│                   DECLARATIVE SEMANTIC PIPELINE                        │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   [ LLM Output: cased dot-notation blueprint stream ]                  │
│                                │                                       │
│                                ▼                                       │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │ Layer A: The Lexical Parser (The Interpreter)                │     │
│   │ Ingests text tokens -> Validates DCA syntax -> AST Scene Tree│     │
│   └────────────────────────────┬─────────────────────────────────┘     │
│                                │                                       │
│                                ▼                                       │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │ Layer B: Declarative Reconciliation Engine (The Router)      │     │
│   │ Maps AST slugs to procedural components in central registry  │     │
│   └────────────────────────────┬─────────────────────────────────┘     │
│                                │                                       │
│                                ▼                                       │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │ Layer C: Parametric Extrusion & CSG Boolean Engine           │     │
│   │ - 2D line extrusion -> 3D volume                            │     │
│   │ - Boolean subtraction cuts doors/windows dynamically         │     │
│   │ - IK solver locks feet & hands to surfaces                   │     │
│   └──────────────────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────────────────┘
```

### Layer A: The Lexical Parser (The Interpreter)
The LLM outputs text strings wrapped in cased dot-notation with slugs (e.g., `structure.wall.exterior.brick`). The application uses a Lexer and Parser to ingest this raw text stream, breaking it down into an abstract data structure called a **Scene Tree**—a structural layout list that React and Three.js can natively traverse and reconcile.

### Layer B: The Declarative Reconciliation Engine (The Router)
The 3D scene is driven by declarative programming. A master data registry (`sonderRegistry.ts`) maps the AI's text slugs directly to predefined 3D generation behaviors. When the parser encounters a slug like `structure.wall`, it routes that instruction to a dedicated procedural mesh component, converting text into a physical WebGL object automatically.

### Layer C: Constructive Solid Geometry (CSG) & Parametric Extrusion (The Extruder)
Instead of asking the AI to compute every vertex and face of a wall:
- **Linear Extrusion**: The AI specifies start and end grid coordinates. The engine draws a 2D line between those points and extrudes it upward into a volumetric 3D wall.
- **Constructive Solid Geometry (CSG)**: When the AI places an entry slug (such as a door or window) onto that wall, the engine performs **Boolean Subtraction**. It punches a physical hole through the wall mesh in real time based on intersecting bounding boxes, ensuring zero visual clipping or manual stitching.

---

## 4. Procedural Character Rigging and Animation Blending

For dynamic life simulator scenarios where characters react autonomously to environmental influences, the system never passes raw skeletal tracking data or quaternions through an LLM. Instead, it utilizes **Behavioral State Machine Mapping**:

1. **Inverse Kinematics (IK)**:
   Base character models are pre-rigged with 16-segment skeletal armatures. When an AI slug dictates an action (e.g., `SIT_BENCH` at `world.bremerton.harborside.park-bench-east`), the IK engine automatically resolves hip and foot placement so the character's feet lock realistically to the pavement ($y = 0.0$) and hips align with the bench surface.
2. **Animation Clip & Postural Blending**:
   The engine maintains a library of pre-authored kinematic loops. The AI's slugs act as **State Triggers**. When the AI shifts character emotional valence or posture (e.g., shifting from `persona.idle` to `persona.anxious` or `posture.slump-exhausted`), an animation mixer smoothly crossfades active clips, adjusting posture, walk velocity, and gestural frequency based on the active behavioral data.

---

## 5. Technical Terminology Matrix

| Pipeline Phase | Technical Method / Terminology | System Role |
| :--- | :--- | :--- |
| **Data Generation** | Context-Free Grammar Serialization | Dictates the rigid layout format the LLM must output using domain slugs. |
| **State Management** | Unidirectional Data Flow (via Atomic State) | Takes the parsed scene tree and pipes it cleanly into the WebGL application state. |
| **Mesh Creation** | Procedural Parametric Extrusion | Automatically converts 2D path vectors into textured 3D wall volumes. |
| **Spatial Clipping** | Runtime Boolean CSG Subtraction | Dynamically cuts door and window openings out of solid wall geometry. |
| **Character Control** | Inverse Kinematics & Animation Crossfading | Resolves skeletal alignment and blends behavioral movements based on mood triggers. |

---

## 6. Architectural Boundary Classification

For Sonder Avenue development, boundaries operate under a **Hybrid Staged Diorama** architecture:
- **Primary Stage**: 1:1 Scale Bremerton Waterfront Diorama (Burwell Street, Harborside Fountain Park, Ferry Slip 1).
- **Secondary Sets**: Modular, discrete interior set pieces (e.g., *Sinclair Cafe Interior*, *Ferry Passenger Concourse*, *240 Burwell Apartment Unit*) loaded as discrete room matrices that the LLM references via localized grid coordinates.
