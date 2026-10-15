---
address: DCA.DCR.DCR-2_1_24-01.generative-malpractice-primary
dcr_id: "DCR-2.1.24-01"
slug: "generative-malpractice-primary"
title: "Generative Malpractice Prevention"
status: "RATIFIED"
dca_version: "2.2.43"
---

# DCR-2.1.24-01: Generative Malpractice Prevention

## Progressive Disclosure Summary (`DCR-2.2.13-01`)
Prevents unconstrained LLM hallucination from corrupting physical joint constraints or virtue conservation.

## Runtime Enforcement in Sonder Avenue
- **Address Scope**: `citizen.[id].{mind,body,daemon}.*`
- **Verification Gate**: Enforced by `src/core/dcaRuntimeGuard.ts` under the Verify-Twice Specification Rule (`DCR-2.2.33-01`).
