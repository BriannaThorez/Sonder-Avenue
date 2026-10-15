---
address: DCA.DCR.DCR-2_2_9-01.ade-integration-appendix
dcr_id: "DCR-2.2.9-01"
slug: "ade-integration-appendix"
title: "ADE Integration Appendix"
status: "RATIFIED"
dca_version: "2.2.43"
---

# DCR-2.2.9-01: ADE Integration Appendix

## Progressive Disclosure Summary (`DCR-2.2.13-01`)
Defines browser and studio inspection hooks for live daemon telemetry.

## Runtime Enforcement in Sonder Avenue
- **Address Scope**: `citizen.[id].{mind,body,daemon}.*`
- **Verification Gate**: Enforced by `src/core/dcaRuntimeGuard.ts` under the Verify-Twice Specification Rule (`DCR-2.2.33-01`).
