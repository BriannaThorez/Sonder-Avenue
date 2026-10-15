---
address: DCA.DCR.DCR-2_2_38-05.dual-audience
dcr_id: "DCR-2.2.38-05"
slug: "dual-audience"
title: "Dual-Audience File Structure"
status: "RATIFIED"
dca_version: "2.2.43"
---

# DCR-2.2.38-05: Dual-Audience File Structure

## Progressive Disclosure Summary (`DCR-2.2.13-01`)
Serves 10Hz symbolic parsers via frontmatter and LLMs/humans via markdown prose.

## Runtime Enforcement in Sonder Avenue
- **Address Scope**: `citizen.[id].{mind,body,daemon}.*`
- **Verification Gate**: Enforced by `src/core/dcaRuntimeGuard.ts` under the Verify-Twice Specification Rule (`DCR-2.2.33-01`).
