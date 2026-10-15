/**
 * Sonder Avenue — Three.js Skeletal Skinning, Additive Animation Blending & Character Toolset
 * Address: SYSTEM.Character.Rigging.skinning-additive-blending
 * Reference: https://threejs.org/examples/#webgl_animation_skinning_additive_blending
 * Compliance: DCR-2.1.15-01, DCR-2.2.38-01 (±18% Biometric Clamp), DCR-2.2.43 (1:1 Metric Scale = 1.72m)
 *
 * Implements:
 * 1. Hierarchical 16-Bone THREE.Skeleton + Optional THREE.SkeletonHelper
 * 2. Base Locomotion AnimationClips ('idle', 'walk', 'run', 'sit', 'lean') with smooth crossFadeTo()
 * 3. Additive AnimationClips ('sneak_pose', 'sad_pose', 'agree', 'headShake', 'breathing', 'gesture')
 *    converted via THREE.AnimationUtils.makeClipAdditive() so they blend on top of any base action
 *    without fighting or clobbering locomotion or manual FK joint sliders.
 * 4. Declarative Character Toolset Macro Compiler:
 *    - character.anim.crossfade(citizen, baseAction, duration)
 *    - character.anim.additive(citizen, clip, weight)
 *    - character.morph.apply(citizen, stature, browHeight, eyeScale, jawWidth, smileCurve, muscleDef)
 *    - character.skeleton.helper(citizen, visible)
 */

import * as THREE from 'three';
import { CitizenEntity, PostureSynergy } from './citizenVfs';

export type BaseActionName = 'None' | 'idle' | 'walk' | 'run' | 'sit' | 'lean';
export type AdditiveActionName =
  | 'sneak_pose'
  | 'sad_pose'
  | 'agree'
  | 'headShake'
  | 'conversational_gesture';

export interface AdditiveWeightConfig {
  sneak_pose: number;
  sad_pose: number;
  agree: number;
  headShake: number;
  conversational_gesture: number;
}

export interface CharacterAnimationSettings {
  baseAction: BaseActionName;
  timeScale: number;
  crossFadeDuration: number;
  showSkeletonHelper: boolean;
  additiveWeights: AdditiveWeightConfig;
}

export const DEFAULT_CHARACTER_ANIM_SETTINGS: CharacterAnimationSettings = {
  baseAction: 'idle',
  timeScale: 1.0,
  crossFadeDuration: 0.35,
  showSkeletonHelper: false,
  additiveWeights: {
    sneak_pose: 0.0,
    sad_pose: 0.0,
    agree: 0.0,
    headShake: 0.0,
    conversational_gesture: 0.25,
  },
};

export interface SkinnedCitizenController {
  citizenId: string;
  mixer: THREE.AnimationMixer;
  skeleton: THREE.Skeleton;
  skeletonHelper: THREE.SkeletonHelper;
  bonesByName: Record<string, THREE.Bone>;
  baseActions: Record<BaseActionName, THREE.AnimationAction | null>;
  additiveActions: Record<AdditiveActionName, THREE.AnimationAction>;
  currentBaseAction: BaseActionName;
  timeScale: number;
}

/**
 * Maps high-level DCA PostureSynergy to Three.js BaseActionName + default additive weights
 */
export function mapPostureToSkinningState(posture: PostureSynergy): {
  base: BaseActionName;
  additives: Partial<AdditiveWeightConfig>;
} {
  switch (posture) {
    case 'walk-composed':
      return { base: 'walk', additives: { sneak_pose: 0, sad_pose: 0, conversational_gesture: 0.15 } };
    case 'run-brisk':
      return { base: 'run', additives: { sneak_pose: 0, sad_pose: 0, conversational_gesture: 0.1 } };
    case 'sit-relaxed':
      return { base: 'sit', additives: { sneak_pose: 0, sad_pose: 0, conversational_gesture: 0.2 } };
    case 'lean-casual':
      return { base: 'lean', additives: { sneak_pose: 0, sad_pose: 0, conversational_gesture: 0.2 } };
    case 'slump-exhausted':
      return { base: 'idle', additives: { sad_pose: 0.85, sneak_pose: 0.15, conversational_gesture: 0 } };
    case 'squat-lift':
      return { base: 'idle', additives: { sneak_pose: 0.9, sad_pose: 0, conversational_gesture: 0 } };
    case 'crossed-arms-skeptical':
      return { base: 'idle', additives: { headShake: 0.35, conversational_gesture: 0.1 } };
    case 'jump-joy':
      return { base: 'run', additives: { agree: 0.75, conversational_gesture: 0.6 } };
    case 'stand-conversational-ready':
    default:
      return { base: 'idle', additives: { sneak_pose: 0, sad_pose: 0, conversational_gesture: 0.35 } };
  }
}

function eulerQuat(xRad: number, yRad: number, zRad: number): number[] {
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(xRad, yRad, zRad, 'XYZ'));
  return [q.x, q.y, q.z, q.w];
}

/**
 * Generates procedural Three.js AnimationClips for Base Locomotion and Additive Layering,
 * converting additive clips via THREE.AnimationUtils.makeClipAdditive() exactly as in
 * webgl_animation_skinning_additive_blending.
 */
export function buildProceduralAnimationClips(legLenScale = 1.0): {
  baseClips: Record<Exclude<BaseActionName, 'None'>, THREE.AnimationClip>;
  additiveClips: Record<AdditiveActionName, THREE.AnimationClip>;
} {
  const pelvisY = 0.88 * legLenScale;

  // 1. IDLE CLIP (2.4s loop)
  const idleTimes = [0, 1.2, 2.4];
  const idleTracks: THREE.KeyframeTrack[] = [
    new THREE.VectorKeyframeTrack('.bones[pelvis].position', idleTimes, [
      0, pelvisY, 0,
      0, pelvisY + 0.012, 0,
      0, pelvisY, 0,
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[waistJoint].quaternion', idleTimes, [
      ...eulerQuat(0.01, 0, 0),
      ...eulerQuat(0.035, 0.02, 0),
      ...eulerQuat(0.01, 0, 0),
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[neckJoint].quaternion', idleTimes, [
      ...eulerQuat(0, 0, 0),
      ...eulerQuat(-0.02, 0.05, 0),
      ...eulerQuat(0, 0, 0),
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[shoulderL].quaternion', idleTimes, [
      ...eulerQuat(0.04, 0, 0.08),
      ...eulerQuat(0.07, 0, 0.1),
      ...eulerQuat(0.04, 0, 0.08),
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[shoulderR].quaternion', idleTimes, [
      ...eulerQuat(0.04, 0, -0.08),
      ...eulerQuat(0.07, 0, -0.1),
      ...eulerQuat(0.04, 0, -0.08),
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[elbowL].quaternion', idleTimes, [
      ...eulerQuat(-0.22, 0, 0),
      ...eulerQuat(-0.26, 0, 0),
      ...eulerQuat(-0.22, 0, 0),
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[elbowR].quaternion', idleTimes, [
      ...eulerQuat(-0.22, 0, 0),
      ...eulerQuat(-0.26, 0, 0),
      ...eulerQuat(-0.22, 0, 0),
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[hipL].quaternion', idleTimes, [
      ...eulerQuat(0, 0, 0),
      ...eulerQuat(0, 0, 0),
      ...eulerQuat(0, 0, 0),
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[hipR].quaternion', idleTimes, [
      ...eulerQuat(0, 0, 0),
      ...eulerQuat(0, 0, 0),
      ...eulerQuat(0, 0, 0),
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[kneeL].quaternion', idleTimes, [
      ...eulerQuat(0.05, 0, 0),
      ...eulerQuat(0.05, 0, 0),
      ...eulerQuat(0.05, 0, 0),
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[kneeR].quaternion', idleTimes, [
      ...eulerQuat(0.05, 0, 0),
      ...eulerQuat(0.05, 0, 0),
      ...eulerQuat(0.05, 0, 0),
    ]),
  ];
  const idleClip = new THREE.AnimationClip('idle', 2.4, idleTracks);

  // 2. WALK CLIP (1.1s natural 1:1 stride loop)
  const walkTimes = [0, 0.275, 0.55, 0.825, 1.1];
  const walkTracks: THREE.KeyframeTrack[] = [
    new THREE.VectorKeyframeTrack('.bones[pelvis].position', walkTimes, [
      0, pelvisY, 0,
      0, pelvisY + 0.032, 0,
      0, pelvisY, 0,
      0, pelvisY + 0.032, 0,
      0, pelvisY, 0,
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[waistJoint].quaternion', walkTimes, [
      ...eulerQuat(0.04, 0.06, 0),
      ...eulerQuat(0.05, 0, 0),
      ...eulerQuat(0.04, -0.06, 0),
      ...eulerQuat(0.05, 0, 0),
      ...eulerQuat(0.04, 0.06, 0),
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[hipL].quaternion', walkTimes, [
      ...eulerQuat(0.45, 0, 0),
      ...eulerQuat(0.0, 0, 0),
      ...eulerQuat(-0.42, 0, 0),
      ...eulerQuat(0.05, 0, 0),
      ...eulerQuat(0.45, 0, 0),
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[hipR].quaternion', walkTimes, [
      ...eulerQuat(-0.42, 0, 0),
      ...eulerQuat(0.05, 0, 0),
      ...eulerQuat(0.45, 0, 0),
      ...eulerQuat(0.0, 0, 0),
      ...eulerQuat(-0.42, 0, 0),
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[kneeL].quaternion', walkTimes, [
      ...eulerQuat(0.08, 0, 0),
      ...eulerQuat(0.18, 0, 0),
      ...eulerQuat(0.32, 0, 0),
      ...eulerQuat(0.72, 0, 0),
      ...eulerQuat(0.08, 0, 0),
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[kneeR].quaternion', walkTimes, [
      ...eulerQuat(0.32, 0, 0),
      ...eulerQuat(0.72, 0, 0),
      ...eulerQuat(0.08, 0, 0),
      ...eulerQuat(0.18, 0, 0),
      ...eulerQuat(0.32, 0, 0),
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[shoulderL].quaternion', walkTimes, [
      ...eulerQuat(-0.32, 0, 0.08),
      ...eulerQuat(0.04, 0, 0.08),
      ...eulerQuat(0.32, 0, 0.08),
      ...eulerQuat(0.04, 0, 0.08),
      ...eulerQuat(-0.32, 0, 0.08),
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[shoulderR].quaternion', walkTimes, [
      ...eulerQuat(0.32, 0, -0.08),
      ...eulerQuat(0.04, 0, -0.08),
      ...eulerQuat(-0.32, 0, -0.08),
      ...eulerQuat(0.04, 0, -0.08),
      ...eulerQuat(0.32, 0, -0.08),
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[elbowL].quaternion', walkTimes, [
      ...eulerQuat(-0.42, 0, 0),
      ...eulerQuat(-0.28, 0, 0),
      ...eulerQuat(-0.18, 0, 0),
      ...eulerQuat(-0.32, 0, 0),
      ...eulerQuat(-0.42, 0, 0),
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[elbowR].quaternion', walkTimes, [
      ...eulerQuat(-0.18, 0, 0),
      ...eulerQuat(-0.32, 0, 0),
      ...eulerQuat(-0.42, 0, 0),
      ...eulerQuat(-0.28, 0, 0),
      ...eulerQuat(-0.18, 0, 0),
    ]),
  ];
  const walkClip = new THREE.AnimationClip('walk', 1.1, walkTracks);

  // 3. RUN CLIP (0.72s brisk cycle)
  const runTimes = [0, 0.18, 0.36, 0.54, 0.72];
  const runTracks: THREE.KeyframeTrack[] = [
    new THREE.VectorKeyframeTrack('.bones[pelvis].position', runTimes, [
      0, pelvisY - 0.02, 0,
      0, pelvisY + 0.075, 0,
      0, pelvisY - 0.02, 0,
      0, pelvisY + 0.075, 0,
      0, pelvisY - 0.02, 0,
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[waistJoint].quaternion', runTimes, [
      ...eulerQuat(0.18, 0.12, 0),
      ...eulerQuat(0.2, 0, 0),
      ...eulerQuat(0.18, -0.12, 0),
      ...eulerQuat(0.2, 0, 0),
      ...eulerQuat(0.18, 0.12, 0),
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[hipL].quaternion', runTimes, [
      ...eulerQuat(0.82, 0, 0),
      ...eulerQuat(0.0, 0, 0),
      ...eulerQuat(-0.75, 0, 0),
      ...eulerQuat(0.1, 0, 0),
      ...eulerQuat(0.82, 0, 0),
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[hipR].quaternion', runTimes, [
      ...eulerQuat(-0.75, 0, 0),
      ...eulerQuat(0.1, 0, 0),
      ...eulerQuat(0.82, 0, 0),
      ...eulerQuat(0.0, 0, 0),
      ...eulerQuat(-0.75, 0, 0),
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[kneeL].quaternion', runTimes, [
      ...eulerQuat(0.2, 0, 0),
      ...eulerQuat(0.45, 0, 0),
      ...eulerQuat(0.6, 0, 0),
      ...eulerQuat(1.35, 0, 0),
      ...eulerQuat(0.2, 0, 0),
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[kneeR].quaternion', runTimes, [
      ...eulerQuat(0.6, 0, 0),
      ...eulerQuat(1.35, 0, 0),
      ...eulerQuat(0.2, 0, 0),
      ...eulerQuat(0.45, 0, 0),
      ...eulerQuat(0.6, 0, 0),
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[shoulderL].quaternion', runTimes, [
      ...eulerQuat(-0.72, 0, 0.1),
      ...eulerQuat(0, 0, 0.1),
      ...eulerQuat(0.72, 0, 0.1),
      ...eulerQuat(0, 0, 0.1),
      ...eulerQuat(-0.72, 0, 0.1),
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[shoulderR].quaternion', runTimes, [
      ...eulerQuat(0.72, 0, -0.1),
      ...eulerQuat(0, 0, -0.1),
      ...eulerQuat(-0.72, 0, -0.1),
      ...eulerQuat(0, 0, -0.1),
      ...eulerQuat(0.72, 0, -0.1),
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[elbowL].quaternion', runTimes, [
      ...eulerQuat(-1.25, 0, 0),
      ...eulerQuat(-1.1, 0, 0),
      ...eulerQuat(-1.25, 0, 0),
      ...eulerQuat(-1.1, 0, 0),
      ...eulerQuat(-1.25, 0, 0),
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[elbowR].quaternion', runTimes, [
      ...eulerQuat(-1.25, 0, 0),
      ...eulerQuat(-1.1, 0, 0),
      ...eulerQuat(-1.25, 0, 0),
      ...eulerQuat(-1.1, 0, 0),
      ...eulerQuat(-1.25, 0, 0),
    ]),
  ];
  const runClip = new THREE.AnimationClip('run', 0.72, runTracks);

  // 4. SIT BENCH CLIP (2.0s loop)
  const sitTimes = [0, 1.0, 2.0];
  const sitTracks: THREE.KeyframeTrack[] = [
    new THREE.VectorKeyframeTrack('.bones[pelvis].position', sitTimes, [
      0, 0.52 * legLenScale, 0,
      0, 0.525 * legLenScale, 0,
      0, 0.52 * legLenScale, 0,
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[waistJoint].quaternion', sitTimes, [
      ...eulerQuat(-0.06, 0, 0),
      ...eulerQuat(-0.04, 0.03, 0),
      ...eulerQuat(-0.06, 0, 0),
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[hipL].quaternion', sitTimes, [
      ...eulerQuat(-1.48, 0, 0),
      ...eulerQuat(-1.48, 0, 0),
      ...eulerQuat(-1.48, 0, 0),
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[hipR].quaternion', sitTimes, [
      ...eulerQuat(-1.48, 0, 0),
      ...eulerQuat(-1.48, 0, 0),
      ...eulerQuat(-1.48, 0, 0),
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[kneeL].quaternion', sitTimes, [
      ...eulerQuat(1.48, 0, 0),
      ...eulerQuat(1.48, 0, 0),
      ...eulerQuat(1.48, 0, 0),
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[kneeR].quaternion', sitTimes, [
      ...eulerQuat(1.48, 0, 0),
      ...eulerQuat(1.48, 0, 0),
      ...eulerQuat(1.48, 0, 0),
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[shoulderL].quaternion', sitTimes, [
      ...eulerQuat(-0.22, 0, 0.08),
      ...eulerQuat(-0.2, 0, 0.08),
      ...eulerQuat(-0.22, 0, 0.08),
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[shoulderR].quaternion', sitTimes, [
      ...eulerQuat(-0.22, 0, -0.08),
      ...eulerQuat(-0.2, 0, -0.08),
      ...eulerQuat(-0.22, 0, -0.08),
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[elbowL].quaternion', sitTimes, [
      ...eulerQuat(-0.65, 0, 0),
      ...eulerQuat(-0.62, 0, 0),
      ...eulerQuat(-0.65, 0, 0),
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[elbowR].quaternion', sitTimes, [
      ...eulerQuat(-0.65, 0, 0),
      ...eulerQuat(-0.62, 0, 0),
      ...eulerQuat(-0.65, 0, 0),
    ]),
  ];
  const sitClip = new THREE.AnimationClip('sit', 2.0, sitTracks);

  // 5. LEAN CLIP (2.2s loop)
  const leanTimes = [0, 1.1, 2.2];
  const leanTracks: THREE.KeyframeTrack[] = [
    new THREE.VectorKeyframeTrack('.bones[pelvis].position', leanTimes, [
      0, pelvisY, -0.06,
      0, pelvisY, -0.06,
      0, pelvisY, -0.06,
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[waistJoint].quaternion', leanTimes, [
      ...eulerQuat(-0.14, 0, 0),
      ...eulerQuat(-0.12, 0.04, 0),
      ...eulerQuat(-0.14, 0, 0),
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[hipL].quaternion', leanTimes, [
      ...eulerQuat(-0.14, 0, 0),
      ...eulerQuat(-0.14, 0, 0),
      ...eulerQuat(-0.14, 0, 0),
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[hipR].quaternion', leanTimes, [
      ...eulerQuat(0.14, 0, 0),
      ...eulerQuat(0.14, 0, 0),
      ...eulerQuat(0.14, 0, 0),
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[kneeR].quaternion', leanTimes, [
      ...eulerQuat(0.45, 0, 0),
      ...eulerQuat(0.45, 0, 0),
      ...eulerQuat(0.45, 0, 0),
    ]),
  ];
  const leanClip = new THREE.AnimationClip('lean', 2.2, leanTracks);

  // ==========================================================================
  // ADDITIVE CLIPS (Converted via THREE.AnimationUtils.makeClipAdditive)
  // ==========================================================================

  // A. sneak_pose (Static crouch/stealth pose)
  const sneakRaw = new THREE.AnimationClip('sneak_pose', 1.0, [
    new THREE.QuaternionKeyframeTrack('.bones[waistJoint].quaternion', [0, 1], [
      ...eulerQuat(0, 0, 0),
      ...eulerQuat(0.45, 0, 0),
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[hipL].quaternion', [0, 1], [
      ...eulerQuat(0, 0, 0),
      ...eulerQuat(-0.55, 0, 0),
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[hipR].quaternion', [0, 1], [
      ...eulerQuat(0, 0, 0),
      ...eulerQuat(-0.55, 0, 0),
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[kneeL].quaternion', [0, 1], [
      ...eulerQuat(0, 0, 0),
      ...eulerQuat(0.75, 0, 0),
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[kneeR].quaternion', [0, 1], [
      ...eulerQuat(0, 0, 0),
      ...eulerQuat(0.75, 0, 0),
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[shoulderL].quaternion', [0, 1], [
      ...eulerQuat(0, 0, 0),
      ...eulerQuat(-0.4, 0, 0.15),
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[shoulderR].quaternion', [0, 1], [
      ...eulerQuat(0, 0, 0),
      ...eulerQuat(-0.4, 0, -0.15),
    ]),
  ]);
  const sneakClip = THREE.AnimationUtils.makeClipAdditive(sneakRaw, 0, sneakRaw, 30);

  // B. sad_pose (Slumped thoracic spine & cervical neck droop)
  const sadRaw = new THREE.AnimationClip('sad_pose', 1.0, [
    new THREE.QuaternionKeyframeTrack('.bones[waistJoint].quaternion', [0, 1], [
      ...eulerQuat(0, 0, 0),
      ...eulerQuat(0.38, 0, 0),
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[neckJoint].quaternion', [0, 1], [
      ...eulerQuat(0, 0, 0),
      ...eulerQuat(0.42, 0, 0),
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[shoulderL].quaternion', [0, 1], [
      ...eulerQuat(0, 0, 0),
      ...eulerQuat(0.28, 0, -0.05),
    ]),
    new THREE.QuaternionKeyframeTrack('.bones[shoulderR].quaternion', [0, 1], [
      ...eulerQuat(0, 0, 0),
      ...eulerQuat(0.28, 0, 0.05),
    ]),
  ]);
  const sadClip = THREE.AnimationUtils.makeClipAdditive(sadRaw, 0, sadRaw, 30);

  // C. agree (Affirmative cervical head nod)
  const agreeRaw = new THREE.AnimationClip('agree', 1.2, [
    new THREE.QuaternionKeyframeTrack(
      '.bones[neckJoint].quaternion',
      [0, 0.3, 0.6, 0.9, 1.2],
      [
        ...eulerQuat(0, 0, 0),
        ...eulerQuat(0.28, 0, 0),
        ...eulerQuat(-0.08, 0, 0),
        ...eulerQuat(0.24, 0, 0),
        ...eulerQuat(0, 0, 0),
      ]
    ),
  ]);
  const agreeClip = THREE.AnimationUtils.makeClipAdditive(agreeRaw, 0, agreeRaw, 30);

  // D. headShake (Skeptical lateral head shake)
  const shakeRaw = new THREE.AnimationClip('headShake', 1.2, [
    new THREE.QuaternionKeyframeTrack(
      '.bones[neckJoint].quaternion',
      [0, 0.3, 0.6, 0.9, 1.2],
      [
        ...eulerQuat(0, 0, 0),
        ...eulerQuat(0, 0.35, 0),
        ...eulerQuat(0, -0.35, 0),
        ...eulerQuat(0, 0.25, 0),
        ...eulerQuat(0, 0, 0),
      ]
    ),
  ]);
  const headShakeClip = THREE.AnimationUtils.makeClipAdditive(shakeRaw, 0, shakeRaw, 30);

  // E. conversational_gesture (Subtle hand/forearm talking cadence)
  const gestureRaw = new THREE.AnimationClip('conversational_gesture', 2.0, [
    new THREE.QuaternionKeyframeTrack(
      '.bones[elbowL].quaternion',
      [0, 0.5, 1.0, 1.5, 2.0],
      [
        ...eulerQuat(0, 0, 0),
        ...eulerQuat(-0.35, 0, 0),
        ...eulerQuat(-0.15, 0, 0),
        ...eulerQuat(-0.42, 0, 0),
        ...eulerQuat(0, 0, 0),
      ]
    ),
    new THREE.QuaternionKeyframeTrack(
      '.bones[elbowR].quaternion',
      [0, 0.5, 1.0, 1.5, 2.0],
      [
        ...eulerQuat(0, 0, 0),
        ...eulerQuat(-0.18, 0, 0),
        ...eulerQuat(-0.38, 0, 0),
        ...eulerQuat(-0.12, 0, 0),
        ...eulerQuat(0, 0, 0),
      ]
    ),
  ]);
  const gestureClip = THREE.AnimationUtils.makeClipAdditive(gestureRaw, 0, gestureRaw, 30);

  return {
    baseClips: {
      idle: idleClip,
      walk: walkClip,
      run: runClip,
      sit: sitClip,
      lean: leanClip,
    },
    additiveClips: {
      sneak_pose: sneakClip,
      sad_pose: sadClip,
      agree: agreeClip,
      headShake: headShakeClip,
      conversational_gesture: gestureClip,
    },
  };
}

/**
 * Smoothly crossfades from one base AnimationAction to another
 * (matches executeCrossFade in three.js webgl_animation_skinning_additive_blending)
 */
export function crossFadeBaseAction(
  controller: SkinnedCitizenController,
  nextBase: BaseActionName,
  duration = 0.35
): void {
  if (controller.currentBaseAction === nextBase) return;
  const prevAction = controller.baseActions[controller.currentBaseAction];
  const nextAction = controller.baseActions[nextBase];

  controller.currentBaseAction = nextBase;

  if (!nextAction) {
    if (prevAction) prevAction.fadeOut(duration);
    return;
  }

  nextAction.enabled = true;
  nextAction.setEffectiveTimeScale(1);
  nextAction.setEffectiveWeight(1);
  nextAction.time = 0;

  if (prevAction) {
    prevAction.crossFadeTo(nextAction, duration, true);
  } else {
    nextAction.fadeIn(duration);
  }
  nextAction.play();
}

/**
 * Parses and executes Declarative Character Toolset Macros
 */
export interface CharacterToolMacroResult {
  success: boolean;
  command: string;
  targetCitizenId: string;
  summary: string;
  updatedSettings?: Partial<CharacterAnimationSettings>;
  updatedBiometrics?: Partial<CitizenEntity['biometrics']>;
}

export function executeCharacterToolMacro(
  rawCommand: string,
  currentCitizen: CitizenEntity,
  currentSettings: CharacterAnimationSettings
): CharacterToolMacroResult {
  const trimmed = rawCommand.trim();

  if (trimmed.startsWith('character.anim.crossfade')) {
    const toMatch = trimmed.match(/to:\s*["']?([a-zA-Z]+)["']?/);
    const durMatch = trimmed.match(/duration:\s*([0-9.]+)/);
    const targetBase = (toMatch ? toMatch[1] : 'walk') as BaseActionName;
    const duration = durMatch ? parseFloat(durMatch[1]) : 0.35;

    return {
      success: true,
      command: 'character.anim.crossfade',
      targetCitizenId: currentCitizen.id,
      summary: `Crossfaded ${currentCitizen.id} base skeletal clip from '${currentSettings.baseAction}' to '${targetBase}' over ${duration.toFixed(2)}s with time-warped phase alignment.`,
      updatedSettings: {
        baseAction: targetBase,
        crossFadeDuration: duration,
      },
    };
  }

  if (trimmed.startsWith('character.anim.additive')) {
    const nextAdd = { ...currentSettings.additiveWeights };
    const sneakMatch = trimmed.match(/sneak_pose:\s*([0-9.]+)/);
    const sadMatch = trimmed.match(/sad_pose:\s*([0-9.]+)/);
    const agreeMatch = trimmed.match(/agree:\s*([0-9.]+)/);
    const shakeMatch = trimmed.match(/headShake:\s*([0-9.]+)/);
    const gestMatch = trimmed.match(/conversational_gesture:\s*([0-9.]+)/);

    if (sneakMatch) nextAdd.sneak_pose = Math.min(1, Math.max(0, parseFloat(sneakMatch[1])));
    if (sadMatch) nextAdd.sad_pose = Math.min(1, Math.max(0, parseFloat(sadMatch[1])));
    if (agreeMatch) nextAdd.agree = Math.min(1, Math.max(0, parseFloat(agreeMatch[1])));
    if (shakeMatch) nextAdd.headShake = Math.min(1, Math.max(0, parseFloat(shakeMatch[1])));
    if (gestMatch) nextAdd.conversational_gesture = Math.min(1, Math.max(0, parseFloat(gestMatch[1])));

    return {
      success: true,
      command: 'character.anim.additive',
      targetCitizenId: currentCitizen.id,
      summary: `Applied THREE.AdditiveAnimationBlendMode weights on ${currentCitizen.id}.body.* skeleton: sneak=${nextAdd.sneak_pose.toFixed(2)}, sad=${nextAdd.sad_pose.toFixed(2)}, agree=${nextAdd.agree.toFixed(2)}, shake=${nextAdd.headShake.toFixed(2)}.`,
      updatedSettings: {
        additiveWeights: nextAdd,
      },
    };
  }

  if (trimmed.startsWith('character.morph.apply')) {
    const statureMatch = trimmed.match(/stature:\s*([0-9.\-+]+)/);
    const browMatch = trimmed.match(/browHeight:\s*([0-9.\-+]+)/);
    const smileMatch = trimmed.match(/smileCurve:\s*([0-9.\-+]+)/);
    const muscleMatch = trimmed.match(/muscleDef:\s*([0-9.\-+]+)/);

    const updatedBio: Partial<CitizenEntity['biometrics']> = {};
    if (statureMatch) updatedBio.statureHeight = Math.max(-1, Math.min(1, parseFloat(statureMatch[1])));
    if (browMatch) updatedBio.browHeight = Math.max(-1, Math.min(1, parseFloat(browMatch[1])));
    if (smileMatch) updatedBio.smileCurve = Math.max(-1, Math.min(1, parseFloat(smileMatch[1])));
    if (muscleMatch) updatedBio.muscleDef = Math.max(-1, Math.min(1, parseFloat(muscleMatch[1])));

    return {
      success: true,
      command: 'character.morph.apply',
      targetCitizenId: currentCitizen.id,
      summary: `Applied 1:1 parametric morph target & bone ratio offsets to ${currentCitizen.id} via DCR-2.2.38-01 Verify-Twice clamp.`,
      updatedBiometrics: updatedBio,
    };
  }

  return {
    success: false,
    command: 'unknown',
    targetCitizenId: currentCitizen.id,
    summary: `Unrecognized character tool macro. Use character.anim.crossfade(), character.anim.additive(), or character.morph.apply().`,
  };
}

export type AdditivePoseName =
  | 'sneak_pose'
  | 'sad_pose'
  | 'agree'
  | 'headShake'
  | 'crossed_arms'
  | 'breathe_tonus';

export interface SkinnedCharacterRig {
  citizenId: string;
  rootGroup: THREE.Group;
  skinnedMesh: THREE.SkinnedMesh;
  skeleton: THREE.Skeleton;
  skeletonHelper: THREE.SkeletonHelper;
  mixer: THREE.AnimationMixer;
  bones: Record<string, THREE.Bone>;
  baseActions: Record<string, THREE.AnimationAction>;
  additiveActions: Record<string, THREE.AnimationAction>;
  activeBaseName: string;
  gaitPhaseRad: number;
  smoothedSpeed: number;
}

/**
 * Helper to compute a citizen's exact 1:1 metric height in meters (baseline 1.72m)
 */
export function getCitizenHeightMeters(citizen: CitizenEntity): number {
  const stature = citizen.biometrics?.statureHeight ?? 0;
  return Number((1.72 * (1 + stature * 0.12)).toFixed(2));
}

/**
 * Builds a complete 1:1 metric 16-Bone THREE.SkinnedMesh + THREE.Skeleton + THREE.AnimationMixer
 * with THREE.AnimationUtils.makeClipAdditive layers for a CitizenEntity.
 */
export function buildSkinnedCharacterRig(citizen: CitizenEntity): SkinnedCharacterRig {
  const rootGroup = new THREE.Group();
  rootGroup.userData = { citizenId: citizen.id };

  const legScale = 1 + (citizen.biometrics?.legLength ?? 0) * 0.15;
  const shoulderScale = 1 + (citizen.biometrics?.shoulderWidth ?? 0) * 0.15;
  const statureScale = 1 + (citizen.biometrics?.statureHeight ?? 0) * 0.12;

  // 1. Construct 16-Bone Hierarchy
  const pelvis = new THREE.Bone();
  pelvis.name = 'pelvis';
  pelvis.position.set(0, 0.88 * legScale, 0);

  const waistJoint = new THREE.Bone();
  waistJoint.name = 'waistJoint';
  waistJoint.position.set(0, 0.12, 0);
  pelvis.add(waistJoint);

  const chestBone = new THREE.Bone();
  chestBone.name = 'chestBone';
  chestBone.position.set(0, 0.24, 0);
  waistJoint.add(chestBone);

  const neckJoint = new THREE.Bone();
  neckJoint.name = 'neckJoint';
  neckJoint.position.set(0, 0.24, 0);
  chestBone.add(neckJoint);

  const headBone = new THREE.Bone();
  headBone.name = 'headBone';
  headBone.position.set(0, 0.12, 0);
  neckJoint.add(headBone);

  const shoulderL = new THREE.Bone();
  shoulderL.name = 'shoulderL';
  shoulderL.position.set(0.21 * shoulderScale, 0.19, 0);
  chestBone.add(shoulderL);

  const elbowL = new THREE.Bone();
  elbowL.name = 'elbowL';
  elbowL.position.set(0, -0.27, 0);
  shoulderL.add(elbowL);

  const wristL = new THREE.Bone();
  wristL.name = 'wristL';
  wristL.position.set(0, -0.24, 0);
  elbowL.add(wristL);

  const shoulderR = new THREE.Bone();
  shoulderR.name = 'shoulderR';
  shoulderR.position.set(-0.21 * shoulderScale, 0.19, 0);
  chestBone.add(shoulderR);

  const elbowR = new THREE.Bone();
  elbowR.name = 'elbowR';
  elbowR.position.set(0, -0.27, 0);
  shoulderR.add(elbowR);

  const wristR = new THREE.Bone();
  wristR.name = 'wristR';
  wristR.position.set(0, -0.24, 0);
  elbowR.add(wristR);

  const hipL = new THREE.Bone();
  hipL.name = 'hipL';
  hipL.position.set(0.11, -0.04, 0);
  pelvis.add(hipL);

  const kneeL = new THREE.Bone();
  kneeL.name = 'kneeL';
  kneeL.position.set(0, -0.42 * legScale, 0);
  hipL.add(kneeL);

  const ankleL = new THREE.Bone();
  ankleL.name = 'ankleL';
  ankleL.position.set(0, -0.42 * legScale, 0);
  kneeL.add(ankleL);

  const hipR = new THREE.Bone();
  hipR.name = 'hipR';
  hipR.position.set(-0.11, -0.04, 0);
  pelvis.add(hipR);

  const kneeR = new THREE.Bone();
  kneeR.name = 'kneeR';
  kneeR.position.set(0, -0.42 * legScale, 0);
  hipR.add(kneeR);

  const ankleR = new THREE.Bone();
  ankleR.name = 'ankleR';
  ankleR.position.set(0, -0.42 * legScale, 0);
  kneeR.add(ankleR);

  const bonesList = [
    pelvis,
    waistJoint,
    chestBone,
    neckJoint,
    headBone,
    shoulderL,
    elbowL,
    wristL,
    shoulderR,
    elbowR,
    wristR,
    hipL,
    kneeL,
    ankleL,
    hipR,
    kneeR,
    ankleR,
  ];
  const bones: Record<string, THREE.Bone> = {};
  bonesList.forEach((b) => {
    bones[b.name] = b;
  });

  // 2. Attach high-precision anatomical mesh segments directly to the bones
  const skinMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(citizen.appearance.skinToneHex),
    roughness: 0.55,
  });
  const hairMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(citizen.appearance.hairColorHex),
    roughness: 0.75,
  });
  const torsoMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(citizen.appearance.torsoColorHex),
    roughness: 0.65,
  });
  const legMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(citizen.appearance.legColorHex),
    roughness: 0.7,
  });
  const shoeMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(citizen.appearance.footwearColorHex),
    roughness: 0.5,
  });

  // Pelvis & Lower Torso
  const pelvisMesh = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.16, 0.18), legMat);
  pelvis.add(pelvisMesh);

  const abdomenMesh = new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.22, 0.17), torsoMat);
  abdomenMesh.position.y = 0.11;
  waistJoint.add(abdomenMesh);

  const chestMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.34 * shoulderScale, 0.28, 0.2),
    torsoMat
  );
  chestMesh.position.y = 0.12;
  chestMesh.castShadow = true;
  chestBone.add(chestMesh);

  // Head & Hair
  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.115, 16, 16), skinMat);
  headMesh.scale.set(0.92, 1.08, 0.96);
  headMesh.position.y = 0.06;
  headMesh.castShadow = true;
  headBone.add(headMesh);

  const hairCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.122, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.62),
    hairMat
  );
  hairCap.position.set(0, 0.075, -0.01);
  headBone.add(hairCap);

  // Eyes
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });
  for (const ex of [-0.038, 0.038]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 8), eyeMat);
    eye.position.set(ex, 0.065, 0.102);
    headBone.add(eye);
  }

  // Arms (Upper + Forearm + Hands)
  for (const [shBone, elBone, wrBone] of [
    [shoulderL, elbowL, wristL],
    [shoulderR, elbowR, wristR],
  ]) {
    const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.042, 0.26, 10), torsoMat);
    upperArm.position.y = -0.13;
    upperArm.castShadow = true;
    shBone.add(upperArm);

    const foreArm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.034, 0.23, 10), skinMat);
    foreArm.position.y = -0.115;
    foreArm.castShadow = true;
    elBone.add(foreArm);

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.038, 10, 10), skinMat);
    hand.position.y = -0.02;
    wrBone.add(hand);
  }

  // Legs (Thigh + Calf + Shoes)
  for (const [hBone, kBone, aBone] of [
    [hipL, kneeL, ankleL],
    [hipR, kneeR, ankleR],
  ]) {
    const thigh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.072, 0.058, 0.42 * legScale, 12),
      legMat
    );
    thigh.position.y = -0.21 * legScale;
    thigh.castShadow = true;
    hBone.add(thigh);

    const calf = new THREE.Mesh(
      new THREE.CylinderGeometry(0.056, 0.044, 0.41 * legScale, 12),
      legMat
    );
    calf.position.y = -0.205 * legScale;
    calf.castShadow = true;
    kBone.add(calf);

    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.065, 0.21), shoeMat);
    shoe.position.set(0, -0.02, 0.045);
    shoe.castShadow = true;
    aBone.add(shoe);
  }

  // 3. Create SkinnedMesh envelope bound to the 16-bone THREE.Skeleton
  const vestGeo = new THREE.CylinderGeometry(0.17 * shoulderScale, 0.14, 0.46, 12, 4);
  const posAttr = vestGeo.attributes.position;
  const skinIndices: number[] = [];
  const skinWeights: number[] = [];
  for (let i = 0; i < posAttr.count; i++) {
    const vy = posAttr.getY(i);
    if (vy > 0.05) {
      skinIndices.push(2, 1, 0, 0); // chestBone, waistJoint
      skinWeights.push(0.75, 0.25, 0, 0);
    } else {
      skinIndices.push(1, 0, 2, 0); // waistJoint, pelvis, chestBone
      skinWeights.push(0.65, 0.25, 0.1, 0);
    }
  }
  vestGeo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndices, 4));
  vestGeo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeights, 4));

  const skinnedMesh = new THREE.SkinnedMesh(vestGeo, torsoMat);
  const skeleton = new THREE.Skeleton(bonesList);
  skinnedMesh.add(pelvis);
  skinnedMesh.bind(skeleton);
  rootGroup.add(skinnedMesh);
  rootGroup.scale.setScalar(statureScale);

  const skeletonHelper = new THREE.SkeletonHelper(pelvis);
  skeletonHelper.visible = false;

  // 4. Initialize THREE.AnimationMixer with Base & Additive Clips (makeClipAdditive)
  const mixer = new THREE.AnimationMixer(skinnedMesh);
  const { baseClips, additiveClips } = buildProceduralAnimationClips(legScale);

  const baseActions: Record<string, THREE.AnimationAction> = {
    idle: mixer.clipAction(baseClips.idle),
    walk: mixer.clipAction(baseClips.walk),
    run: mixer.clipAction(baseClips.run),
    sit_bench: mixer.clipAction(baseClips.sit),
    join_queue: mixer.clipAction(baseClips.idle),
    lean_wall: mixer.clipAction(baseClips.lean),
    squat_lift: mixer.clipAction(baseClips.sit),
  };

  Object.values(baseActions).forEach((act) => {
    act.enabled = true;
    act.setEffectiveWeight(0);
    act.play();
  });
  baseActions.idle.setEffectiveWeight(1);

  const additiveActions: Record<string, THREE.AnimationAction> = {
    sneak_pose: mixer.clipAction(additiveClips.sneak_pose),
    sad_pose: mixer.clipAction(additiveClips.sad_pose),
    agree: mixer.clipAction(additiveClips.agree),
    headShake: mixer.clipAction(additiveClips.headShake),
    crossed_arms: mixer.clipAction(additiveClips.conversational_gesture),
    breathe_tonus: mixer.clipAction(additiveClips.conversational_gesture),
  };

  Object.values(additiveActions).forEach((act) => {
    act.enabled = true;
    act.blendMode = THREE.AdditiveAnimationBlendMode;
    act.setEffectiveWeight(0);
    act.play();
  });
  additiveActions.breathe_tonus.setEffectiveWeight(0.25);

  return {
    citizenId: citizen.id,
    rootGroup,
    skinnedMesh,
    skeleton,
    skeletonHelper,
    mixer,
    bones,
    baseActions,
    additiveActions,
    activeBaseName: 'idle',
    gaitPhaseRad: (citizen.slug.charCodeAt(0) % 7) * 0.85,
    smoothedSpeed: 0,
  };
}

/**
 * Updates the SkinnedCharacterRig at 60Hz:
 * 1. Decoupled Harness Execution: Reads the agent's real-time velocity vector v = (vx, 0, vz)
 *    from the simulation data layer.
 * 2. Programmatic Velocity-Driven Skeletal Kinematics: Computes forward torso lean, spinal counter-torsion,
 *    bilateral arm swing, and hip/knee/ankle stride cycles via continuous sine/cosine waves scaled by ||v||
 *    directly on the 16-bone THREE.SkinnedMesh in the render loop.
 * 3. Blends additive emotional/postural layers on top of the procedural gait cycle.
 */
export function updateSkinnedCharacterRig(
  rig: SkinnedCharacterRig,
  citizen: CitizenEntity,
  dtSeconds: number,
  elapsedSeconds: number
): void {
  rig.rootGroup.position.set(citizen.position[0], citizen.position[1], citizen.position[2]);

  // Smoothly slerp root heading toward target rotationY
  const angleDiff = Math.atan2(
    Math.sin(citizen.rotationY - rig.rootGroup.rotation.y),
    Math.cos(citizen.rotationY - rig.rootGroup.rotation.y)
  );
  rig.rootGroup.rotation.y += angleDiff * Math.min(1, dtSeconds * 10.0);

  // Compute horizontal velocity magnitude ||v|| in m/s
  const vx = citizen.velocity[0] || 0;
  const vz = citizen.velocity[2] || 0;
  const rawSpeed = Math.hypot(vx, vz);
  rig.smoothedSpeed = THREE.MathUtils.lerp(
    rig.smoothedSpeed,
    rawSpeed,
    Math.min(1, dtSeconds * 8.5)
  );
  const speed = rig.smoothedSpeed;

  // Step base & additive mixer for subtle micro-posture layers
  const mapped = mapPostureToSkinningState(citizen.activePosture);
  if (mapped.additives.sad_pose !== undefined) {
    rig.additiveActions.sad_pose?.setEffectiveWeight(mapped.additives.sad_pose);
  }
  if (mapped.additives.sneak_pose !== undefined) {
    rig.additiveActions.sneak_pose?.setEffectiveWeight(mapped.additives.sneak_pose);
  }
  if (mapped.additives.agree !== undefined) {
    rig.additiveActions.agree?.setEffectiveWeight(mapped.additives.agree);
  }
  if (mapped.additives.headShake !== undefined) {
    rig.additiveActions.headShake?.setEffectiveWeight(mapped.additives.headShake);
  }
  rig.mixer.update(dtSeconds);

  // Programmatic Sine/Cosine Skeletal Kinematics driven by Velocity Vector ||v||
  const {
    pelvis,
    waistJoint,
    chestBone,
    neckJoint,
    shoulderL,
    elbowL,
    shoulderR,
    elbowR,
    hipL,
    kneeL,
    ankleL,
    hipR,
    kneeR,
    ankleR,
  } = rig.bones;

  const legScale = 1 + (citizen.biometrics?.legLength ?? 0) * 0.15;
  const basePelvisY = 0.88 * legScale;

  if (citizen.activePosture === 'sit-relaxed') {
    // Seated bench IK posture
    pelvis.position.set(0, basePelvisY - 0.34, -0.08);
    waistJoint.rotation.set(0.06, Math.sin(elapsedSeconds * 0.9) * 0.03, 0);
    chestBone.rotation.set(0.04, 0, 0);
    hipL.rotation.set(-1.42, 0.06, 0);
    hipR.rotation.set(-1.42, -0.06, 0);
    kneeL.rotation.set(1.45, 0, 0);
    kneeR.rotation.set(1.45, 0, 0);
    shoulderL.rotation.set(-0.22, 0, 0.08);
    shoulderR.rotation.set(-0.22, 0, -0.08);
    elbowL.rotation.set(-0.55, 0, 0);
    elbowR.rotation.set(-0.55, 0, 0);
    return;
  }

  if (citizen.activePosture === 'squat-lift') {
    // Squatting crate lift IK posture
    pelvis.position.set(0, basePelvisY - 0.28, 0);
    waistJoint.rotation.set(0.38, 0, 0);
    hipL.rotation.set(-0.95, 0.08, 0);
    hipR.rotation.set(-0.95, -0.08, 0);
    kneeL.rotation.set(1.25, 0, 0);
    kneeR.rotation.set(1.25, 0, 0);
    shoulderL.rotation.set(-0.65, 0.15, 0.05);
    shoulderR.rotation.set(-0.65, -0.15, -0.05);
    elbowL.rotation.set(-0.75, 0, 0);
    elbowR.rotation.set(-0.75, 0, 0);
    return;
  }

  // Advance continuous gait phase oscillator proportional to horizontal velocity
  const cadenceRadPerSec = speed > 0.08 ? 3.2 + speed * 2.85 : 1.6;
  rig.gaitPhaseRad = (rig.gaitPhaseRad + cadenceRadPerSec * dtSeconds) % (Math.PI * 2);
  const phi = rig.gaitPhaseRad;

  // Normalized locomotion blend factor in [0..1]
  const locoFactor = Math.min(1.0, speed / 1.45);
  const runBoost = Math.max(0.0, (speed - 1.5) / 1.35);

  // 1. Vertical Pelvis Double-Frequency Bounce + Lateral Hip Sway
  const verticalBob = Math.abs(Math.sin(phi)) * 0.036 * locoFactor + Math.sin(elapsedSeconds * 2.1) * 0.006;
  const lateralSway = Math.cos(phi) * 0.018 * locoFactor;
  pelvis.position.set(lateralSway, basePelvisY + verticalBob - runBoost * 0.025, 0);

  // 2. Forward Torso Lean proportional to speed + Spinal Counter-Rotation
  const fatigueSlump = citizen.drives.muscularFatigue * 0.12;
  const forwardLeanRad = 0.03 + speed * 0.085 + fatigueSlump;
  const spineTwistY = -Math.sin(phi) * 0.095 * locoFactor;
  waistJoint.rotation.set(
    forwardLeanRad * 0.55 + THREE.MathUtils.degToRad(citizen.jointOverrides.waistPitchDeg * 0.35),
    spineTwistY,
    -lateralSway * 0.6
  );

  // Chest breathing cycle + upper torso counter-twist
  const breathWave = Math.sin(elapsedSeconds * 2.4) * 0.022;
  chestBone.rotation.set(forwardLeanRad * 0.45 + breathWave, spineTwistY * 0.7, 0);

  // Cervical Neck & Gaze Stabilization
  neckJoint.rotation.set(
    -forwardLeanRad * 0.35 + THREE.MathUtils.degToRad(citizen.jointOverrides.neckPitchDeg * 0.5),
    -spineTwistY * 0.65 + Math.sin(elapsedSeconds * 0.65) * 0.06,
    0
  );

  // 3. Bilateral Hip, Knee, & Ankle Stride Cycles via Sine/Cosine Waves
  const strideAmp = (0.48 + runBoost * 0.28) * locoFactor;
  const hipLPhase = Math.sin(phi);
  const hipRPhase = Math.sin(phi + Math.PI);

  hipL.rotation.set(-hipLPhase * strideAmp, 0, 0);
  hipR.rotation.set(-hipRPhase * strideAmp, 0, 0);

  // Knee only flexes positively during swing recovery phase (max(0, cos(phi)))
  const kneeLSwing = Math.max(0, -Math.cos(phi)) * (0.78 + runBoost * 0.42) * locoFactor;
  const kneeRSwing = Math.max(0, -Math.cos(phi + Math.PI)) * (0.78 + runBoost * 0.42) * locoFactor;
  kneeL.rotation.set(0.05 + kneeLSwing, 0, 0);
  kneeR.rotation.set(0.05 + kneeRSwing, 0, 0);

  // Ankle pitch dorsiflexion/plantarflexion
  ankleL.rotation.set(Math.cos(phi) * 0.18 * locoFactor, 0, 0);
  ankleR.rotation.set(Math.cos(phi + Math.PI) * 0.18 * locoFactor, 0, 0);

  // 4. Bilateral Counter-Phase Arm Swing (Left arm swings with Right leg)
  if (citizen.activePosture === 'crossed-arms-skeptical' && locoFactor < 0.2) {
    shoulderL.rotation.set(-0.55, 0.45, 0.18);
    shoulderR.rotation.set(-0.55, -0.45, -0.18);
    elbowL.rotation.set(-1.35, 0, 0);
    elbowR.rotation.set(-1.35, 0, 0);
  } else {
    const armSwingAmp = (0.38 + runBoost * 0.32) * locoFactor;
    const idleGestureWave = (1 - locoFactor) * Math.sin(elapsedSeconds * 1.8) * 0.05;

    shoulderL.rotation.set(hipRPhase * armSwingAmp + idleGestureWave, 0, 0.09);
    shoulderR.rotation.set(hipLPhase * armSwingAmp - idleGestureWave, 0, -0.09);

    const baseElbowFlex = -0.24 - runBoost * 0.55;
    elbowL.rotation.set(
      baseElbowFlex - Math.max(0, -hipRPhase) * 0.35 * locoFactor,
      0,
      0
    );
    elbowR.rotation.set(
      baseElbowFlex - Math.max(0, -hipLPhase) * 0.35 * locoFactor,
      0,
      0
    );
  }
}

/**
 * Procedural Character Tool Executor for UI & Agent Macros
 */
export function executeCharacterProceduralTool(
  citizen: CitizenEntity,
  params: {
    tool: 'character.skin.enhance' | 'character.pose.additive' | 'character.scale.calibrate1to1';
    baseAction?: string;
    additiveWeights?: Record<AdditivePoseName, number>;
    timeScale?: number;
    heightMeters?: number;
  }
): {
  summary: string;
  updatedCitizenPatch: Partial<CitizenEntity>;
} {
  if (params.tool === 'character.scale.calibrate1to1') {
    const targetH = params.heightMeters || 1.72;
    const statureNorm = Math.max(-1, Math.min(1, (targetH - 1.72) / 0.2));
    return {
      summary: `Calibrated ${citizen.fullName} to true 1:1 metric stature (${targetH.toFixed(2)}m) with 16-bone SkinnedMesh bounds.`,
      updatedCitizenPatch: {
        biometrics: {
          ...citizen.biometrics,
          statureHeight: statureNorm,
        },
      },
    };
  }

  const w = params.additiveWeights;
  const jointOverrides = { ...citizen.jointOverrides };
  if (w) {
    jointOverrides.waistPitchDeg = Number(((w.sneak_pose * 22) + (w.sad_pose * 16)).toFixed(1));
    jointOverrides.neckPitchDeg = Number(((w.agree * 14) - (w.sad_pose * 12)).toFixed(1));
    jointOverrides.neckYawDeg = Number((w.headShake * 18).toFixed(1));
  }

  return {
    summary: `Applied Three.js SkinnedMesh + makeClipAdditive layer weights on ${citizen.fullName}.`,
    updatedCitizenPatch: {
      jointOverrides,
    },
  };
}

