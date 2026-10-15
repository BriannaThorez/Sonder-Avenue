---
address: DCA.DCR.DCR-2_2_28-01.dca-conformant
dcr_id: "DCR-2.2.28-01"
slug: "dca-conformant"
title: "Runtime DCA Conformance"
status: "RATIFIED"
dca_version: "2.2.43"
---

# DCR-2.2.28-01: Runtime DCA Conformance

## Progressive Disclosure Summary (`DCR-2.2.13-01`)
Exposes live contractual compliance auditing inside the application.

## Runtime Enforcement in Sonder Avenue
- **Address Scope**: `citizen.[id].{mind,body,daemon}.*`
- **Verification Gate**: Enforced by `src/core/dcaRuntimeGuard.ts` under the Verify-Twice Specification Rule (`DCR-2.2.33-01`).
