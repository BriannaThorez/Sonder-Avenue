/**
 * Persona Calculus: Mathematical & Symbolic Modeling of Entities
 * Implements the formal treatise in development/DCA/Persona-Calculus.md:
 * 1. Persona State Vector (Psi in S^23 hypersphere, willpower magnitude ||Psi||)
 * 2. Cognitive Logic Gate (G — Symbolic Firewall with Jungian Stack Si/Ne/Ti/Fe & Need for Closure K)
 * 3. Allostatic Stress Operator (S_hat — Diagonal Transformation Matrix, Sanity Determinant det(S), Flux Hysteresis)
 * 4. Synaptic Coupling (Omega = psi_A . psi_B, Omega Devaluation Filter, Social Delta rotation)
 * 5. Formal Virtue Functions (Grad V potential wells & Axiological Tension / Choice Paralysis)
 * 6. Emergent Culture Field Tensor (F — Mean Field Acculturation & Disruptor Turbulence)
 */

export type VirtueDomain =
  | 'wisdom'
  | 'courage'
  | 'humanity'
  | 'justice'
  | 'temperance'
  | 'transcendence';

export interface ViaStrengthDefinition {
  index: number;
  slug: string;
  label: string;
  domain: VirtueDomain;
  domainLabel: string;
  description: string;
  posturalEffect: string;
}

export const VIA_VIRTUE_DEFINITIONS: ViaStrengthDefinition[] = [
  // 1. Wisdom & Knowledge (5)
  {
    index: 0,
    slug: 'creativity',
    label: 'Creativity',
    domain: 'wisdom',
    domainLabel: 'Wisdom & Knowledge',
    description: 'Originality and adaptive problem-solving across novel neighborhood affordances.',
    posturalEffect: 'Expressive asymmetric hand gestures and head tilt',
  },
  {
    index: 1,
    slug: 'curiosity',
    label: 'Curiosity',
    domain: 'wisdom',
    domainLabel: 'Wisdom & Knowledge',
    description: 'Intrinsic drive to explore landmarks, inspect dropped items, and initiate conversations.',
    posturalEffect: 'Alert cervical pitch (+4°) and active visual gaze scanning',
  },
  {
    index: 2,
    slug: 'judgment',
    label: 'Judgment',
    domain: 'wisdom',
    domainLabel: 'Wisdom & Knowledge',
    description: 'Critical thinking and balanced evaluation of whispers before acting.',
    posturalEffect: 'Measured folded-arm contemplation stance',
  },
  {
    index: 3,
    slug: 'love-of-learning',
    label: 'Love of Learning',
    domain: 'wisdom',
    domainLabel: 'Wisdom & Knowledge',
    description: 'Deepening semantic memory maps of Bremerton architecture and lore.',
    posturalEffect: 'Steady upright torso alignment when observing lots',
  },
  {
    index: 4,
    slug: 'perspective',
    label: 'Perspective',
    domain: 'wisdom',
    domainLabel: 'Wisdom & Knowledge',
    description: 'Capacity to synthesize long-term biographical context and counsel peers.',
    posturalEffect: 'Calm, low-frequency breathing and grounded shoulder posture',
  },

  // 2. Courage (4)
  {
    index: 5,
    slug: 'bravery',
    label: 'Bravery',
    domain: 'courage',
    domainLabel: 'Courage',
    description: 'Willingness to confront social friction or harsh weather without retreating.',
    posturalEffect: 'Expanded thoracic chest angle and high shoulder stiffness (kp)',
  },
  {
    index: 6,
    slug: 'perseverance',
    label: 'Perseverance',
    domain: 'courage',
    domainLabel: 'Courage',
    description: 'Sustaining goal trajectories despite high muscular fatigue or long queues.',
    posturalEffect: 'Resilient knee and waist torque under load',
  },
  {
    index: 7,
    slug: 'honesty',
    label: 'Honesty',
    domain: 'courage',
    domainLabel: 'Courage',
    description: 'Authentic alignment between internal cortical thought and spoken dialogue.',
    posturalEffect: 'Direct eye-line orientation toward interlocutors',
  },
  {
    index: 8,
    slug: 'zest',
    label: 'Zest',
    domain: 'courage',
    domainLabel: 'Courage',
    description: 'Vitality, brisk stride frequency, and enthusiastic jumping/greeting animations.',
    posturalEffect: '+25% stride frequency, bouncy knee flexion, high postural tonus',
  },

  // 3. Humanity (3)
  {
    index: 9,
    slug: 'love',
    label: 'Love',
    domain: 'humanity',
    domainLabel: 'Humanity',
    description: 'Deep relational bonding and high trust multipliers with close peers.',
    posturalEffect: 'Warm open-arm proximity and relaxed shoulder abduction',
  },
  {
    index: 10,
    slug: 'kindness',
    label: 'Kindness',
    domain: 'humanity',
    domainLabel: 'Humanity',
    description: 'Altruistic responsiveness to distressed or exhausted neighbors.',
    posturalEffect: 'Gentle forward waist inclination during conversation',
  },
  {
    index: 11,
    slug: 'social-intelligence',
    label: 'Social Intelligence',
    domain: 'humanity',
    domainLabel: 'Humanity',
    description: 'Acute reading of peer body language, queue etiquette, and social tension.',
    posturalEffect: 'Synchronized postural mirroring with conversational partners',
  },

  // 4. Justice (3)
  {
    index: 12,
    slug: 'teamwork',
    label: 'Teamwork',
    domain: 'justice',
    domainLabel: 'Justice',
    description: 'Cooperative coordination in shared spaces and sensitivity to the Field Tensor F.',
    posturalEffect: 'Harmonious spacing in pedestrian queues',
  },
  {
    index: 13,
    slug: 'fairness',
    label: 'Fairness',
    domain: 'justice',
    domainLabel: 'Justice',
    description: 'Strict adherence to turn-taking and moral reciprocity.',
    posturalEffect: 'Refuses line-cutting whispers; balanced bilateral stance',
  },
  {
    index: 14,
    slug: 'leadership',
    label: 'Leadership',
    domain: 'justice',
    domainLabel: 'Justice',
    description: 'High social mass anchoring neighborhood cultural norms.',
    posturalEffect: 'Broad, composed stance with decisive gesture cadence',
  },

  // 5. Temperance (4)
  {
    index: 15,
    slug: 'forgiveness',
    label: 'Forgiveness',
    domain: 'temperance',
    domainLabel: 'Temperance',
    description: 'Rapid dissipation of negative social friction and dissonance.',
    posturalEffect: 'Quick relaxation of defensive crossed-arm tension',
  },
  {
    index: 16,
    slug: 'humility',
    label: 'Humility',
    domain: 'temperance',
    domainLabel: 'Temperance',
    description: 'Modest self-presentation and openness to corrective feedback.',
    posturalEffect: 'Subtle cervical nod and unassuming idle stance',
  },
  {
    index: 17,
    slug: 'prudence',
    label: 'Prudence',
    domain: 'temperance',
    domainLabel: 'Temperance',
    description: 'Careful foresight and risk-averse evaluation of erratic impulses.',
    posturalEffect: 'Measured, economical stride length and stable ankle damping',
  },
  {
    index: 18,
    slug: 'self-regulation',
    label: 'Self-Regulation',
    domain: 'temperance',
    domainLabel: 'Temperance',
    description: 'Disciplined impulse control, composure in queues, and high waist stiffness.',
    posturalEffect: 'High tonic core stability (kp = 0.88); resists erratic whispers',
  },

  // 6. Transcendence (5)
  {
    index: 19,
    slug: 'appreciation-of-beauty',
    label: 'Appreciation of Beauty',
    domain: 'transcendence',
    domainLabel: 'Transcendence',
    description: 'Aesthetic absorption in waterfront vistas, ferries, and architectural details.',
    posturalEffect: 'Frequent scenic pauses overlooking the Bremerton waterfront',
  },
  {
    index: 20,
    slug: 'gratitude',
    label: 'Gratitude',
    domain: 'transcendence',
    domainLabel: 'Transcendence',
    description: 'Positive appraisal of everyday neighborhood encounters.',
    posturalEffect: 'Warm hand-to-chest gesture during greetings',
  },
  {
    index: 21,
    slug: 'hope',
    label: 'Hope',
    domain: 'transcendence',
    domainLabel: 'Transcendence',
    description: 'Optimistic future expectation buffering against allostatic slump.',
    posturalEffect: 'Elevated sternum pitch; prevents depressive spinal droop',
  },
  {
    index: 22,
    slug: 'humor',
    label: 'Humor',
    domain: 'transcendence',
    domainLabel: 'Transcendence',
    description: 'Sitcom-style wit and levity in mundane neighborly predicaments.',
    posturalEffect: 'Lively shoulder shrug and animated conversational gestures',
  },
  {
    index: 23,
    slug: 'spirituality',
    label: 'Spirituality',
    domain: 'transcendence',
    domainLabel: 'Transcendence',
    description: 'Coherent teleological purpose and inner existential anchor.',
    posturalEffect: 'Serene, low-entropy idle equilibrium',
  },
];

export type JungianFunction = 'Si' | 'Ne' | 'Ti' | 'Fe' | 'Ni' | 'Se' | 'Te' | 'Fi';

export interface StressOperatorState {
  diagonalEigenvalues: number[]; // 24 sensitivity coefficients
  sanityDeterminant: number;     // det(S_hat) proxy in [0.05, 1.20]
  inShadowRegression: boolean;   // True if det(S_hat) < 0.45
  hysteresisCooldownTicks: number;
  activeStressors: string[];
}

export interface SomaticDrives {
  thermalComfort: number;     // [0..1] drops in 35°F snow
  metabolicEnergy: number;    // [0..1] drops with running/lifting, recovers sitting
  socialEquilibrium: number;  // [0..1] modulated by synaptic coupling
  muscularFatigue: number;    // [0..1] increases with physical exertion
}

export interface SynapticCouplingResult {
  omega: number; // [-1.0, +1.0] dot product on S^23
  classification: 'Axiological Resonance' | 'Neutral Coexistence' | 'Omega Filter Devaluation' | 'Axiological Annihilation';
  trustMultiplier: number;
  vectorDeltaA: number[];
  vectorDeltaB: number[];
  narrativeSummary: string;
}

/**
 * Normalizes a 24-element virtue array onto the unit hypersphere S^23 (||psi|| = 1)
 * enforcing the Law of Conservation of Personality.
 */
export function normalizeToHypersphere(weights: Record<string, number>): {
  unitVector: number[];
  displayWeights: Record<string, number>;
  l2Norm: number;
} {
  const raw = VIA_VIRTUE_DEFINITIONS.map((def) => {
    const v = weights[def.slug];
    return Number.isFinite(v) ? Math.max(0.05, Math.min(1.0, v)) : 0.5;
  });

  const sumSq = raw.reduce((acc, v) => acc + v * v, 0);
  const l2Norm = Math.sqrt(sumSq) || 1;
  const unitVector = raw.map((v) => v / l2Norm);

  // Law of Conservation of Personality budget scaling (mean ~ 0.58)
  const targetMean = 0.58;
  const currentMean = raw.reduce((a, b) => a + b, 0) / raw.length;
  const budgetScale = currentMean > 0 ? targetMean / currentMean : 1;

  const displayWeights: Record<string, number> = {};
  VIA_VIRTUE_DEFINITIONS.forEach((def, idx) => {
    const conserved = Math.max(0.08, Math.min(0.98, raw[idx] * (0.65 + 0.35 * budgetScale)));
    displayWeights[def.slug] = Number(conserved.toFixed(3));
  });

  return { unitVector, displayWeights, l2Norm };
}

/**
 * Computes the Linear Stress Transformation Matrix S_hat and Sanity Determinant det(S_hat)
 * based on somatic feedback (thermal cold, fatigue, exhaustion) and flux hysteresis.
 */
export function computeStressOperator(
  drives: SomaticDrives,
  weatherTempF: number,
  prevHysteresisTicks = 0
): StressOperatorState {
  const activeStressors: string[] = [];
  const coldStress = weatherTempF <= 38 ? 0.28 : 0.0;
  if (coldStress > 0) activeStressors.push(`Freezing Weather (${weatherTempF}°F)`);
  if (drives.muscularFatigue > 0.55) activeStressors.push('High Muscular Fatigue');
  if (drives.metabolicEnergy < 0.35) activeStressors.push('Metabolic Exhaustion');
  if (drives.socialEquilibrium < 0.30) activeStressors.push('Social Isolation Strain');

  const allostaticLoad = Math.min(
    0.95,
    coldStress +
      drives.muscularFatigue * 0.35 +
      (1 - drives.metabolicEnergy) * 0.35 +
      (1 - drives.socialEquilibrium) * 0.20
  );

  // Eigenvalue decay on Openness/Wisdom & Humanity/Agreeableness under stress;
  // Eigenvalue amplification on Prudence/Self-Regulation (Need for Closure)
  const diagonalEigenvalues = VIA_VIRTUE_DEFINITIONS.map((def) => {
    if (def.domain === 'wisdom' || def.domain === 'humanity') {
      return Number(Math.max(0.25, 1.0 - allostaticLoad * 0.65).toFixed(3));
    }
    if (def.slug === 'prudence' || def.slug === 'self-regulation') {
      return Number((1.0 + allostaticLoad * 0.45).toFixed(3));
    }
    if (def.slug === 'zest' || def.slug === 'humor') {
      return Number(Math.max(0.20, 1.0 - allostaticLoad * 0.70).toFixed(3));
    }
    return Number(Math.max(0.40, 1.0 - allostaticLoad * 0.35).toFixed(3));
  });

  // Geometric mean of eigenvalues serves as normalized proxy for det(S_hat)
  const logSum = diagonalEigenvalues.reduce((acc, val) => acc + Math.log(Math.max(0.05, val)), 0);
  const rawDet = Math.exp(logSum / diagonalEigenvalues.length);

  let hysteresisCooldownTicks = prevHysteresisTicks;
  let sanityDeterminant = Number(rawDet.toFixed(3));

  if (sanityDeterminant < 0.45) {
    hysteresisCooldownTicks = Math.max(hysteresisCooldownTicks, 12);
  } else if (hysteresisCooldownTicks > 0) {
    hysteresisCooldownTicks -= 1;
    // Flux hysteresis keeps the manifold partially warped during cooldown
    sanityDeterminant = Number(Math.min(sanityDeterminant, 0.44 + (12 - hysteresisCooldownTicks) * 0.02).toFixed(3));
    activeStressors.push(`Flux Hysteresis Recovery (${hysteresisCooldownTicks}t)`);
  }

  return {
    diagonalEigenvalues,
    sanityDeterminant,
    inShadowRegression: sanityDeterminant < 0.45,
    hysteresisCooldownTicks,
    activeStressors,
  };
}

/**
 * Symbolic Firewall / Cognitive Logic Gate G(Psi, E) -> {0, 1}
 * Evaluates whether a proposed action or player whisper is permissible given the citizen's
 * Jungian dominant function (Si/Ne/Ti/Fe), Need for Closure K, and Stress Operator S_hat.
 */
export function evaluateCognitiveLogicGate(params: {
  dominantFunction: JungianFunction;
  needForClosureK: number; // [0..1]
  virtueWeights: Record<string, number>;
  stressState: StressOperatorState;
  proposedAction: string;
  isWhisper?: boolean;
}): {
  permitted: boolean;
  dissonanceResolution: 'None' | 'Vector Rationalization (Growth)' | 'Devaluation (Denial)' | 'Manifold Repair (Scar)';
  gateReason: string;
} {
  const { dominantFunction, needForClosureK, virtueWeights, stressState, proposedAction, isWhisper } = params;
  const selfReg = virtueWeights['self-regulation'] ?? 0.5;
  const fairness = virtueWeights['fairness'] ?? 0.5;
  const bravery = virtueWeights['bravery'] ?? 0.5;

  // Check if citizen has snapped into Shadow Function regression
  if (stressState.inShadowRegression) {
    return {
      permitted: true,
      dissonanceResolution: 'Manifold Repair (Scar)',
      gateReason: `Shadow-Function Override (det(Ŝ) = ${stressState.sanityDeterminant} < 0.45): Symbolic firewall bypassed under allostatic overload.`,
    };
  }

  // High Fairness + Self-Regulation rejects antisocial or line-cutting whispers
  if (
    isWhisper &&
    (proposedAction.toLowerCase().includes('cut') || proposedAction.toLowerCase().includes('shove')) &&
    selfReg + fairness > 1.45
  ) {
    return {
      permitted: false,
      dissonanceResolution: 'Devaluation (Denial)',
      gateReason: `Symbolic Firewall G rejected whisper: Self-Regulation (${selfReg.toFixed(
        2
      )}) + Fairness (${fairness.toFixed(2)}) blocks queue-violation impulse.`,
    };
  }

  // Si-dominant Historical Weighting Operator resists radical unplanned jumps when Need for Closure K is high
  if (dominantFunction === 'Si' && needForClosureK > 0.72 && proposedAction === 'JUMP_JOY' && bravery < 0.65) {
    return {
      permitted: false,
      dissonanceResolution: 'Devaluation (Denial)',
      gateReason: `Si Historical Weighting Gate + Need for Closure (K=${needForClosureK.toFixed(
        2
      )}) pruned unscheduled public outburst.`,
    };
  }

  return {
    permitted: true,
    dissonanceResolution: isWhisper ? 'Vector Rationalization (Growth)' : 'None',
    gateReason: `Permitted by ${dominantFunction}-dominant Cognitive Logic Gate (det(Ŝ) = ${stressState.sanityDeterminant.toFixed(
      2
    )}).`,
  };
}

/**
 * Synaptic Coupling (Omega = psi_A . psi_B) between two interacting citizens.
 * Centered around the baseline positive manifold so divergent virtue profiles produce both
 * high resonance (+1) and negative antipodal friction (-1).
 */
export function computeSynapticCoupling(
  weightsA: Record<string, number>,
  weightsB: Record<string, number>,
  willpowerA = 1.0,
  willpowerB = 1.0
): SynapticCouplingResult {
  // Center vectors around 0.50 to measure directional moral alignment across the hypersphere
  const centeredA = VIA_VIRTUE_DEFINITIONS.map((d) => (weightsA[d.slug] ?? 0.5) - 0.5);
  const centeredB = VIA_VIRTUE_DEFINITIONS.map((d) => (weightsB[d.slug] ?? 0.5) - 0.5);

  const normA = Math.sqrt(centeredA.reduce((s, v) => s + v * v, 0)) || 1;
  const normB = Math.sqrt(centeredB.reduce((s, v) => s + v * v, 0)) || 1;

  const dot = centeredA.reduce((s, v, i) => s + (v / normA) * (centeredB[i] / normB), 0);
  const omega = Number(Math.max(-1.0, Math.min(1.0, dot)).toFixed(3));

  const agreeablenessA = ((weightsA['kindness'] ?? 0.5) + (weightsA['forgiveness'] ?? 0.5)) / 2;
  const inertiaRatio = willpowerB / Math.max(0.25, willpowerA);

  let classification: SynapticCouplingResult['classification'] = 'Neutral Coexistence';
  let trustMultiplier = 1.0;
  let rotationRate = 0.015 * inertiaRatio;

  if (omega >= 0.45) {
    classification = 'Axiological Resonance';
    trustMultiplier = Number((1.25 + omega * 0.5).toFixed(2));
  } else if (omega <= -0.55) {
    classification = 'Axiological Annihilation';
    trustMultiplier = 0.0;
    rotationRate = -0.03 * (1.2 - agreeablenessA);
  } else if (omega < -0.15) {
    classification = 'Omega Filter Devaluation';
    trustMultiplier = 0.08;
    rotationRate = -0.02 * (1.1 - agreeablenessA);
  }

  const vectorDeltaA = centeredA.map((v, i) => Number(((centeredB[i] - v) * rotationRate).toFixed(4)));
  const vectorDeltaB = centeredB.map((v, i) => Number(((centeredA[i] - v) * rotationRate).toFixed(4)));

  const narrativeSummary =
    classification === 'Axiological Resonance'
      ? `Resonance (Ω = ${omega}): Shared moral heading triggers consensus convergence and elevated trust (${trustMultiplier}x).`
      : classification === 'Omega Filter Devaluation'
      ? `Omega Filter Active (Ω = ${omega}): Divergent virtue headings attenuate persuasion (trust ${trustMultiplier}x) and trigger entrenchment.`
      : classification === 'Axiological Annihilation'
      ? `Antipodal Collision (Ω = ${omega}): Maximum axiological tension; social avoidance or confrontation triggered.`
      : `Balanced Exchange (Ω = ${omega}): Orthogonal virtue profiles coexist with mild acculturation.`;

  return {
    omega,
    classification,
    trustMultiplier,
    vectorDeltaA,
    vectorDeltaB,
    narrativeSummary,
  };
}

/**
 * Computes the Neighborhood Cultural Field Tensor F (Mean Field across all active citizens)
 * and measures cultural variance (Consensus Stasis vs. Disruptor Turbulence).
 */
export function computeCulturalFieldTensor(
  citizens: Array<{ id: string; virtueWeights: Record<string, number>; willpowerMagnitude: number }>
): {
  meanFieldWeights: Record<string, number>;
  dominantCulturalVirtues: Array<{ slug: string; label: string; value: number }>;
  culturalVariance: number;
  phase: 'Dynamic Pluralism' | 'Consensus Stasis (Echo Chamber)' | 'Prophetic Turbulence';
} {
  if (citizens.length === 0) {
    return {
      meanFieldWeights: {},
      dominantCulturalVirtues: [],
      culturalVariance: 0,
      phase: 'Dynamic Pluralism',
    };
  }

  let totalMass = 0;
  const weightedSums: Record<string, number> = {};
  VIA_VIRTUE_DEFINITIONS.forEach((d) => {
    weightedSums[d.slug] = 0;
  });

  for (const c of citizens) {
    const mass = Math.max(0.2, c.willpowerMagnitude);
    totalMass += mass;
    for (const def of VIA_VIRTUE_DEFINITIONS) {
      weightedSums[def.slug] += (c.virtueWeights[def.slug] ?? 0.5) * mass;
    }
  }

  const meanFieldWeights: Record<string, number> = {};
  for (const def of VIA_VIRTUE_DEFINITIONS) {
    meanFieldWeights[def.slug] = Number((weightedSums[def.slug] / (totalMass || 1)).toFixed(3));
  }

  // Compute variance across population
  let totalVar = 0;
  for (const c of citizens) {
    let distSq = 0;
    for (const def of VIA_VIRTUE_DEFINITIONS) {
      const diff = (c.virtueWeights[def.slug] ?? 0.5) - meanFieldWeights[def.slug];
      distSq += diff * diff;
    }
    totalVar += distSq / VIA_VIRTUE_DEFINITIONS.length;
  }
  const culturalVariance = Number((totalVar / citizens.length).toFixed(4));

  const dominantCulturalVirtues = VIA_VIRTUE_DEFINITIONS.map((d) => ({
    slug: d.slug,
    label: d.label,
    value: meanFieldWeights[d.slug],
  }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const phase =
    culturalVariance < 0.008
      ? 'Consensus Stasis (Echo Chamber)'
      : culturalVariance > 0.035
      ? 'Prophetic Turbulence'
      : 'Dynamic Pluralism';

  return {
    meanFieldWeights,
    dominantCulturalVirtues,
    culturalVariance,
    phase,
  };
}

/**
 * Psycho-Somatic Auto-Coupling (DCR-2.2.26-01):
 * Derives 16-segment resting spinal pitch, shoulder stiffness (kp), and stride cadence
 * directly from the citizen's 24 VIA virtues and somatic fatigue.
 */
export function computePosturalTonusFromVirtues(
  virtues: Record<string, number>,
  drives: SomaticDrives
): {
  waistStiffnessKp: number;
  shoulderStiffnessKp: number;
  neckPitchRestDeg: number;
  waistPitchRestDeg: number;
  strideFrequencyMultiplier: number;
} {
  const zest = virtues['zest'] ?? 0.5;
  const bravery = virtues['bravery'] ?? 0.5;
  const selfReg = virtues['self-regulation'] ?? 0.5;
  const hope = virtues['hope'] ?? 0.5;
  const humility = virtues['humility'] ?? 0.5;
  const prudence = virtues['prudence'] ?? 0.5;
  const curiosity = virtues['curiosity'] ?? 0.5;

  const waistStiffnessKp = Number(
    Math.max(0.25, Math.min(0.98, 0.45 + 0.35 * selfReg + 0.25 * zest - 0.35 * drives.muscularFatigue)).toFixed(2)
  );
  const shoulderStiffnessKp = Number(
    Math.max(0.25, Math.min(0.98, 0.40 + 0.35 * bravery + 0.20 * selfReg - 0.30 * drives.muscularFatigue)).toFixed(2)
  );

  // Positive pitch leans forward/down (slump); negative lifts sternum/chin
  const waistPitchRestDeg = Number(
    (12.0 * (1.0 - hope) * (0.5 + drives.muscularFatigue) - 4.0 * (bravery - humility)).toFixed(1)
  );
  const neckPitchRestDeg = Number(
    (8.0 * (1.0 - hope) - 5.0 * (curiosity - 0.5)).toFixed(1)
  );
  const strideFrequencyMultiplier = Number(
    Math.max(0.65, Math.min(1.45, 1.0 + 0.28 * (zest - prudence) - 0.20 * drives.muscularFatigue)).toFixed(2)
  );

  return {
    waistStiffnessKp,
    shoulderStiffnessKp,
    neckPitchRestDeg,
    waistPitchRestDeg,
    strideFrequencyMultiplier,
  };
}
