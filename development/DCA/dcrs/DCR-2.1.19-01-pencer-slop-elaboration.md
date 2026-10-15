---
address: DCA.DCR.DCR-2_1_19-01.pencer-slop-elaboration
dcr_id: "DCR-2.1.19-01"
slug: "pencer-slop-elaboration"
title: "Pincer Anti-Slop Elaboration"
status: "RATIFIED"
dca_version: "2.2.43"
---

# DCR-2.1.19-01: Pincer Anti-Slop Elaboration

## Progressive Disclosure Summary (`DCR-2.2.13-01`)
Prohibits decorative filler, fake telemetry, and ungrounded prose in agent outputs and UI.

## Runtime Enforcement in Sonder Avenue
- **Address Scope**: `citizen.[id].{mind,body,daemon}.*`
- **Verification Gate**: Enforced by `src/core/dcaRuntimeGuard.ts` under the Verify-Twice Specification Rule (`DCR-2.2.33-01`).
