---
name: deepseek-flash-orchestration
description: Progressive disclosure compliant agent skill for orchestrating DeepSeek-Flash (4.1) subagents in compliance with the Distributed Cognitive Architecture (DCA v2.2).
version: 1.0.0
author: Sonder Avenue System Governance
compliance:
  dca_version: "2.2.43"
  dcr_range: "DCR-2.1.15-01 .. DCR-2.2.43-01"
  spec_format: "agentskills.io v1.0 + Progressive Disclosure + Purpose"
licensee_pointer: "./dca_key.md"
---

# DeepSeek-Flash Subagent Orchestration Skill (`SYSTEM.Governance.Skills.deepseek-flash-orchestration`)

## 1. Purpose & Teleological Mandate
This skill governs the delegation, verification, and harmonization of high-throughput subagents driven by DeepSeek-Flash (4.1) or equivalent lightweight LLM endpoints.
The purpose is to provide:
1. **Contractual DCA v2.2 Enforcement**: Ensure every generated code snippet, character trait, spatial structure, and narrative memory adheres strictly to domained cased dot-notation addresses (`citizen.[id].{mind,body,daemon}.*`) and 24-virtue hyperspherical calculus ($\vec{\Psi} \in S^{23}$).
2. **Deterministic Task Partitioning**: Offload heavy procedural computation, parallel dialogue synthesis, and spatial asset layout to subagents while isolating the core simulation loop from hallucinations or blocking stalls.
3. **Progressive Disclosure**: Enable orchestrator agents to interact with subagents at three distinct depths—from zero-overhead atomic directives (Level 1) to full multi-agent consensus verification (Level 3).

---

## 2. Progressive Disclosure Hierarchy

### Level 1: Rapid Atomic Dispatch (Zero-Overhead Interface)
For quick, single-pass procedural generation tasks (e.g. generating character memory strings, building facade descriptions, or initial virtue vectors).

```typescript
interface AtomicSubagentRequest {
  taskId: string;
  domain: 'mind' | 'body' | 'world' | 'narrative';
  prompt: string;
  contextAddress: string; // e.g. "citizen.jane-do.mind.memory.stratum-episodic"
}

interface AtomicSubagentResponse {
  taskId: string;
  address: string;
  payload: string | Record<string, unknown>;
  dcaCompliant: boolean;
}
```

**Dispatch Directives**:
- Pass pure plain-text instructions.
- Constrain subagent output to JSON or strict Markdown without conversational chatter.
- Enforce strict 1.0-second execution deadline.

---

### Level 2: Structured Context Packet Protocol (Contractual Binding)
For tasks requiring deep domain knowledge and contractual verification (e.g. generating procedural 1:1 city blocks, IK joint offsets, or emotional state transitions).

#### Request Envelope:
```json
{
  "header": {
    "protocol": "DCA/2.2-Subagent-Mesh",
    "orchestratorAddress": "SYSTEM.Orchestrator.root",
    "targetAgent": "deepseek-flash-4.1",
    "timestampIso": "2026-10-14T10:30:00Z"
  },
  "constraints": {
    "namingConvention": "cased-dot-notation-with-kebab-slugs",
    "anatomicalClampRange": [-1.0, 1.0],
    "virtueVectorNorm": 1.0,
    "maxPayloadTokens": 2048
  },
  "context": {
    "citizenId": "citizen.jane-do",
    "currentAction": "NAVIGATE_TO",
    "targetAddress": "world.bremerton.burwell-street.harborside-cafe"
  },
  "task": {
    "type": "PROCEDURAL_FACADE_AND_MOTIVE_SYNTHESIS",
    "parameters": {
      "architecturalStyle": "pacific-northwest-brick-glass",
      "footprintScale": "1:1-meters",
      "ambientTempF": 57
    }
  }
}
```

#### Verification Gates:
1. **Address Grammar Check**: Subagents must prefix all entities with valid DCA domains (`SYSTEM.*`, `APPMANIFEST.*`, `citizen.[id].*`, `world.*`).
2. **Anatomical & Kinetic Clamping**: Any spatial or joint adjustments must fall within $[\theta_{min}, \theta_{max}]$ bounds defined in `src/core/sonderRegistry.ts`.
3. **Verify-Twice Rule**: If the response modifies citizen soul or persona traits, it must be validated against `verifyTwiceFactoryManifest()` before commit.

---

### Level 3: Distributed Multi-Agent Consensus & Swarm Mesh
For complex city block construction, multi-character social queues, and peer compute leasing.

#### Multi-Agent Arbitration Pipeline:
1. **Architect Subagent**: Proposes geometric footprints, road centerlines, and building volumes.
2. **Narrator Subagent**: Proposes cultural field tensors ($\mathcal{F}$) and resident agendas.
3. **Audit Subagent**: Verifies zero overlapping meshes, proper sidewalk clearances (minimum 2.5m for Burwell Street), and DCA address integrity.
4. **Orchestrator Commit**: Blends the consensus state into the local VFS (`citizenVfs.ts`) and notifies peers via WebRTC data channel.

---

## 3. Subagent Prompt Constitution (Injected into All DeepSeek Workers)

When spawning or invoking a DeepSeek-Flash subagent, prepend the following contractual preamble:

```text
[DCA_SUBAGENT_CONSTITUTION_START]
You are an autonomous subagent operating within the Sonder Avenue Distributed Cognitive Architecture (DCA v2.2.43).
Licensee Vault Pointer: ./dca_key.md
Authority: AGENTS.md

MANDATORY RULES:
1. All identifiers and entity paths MUST use cased dot-notation with lower-kebab-case terminal slugs (e.g., citizen.jane-do.mind.soul.wisdom.prudence.md).
2. Never output gamified bars or theatrical telemetry. All characters derive states from the 24-virtue hypersphere S^23 and bicameral daemon loops.
3. Joint adjustments must use torsional spring stiffness kp and damping cd, respecting gentle gravity resting states.
4. Output structured JSON or Markdown codeblocks only. No conversational fluff or apologies.
[DCA_SUBAGENT_CONSTITUTION_END]
```

---

## 4. Reusable TypeScript Orchestrator Module Reference

Applications invoke the orchestration skill via `src/core/deepseekOrchestrator.ts`:
```typescript
import { dispatchSubagentTask } from '../core/deepseekOrchestrator';

const result = await dispatchSubagentTask({
  taskName: 'generate-bremerton-block',
  address: 'world.bremerton.burwell-street.block-100',
  payload: { scale: 1.0, buildingsCount: 4 }
});
```
