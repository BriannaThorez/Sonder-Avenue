---
address: DCA.DCR.DCR-2_2_21-01.stratified-memory
dcr_id: "DCR-2.2.21-01"
slug: "stratified-memory"
title: "Stratified Memory Architecture"
status: "RATIFIED"
dca_version: "2.2.43"
---

# DCR-2.2.21-01: Stratified Memory Architecture

## Progressive Disclosure Summary (`DCR-2.2.13-01`)
Partitions citizen memory into sensory, episodic, semantic, and biographical strata.

## Runtime Enforcement in Sonder Avenue
- **Address Scope**: `citizen.[id].{mind,body,daemon}.*`
- **Verification Gate**: Enforced by `src/core/dcaRuntimeGuard.ts` under the Verify-Twice Specification Rule (`DCR-2.2.33-01`).
