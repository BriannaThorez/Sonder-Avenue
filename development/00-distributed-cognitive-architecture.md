# 00 — Distributed Cognitive Architecture (DCA v2.2) Development Source of Truth

---
address: DEVELOPMENT.Architecture.dca-master-binding
dca_version: "2.2.43"
licensee_key_ref: "../dca_key.md"
extracted_archive_root: "./DCA/"
---

## 1. Architectural Mandate

This document binds the **Sonder Avenue** runtime to the **DCA v2.2** specification extracted in [`./DCA/`](./DCA/). Every module in `/src/` must satisfy structural parity ($E_{\text{code}} \setminus E_{\text{manifest}} \equiv \emptyset$) with:

1. **The DCA v2.2 Core Specification**: [`./DCA/document/DCA v2.2.md`](./DCA/document/DCA%20v2.2.md)
2. **The 48 Ratified Decision Change Records (DCRs)**: [`./DCA/dcrs/`](./DCA/dcrs/)
3. **The Persona Calculus Mathematical Specification**: [`./DCA/Persona-Calculus.md`](./DCA/Persona-Calculus.md)
4. **The Cognition Terminology Expedition**: [`./DCA/expedition-cognition-terminology/`](./DCA/expedition-cognition-terminology/)
5. **The Declarative Semantic Pipeline (LLM Native Spatial Comprehension & Procedural 3D Printing)**: [`./DCA/declarative-spatial-semantic-pipeline.md`](./DCA/declarative-spatial-semantic-pipeline.md)

## 2. Mind-to-Body Packet Contract (`CorticalIntentPacket`)

In compliance with `DCR-2.1.17-01-reflexive-substrate` and `DCR-2.2.0-02-neurosymbolic-integration`, higher cognition (`.mind`) and somatic execution (`.daemon` $\rightarrow$ `.body`) are decoupled across a strict packet boundary:

- **Cortical Layer**: Receives summarized salience context (`DCR-2.2.13-01`), active tripwires (`DCR-2.2.39-02`), and resonant memories. Outputs a `CorticalIntentPacket` specifying *what* to do and *why* (e.g., `NAVIGATE_TO("lot.bremerton.burwell-240")`, `SIT_BENCH("prop.bench.burwell-01")`), never low-level joint rotations.
- **Reflexive Somatic Layer**: Consumes `CorticalIntentPacket`, applies the **Stress Operator** ($\hat{S}$) and **Cognitive Logic Gate** ($\mathcal{G}$), computes A* / waypoint navigation and queue positioning, and drives the 16-segment armature's joint angles ($\theta$) and spring stiffness ($k_p$).
