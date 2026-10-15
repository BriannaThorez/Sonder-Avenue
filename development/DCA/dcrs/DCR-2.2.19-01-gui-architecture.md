---
address: DCA.DCR.DCR-2_2_19-01.gui-architecture
dcr_id: "DCR-2.2.19-01"
slug: "gui-architecture"
title: "Studio GUI Architecture"
status: "RATIFIED"
dca_version: "2.2.43"
---

# DCR-2.2.19-01: Studio GUI Architecture

## Progressive Disclosure Summary (`DCR-2.2.13-01`)
Mandates a 100% unobstructed 3D viewport center with a 3-zone top bar and collapsible bottom dock.

## Runtime Enforcement in Sonder Avenue
- **Address Scope**: `citizen.[id].{mind,body,daemon}.*`
- **Verification Gate**: Enforced by `src/core/dcaRuntimeGuard.ts` under the Verify-Twice Specification Rule (`DCR-2.2.33-01`).
