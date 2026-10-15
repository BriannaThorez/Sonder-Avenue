---
address: DCA.DCR.DCR-2_2_16-01.card-architecture
dcr_id: "DCR-2.2.16-01"
slug: "card-architecture"
title: "Progressive Card Architecture"
status: "RATIFIED"
dca_version: "2.2.43"
---

# DCR-2.2.16-01: Progressive Card Architecture

## Progressive Disclosure Summary (`DCR-2.2.13-01`)
Binds VFS files directly to inspectable UI cards with live frontmatter editing.

## Runtime Enforcement in Sonder Avenue
- **Address Scope**: `citizen.[id].{mind,body,daemon}.*`
- **Verification Gate**: Enforced by `src/core/dcaRuntimeGuard.ts` under the Verify-Twice Specification Rule (`DCR-2.2.33-01`).
