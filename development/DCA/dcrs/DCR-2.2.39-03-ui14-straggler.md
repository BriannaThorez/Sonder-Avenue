---
address: DCA.DCR.DCR-2_2_39-03.ui14-straggler
dcr_id: "DCR-2.2.39-03"
slug: "ui14-straggler"
title: "UI Namespace Harmonization"
status: "RATIFIED"
dca_version: "2.2.43"
---

# DCR-2.2.39-03: UI Namespace Harmonization

## Progressive Disclosure Summary (`DCR-2.2.13-01`)
Eliminates legacy un-domained UI state keys.

## Runtime Enforcement in Sonder Avenue
- **Address Scope**: `citizen.[id].{mind,body,daemon}.*`
- **Verification Gate**: Enforced by `src/core/dcaRuntimeGuard.ts` under the Verify-Twice Specification Rule (`DCR-2.2.33-01`).
