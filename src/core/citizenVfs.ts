/**
 * Citizen VFS Workspace & Dual-Plane State Store (DCR-2.1.22-01 & DCR-2.2.40-01)
 * Manages the address-resolved Virtual File System (`citizen.[id].{mind,body,daemon}.*`)
 * with zero-cost IndexedDB persistence and live 60Hz Hot Somatic state projection.
 */

import {
  VIA_VIRTUE_DEFINITIONS,
  JungianFunction,
  SomaticDrives,
  StressOperatorState,
  normalizeToHypersphere,
  computeStressOperator,
  computePosturalTonusFromVirtues,
} from './personaCalculus';
import {
  serializeDcaDocument,
  parseDcaDocument,
  verifyTwiceFactoryManifest,
  DcaParsedDocument,
} from './dcaRuntimeGuard';

export type PostureSynergy =
  | 'walk-composed'
  | 'run-brisk'
  | 'sit-relaxed'
  | 'lean-casual'
  | 'jump-joy'
  | 'slump-exhausted'
  | 'crossed-arms-skeptical'
  | 'squat-lift'
  | 'stand-conversational-ready';

export type MotorActionType =
  | 'NAVIGATE_TO'
  | 'JOIN_QUEUE'
  | 'SIT_BENCH'
  | 'LEAN_WALL'
  | 'PICKUP_OBJECT'
  | 'CONVERSE'
  | 'IDLE_GESTURE';

export interface CorticalIntentPacket {
  packetId: string;
  citizenId: string; // e.g., "citizen.jane-do"
  timestamp: number;
  source: 'cortical.stub' | 'cortical.gemini' | 'player.whisper' | 'player.chat';
  cognitiveThought: string;
  spokenDialogue?: string;
  motorDirective: {
    action: MotorActionType;
    targetAddress: string;
    postureSynergy: PostureSynergy;
    urgencyScalar: number;
  };
  epigeneticShift?: Array<{
    virtueSlug: string;
    delta: number;
  }>;
  memoryEntry?: {
    stratum: 'sensory' | 'episodic' | 'semantic' | 'biographical';
    slug: string;
    summary: string;
    emotionalValence: number;
  };
}

export interface JointOverrideState {
  neckPitchDeg: number;
  neckYawDeg: number;
  waistPitchDeg: number;
  waistYawDeg: number;
  shoulderLeftPitchDeg: number;
  shoulderLeftRollDeg: number;
  shoulderRightPitchDeg: number;
  shoulderRightRollDeg: number;
  elbowLeftFlexDeg: number;
  elbowRightFlexDeg: number;
  hipLeftPitchDeg: number;
  hipRightPitchDeg: number;
  kneeLeftFlexDeg: number;
  kneeRightFlexDeg: number;
}

export interface CitizenAppearanceConfig {
  renderMode: 'attire' | 'mannequin';
  skinToneHex: string;
  hairStyle: 'chin-length-parted-bob' | 'cropped-textured' | 'swept-wave' | 'bun-architect';
  hairColorHex: string;
  torsoGarment: 'fitted-polo-collared' | 'flannel-work-shirt' | 'architect-turtleneck' | 'coastal-windbreaker';
  torsoColorHex: string;
  legGarment: 'high-waist-ankle-denim' | 'slate-chino-pants' | 'tailored-trousers';
  legColorHex: string;
  footwearColorHex: string;
}

export interface CitizenBiometrics {
  statureHeight: number; // [-1..1] -> 0.0 = 1.72m 1:1 human baseline
  headScale: number;
  shoulderWidth: number;
  chestScale: number;
  waistWidth: number;
  pelvisWidth: number;
  armLength: number;
  armThickness: number;
  legLength: number;
  legThickness: number;
  browHeight?: number; // [-1..1] Sims 4 brow height/arch
  eyeScale?: number;   // [-1..1] Sims 4 eye scale/openness
  jawWidth?: number;   // [-1..1] Sims 4 jaw/cheekbone definition
  smileCurve?: number; // [-1..1] Sims 4 smile/smirk expression
  muscleDef?: number;  // [-1..1] Sims 4 muscle definition dial
}

export interface CitizenMemoryItem {
  address: string;
  stratum: 'sensory' | 'episodic' | 'semantic' | 'biographical';
  slug: string;
  timestamp: string;
  summary: string;
  emotionalValence: number; // [-1..1]
}

export interface CitizenEntity {
  id: string; // e.g., "citizen.jane-do"
  slug: string; // e.g., "jane-do"
  fullName: string;
  aliases: string[];
  occupation: string;
  homeLot: string;
  biography: string;
  jungianFunction: JungianFunction;
  needForClosureK: number;
  willpowerMagnitude: number; // ||Psi|| social mass in [0.5, 2.5]
  voiceCadence: string;
  idleHabit: string;

  // 24 VIA Character Strengths
  virtueWeights: Record<string, number>;
  unitHypersphereVector: number[];

  // Somatic & Physics State
  position: [number, number, number];
  targetPosition: [number, number, number];
  rotationY: number;
  velocity: [number, number, number];
  activePosture: PostureSynergy;
  currentAction: MotorActionType;
  targetAddress: string;
  queueSlotIndex: number | null;
  carryingPropSlug: string | null;

  // Active Somatic Masking & Cortical Bubble State
  isCorticalThinking: boolean; // Shows "• • • • •" bubble
  activeSpeechBubble: string | null;
  speechBubbleTimer: number;
  lastCognitiveThought: string;

  // Appearance & 16-Segment Rig
  appearance: CitizenAppearanceConfig;
  biometrics: CitizenBiometrics;
  jointOverrides: JointOverrideState;
  stiffnessKp: {
    waist: number;
    shoulder: number;
    kneeTorqueNm: number;
  };

  // Homeostasis & Stress Operator
  drives: SomaticDrives;
  stressState: StressOperatorState;

  // Memories & Packet Log
  memories: CitizenMemoryItem[];
  packetHistory: CorticalIntentPacket[];
  leaseOwnerPeerId: string;
  lastHeartbeatTick: number;
}

export const DEFAULT_JOINT_OVERRIDES: JointOverrideState = {
  neckPitchDeg: 0,
  neckYawDeg: 0,
  waistPitchDeg: 0,
  waistYawDeg: 0,
  shoulderLeftPitchDeg: 0,
  shoulderLeftRollDeg: 6,
  shoulderRightPitchDeg: 0,
  shoulderRightRollDeg: -6,
  elbowLeftFlexDeg: 14,
  elbowRightFlexDeg: 14,
  hipLeftPitchDeg: 0,
  hipRightPitchDeg: 0,
  kneeLeftFlexDeg: 4,
  kneeRightFlexDeg: 4,
};

export const BREMERTON_SMART_TARGETS: Array<{
  address: string;
  label: string;
  category: 'lot' | 'bench' | 'queue' | 'prop' | 'vista';
  position: [number, number, number];
  defaultAction: MotorActionType;
  defaultPosture: PostureSynergy;
  description: string;
}> = [
  {
    address: 'lot.bremerton.burwell-240',
    label: '240 Burwell St (Mid-Rise Lofts)',
    category: 'lot',
    position: [-4.5, 0, -3.8],
    defaultAction: 'NAVIGATE_TO',
    defaultPosture: 'walk-composed',
    description: '1:1 scale 3-story terracotta & warm brick corner building (14m x 11.4m) with active plumbob.',
  },
  {
    address: 'prop.bench.waterfront-01',
    label: 'Waterfront Boardwalk Bench',
    category: 'bench',
    position: [-9.8, 0, 9.2],
    defaultAction: 'SIT_BENCH',
    defaultPosture: 'sit-relaxed',
    description: 'Timber slat bench overlooking the green-and-white Bremerton passenger ferries.',
  },
  {
    address: 'prop.bench.burwell-plaza',
    label: 'Harborside Plaza Bench',
    category: 'bench',
    position: [6.4, 0, 4.8],
    defaultAction: 'SIT_BENCH',
    defaultPosture: 'sit-relaxed',
    description: 'Shaded plaza bench beside the evergreens and Sinclair Cafe terrace.',
  },
  {
    address: 'world.queue.ferry-terminal-line',
    label: 'Ferry Terminal Pedestrian Queue',
    category: 'queue',
    position: [-14.5, 0, 7.8],
    defaultAction: 'JOIN_QUEUE',
    defaultPosture: 'crossed-arms-skeptical',
    description: 'Orderly commuter queue boarding the Washington State Ferry Slip 1 concourse.',
  },
  {
    address: 'lot.bremerton.suspension-bridge',
    label: 'Manette Steel Arch Bridge',
    category: 'vista',
    position: [18.5, 0, 2.2],
    defaultAction: 'LEAN_WALL',
    defaultPosture: 'lean-casual',
    description: 'Green structural steel truss bridge spanning the waterway toward the eastern overlook.',
  },
  {
    address: 'prop.parcel.burwell-sidewalk',
    label: 'Dropped Archival Crate',
    category: 'prop',
    position: [1.2, 0, 5.2],
    defaultAction: 'PICKUP_OBJECT',
    defaultPosture: 'squat-lift',
    description: 'Heavy parcel requiring knee and elbow torque (τ_max) to squat and lift.',
  },
  {
    address: 'lot.bremerton.harborside-marina',
    label: 'Harborside Sailboat Marina',
    category: 'vista',
    position: [12.5, 0, 9.4],
    defaultAction: 'NAVIGATE_TO',
    defaultPosture: 'walk-composed',
    description: 'Peaceful civilian pleasure sailboat marina slip along the cedar boardwalk.',
  },
];

export function createCanonicalCitizens(localPeerId: string): CitizenEntity[] {
  const presets: Array<{
    slug: string;
    fullName: string;
    aliases: string[];
    occupation: string;
    homeLot: string;
    biography: string;
    jungianFunction: JungianFunction;
    needForClosureK: number;
    willpowerMagnitude: number;
    voiceCadence: string;
    idleHabit: string;
    position: [number, number, number];
    activePosture: PostureSynergy;
    currentAction: MotorActionType;
    targetAddress: string;
    appearance: CitizenAppearanceConfig;
    biometrics: CitizenBiometrics;
    virtueOverrides: Record<string, number>;
    initialThought: string;
    initialMemories: Array<{
      stratum: CitizenMemoryItem['stratum'];
      slug: string;
      summary: string;
      emotionalValence: number;
    }>;
  }> = [
    {
      slug: 'jane-do',
      fullName: 'Jane Do',
      aliases: ['Jane Doe', 'citizen.jane-do', 'citizen.jane-doe'],
      occupation: 'Urban Archivist & Sonder Resident',
      homeLot: 'lot.bremerton.burwell-240',
      biography:
        'Canonical base archetype of Sonder Avenue residing at 240 Burwell St. Observant, composed, and deeply attuned to the quiet inner lives of passersby along the Bremerton waterfront.',
      jungianFunction: 'Si',
      needForClosureK: 0.64,
      willpowerMagnitude: 1.45,
      voiceCadence: 'warm-observant-measured',
      idleHabit: 'crossed-arms-thoughtful',
      position: [-4.2, 0, -3.4],
      activePosture: 'stand-conversational-ready',
      currentAction: 'NAVIGATE_TO',
      targetAddress: 'lot.bremerton.burwell-240',
      appearance: {
        renderMode: 'attire',
        skinToneHex: '#DDA384',
        hairStyle: 'chin-length-parted-bob',
        hairColorHex: '#3B231A',
        torsoGarment: 'fitted-polo-collared',
        torsoColorHex: '#B86B5A', // Terracotta rose polo from reference turnaround sheet
        legGarment: 'high-waist-ankle-denim',
        legColorHex: '#182032',   // Deep dark cuffed denim from reference sheet
        footwearColorHex: '#5A4234', // Umber brown sneakers with off-white sole
      },
      biometrics: {
        statureHeight: 0.0,
        headScale: 0.0,
        shoulderWidth: -0.04,
        chestScale: -0.05,
        waistWidth: -0.10,
        pelvisWidth: 0.05,
        armLength: 0.0,
        armThickness: -0.05,
        legLength: 0.02,
        legThickness: 0.0,
      },
      virtueOverrides: {
        curiosity: 0.86,
        judgment: 0.82,
        'love-of-learning': 0.80,
        'social-intelligence': 0.79,
        fairness: 0.81,
        'self-regulation': 0.88,
        prudence: 0.76,
        'appreciation-of-beauty': 0.84,
        hope: 0.78,
        humor: 0.72,
      },
      initialThought:
        'The 57°F marine layer over 240 Burwell St makes the ferry horn sound closer than usual.',
      initialMemories: [
        {
          stratum: 'biographical',
          slug: 'moving-to-240-burwell-st',
          summary: 'Moved into the corner loft at 240 Burwell St overlooking the Bremerton ferry slips.',
          emotionalValence: 0.75,
        },
        {
          stratum: 'episodic',
          slug: 'morning-commuter-queue-observation',
          summary: 'Watched twelve commuters line up in silence beside the parked sedan and evergreens.',
          emotionalValence: 0.42,
        },
        {
          stratum: 'semantic',
          slug: 'bremerton-waterfront-topology',
          summary: 'Knows the exact schedule of the Puget Sound ferries, boardwalk benches, and Manette bridge.',
          emotionalValence: 0.60,
        },
      ],
    },
    {
      slug: 'marcus-vance',
      fullName: 'Marcus Vance',
      aliases: ['citizen.marcus-vance'],
      occupation: 'Puget Ferry Chief Quartermaster',
      homeLot: 'lot.bremerton.harborside-marina',
      biography:
        'A boisterous, high-zest maritime quartermaster who treats every sidewalk delay like an unscripted sitcom episode.',
      jungianFunction: 'Ne',
      needForClosureK: 0.32,
      willpowerMagnitude: 1.65,
      voiceCadence: 'animated-witty-exclamatory',
      idleHabit: 'expressive-hand-talking',
      position: [-9.8, 0, 9.2],
      activePosture: 'sit-relaxed',
      currentAction: 'SIT_BENCH',
      targetAddress: 'prop.bench.waterfront-01',
      appearance: {
        renderMode: 'attire',
        skinToneHex: '#C68B69',
        hairStyle: 'cropped-textured',
        hairColorHex: '#221C19',
        torsoGarment: 'coastal-windbreaker',
        torsoColorHex: '#2B5B6C',
        legGarment: 'slate-chino-pants',
        legColorHex: '#334155',
        footwearColorHex: '#3E2F26',
      },
      biometrics: {
        statureHeight: 0.18,
        headScale: 0.0,
        shoulderWidth: 0.22,
        chestScale: 0.16,
        waistWidth: 0.05,
        pelvisWidth: 0.04,
        armLength: 0.08,
        armThickness: 0.14,
        legLength: 0.06,
        legThickness: 0.10,
      },
      virtueOverrides: {
        zest: 0.92,
        humor: 0.90,
        bravery: 0.85,
        creativity: 0.81,
        leadership: 0.78,
        'self-regulation': 0.34,
        prudence: 0.29,
      },
      initialThought:
        'Why does everyone stand in the ferry line 20 minutes before the ramp even drops?',
      initialMemories: [
        {
          stratum: 'episodic',
          slug: 'coffee-spill-on-ferry-deck',
          summary: 'Debated Jane Do for ten minutes about the unwritten rules of boardwalk bench etiquette.',
          emotionalValence: 0.68,
        },
      ],
    },
    {
      slug: 'elena-rostova',
      fullName: 'Elena Rostova',
      aliases: ['citizen.elena-rostova'],
      occupation: 'Structural Bridge Acoustic Engineer',
      homeLot: 'lot.bremerton.suspension-bridge',
      biography:
        'Hyper-analytical engineer obsessed with steel truss harmonics, fairness in public queues, and precise schedules.',
      jungianFunction: 'Ti',
      needForClosureK: 0.88,
      willpowerMagnitude: 1.55,
      voiceCadence: 'precise-dry-analytical',
      idleHabit: 'crossed-arms-skeptical',
      position: [-14.5, 0, 7.8],
      activePosture: 'crossed-arms-skeptical',
      currentAction: 'JOIN_QUEUE',
      targetAddress: 'world.queue.ferry-terminal-line',
      appearance: {
        renderMode: 'attire',
        skinToneHex: '#E8BFA2',
        hairStyle: 'bun-architect',
        hairColorHex: '#5C3A28',
        torsoGarment: 'architect-turtleneck',
        torsoColorHex: '#3F4E4F',
        legGarment: 'tailored-trousers',
        legColorHex: '#1E293B',
        footwearColorHex: '#27272A',
      },
      biometrics: {
        statureHeight: 0.08,
        headScale: 0.0,
        shoulderWidth: 0.0,
        chestScale: -0.06,
        waistWidth: -0.12,
        pelvisWidth: 0.0,
        armLength: 0.05,
        armThickness: -0.08,
        legLength: 0.08,
        legThickness: -0.05,
      },
      virtueOverrides: {
        judgment: 0.94,
        fairness: 0.91,
        prudence: 0.89,
        'self-regulation': 0.87,
        perseverance: 0.84,
        humor: 0.28,
        zest: 0.38,
      },
      initialThought:
        'If one person steps out of the ferry queue alignment, the entire sidewalk throughput drops by 14%.',
      initialMemories: [
        {
          stratum: 'episodic',
          slug: 'queue-spacing-dispute',
          summary: 'Measured exact 1.1-meter interpersonal intervals along the terminal walkway.',
          emotionalValence: -0.15,
        },
      ],
    },
    {
      slug: 'arthur-pendleton',
      fullName: 'Arthur Pendleton',
      aliases: ['citizen.arthur-pendleton'],
      occupation: 'Master Wooden Boatwright',
      homeLot: 'lot.bremerton.burwell-240',
      biography:
        'Gentle, nostalgic long-time resident who crafts cedar pleasure sloops at the Harborside Marina and greets every neighbor.',
      jungianFunction: 'Fe',
      needForClosureK: 0.52,
      willpowerMagnitude: 1.25,
      voiceCadence: 'folksy-patient-encouraging',
      idleHabit: 'warm-nodding-stance',
      position: [6.4, 0, 4.8],
      activePosture: 'sit-relaxed',
      currentAction: 'SIT_BENCH',
      targetAddress: 'prop.bench.burwell-plaza',
      appearance: {
        renderMode: 'attire',
        skinToneHex: '#D9A78B',
        hairStyle: 'swept-wave',
        hairColorHex: '#CBD5E1',
        torsoGarment: 'flannel-work-shirt',
        torsoColorHex: '#8C4A3E',
        legGarment: 'slate-chino-pants',
        legColorHex: '#475569',
        footwearColorHex: '#4A3728',
      },
      biometrics: {
        statureHeight: -0.10,
        headScale: 0.02,
        shoulderWidth: 0.12,
        chestScale: 0.18,
        waistWidth: 0.24,
        pelvisWidth: 0.10,
        armLength: -0.04,
        armThickness: 0.08,
        legLength: -0.06,
        legThickness: 0.06,
      },
      virtueOverrides: {
        kindness: 0.93,
        forgiveness: 0.95,
        gratitude: 0.91,
        humility: 0.88,
        perspective: 0.86,
        love: 0.85,
      },
      initialThought:
        'Nothing beats watching the cedar sailboats rock gently in Sinclair Inlet with a warm thermos.',
      initialMemories: [
        {
          stratum: 'biographical',
          slug: 'forty-years-at-puget-sound-marina',
          summary: 'Spent four decades restoring classic wooden sailboats beside the Burwell St boardwalk.',
          emotionalValence: 0.88,
        },
      ],
    },
  ];

  return presets.map((p, idx) => {
    const baseWeights: Record<string, number> = {};
    VIA_VIRTUE_DEFINITIONS.forEach((def) => {
      baseWeights[def.slug] = p.virtueOverrides[def.slug] ?? 0.52;
    });
    const { unitVector, displayWeights } = normalizeToHypersphere(baseWeights);
    const drives: SomaticDrives = {
      thermalComfort: 0.84,
      metabolicEnergy: 0.86 - idx * 0.05,
      socialEquilibrium: 0.78,
      muscularFatigue: 0.14 + idx * 0.04,
    };
    const stressState = computeStressOperator(drives, 57, 0);
    const tonus = computePosturalTonusFromVirtues(displayWeights, drives);

    const citizenId = `citizen.${p.slug}`;
    return {
      id: citizenId,
      slug: p.slug,
      fullName: p.fullName,
      aliases: p.aliases,
      occupation: p.occupation,
      homeLot: p.homeLot,
      biography: p.biography,
      jungianFunction: p.jungianFunction,
      needForClosureK: p.needForClosureK,
      willpowerMagnitude: p.willpowerMagnitude,
      voiceCadence: p.voiceCadence,
      idleHabit: p.idleHabit,
      virtueWeights: displayWeights,
      unitHypersphereVector: unitVector,
      position: [...p.position],
      targetPosition: [...p.position],
      rotationY: idx * 0.8,
      velocity: [0, 0, 0],
      activePosture: p.activePosture,
      currentAction: p.currentAction,
      targetAddress: p.targetAddress,
      queueSlotIndex: p.currentAction === 'JOIN_QUEUE' ? 0 : null,
      carryingPropSlug: null,
      isCorticalThinking: false,
      activeSpeechBubble: null,
      speechBubbleTimer: 0,
      lastCognitiveThought: p.initialThought,
      appearance: p.appearance,
      biometrics: p.biometrics,
      jointOverrides: {
        ...DEFAULT_JOINT_OVERRIDES,
        neckPitchDeg: tonus.neckPitchRestDeg,
        waistPitchDeg: tonus.waistPitchRestDeg,
      },
      stiffnessKp: {
        waist: tonus.waistStiffnessKp,
        shoulder: tonus.shoulderStiffnessKp,
        kneeTorqueNm: 110,
      },
      drives,
      stressState,
      memories: p.initialMemories.map((m) => ({
        address: `${citizenId}.mind.memory.${m.stratum}.${m.slug}`,
        stratum: m.stratum,
        slug: m.slug,
        timestamp: '2026-10-14T08:00:00Z',
        summary: m.summary,
        emotionalValence: m.emotionalValence,
      })),
      packetHistory: [],
      leaseOwnerPeerId: localPeerId,
      lastHeartbeatTick: Date.now(),
    };
  });
}

/**
 * Generates the complete address-resolved VFS file map (`citizen.[id].{mind,body,daemon}.*.md`)
 * for a CitizenEntity in strict compliance with DCR-2.2.13-01 and DCR-2.2.40-01.
 */
export function buildCitizenVfsFiles(citizen: CitizenEntity): Record<string, DcaParsedDocument> {
  const files: Record<string, DcaParsedDocument> = {};
  const prefix = citizen.id; // e.g., "citizen.jane-do"
  const tickIso = new Date(citizen.lastHeartbeatTick).toISOString();

  const registerDoc = (
    address: string,
    frontmatter: Record<string, unknown>,
    summary: string,
    body: string
  ) => {
    const fm = {
      address,
      citizen_slug: citizen.slug,
      last_heartbeat_tick: tickIso,
      ...frontmatter,
    };
    const rawContent = serializeDcaDocument(fm, summary, body);
    files[address] = {
      address,
      frontmatter: fm,
      progressiveSummary: summary,
      bodyMarkdown: body,
      rawContent,
    };
  };

  // 1. MIND ROOT INDEX
  registerDoc(
    `${prefix}.mind.index`,
    {
      plane: 'mind',
      category: 'index',
      full_name: citizen.fullName,
      aliases: citizen.aliases,
      jungian_function: citizen.jungianFunction,
      need_for_closure_k: citizen.needForClosureK,
      willpower_magnitude_psi: citizen.willpowerMagnitude,
      sanity_determinant_det_s: citizen.stressState.sanityDeterminant,
    },
    `${citizen.fullName} (${citizen.occupation}) — Composite S^23 hypersphere mind index anchored at ${citizen.homeLot}.`,
    `## Cortical Mind Telemetry\n- **Active Thought**: "${citizen.lastCognitiveThought}"\n- **Dominant Cognitive Gate**: \`${citizen.jungianFunction}\` (Need for Closure K = ${citizen.needForClosureK})\n- **Agentic Willpower (||Ψ||)**: ${citizen.willpowerMagnitude.toFixed(2)}`
  );

  // 2. ALL 24 VIA CHARACTER STRENGTHS & VIRTUES (citizen.[id].mind.soul.<domain>.<slug>)
  for (const def of VIA_VIRTUE_DEFINITIONS) {
    const weight = citizen.virtueWeights[def.slug] ?? 0.5;
    const eigen = citizen.stressState.diagonalEigenvalues[def.index] ?? 1.0;
    const effective = Number(Math.min(0.99, weight * eigen).toFixed(3));
    const addr = `${prefix}.mind.soul.${def.domain}.${def.slug}`;

    registerDoc(
      addr,
      {
        plane: 'mind',
        category: 'soul',
        virtue_domain: def.domain,
        strength_slug: def.slug,
        vector_index: def.index,
        weight_baseline: weight,
        stress_eigenvalue: eigen,
        weight_effective: effective,
        unit_hypersphere_coord: Number((citizen.unitHypersphereVector[def.index] ?? 0.2).toFixed(4)),
      },
      `${citizen.fullName}'s ${def.label} (${def.domainLabel}) sits at ${weight.toFixed(2)} baseline (effective ${effective.toFixed(2)} under current Stress Operator Ŝ).`,
      `## Somatic & Cognitive Expression\n- **Trait Definition**: ${def.description}\n- **Postural Tonus Coupling**: ${def.posturalEffect}\n- **Symbolic Predicate**: \`VirtueWeight(${def.slug}, ${effective.toFixed(2)})\``
    );
  }

  // 3. PERSONA FILES (identity, voice, quirks)
  registerDoc(
    `${prefix}.mind.persona.identity`,
    {
      plane: 'mind',
      category: 'persona',
      full_name: citizen.fullName,
      occupation: citizen.occupation,
      home_lot: citizen.homeLot,
      voice_cadence: citizen.voiceCadence,
      idle_habit: citizen.idleHabit,
    },
    citizen.biography,
    `## Biographical Anchor\n- **Home Lot**: \`${citizen.homeLot}\`\n- **Voice Cadence**: \`${citizen.voiceCadence}\`\n- **Signature Idle Habit**: \`${citizen.idleHabit}\``
  );

  // 4. STRATIFIED MEMORY FILES (sensory, episodic, semantic, biographical)
  for (const mem of citizen.memories) {
    registerDoc(
      mem.address,
      {
        plane: 'mind',
        category: 'memory',
        stratum: mem.stratum,
        emotional_valence: mem.emotionalValence,
        recorded_at: mem.timestamp,
      },
      mem.summary,
      `## Stratified Memory Record (\`DCR-2.2.21-01\`)\n- **Stratum**: \`${mem.stratum}\`\n- **Emotional Valence**: ${mem.emotionalValence >= 0 ? '+' : ''}${mem.emotionalValence.toFixed(2)} (used for Mood-State Cosine Retrieval)`
    );
  }

  // 4B. HARMONIZED MASTER soul.md (L0 -> L4 Progressive Disclosure Psychometric Profile)
  const topVirtuesList = VIA_VIRTUE_DEFINITIONS.map((def) => ({
    name: def.label,
    slug: def.slug,
    domain: def.domain,
    weight: citizen.virtueWeights[def.slug] ?? 0.5,
  })).sort((a, b) => b.weight - a.weight).slice(0, 5);

  const soulMarkdown = `# [SCHEMA: AGENT-SOUL-V2]
# Entity: ${citizen.id}
# Pointer Resolution: DurableObject://storage/citizens/${citizen.slug}/soul.json

## [00_INDEX] Addressable Pointers
- root: ${citizen.id}
- memory_fs: fs://workspace/${citizen.slug}/memory.md
- virtue_matrix: vector://embeddings/${citizen.slug}/virtues_24
- active_daemon: ${citizen.id}.daemon

## [L0] Core Identity & Ontological Anchor
- **Address**: \`${citizen.id}.mind.soul.L0.IdentityAnchor.detached-hedonic-observer\`
- **Clinical Baseline**: High-Functioning Autonomous Intelligence comorbid with mild Benign Observational Narcissism and Selective Socio-Emotional Avoidance.
- **Homeostatic Drive**: Preservation of psychological autonomy, domestic order, and somatic equilibrium at ${citizen.homeLot}.

## [L1] Psychometric Matrix & 24-Virtue Hypersphere (S^23)
- **Vector State**: \`vector://embeddings/${citizen.slug}/virtues_24\`
- **Dominant Strengths**: ${topVirtuesList.map((v) => `\`${v.slug}\` (${v.weight.toFixed(2)})`).join(', ')}
- **Five-Factor Baseline**:
  - Openness: 72/100 (\`${citizen.id}.mind.soul.L1.TraitOpenness.observational-curiosity\`)
  - Conscientiousness: 68/100 (\`${citizen.id}.mind.soul.L1.TraitConscientiousness.spatial-symmetry\`)
  - Extraversion: 64/100 (\`${citizen.id}.mind.soul.L1.TraitExtraversion.performative-gregariousness\`)
  - Agreeableness: 42/100 (\`${citizen.id}.mind.soul.L1.TraitAgreeableness.analytical-candor\`)
  - Neuroticism: 28/100 (\`${citizen.id}.mind.soul.L1.TraitNeuroticism.buffered-stability\`)

## [L2] Cognitive Schemas & Defense Mechanisms
- **Primary Defense**: \`${citizen.id}.mind.soul.L2.DefenseMechanisms.intellectualization-via-irony\`
  Converts emotional pressure and environmental absurdity into structured observations, stripping external shocks of somatic disruption.
- **Attachment Schema**: \`${citizen.id}.mind.soul.L2.AttachmentStyle.dismissive-avoidant-micro-boundary\`
  Vigilantly protects private lot boundaries while welcoming communal interaction at designated public smart targets.
- **Distortion Schema**: \`${citizen.id}.mind.soul.L2.CognitiveDistortion.tactile-aesthetic-absolutism\`
  Requires spatial alignment between street curbs, benches, and sidewalk queues.

## [L3] Interpersonal & Linguistic Signatures
- **Pragmatic Register**: \`${citizen.id}.mind.soul.L3.Linguistics.hyper-analytical-dry-wit\`
- **Prosodic Contour**: \`${citizen.id}.mind.soul.L3.Prosody.${citizen.voiceCadence}\`
- **Kinesics**: \`${citizen.id}.mind.soul.L3.Kinesics.${citizen.idleHabit}\`

## [L4] Episodic Behavioral Triggers (State Machine)
### Trigger.01: [Boundary_Invasion]
- condition: "distance(environmental_agent, self) < 0.6 AND uninvited"
- execution_path:
  1. Read: \`${citizen.id}.mind.soul.L2.DefenseMechanisms.intellectualization-via-irony\`
  2. Emit: Socratic question via \`${citizen.id}.mind.soul.L3.Linguistics\`
  3. Action: Pivot to \`prop.bench.waterfront-01\`
### Trigger.02: [Status_Threat_Or_Slight]
- condition: "perceived_disrespect >= 0.65"
- execution_path:
  1. Engage Stress Operator Ŝ with diagonal eigenvalue damping
  2. Emit \`CorticalIntentPacket\` with action \`CONVERSE\` and posture \`crossed-arms-skeptical\`
### Trigger.03: [Mundane_System_Disruption]
- condition: "queue_delay_seconds > 45"
- execution_path:
  1. Inspect ferry schedule and complain about Puget Sound maritime transit pacing
`;

  registerDoc(
    `${prefix}.mind.soul.master`,
    {
      plane: 'mind',
      category: 'soul',
      schema_type: 'agent.soul.architecture',
      entity_id: citizen.id,
      version: '2.2.0',
      vector_virtues: `vector://embeddings/${citizen.slug}/virtues_24`,
      memory_fs: `fs://workspace/${citizen.slug}/memory.md`,
      active_daemon: `${citizen.id}.daemon`,
      active_trigger: null,
      affective_valence: citizen.stressState.sanityDeterminant,
      defensive_posture: 'intellectualization-via-irony',
    },
    `Canonical Progressive Disclosure Psychometric Soul Profile for ${citizen.fullName} (L0 -> L4).`,
    soulMarkdown
  );

  // 4C. HARMONIZED MASTER memory.md (Stratified Memory Ledger with Vector Links)
  const memoryLogMarkdown = `# [SCHEMA: AGENT-MEMORY-V2]
# Entity: ${citizen.id}
# Storage Resolution: fs://workspace/${citizen.slug}/memory.md

## Stratified Memory Stream
${citizen.memories
  .map(
    (m, i) =>
      `### [M-${i + 1}] \`${m.stratum}\` — \`${m.slug}\`
- **Address**: \`${m.address}\`
- **Recorded**: \`${m.timestamp}\`
- **Emotional Valence**: \`${m.emotionalValence >= 0 ? '+' : ''}${m.emotionalValence.toFixed(2)}\`
- **Summary**: "${m.summary}"
- **Vector Similarity Hash**: \`vec-${m.slug.slice(0, 8)}-${Math.abs(Math.round(m.emotionalValence * 1000))}\`
`
  )
  .join('\n')}
`;

  registerDoc(
    `${prefix}.mind.memory.master`,
    {
      plane: 'mind',
      category: 'memory',
      schema_type: 'agent.memory.architecture',
      entity_id: citizen.id,
      version: '2.2.0',
      total_records: citizen.memories.length,
      last_recorded: citizen.memories[0]?.timestamp || tickIso,
    },
    `Stratified episodic, semantic, and sensory memory ledger for ${citizen.fullName}.`,
    memoryLogMarkdown
  );

  // 5. SOMATIC BODY FILES (16-segment armature, joints, wardrobe, homeostasis)
  registerDoc(
    `${prefix}.body.appearance.wardrobe`,
    {
      plane: 'body',
      category: 'appearance',
      render_mode: citizen.appearance.renderMode,
      skin_tone: citizen.appearance.skinToneHex,
      hair_style: citizen.appearance.hairStyle,
      hair_color: citizen.appearance.hairColorHex,
      torso_garment: citizen.appearance.torsoGarment,
      torso_color: citizen.appearance.torsoColorHex,
      leg_garment: citizen.appearance.legGarment,
      leg_color: citizen.appearance.legColorHex,
      footwear_color: citizen.appearance.footwearColorHex,
    },
    `Visual wardrobe & turnaround specification for ${citizen.fullName} (mode: ${citizen.appearance.renderMode}).`,
    `## 16-Segment Parametric Shell Wardrobe\nSkinned directly to the 16-part mannequin armature with normalized proportion clamping (\`DCR-2.2.38-01\`).`
  );

  registerDoc(
    `${prefix}.body.homeostasis.drives`,
    {
      plane: 'body',
      category: 'homeostasis',
      thermal_comfort: citizen.drives.thermalComfort,
      metabolic_energy: citizen.drives.metabolicEnergy,
      social_equilibrium: citizen.drives.socialEquilibrium,
      muscular_fatigue: citizen.drives.muscularFatigue,
      sanity_determinant: citizen.stressState.sanityDeterminant,
    },
    `Homeostatic equilibrium tensor driving the diagonal Stress Matrix Ŝ (det(Ŝ) = ${citizen.stressState.sanityDeterminant.toFixed(2)}).`,
    `## Degamed Somatic Equilibrium (\`DCR-2.1.25-01\`)\nSomatic drives modulate spinal stiffness ($k_p$) and eigenvalue sensitivity rather than acting as arbitrary game-over bars.`
  );

  const jointNodes: Array<{
    subpath: string;
    label: string;
    dof: string;
    angles: Record<string, number>;
    torqueNm: number;
    kp: number;
  }> = [
    {
      subpath: 'head.neck-joint',
      label: 'Cervical Neck Joint (Head Gaze & Pitch)',
      dof: 'spherical_3dof',
      angles: { pitch_deg: citizen.jointOverrides.neckPitchDeg, yaw_deg: citizen.jointOverrides.neckYawDeg },
      torqueNm: 28,
      kp: citizen.stiffnessKp.waist,
    },
    {
      subpath: 'torso.waist-joint',
      label: 'Central Core Waist Articulation Joint',
      dof: 'spherical_3dof',
      angles: { pitch_deg: citizen.jointOverrides.waistPitchDeg, yaw_deg: citizen.jointOverrides.waistYawDeg },
      torqueNm: 145,
      kp: citizen.stiffnessKp.waist,
    },
    {
      subpath: 'arms.shoulder-joint',
      label: 'Bilateral Shoulder Ball Joints (.left / .right)',
      dof: 'spherical_3dof',
      angles: {
        left_pitch_deg: citizen.jointOverrides.shoulderLeftPitchDeg,
        left_roll_deg: citizen.jointOverrides.shoulderLeftRollDeg,
        right_pitch_deg: citizen.jointOverrides.shoulderRightPitchDeg,
        right_roll_deg: citizen.jointOverrides.shoulderRightRollDeg,
      },
      torqueNm: 65,
      kp: citizen.stiffnessKp.shoulder,
    },
    {
      subpath: 'arms.elbow-joint',
      label: 'Bilateral Elbow Hinge Joints (.left / .right)',
      dof: 'hinge_1dof',
      angles: {
        left_flex_deg: citizen.jointOverrides.elbowLeftFlexDeg,
        right_flex_deg: citizen.jointOverrides.elbowRightFlexDeg,
      },
      torqueNm: 52,
      kp: citizen.stiffnessKp.shoulder,
    },
    {
      subpath: 'legs.hip-joint',
      label: 'Bilateral Pelvic Hip Sockets (.left / .right)',
      dof: 'spherical_3dof',
      angles: {
        left_pitch_deg: citizen.jointOverrides.hipLeftPitchDeg,
        right_pitch_deg: citizen.jointOverrides.hipRightPitchDeg,
      },
      torqueNm: 160,
      kp: citizen.stiffnessKp.waist,
    },
    {
      subpath: 'legs.knee-joint',
      label: 'Bilateral Knee Hinge Joints (.left / .right)',
      dof: 'hinge_1dof',
      angles: {
        left_flex_deg: citizen.jointOverrides.kneeLeftFlexDeg,
        right_flex_deg: citizen.jointOverrides.kneeRightFlexDeg,
      },
      torqueNm: citizen.stiffnessKp.kneeTorqueNm,
      kp: citizen.stiffnessKp.waist,
    },
  ];

  for (const jn of jointNodes) {
    registerDoc(
      `${prefix}.body.${jn.subpath}`,
      {
        plane: 'body',
        category: jn.subpath.split('.')[0],
        joint_type: jn.dof,
        strength_max_torque_nm: jn.torqueNm,
        stiffness_kp: jn.kp,
        active_synergy: citizen.activePosture,
        ...jn.angles,
      },
      `${jn.label} — Active synergy: ${citizen.activePosture} (kp = ${jn.kp}, max torque = ${jn.torqueNm} N·m).`,
      `## Bilateral Joint Telemetry\nControlled at 60Hz by the somatic PD solver and overridden in real time via the Character Factory Studio.`
    );
  }

  // 6. DAEMON FILES (status, heartbeat, stream buses)
  registerDoc(
    `${prefix}.daemon.heartbeat`,
    {
      plane: 'daemon',
      category: 'heartbeat',
      lease_owner_peer: citizen.leaseOwnerPeerId,
      heartbeat_interval_ms: 100,
      tripwire_det_s_threshold: 0.45,
      active_motor_action: citizen.currentAction,
      target_address: citizen.targetAddress,
    },
    `Autonomic 10Hz neurosymbolic daemon (${prefix}.daemon) leased by ${citizen.leaseOwnerPeerId}.`,
    `## Active Daemon Loop (\`DCR-2.2.18-01\` & \`DCR-2.2.39-01\`)\n- **Current Motor Directive**: \`${citizen.currentAction}\` $\\rightarrow$ \`${citizen.targetAddress}\`\n- **Active Posture Synergy**: \`${citizen.activePosture}\``
  );

  registerDoc(
    `${prefix}.daemon.stream.cortical-chat`,
    {
      plane: 'daemon',
      category: 'stream',
      is_cortical_thinking: citizen.isCorticalThinking,
      last_spoken_dialogue: citizen.activeSpeechBubble || '(quiet)',
      packet_count: citizen.packetHistory.length,
    },
    `Mind-to-Body CorticalIntentPacket stream for ${citizen.fullName}.`,
    `## Recent CorticalIntentPacket History\n${
      citizen.packetHistory.length === 0
        ? '- Awaiting next heartbeat tripwire or direct player conversation.'
        : citizen.packetHistory
            .slice(0, 5)
            .map(
              (pkt) =>
                `- **[${pkt.source}]** \`${pkt.motorDirective.action}\` $\\rightarrow$ \`${pkt.motorDirective.targetAddress}\`: *"${pkt.spokenDialogue || pkt.cognitiveThought}"*`
            )
            .join('\n')
    }`
  );

  return files;
}

// ============================================================================
// ZERO-COST INDEXEDDB PERSISTENCE LAYER
// ============================================================================
const IDB_NAME = 'sonder_avenue_dca_vfs_v24_1to1';
const IDB_STORE = 'citizens_store';

function openVfsDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB unavailable'));
    }
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveCitizensToIndexedDb(citizens: CitizenEntity[]): Promise<void> {
  try {
    const db = await openVfsDb();
    const tx = db.transaction(IDB_STORE, 'readwrite');
    const store = tx.objectStore(IDB_STORE);
    for (const c of citizens) {
      store.put(c);
    }
  } catch {
    // Graceful fallback if IndexedDB is restricted in iframe mode
  }
}

export async function loadCitizensFromIndexedDb(): Promise<CitizenEntity[] | null> {
  try {
    const db = await openVfsDb();
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.getAll();
      req.onsuccess = () => {
        if (Array.isArray(req.result) && req.result.length > 0) {
          resolve(req.result as CitizenEntity[]);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function clearIndexedDbCitizens(): Promise<void> {
  try {
    const db = await openVfsDb();
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).clear();
  } catch {
    // Ignore
  }
}

export async function resetCitizensIndexedDb(localPeerId = 'peer.local.01'): Promise<CitizenEntity[]> {
  await clearIndexedDbCitizens();
  const fresh = createCanonicalCitizens(localPeerId);
  await saveCitizensToIndexedDb(fresh);
  return fresh;
}

export interface CreateCitizenFactoryInput {
  slug: string;
  fullName: string;
  roleTitle: string;
  jungianFunction: JungianFunction;
  heightMeters: number;
  proportions: {
    shoulderWidthScale: number;
    legLengthScale: number;
    torsoDepthScale: number;
    headScale: number;
    strideCadenceHz: number;
  };
  palette: {
    skinToneHex: string;
    hairHex: string;
    jacketHex: string;
    trouserHex: string;
    accentHex: string;
  };
  topVirtues: Array<{ slug: string; weight: number }>;
}

export function createCitizenFromFactory(
  input: CreateCitizenFactoryInput,
  indexOffset = 4
): CitizenEntity {
  const cleanSlug =
    input.slug
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-|-$/g, '') || `citizen-${indexOffset}`;
  const citizenId = `citizen.${cleanSlug}`;

  const rawVirtues: Record<string, number> = {};
  for (const def of VIA_VIRTUE_DEFINITIONS) {
    rawVirtues[def.slug] = 0.48;
  }
  for (const tv of input.topVirtues) {
    rawVirtues[tv.slug] = tv.weight;
  }

  const { unitVector, displayWeights } = normalizeToHypersphere(rawVirtues);
  const drives: SomaticDrives = {
    thermalComfort: 0.85,
    metabolicEnergy: 0.88,
    socialEquilibrium: 0.82,
    muscularFatigue: 0.14,
  };
  const stressState = computeStressOperator(drives, 58, 0);
  const tonus = computePosturalTonusFromVirtues(displayWeights, drives);
  const statureNorm = Math.max(-1, Math.min(1, (input.heightMeters - 1.72) / 0.2));

  return {
    id: citizenId,
    slug: cleanSlug,
    fullName: input.fullName,
    aliases: [input.fullName.split(' ')[0]],
    occupation: input.roleTitle,
    homeLot: 'lot.bremerton.burwell-240',
    biography: `${input.fullName} (${input.roleTitle}) — 1:1 metric resident of 240 Burwell St.`,
    jungianFunction: input.jungianFunction,
    needForClosureK: 0.52,
    willpowerMagnitude: 1.25,
    voiceCadence: 'measured-coastal-cadence',
    idleHabit: 'adjusts-collar-at-crosswalk',
    virtueWeights: displayWeights,
    unitHypersphereVector: unitVector,
    position: [-6.0 + (indexOffset % 4) * 2.4, 0, -5.0],
    targetPosition: [-4.0 + (indexOffset % 4) * 2.4, 0, -3.5],
    rotationY: 0,
    velocity: [0, 0, 0],
    activePosture: 'stand-conversational-ready',
    currentAction: 'IDLE_GESTURE',
    targetAddress: 'lot.bremerton.burwell-240',
    queueSlotIndex: null,
    carryingPropSlug: null,
    isCorticalThinking: false,
    activeSpeechBubble: `Arrived at 240 Burwell St (1:1 stature ${input.heightMeters.toFixed(2)}m).`,
    speechBubbleTimer: 7.0,
    lastCognitiveThought: `Calibrating 16-bone skeletal posture at 240 Burwell St.`,
    appearance: {
      renderMode: 'attire',
      skinToneHex: input.palette.skinToneHex,
      hairStyle: 'swept-wave',
      hairColorHex: input.palette.hairHex,
      torsoGarment: 'coastal-windbreaker',
      torsoColorHex: input.palette.jacketHex,
      legGarment: 'tailored-trousers',
      legColorHex: input.palette.trouserHex,
      footwearColorHex: '#2b2d30',
    },
    biometrics: {
      statureHeight: statureNorm,
      headScale: input.proportions.headScale,
      shoulderWidth: input.proportions.shoulderWidthScale,
      chestScale: input.proportions.torsoDepthScale,
      waistWidth: 0,
      pelvisWidth: 0,
      armLength: 0,
      armThickness: 0,
      legLength: input.proportions.legLengthScale,
      legThickness: 0,
    },
    jointOverrides: {
      ...DEFAULT_JOINT_OVERRIDES,
      neckPitchDeg: tonus.neckPitchRestDeg,
      waistPitchDeg: tonus.waistPitchRestDeg,
    },
    stiffnessKp: {
      waist: tonus.waistStiffnessKp,
      shoulder: tonus.shoulderStiffnessKp,
      kneeTorqueNm: 110,
    },
    drives,
    stressState,
    memories: [
      {
        address: `${citizenId}.mind.memory.episodic.arrival-burwell`,
        stratum: 'episodic',
        slug: 'arrival-burwell',
        timestamp: new Date().toISOString(),
        summary: `Stepped onto the 1:1 metric sidewalk outside 240 Burwell St.`,
        emotionalValence: 0.65,
      },
    ],
    packetHistory: [],
    leaseOwnerPeerId: 'peer.local.01',
    lastHeartbeatTick: Date.now(),
  };
}

export function listCitizenVfsAddresses(citizen: CitizenEntity): string[] {
  const files = buildCitizenVfsFiles(citizen);
  return Object.keys(files);
}

export function readCitizenVfsDocument(
  citizen: CitizenEntity,
  address: string
): { address: string; markdownBody: string } | null {
  const files = buildCitizenVfsFiles(citizen);
  const doc = files[address];
  if (!doc) return null;
  return {
    address: doc.address,
    markdownBody: doc.rawContent,
  };
}


export { verifyTwiceFactoryManifest, parseDcaDocument };
