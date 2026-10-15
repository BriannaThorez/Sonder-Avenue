---
address: DCA.DCR.DCR-2_2_22-01.memory-lifecycle
dcr_id: "DCR-2.2.22-01"
slug: "memory-lifecycle"
title: "Memory Consolidation Lifecycle"
status: "RATIFIED"
dca_version: "2.2.43"
---

# DCR-2.2.22-01: Memory Consolidation Lifecycle

## Progressive Disclosure Summary (`DCR-2.2.13-01`)
Defines salience promotion and decay across memory strata during heartbeat cycles.

## Runtime Enforcement in Sonder Avenue
- **Address Scope**: `citizen.[id].{mind,body,daemon}.*`
- **Verification Gate**: Enforced by `src/core/dcaRuntimeGuard.ts` under the Verify-Twice Specification Rule (`DCR-2.2.33-01`).
