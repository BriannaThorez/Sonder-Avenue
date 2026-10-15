---
address: DCA.DCR.DCR-2_2_7-01.retrieval-analogy-seeding-cache
dcr_id: "DCR-2.2.7-01"
slug: "retrieval-analogy-seeding-cache"
title: "Mood-State Retrieval & Cache Seeding"
status: "RATIFIED"
dca_version: "2.2.43"
---

# DCR-2.2.7-01: Mood-State Retrieval & Cache Seeding

## Progressive Disclosure Summary (`DCR-2.2.13-01`)
Retrieves episodic memories via emotional-valence cosine similarity with the active state vector.

## Runtime Enforcement in Sonder Avenue
- **Address Scope**: `citizen.[id].{mind,body,daemon}.*`
- **Verification Gate**: Enforced by `src/core/dcaRuntimeGuard.ts` under the Verify-Twice Specification Rule (`DCR-2.2.33-01`).
