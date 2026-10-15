---
address: DCA.DCR.DCR-2_2_33-01.verify-twice-specification-rule
dcr_id: "DCR-2.2.33-01"
slug: "verify-twice-specification-rule"
title: "Verify-Twice Specification Rule"
status: "RATIFIED"
dca_version: "2.2.43"
---

# DCR-2.2.33-01: Verify-Twice Specification Rule

## Progressive Disclosure Summary (`DCR-2.2.13-01`)
Validates biometric bounds and virtue normalization twice before spawning entities.

## Runtime Enforcement in Sonder Avenue
- **Address Scope**: `citizen.[id].{mind,body,daemon}.*`
- **Verification Gate**: Enforced by `src/core/dcaRuntimeGuard.ts` under the Verify-Twice Specification Rule (`DCR-2.2.33-01`).
