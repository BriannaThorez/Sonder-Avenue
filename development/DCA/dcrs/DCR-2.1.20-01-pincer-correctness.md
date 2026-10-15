---
address: DCA.DCR.DCR-2_1_20-01.pincer-correctness
dcr_id: "DCR-2.1.20-01"
slug: "pincer-correctness"
title: "Pincer Formal Correctness"
status: "RATIFIED"
dca_version: "2.2.43"
---

# DCR-2.1.20-01: Pincer Formal Correctness

## Progressive Disclosure Summary (`DCR-2.2.13-01`)
Enforces simultaneous top-down axiomatic intent and bottom-up deterministic verification.

## Runtime Enforcement in Sonder Avenue
- **Address Scope**: `citizen.[id].{mind,body,daemon}.*`
- **Verification Gate**: Enforced by `src/core/dcaRuntimeGuard.ts` under the Verify-Twice Specification Rule (`DCR-2.2.33-01`).
