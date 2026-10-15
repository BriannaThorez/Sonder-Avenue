---
address: DCA.DCR.DCR-2_2_15-01.domaining
dcr_id: "DCR-2.2.15-01"
slug: "domaining"
title: "Canonical Domaining"
status: "RATIFIED"
dca_version: "2.2.43"
---

# DCR-2.2.15-01: Canonical Domaining

## Progressive Disclosure Summary (`DCR-2.2.13-01`)
Establishes root domains: citizen, lot, prop, world, and dca.

## Runtime Enforcement in Sonder Avenue
- **Address Scope**: `citizen.[id].{mind,body,daemon}.*`
- **Verification Gate**: Enforced by `src/core/dcaRuntimeGuard.ts` under the Verify-Twice Specification Rule (`DCR-2.2.33-01`).
