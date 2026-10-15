---
address: DCA.DCR.DCR-2_2_25-01.decision-hygiene
dcr_id: "DCR-2.2.25-01"
slug: "decision-hygiene"
title: "Decision Hygiene"
status: "RATIFIED"
dca_version: "2.2.43"
---

# DCR-2.2.25-01: Decision Hygiene

## Progressive Disclosure Summary (`DCR-2.2.13-01`)
Logs every cortical intent packet and tripwire activation with causal provenance.

## Runtime Enforcement in Sonder Avenue
- **Address Scope**: `citizen.[id].{mind,body,daemon}.*`
- **Verification Gate**: Enforced by `src/core/dcaRuntimeGuard.ts` under the Verify-Twice Specification Rule (`DCR-2.2.33-01`).
