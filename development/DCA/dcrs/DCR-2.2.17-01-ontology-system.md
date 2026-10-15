---
address: DCA.DCR.DCR-2_2_17-01.ontology-system
dcr_id: "DCR-2.2.17-01"
slug: "ontology-system"
title: "Multi-Tier Ontology System"
status: "RATIFIED"
dca_version: "2.2.43"
---

# DCR-2.2.17-01: Multi-Tier Ontology System

## Progressive Disclosure Summary (`DCR-2.2.13-01`)
Formalizes the 5-tier address grammar: Domain.Entity.Plane.Category.slug.

## Runtime Enforcement in Sonder Avenue
- **Address Scope**: `citizen.[id].{mind,body,daemon}.*`
- **Verification Gate**: Enforced by `src/core/dcaRuntimeGuard.ts` under the Verify-Twice Specification Rule (`DCR-2.2.33-01`).
