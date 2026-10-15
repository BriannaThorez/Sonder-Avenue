---
address: DCA.DCR.DCR-2_1_15-01.word-native-identifiers
dcr_id: "DCR-2.1.15-01"
slug: "word-native-identifiers"
title: "Word-Native Identifiers"
status: "RATIFIED"
dca_version: "2.2.43"
---

# DCR-2.1.15-01: Word-Native Identifiers

## Progressive Disclosure Summary (`DCR-2.2.13-01`)
Enforces human-readable kebab-case slugs over opaque UUIDs across all VFS and entity addresses.

## Runtime Enforcement in Sonder Avenue
- **Address Scope**: `citizen.[id].{mind,body,daemon}.*`
- **Verification Gate**: Enforced by `src/core/dcaRuntimeGuard.ts` under the Verify-Twice Specification Rule (`DCR-2.2.33-01`).
