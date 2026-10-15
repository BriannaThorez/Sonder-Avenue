---
address: DCA.DCR.DCR-2_2_8-01.audit-repair-bundle
dcr_id: "DCR-2.2.8-01"
slug: "audit-repair-bundle"
title: "v2.2.8 Audit Repair Bundle"
status: "RATIFIED"
dca_version: "2.2.43"
---

# DCR-2.2.8-01: v2.2.8 Audit Repair Bundle

## Progressive Disclosure Summary (`DCR-2.2.13-01`)
Verifies bijective mapping between DCR identifiers and runtime validators.

## Runtime Enforcement in Sonder Avenue
- **Address Scope**: `citizen.[id].{mind,body,daemon}.*`
- **Verification Gate**: Enforced by `src/core/dcaRuntimeGuard.ts` under the Verify-Twice Specification Rule (`DCR-2.2.33-01`).
