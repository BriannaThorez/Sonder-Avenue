---
address: DCA.Skill.Thinktank.neurosymbolic-embodied-citizen.layer-3-sandboxed-vfs-and-embodied-economy
layer: 3
parent_skill: "DCA.Skill.Thinktank.neurosymbolic-embodied-citizen"
dca_version: "2.2.43"
---

# Layer 3 Reference: Sandboxed Citizen Working Directory & Embodied Pocket/Backpack RPG Economy

## 1. Per-Citizen Sandboxed Working Directory (`/citizens/<slug>/`)

Each citizen instance is strictly isolated in its own virtual filesystem working directory (`/citizens/<slug>/`). An LLM or external tool operating on `citizen.<slug>` only has read/write scope within `/citizens/<slug>/`:

```text
/citizens/<slug>/
 ├── soul.md          (Alias: citizen.<slug>.mind.soul.manifest.md — 24 VIA virtues on S^23)
 ├── persona.md       (Alias: citizen.<slug>.mind.persona.identity.md — Jungian gate G, biography, willpower)
 ├── memory.md        (Alias: citizen.<slug>.mind.memory.stream.md — Episodic, semantic, & procedural logs)
 ├── inventory.md     (Alias: citizen.<slug>.body.equipment.inventory.md — Pockets, backpack/satchel, held items)
 ├── ledger.md        (Alias: citizen.<slug>.mind.ledger.finances.md — Wallet USD, Bank USD, ORCA transit card, receipts)
 └── body-reflex.md   (Alias: citizen.<slug>.daemon.reflexive.state.md — 10Hz allostatic & motor telemetry)
```

## 2. Embodied Physical Container Inventory Architecture

Instead of an immersion-breaking "video game bag of holding", every citizen's inventory is physically partitioned by **wearable containers**:

1. **`left-coat-pocket` & `right-coat-pocket`**: Max `0.6 L` volume, `0.5 kg` mass each (holds keys, smartphone, wallet, brass compass, espresso token, pocket notebook).
2. **`trouser-pocket`**: Max `0.4 L` volume, `0.4 kg` mass (holds ORCA transit card, loose change, harbor keycard).
3. **`backpack-or-satchel`** (e.g., *Waxed Canvas Maritime Satchel*, *Topological Field Rucksack*, *Acoustic Blueprint Tube*): Max `14.0 L` volume, `8.0 kg` mass (holds laptops, hydrographic charts, thermos, books, groceries, rain shell).
4. **`primary-hand`**: Max `2.5 L` volume, `3.0 kg` mass (holds active carried prop: `Warm Ceramic Espresso Cup`, `Cedar Sketchbook`, `Acoustic Caliper`).

## 3. Grounded Personal Currency & Everyday Transactions (`ledger.md`)

Every citizen maintains a realistic personal financial ledger:
- **`walletCashUsd`**: Physical bills & coins in pocket wallet (e.g., `$38.50`).
- **`checkingBalanceUsd`**: Kitsap Maritime Credit Union debit balance (e.g., `$1,420.00`).
- **`orcaTransitBalanceUsd`**: Puget Sound regional ferry & bus smartcard balance (e.g., `$24.75`).
- **`hourlyStipendUsd`**: Occupational income earned during work/study cycles.
- **`recentTransactions`**: Timestamped double-entry log of purchases (e.g., `-$4.75 at Sinclair Sound Roasters (Single-Origin Cortado)`, `-$2.75 at WSF Ferry Terminal (Foot Passenger Fare)`, `+$42.00 Occupational Stipend`).
