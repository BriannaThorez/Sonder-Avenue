import React, { useState } from 'react';
import {
  SplineRoadNetworkData,
  RoadSplineNode,
  RoadSplineSegment,
  RoadToolMode,
  CivicPlazaParkSpec,
  BREMERTON_SPLINE_ROAD_NETWORK,
  BREMERTON_DEFAULT_CIVIC_PLAZAS,
  computeSegmentTelemetry,
  createRoundaboutOnNetwork,
} from '../core/splineRoadEngine';
import {
  X,
  Route,
  Plus,
  RotateCcw,
  CircleDot,
  AlertTriangle,
  CheckCircle2,
  Trees,
} from 'lucide-react';

interface SplineRoadToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  network: SplineRoadNetworkData;
  onChangeNetwork: (next: SplineRoadNetworkData) => void;
  roadEditorMode: boolean;
  onToggleRoadEditorMode: (val: boolean) => void;
}

export const SplineRoadToolModal: React.FC<SplineRoadToolModalProps> = ({
  isOpen,
  onClose,
  network,
  onChangeNetwork,
  roadEditorMode,
  onToggleRoadEditorMode,
}) => {
  const [activeTab, setActiveTab] = useState<'roads' | 'lanes' | 'plazas'>('roads');
  const [selectedToolMode, setSelectedToolMode] =
    useState<RoadToolMode>('simple-curve');
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>(
    network.segments[0]?.id || 'seg.burwell-west'
  );
  const [newNodeX, setNewNodeX] = useState<number>(28.0);
  const [newNodeZ, setNewNodeZ] = useState<number>(14.0);
  const [connectFromNodeId, setConnectFromNodeId] = useState<string>(
    network.nodes[1]?.id || 'node.burwell-pacific-intersection'
  );
  const [newRoadLanes, setNewRoadLanes] = useState<1 | 2>(2);

  if (!isOpen) return null;

  const activeSegment =
    network.segments.find((s) => s.id === selectedSegmentId) ||
    network.segments[0];
  const nodeMap = new Map(network.nodes.map((n) => [n.id, n]));

  const telemetry =
    activeSegment &&
    nodeMap.get(activeSegment.startNodeId) &&
    nodeMap.get(activeSegment.endNodeId)
      ? computeSegmentTelemetry(
          activeSegment,
          nodeMap.get(activeSegment.startNodeId)!,
          nodeMap.get(activeSegment.endNodeId)!
        )
      : null;

  const handleUpdateSegmentCurve = (patch: Partial<RoadSplineSegment>) => {
    if (!activeSegment) return;
    onChangeNetwork({
      ...network,
      segments: network.segments.map((s) =>
        s.id === activeSegment.id ? { ...s, ...patch } : s
      ),
    });
  };

  const handleAddCurvedSplineSegment = () => {
    const startNode =
      network.nodes.find((n) => n.id === connectFromNodeId) || network.nodes[0];
    if (!startNode) return;

    const suffix = Date.now().toString().slice(-4);
    const roadWidth = newRoadLanes === 2 ? 10.2 : 8.2;
    const newNode: RoadSplineNode = {
      id: `node.cs2-${suffix}`,
      address: `world.bremerton.roads.node.cs2-${suffix}`,
      position: [newNodeX, 0, newNodeZ],
      elevationMeters: 0,
      widthMeters: roadWidth,
      isIntersection: true,
    };

    const midX = Number(((startNode.position[0] + newNodeX) / 2).toFixed(1));
    const midZ = Number(
      ((startNode.position[2] + newNodeZ) / 2 + 5.5).toFixed(1)
    );

    const newSeg: RoadSplineSegment = {
      id: `seg.cs2-${suffix}`,
      address: `world.bremerton.roads.segment.cs2-${suffix}`,
      startNodeId: startNode.id,
      endNodeId: newNode.id,
      controlPoint: [midX, 0, midZ],
      controlPoint2:
        selectedToolMode === 'complex-curve'
          ? [midX - 5.0, 0, midZ - 8.0]
          : undefined,
      curveMode: selectedToolMode,
      lanes: newRoadLanes,
      roadType: 'collector',
      speedLimitMph: 20,
      hasSidewalks: true,
      hasCrosswalkStart: true,
      hasCrosswalkEnd: true,
    };

    onChangeNetwork({
      ...network,
      nodes: [...network.nodes, newNode],
      segments: [...network.segments, newSeg],
    });
    setSelectedSegmentId(newSeg.id);
  };

  const handleInsertRoundabout = () => {
    const updated = createRoundaboutOnNetwork(network, [-26.0, 0, -0.4], 9.5);
    onChangeNetwork(updated);
  };

  const handleAddPocketPark = () => {
    const ts = Date.now().toString().slice(-4);
    const newPark: CivicPlazaParkSpec = {
      id: `park-custom-${ts}`,
      address: `world.bremerton.civic.pocket-park-${ts}`,
      label: `Sidewalk-Welded Pocket Park #${ts}`,
      kind: 'pocket-park',
      anchoredRoadSegmentId: activeSegment?.id || 'seg.burwell-east',
      centerWorld: [4.0, 0.04, 8.5],
      dimensionsMeters: [11.0, 8.0],
      tilePatternColorHex: '#C2CEBC',
      benchCount: 3,
      treeCount: 4,
      streetlightCount: 2,
      receptacleCount: 2,
      pedestrianPathNodes: [
        [2.0, 0, 8.5],
        [4.0, 0, 8.5],
        [6.0, 0, 8.5],
      ],
    };
    const currentPlazas = network.civicPlazas || BREMERTON_DEFAULT_CIVIC_PLAZAS;
    onChangeNetwork({
      ...network,
      civicPlazas: [...currentPlazas, newPark],
    });
  };

  const plazas = network.civicPlazas || BREMERTON_DEFAULT_CIVIC_PLAZAS;

  return (
    <div className="fixed top-12 left-3 z-30 w-[370px] max-h-[calc(100vh-64px)] flex flex-col rounded-xl bg-[#FAF7F2]/95 backdrop-blur-xl border border-stone-300/90 shadow-xl text-stone-800 overflow-hidden">
      {/* Header */}
      <div className="px-3.5 py-2.5 border-b border-stone-200/90 flex items-center justify-between bg-[#F3EFE6]/90">
        <div className="flex items-center gap-2">
          <Route className="w-4 h-4 text-sky-700" />
          <div>
            <h2 className="text-xs font-semibold text-stone-900 leading-tight">
              CS2 Civil Infrastructure & Lane Rulebook
            </h2>
            <p className="text-[10px] text-stone-500 font-mono">
              spatial.infrastructure.* • 15°/25m Guards • Plazas
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
      <div className="px-3.5 pt-2 flex items-center gap-1 border-b border-stone-200/80 pb-2 bg-[#FAF7F2]">
        <button
          onClick={() => setActiveTab('roads')}
          className={`flex-1 py-1 rounded-md text-[10px] font-semibold transition-all ${
            activeTab === 'roads'
              ? 'bg-sky-700 text-white shadow-xs'
              : 'bg-[#F3EFE6] text-stone-700 hover:bg-stone-200/70'
          }`}
        >
          1. Splines & Guards
        </button>
        <button
          onClick={() => setActiveTab('lanes')}
          className={`flex-1 py-1 rounded-md text-[10px] font-semibold transition-all ${
            activeTab === 'lanes'
              ? 'bg-sky-700 text-white shadow-xs'
              : 'bg-[#F3EFE6] text-stone-700 hover:bg-stone-200/70'
          }`}
        >
          2. Lane Profile
        </button>
        <button
          onClick={() => setActiveTab('plazas')}
          className={`flex-1 py-1 rounded-md text-[10px] font-semibold transition-all ${
            activeTab === 'plazas'
              ? 'bg-sky-700 text-white shadow-xs'
              : 'bg-[#F3EFE6] text-stone-700 hover:bg-stone-200/70'
          }`}
        >
          3. Plazas & Parks
        </button>
      </div>

      <div className="p-3.5 overflow-y-auto space-y-3 text-xs">
        {/* Interactive 3D Node & Tangent Drag Toggle */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-stone-200/90">
          <div>
            <div className="text-[11px] font-semibold text-stone-800">
              3D Spline & Junction Handle Editor
            </div>
            <div className="text-[10px] text-stone-500">
              Drag blue nodes or amber Bézier tangents in 3D
            </div>
          </div>
          <button
            onClick={() => onToggleRoadEditorMode(!roadEditorMode)}
            className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-colors ${
              roadEditorMode
                ? 'bg-sky-700 text-white'
                : 'bg-[#F3EFE6] text-stone-700 hover:bg-stone-200'
            }`}
          >
            {roadEditorMode ? '3D Handles: ON' : 'Enable Handles'}
          </button>
        </div>

        {/* Segment Selector */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
            Active Centerline Spline (.network.road)
          </label>
          <select
            value={activeSegment?.id}
            onChange={(e) => setSelectedSegmentId(e.target.value)}
            className="w-full px-2 py-1.5 rounded bg-white border border-stone-300 text-[11px] font-mono text-stone-800"
          >
            {network.segments.map((s) => (
              <option key={s.id} value={s.id}>
                {s.address} ({s.lanes}L • {s.roadType})
              </option>
            ))}
          </select>
        </div>

        {activeTab === 'roads' && activeSegment && telemetry && (
          <>
            {/* Step A.3: Angular & Slope Self-Failure Guard Telemetry */}
            <div
              className={`p-2.5 rounded-lg border space-y-1.5 ${
                telemetry.isPlacementBlocked
                  ? 'bg-rose-50 border-rose-300 text-rose-900'
                  : 'bg-white border-stone-200/90 text-stone-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1">
                  {telemetry.isPlacementBlocked ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                  <span>Angular & Slope Guard</span>
                </span>
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#F3EFE6]">
                  {telemetry.selfFailureCode}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 pt-1 text-[10px] font-mono">
                <div className="p-1.5 rounded bg-[#FAF7F2] border border-stone-200/80">
                  <div className="text-[9px] text-stone-500">Length</div>
                  <div className="font-semibold">{telemetry.lengthMeters}m</div>
                </div>
                <div className="p-1.5 rounded bg-[#FAF7F2] border border-stone-200/80">
                  <div className="text-[9px] text-stone-500">Min Radius</div>
                  <div className="font-semibold">
                    {telemetry.minRadiusMeters}m (≥25m)
                  </div>
                </div>
                <div className="p-1.5 rounded bg-[#FAF7F2] border border-stone-200/80">
                  <div className="text-[9px] text-stone-500">Incline</div>
                  <div className="font-semibold">
                    {telemetry.inclineDeg}° (≤15°)
                  </div>
                </div>
              </div>

              {telemetry.failureMessage && (
                <div className="text-[10px] font-medium text-rose-700 pt-1">
                  {telemetry.failureMessage}
                </div>
              )}
            </div>

            {/* Control Point & Lane Count Editor */}
            <div className="p-2.5 rounded-lg bg-white border border-stone-200/90 space-y-2">
              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <label className="block text-[9px] text-stone-500">
                    Bezier Control X (m)
                  </label>
                  <input
                    type="number"
                    step="1.0"
                    value={activeSegment.controlPoint[0]}
                    onChange={(e) =>
                      handleUpdateSegmentCurve({
                        controlPoint: [
                          parseFloat(e.target.value) || 0,
                          activeSegment.controlPoint[1],
                          activeSegment.controlPoint[2],
                        ],
                      })
                    }
                    className="w-full px-2 py-1 rounded bg-[#FAF7F2] border border-stone-300 font-mono text-[10px]"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-stone-500">
                    Bezier Control Z (m)
                  </label>
                  <input
                    type="number"
                    step="1.0"
                    value={activeSegment.controlPoint[2]}
                    onChange={(e) =>
                      handleUpdateSegmentCurve({
                        controlPoint: [
                          activeSegment.controlPoint[0],
                          activeSegment.controlPoint[1],
                          parseFloat(e.target.value) || 0,
                        ],
                      })
                    }
                    className="w-full px-2 py-1 rounded bg-[#FAF7F2] border border-stone-300 font-mono text-[10px]"
                  />
                </div>
              </div>

              <div className="flex gap-1.5 pt-1">
                <button
                  onClick={handleAddCurvedSplineSegment}
                  className="flex-1 py-1.5 rounded bg-sky-700 hover:bg-sky-800 text-white font-semibold text-[10px] flex items-center justify-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Append Spline</span>
                </button>
                <button
                  onClick={handleInsertRoundabout}
                  className="flex-1 py-1.5 rounded bg-[#F3EFE6] hover:bg-stone-200 text-stone-800 border border-stone-300 font-semibold text-[10px] flex items-center justify-center gap-1"
                >
                  <CircleDot className="w-3 h-3 text-sky-700" />
                  <span>Roundabout</span>
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'lanes' && telemetry && (
          <div className="p-2.5 rounded-lg bg-white border border-stone-200/90 space-y-2">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-sky-800">
              Ordered Parametric Profile (.network.lane)
            </div>
            <p className="text-[10px] text-stone-600">
              Extruded sideways from the centerline spline with exact lateral offsets:
            </p>
            <div className="space-y-1">
              {telemetry.laneTracks.map((lt) => (
                <div
                  key={lt.laneAddressSlug}
                  className="p-1.5 rounded bg-[#FAF7F2] border border-stone-200/90 flex items-center justify-between text-[10px] font-mono"
                >
                  <div>
                    <div className="font-semibold text-stone-800">{lt.kind}</div>
                    <div className="text-[9px] text-stone-500">
                      {lt.travelCategory}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-sky-800">
                      W: {lt.widthMeters.toFixed(1)}m
                    </div>
                    <div className="text-[9px] text-stone-500">
                      Offset: {lt.lateralOffsetFromCenterMeters >= 0 ? '+' : ''}
                      {lt.lateralOffsetFromCenterMeters.toFixed(1)}m
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'plazas' && (
          <div className="p-2.5 rounded-lg bg-white border border-stone-200/90 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                <Trees className="w-3.5 h-3.5" />
                <span>Sidewalk-Welded Plazas & Parks</span>
              </span>
              <button
                onClick={handleAddPocketPark}
                className="px-2 py-0.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-semibold"
              >
                + Pocket Park
              </button>
            </div>
            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {plazas.map((pl) => (
                <div
                  key={pl.id}
                  className="p-2 rounded bg-[#FAF7F2] border border-stone-200/90 space-y-0.5 text-[10px]"
                >
                  <div className="font-semibold text-stone-800">{pl.label}</div>
                  <div className="font-mono text-[9px] text-teal-800">
                    {pl.address}
                  </div>
                  <div className="text-[9px] text-stone-500 font-mono">
                    Welded to {pl.anchoredRoadSegmentId} • {pl.benchCount} benches •{' '}
                    {pl.treeCount} trees • {pl.streetlightCount} lamps
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => onChangeNetwork(BREMERTON_SPLINE_ROAD_NETWORK)}
          className="w-full py-1.5 rounded-md bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 font-medium text-[11px] flex items-center justify-center gap-1.5"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Canonical CS2 Road & Plaza Network</span>
        </button>
      </div>
    </div>
  );
};
