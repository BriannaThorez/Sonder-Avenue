/**
 * Sonder Avenue — Character Psychology Harmonization Engine
 * Address: SYSTEM.Psychology.Harmonizer.soul-memory-vectors
 * DCA Compliance: DCR-2.1.15-01, DCR-2.2.7-01 (Mood-State Dependent Retrieval),
 *                 DCR-2.2.38-04 (Autobiographical Cognitive Loopback)
 *
 * Harmonizes the character triad:
 * 1. soul.md: Moral bedrock & VIA 24 character strengths (unit hypersphere baseline).
 * 2. memory.md: Multi-stratum autobiographical memory (working, episodic, semantic, biographical).
 * 3. Vectors (S^23): Continuous Persona Calculus state space driving 10Hz somatic pilot.
 */

import {
  CitizenEntity,
  CitizenMemoryItem,
  CorticalIntentPacket,
} from './citizenVfs';
import {
  VIA_VIRTUE_DEFINITIONS,
  normalizeToHypersphere,
  computeStressOperator,
  evaluateCognitiveLogicGate,
  computeSynapticCoupling,
} from './personaCalculus';

export interface PsychologicalHarmonizationProfile {
  citizenId: string;
  fullName: string;
  soulAddress: string;
  memoryAddress: string;
  hypersphereNorm: number;
  topStrengths: Array<{ slug: string; label: string; weight: number; rank: number }>;
  activeEmotionalValence: number;
  allostaticStressDet: number;
  dominantShadowTrigger: string;
  autobiographicalResonanceCount: number;
}

/**
 * Computes the normalized emotional valence from current homeostatic drives.
 * Range: [-1.0 (deep distress) .. +1.0 (serene flourishing)]
 */
export function computeCitizenEmotionalValence(citizen: CitizenEntity): number {
  const energy = citizen.drives.metabolicEnergy;
  const social = citizen.drives.socialEquilibrium;
  const comfort = citizen.drives.thermalComfort;
  const fatigue = citizen.drives.muscularFatigue;
  const sanity = citizen.stressState.sanityDeterminant;

  // Positive drives vs negative drives weighted by sanity
  const raw = (energy * 0.35 + social * 0.35 + comfort * 0.3 - fatigue * 0.5) * sanity;
  return Number(Math.max(-1.0, Math.min(1.0, (raw - 0.4) * 2.0)).toFixed(3));
}

/**
 * Harmonizes and updates a citizen's internal psychology after a cognitive stimulus or action.
 * Returns the updated entity and a newly minted episodic memory item.
 */
export function processPsychologicalLoopback(params: {
  citizen: CitizenEntity;
  stimulus: string;
  targetAddress: string;
  outcomeSuccess: boolean;
  interactionPeerName?: string;
}): {
  updatedCitizen: CitizenEntity;
  newMemory: CitizenMemoryItem;
  epigeneticDriftSummary: string;
} {
  const { citizen, stimulus, targetAddress, outcomeSuccess, interactionPeerName } = params;

  // 1. Calculate emotional valence of the experience
  const currentValence = computeCitizenEmotionalValence(citizen);
  const deltaValence = outcomeSuccess ? 0.15 : -0.22;
  const experienceValence = Number(Math.max(-1.0, Math.min(1.0, currentValence + deltaValence)).toFixed(3));

  // 2. Determine top resonant virtue to experience epigenetic shift
  const sortedVirtues = VIA_VIRTUE_DEFINITIONS.map((v) => ({
    slug: v.slug,
    label: v.label,
    weight: citizen.virtueWeights[v.slug] ?? 0.5,
  })).sort((a, b) => b.weight - a.weight);

  const primaryVirtue = sortedVirtues[0];
  const delta = outcomeSuccess ? 0.015 : -0.012;

  // Apply subtle micro-shift to primary virtue (epigenetic adaptation)
  const nextVirtues = { ...citizen.virtueWeights };
  nextVirtues[primaryVirtue.slug] = Math.max(
    0.05,
    Math.min(0.98, (nextVirtues[primaryVirtue.slug] ?? 0.5) + delta)
  );

  const { unitVector, displayWeights } = normalizeToHypersphere(nextVirtues);

  // 3. Formulate new episodic memory item
  const slug = `mem-${Date.now().toString().slice(-6)}`;
  const peerText = interactionPeerName ? ` with ${interactionPeerName}` : '';
  const outcomeText = outcomeSuccess ? 'fulfilled intention' : 'encountered resistance';
  const summary = `At ${targetAddress.split('.').pop()}: ${stimulus} (${outcomeText}${peerText}).`;

  const newMemory: CitizenMemoryItem = {
    address: `${citizen.id}.mind.memory.episodic.${slug}`,
    stratum: 'episodic',
    slug,
    timestamp: new Date().toISOString(),
    summary,
    emotionalValence: experienceValence,
  };

  // 4. Update memory hierarchy (keep most recent 24 episodic memories)
  const nextMemories = [newMemory, ...citizen.memories.slice(0, 23)];

  const updatedCitizen: CitizenEntity = {
    ...citizen,
    virtueWeights: displayWeights,
    unitHypersphereVector: unitVector,
    memories: nextMemories,
  };

  const epigeneticDriftSummary = `${primaryVirtue.label}: ${(displayWeights[primaryVirtue.slug] ?? 0.5).toFixed(3)} (${delta > 0 ? '+' : ''}${delta.toFixed(3)})`;

  return {
    updatedCitizen,
    newMemory,
    epigeneticDriftSummary,
  };
}

/**
 * Formats a clean, readable soul.md document matching DCA v2.2 specification.
 */
export function generateSoulMarkdown(citizen: CitizenEntity): string {
  const sorted = VIA_VIRTUE_DEFINITIONS.map((v) => ({
    slug: v.slug,
    label: v.label,
    domain: v.domain,
    weight: (citizen.virtueWeights[v.slug] ?? 0.5).toFixed(3),
  })).sort((a, b) => Number(b.weight) - Number(a.weight));

  return `---
address: ${citizen.id}.mind.soul
title: "${citizen.fullName} — Soul Specification & Virtue Geometry"
dca_version: "2.2.43"
jungian_stack: "${citizen.jungianFunction}"
willpower_magnitude: ${citizen.willpowerMagnitude.toFixed(2)}
hypersphere_dimension: 24
---

# ${citizen.fullName} — Soul Foundation

## 1. Jungian Dominance & Cognitive Logic Gate (G)
- **Dominant Function**: \`${citizen.jungianFunction}\`
- **Need for Cognitive Closure (K)**: ${citizen.needForClosureK.toFixed(2)}
- **Allostatic Stress Determinant (det Ŝ)**: ${citizen.stressState.sanityDeterminant.toFixed(3)}
- **Shadow Regression Status**: ${citizen.stressState.inShadowRegression ? 'ACTIVE (Caution)' : 'Nominal'}

## 2. VIA 24 Character Strengths (S^23 Normalized Hypersphere)
${sorted
  .map(
    (item, idx) =>
      `${idx + 1}. **${item.label}** (\`${item.domain}\`): \`${item.weight}\``
  )
  .join('\n')}

## 3. Autobiographical Epigenetic History
- Current episodic memory count: ${citizen.memories.length}
- Primary virtue core: **${sorted[0].label}** (\`${sorted[0].weight}\`)
- Secondary virtue core: **${sorted[1].label}** (\`${sorted[1].weight}\`)
`;
}

/**
 * Formats a clean memory.md document reflecting working, episodic, and semantic strata.
 */
export function generateMemoryMarkdown(citizen: CitizenEntity): string {
  return `---
address: ${citizen.id}.mind.memory
title: "${citizen.fullName} — Autobiographical Memory Ledger"
dca_version: "2.2.43"
total_records: ${citizen.memories.length}
---

# Autobiographical Memory Archive

## 1. Working Memory (Active Buffer)
- **Current Target**: \`${citizen.targetAddress}\`
- **Active Posture**: \`${citizen.activePosture}\`
- **Motor Action**: \`${citizen.currentAction}\`
- **Last Cognitive Thought**: "${citizen.lastCognitiveThought || 'None'}"

## 2. Episodic Memory Stream
${
  citizen.memories.length === 0
    ? '_No episodic events recorded yet._'
    : citizen.memories
        .slice(0, 10)
        .map(
          (m) =>
            `- **[${m.timestamp.slice(11, 19)}]** \`${m.slug}\` (Valence: ${m.emotionalValence > 0 ? '+' : ''}${m.emotionalValence.toFixed(2)}): ${m.summary}`
        )
        .join('\n')
}

## 3. Semantic & Relationship Links
- Home Lot: \`${citizen.homeLot}\`
- Occupation: ${citizen.occupation}
- Known Peers: Devon Brooks, Jane Doe
`;
}
