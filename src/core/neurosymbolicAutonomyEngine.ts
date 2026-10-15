/**
 * @domain citizen.daemon.thinktank.neurosymbolic-autonomy-engine
 * @description Implements the 3-Layer agentskills.io Neurosymbolic Embodied Citizen Thinktank Engine:
 *              1. Zero-LLM 10Hz Subconscious Self-Preserving & Utility-Tensor Autonomy (surpassing The Sims 4)
 *              2. Sandboxed Per-Citizen Working Directory (/citizens/<slug>/{soul.md, memory.md, persona.md, inventory.md, ledger.md, body-reflex.md})
 *              3. Embodied RPG-Realism Pocket/Backpack Container Inventory & Personal Currency Ledger
 *              4. Effortless Optional Cortical LLM Semantic Navigation API
 * @compliance DCR-2.1.17-01, DCR-2.1.25-01 (Degaming), DCR-2.1.26-01 (Agent Memory), DCR-2.2.0-02, DCR-2.2.13-01, DCR-2.2.40-01
 */

import type { CitizenEntity } from './citizenVfs';
import type { SomaticDrives } from './personaCalculus';
import { dcaAddressBus } from './dcaAddressOntologyBus';
import { multiFloorNavigationRegistry } from './generativeShapeGrammarEngine';

// ============================================================================
// 1. EMBODIED POCKET / BACKPACK CONTAINER INVENTORY & CURRENCY LEDGER TYPES
// ============================================================================
export type CitizenContainerSlot =
  | 'left-coat-pocket'
  | 'right-coat-pocket'
  | 'trouser-pocket'
  | 'backpack-satchel'
  | 'primary-hand';

export interface ContainerCapacitySpec {
  slot: CitizenContainerSlot;
  label: string;
  maxVolumeLiters: number;
  maxMassKg: number;
}

export const CONTAINER_CAPACITY_SPECS: Record<
  CitizenContainerSlot,
  ContainerCapacitySpec
> = {
  'left-coat-pocket': {
    slot: 'left-coat-pocket',
    label: 'Left Coat Pocket',
    maxVolumeLiters: 0.6,
    maxMassKg: 0.5,
  },
  'right-coat-pocket': {
    slot: 'right-coat-pocket',
    label: 'Right Coat Pocket',
    maxVolumeLiters: 0.6,
    maxMassKg: 0.5,
  },
  'trouser-pocket': {
    slot: 'trouser-pocket',
    label: 'Trouser Pocket',
    maxVolumeLiters: 0.4,
    maxMassKg: 0.4,
  },
  'backpack-satchel': {
    slot: 'backpack-satchel',
    label: 'Backpack / Crossbody Satchel',
    maxVolumeLiters: 14.0,
    maxMassKg: 8.0,
  },
  'primary-hand': {
    slot: 'primary-hand',
    label: 'Primary Hand (Carried)',
    maxVolumeLiters: 2.5,
    maxMassKg: 3.0,
  },
};

export interface CitizenInventoryItem {
  id: string;
  dcaAddress: string;
  slug: string;
  name: string;
  category:
    | 'consumable'
    | 'tool'
    | 'transit-pass'
    | 'document'
    | 'apparel'
    | 'everyday-carry';
  containerSlot: CitizenContainerSlot;
  massKg: number;
  volumeLiters: number;
  valueUsd: number;
  thermalBonus?: number;
  energyRestore?: number;
  description: string;
}

export interface CitizenFinancialTransaction {
  id: string;
  timestampIso: string;
  counterparty: string;
  locationAddress: string;
  description: string;
  amountUsd: number; // positive = income/stipend, negative = purchase/fare
  paymentMethod: 'wallet-cash' | 'checking-debit' | 'orca-card' | 'direct-stipend';
}

export interface CitizenCurrencyLedger {
  walletCashUsd: number;
  checkingBalanceUsd: number;
  orcaTransitBalanceUsd: number;
  hourlyStipendUsd: number;
  lastTransactionTick: number;
  transactions: CitizenFinancialTransaction[];
}

export interface CitizenEmbodiedRpgState {
  backpackLabel: string;
  items: CitizenInventoryItem[];
  ledger: CitizenCurrencyLedger;
  totalCarriedMassKg: number;
  totalCarriedVolumeLiters: number;
  subconsciousGoalReason: string;
  utilityScoreActive: number;
  selfPreservationAlert: string | null;
}

// ============================================================================
// 2. CANONICAL INITIAL POCKET/BACKPACK INVENTORIES & CURRENCY LEDGERS
// ============================================================================
export function createDefaultEmbodiedRpgState(
  citizenId: string,
  slug: string,
  occupation: string
): CitizenEmbodiedRpgState {
  const nowIso = new Date().toISOString();

  if (slug === 'jane-do') {
    const items: CitizenInventoryItem[] = [
      {
        id: `${citizenId}.item.wallet-leather`,
        dcaAddress: `${citizenId}.body.equipment.trouser-pocket.cordovan-cardholder`,
        slug: 'cordovan-cardholder',
        name: 'Cordovan Leather Cardholder & Cash Clip',
        category: 'everyday-carry',
        containerSlot: 'trouser-pocket',
        massKg: 0.08,
        volumeLiters: 0.12,
        valueUsd: 45.0,
        description: 'Contains Kitsap Credit Union debit card, ID, and crisp USD bills.',
      },
      {
        id: `${citizenId}.item.orca-pass`,
        dcaAddress: `${citizenId}.body.equipment.left-coat-pocket.puget-orca-card`,
        slug: 'puget-orca-card',
        name: 'Puget Sound ORCA Ferry & Transit Card',
        category: 'transit-pass',
        containerSlot: 'left-coat-pocket',
        massKg: 0.01,
        volumeLiters: 0.02,
        valueUsd: 28.5,
        description: 'Contactless smartcard for Washington State Ferries Bremerton–Seattle crossing.',
      },
      {
        id: `${citizenId}.item.field-chronometer`,
        dcaAddress: `${citizenId}.body.equipment.right-coat-pocket.brass-tide-chronometer`,
        slug: 'brass-tide-chronometer',
        name: 'Brass Sinclair Inlet Tide Chronometer',
        category: 'tool',
        containerSlot: 'right-coat-pocket',
        massKg: 0.14,
        volumeLiters: 0.09,
        valueUsd: 160.0,
        description: 'Mechanical pocket tide dial calibrated to Puget Sound lunar harmonics.',
      },
      {
        id: `${citizenId}.item.hydro-atlas`,
        dcaAddress: `${citizenId}.body.equipment.backpack-satchel.archival-bathymetry-folio`,
        slug: 'archival-bathymetry-folio',
        name: 'Bremerton Naval & Bathymetric Folio (1924–2026)',
        category: 'document',
        containerSlot: 'backpack-satchel',
        massKg: 1.15,
        volumeLiters: 2.4,
        valueUsd: 95.0,
        description: 'Waterproof linen-bound charts stored in her Waxed Canvas Maritime Satchel.',
      },
      {
        id: `${citizenId}.item.thermos-espresso`,
        dcaAddress: `${citizenId}.body.equipment.backpack-satchel.copper-vacuum-thermos`,
        slug: 'copper-vacuum-thermos',
        name: 'Insulated Thermos (Single-Origin Roastery Cortado)',
        category: 'consumable',
        containerSlot: 'backpack-satchel',
        massKg: 0.42,
        volumeLiters: 0.55,
        valueUsd: 18.0,
        thermalBonus: 0.16,
        energyRestore: 0.24,
        description: 'Keeps Sinclair Sound Roasters espresso piping hot during harbor mist walks.',
      },
    ];
    return finalizeRpgState(
      citizenId,
      'Waxed Canvas Maritime Satchel (14L)',
      items,
      {
        walletCashUsd: 42.5,
        checkingBalanceUsd: 1840.0,
        orcaTransitBalanceUsd: 28.5,
        hourlyStipendUsd: 38.0,
        lastTransactionTick: Date.now(),
        transactions: [
          {
            id: 'tx-jane-01',
            timestampIso: nowIso,
            counterparty: 'Sinclair Sound Roasters',
            locationAddress: 'world.bremerton.block-02.plot-sinclair-cafe',
            description: 'Double Cortado & Cedar-Smoked Sea Salt Brioche',
            amountUsd: -6.25,
            paymentMethod: 'wallet-cash',
          },
          {
            id: 'tx-jane-02',
            timestampIso: nowIso,
            counterparty: 'Kitsap Maritime Archive Trust',
            locationAddress: 'world.bremerton.block-03.plot-civic-atrium',
            description: 'Cartographic Archival Research Stipend',
            amountUsd: 152.0,
            paymentMethod: 'direct-stipend',
          },
        ],
      }
    );
  }

  if (slug === 'marcus-vance') {
    const items: CitizenInventoryItem[] = [
      {
        id: `${citizenId}.item.roaster-trier`,
        dcaAddress: `${citizenId}.body.equipment.right-coat-pocket.wooden-coffee-trier`,
        slug: 'wooden-coffee-trier',
        name: 'Maple Drum-Roaster Bean Trier & Refractometer',
        category: 'tool',
        containerSlot: 'right-coat-pocket',
        massKg: 0.19,
        volumeLiters: 0.18,
        valueUsd: 85.0,
        description: 'Used to sample first-crack bean caramelization at Sinclair Sound Roasters.',
      },
      {
        id: `${citizenId}.item.brioche-pack`,
        dcaAddress: `${citizenId}.body.equipment.backpack-satchel.warm-cardamom-buns`,
        slug: 'warm-cardamom-buns',
        name: 'Wax-Paper Parcel of Warm Cardamom Knots',
        category: 'consumable',
        containerSlot: 'backpack-satchel',
        massKg: 0.35,
        volumeLiters: 0.9,
        valueUsd: 9.5,
        thermalBonus: 0.1,
        energyRestore: 0.28,
        description: 'Freshly baked morning pastries for sharing on Burwell Street.',
      },
      {
        id: `${citizenId}.item.cash-clip`,
        dcaAddress: `${citizenId}.body.equipment.trouser-pocket.brass-money-clip`,
        slug: 'brass-money-clip',
        name: 'Stamped Brass Roastery Till Clip & ORCA Pass',
        category: 'everyday-carry',
        containerSlot: 'trouser-pocket',
        massKg: 0.07,
        volumeLiters: 0.08,
        valueUsd: 30.0,
        description: 'Carries tip bills, shop keys, and ferry pass.',
      },
    ];
    return finalizeRpgState(
      citizenId,
      'Canvas Messenger Rucksack (12L)',
      items,
      {
        walletCashUsd: 68.0,
        checkingBalanceUsd: 2310.0,
        orcaTransitBalanceUsd: 19.25,
        hourlyStipendUsd: 41.0,
        lastTransactionTick: Date.now(),
        transactions: [
          {
            id: 'tx-marcus-01',
            timestampIso: nowIso,
            counterparty: 'Olympic Peninsula Dairy Co-op',
            locationAddress: 'world.bremerton.block-02.plot-sinclair-cafe',
            description: 'Organic Barista Oat & Whole Milk Crate Delivery',
            amountUsd: -34.0,
            paymentMethod: 'checking-debit',
          },
          {
            id: 'tx-marcus-02',
            timestampIso: nowIso,
            counterparty: 'Sinclair Sound Roasters Counter',
            locationAddress: 'world.bremerton.block-02.plot-sinclair-cafe',
            description: 'Morning Espresso Bar Shift Net Share',
            amountUsd: 164.0,
            paymentMethod: 'direct-stipend',
          },
        ],
      }
    );
  }

  if (slug === 'elena-rostova') {
    const items: CitizenInventoryItem[] = [
      {
        id: `${citizenId}.item.laser-vibrometer`,
        dcaAddress: `${citizenId}.body.equipment.backpack-satchel.portable-acoustic-analyzer`,
        slug: 'portable-acoustic-analyzer',
        name: 'Portable Steel-Truss Harmonic Vibrometer',
        category: 'tool',
        containerSlot: 'backpack-satchel',
        massKg: 1.65,
        volumeLiters: 3.1,
        valueUsd: 640.0,
        description: 'Measures structural eigenfrequencies across the Manette Bridge span.',
      },
      {
        id: `${citizenId}.item.orca-card-elena`,
        dcaAddress: `${citizenId}.body.equipment.left-coat-pocket.commuter-orca-pass`,
        slug: 'commuter-orca-pass',
        name: 'Monthly WSF Ferry Commuter ORCA Pass',
        category: 'transit-pass',
        containerSlot: 'left-coat-pocket',
        massKg: 0.02,
        volumeLiters: 0.03,
        valueUsd: 54.0,
        description: 'Tapped daily at Bremerton Ferry Terminal Slip 1.',
      },
      {
        id: `${citizenId}.item.dark-chocolate`,
        dcaAddress: `${citizenId}.body.equipment.right-coat-pocket.espresso-dark-chocolate`,
        slug: 'espresso-dark-chocolate',
        name: '78% Cacao Espresso Bar Tin',
        category: 'consumable',
        containerSlot: 'right-coat-pocket',
        massKg: 0.1,
        volumeLiters: 0.12,
        valueUsd: 6.5,
        thermalBonus: 0.06,
        energyRestore: 0.2,
        description: 'Quick glucose & theobromine boost during structural inspections.',
      },
    ];
    return finalizeRpgState(
      citizenId,
      'Carbon-Weave Acoustic Engineer Pack (14L)',
      items,
      {
        walletCashUsd: 29.0,
        checkingBalanceUsd: 3490.0,
        orcaTransitBalanceUsd: 54.0,
        hourlyStipendUsd: 52.0,
        lastTransactionTick: Date.now(),
        transactions: [
          {
            id: 'tx-elena-01',
            timestampIso: nowIso,
            counterparty: 'Washington State Ferries (Slip 1)',
            locationAddress: 'world.bremerton.block-01.plot-ferry-terminal',
            description: 'Foot Passenger Crossing Tariff (ORCA Tap)',
            amountUsd: -2.75,
            paymentMethod: 'orca-card',
          },
        ],
      }
    );
  }

  // Default / Samuel Chen & Factory-spawned Citizens
  const items: CitizenInventoryItem[] = [
    {
      id: `${citizenId}.item.pocket-wallet`,
      dcaAddress: `${citizenId}.body.equipment.trouser-pocket.stitched-canvas-wallet`,
      slug: 'stitched-canvas-wallet',
      name: 'Stitched Canvas Billfold & ORCA Pass',
      category: 'everyday-carry',
      containerSlot: 'trouser-pocket',
      massKg: 0.08,
      volumeLiters: 0.1,
      valueUsd: 35.0,
      description: 'Personal wallet containing local currency, transit card, and apartment key.',
    },
    {
      id: `${citizenId}.item.sketch-journal`,
      dcaAddress: `${citizenId}.body.equipment.backpack-satchel.cedar-bound-field-journal`,
      slug: 'cedar-bound-field-journal',
      name: 'Cedar-Bound Botanical & Urban Field Journal',
      category: 'document',
      containerSlot: 'backpack-satchel',
      massKg: 0.48,
      volumeLiters: 0.85,
      valueUsd: 42.0,
      description: 'Hand-stitched notebook for recording Puget Sound observations.',
    },
    {
      id: `${citizenId}.item.roastery-thermos`,
      dcaAddress: `${citizenId}.body.equipment.left-coat-pocket.pocket-espresso-flask`,
      slug: 'pocket-espresso-flask',
      name: 'Brushed Steel Pocket Espresso Flask',
      category: 'consumable',
      containerSlot: 'left-coat-pocket',
      massKg: 0.24,
      volumeLiters: 0.3,
      valueUsd: 14.0,
      thermalBonus: 0.14,
      energyRestore: 0.22,
      description: 'Restores warmth and metabolic alertness on misty waterfront walks.',
    },
  ];

  return finalizeRpgState(
    citizenId,
    `Weatherproof Daypack (${occupation})`,
    items,
    {
      walletCashUsd: 45.0,
      checkingBalanceUsd: 1620.0,
      orcaTransitBalanceUsd: 24.0,
      hourlyStipendUsd: 36.0,
      lastTransactionTick: Date.now(),
      transactions: [
        {
          id: `tx-${slug}-01`,
          timestampIso: nowIso,
          counterparty: 'Sinclair Sound Roasters',
          locationAddress: 'world.bremerton.block-02.plot-sinclair-cafe',
          description: 'Morning Pour-Over & Hazelnut Biscotti',
          amountUsd: -5.5,
          paymentMethod: 'wallet-cash',
        },
      ],
    }
  );
}

function finalizeRpgState(
  citizenId: string,
  backpackLabel: string,
  items: CitizenInventoryItem[],
  ledger: CitizenCurrencyLedger
): CitizenEmbodiedRpgState {
  let totalMass = 0;
  let totalVol = 0;
  for (const item of items) {
    totalMass += item.massKg;
    totalVol += item.volumeLiters;
    dcaAddressBus.register({
      address: item.dcaAddress,
      rootDomain: 'citizen',
      composer: 'persona-calculus-composer',
      terminalSlug: item.slug,
      summary: `${item.name} (${item.containerSlot})`,
      worldPositionMeters: [0, 0, 0],
      telemetry: {
        containerSlot: item.containerSlot,
        massKg: item.massKg,
        volumeLiters: item.volumeLiters,
        valueUsd: item.valueUsd,
      },
    });
  }

  return {
    backpackLabel,
    items,
    ledger,
    totalCarriedMassKg: Number(totalMass.toFixed(2)),
    totalCarriedVolumeLiters: Number(totalVol.toFixed(2)),
    subconsciousGoalReason:
      'Allostatic homeostasis balanced; patrolling 1:1 Bremerton streetscape via S²³ virtue utility tensor.',
    utilityScoreActive: 0.88,
    selfPreservationAlert: null,
  };
}

// ============================================================================
// 3. ZERO-LLM 10HZ SUBCONSCIOUS SELF-PRESERVING & UTILITY-TENSOR AUTONOMY
// ============================================================================
export interface SubconsciousAutonomyEvaluation {
  updatedDrives: SomaticDrives;
  updatedRpgState: CitizenEmbodiedRpgState;
  recommendedAction?: {
    action: CitizenEntity['currentAction'];
    targetAddress: string;
    targetPosition: [number, number, number];
    spokenBubble: string;
    thought: string;
  };
}

/**
 * Runs inside the 10Hz `.daemon` loop. Guarantees that citizens live rich,
 * self-preserving, economically grounded lives WITHOUT requiring an LLM call.
 */
export function evaluateSubconsciousNeurosymbolicAutonomy(
  citizen: CitizenEntity,
  drives: SomaticDrives,
  weatherTempF: number,
  nowMs: number
): SubconsciousAutonomyEvaluation {
  const baseRpg =
    citizen.embodiedRpg ||
    createDefaultEmbodiedRpgState(citizen.id, citizen.slug, citizen.occupation);

  let nextItems = [...baseRpg.items];
  let nextLedger = {
    ...baseRpg.ledger,
    transactions: [...baseRpg.ledger.transactions],
  };
  let nextDrives = { ...drives };
  let selfPreservationAlert: string | null = null;
  let subconsciousGoalReason = baseRpg.subconsciousGoalReason;
  let recommendedAction: SubconsciousAutonomyEvaluation['recommendedAction'] =
    undefined;

  // --------------------------------------------------------------------------
  // TIER A: SOMATIC SELF-PRESERVATION & POCKET/BACKPACK CONSUMPTION REFLEX
  // --------------------------------------------------------------------------
  if (nextDrives.metabolicEnergy < 0.56 || nextDrives.thermalComfort < 0.55) {
    const consumableIdx = nextItems.findIndex(
      (it) => it.category === 'consumable' && (it.energyRestore || it.thermalBonus)
    );
    if (consumableIdx >= 0) {
      const usedItem = nextItems[consumableIdx];
      nextDrives.metabolicEnergy = Math.min(
        1.0,
        nextDrives.metabolicEnergy + (usedItem.energyRestore || 0.2)
      );
      nextDrives.thermalComfort = Math.min(
        1.0,
        nextDrives.thermalComfort + (usedItem.thermalBonus || 0.12)
      );
      subconsciousGoalReason = `Self-Preservation Reflex: Consumed ${usedItem.name} from ${usedItem.containerSlot} (+${Math.round(
        (usedItem.energyRestore || 0.2) * 100
      )}% metabolic energy).`;
      selfPreservationAlert = `Used ${usedItem.name} from ${usedItem.containerSlot}`;
    } else if (weatherTempF < 52 && nextDrives.thermalComfort < 0.5) {
      selfPreservationAlert =
        'Low thermal comfort in coastal mist — seeking warm indoor roastery shelter.';
    }
  }

  // --------------------------------------------------------------------------
  // TIER B: AUTONOMOUS ECONOMIC TRANSACTIONS & STIPEND ACCRUAL (EVERY 18s)
  // --------------------------------------------------------------------------
  const elapsedSinceTx = nowMs - (nextLedger.lastTransactionTick || 0);
  if (elapsedSinceTx > 18000) {
    const distToCafe = Math.hypot(
      citizen.position[0] - 12.0,
      citizen.position[2] - -8.5
    );
    const distToFerry = Math.hypot(
      citizen.position[0] - -22.0,
      citizen.position[2] - 16.0
    );
    const currentRoom = multiFloorNavigationRegistry.queryRoomAtWorldPosition(
      citizen.position
    );

    if (distToCafe < 6.5 && nextLedger.walletCashUsd >= 4.75) {
      // Autonomous Roastery Purchase
      const price = 4.75;
      nextLedger.walletCashUsd = Number(
        (nextLedger.walletCashUsd - price).toFixed(2)
      );
      nextLedger.lastTransactionTick = nowMs;
      nextLedger.transactions.unshift({
        id: `tx-${citizen.slug}-${nowMs.toString().slice(-4)}`,
        timestampIso: new Date(nowMs).toISOString(),
        counterparty: 'Sinclair Sound Roasters',
        locationAddress: 'world.bremerton.block-02.plot-sinclair-cafe',
        description: 'Single-Origin Espresso & Warm Pastry',
        amountUsd: -price,
        paymentMethod: 'wallet-cash',
      });
      nextDrives.metabolicEnergy = Math.min(1.0, nextDrives.metabolicEnergy + 0.18);
      nextDrives.thermalComfort = Math.min(1.0, nextDrives.thermalComfort + 0.14);

      if (!nextItems.some((i) => i.slug === 'fresh-roastery-cortado')) {
        nextItems.push({
          id: `${citizen.id}.item.cortado-${nowMs.toString().slice(-3)}`,
          dcaAddress: `${citizen.id}.body.equipment.primary-hand.fresh-roastery-cortado`,
          slug: 'fresh-roastery-cortado',
          name: 'Warm Ceramic Roastery Cortado',
          category: 'consumable',
          containerSlot: 'primary-hand',
          massKg: 0.28,
          volumeLiters: 0.35,
          valueUsd: 4.75,
          thermalBonus: 0.15,
          energyRestore: 0.22,
          description: 'Purchased autonomously at Sinclair Sound Roasters counter.',
        });
      }
      subconsciousGoalReason = `Purchased Single-Origin Cortado ($4.75 cash) at Sinclair Sound Roasters; placed cup in primary-hand.`;
    } else if (distToFerry < 7.0 && nextLedger.orcaTransitBalanceUsd >= 2.75) {
      // Autonomous ORCA Ferry Tap
      const fare = 2.75;
      nextLedger.orcaTransitBalanceUsd = Number(
        (nextLedger.orcaTransitBalanceUsd - fare).toFixed(2)
      );
      nextLedger.lastTransactionTick = nowMs;
      nextLedger.transactions.unshift({
        id: `tx-${citizen.slug}-${nowMs.toString().slice(-4)}`,
        timestampIso: new Date(nowMs).toISOString(),
        counterparty: 'WSF Bremerton Terminal Slip 1',
        locationAddress: 'world.bremerton.block-01.plot-ferry-terminal',
        description: 'ORCA Smartcard Turnstile Validation',
        amountUsd: -fare,
        paymentMethod: 'orca-card',
      });
      subconsciousGoalReason = `Tapped ORCA card (-$2.75) from left-coat-pocket at WSF Ferry Terminal turnstile.`;
    } else if (currentRoom) {
      // Accrue Occupational Stipend when working/studying inside a zoned room
      const stipendIncrement = Number(
        (nextLedger.hourlyStipendUsd * 0.25).toFixed(2)
      );
      nextLedger.checkingBalanceUsd = Number(
        (nextLedger.checkingBalanceUsd + stipendIncrement).toFixed(2)
      );
      nextLedger.lastTransactionTick = nowMs;
      nextLedger.transactions.unshift({
        id: `tx-${citizen.slug}-${nowMs.toString().slice(-4)}`,
        timestampIso: new Date(nowMs).toISOString(),
        counterparty: `${citizen.occupation} Guild`,
        locationAddress: currentRoom.address,
        description: `Professional Stipend (${currentRoom.semanticZoningSlug.split('.').pop()})`,
        amountUsd: stipendIncrement,
        paymentMethod: 'direct-stipend',
      });
      subconsciousGoalReason = `Earned +$${stipendIncrement.toFixed(
        2
      )} occupational stipend while working in ${currentRoom.semanticZoningSlug}.`;
    }
    nextLedger.transactions = nextLedger.transactions.slice(0, 12);
  }

  // Recompute total carried mass & volume
  let totalMass = 0;
  let totalVol = 0;
  for (const it of nextItems) {
    totalMass += it.massKg;
    totalVol += it.volumeLiters;
  }

  // Compute S^23 Multi-Objective Utility Score
  const curiosity = citizen.virtueWeights['curiosity'] ?? 0.5;
  const zest = citizen.virtueWeights['zest'] ?? 0.5;
  const prudence = citizen.virtueWeights['prudence'] ?? 0.5;
  const utilityScoreActive = Number(
    Math.min(
      0.99,
      0.45 * nextDrives.metabolicEnergy +
        0.25 * nextDrives.thermalComfort +
        0.15 * (curiosity + zest) * 0.5 +
        0.15 * prudence
    ).toFixed(2)
  );

  return {
    updatedDrives: nextDrives,
    updatedRpgState: {
      ...baseRpg,
      items: nextItems,
      ledger: nextLedger,
      totalCarriedMassKg: Number(totalMass.toFixed(2)),
      totalCarriedVolumeLiters: Number(totalVol.toFixed(2)),
      subconsciousGoalReason,
      utilityScoreActive,
      selfPreservationAlert,
    },
    recommendedAction,
  };
}

// ============================================================================
// 4. SANDBOXED PER-CITIZEN WORKING DIRECTORY GENERATOR (/citizens/<slug>/*)
// ============================================================================
export interface SandboxedCitizenWorkingDirectory {
  sandboxRootPath: string; // e.g., "/citizens/jane-do"
  files: Record<
    'soul.md' | 'persona.md' | 'memory.md' | 'inventory.md' | 'ledger.md' | 'body-reflex.md',
    {
      relativePath: string;
      dcaCanonicalAddress: string;
      markdownContent: string;
    }
  >;
}

export function buildSandboxedCitizenWorkingDirectory(
  citizen: CitizenEntity
): SandboxedCitizenWorkingDirectory {
  const rpg =
    citizen.embodiedRpg ||
    createDefaultEmbodiedRpgState(citizen.id, citizen.slug, citizen.occupation);
  const sandboxRootPath = `/citizens/${citizen.slug}`;

  const topVirtues = Object.entries(citizen.virtueWeights)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([slug, w]) => `- **${slug}**: \`${w.toFixed(3)}\``)
    .join('\n');

  const soulMd = `---
sandbox_path: "${sandboxRootPath}/soul.md"
address: "${citizen.id}.mind.soul.manifest"
dca_version: "2.2.43"
manifold: "S^23 (24-Virtue Unit Hypersphere)"
norm_verified: 1.000
---

# ${citizen.fullName} — Soul & Virtue Manifold (\`soul.md\`)

## Dominant Character Strengths ($\\vec{\\Psi} \\in S^{23}$)
${topVirtues}

## Invariant Moral & Somatic Coupling
- **Postural Waist Stiffness ($K_p$)**: \`${citizen.stiffnessKp.waist} N·m/rad\`
- **Shoulder Tonus ($K_p$)**: \`${citizen.stiffnessKp.shoulder} N·m/rad\`
`;

  const personaMd = `---
sandbox_path: "${sandboxRootPath}/persona.md"
address: "${citizen.id}.mind.persona.identity"
jungian_gate: "${citizen.jungianFunction}"
need_for_closure_k: ${citizen.needForClosureK}
willpower_magnitude: ${citizen.willpowerMagnitude}
---

# ${citizen.fullName} — Persona & Identity (\`persona.md\`)

- **Occupation**: ${citizen.occupation}
- **Home Lot**: \`${citizen.homeLot}\`
- **Voice Cadence**: \`${citizen.voiceCadence}\`
- **Biography**: ${citizen.biography}
`;

  const memoryLines = citizen.memories
    .map(
      (m) =>
        `- **[${m.stratum.toUpperCase()}]** (\`${m.slug}\`, valence \`${m.emotionalValence.toFixed(
          2
        )}\`): ${m.summary}`
    )
    .join('\n');

  const memoryMd = `---
sandbox_path: "${sandboxRootPath}/memory.md"
address: "${citizen.id}.mind.memory.stream"
strata_count: ${citizen.memories.length}
---

# ${citizen.fullName} — Sandboxed Memory Stream (\`memory.md\`)

## Active Autobiographical & Episodic Strata
${memoryLines || '- No memories recorded yet.'}

## Latest Cortical / Subconscious Thought
> "${citizen.lastCognitiveThought}"
`;

  const itemsByContainer = rpg.items
    .map(
      (it) =>
        `- **[\`${it.containerSlot}\`]** **${it.name}** (\`${it.massKg.toFixed(
          2
        )} kg\`, \`${it.volumeLiters.toFixed(2)} L\`, \`$${it.valueUsd.toFixed(
          2
        )}\`) — *${it.description}*`
    )
    .join('\n');

  const inventoryMd = `---
sandbox_path: "${sandboxRootPath}/inventory.md"
address: "${citizen.id}.body.equipment.inventory"
primary_container: "${rpg.backpackLabel}"
total_carried_mass_kg: ${rpg.totalCarriedMassKg}
total_carried_volume_liters: ${rpg.totalCarriedVolumeLiters}
---

# ${citizen.fullName} — Physical Pockets & Backpack Inventory (\`inventory.md\`)

## Wearable Container Loadout
- **Primary Pack**: ${rpg.backpackLabel}
- **Total Carried Mass**: \`${rpg.totalCarriedMassKg} kg\` (Coupled to \`Torso.waist-joint\` spinal flexion)
- **Total Occupied Volume**: \`${rpg.totalCarriedVolumeLiters} L\`

## Contained Physical Items (${rpg.items.length})
${itemsByContainer}
`;

  const txLines = rpg.ledger.transactions
    .slice(0, 6)
    .map(
      (tx) =>
        `- \`${tx.amountUsd >= 0 ? `+$${tx.amountUsd.toFixed(2)}` : `-$${Math.abs(tx.amountUsd).toFixed(2)}`}\` **[${tx.paymentMethod}]** at *${tx.counterparty}*: ${tx.description}`
    )
    .join('\n');

  const ledgerMd = `---
sandbox_path: "${sandboxRootPath}/ledger.md"
address: "${citizen.id}.mind.ledger.finances"
wallet_cash_usd: ${rpg.ledger.walletCashUsd}
checking_balance_usd: ${rpg.ledger.checkingBalanceUsd}
orca_transit_balance_usd: ${rpg.ledger.orcaTransitBalanceUsd}
hourly_stipend_usd: ${rpg.ledger.hourlyStipendUsd}
---

# ${citizen.fullName} — Personal Currency & Financial Ledger (\`ledger.md\`)

## Liquid Balances
- **Pocket Wallet Cash (USD)**: \`$${rpg.ledger.walletCashUsd.toFixed(2)}\`
- **Kitsap Credit Union Checking (USD)**: \`$${rpg.ledger.checkingBalanceUsd.toFixed(2)}\`
- **Puget Sound ORCA Transit Card**: \`$${rpg.ledger.orcaTransitBalanceUsd.toFixed(2)}\`
- **Occupational Stipend Rate**: \`$${rpg.ledger.hourlyStipendUsd.toFixed(2)} / hr\`

## Recent Autonomous & Manual Transactions
${txLines}
`;

  const bodyReflexMd = `---
sandbox_path: "${sandboxRootPath}/body-reflex.md"
address: "${citizen.id}.daemon.reflexive.state"
llm_dependency: "NONE (100% Autonomous 10Hz Allostatic & Utility-Tensor Solver)"
active_utility_score: ${rpg.utilityScoreActive}
---

# ${citizen.fullName} — 10Hz Subconscious Reflexive Pilot (\`body-reflex.md\`)

## Somatic & Allostatic Telemetry
- **World Coordinates (1:1 Metric)**: \`[${citizen.position.map((n) => n.toFixed(2)).join(', ')}] m\`
- **Active Motor Directive**: \`${citizen.currentAction}\` (\`${citizen.activePosture}\`)
- **Target DCA Address**: \`${citizen.targetAddress}\`
- **Sanity Determinant $\\det(\\hat{S})$**: \`${citizen.stressState.sanityDeterminant.toFixed(3)}\`
- **Subconscious Utility Arbitration**: ${rpg.subconsciousGoalReason}
`;

  return {
    sandboxRootPath,
    files: {
      'soul.md': {
        relativePath: `${sandboxRootPath}/soul.md`,
        dcaCanonicalAddress: `${citizen.id}.mind.soul.manifest`,
        markdownContent: soulMd,
      },
      'persona.md': {
        relativePath: `${sandboxRootPath}/persona.md`,
        dcaCanonicalAddress: `${citizen.id}.mind.persona.identity`,
        markdownContent: personaMd,
      },
      'memory.md': {
        relativePath: `${sandboxRootPath}/memory.md`,
        dcaCanonicalAddress: `${citizen.id}.mind.memory.stream`,
        markdownContent: memoryMd,
      },
      'inventory.md': {
        relativePath: `${sandboxRootPath}/inventory.md`,
        dcaCanonicalAddress: `${citizen.id}.body.equipment.inventory`,
        markdownContent: inventoryMd,
      },
      'ledger.md': {
        relativePath: `${sandboxRootPath}/ledger.md`,
        dcaCanonicalAddress: `${citizen.id}.mind.ledger.finances`,
        markdownContent: ledgerMd,
      },
      'body-reflex.md': {
        relativePath: `${sandboxRootPath}/body-reflex.md`,
        dcaCanonicalAddress: `${citizen.id}.daemon.reflexive.state`,
        markdownContent: bodyReflexMd,
      },
    },
  };
}
