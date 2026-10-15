---
address: DCA.DCR.DCR-2_2_40-01.addressing-doctrine
dcr_id: "DCR-2.2.40-01"
slug: "addressing-doctrine"
title: "Canonical Addressing Doctrine"
status: "RATIFIED"
dca_version: "2.2.43"
---

# DCR-2.2.40-01: Canonical Addressing Doctrine

## Progressive Disclosure Summary (`DCR-2.2.13-01`)
Ratifies citizen.[id].{mind,body,daemon}.* as the universal entity bus.

## Runtime Enforcement in Sonder Avenue
- **Address Scope**: `citizen.[id].{mind,body,daemon}.*`
- **Verification Gate**: Enforced by `src/core/dcaRuntimeGuard.ts` under the Verify-Twice Specification Rule (`DCR-2.2.33-01`).
