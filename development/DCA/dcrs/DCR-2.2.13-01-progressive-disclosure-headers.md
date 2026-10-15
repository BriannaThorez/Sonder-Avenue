---
address: DCA.DCR.DCR-2_2_13-01.progressive-disclosure-headers
dcr_id: "DCR-2.2.13-01"
slug: "progressive-disclosure-headers"
title: "Progressive Disclosure Headers"
status: "RATIFIED"
dca_version: "2.2.43"
---

# DCR-2.2.13-01: Progressive Disclosure Headers

## Progressive Disclosure Summary (`DCR-2.2.13-01`)
Every VFS file begins with YAML telemetry frontmatter followed by narrative markdown.

## Runtime Enforcement in Sonder Avenue
- **Address Scope**: `citizen.[id].{mind,body,daemon}.*`
- **Verification Gate**: Enforced by `src/core/dcaRuntimeGuard.ts` under the Verify-Twice Specification Rule (`DCR-2.2.33-01`).
