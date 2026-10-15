---
address: DCA.DCR.DCR-2_1_18-01.internavigability
dcr_id: "DCR-2.1.18-01"
slug: "internavigability"
title: "Bidirectional Internavigability"
status: "RATIFIED"
dca_version: "2.2.43"
---

# DCR-2.1.18-01: Bidirectional Internavigability

## Progressive Disclosure Summary (`DCR-2.2.13-01`)
Mandates deterministic cross-linking across all DCA documents and citizen VFS nodes.

## Runtime Enforcement in Sonder Avenue
- **Address Scope**: `citizen.[id].{mind,body,daemon}.*`
- **Verification Gate**: Enforced by `src/core/dcaRuntimeGuard.ts` under the Verify-Twice Specification Rule (`DCR-2.2.33-01`).
