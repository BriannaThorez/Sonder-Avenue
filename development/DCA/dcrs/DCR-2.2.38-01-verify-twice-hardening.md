---
address: DCA.DCR.DCR-2_2_38-01.verify-twice-hardening
dcr_id: "DCR-2.2.38-01"
slug: "verify-twice-hardening"
title: "Verify-Twice Biometric Hardening"
status: "RATIFIED"
dca_version: "2.2.43"
---

# DCR-2.2.38-01: Verify-Twice Biometric Hardening

## Progressive Disclosure Summary (`DCR-2.2.13-01`)
Clamps normalized body proportion deltas [-1.0, +1.0] to safe ±18% anatomical ratios.

## Runtime Enforcement in Sonder Avenue
- **Address Scope**: `citizen.[id].{mind,body,daemon}.*`
- **Verification Gate**: Enforced by `src/core/dcaRuntimeGuard.ts` under the Verify-Twice Specification Rule (`DCR-2.2.33-01`).
