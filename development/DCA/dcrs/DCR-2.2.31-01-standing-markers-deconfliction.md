---
address: DCA.DCR.DCR-2_2_31-01.standing-markers-deconfliction
dcr_id: "DCR-2.2.31-01"
slug: "standing-markers-deconfliction"
title: "Standing Markers Deconfliction"
status: "RATIFIED"
dca_version: "2.2.43"
---

# DCR-2.2.31-01: Standing Markers Deconfliction

## Progressive Disclosure Summary (`DCR-2.2.13-01`)
Prevents split-brain daemon mutations via single-holder compute leases.

## Runtime Enforcement in Sonder Avenue
- **Address Scope**: `citizen.[id].{mind,body,daemon}.*`
- **Verification Gate**: Enforced by `src/core/dcaRuntimeGuard.ts` under the Verify-Twice Specification Rule (`DCR-2.2.33-01`).
