---
address: DCA.DCR.DCR-2_2_12-01.cache-prefix-stability
dcr_id: "DCR-2.2.12-01"
slug: "cache-prefix-stability"
title: "Cache-Prefix Stability"
status: "RATIFIED"
dca_version: "2.2.43"
---

# DCR-2.2.12-01: Cache-Prefix Stability

## Progressive Disclosure Summary (`DCR-2.2.13-01`)
Orders dot-addresses from invariant entity root (citizen.[id]) to mutable leaf slug.

## Runtime Enforcement in Sonder Avenue
- **Address Scope**: `citizen.[id].{mind,body,daemon}.*`
- **Verification Gate**: Enforced by `src/core/dcaRuntimeGuard.ts` under the Verify-Twice Specification Rule (`DCR-2.2.33-01`).
