---
address: DCA.DCR.DCR-2_2_30-01.navigability-formatting-pass
dcr_id: "DCR-2.2.30-01"
slug: "navigability-formatting-pass"
title: "Navigability Formatting Pass"
status: "RATIFIED"
dca_version: "2.2.43"
---

# DCR-2.2.30-01: Navigability Formatting Pass

## Progressive Disclosure Summary (`DCR-2.2.13-01`)
Ensures all markdown artifacts render cleanly in both raw text and studio cards.

## Runtime Enforcement in Sonder Avenue
- **Address Scope**: `citizen.[id].{mind,body,daemon}.*`
- **Verification Gate**: Enforced by `src/core/dcaRuntimeGuard.ts` under the Verify-Twice Specification Rule (`DCR-2.2.33-01`).
