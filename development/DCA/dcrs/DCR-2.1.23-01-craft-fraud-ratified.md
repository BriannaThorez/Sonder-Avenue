---
address: DCA.DCR.DCR-2_1_23-01.craft-fraud-ratified
dcr_id: "DCR-2.1.23-01"
slug: "craft-fraud-ratified"
title: "Craft Fraud Prohibition"
status: "RATIFIED"
dca_version: "2.2.43"
---

# DCR-2.1.23-01: Craft Fraud Prohibition

## Progressive Disclosure Summary (`DCR-2.2.13-01`)
Bans non-functional UI stubs, fake sliders, and theatrical simulation illusions.

## Runtime Enforcement in Sonder Avenue
- **Address Scope**: `citizen.[id].{mind,body,daemon}.*`
- **Verification Gate**: Enforced by `src/core/dcaRuntimeGuard.ts` under the Verify-Twice Specification Rule (`DCR-2.2.33-01`).
