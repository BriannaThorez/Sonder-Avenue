---
address: DCA.DCR.DCR-2_2_38-04.decision-ready-judgment
dcr_id: "DCR-2.2.38-04"
slug: "decision-ready-judgment"
title: "Decision-Ready Cortical Packets"
status: "RATIFIED"
dca_version: "2.2.43"
---

# DCR-2.2.38-04: Decision-Ready Cortical Packets

## Progressive Disclosure Summary (`DCR-2.2.13-01`)
Structures cortical outputs as deterministic CorticalIntentPacket payloads.

## Runtime Enforcement in Sonder Avenue
- **Address Scope**: `citizen.[id].{mind,body,daemon}.*`
- **Verification Gate**: Enforced by `src/core/dcaRuntimeGuard.ts` under the Verify-Twice Specification Rule (`DCR-2.2.33-01`).
