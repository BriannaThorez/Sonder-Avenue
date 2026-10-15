import React, { useState } from 'react';
import {
  CitizenEntity,
  CreateCitizenFactoryInput,
  PostureSynergy,
} from '../core/citizenVfs';
import {
  VIA_VIRTUE_DEFINITIONS,
  JungianFunction,
} from '../core/personaCalculus';
import {
  BaseActionName,
  AdditivePoseName,
  executeCharacterProceduralTool,
  getCitizenHeightMeters,
} from '../core/characterSkinningEngine';
import { X, Sparkles, Bone, Activity, Sliders, CheckCircle2, UserPlus } from 'lucide-react';

interface CharacterFactoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCitizen: (input: CreateCitizenFactoryInput) => CitizenEntity;
  onSpawnProp?: (prop: {
    name: string;
    category: 'bench' | 'tree' | 'streetlight' | 'kiosk' | 'planter' | 'crate';
    primaryColor: string;
    scale: number;
  }) => void;
  existingCitizens: CitizenEntity[];
  selectedCitizen?: CitizenEntity;
  onUpdateCitizen?: (updated: CitizenEntity) => void;
  showSkeletonHelpers?: boolean;
  onToggleSkeletonHelpers?: () => void;
}

const BASE_ACTION_TO_POSTURE: Record<string, PostureSynergy> = {
  None: 'stand-conversational-ready',
  idle: 'stand-conversational-ready',
  walk: 'walk-composed',
  run: 'run-brisk',
  sit: 'sit-relaxed',
  lean: 'lean-casual',
  sit_bench: 'sit-relaxed',
  join_queue: 'stand-conversational-ready',
  lean_wall: 'lean-casual',
  squat_lift: 'squat-lift',
};

export const CharacterFactoryPanel: React.FC<CharacterFactoryPanelProps> = ({
  isOpen,
  onClose,
  onCreateCitizen,
  existingCitizens,
  selectedCitizen,
  onUpdateCitizen,
  showSkeletonHelpers = false,
  onToggleSkeletonHelpers,
}) => {
  const [activeTab, setActiveTab] = useState<'skinning' | 'factory'>('skinning');

  // Three.js Skinning & Additive Blending state
  const [baseAction, setBaseAction] = useState<BaseActionName>('idle');
  const [additiveWeights, setAdditiveWeights] = useState<Record<AdditivePoseName, number>>({
    sneak_pose: 0.0,
    sad_pose: 0.0,
    agree: 0.0,
    headShake: 0.0,
    crossed_arms: 0.0,
    breathe_tonus: 0.35,
  });
  const [timeScale, setTimeScale] = useState<number>(1.0);
  const [macroCommand, setMacroCommand] = useState<string>(
    'character.skin.enhance({ rig: "16-bone-humanoid", metricScale: 1.0, additiveLayer: "agree", weight: 0.65 })'
  );
  const [toolFeedback, setToolFeedback] = useState<string | null>(null);

  // New Citizen Factory state (1:1 metric)
  const [slug, setSlug] = useState('claire-vance');
  const [fullName, setFullName] = useState('Claire Vance');
  const [roleTitle, setRoleTitle] = useState('Marine Hydrologist');
  const [jungian, setJungian] = useState<JungianFunction>('Ni');
  const [heightMeters, setHeightMeters] = useState(1.71);
  const [shoulderScale, setShoulderScale] = useState(0.0);
  const [legLengthScale, setLegLengthScale] = useState(0.02);
  const [torsoScale, setTorsoScale] = useState(0.0);
  const [strideCadenceHz, setStrideCadenceHz] = useState(1.62);
  const [jacketHex, setJacketHex] = useState('#2b6cb0');
  const [trouserHex, setTrouserHex] = useState('#334155');
  const [hairHex, setHairHex] = useState('#4a2c18');
  const [skinHex, setSkinHex] = useState('#ecc9a8');
  const [primaryVirtue, setPrimaryVirtue] = useState('curiosity');
  const [secondaryVirtue, setSecondaryVirtue] = useState('perspective');

  if (!isOpen) return null;

  const targetCitizen = selectedCitizen || existingCitizens[0];

  const handleApplyBaseAction = (actionName: string) => {
    setBaseAction(actionName as BaseActionName);
    if (!targetCitizen || !onUpdateCitizen) return;
    const mappedPosture = BASE_ACTION_TO_POSTURE[actionName] || 'stand-conversational-ready';
    onUpdateCitizen({
      ...targetCitizen,
      activePosture: mappedPosture,
    });
    setToolFeedback(`Crossfaded ${targetCitizen.fullName} base skeletal clip → "${actionName}" (0.35s warp)`);
  };

  const handleAdditiveWeightChange = (pose: AdditivePoseName, value: number) => {
    const next = { ...additiveWeights, [pose]: value };
    setAdditiveWeights(next);

    if (!targetCitizen || !onUpdateCitizen) return;
    const res = executeCharacterProceduralTool(targetCitizen, {
      tool: 'character.pose.additive',
      additiveWeights: next,
      timeScale,
    });
    onUpdateCitizen({
      ...targetCitizen,
      ...res.updatedCitizenPatch,
    });
  };

  const handleRunEnhanceMacro = () => {
    if (!targetCitizen || !onUpdateCitizen) return;
    const res = executeCharacterProceduralTool(targetCitizen, {
      tool: 'character.skin.enhance',
      baseAction,
      additiveWeights,
      timeScale,
      heightMeters: getCitizenHeightMeters(targetCitizen),
    });
    onUpdateCitizen({
      ...targetCitizen,
      ...res.updatedCitizenPatch,
    });
    setToolFeedback(res.summary);
  };

  const handleCalibrateAll1to1 = () => {
    if (!targetCitizen || !onUpdateCitizen) return;
    const currentH = getCitizenHeightMeters(targetCitizen);
    const res = executeCharacterProceduralTool(targetCitizen, {
      tool: 'character.scale.calibrate1to1',
      heightMeters: Math.max(1.58, Math.min(1.92, currentH)),
    });
    onUpdateCitizen({
      ...targetCitizen,
      ...res.updatedCitizenPatch,
    });
    setToolFeedback(res.summary);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = onCreateCitizen({
      slug,
      fullName,
      roleTitle,
      jungianFunction: jungian,
      heightMeters,
      proportions: {
        shoulderWidthScale: shoulderScale,
        legLengthScale,
        torsoDepthScale: torsoScale,
        headScale: 0,
        strideCadenceHz,
      },
      palette: {
        skinToneHex: skinHex,
        hairHex,
        jacketHex,
        trouserHex,
        accentHex: '#0d9488',
      },
      topVirtues: [
        { slug: primaryVirtue, weight: 0.92 },
        { slug: secondaryVirtue, weight: 0.86 },
      ],
    });
    setToolFeedback(`Spawned 1:1 Skinned Citizen ${created.fullName} (${getCitizenHeightMeters(created).toFixed(2)}m) at safe non-overlapping coordinates.`);
    setSlug(`citizen-${Date.now().toString().slice(-3)}`);
  };

  return (
    <div className="fixed top-12 right-3 z-30 w-[340px] max-h-[calc(100vh-64px)] flex flex-col rounded-xl bg-[#FAF7F2]/94 backdrop-blur-xl border border-stone-300/90 shadow-xl text-stone-800 overflow-hidden">
      {/* Header */}
      <div className="px-3.5 py-2.5 border-b border-stone-200/90 flex items-center justify-between bg-[#F3EFE6]/90">
        <div className="flex items-center gap-2">
          <Bone className="w-4 h-4 text-teal-700" />
          <div>
            <h2 className="text-xs font-semibold text-stone-900 leading-tight">
              Three.js Skinning & Additive Blending
            </h2>
            <p className="text-[10px] text-stone-500 font-mono">
              16-Bone SkinnedMesh • 1:1 Metric Rig
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-stone-500 hover:text-stone-800 hover:bg-stone-200/70 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Mode Switcher */}
      <div className="px-3 pt-2 flex gap-1 border-b border-stone-200/80 bg-[#FAF7F2]">
        <button
          onClick={() => setActiveTab('skinning')}
          className={`flex-1 pb-2 text-[11px] font-semibold border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'skinning'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Sliders className="w-3 h-3" />
          <span>Additive Blending Rig</span>
        </button>
        <button
          onClick={() => setActiveTab('factory')}
          className={`flex-1 pb-2 text-[11px] font-semibold border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'factory'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <UserPlus className="w-3 h-3" />
          <span>1:1 Citizen Spawner</span>
        </button>
      </div>

      {/* Body */}
      <div className="p-3.5 overflow-y-auto space-y-3 text-xs">
        {activeTab === 'skinning' && targetCitizen && (
          <>
            {/* Active Target Citizen Banner */}
            <div className="p-2.5 rounded-lg bg-white/85 border border-stone-200/90 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
                  Active Skinned Rig
                </div>
                <div className="text-xs font-semibold text-stone-900">
                  {targetCitizen.fullName}{' '}
                  <span className="font-mono text-[10px] text-teal-700">
                    ({getCitizenHeightMeters(targetCitizen).toFixed(2)}m • 1:1)
                  </span>
                </div>
              </div>
              {onToggleSkeletonHelpers && (
                <button
                  onClick={onToggleSkeletonHelpers}
                  className={`px-2 py-1 rounded text-[10px] font-medium border transition-colors ${
                    showSkeletonHelpers
                      ? 'bg-teal-700 text-white border-teal-800'
                      : 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200'
                  }`}
                >
                  {showSkeletonHelpers ? 'Hide Bones' : 'Show 16 Bones'}
                </button>
              )}
            </div>

            {/* Base Actions (CrossFade Controls matching Three.js example) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-stone-700">
                  Base Skeletal Actions (CrossFade)
                </span>
                <span className="text-[10px] font-mono text-stone-500">0.35s warp</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {(
                  [
                    'idle',
                    'walk',
                    'run',
                    'sit_bench',
                    'join_queue',
                    'lean_wall',
                    'squat_lift',
                  ] as BaseActionName[]
                ).map((act) => (
                  <button
                    key={act}
                    onClick={() => handleApplyBaseAction(act)}
                    className={`px-2 py-1 rounded text-[10px] font-mono font-medium border transition-all ${
                      baseAction === act
                        ? 'bg-teal-700 text-white border-teal-800 shadow-xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {act}
                  </button>
                ))}
              </div>
            </div>

            {/* Additive Animation Blending Weights (makeClipAdditive) */}
            <div className="p-2.5 rounded-lg bg-white/85 border border-stone-200/90 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-stone-800 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-amber-600" />
                  <span>Additive Pose Blending Layers</span>
                </span>
                <span className="text-[9px] font-mono text-stone-400">
                  makeClipAdditive
                </span>
              </div>

              {(
                [
                  { key: 'sneak_pose', label: 'sneak_pose (Forward Crouch)' },
                  { key: 'sad_pose', label: 'sad_pose (Allostatic Slump)' },
                  { key: 'agree', label: 'agree (Harmonic Head Nod)' },
                  { key: 'headShake', label: 'headShake (Firewall Veto)' },
                  { key: 'crossed_arms', label: 'crossed_arms (Skeptical Fold)' },
                  { key: 'breathe_tonus', label: 'breathe_tonus (Chest Cycle)' },
                ] as Array<{ key: AdditivePoseName; label: string }>
              ).map(({ key, label }) => (
                <div key={key} className="space-y-0.5">
                  <div className="flex justify-between text-[10px]">
                    <span className="font-mono text-stone-700">{label}</span>
                    <span className="font-mono font-semibold text-teal-700">
                      {additiveWeights[key].toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={additiveWeights[key]}
                    onChange={(e) =>
                      handleAdditiveWeightChange(key, parseFloat(e.target.value))
                    }
                    className="w-full h-1.5 accent-teal-700 bg-stone-200 rounded-lg cursor-pointer"
                  />
                </div>
              ))}

              {/* TimeScale Slider */}
              <div className="pt-1 border-t border-stone-200/80 space-y-0.5">
                <div className="flex justify-between text-[10px]">
                  <span className="font-semibold text-stone-700">
                    Mixer TimeScale Speed
                  </span>
                  <span className="font-mono text-stone-600">
                    {timeScale.toFixed(2)}x
                  </span>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={1.8}
                  step={0.05}
                  value={timeScale}
                  onChange={(e) => setTimeScale(parseFloat(e.target.value))}
                  className="w-full h-1.5 accent-amber-600 bg-stone-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Procedural Character Tool Enhancement Macro */}
            <div className="p-2.5 rounded-lg bg-[#F3EFE6]/90 border border-stone-300/80 space-y-2">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-stone-600">
                Procedural Character Enhancement Tool
              </div>
              <textarea
                rows={2}
                value={macroCommand}
                onChange={(e) => setMacroCommand(e.target.value)}
                className="w-full p-1.5 rounded bg-white border border-stone-300 font-mono text-[10px] text-stone-800 focus:outline-none focus:border-teal-600"
              />
              <div className="flex gap-1.5">
                <button
                  onClick={handleRunEnhanceMacro}
                  className="flex-1 py-1.5 px-2.5 rounded-md bg-teal-700 hover:bg-teal-800 text-white font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Apply Skinning Enhancement</span>
                </button>
                <button
                  onClick={handleCalibrateAll1to1}
                  className="py-1.5 px-2.5 rounded-md bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 font-semibold text-[11px] transition-colors"
                >
                  1:1 Lock
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'factory' && (
          <form onSubmit={handleCreateSubmit} className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-stone-600 mb-0.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                  }}
                  className="w-full px-2 py-1 rounded bg-white border border-stone-300 text-xs text-stone-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-stone-600 mb-0.5">
                  Vocation Role
                </label>
                <input
                  type="text"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  className="w-full px-2 py-1 rounded bg-white border border-stone-300 text-xs text-stone-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-stone-600 mb-0.5">
                  1:1 Height: {heightMeters.toFixed(2)}m
                </label>
                <input
                  type="range"
                  min={1.55}
                  max={1.95}
                  step={0.01}
                  value={heightMeters}
                  onChange={(e) => setHeightMeters(parseFloat(e.target.value))}
                  className="w-full accent-teal-700"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-stone-600 mb-0.5">
                  Jungian Gate
                </label>
                <select
                  value={jungian}
                  onChange={(e) => setJungian(e.target.value as JungianFunction)}
                  className="w-full px-2 py-1 rounded bg-white border border-stone-300 text-xs"
                >
                  {(['Ni', 'Ne', 'Ti', 'Te', 'Fi', 'Fe', 'Si', 'Se'] as JungianFunction[]).map(
                    (fn) => (
                      <option key={fn} value={fn}>
                        {fn} Dominant
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] text-stone-600">
                  Shoulders ({shoulderScale.toFixed(2)})
                </label>
                <input
                  type="range"
                  min={-0.6}
                  max={0.6}
                  step={0.05}
                  value={shoulderScale}
                  onChange={(e) => setShoulderScale(parseFloat(e.target.value))}
                  className="w-full accent-teal-700"
                />
              </div>
              <div>
                <label className="block text-[10px] text-stone-600">
                  Legs ({legLengthScale.toFixed(2)})
                </label>
                <input
                  type="range"
                  min={-0.6}
                  max={0.6}
                  step={0.05}
                  value={legLengthScale}
                  onChange={(e) => setLegLengthScale(parseFloat(e.target.value))}
                  className="w-full accent-teal-700"
                />
              </div>
              <div>
                <label className="block text-[10px] text-stone-600">
                  Cadence ({strideCadenceHz}Hz)
                </label>
                <input
                  type="range"
                  min={1.2}
                  max={2.1}
                  step={0.05}
                  value={strideCadenceHz}
                  onChange={(e) => setStrideCadenceHz(parseFloat(e.target.value))}
                  className="w-full accent-teal-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-stone-600 mb-0.5">
                  Primary VIA Virtue
                </label>
                <select
                  value={primaryVirtue}
                  onChange={(e) => setPrimaryVirtue(e.target.value)}
                  className="w-full px-2 py-1 rounded bg-white border border-stone-300 text-[11px]"
                >
                  {VIA_VIRTUE_DEFINITIONS.map((v) => (
                    <option key={v.slug} value={v.slug}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-stone-600 mb-0.5">
                  Secondary VIA Virtue
                </label>
                <select
                  value={secondaryVirtue}
                  onChange={(e) => setSecondaryVirtue(e.target.value)}
                  className="w-full px-2 py-1 rounded bg-white border border-stone-300 text-[11px]"
                >
                  {VIA_VIRTUE_DEFINITIONS.map((v) => (
                    <option key={v.slug} value={v.slug}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-1">
              <label className="flex flex-col items-center text-[10px] text-stone-600">
                <span>Skin</span>
                <input
                  type="color"
                  value={skinHex}
                  onChange={(e) => setSkinHex(e.target.value)}
                  className="w-8 h-6 rounded border border-stone-300 cursor-pointer"
                />
              </label>
              <label className="flex flex-col items-center text-[10px] text-stone-600">
                <span>Hair</span>
                <input
                  type="color"
                  value={hairHex}
                  onChange={(e) => setHairHex(e.target.value)}
                  className="w-8 h-6 rounded border border-stone-300 cursor-pointer"
                />
              </label>
              <label className="flex flex-col items-center text-[10px] text-stone-600">
                <span>Coat</span>
                <input
                  type="color"
                  value={jacketHex}
                  onChange={(e) => setJacketHex(e.target.value)}
                  className="w-8 h-6 rounded border border-stone-300 cursor-pointer"
                />
              </label>
              <label className="flex flex-col items-center text-[10px] text-stone-600">
                <span>Trouser</span>
                <input
                  type="color"
                  value={trouserHex}
                  onChange={(e) => setTrouserHex(e.target.value)}
                  className="w-8 h-6 rounded border border-stone-300 cursor-pointer"
                />
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs shadow-xs transition-colors"
            >
              Instantiate 1:1 Skinned Citizen
            </button>
          </form>
        )}

        {toolFeedback && (
          <div className="p-2 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 text-[11px] flex items-start gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-700 shrink-0 mt-0.5" />
            <span>{toolFeedback}</span>
          </div>
        )}
      </div>
    </div>
  );
};
