---
address: DCA.DCR.DCR-2_2_11-01.terminology-discipline
dcr_id: "DCR-2.2.11-01"
slug: "terminology-discipline"
title: "Terminology Discipline"
status: "RATIFIED"
dca_version: "2.2.43"
---

# DCR-2.2.11-01: Terminology Discipline

## Progressive Disclosure Summary (`DCR-2.2.13-01`)
Enforces strict use of Citizen, Mind, Body, Daemon, Heartbeat, and Tripwire.

## Runtime Enforcement in Sonder Avenue
- **Address Scope**: `citizen.[id].{mind,body,daemon}.*`
- **Verification Gate**: Enforced by `src/core/dcaRuntimeGuard.ts` under the Verify-Twice Specification Rule (`DCR-2.2.33-01`).
