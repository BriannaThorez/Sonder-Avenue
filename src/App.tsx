import React, { useEffect, useState, useCallback } from 'react';
import {
  CitizenEntity,
  CreateCitizenFactoryInput,
  createCanonicalCitizens,
  createCitizenFromFactory,
  loadCitizensFromIndexedDb,
  saveCitizensToIndexedDb,
  resetCitizensIndexedDb,
} from './core/citizenVfs';
import {
  stepCitizenDaemons10Hz,
  synthesizeStubCorticalPacket,
  applyCorticalIntentPacket,
  DaemonStepResult,
} from './daemons/citizenDaemonEngine';
import { normalizeToHypersphere } from './core/personaCalculus';
import {
  BremertonDioramaCanvas,
  CustomWorldProp,
} from './world/BremertonDioramaCanvas';
import {
  SpatialConstraintNode,
  BREMERTON_CANONICAL_LAYOUT_TREE,
} from './core/spatialMacroCompiler';
import {
  ParametricBuildingConfig,
  BREMERTON_DEFAULT_GRAMMAR_CONFIGS,
  multiFloorNavigationRegistry,
} from './core/generativeShapeGrammarEngine';
import {
  SplineRoadNetworkData,
  BREMERTON_SPLINE_ROAD_NETWORK,
} from './core/splineRoadEngine';
import { collisionSystem } from './core/collisionPhysicsEngine';
import { SmartChatPanel } from './ui/SmartChatPanel';
import { PersonaCalculusPanel } from './ui/PersonaCalculusPanel';
import { DcaWorkspacePanel } from './ui/DcaWorkspacePanel';
import { CharacterFactoryPanel } from './ui/CharacterFactoryPanel';
import { SpatialLayoutTreeModal } from './ui/SpatialLayoutTreeModal';
import { SplineRoadToolModal } from './ui/SplineRoadToolModal';
import { CollisionPhysicsModal } from './ui/CollisionPhysicsModal';

type ActiveDrawer =
  | 'none'
  | 'skinning'
  | 'roads'
  | 'collision'
  | 'spatial'
  | 'persona'
  | 'audit';

interface HeaderIconButtonProps {
  tooltip: string;
  active?: boolean;
  activeColorClass?: string;
  onClick: () => void;
  children: React.ReactNode;
}

const HeaderIconButton: React.FC<HeaderIconButtonProps> = ({
  tooltip,
  active = false,
  activeColorClass = 'bg-teal-700 text-white shadow-xs',
  onClick,
  children,
}) => (
  <button
    type="button"
    onClick={onClick}
    title={tooltip}
    aria-label={tooltip}
    className={`group relative w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
      active
        ? activeColorClass
        : 'text-stone-700 bg-[#F3EFE6]/70 hover:bg-stone-200/90 hover:text-stone-900'
    }`}
  >
    {children}
    <span className="pointer-events-none absolute top-full mt-1.5 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-stone-900/95 text-[#FAF7F2] text-[10px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-50">
      {tooltip}
    </span>
  </button>
);

export function App() {
  const [citizens, setCitizens] = useState<CitizenEntity[]>(() =>
    createCanonicalCitizens('peer.local.01')
  );
  const [selectedCitizenId, setSelectedCitizenId] = useState<string>(
    'citizen.jane-do'
  );
  const [activeDrawer, setActiveDrawer] = useState<ActiveDrawer>('none');
  const [chatPinned, setChatPinned] = useState<boolean>(false);

  // Environment & 1:1 Viewport Controls
  const [weatherTempF] = useState<number>(58);
  const [isRaining] = useState<boolean>(false);
  const [timeOfDayHour, setTimeOfDayHour] = useState<number>(14.5);
  const [autoHeartbeatEnabled] = useState<boolean>(true);
  const [cameraFollowSelected, setCameraFollowSelected] = useState<boolean>(false);

  // 1:1 Spatial, Generative Shape Grammar, CS2 Spline Road, Collision & Skinned Skeleton States
  const [spatialNodes, setSpatialNodes] = useState<SpatialConstraintNode[]>(
    BREMERTON_CANONICAL_LAYOUT_TREE
  );
  const [grammarConfigs, setGrammarConfigs] = useState<ParametricBuildingConfig[]>(
    BREMERTON_DEFAULT_GRAMMAR_CONFIGS
  );
  const [cutawayXRayMode, setCutawayXRayMode] = useState<boolean>(false);
  const [splineRoadNetwork, setSplineRoadNetwork] = useState<SplineRoadNetworkData>(
    BREMERTON_SPLINE_ROAD_NETWORK
  );
  const [roadEditorMode, setRoadEditorMode] = useState<boolean>(false);
  const [showColliders, setShowColliders] = useState<boolean>(false);
  const [showSkeletonHelpers, setShowSkeletonHelpers] = useState<boolean>(false);
  const [customProps, setCustomProps] = useState<CustomWorldProp[]>([]);
  const [couplingLogs, setCouplingLogs] = useState<DaemonStepResult['couplingLogs']>([]);

  // Load persisted 1:1 citizens from IndexedDB on mount
  useEffect(() => {
    let mounted = true;
    loadCitizensFromIndexedDb().then((stored) => {
      if (mounted && stored && stored.length > 0) {
        setCitizens(stored);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Save citizens to IndexedDB periodically
  useEffect(() => {
    const t = setTimeout(() => {
      saveCitizensToIndexedDb(citizens);
    }, 1500);
    return () => clearTimeout(t);
  }, [citizens]);

  // 10Hz Reflexive Somatic Substrate Loop (DCR-2.1.17-01)
  useEffect(() => {
    const interval = setInterval(() => {
      setCitizens((prev) => {
        const step = stepCitizenDaemons10Hz(
          prev,
          0.1,
          weatherTempF,
          autoHeartbeatEnabled
        );
        if (step.couplingLogs.length > 0) {
          setCouplingLogs((old) => [...step.couplingLogs, ...old].slice(0, 16));
        }
        return step.updatedCitizens;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [weatherTempF, autoHeartbeatEnabled]);

  const selectedCitizen =
    citizens.find((c) => c.id === selectedCitizenId) || citizens[0];

  const handleDispatchStimulus = useCallback(
    async (params: {
      citizenId: string;
      stimulusType: 'player.whisper' | 'player.chat';
      text: string;
      preferredTargetAddress?: string;
      useLiveGemini: boolean;
    }) => {
      const target = citizens.find((c) => c.id === params.citizenId);
      if (!target) return;

      setCitizens((prev) =>
        prev.map((c) =>
          c.id === params.citizenId ? { ...c, isCorticalThinking: true } : c
        )
      );

      let packet = synthesizeStubCorticalPacket({
        citizen: target,
        stimulusType: params.stimulusType,
        stimulusText: params.text,
        preferredTargetAddress: params.preferredTargetAddress,
      });

      if (params.useLiveGemini) {
        try {
          const res = await fetch('/api/cortical/intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              citizen: target,
              stimulusType: params.stimulusType,
              stimulusText: params.text,
              preferredTargetAddress: params.preferredTargetAddress,
            }),
          });
          if (res.ok) {
            const livePkt = await res.json();
            if (livePkt && livePkt.motorDirective) {
              packet = livePkt;
            }
          }
        } catch {
          // Deterministic stub already synthesized
        }
      }

      setCitizens((prev) => {
        const queueCount = prev.filter((c) => c.currentAction === 'JOIN_QUEUE').length;
        return prev.map((c) =>
          c.id === params.citizenId
            ? applyCorticalIntentPacket(c, packet, queueCount)
            : c
        );
      });
    },
    [citizens]
  );

  const handleSelectSmartTarget = useCallback(
    (address: string) => {
      if (!selectedCitizen) return;
      handleDispatchStimulus({
        citizenId: selectedCitizen.id,
        stimulusType: 'player.whisper',
        text: `Navigate to ${address}`,
        preferredTargetAddress: address,
        useLiveGemini: false,
      });
    },
    [selectedCitizen, handleDispatchStimulus]
  );

  const handleCreateCitizen = (input: CreateCitizenFactoryInput): CitizenEntity => {
    const rawCitizen = createCitizenFromFactory(input, citizens.length);
    const safeSpawn = collisionSystem.findSafeSpawnPosition(rawCitizen.position, 0.95);
    const safeCitizen: CitizenEntity = {
      ...rawCitizen,
      position: safeSpawn,
      targetPosition: [safeSpawn[0] + 2.0, 0, safeSpawn[2] + 1.5],
    };
    setCitizens((prev) => [...prev, safeCitizen]);
    setSelectedCitizenId(safeCitizen.id);
    return safeCitizen;
  };

  const handleUpdateCitizen = (updated: CitizenEntity) => {
    setCitizens((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
  };

  const handleUpdateVirtueWeight = (virtueSlug: string, newWeight: number) => {
    if (!selectedCitizen) return;
    const nextWeights = {
      ...selectedCitizen.virtueWeights,
      [virtueSlug]: newWeight,
    };
    const { unitVector, displayWeights } = normalizeToHypersphere(nextWeights);
    handleUpdateCitizen({
      ...selectedCitizen,
      virtueWeights: displayWeights,
      unitHypersphereVector: unitVector,
    });
  };

  const handleDeclipAllCitizens = () => {
    setCitizens((prev) => {
      const buffered = collisionSystem.resolveMutualCharacterBuffer(
        prev.map((c) => ({ id: c.id, pos: c.position })),
        0.75
      );
      return prev.map((c) => {
        const resolved = buffered.get(c.id) || c.position;
        return {
          ...c,
          position: resolved,
        };
      });
    });
  };

  const handleUpdateRoadNodePosition = useCallback(
    (nodeId: string, newPos: [number, number, number]) => {
      setSplineRoadNetwork((prev) => ({
        ...prev,
        nodes: prev.nodes.map((n) =>
          n.id === nodeId ? { ...n, position: newPos } : n
        ),
      }));
    },
    []
  );

  const handleUpdateSegmentControlPoint = useCallback(
    (segmentId: string, newPos: [number, number, number]) => {
      setSplineRoadNetwork((prev) => ({
        ...prev,
        segments: prev.segments.map((s) =>
          s.id === segmentId ? { ...s, controlPoint: newPos } : s
        ),
      }));
    },
    []
  );

  const handleResetAll1to1 = async () => {
    const fresh = await resetCitizensIndexedDb();
    setCitizens(fresh);
    setSpatialNodes(BREMERTON_CANONICAL_LAYOUT_TREE);
    setGrammarConfigs(BREMERTON_DEFAULT_GRAMMAR_CONFIGS);
    setCutawayXRayMode(false);
    setSplineRoadNetwork(BREMERTON_SPLINE_ROAD_NETWORK);
    setCustomProps([]);
  };

  const handleSendCitizenToBuildingFloor = useCallback(
    (buildingAddress: string, floorIndex: number) => {
      if (!selectedCitizen) return;
      const plan = multiFloorNavigationRegistry.planMultiFloorPathToRoom(
        selectedCitizen.position,
        buildingAddress,
        floorIndex
      );
      if (!plan.targetRoom) return;
      const finalTarget = plan.targetRoom.centerWorld;
      setCitizens((prev) =>
        prev.map((c) =>
          c.id === selectedCitizen.id
            ? {
                ...c,
                currentAction: 'NAVIGATE_TO',
                targetAddress: plan.targetRoom!.address,
                targetPosition: [...finalTarget],
                activeSpeechBubble: `Heading to Floor ${floorIndex + 1} (${plan.targetRoom!.semanticZoningSlug.split('.').pop()}) via stairwell.`,
              }
            : c
        )
      );
    },
    [selectedCitizen]
  );

  const toggleDrawer = (drawer: ActiveDrawer) => {
    setActiveDrawer((prev) => (prev === drawer ? 'none' : drawer));
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#dce7f0] text-stone-800 font-sans">
      {/* Full-Viewport 1:1 3D Bremerton Waterfront & 240 Burwell St Canvas */}
      <BremertonDioramaCanvas
        citizens={citizens}
        selectedCitizenId={selectedCitizenId}
        onSelectCitizen={setSelectedCitizenId}
        onSelectSmartTarget={handleSelectSmartTarget}
        onSendCitizenToBuildingFloor={handleSendCitizenToBuildingFloor}
        weatherTempF={weatherTempF}
        isRaining={isRaining}
        timeOfDayHour={timeOfDayHour}
        customProps={customProps}
        spatialNodes={spatialNodes}
        grammarConfigs={grammarConfigs}
        cutawayXRayMode={cutawayXRayMode}
        splineRoadNetwork={splineRoadNetwork}
        onUpdateRoadNodePosition={handleUpdateRoadNodePosition}
        onUpdateSegmentControlPoint={handleUpdateSegmentControlPoint}
        roadEditorMode={roadEditorMode}
        showColliders={showColliders}
        showSkeletonHelpers={showSkeletonHelpers}
        cameraFollowSelected={cameraFollowSelected}
      />

      {/* Slim 38px Warm Alabaster Daylight Top Architectural Toolbar with Textless Custom-SVG Icons & Tooltips */}
      <header className="fixed top-2 left-3 right-3 z-30 h-9 px-3 rounded-xl bg-[#FAF7F2]/92 backdrop-blur-md border border-stone-300/90 shadow-sm flex items-center justify-between gap-2">
        {/* Left: Brand + 1:1 Scale Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-teal-600" />
          <span className="font-semibold text-xs tracking-tight text-stone-900">
            Sonder Avenue
          </span>
          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-[#F3EFE6] border border-stone-300/80 font-mono text-[10px] text-teal-800 font-semibold">
            1:1 • r186 Shape Grammar
          </span>
        </div>

        {/* Center: Textless Custom-SVG Icon Toolset Buttons with Intuitive Tooltips */}
        <nav className="flex items-center gap-1.5">
          {/* 1. Character Rig & Additive Blending (Articulated Humanoid Skeleton SVG) */}
          <HeaderIconButton
            tooltip="Character Rig & Additive Blending (16-Bone SkinnedMesh)"
            active={activeDrawer === 'skinning'}
            activeColorClass="bg-teal-700 text-white shadow-xs"
            onClick={() => toggleDrawer('skinning')}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="4.5" r="2.2" />
              <line x1="12" y1="6.7" x2="12" y2="14.5" />
              <path d="M6.5 9.5 L12 8.2 L17.5 9.5" />
              <path d="M8.5 20.5 L12 14.5 L15.5 20.5" />
              <circle cx="12" cy="11" r="0.9" fill="currentColor" />
            </svg>
          </HeaderIconButton>

          {/* 2. CS2 Spline & Curve Roads (Bezier Curve + Tangent Nodes SVG) */}
          <HeaderIconButton
            tooltip="CS2 Spline & Curve Road Network (1–2 Lane PNW Streetscape)"
            active={activeDrawer === 'roads'}
            activeColorClass="bg-sky-700 text-white shadow-xs"
            onClick={() => {
              toggleDrawer('roads');
              if (activeDrawer !== 'roads') setRoadEditorMode(true);
            }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19 C 8 19, 10 5, 20 5" />
              <path d="M4 14 C 7 14, 9 4, 15 4" strokeDasharray="2 2" opacity="0.65" />
              <circle cx="4" cy="19" r="2.1" fill="currentColor" />
              <circle cx="12" cy="12" r="1.8" />
              <circle cx="20" cy="5" r="2.1" fill="currentColor" />
            </svg>
          </HeaderIconButton>

          {/* 3. Procedural Collision Physics (3D Wireframe Bounding Box & Repulsion Shield SVG) */}
          <HeaderIconButton
            tooltip="Procedural Collision Physics & Spatial Anti-Clipping Solver"
            active={activeDrawer === 'collision'}
            activeColorClass="bg-emerald-700 text-white shadow-xs"
            onClick={() => toggleDrawer('collision')}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2.5 L20 7 L20 17 L12 21.5 L4 17 L4 7 Z" />
              <path d="M4 7 L12 11.5 L20 7" />
              <line x1="12" y1="11.5" x2="12" y2="21.5" />
              <circle cx="12" cy="11.5" r="1.5" fill="currentColor" />
            </svg>
          </HeaderIconButton>

          {/* 4. Generative Shape Grammar & 1:1 Architect Engine (Parametric Multi-Story Extrusion + Pitched Roof SVG) */}
          <HeaderIconButton
            tooltip="Generative Shape Grammar Engine (4-Stage BSP & Subtractive Voids)"
            active={activeDrawer === 'spatial'}
            activeColorClass="bg-teal-700 text-white shadow-xs"
            onClick={() => toggleDrawer('spatial')}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 10 L12 3.5 L21 10" />
              <rect x="5" y="10" width="14" height="10.5" rx="1" />
              <line x1="5" y1="15.2" x2="19" y2="15.2" />
              <line x1="12" y1="10" x2="12" y2="20.5" />
              <rect x="7.5" y="11.8" width="2" height="2" />
              <rect x="14.5" y="11.8" width="2" height="2" />
            </svg>
          </HeaderIconButton>

          {/* 5. Persona Calculus S^23 Hypersphere (24-Virtue Harmonic Manifold SVG) */}
          <HeaderIconButton
            tooltip="Persona Calculus (S²³ Virtue Hypersphere & Somatic Stress)"
            active={activeDrawer === 'persona'}
            activeColorClass="bg-teal-700 text-white shadow-xs"
            onClick={() => toggleDrawer('persona')}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="8.5" />
              <ellipse cx="12" cy="12" rx="8.5" ry="3.6" />
              <ellipse cx="12" cy="12" rx="3.6" ry="8.5" />
              <circle cx="12" cy="12" r="1.4" fill="currentColor" />
            </svg>
          </HeaderIconButton>

          {/* 6. DeepSeek-Flash Orchestrator & Instruction Audit (Autonomous Agent Mesh SVG) */}
          <HeaderIconButton
            tooltip="DeepSeek-Flash Subagent Mesh & Instruction Audit Ledger"
            active={activeDrawer === 'audit'}
            activeColorClass="bg-amber-600 text-white shadow-xs"
            onClick={() => toggleDrawer('audit')}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
              <rect x="7" y="7" width="10" height="10" rx="2" />
              <path d="M9.5 12 L11.2 13.7 L14.8 10.2" />
              <line x1="12" y1="3" x2="12" y2="7" />
              <line x1="12" y1="17" x2="12" y2="21" />
              <line x1="3" y1="12" x2="7" y2="12" />
              <line x1="17" y1="12" x2="21" y2="12" />
            </svg>
          </HeaderIconButton>
        </nav>

        {/* Right: Textless Custom-SVG Environment, BSP X-Ray & Camera Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* 7. Toggle Interior BSP Cutaway X-Ray Mode */}
          <HeaderIconButton
            tooltip={
              cutawayXRayMode
                ? 'BSP Interior Cutaway X-Ray: ON (Showing Corridors, Stairwells & Rooms)'
                : 'Toggle BSP Interior Cutaway X-Ray (Inspect Floorplanner Rooms)'
            }
            active={cutawayXRayMode}
            activeColorClass="bg-amber-600 text-white shadow-xs"
            onClick={() => setCutawayXRayMode((v) => !v)}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 3 21 8 12 13 3 8 12 3" />
              <polyline points="3 13 12 18 21 13" strokeDasharray="2.5 2" />
              <polyline points="3 17.5 12 22.5 21 17.5" />
            </svg>
          </HeaderIconButton>

          {/* 8. Cycle Daylight Solar Hour */}
          <HeaderIconButton
            tooltip={`Cycle Daylight Solar Hour (${Math.floor(timeOfDayHour)}:00 PNW Sky)`}
            onClick={() => setTimeOfDayHour((h) => (h > 17 ? 10.5 : h + 2.5))}
          >
            <svg className="w-4 h-4 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <line x1="12" y1="2.5" x2="12" y2="5" />
              <line x1="12" y1="19" x2="12" y2="21.5" />
              <line x1="4.2" y1="4.2" x2="6" y2="6" />
              <line x1="18" y1="18" x2="19.8" y2="19.8" />
              <line x1="2.5" y1="12" x2="5" y2="12" />
              <line x1="19" y1="12" x2="21.5" y2="12" />
              <line x1="4.2" y1="19.8" x2="6" y2="18" />
              <line x1="18" y1="6" x2="19.8" y2="4.2" />
            </svg>
          </HeaderIconButton>

          {/* 9. Follow Selected Citizen at 1:1 Street Level */}
          <HeaderIconButton
            tooltip={
              cameraFollowSelected
                ? 'Following Selected Citizen (1:1 Street-Level Tracking ON)'
                : 'Follow Selected Citizen at 1:1 Street Level'
            }
            active={cameraFollowSelected}
            activeColorClass="bg-teal-700 text-white shadow-xs"
            onClick={() => setCameraFollowSelected((f) => !f)}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="7" />
              <circle cx="12" cy="12" r="2.2" fill="currentColor" />
              <line x1="12" y1="2" x2="12" y2="5" />
              <line x1="12" y1="19" x2="12" y2="22" />
              <line x1="2" y1="12" x2="5" y2="12" />
              <line x1="19" y1="12" x2="22" y2="12" />
            </svg>
          </HeaderIconButton>

          {/* 10. Pin / Unpin Cortical Stream & Dialogue Dock */}
          <HeaderIconButton
            tooltip={
              chatPinned
                ? 'Cortical Chat Dock: Pinned Open (Click to Auto-Collapse on Mouse Leave)'
                : 'Pin Cortical Chat Dock Open (Currently Pop-Open on Hover)'
            }
            active={chatPinned}
            activeColorClass="bg-amber-600 text-white shadow-xs"
            onClick={() => setChatPinned((p) => !p)}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-6.5A8 8 0 1 1 21 12z" />
              <path d="M8 11.5h8" />
              <path d="M8 14.5h5" />
            </svg>
          </HeaderIconButton>

          {/* 11. Reset 1:1 District & Clear Cache */}
          <HeaderIconButton
            tooltip="Reset 1:1 District, Shape Grammar & Clear IndexedDB Cache"
            onClick={handleResetAll1to1}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
              <polyline points="3 3 3 8 8 8" />
            </svg>
          </HeaderIconButton>
        </div>
      </header>

      {/* Contextual Floating Drawers (Docked Top-Left; Only ONE open at a time to keep >=89% viewport clear) */}
      <CharacterFactoryPanel
        isOpen={activeDrawer === 'skinning'}
        onClose={() => setActiveDrawer('none')}
        onCreateCitizen={handleCreateCitizen}
        existingCitizens={citizens}
        selectedCitizen={selectedCitizen}
        onUpdateCitizen={handleUpdateCitizen}
        showSkeletonHelpers={showSkeletonHelpers}
        onToggleSkeletonHelpers={() => setShowSkeletonHelpers((v) => !v)}
      />

      <SplineRoadToolModal
        isOpen={activeDrawer === 'roads'}
        onClose={() => {
          setActiveDrawer('none');
          setRoadEditorMode(false);
        }}
        network={splineRoadNetwork}
        onChangeNetwork={setSplineRoadNetwork}
        roadEditorMode={roadEditorMode}
        onToggleRoadEditorMode={setRoadEditorMode}
      />

      <CollisionPhysicsModal
        isOpen={activeDrawer === 'collision'}
        onClose={() => setActiveDrawer('none')}
        showColliders={showColliders}
        onToggleShowColliders={setShowColliders}
        onDeclipAllCitizens={handleDeclipAllCitizens}
      />

      <SpatialLayoutTreeModal
        isOpen={activeDrawer === 'spatial'}
        onClose={() => setActiveDrawer('none')}
        nodes={spatialNodes}
        onUpdateNodes={setSpatialNodes}
        grammarConfigs={grammarConfigs}
        onUpdateGrammarConfigs={setGrammarConfigs}
        cutawayXRayMode={cutawayXRayMode}
        onToggleCutawayXRayMode={setCutawayXRayMode}
      />

      {activeDrawer === 'persona' && selectedCitizen && (
        <PersonaCalculusPanel
          citizen={selectedCitizen}
          weatherTempF={weatherTempF}
          onUpdateVirtueWeight={handleUpdateVirtueWeight}
          onUpdateCitizen={handleUpdateCitizen}
          onClose={() => setActiveDrawer('none')}
        />
      )}

      {activeDrawer === 'audit' && selectedCitizen && (
        <DcaWorkspacePanel
          citizen={selectedCitizen}
          activeDrawer={activeDrawer}
          chatPinned={chatPinned}
          onClose={() => setActiveDrawer('none')}
        />
      )}

      {/* Bottom-Right Pop-Open-on-Hover & Thumbtack-Pinnable Cortical Dialogue Dock */}
      {selectedCitizen && (
        <SmartChatPanel
          citizen={selectedCitizen}
          allCitizens={citizens}
          onSelectCitizen={setSelectedCitizenId}
          onDispatchStimulus={handleDispatchStimulus}
          couplingLogs={couplingLogs}
          isPinned={chatPinned}
          onTogglePin={() => setChatPinned((p) => !p)}
        />
      )}
    </div>
  );
}
export default App;
