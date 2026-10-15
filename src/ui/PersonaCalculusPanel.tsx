import React, { useState } from 'react';
import { CitizenEntity } from '../core/citizenVfs';
import { VIA_VIRTUE_DEFINITIONS } from '../core/personaCalculus';
import {
  CONTAINER_CAPACITY_SPECS,
  CitizenContainerSlot,
  CitizenInventoryItem,
  createDefaultEmbodiedRpgState,
} from '../core/neurosymbolicAutonomyEngine';
import {
  Brain,
  Activity,
  Briefcase,
  Wallet,
  Plus,
  Sparkles,
  X,
} from 'lucide-react';

interface PersonaCalculusPanelProps {
  citizen: CitizenEntity;
  weatherTempF: number;
  onUpdateVirtueWeight: (virtueSlug: string, newWeight: number) => void;
  onUpdateCitizen?: (updated: CitizenEntity) => void;
  onClose?: () => void;
}

export const PersonaCalculusPanel: React.FC<PersonaCalculusPanelProps> = ({
  citizen,
  onUpdateVirtueWeight,
  onUpdateCitizen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'virtues' | 'inventory' | 'ledger'>(
    'inventory'
  );
  const [newItemName, setNewItemName] = useState('Artisan Rosemary Scone');
  const [newItemSlot, setNewItemSlot] =
    useState<CitizenContainerSlot>('left-coat-pocket');

  const rpg =
    citizen.embodiedRpg ||
    createDefaultEmbodiedRpgState(citizen.id, citizen.slug, citizen.occupation);

  const topVirtues = [...VIA_VIRTUE_DEFINITIONS]
    .map((d) => ({
      ...d,
      weight: citizen.virtueWeights[d.slug] ?? 0.5,
    }))
    .sort((a, b) => b.weight - a.weight);

  const handleUseOrEquipItem = (item: CitizenInventoryItem) => {
    if (!onUpdateCitizen) return;
    const isConsumable = item.category === 'consumable';
    const nextDrives = {
      ...citizen.drives,
      metabolicEnergy: Math.min(
        1.0,
        citizen.drives.metabolicEnergy + (item.energyRestore || 0.16)
      ),
      thermalComfort: Math.min(
        1.0,
        citizen.drives.thermalComfort + (item.thermalBonus || 0.1)
      ),
    };
    const nextItems = isConsumable
      ? rpg.items.filter((i) => i.id !== item.id)
      : rpg.items.map((i) =>
          i.id === item.id
            ? {
                ...i,
                containerSlot: (i.containerSlot === 'primary-hand'
                  ? 'backpack-satchel'
                  : 'primary-hand') as CitizenContainerSlot,
              }
            : i
        );

    const totalMass = nextItems.reduce((acc, it) => acc + it.massKg, 0);
    const totalVol = nextItems.reduce((acc, it) => acc + it.volumeLiters, 0);

    onUpdateCitizen({
      ...citizen,
      drives: nextDrives,
      activeSpeechBubble: isConsumable
        ? `Used ${item.name} from my ${item.containerSlot}.`
        : `Moved ${item.name} to ${
            item.containerSlot === 'primary-hand' ? 'my pack' : 'my hand'
          }.`,
      speechBubbleTimer: 5.0,
      embodiedRpg: {
        ...rpg,
        items: nextItems,
        totalCarriedMassKg: Number(totalMass.toFixed(2)),
        totalCarriedVolumeLiters: Number(totalVol.toFixed(2)),
        subconsciousGoalReason: isConsumable
          ? `Consumed ${item.name} from ${item.containerSlot} for allostatic balance.`
          : `Equipped ${item.name} in primary-hand.`,
      },
    });
  };

  const handleAddPocketItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateCitizen || !newItemName.trim()) return;
    const cleanSlug = newItemName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const added: CitizenInventoryItem = {
      id: `${citizen.id}.item.${cleanSlug}-${Date.now().toString().slice(-3)}`,
      dcaAddress: `${citizen.id}.body.equipment.${newItemSlot}.${cleanSlug}`,
      slug: cleanSlug,
      name: newItemName.trim(),
      category: 'consumable',
      containerSlot: newItemSlot,
      massKg: 0.18,
      volumeLiters: 0.22,
      valueUsd: 5.5,
      thermalBonus: 0.1,
      energyRestore: 0.2,
      description: `Stored in ${CONTAINER_CAPACITY_SPECS[newItemSlot].label}.`,
    };
    const nextItems = [added, ...rpg.items];
    const totalMass = nextItems.reduce((acc, it) => acc + it.massKg, 0);
    const totalVol = nextItems.reduce((acc, it) => acc + it.volumeLiters, 0);

    onUpdateCitizen({
      ...citizen,
      embodiedRpg: {
        ...rpg,
        items: nextItems,
        totalCarriedMassKg: Number(totalMass.toFixed(2)),
        totalCarriedVolumeLiters: Number(totalVol.toFixed(2)),
      },
    });
    setNewItemName('');
  };

  const handleManualTransaction = (
    label: string,
    counterparty: string,
    amountUsd: number,
    method: 'wallet-cash' | 'checking-debit' | 'orca-card' | 'direct-stipend'
  ) => {
    if (!onUpdateCitizen) return;
    const nextLedger = {
      ...rpg.ledger,
      transactions: [...rpg.ledger.transactions],
    };
    if (method === 'wallet-cash') {
      nextLedger.walletCashUsd = Math.max(
        0,
        Number((nextLedger.walletCashUsd + amountUsd).toFixed(2))
      );
    } else if (method === 'orca-card') {
      nextLedger.orcaTransitBalanceUsd = Math.max(
        0,
        Number((nextLedger.orcaTransitBalanceUsd + amountUsd).toFixed(2))
      );
    } else {
      nextLedger.checkingBalanceUsd = Math.max(
        0,
        Number((nextLedger.checkingBalanceUsd + amountUsd).toFixed(2))
      );
    }
    nextLedger.transactions.unshift({
      id: `tx-manual-${Date.now().toString().slice(-4)}`,
      timestampIso: new Date().toISOString(),
      counterparty,
      locationAddress: citizen.targetAddress,
      description: label,
      amountUsd,
      paymentMethod: method,
    });

    onUpdateCitizen({
      ...citizen,
      activeSpeechBubble: `${label} (${
        amountUsd >= 0 ? `+$${amountUsd.toFixed(2)}` : `-$${Math.abs(amountUsd).toFixed(2)}`
      })`,
      speechBubbleTimer: 4.5,
      embodiedRpg: {
        ...rpg,
        ledger: nextLedger,
      },
    });
  };

  return (
    <div className="fixed top-12 left-3 z-30 w-[375px] max-h-[calc(100vh-96px)] flex flex-col rounded-xl bg-[#FAF7F2]/95 backdrop-blur-xl border border-stone-300/90 shadow-xl text-stone-800 overflow-hidden">
      {/* Header */}
      <div className="px-3.5 py-2.5 border-b border-stone-200/90 bg-[#F3EFE6]/90 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-teal-700" />
          <div>
            <h2 className="text-xs font-semibold text-stone-900 leading-tight">
              Neurosymbolic Body, Inventory &amp; Persona
            </h2>
            <p className="text-[10px] text-stone-500 font-mono">
              {citizen.fullName} · /citizens/{citizen.slug}/
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-md text-stone-500 hover:text-stone-800 hover:bg-stone-200/70"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Mode Tabs */}
      <div className="px-3 pt-2 flex gap-1 border-b border-stone-200/80 bg-[#FAF7F2]">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex-1 pb-2 text-[10px] font-semibold border-b-2 transition-colors flex items-center justify-center gap-1 ${
            activeTab === 'inventory'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Briefcase className="w-3 h-3" />
          <span>Pockets &amp; Pack ({rpg.items.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex-1 pb-2 text-[10px] font-semibold border-b-2 transition-colors flex items-center justify-center gap-1 ${
            activeTab === 'ledger'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Wallet className="w-3 h-3" />
          <span>Wallet (${rpg.ledger.walletCashUsd.toFixed(0)})</span>
        </button>
        <button
          onClick={() => setActiveTab('virtues')}
          className={`flex-1 pb-2 text-[10px] font-semibold border-b-2 transition-colors flex items-center justify-center gap-1 ${
            activeTab === 'virtues'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Activity className="w-3 h-3" />
          <span>S²³ &amp; Allostasis</span>
        </button>
      </div>

      <div className="p-3.5 overflow-y-auto space-y-3 text-xs">
        {/* Subconscious 10Hz Autonomy Banner (0ms LLM-Independent) */}
        <div className="p-2.5 rounded-lg bg-white border border-stone-200/90 space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-semibold text-teal-800 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>10Hz Subconscious Reflex (0ms No-LLM Autonomy)</span>
            </span>
            <span className="font-mono font-bold text-stone-700">
              U={rpg.utilityScoreActive.toFixed(2)}
            </span>
          </div>
          <p className="text-[10px] text-stone-600 leading-snug">
            {rpg.subconsciousGoalReason}
          </p>
        </div>

        {activeTab === 'inventory' && (
          <div className="space-y-2.5">
            {/* Wearable Pack & Carried Mass Summary */}
            <div className="p-2.5 rounded-lg bg-white border border-stone-200/90 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-stone-900">
                  {rpg.backpackLabel}
                </span>
                <span className="font-mono text-[10px] text-teal-800 font-semibold">
                  {rpg.totalCarriedMassKg.toFixed(2)} kg ·{' '}
                  {rpg.totalCarriedVolumeLiters.toFixed(2)} L
                </span>
              </div>
              <div className="text-[10px] text-stone-500">
                Carried mass couples directly into 16-bone spinal flexion (
                <span className="font-mono">Torso.waist-joint</span>) and metabolic
                burn.
              </div>
            </div>

            {/* Add Item to Pocket / Backpack */}
            <form
              onSubmit={handleAddPocketItem}
              className="p-2 rounded-lg bg-white border border-stone-200/90 flex items-center gap-1.5"
            >
              <select
                value={newItemSlot}
                onChange={(e) =>
                  setNewItemSlot(e.target.value as CitizenContainerSlot)
                }
                className="px-1.5 py-1 rounded bg-[#FAF7F2] border border-stone-300 text-[10px] font-medium"
              >
                <option value="left-coat-pocket">Left Pocket</option>
                <option value="right-coat-pocket">Right Pocket</option>
                <option value="trouser-pocket">Trouser Pocket</option>
                <option value="backpack-satchel">Backpack</option>
                <option value="primary-hand">Hand</option>
              </select>
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Place item in pocket/pack..."
                className="flex-1 px-2 py-1 rounded bg-[#FAF7F2] border border-stone-300 text-[10px]"
              />
              <button
                type="submit"
                title="Store Item in Selected Container"
                className="p-1.5 rounded bg-teal-700 hover:bg-teal-800 text-white"
              >
                <Plus className="w-3 h-3" />
              </button>
            </form>

            {/* Contained Items by Physical Pocket / Pack Slot */}
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {rpg.items.map((item) => (
                <div
                  key={item.id}
                  className="p-2 rounded-lg bg-white border border-stone-200/90 space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-[11px] text-stone-900">
                      {item.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUseOrEquipItem(item)}
                      className="px-2 py-0.5 rounded bg-[#F3EFE6] hover:bg-teal-700 hover:text-white text-stone-800 text-[9px] font-semibold transition-colors shrink-0"
                    >
                      {item.category === 'consumable'
                        ? 'Consume'
                        : item.containerSlot === 'primary-hand'
                        ? 'Stow in Pack'
                        : 'Hold in Hand'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-stone-500">
                    <span className="text-teal-800 font-semibold">
                      [{CONTAINER_CAPACITY_SPECS[item.containerSlot].label}]
                    </span>
                    <span>
                      {item.massKg.toFixed(2)}kg · {item.volumeLiters.toFixed(2)}L · $
                      {item.valueUsd.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-600 leading-snug">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'ledger' && (
          <div className="space-y-2.5">
            {/* Personal Currency Balances */}
            <div className="grid grid-cols-3 gap-1.5">
              <div className="p-2 rounded-lg bg-white border border-stone-200/90">
                <div className="text-[9px] uppercase tracking-wider text-stone-500">
                  Pocket Cash
                </div>
                <div className="font-mono text-xs font-bold text-emerald-700">
                  ${rpg.ledger.walletCashUsd.toFixed(2)}
                </div>
              </div>
              <div className="p-2 rounded-lg bg-white border border-stone-200/90">
                <div className="text-[9px] uppercase tracking-wider text-stone-500">
                  Bank Checking
                </div>
                <div className="font-mono text-xs font-bold text-stone-900">
                  ${rpg.ledger.checkingBalanceUsd.toFixed(2)}
                </div>
              </div>
              <div className="p-2 rounded-lg bg-white border border-stone-200/90">
                <div className="text-[9px] uppercase tracking-wider text-stone-500">
                  ORCA Transit
                </div>
                <div className="font-mono text-xs font-bold text-sky-700">
                  ${rpg.ledger.orcaTransitBalanceUsd.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Everyday Micro-Transaction Actions */}
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() =>
                  handleManualTransaction(
                    'Roastery Cortado',
                    'Sinclair Sound Roasters',
                    -4.75,
                    'wallet-cash'
                  )
                }
                className="py-1.5 px-2 rounded bg-white hover:bg-stone-100 border border-stone-300 text-[10px] font-semibold text-stone-800"
              >
                Buy Coffee (-$4.75)
              </button>
              <button
                type="button"
                onClick={() =>
                  handleManualTransaction(
                    'WSF Ferry Fare',
                    'Bremerton Slip 1',
                    -2.75,
                    'orca-card'
                  )
                }
                className="py-1.5 px-2 rounded bg-white hover:bg-stone-100 border border-stone-300 text-[10px] font-semibold text-stone-800"
              >
                Tap ORCA (-$2.75)
              </button>
              <button
                type="button"
                onClick={() =>
                  handleManualTransaction(
                    'Work Shift Stipend',
                    `${citizen.occupation} Guild`,
                    rpg.ledger.hourlyStipendUsd,
                    'direct-stipend'
                  )
                }
                className="py-1.5 px-2 rounded bg-teal-700 hover:bg-teal-800 text-white text-[10px] font-semibold"
              >
                Earn +${rpg.ledger.hourlyStipendUsd.toFixed(0)}
              </button>
            </div>

            {/* Transaction History (/citizens/<slug>/ledger.md) */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                Personal Financial Ledger (/citizens/{citizen.slug}/ledger.md)
              </div>
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {rpg.ledger.transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-2 rounded-lg bg-white border border-stone-200/90 flex items-center justify-between gap-2 text-[10px]"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-stone-900 truncate">
                        {tx.description}
                      </div>
                      <div className="text-stone-500 font-mono text-[9px] truncate">
                        {tx.counterparty} · {tx.paymentMethod}
                      </div>
                    </div>
                    <span
                      className={`font-mono font-bold shrink-0 ${
                        tx.amountUsd >= 0 ? 'text-emerald-700' : 'text-stone-800'
                      }`}
                    >
                      {tx.amountUsd >= 0
                        ? `+$${tx.amountUsd.toFixed(2)}`
                        : `-$${Math.abs(tx.amountUsd).toFixed(2)}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'virtues' && (
          <>
            {/* Somatic Homeostasis & Stress Operator S_hat */}
            <div className="p-2.5 rounded-lg bg-white/90 border border-stone-200/90 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-teal-700" />
                  <span>Allostatic Drives &amp; Stress Operator Ŝ</span>
                </span>
                <span className="font-mono text-[10px] font-semibold text-teal-800">
                  det(Ŝ)={citizen.stressState.sanityDeterminant.toFixed(2)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <div className="p-1.5 rounded bg-[#FAF7F2] border border-stone-200/70 flex justify-between">
                  <span className="text-stone-600">Energy</span>
                  <span className="font-mono font-semibold text-stone-900">
                    {(citizen.drives.metabolicEnergy * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="p-1.5 rounded bg-[#FAF7F2] border border-stone-200/70 flex justify-between">
                  <span className="text-stone-600">Thermal</span>
                  <span className="font-mono font-semibold text-stone-900">
                    {(citizen.drives.thermalComfort * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="p-1.5 rounded bg-[#FAF7F2] border border-stone-200/70 flex justify-between">
                  <span className="text-stone-600">Social</span>
                  <span className="font-mono font-semibold text-stone-900">
                    {(citizen.drives.socialEquilibrium * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="p-1.5 rounded bg-[#FAF7F2] border border-stone-200/70 flex justify-between">
                  <span className="text-stone-600">Fatigue</span>
                  <span className="font-mono font-semibold text-stone-900">
                    {(citizen.drives.muscularFatigue * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            {/* 24 VIA Virtues S^23 Sliders */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                  24 VIA Character Strengths (‖Ψ‖ = 1)
                </span>
              </div>
              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                {topVirtues.map((v) => (
                  <div
                    key={v.slug}
                    className="p-1.5 rounded bg-white border border-stone-200/80 space-y-0.5"
                  >
                    <div className="flex justify-between text-[10px]">
                      <span className="font-medium text-stone-800">{v.label}</span>
                      <span className="font-mono text-teal-700 font-semibold">
                        {v.weight.toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.1}
                      max={0.98}
                      step={0.02}
                      value={v.weight}
                      onChange={(e) =>
                        onUpdateVirtueWeight(v.slug, parseFloat(e.target.value))
                      }
                      className="w-full h-1.5 accent-teal-700 bg-stone-200 rounded-lg cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
