---
address: DCA.DCR.DCR-2_1_26-01.agent-managed-memory
dcr_id: "DCR-2.1.26-01"
slug: "agent-managed-memory"
title: "Agent-Managed Memory"
status: "RATIFIED"
dca_version: "2.2.43"
---

# DCR-2.1.26-01: Agent-Managed Memory

## Progressive Disclosure Summary (`DCR-2.2.13-01`)
Empowers each citizen daemon to autonomously curate, consolidate, and prune its own memory stratum.

## Runtime Enforcement in Sonder Avenue
- **Address Scope**: `citizen.[id].{mind,body,daemon}.*`
- **Verification Gate**: Enforced by `src/core/dcaRuntimeGuard.ts` under the Verify-Twice Specification Rule (`DCR-2.2.33-01`).
