---
address: DCA.DCR.DCR-2_2_4-01.three-roles-tenancy-parity
dcr_id: "DCR-2.2.4-01"
slug: "three-roles-tenancy-parity"
title: "Three-Role Tenancy Parity"
status: "RATIFIED"
dca_version: "2.2.43"
---

# DCR-2.2.4-01: Three-Role Tenancy Parity

## Progressive Disclosure Summary (`DCR-2.2.13-01`)
Harmonizes Showrunner/Player, Cortical Mind, and Somatic Daemon access to the entity bus.

## Runtime Enforcement in Sonder Avenue
- **Address Scope**: `citizen.[id].{mind,body,daemon}.*`
- **Verification Gate**: Enforced by `src/core/dcaRuntimeGuard.ts` under the Verify-Twice Specification Rule (`DCR-2.2.33-01`).
