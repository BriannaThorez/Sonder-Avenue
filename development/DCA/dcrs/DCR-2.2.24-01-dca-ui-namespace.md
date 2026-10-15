---
address: DCA.DCR.DCR-2_2_24-01.dca-ui-namespace
dcr_id: "DCR-2.2.24-01"
slug: "dca-ui-namespace"
title: "DCA UI Namespace"
status: "RATIFIED"
dca_version: "2.2.43"
---

# DCR-2.2.24-01: DCA UI Namespace

## Progressive Disclosure Summary (`DCR-2.2.13-01`)
Maps UI inspector views cleanly onto citizen.[id].{mind,body,daemon} planes.

## Runtime Enforcement in Sonder Avenue
- **Address Scope**: `citizen.[id].{mind,body,daemon}.*`
- **Verification Gate**: Enforced by `src/core/dcaRuntimeGuard.ts` under the Verify-Twice Specification Rule (`DCR-2.2.33-01`).
