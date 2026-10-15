---
address: DCA.DCR.DCR-2_2_43-01.palace-analogy-demotion
dcr_id: "DCR-2.2.43-01"
slug: "palace-analogy-demotion"
title: "Palace Analogy Demotion"
status: "RATIFIED"
dca_version: "2.2.43"
---

# DCR-2.2.43-01: Palace Analogy Demotion

## Progressive Disclosure Summary (`DCR-2.2.13-01`)
Completes transition to direct dot-address VFS semantics.

## Runtime Enforcement in Sonder Avenue
- **Address Scope**: `citizen.[id].{mind,body,daemon}.*`
- **Verification Gate**: Enforced by `src/core/dcaRuntimeGuard.ts` under the Verify-Twice Specification Rule (`DCR-2.2.33-01`).
