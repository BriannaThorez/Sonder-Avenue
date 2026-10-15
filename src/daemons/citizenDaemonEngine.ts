/**
 * @domain citizen.daemon.reflexive.somatic-pilot
 * @description Executes 10Hz Persona Calculus, multi-floor vertical stairwell traversal, and reflexive semantic zoning mind-reading.
 * @inputs citizens: CitizenEntity[], dtSeconds: Float, weatherTempF: Float
 * @outputs updatedCitizens: CitizenEntity[], emittedPackets: CorticalIntentPacket[]
 * @dependencies spatial.structural.geometry.extrusion, SYSTEM.Physics.Collision.procedural-resolver
 */

import {
  CitizenEntity,
  CorticalIntentPacket,
  BREMERTON_SMART_TARGETS,
  MotorActionType,
  PostureSynergy,
} from '../core/citizenVfs';
import {
  VIA_VIRTUE_DEFINITIONS,
  computeStressOperator,
  evaluateCognitiveLogicGate,
  computeSynapticCoupling,
  computePosturalTonusFromVirtues,
  normalizeToHypersphere,
} from '../core/personaCalculus';
import {
  collisionSystem,
  initializeBremertonStaticColliders,
} from '../core/collisionPhysicsEngine';
import { multiFloorNavigationRegistry } from '../core/generativeShapeGrammarEngine';
import { evaluateSubconsciousNeurosymbolicAutonomy } from '../core/neurosymbolicAutonomyEngine';

// Pre-initialize static world colliders
initializeBremertonStaticColliders();

export interface DaemonStepResult {
  updatedCitizens: CitizenEntity[];
  emittedPackets: CorticalIntentPacket[];
  couplingLogs: Array<{
    id: string;
    citizenA: string;
    citizenB: string;
    omega: number;
    classification: string;
    summary: string;
    timestamp: number;
  }>;
}

const SITCOM_OBSERVATIONS: Record<string, string[]> = {
  'lot.bremerton.burwell-240': [
    'Everyone at 240 Burwell St checks their mail at the exact same minute just to avoid making elevator small talk.',
    'The architectural proportions of 240 Burwell St really reward a measured, observant stride.',
    'I left my umbrella on the second-floor landing again—classic Burwell Street hubris.',
  ],
  'prop.bench.waterfront-01': [
    'Sitting on the waterfront bench gives you a front-row seat to the Great Ferry Queue Rush.',
    'Look at the Puget ferry wake—pure kinetic equilibrium.',
    'Once you claim a boardwalk bench, giving it up feels like a moral concession.',
  ],
  'prop.bench.burwell-plaza': [
    'This plaza bench has optimal evergreen shade and zero line-cutting drama.',
    'Just taking five minutes to recalibrate my allostatic load.',
    'If you sit still long enough on Burwell Plaza, the whole neighborhood narrative comes to you.',
  ],
  'world.queue.ferry-terminal-line': [
    'A queue is civilization’s ultimate test of Self-Regulation and Fairness.',
    'Notice how everyone maintains a strict 1.1-meter buffer in this ferry line.',
    'We are all standing in a single-file line for a boat that has three hundred seats.',
  ],
  'lot.bremerton.suspension-bridge': [
    'The wind harmonics across the Manette steel truss bridge are remarkably soothing.',
    'Leaning by the bridge overlook puts the whole waterfront into perspective.',
  ],
  'prop.parcel.burwell-sidewalk': [
    'Lifting from the knees—let the 110 N·m joint torque do the heavy work.',
    'Who leaves an archival crate right in the middle of the Burwell St crosswalk?',
  ],
  'lot.bremerton.harborside-fountain': [
    'The bronze rings of the Harborside Fountain catch the Puget Sound afternoon light.',
    'Strolling past the fountain mist always clears the sensory buffer.',
  ],
};

/**
 * Retrieves top resonant memories using Mood-State Dependent Cosine Similarity (DCR-2.2.7-01).
 */
export function retrieveResonantMemories(citizen: CitizenEntity, topK = 3) {
  const currentMoodValence =
    (citizen.drives.metabolicEnergy +
      citizen.drives.socialEquilibrium -
      citizen.drives.muscularFatigue -
      (1 - citizen.stressState.sanityDeterminant)) /
    2;

  return [...citizen.memories]
    .sort((a, b) => {
      const distA = Math.abs(a.emotionalValence - currentMoodValence);
      const distB = Math.abs(b.emotionalValence - currentMoodValence);
      return distA - distB;
    })
    .slice(0, topK);
}

/**
 * Deterministic Neurosymbolic Cortical Stub (DCR-2.2.38-02).
 * Generates a high-level CorticalIntentPacket from the citizen's 24 VIA virtues,
 * Jungian logic gate, and environmental stimulus—so the locomotive AI runs with zero API latency.
 */
export function synthesizeStubCorticalPacket(params: {
  citizen: CitizenEntity;
  stimulusType: 'heartbeat' | 'player.whisper' | 'player.chat' | 'peer.encounter';
  stimulusText: string;
  preferredTargetAddress?: string;
}): CorticalIntentPacket {
  const { citizen, stimulusType, stimulusText, preferredTargetAddress } = params;

  // Identify citizen's top 2 VIA strengths
  const sortedVirtues = VIA_VIRTUE_DEFINITIONS.map((d) => ({
    def: d,
    weight: citizen.virtueWeights[d.slug] ?? 0.5,
  })).sort((a, b) => b.weight - a.weight);

  const topVirtue = sortedVirtues[0]?.def;
  const secondVirtue = sortedVirtues[1]?.def;

  // Select target lot or prop based on stimulus text or neurosymbolic utility
  let chosenTarget =
    BREMERTON_SMART_TARGETS.find((t) => t.address === preferredTargetAddress) ||
    BREMERTON_SMART_TARGETS.find((t) =>
      stimulusText.toLowerCase().includes(t.label.toLowerCase().split(' ')[0])
    );

  const lowerStim = stimulusText.toLowerCase();
  if (!chosenTarget) {
    if (lowerStim.includes('queue') || lowerStim.includes('line') || lowerStim.includes('ferry')) {
      chosenTarget = BREMERTON_SMART_TARGETS.find((t) => t.address === 'world.queue.ferry-terminal-line');
    } else if (lowerStim.includes('sit') || lowerStim.includes('bench') || lowerStim.includes('rest') || citizen.drives.metabolicEnergy < 0.45) {
      chosenTarget = BREMERTON_SMART_TARGETS.find((t) => t.category === 'bench');
    } else if (lowerStim.includes('crate') || lowerStim.includes('pickup') || lowerStim.includes('lift') || lowerStim.includes('box')) {
      chosenTarget = BREMERTON_SMART_TARGETS.find((t) => t.address === 'prop.parcel.burwell-sidewalk');
    } else if (lowerStim.includes('bridge') || lowerStim.includes('lean')) {
      chosenTarget = BREMERTON_SMART_TARGETS.find((t) => t.address === 'lot.bremerton.suspension-bridge');
    } else if (lowerStim.includes('burwell') || lowerStim.includes('home') || lowerStim.includes('240')) {
      chosenTarget = BREMERTON_SMART_TARGETS.find((t) => t.address === 'lot.bremerton.burwell-240');
    } else {
      // Utility-weighted rotation across smart targets
      const idx =
        Math.abs(
          citizen.slug.charCodeAt(0) +
            Math.floor(Date.now() / 6000) +
            Math.round((citizen.virtueWeights.curiosity ?? 0.5) * 10)
        ) % BREMERTON_SMART_TARGETS.length;
      chosenTarget = BREMERTON_SMART_TARGETS[idx];
    }
  }

  const target = chosenTarget || BREMERTON_SMART_TARGETS[0];

  // Evaluate Symbolic Firewall / Cognitive Logic Gate G
  const gateCheck = evaluateCognitiveLogicGate({
    dominantFunction: citizen.jungianFunction,
    needForClosureK: citizen.needForClosureK,
    virtueWeights: citizen.virtueWeights,
    stressState: citizen.stressState,
    proposedAction: stimulusText || target.defaultAction,
    isWhisper: stimulusType === 'player.whisper',
  });

  let action: MotorActionType = target.defaultAction;
  let postureSynergy: PostureSynergy = target.defaultPosture;

  if (!gateCheck.permitted) {
    action = 'IDLE_GESTURE';
    postureSynergy = 'crossed-arms-skeptical';
  } else if (lowerStim.includes('jump') || lowerStim.includes('celebrate')) {
    action = 'IDLE_GESTURE';
    postureSynergy = 'jump-joy';
  } else if (lowerStim.includes('run') || lowerStim.includes('hurry')) {
    action = 'NAVIGATE_TO';
    postureSynergy = 'run-brisk';
  } else if (citizen.stressState.inShadowRegression || citizen.drives.muscularFatigue > 0.75) {
    postureSynergy = 'slump-exhausted';
  }

  const lines = SITCOM_OBSERVATIONS[target.address] || SITCOM_OBSERVATIONS['lot.bremerton.burwell-240'];
  const observationSeed = Math.abs(citizen.slug.charCodeAt(0) + Math.floor(Date.now() / 45000));
  const defaultLine = lines[observationSeed % lines.length];

  // Autonomic heartbeats should NOT spam public spoken dialogue
  const spokenDialogue = !gateCheck.permitted
    ? `My ${topVirtue.label} (${(citizen.virtueWeights[topVirtue.slug] ?? 0.8).toFixed(
        2
      )}) won't let me do that. ${gateCheck.gateReason}`
    : stimulusType === 'player.chat'
    ? `Speaking from ${topVirtue.label} and ${secondVirtue.label}: "${stimulusText}" makes me want to head toward ${target.label}.`
    : stimulusType === 'player.whisper'
    ? `Subconscious urge: "${stimulusText}"... Directing body to ${target.label}.`
    : undefined; // Heartbeats do not speak publicly into chat

  const cognitiveThought = stimulusType === 'heartbeat'
    ? `[Autonomic Subconscious | ${topVirtue.label} ${(citizen.virtueWeights[topVirtue.slug] ?? 0.8).toFixed(2)}] Equilibrium nominal at ${target.address.split('.').pop()}.`
    : `[${citizen.jungianFunction}-Gate | ${topVirtue.label} ${(
        citizen.virtueWeights[topVirtue.slug] ?? 0.8
      ).toFixed(2)}]: ${gateCheck.gateReason} Directing body daemon to ${action} at ${target.address}.`;

  const deltaSign = gateCheck.permitted ? 0.015 : -0.01;

  return {
    packetId: `pkt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    citizenId: citizen.id,
    timestamp: Date.now(),
    source: stimulusType === 'player.whisper' ? 'player.whisper' : stimulusType === 'player.chat' ? 'player.chat' : 'cortical.stub',
    cognitiveThought,
    spokenDialogue,
    motorDirective: {
      action,
      targetAddress: target.address,
      postureSynergy,
      urgencyScalar: postureSynergy === 'run-brisk' ? 0.92 : 0.58,
    },
    epigeneticShift: [
      {
        virtueSlug: topVirtue.slug,
        delta: deltaSign,
      },
    ],
    memoryEntry: {
      stratum: 'episodic',
      slug: `${target.address.split('.').pop()}-${Date.now().toString().slice(-4)}`,
      summary: (spokenDialogue || cognitiveThought).slice(0, 110),
      emotionalValence: gateCheck.permitted ? 0.45 : -0.25,
    },
  };
}

/**
 * Applies a CorticalIntentPacket to a CitizenEntity:
 * 1. Sets the high-level motor target & posture synergy for the 10Hz body pilot.
 * 2. Executes Step 5 (Autobiographical Cognitive Loopback) on the S^23 virtue hypersphere.
 * 3. Appends the new episodic memory into citizen.[id].mind.memory.*.
 */
export function applyCorticalIntentPacket(
  citizen: CitizenEntity,
  packet: CorticalIntentPacket,
  queuePositionCounter = 0
): CitizenEntity {
  const targetObj =
    BREMERTON_SMART_TARGETS.find((t) => t.address === packet.motorDirective.targetAddress) ||
    BREMERTON_SMART_TARGETS[0];

  // Compute exact destination coordinates (with diagonal queue spacing if JOIN_QUEUE)
  let dest: [number, number, number] = [...targetObj.position];
  let queueSlotIndex: number | null = null;

  if (packet.motorDirective.action === 'JOIN_QUEUE') {
    queueSlotIndex = queuePositionCounter;
    // True 1:1 metric queue spacing (1.15m interpersonal buffer) along Ferry Terminal boardwalk
    dest = [
      targetObj.position[0] + queuePositionCounter * 0.85,
      0,
      targetObj.position[2] - queuePositionCounter * 0.80,
    ];
  } else {
    // True 1:1 metric interpersonal offset per citizen so multiple citizens never clip at the same spot
    const angle = (citizen.slug.charCodeAt(0) % 7) * 0.9;
    const radius = packet.motorDirective.action === 'SIT_BENCH' ? 0.55 : 1.15;
    dest = [
      targetObj.position[0] + Math.cos(angle) * radius,
      0,
      targetObj.position[2] + Math.sin(angle) * radius,
    ];
  }

  // Step 5: Autobiographical Cognitive Loopback on 24 VIA virtues
  const nextVirtues = { ...citizen.virtueWeights };
  if (packet.epigeneticShift) {
    for (const shift of packet.epigeneticShift) {
      if (nextVirtues[shift.virtueSlug] !== undefined) {
        nextVirtues[shift.virtueSlug] = Math.max(
          0.08,
          Math.min(0.98, nextVirtues[shift.virtueSlug] + shift.delta)
        );
      }
    }
  }
  const { unitVector, displayWeights } = normalizeToHypersphere(nextVirtues);
  const tonus = computePosturalTonusFromVirtues(displayWeights, citizen.drives);

  const nextMemories = [...citizen.memories];
  if (packet.memoryEntry) {
    nextMemories.unshift({
      address: `${citizen.id}.mind.memory.${packet.memoryEntry.stratum}.${packet.memoryEntry.slug}`,
      stratum: packet.memoryEntry.stratum,
      slug: packet.memoryEntry.slug,
      timestamp: new Date(packet.timestamp).toISOString(),
      summary: packet.memoryEntry.summary,
      emotionalValence: packet.memoryEntry.emotionalValence,
    });
    if (nextMemories.length > 16) nextMemories.pop();
  }

  return {
    ...citizen,
    virtueWeights: displayWeights,
    unitHypersphereVector: unitVector,
    targetAddress: targetObj.address,
    targetPosition: dest,
    currentAction: packet.motorDirective.action,
    activePosture: packet.motorDirective.postureSynergy,
    queueSlotIndex,
    isCorticalThinking: false,
    activeSpeechBubble: packet.spokenDialogue || packet.cognitiveThought,
    speechBubbleTimer: 9.0, // Visible for 9 seconds
    lastCognitiveThought: packet.cognitiveThought,
    stiffnessKp: {
      ...citizen.stiffnessKp,
      waist: tonus.waistStiffnessKp,
      shoulder: tonus.shoulderStiffnessKp,
    },
    jointOverrides: {
      ...citizen.jointOverrides,
      neckPitchDeg: tonus.neckPitchRestDeg,
      waistPitchDeg: tonus.waistPitchRestDeg,
    },
    memories: nextMemories,
    packetHistory: [packet, ...citizen.packetHistory].slice(0, 20),
    lastHeartbeatTick: Date.now(),
  };
}

/**
 * 10Hz Reflexive Somatic Substrate Step (DCR-2.1.17-01):
 * Pilots each citizen's body smoothly toward their targetPosition, transitions into
 * terminal IK postures upon arrival (bench sitting, queue waiting, crate squatting),
 * updates somatic drives & Stress Operator S_hat, and evaluates Synaptic Coupling Omega.
 */
export function stepCitizenDaemons10Hz(
  citizens: CitizenEntity[],
  dtSeconds: number,
  weatherTempF: number,
  autoHeartbeatEnabled: boolean
): DaemonStepResult {
  const emittedPackets: CorticalIntentPacket[] = [];
  const couplingLogs: DaemonStepResult['couplingLogs'] = [];

  // Count active queue slots
  let queueCount = citizens.filter((c) => c.currentAction === 'JOIN_QUEUE').length;

  const updated = citizens.map((c) => {
    const dx = c.targetPosition[0] - c.position[0];
    const dy = (c.targetPosition[1] ?? 0) - (c.position[1] ?? 0);
    const dz = c.targetPosition[2] - c.position[2];
    const distXZ = Math.hypot(dx, dz);
    const dist3D = Math.hypot(dx, dy, dz);

    const tonus = computePosturalTonusFromVirtues(c.virtueWeights, c.drives);
    const baseSpeed =
      c.activePosture === 'run-brisk'
        ? 2.6 * tonus.strideFrequencyMultiplier
        : 1.35 * tonus.strideFrequencyMultiplier;

    let nextPos: [number, number, number] = [...c.position];
    let nextVel: [number, number, number] = [0, 0, 0];
    let nextRotY = c.rotationY;
    let nextPosture = c.activePosture;
    let nextCarrying = c.carryingPropSlug;

    if (dist3D > 0.14) {
      const stepDist = Math.min(dist3D, baseSpeed * dtSeconds);
      const nx = distXZ > 0.01 ? dx / dist3D : 0;
      const ny = dy / dist3D;
      const nz = distXZ > 0.01 ? dz / dist3D : 0;
      const candidatePos: [number, number, number] = [
        c.position[0] + nx * stepDist,
        Math.max(0, c.position[1] + ny * stepDist),
        c.position[2] + nz * stepDist,
      ];

      // If citizen is on ground level (y < 0.4) and target is also ground level, apply street-level building colliders;
      // If citizen is navigating an interior apartment floor or climbing vertical stairwell (y >= 0.4 or targetPosition[1] > 0.4),
      // allow free interior room & stairwell traversal!
      if (candidatePos[1] < 0.4 && (c.targetPosition[1] ?? 0) < 0.4) {
        const colRes = collisionSystem.resolveCapsulePosition(candidatePos, 0.28, c.id);
        nextPos = [colRes.resolvedPosition[0], 0, colRes.resolvedPosition[2]];
      } else {
        nextPos = candidatePos;
      }

      nextVel = [nx * baseSpeed, ny * baseSpeed, nz * baseSpeed];
      if (distXZ > 0.02) {
        nextRotY = Math.atan2(nx, nz);
      }

      if (nextPosture !== 'run-brisk') {
        nextPosture = 'walk-composed';
      }
    } else {
      // Step C: Reflexive Mind Reading of Semantic Interior Zoning Slugs (`spatial.structural.zoning.floorplan`)
      const currentRoom = multiFloorNavigationRegistry.queryRoomAtWorldPosition(c.position);
      if (currentRoom) {
        if (currentRoom.semanticZoningSlug === 'zoning.residential.apartment.living') {
          nextPosture = 'sit-relaxed';
        } else if (currentRoom.semanticZoningSlug === 'zoning.residential.apartment.kitchen') {
          nextPosture = 'stand-conversational-ready';
        } else if (currentRoom.semanticZoningSlug === 'structural.surface.terrace') {
          nextPosture = 'lean-casual';
        } else {
          nextPosture = 'stand-conversational-ready';
        }
      } else if (c.currentAction === 'SIT_BENCH') {
        nextPosture = 'sit-relaxed';
        nextRotY = 0;
      } else if (c.currentAction === 'JOIN_QUEUE') {
        nextPosture =
          (c.virtueWeights['self-regulation'] ?? 0.5) > 0.7
            ? 'crossed-arms-skeptical'
            : 'stand-conversational-ready';
        nextRotY = -Math.PI / 4;
      } else if (c.currentAction === 'LEAN_WALL') {
        nextPosture = 'lean-casual';
      } else if (c.currentAction === 'PICKUP_OBJECT') {
        nextPosture = 'squat-lift';
        nextCarrying = 'prop.parcel.burwell-sidewalk';
      } else if (
        nextPosture === 'walk-composed' ||
        nextPosture === 'run-brisk'
      ) {
        nextPosture =
          c.stressState.inShadowRegression || c.drives.muscularFatigue > 0.72
            ? 'slump-exhausted'
            : 'stand-conversational-ready';
      }
    }

    // Update somatic homeostasis drives (DCR-2.1.25-01 Degaming Ontology)
    const isMoving = dist3D > 0.14;
    const isSitting = nextPosture === 'sit-relaxed';
    const isLifting = nextPosture === 'squat-lift';

    const thermalTarget = weatherTempF <= 38 ? 0.42 : 0.88;
    const nextDrives = {
      thermalComfort: Number(
        (c.drives.thermalComfort + (thermalTarget - c.drives.thermalComfort) * 0.05).toFixed(3)
      ),
      metabolicEnergy: Number(
        Math.max(
          0.15,
          Math.min(
            0.98,
            c.drives.metabolicEnergy + (isSitting ? 0.012 : isMoving ? -0.004 : -0.001)
          )
        ).toFixed(3)
      ),
      socialEquilibrium: c.drives.socialEquilibrium,
      muscularFatigue: Number(
        Math.max(
          0.05,
          Math.min(
            0.95,
            c.drives.muscularFatigue + (isLifting ? 0.018 : isMoving ? 0.004 : isSitting ? -0.015 : -0.004)
          )
        ).toFixed(3)
      ),
    };

    // Execute Thinktank 10Hz Subconscious Self-Preserving & Pocket/Backpack Economy Solver (0ms LLM-independent)
    const autonomyEval = evaluateSubconsciousNeurosymbolicAutonomy(
      c,
      nextDrives,
      weatherTempF,
      Date.now()
    );

    const nextStress = computeStressOperator(
      autonomyEval.updatedDrives,
      weatherTempF,
      c.stressState.hysteresisCooldownTicks
    );

    const nextBubbleTimer = Math.max(0, c.speechBubbleTimer - dtSeconds);
    const activeInteriorRoom = multiFloorNavigationRegistry.queryRoomAtWorldPosition(nextPos);
    const zoningThought = activeInteriorRoom
      ? `[Reflexive Zoning: ${activeInteriorRoom.semanticZoningSlug} • Floor ${activeInteriorRoom.storyIndex + 1}] ${activeInteriorRoom.reflexiveAffordanceAction}`
      : autonomyEval.updatedRpgState.subconsciousGoalReason || c.lastCognitiveThought;

    // Couple carried backpack/pocket mass (kg) into spinal flexion (Torso.waist-joint)
    const carriedMassPitchOffset = Number(
      (autonomyEval.updatedRpgState.totalCarriedMassKg * 1.15).toFixed(2)
    );

    let updatedCitizen: CitizenEntity = {
      ...c,
      position: nextPos,
      velocity: nextVel,
      rotationY: nextRotY,
      activePosture: nextPosture,
      carryingPropSlug: nextCarrying,
      drives: autonomyEval.updatedDrives,
      stressState: nextStress,
      embodiedRpg: autonomyEval.updatedRpgState,
      jointOverrides: {
        ...c.jointOverrides,
        waistPitchDeg: Number((tonus.waistPitchRestDeg + carriedMassPitchOffset).toFixed(1)),
      },
      speechBubbleTimer: nextBubbleTimer,
      activeSpeechBubble: nextBubbleTimer > 0 ? c.activeSpeechBubble : null,
      lastCognitiveThought: zoningThought,
    };

    // Autonomous DCA Heartbeat & Salience Tripwire (DCR-2.2.39-01 & 02):
    const timeSinceHeartbeat = Date.now() - c.lastHeartbeatTick;
    if (
      autoHeartbeatEnabled &&
      !c.isCorticalThinking &&
      dist3D <= 0.14 &&
      nextPos[1] < 0.5 && // Keep citizens who were sent to a pinned upper apartment on that floor until directed otherwise!
      timeSinceHeartbeat > 11000 + (c.slug.charCodeAt(0) % 5) * 1500
    ) {
      const pkt = synthesizeStubCorticalPacket({
        citizen: updatedCitizen,
        stimulusType: 'heartbeat',
        stimulusText: 'Autonomous DCA Heartbeat Pulse (DCR-2.2.39-01)',
      });
      emittedPackets.push(pkt);
      updatedCitizen = applyCorticalIntentPacket(updatedCitizen, pkt, queueCount);
      if (pkt.motorDirective.action === 'JOIN_QUEUE') {
        queueCount += 1;
      }
    }

    return updatedCitizen;
  });

  // Check pairwise Synaptic Coupling (Omega = psi_A . psi_B) for citizens within 2.6m
  for (let i = 0; i < updated.length; i++) {
    for (let j = i + 1; j < updated.length; j++) {
      const a = updated[i];
      const b = updated[j];
      const d = Math.hypot(a.position[0] - b.position[0], a.position[2] - b.position[2]);
      if (d < 2.6 && Math.random() < 0.08) {
        const coupling = computeSynapticCoupling(
          a.virtueWeights,
          b.virtueWeights,
          a.willpowerMagnitude,
          b.willpowerMagnitude
        );
        couplingLogs.push({
          id: `omega-${Date.now()}-${i}-${j}`,
          citizenA: a.fullName,
          citizenB: b.fullName,
          omega: coupling.omega,
          classification: coupling.classification,
          summary: coupling.narrativeSummary,
          timestamp: Date.now(),
        });
      }
    }
  }

  // Resolve mutual citizen-to-citizen buffer so characters never overlap while preserving multi-floor Y elevation
  const bufferedPosMap = collisionSystem.resolveMutualCharacterBuffer(
    updated.map((u) => ({ id: u.id, pos: u.position })),
    0.52
  );
  const finalCitizens = updated.map((u) => {
    const pos = bufferedPosMap.get(u.id);
    return pos
      ? {
          ...u,
          position: [pos[0], u.position[1], pos[2]] as [number, number, number],
        }
      : u;
  });

  return {
    updatedCitizens: finalCitizens,
    emittedPackets,
    couplingLogs,
  };
}
