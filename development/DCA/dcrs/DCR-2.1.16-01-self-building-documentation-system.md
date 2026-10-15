---
address: DCA.DCR.DCR-2_1_16-01.self-building-documentation-system
dcr_id: "DCR-2.1.16-01"
slug: "self-building-documentation-system"
title: "Self-Building Documentation System"
status: "RATIFIED"
dca_version: "2.2.43"
---

# DCR-2.1.16-01: Self-Building Documentation System

## Progressive Disclosure Summary (`DCR-2.2.13-01`)
Requires workspace files to self-document via structured YAML headers and navigable indices.

## Runtime Enforcement in Sonder Avenue
- **Address Scope**: `citizen.[id].{mind,body,daemon}.*`
- **Verification Gate**: Enforced by `src/core/dcaRuntimeGuard.ts` under the Verify-Twice Specification Rule (`DCR-2.2.33-01`).
