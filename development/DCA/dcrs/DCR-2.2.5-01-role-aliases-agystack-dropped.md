---
address: DCA.DCR.DCR-2_2_5-01.role-aliases-agystack-dropped
dcr_id: "DCR-2.2.5-01"
slug: "role-aliases-agystack-dropped"
title: "Role Alias Simplification"
status: "RATIFIED"
dca_version: "2.2.43"
---

# DCR-2.2.5-01: Role Alias Simplification

## Progressive Disclosure Summary (`DCR-2.2.13-01`)
Retires legacy stack aliases in favor of direct triadic plane addressing.

## Runtime Enforcement in Sonder Avenue
- **Address Scope**: `citizen.[id].{mind,body,daemon}.*`
- **Verification Gate**: Enforced by `src/core/dcaRuntimeGuard.ts` under the Verify-Twice Specification Rule (`DCR-2.2.33-01`).
