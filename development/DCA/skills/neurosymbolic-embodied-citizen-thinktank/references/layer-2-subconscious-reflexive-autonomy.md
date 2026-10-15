---
address: DCA.Skill.Thinktank.neurosymbolic-embodied-citizen.layer-2-subconscious-reflexive-autonomy
layer: 2
parent_skill: "DCA.Skill.Thinktank.neurosymbolic-embodied-citizen"
dca_version: "2.2.43"
---

# Layer 2 Reference: Subconscious Self-Preserving & Reflexive Autonomy (Surpassing *The Sims 4*)

## 1. Why Traditional Life Simulators (*The Sims 4*) Fail vs. Neurosymbolic Allostasis

Traditional life sims rely on linear commodity timers ("Hunger bar drops -> walk to fridge") that produce robotic, repetitive, personality-blind loops. Our Thinktank architecture replaces shallow timers with a **3-Tier Subconscious Neurosymbolic Reflex Stack** executing at `10Hz` (`0ms` LLM dependency):

### Tier A: Somatic Self-Preservation & Environmental Reflexes (Priority 0 — Immediate)
- **Thermal & Precipitation Shelter Reflex**: If ambient temperature drops or rain begins and the citizen lacks weatherproof outerwear in `inventory.md`, the subconscious daemon elevates indoor thermal utility (`zoning.commercial.roastery.espresso-bar` or residential apartment interiors).
- **Kinematic Anti-Collision & Personal Space Buffer**: 4-pass capsule vs. `Box3`/cylinder repulsion + `0.72m` interpersonal proxemic field + doorway portal passability.
- **Biomechanical Load Compensation**: Total carried mass $M_{\text{carried}} = \sum m_i$ (in `kg`) from pockets/backpack dynamically adjusts spinal flexion (`waistPitch += 0.018 * M_carried`) and metabolic energy expenditure.

### Tier B: Allostatic Interoception & Virtue-Coupled Utility Tensor (Priority 1 — Autonomous Life Loop)
Every candidate world affordance or multi-floor room $a \in \mathcal{A}$ is scored deterministically at 10Hz without requiring an LLM:
$$U(a \mid c) = \underbrace{\langle \vec{\Psi}_c, \vec{V}_a \rangle}_{\text{Virtue Resonance on } S^{23}} + \underbrace{\sum_{d \in \text{Drives}} w_d(1 - D_{c,d}) \cdot \Delta R_{a,d}}_{\text{Allostatic Restoration}} + \underbrace{\Phi_{\text{econ}}(a, \text{ledger}, \text{inventory})}_{\text{Economic & Inventory Feasibility}} - \underbrace{\lambda_{\text{dist}} \|\mathbf{x}_c - \mathbf{x}_a\|}_{\text{Proxemic Cost}}$$

- **Inventory-Aware Consumption**: Before navigating across town for calories or caffeine, the subconscious daemon checks `/citizens/<slug>/inventory.md`. If the citizen already carries an `Artisan Brioche Pastry` or `Thermos of Single-Origin Espresso` in their coat pocket or backpack, they consume it reflexively on a nearby park bench!
- **Autonomous Economic Earner & Merchant Loop**:
  - When at their occupational locus or archive study, citizens accrue professional stipends into `ledger.md`.
  - When visiting `world.bremerton.block-02.plot-sinclair-cafe` (`zoning.commercial.roastery.espresso-bar`), if `ledger.walletCashUsd >= 4.75` or `ledger.bankBalanceUsd >= 4.75`, the daemon autonomously executes a micro-transaction, logs the receipt in `ledger.md`, places a physical item in their hand/pocket (`inventory.md`), and restores thermal/metabolic equilibrium.

### Tier C: Effortless Optional Cortical LLM Navigation Bridge (Priority 2 — Deliberative Override)
When an LLM agent is attached to `/citizens/<slug>/`, it reads the compact `soul.md`, `memory.md`, `inventory.md`, and `ledger.md` summaries and emits a single declarative `CorticalIntentPacket`:
- `NAVIGATE_TO` / `VISIT_FLOOR` (automatically routed through street thresholds and `spatial.network.pedestrian.vertical.stairwell` waypoints)
- `USE_INVENTORY_ITEM` / `PURCHASE_GOODS` / `EARN_STIPEND`
- `CONVERSE` / `SIT_BENCH` / `JOIN_QUEUE`
