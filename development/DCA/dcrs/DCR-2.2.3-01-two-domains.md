---
address: DCA.DCR.DCR-2_2_3-01.two-domains
dcr_id: "DCR-2.2.3-01"
slug: "two-domains"
title: "Two-Domain Separation"
status: "RATIFIED"
dca_version: "2.2.43"
---

# DCR-2.2.3-01: Two-Domain Separation

## Progressive Disclosure Summary (`DCR-2.2.13-01`)
Separates System Governance (DCA/AGENTS) from World Simulation (citizen/lot/prop).

## Runtime Enforcement in Sonder Avenue
- **Address Scope**: `citizen.[id].{mind,body,daemon}.*`
- **Verification Gate**: Enforced by `src/core/dcaRuntimeGuard.ts` under the Verify-Twice Specification Rule (`DCR-2.2.33-01`).
