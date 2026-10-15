---
address: DCA.DCR.DCR-2_2_6-01.precision-editing-gate
dcr_id: "DCR-2.2.6-01"
slug: "precision-editing-gate"
title: "Precision Editing Gate"
status: "RATIFIED"
dca_version: "2.2.43"
---

# DCR-2.2.6-01: Precision Editing Gate

## Progressive Disclosure Summary (`DCR-2.2.13-01`)
Requires surgical leaf-file VFS updates rather than monolithic state rewrites.

## Runtime Enforcement in Sonder Avenue
- **Address Scope**: `citizen.[id].{mind,body,daemon}.*`
- **Verification Gate**: Enforced by `src/core/dcaRuntimeGuard.ts` under the Verify-Twice Specification Rule (`DCR-2.2.33-01`).
