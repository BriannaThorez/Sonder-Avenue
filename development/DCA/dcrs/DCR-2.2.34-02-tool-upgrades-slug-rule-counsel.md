---
address: DCA.DCR.DCR-2_2_34-02.tool-upgrades-slug-rule-counsel
dcr_id: "DCR-2.2.34-02"
slug: "tool-upgrades-slug-rule-counsel"
title: "Terminal Kebab-Slug Enforcement"
status: "RATIFIED"
dca_version: "2.2.43"
---

# DCR-2.2.34-02: Terminal Kebab-Slug Enforcement

## Progressive Disclosure Summary (`DCR-2.2.13-01`)
Validates that all leaf identifiers strictly conform to lower-kebab-case.

## Runtime Enforcement in Sonder Avenue
- **Address Scope**: `citizen.[id].{mind,body,daemon}.*`
- **Verification Gate**: Enforced by `src/core/dcaRuntimeGuard.ts` under the Verify-Twice Specification Rule (`DCR-2.2.33-01`).
