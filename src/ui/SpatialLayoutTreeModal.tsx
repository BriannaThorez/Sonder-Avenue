import React, { useState, useMemo } from 'react';
import {
  SpatialConstraintNode,
  BREMERTON_CANONICAL_LAYOUT_TREE,
  compileSpatialLayoutTree,
} from '../core/spatialMacroCompiler';
import {
  ParametricBuildingConfig,
  PnwStyleToken,
  STYLE_RULE_DICTIONARY,
  BREMERTON_DEFAULT_GRAMMAR_CONFIGS,
  ParametricExtrusionGenerator,
} from '../core/generativeShapeGrammarEngine';
import { X, Layers, CheckCircle2, RotateCcw, Sparkles, Eye, Box } from 'lucide-react';

interface SpatialLayoutTreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: SpatialConstraintNode[];
  onUpdateNodes: (next: SpatialConstraintNode[]) => void;
  grammarConfigs?: ParametricBuildingConfig[];
  onUpdateGrammarConfigs?: (next: ParametricBuildingConfig[]) => void;
  cutawayXRayMode?: boolean;
  onToggleCutawayXRayMode?: (next: boolean) => void;
}

export const SpatialLayoutTreeModal: React.FC<SpatialLayoutTreeModalProps> = ({
  isOpen,
  onClose,
  nodes,
  onUpdateNodes,
  grammarConfigs = BREMERTON_DEFAULT_GRAMMAR_CONFIGS,
  onUpdateGrammarConfigs,
  cutawayXRayMode = false,
  onToggleCutawayXRayMode,
}) => {
  const [selectedAddress, setSelectedAddress] = useState<string>(
    grammarConfigs[0]?.metaAddress || 'world.bremerton.block-02.plot-240-burwell'
  );
  const [metaInputString, setMetaInputString] = useState<string>(
    'address.residential.townhouse'
  );
  const [activeTab, setActiveTab] = useState<'grammar' | 'bsp' | 'spatial'>('grammar');

  const activeGrammar =
    grammarConfigs.find((g) => g.metaAddress === selectedAddress) ||
    grammarConfigs[0];

  const compiledActive = useMemo(() => {
    if (!activeGrammar) return null;
    return ParametricExtrusionGenerator.compileBuildingTree(activeGrammar, 1);
  }, [activeGrammar]);

  if (!isOpen) return null;

  const { diagnostics } = compileSpatialLayoutTree(nodes);
  const activeNode = nodes.find((n) => n.address === selectedAddress) || nodes[0];

  const handlePatchGrammar = (patch: Partial<ParametricBuildingConfig>) => {
    if (!activeGrammar || !onUpdateGrammarConfigs) return;
    const next = grammarConfigs.map((g) =>
      g.metaAddress === activeGrammar.metaAddress ? { ...g, ...patch } : g
    );
    onUpdateGrammarConfigs(next);
  };

  const handleExecuteMetaInput = () => {
    if (!activeGrammar || !onUpdateGrammarConfigs) return;
    const parsed = ParametricExtrusionGenerator.parseMetaInputString(
      metaInputString,
      undefined,
      activeGrammar.storyCount,
      activeGrammar.windowIntervalMeters,
      activeGrammar.internalRoomCount
    );
    handlePatchGrammar({
      styleToken: parsed.styleToken || activeGrammar.styleToken,
      windowIntervalMeters:
        parsed.windowIntervalMeters || activeGrammar.windowIntervalMeters,
    });
  };

  const handlePatchActiveNode = (patch: Partial<SpatialConstraintNode>) => {
    if (!activeNode) return;
    const next = nodes.map((n) =>
      n.address === activeNode.address ? { ...n, ...patch } : n
    );
    const compiled = compileSpatialLayoutTree(next);
    onUpdateNodes(compiled.resolvedNodes);
  };

  const handleResetAll = () => {
    onUpdateNodes(BREMERTON_CANONICAL_LAYOUT_TREE);
    if (onUpdateGrammarConfigs) {
      onUpdateGrammarConfigs(BREMERTON_DEFAULT_GRAMMAR_CONFIGS);
    }
  };

  const styleRule = activeGrammar
    ? STYLE_RULE_DICTIONARY[activeGrammar.styleToken]
    : STYLE_RULE_DICTIONARY['pnw.residential.townhouse'];

  return (
    <div className="fixed top-12 left-3 z-30 w-[370px] max-h-[calc(100vh-96px)] flex flex-col rounded-xl bg-[#FAF7F2]/95 backdrop-blur-xl border border-stone-300/90 shadow-xl text-stone-800 overflow-hidden">
      {/* Header */}
      <div className="px-3.5 py-2.5 border-b border-stone-200/90 flex items-center justify-between bg-[#F3EFE6]/90">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-teal-700" />
          <div>
            <h2 className="text-xs font-semibold text-stone-900 leading-tight">
              Generative Shape Grammar Engine (r186)
            </h2>
            <p className="text-[10px] text-stone-500 font-mono">
              4-Stage Pipeline • BSP Floorplanner • Subtractive Voids
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-stone-500 hover:text-stone-800 hover:bg-stone-200/70"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Mode Tabs */}
      <div className="px-3.5 pt-2.5 flex items-center gap-1 border-b border-stone-200/80 pb-2 bg-[#FAF7F2]">
        <button
          onClick={() => setActiveTab('grammar')}
          className={`flex-1 py-1 rounded-md text-[10px] font-semibold transition-all ${
            activeTab === 'grammar'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-[#F3EFE6] text-stone-700 hover:bg-stone-200/70'
          }`}
        >
          1. Grammar & Voids
        </button>
        <button
          onClick={() => setActiveTab('bsp')}
          className={`flex-1 py-1 rounded-md text-[10px] font-semibold transition-all ${
            activeTab === 'bsp'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-[#F3EFE6] text-stone-700 hover:bg-stone-200/70'
          }`}
        >
          2. BSP Floorplan
        </button>
        <button
          onClick={() => setActiveTab('spatial')}
          className={`flex-1 py-1 rounded-md text-[10px] font-semibold transition-all ${
            activeTab === 'spatial'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-[#F3EFE6] text-stone-700 hover:bg-stone-200/70'
          }`}
        >
          3. 1:1 Lot AABB
        </button>
      </div>

      <div className="p-3.5 overflow-y-auto space-y-3 text-xs">
        {/* Target Structure Selector */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
              Target 1:1 Urban Structure
            </label>
            {onToggleCutawayXRayMode && (
              <button
                onClick={() => onToggleCutawayXRayMode(!cutawayXRayMode)}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 border transition-all ${
                  cutawayXRayMode
                    ? 'bg-amber-600 text-white border-amber-700'
                    : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>{cutawayXRayMode ? 'BSP Cutaway: ON' : 'BSP Cutaway'}</span>
              </button>
            )}
          </div>
          <select
            value={selectedAddress}
            onChange={(e) => setSelectedAddress(e.target.value)}
            className="w-full px-2 py-1.5 rounded bg-white border border-stone-300 text-[11px] font-medium text-stone-800"
          >
            {grammarConfigs.map((g) => (
              <option key={g.metaAddress} value={g.metaAddress}>
                {g.label} ({g.storyCount}F • {g.styleToken})
              </option>
            ))}
          </select>
        </div>

        {activeTab === 'grammar' && activeGrammar && (
          <>
            {/* Stage 1: Meta-Input Parser & Tokenized Rule Dictionary (Module A) */}
            <div className="p-2.5 rounded-lg bg-white/95 border border-stone-200/90 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-800">
                  Stage 1: Meta-Input Grammar Parser
                </span>
                <span className="px-1.5 py-0.5 rounded bg-[#F3EFE6] font-mono text-[9px] text-stone-600">
                  Module A • Codebook
                </span>
              </div>

              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={metaInputString}
                  onChange={(e) => setMetaInputString(e.target.value)}
                  placeholder="address.residential.townhouse"
                  className="flex-1 px-2 py-1 rounded bg-[#FAF7F2] border border-stone-300 font-mono text-[10px] text-stone-800"
                />
                <button
                  onClick={handleExecuteMetaInput}
                  className="px-2.5 py-1 rounded bg-teal-700 hover:bg-teal-800 text-white font-semibold text-[10px] flex items-center gap-1 shrink-0"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Parse</span>
                </button>
              </div>

              <div>
                <label className="block text-[9px] text-stone-500 mb-0.5">
                  Semantic Style Token (Rule Dictionary Lookup)
                </label>
                <select
                  value={activeGrammar.styleToken}
                  onChange={(e) =>
                    handlePatchGrammar({
                      styleToken: e.target.value as PnwStyleToken,
                    })
                  }
                  className="w-full px-2 py-1 rounded bg-[#FAF7F2] border border-stone-300 font-mono text-[10px] text-stone-800"
                >
                  {Object.values(STYLE_RULE_DICTIONARY).map((r) => (
                    <option key={r.token} value={r.token}>
                      {r.token} — {r.roofPitchDeg}° Roof / {r.sidingMaterialType}
                    </option>
                  ))}
                </select>
              </div>

              {/* Unpacked Architectural Rule Variables */}
              <div className="grid grid-cols-3 gap-1.5 pt-1 text-[10px]">
                <div className="p-1.5 rounded bg-[#FAF7F2] border border-stone-200/80">
                  <div className="text-[9px] text-stone-500">Roof Pitch</div>
                  <div className="font-mono font-semibold text-stone-800">
                    {styleRule.roofPitchDeg}° ({styleRule.eaveOverhangMeters}m eave)
                  </div>
                </div>
                <div className="p-1.5 rounded bg-[#FAF7F2] border border-stone-200/80">
                  <div className="text-[9px] text-stone-500">Setback Story</div>
                  <div className="font-mono font-semibold text-stone-800">
                    Floor {styleRule.setbackStartStory}+ (-{styleRule.setbackDepthMeters}m)
                  </div>
                </div>
                <div className="p-1.5 rounded bg-[#FAF7F2] border border-stone-200/80">
                  <div className="text-[9px] text-stone-500">TSL Grime</div>
                  <div className="font-mono font-semibold text-stone-800">
                    {(styleRule.weatherGrimeCoefficient * 100).toFixed(0)}% Patina
                  </div>
                </div>
              </div>
            </div>

            {/* Stage 3 & 4: Subtractive Face Matrix & Instanced Fabricator */}
            <div className="p-2.5 rounded-lg bg-white/95 border border-stone-200/90 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-800">
                  Stages 2–4: Parametric Extrusion Controls
                </span>
                <span className="px-1.5 py-0.5 rounded bg-[#F3EFE6] font-mono text-[9px] text-stone-600">
                  Modules B•C•D
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[9px] text-stone-500 mb-0.5">
                    Story Count
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={activeGrammar.storyCount}
                    onChange={(e) =>
                      handlePatchGrammar({
                        storyCount: Math.max(1, Math.min(8, parseInt(e.target.value) || 3)),
                      })
                    }
                    className="w-full px-2 py-1 rounded bg-[#FAF7F2] border border-stone-300 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-stone-500 mb-0.5">
                    Window Grid (m)
                  </label>
                  <input
                    type="number"
                    step={0.2}
                    min={1.8}
                    max={4.5}
                    value={activeGrammar.windowIntervalMeters}
                    onChange={(e) =>
                      handlePatchGrammar({
                        windowIntervalMeters: Math.max(
                          1.8,
                          Math.min(4.5, parseFloat(e.target.value) || 2.5)
                        ),
                      })
                    }
                    className="w-full px-2 py-1 rounded bg-[#FAF7F2] border border-stone-300 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-stone-500 mb-0.5">
                    BSP Rooms/Flr
                  </label>
                  <input
                    type="number"
                    step={2}
                    min={2}
                    max={8}
                    value={activeGrammar.internalRoomCount}
                    onChange={(e) =>
                      handlePatchGrammar({
                        internalRoomCount: Math.max(
                          2,
                          Math.min(8, parseInt(e.target.value) || 6)
                        ),
                      })
                    }
                    className="w-full px-2 py-1 rounded bg-[#FAF7F2] border border-stone-300 font-mono text-[11px]"
                  />
                </div>
              </div>

              {compiledActive && (
                <div className="p-2 rounded bg-[#F3EFE6]/80 border border-stone-300/70 flex items-center justify-between text-[10px] font-mono">
                  <span>
                    Void Openings: <strong>{compiledActive.totalVoidOpeningsCount}</strong>
                  </span>
                  <span>
                    Wall Modules: <strong>{compiledActive.subtractiveModules.length}</strong>
                  </span>
                  <span>
                    BSP Rooms: <strong>{compiledActive.totalRoomsCount}</strong>
                  </span>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'bsp' && compiledActive && (
          <div className="space-y-2">
            <div className="p-2.5 rounded-lg bg-white/95 border border-stone-200/90 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-800">
                  Module B: Gridless BSP Room Hierarchy
                </span>
                <span className="font-mono text-[10px] text-stone-500">
                  {compiledActive.totalRoomsCount} total cells
                </span>
              </div>
              <p className="text-[10px] text-stone-600 leading-relaxed">
                Binary Space Partitioning slices each floor into a central{' '}
                <code className="font-mono text-teal-800">corridor</code> spine, an anchored{' '}
                <code className="font-mono text-teal-800">stairwell</code> shaft, and functional rooms with open doorway portals.
              </p>

              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                {compiledActive.stories.map((st) => (
                  <div
                    key={st.storyIndex}
                    className="p-2 rounded bg-[#FAF7F2] border border-stone-200/90 space-y-1"
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] font-semibold text-stone-800">
                      <span>
                        Story {st.storyIndex + 1} (Y = +{st.elevationY.toFixed(1)}m • H ={' '}
                        {st.heightMeters.toFixed(1)}m)
                      </span>
                      {st.setbackInsetMeters > 0 && (
                        <span className="text-amber-700">
                          Inset -{st.setbackInsetMeters}m
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-1 pt-0.5">
                      {st.rooms.map((rm) => (
                        <div
                          key={rm.roomId}
                          className="px-1.5 py-1 rounded bg-white border border-stone-200/80 flex items-center justify-between text-[9px] font-mono"
                        >
                          <span className="font-semibold text-teal-800 truncate">
                            {rm.zoneTag}
                          </span>
                          <span className="text-stone-500">{rm.areaSqMeters}m²</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'spatial' && activeNode && (
          <div className="p-2.5 rounded-lg bg-white/95 border border-stone-200/90 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-semibold text-teal-800">
                {activeNode.address}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 font-mono text-[9px]">
                {activeNode.macroName}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className="block text-[9px] text-stone-500">Position X (m)</label>
                <input
                  type="number"
                  step="1.0"
                  value={activeNode.resolvedPosition[0]}
                  onChange={(e) =>
                    handlePatchActiveNode({
                      resolvedPosition: [
                        parseFloat(e.target.value) || 0,
                        activeNode.resolvedPosition[1],
                        activeNode.resolvedPosition[2],
                      ],
                    })
                  }
                  className="w-full px-1.5 py-1 rounded bg-[#FAF7F2] border border-stone-300 text-[10px] font-mono"
                />
              </div>
              <div>
                <label className="block text-[9px] text-stone-500">Position Z (m)</label>
                <input
                  type="number"
                  step="1.0"
                  value={activeNode.resolvedPosition[2]}
                  onChange={(e) =>
                    handlePatchActiveNode({
                      resolvedPosition: [
                        activeNode.resolvedPosition[0],
                        activeNode.resolvedPosition[1],
                        parseFloat(e.target.value) || 0,
                      ],
                    })
                  }
                  className="w-full px-1.5 py-1 rounded bg-[#FAF7F2] border border-stone-300 text-[10px] font-mono"
                />
              </div>
            </div>

            <div className="max-h-36 overflow-y-auto space-y-1 pt-1">
              {diagnostics.map((d) => (
                <div
                  key={d.nodeAddress}
                  className="p-1.5 rounded bg-[#FAF7F2] border border-stone-200/80 flex items-start gap-1.5 text-[10px]"
                >
                  <CheckCircle2 className="w-3 h-3 text-teal-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-mono font-semibold text-stone-800">
                      {d.nodeAddress.split('.').pop()}:
                    </span>{' '}
                    <span className="text-stone-600">{d.message}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleResetAll}
          className="w-full py-1.5 rounded-md bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 font-medium text-[11px] flex items-center justify-center gap-1.5"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Canonical 1:1 Shape Grammar & Layout</span>
        </button>
      </div>
    </div>
  );
};
