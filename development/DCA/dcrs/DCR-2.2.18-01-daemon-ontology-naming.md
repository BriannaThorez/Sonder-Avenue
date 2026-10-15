---
address: DCA.DCR.DCR-2_2_18-01.daemon-ontology-naming
dcr_id: "DCR-2.2.18-01"
slug: "daemon-ontology-naming"
title: "Daemon Ontology Naming"
status: "RATIFIED"
dca_version: "2.2.43"
---

# DCR-2.2.18-01: Daemon Ontology Naming

## Progressive Disclosure Summary (`DCR-2.2.13-01`)
Standardizes citizen.[id].daemon as the autonomic neurosymbolic process namespace.

## Runtime Enforcement in Sonder Avenue
- **Address Scope**: `citizen.[id].{mind,body,daemon}.*`
- **Verification Gate**: Enforced by `src/core/dcaRuntimeGuard.ts` under the Verify-Twice Specification Rule (`DCR-2.2.33-01`).
