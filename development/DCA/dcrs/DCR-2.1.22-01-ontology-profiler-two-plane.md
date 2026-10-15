---
address: DCA.DCR.DCR-2_1_22-01.ontology-profiler-two-plane
dcr_id: "DCR-2.1.22-01"
slug: "ontology-profiler-two-plane"
title: "Two-Plane Ontology Profiler"
status: "RATIFIED"
dca_version: "2.2.43"
---

# DCR-2.1.22-01: Two-Plane Ontology Profiler

## Progressive Disclosure Summary (`DCR-2.2.13-01`)
Separates the 60Hz Hot Somatic TypedArray plane from the Warm Markdown VFS persistence plane.

## Runtime Enforcement in Sonder Avenue
- **Address Scope**: `citizen.[id].{mind,body,daemon}.*`
- **Verification Gate**: Enforced by `src/core/dcaRuntimeGuard.ts` under the Verify-Twice Specification Rule (`DCR-2.2.33-01`).
