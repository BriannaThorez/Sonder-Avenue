/**
 * @domain spatial.structural.interaction.harness
 * @description Manages 3D hover raycast floor cutaways (GPU discard masks), mouse-wheel floor stepping, 3D building floor pin buttons, and civic/road instanced rendering.
 * @inputs citizens: CitizenEntity[], grammarConfigs: ParametricBuildingConfig[], splineRoadNetwork: SplineRoadNetworkData
 * @outputs interactive_3d_viewport: React.ReactElement, gpu_cutaway_uniforms: Float[8]
 * @dependencies spatial.structural.geometry.extrusion, spatial.infrastructure.network.road, spatial.structural.rendering.r186-instance-manager
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import {
  CitizenEntity,
  BREMERTON_SMART_TARGETS,
} from '../core/citizenVfs';
import {
  SpatialConstraintNode,
  BREMERTON_CANONICAL_LAYOUT_TREE,
} from '../core/spatialMacroCompiler';
import {
  SplineRoadNetworkData,
  BREMERTON_SPLINE_ROAD_NETWORK,
  BREMERTON_DEFAULT_CIVIC_PLAZAS,
  buildSplineRoadMesh,
  buildCivicPlazasAndParksInstancedGroup,
  computeIntersectionJunctionLaneRoutes,
} from '../core/splineRoadEngine';
import {
  collisionSystem,
  initializeBremertonStaticColliders,
  autoSynthesizeSceneColliders,
} from '../core/collisionPhysicsEngine';
import {
  SkinnedCharacterRig,
  buildSkinnedCharacterRig,
  updateSkinnedCharacterRig,
  getCitizenHeightMeters,
} from '../core/characterSkinningEngine';
import {
  SceneResourceDisposer,
  MemoryPipelineStats,
  DEFAULT_CUTAWAY_ARRAY,
  updateMaterialCutawayUniforms,
  assembleInstancedPnwEnvironmentProps,
} from '../core/r186EngineArchitecture';
import {
  ParametricBuildingConfig,
  CompiledBuildingTree,
  ParametricExtrusionGenerator,
  BREMERTON_DEFAULT_GRAMMAR_CONFIGS,
  multiFloorNavigationRegistry,
} from '../core/generativeShapeGrammarEngine';

export interface CustomWorldProp {
  id: string;
  address: string;
  name: string;
  category: 'bench' | 'tree' | 'streetlight' | 'kiosk' | 'planter' | 'crate';
  position: [number, number, number];
  rotationY: number;
  scale: number;
  primaryColor: string;
}

export interface BuildingFloorPinState {
  buildingIndex: number;
  buildingAddress: string;
  activeFloorIndex: number; // 0-indexed (0 = Floor 1)
  isPinned: boolean;
}

interface BremertonDioramaCanvasProps {
  citizens: CitizenEntity[];
  selectedCitizenId: string;
  onSelectCitizen: (id: string) => void;
  onSelectSmartTarget: (address: string) => void;
  onSendCitizenToBuildingFloor?: (
    buildingAddress: string,
    storyIndex: number
  ) => void;
  weatherTempF: number;
  isRaining: boolean;
  timeOfDayHour: number;
  customProps: CustomWorldProp[];
  spatialNodes?: SpatialConstraintNode[];
  grammarConfigs?: ParametricBuildingConfig[];
  cutawayXRayMode?: boolean;
  splineRoadNetwork?: SplineRoadNetworkData;
  onUpdateRoadNodePosition?: (nodeId: string, newPos: [number, number, number]) => void;
  onUpdateSegmentControlPoint?: (segmentId: string, newPos: [number, number, number]) => void;
  roadEditorMode?: boolean;
  showColliders?: boolean;
  showSkeletonHelpers?: boolean;
  cameraFollowSelected?: boolean;
}

interface ProjectedCitizenOverlay {
  id: string;
  fullName: string;
  roleTitle: string;
  x: number;
  y: number;
  visible: boolean;
  speech: string | null;
  posture: string;
  action: string;
  inShadowRegression: boolean;
  heightMeters: number;
  elevationFloorNumber: number;
  currentRoomZoningSlug: string | null;
}

interface ProjectedTargetPin {
  address: string;
  label: string;
  x: number;
  y: number;
  visible: boolean;
}

interface ProjectedBuildingPinOverlay {
  buildingIndex: number;
  buildingAddress: string;
  shortLabel: string;
  storyCount: number;
  x: number;
  y: number;
  visible: boolean;
}

function createRoadCrossSectionTexture(disposer: SceneResourceDisposer): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#DED8CE';
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = '#C5BEB2';
  ctx.lineWidth = 3;
  for (let x = 0; x < 512; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 108);
    ctx.moveTo(x, 404);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }

  ctx.fillStyle = '#C8C1B6';
  ctx.fillRect(0, 96, 512, 22);
  ctx.fillRect(0, 394, 512, 22);

  ctx.fillStyle = '#343940';
  ctx.fillRect(0, 118, 512, 276);

  ctx.fillStyle = '#EAE6DF';
  ctx.fillRect(0, 130, 512, 5);
  ctx.fillRect(0, 377, 512, 5);

  ctx.fillStyle = '#EAB308';
  for (let x = 0; x < 512; x += 128) {
    ctx.fillRect(x + 20, 253, 68, 6);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.anisotropy = 8;
  return disposer.trackTexture(tex);
}

export const BremertonDioramaCanvas: React.FC<BremertonDioramaCanvasProps> = ({
  citizens,
  selectedCitizenId,
  onSelectCitizen,
  onSelectSmartTarget,
  onSendCitizenToBuildingFloor,
  weatherTempF,
  isRaining,
  timeOfDayHour,
  customProps,
  spatialNodes = BREMERTON_CANONICAL_LAYOUT_TREE,
  grammarConfigs = BREMERTON_DEFAULT_GRAMMAR_CONFIGS,
  cutawayXRayMode = false,
  splineRoadNetwork = BREMERTON_SPLINE_ROAD_NETWORK,
  onUpdateRoadNodePosition,
  onUpdateSegmentControlPoint,
  roadEditorMode = false,
  showColliders = false,
  showSkeletonHelpers = false,
  cameraFollowSelected = false,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const citizensRef = useRef<CitizenEntity[]>(citizens);
  citizensRef.current = citizens;

  const selectedIdRef = useRef<string>(selectedCitizenId);
  selectedIdRef.current = selectedCitizenId;

  const weatherRef = useRef({ weatherTempF, isRaining, timeOfDayHour });
  weatherRef.current = { weatherTempF, isRaining, timeOfDayHour };

  const followRef = useRef(cameraFollowSelected);
  followRef.current = cameraFollowSelected;

  const showSkeletonRef = useRef(showSkeletonHelpers);
  showSkeletonRef.current = showSkeletonHelpers;

  const roadEditorModeRef = useRef(roadEditorMode);
  roadEditorModeRef.current = roadEditorMode;

  const [overlays, setOverlays] = useState<ProjectedCitizenOverlay[]>([]);
  const [targetPins, setTargetPins] = useState<ProjectedTargetPin[]>([]);
  const [buildingPinOverlays, setBuildingPinOverlays] = useState<
    ProjectedBuildingPinOverlay[]
  >([]);
  const [showSmartPins, setShowSmartPins] = useState<boolean>(false);
  const [bloomEnabled, setBloomEnabled] = useState<boolean>(true);
  const bloomEnabledRef = useRef<boolean>(true);
  bloomEnabledRef.current = bloomEnabled;
  const [memStats, setMemStats] = useState<MemoryPipelineStats | null>(null);

  // ==========================================================================
  // spatial.structural.interaction.* STATE (HOVER FLOOR CUTAWAY + 3D PIN LOCK)
  // ==========================================================================
  const [hoveredBuilding, setHoveredBuilding] = useState<{
    buildingIndex: number;
    buildingAddress: string;
    buildingLabel: string;
    activeFloorIndex: number;
    storyCount: number;
  } | null>(null);
  const hoveredBuildingRef = useRef<typeof hoveredBuilding>(null);
  hoveredBuildingRef.current = hoveredBuilding;

  const [pinnedBuildingFloors, setPinnedBuildingFloors] = useState<
    Record<number, BuildingFloorPinState>
  >({});
  const pinnedBuildingFloorsRef = useRef(pinnedBuildingFloors);
  pinnedBuildingFloorsRef.current = pinnedBuildingFloors;

  const [inspectedDcaAddress, setInspectedDcaAddress] = useState<string | null>(
    null
  );

  // Explicit Mandatory .dispose() Memory Registries
  const coreDisposerRef = useRef<SceneResourceDisposer>(new SceneResourceDisposer());
  const urbanDisposerRef = useRef<SceneResourceDisposer>(new SceneResourceDisposer());
  const roadDisposerRef = useRef<SceneResourceDisposer>(new SceneResourceDisposer());

  // Scene references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const characterRigsRef = useRef<Map<string, SkinnedCharacterRig>>(new Map());
  const characterGroupRef = useRef<THREE.Group | null>(null);
  const roadGroupRef = useRef<THREE.Group | null>(null);
  const cityGroupRef = useRef<THREE.Group | null>(null);
  const colliderVisualGroupRef = useRef<THREE.Group | null>(null);
  const customPropsGroupRef = useRef<THREE.Group | null>(null);

  const compiledBuildingsRef = useRef<CompiledBuildingTree[]>([]);
  const buildingMaterialsRef = useRef<
    Array<THREE.MeshStandardMaterial | null>
  >([]);
  const cutawayArrayRef = useRef<number[]>(DEFAULT_CUTAWAY_ARRAY());

  const draggingHandleRef = useRef<{
    type: 'node' | 'control';
    id: string;
  } | null>(null);

  // Recomputes the 8-float GPU cutaway uniform array from pinned states + active mouse hover
  const syncGpuCutawayUniforms = useCallback(
    (
      hoverState: typeof hoveredBuilding,
      pinnedMap: Record<number, BuildingFloorPinState>,
      globalCutawayXRay: boolean
    ) => {
      const nextArr = DEFAULT_CUTAWAY_ARRAY();
      for (let i = 0; i < 8; i++) {
        if (pinnedMap[i]?.isPinned) {
          nextArr[i] = pinnedMap[i].activeFloorIndex + 0.1;
        } else if (hoverState && hoverState.buildingIndex === i) {
          nextArr[i] = hoverState.activeFloorIndex + 0.1;
        } else if (globalCutawayXRay) {
          nextArr[i] = 1.1; // Slice to Floor 2 when global X-Ray toggle is on
        } else {
          nextArr[i] = 99.0; // Full exterior + roof
        }
      }
      cutawayArrayRef.current = nextArr;
      updateMaterialCutawayUniforms(
        buildingMaterialsRef.current,
        nextArr,
        weatherRef.current.timeOfDayHour
      );
    },
    []
  );

  useEffect(() => {
    syncGpuCutawayUniforms(
      hoveredBuilding,
      pinnedBuildingFloors,
      cutawayXRayMode
    );
  }, [
    hoveredBuilding,
    pinnedBuildingFloors,
    cutawayXRayMode,
    syncGpuCutawayUniforms,
  ]);

  const handleTogglePinBuildingFloor = (
    bldgIdx: number,
    bldgAddr: string,
    defaultFloorIdx: number
  ) => {
    setPinnedBuildingFloors((prev) => {
      const existing = prev[bldgIdx];
      if (existing?.isPinned) {
        const copy = { ...prev };
        delete copy[bldgIdx];
        return copy;
      }
      const floorToLock =
        hoveredBuilding?.buildingIndex === bldgIdx
          ? hoveredBuilding.activeFloorIndex
          : existing?.activeFloorIndex ?? defaultFloorIdx;
      return {
        ...prev,
        [bldgIdx]: {
          buildingIndex: bldgIdx,
          buildingAddress: bldgAddr,
          activeFloorIndex: floorToLock,
          isPinned: true,
        },
      };
    });
  };

  const handleStepBuildingFloor = (
    bldgIdx: number,
    bldgAddr: string,
    storyCount: number,
    delta: number
  ) => {
    setPinnedBuildingFloors((prev) => {
      const currentFloor =
        prev[bldgIdx]?.activeFloorIndex ??
        (hoveredBuilding?.buildingIndex === bldgIdx
          ? hoveredBuilding.activeFloorIndex
          : Math.max(0, storyCount - 2));
      const nextFloor = Math.max(
        0,
        Math.min(storyCount - 1, currentFloor + delta)
      );
      return {
        ...prev,
        [bldgIdx]: {
          buildingIndex: bldgIdx,
          buildingAddress: bldgAddr,
          activeFloorIndex: nextFloor,
          isPinned: true,
        },
      };
    });
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const coreDisposer = coreDisposerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xd6e3ee);
    scene.fog = new THREE.FogExp2(0xd6e3ee, 0.0021);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.25, 900);
    camera.position.set(-18, 22, 38);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.06;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const composer = new EffectComposer(renderer);
    coreDisposer.trackDisposable(composer);

    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.34,
      0.42,
      0.82
    );
    coreDisposer.trackDisposable(bloomPass);
    composer.addPass(bloomPass);

    const smaaPass = new SMAAPass();
    coreDisposer.trackDisposable(smaaPass);
    composer.addPass(smaaPass);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.target.set(-6, 2.2, 0);
    controls.minDistance = 2.0;
    controls.maxDistance = 240;
    controls.maxPolarAngle = Math.PI / 2 - 0.015;
    controlsRef.current = controls;

    // 1. PNW Atmospheric Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xf2f7ff, 0x7e786d, 0.95);
    hemiLight.position.set(0, 80, 0);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff4e0, 2.1);
    sunLight.position.set(55, 85, 45);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 5;
    sunLight.shadow.camera.far = 260;
    const d = 85;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // 2. 1:1 Metric Gridless PNW Waterfront Landmass & Sinclair Inlet
    const worldRoot = new THREE.Group();
    scene.add(worldRoot);

    const landGeo = coreDisposer.trackGeometry(new THREE.BoxGeometry(220, 2.0, 110));
    const landMat = coreDisposer.trackMaterial(
      new THREE.MeshStandardMaterial({
        color: 0xe0dbd2,
        roughness: 0.88,
        metalness: 0.04,
      })
    );
    const landMesh = new THREE.Mesh(landGeo, landMat);
    landMesh.position.set(0, -1.0, -28.5);
    landMesh.receiveShadow = true;
    worldRoot.add(landMesh);

    const boardwalkMat = coreDisposer.trackMaterial(
      new THREE.MeshStandardMaterial({
        color: 0xb69770,
        roughness: 0.8,
      })
    );
    const boardwalkMesh = new THREE.Mesh(
      coreDisposer.trackGeometry(new THREE.BoxGeometry(180, 0.24, 12.5)),
      boardwalkMat
    );
    boardwalkMesh.position.set(0, 0.05, 20.25);
    boardwalkMesh.receiveShadow = true;
    worldRoot.add(boardwalkMesh);

    const railMat = coreDisposer.trackMaterial(
      new THREE.MeshStandardMaterial({
        color: 0x2f3e46,
        metalness: 0.7,
        roughness: 0.35,
      })
    );
    const topRailWest = new THREE.Mesh(
      coreDisposer.trackGeometry(new THREE.BoxGeometry(47, 0.07, 0.07)),
      railMat
    );
    topRailWest.position.set(-52.5, 1.15, 26.2);
    worldRoot.add(topRailWest);

    const topRailEast = new THREE.Mesh(
      coreDisposer.trackGeometry(new THREE.BoxGeometry(91, 0.07, 0.07)),
      railMat
    );
    topRailEast.position.set(30.5, 1.15, 26.2);
    worldRoot.add(topRailEast);

    const waterMesh = new THREE.Mesh(
      coreDisposer.trackGeometry(new THREE.PlaneGeometry(360, 160, 32, 16)),
      coreDisposer.trackMaterial(
        new THREE.MeshStandardMaterial({
          color: 0x265f7d,
          roughness: 0.2,
          metalness: 0.68,
        })
      )
    );
    waterMesh.rotation.x = -Math.PI / 2;
    waterMesh.position.set(0, -0.65, 106.5);
    waterMesh.receiveShadow = true;
    worldRoot.add(waterMesh);

    // 3. Instanced PNW Environment Props & Authentic WSF Ferry
    const instancedEnvGroup = assembleInstancedPnwEnvironmentProps(coreDisposer);
    worldRoot.add(instancedEnvGroup);

    const ferryGroup = new THREE.Group();
    ferryGroup.position.set(-22.0, -0.4, 58.0);
    worldRoot.add(ferryGroup);

    const wsfWhiteMat = coreDisposer.trackMaterial(
      new THREE.MeshStandardMaterial({ color: 0xf7f7f2, roughness: 0.45 })
    );
    const wsfGreenMat = coreDisposer.trackMaterial(
      new THREE.MeshStandardMaterial({ color: 0x0f5c3f, roughness: 0.5 })
    );
    const cabinGlassMat = coreDisposer.trackMaterial(
      new THREE.MeshStandardMaterial({
        color: 0x93c5fd,
        emissive: 0xffe4a0,
        emissiveIntensity: 0.45,
        roughness: 0.15,
        metalness: 0.8,
      })
    );

    const hullMesh = new THREE.Mesh(
      coreDisposer.trackGeometry(new THREE.BoxGeometry(14.5, 4.2, 58.0)),
      wsfWhiteMat
    );
    hullMesh.position.set(0, 2.1, 0);
    hullMesh.castShadow = true;
    ferryGroup.add(hullMesh);

    const greenStripe = new THREE.Mesh(
      coreDisposer.trackGeometry(new THREE.BoxGeometry(14.7, 1.8, 52.0)),
      wsfGreenMat
    );
    greenStripe.position.set(0, 3.4, 0);
    ferryGroup.add(greenStripe);

    const saloonDeck = new THREE.Mesh(
      coreDisposer.trackGeometry(new THREE.BoxGeometry(12.2, 3.4, 44.0)),
      wsfWhiteMat
    );
    saloonDeck.position.set(0, 5.9, 0);
    saloonDeck.castShadow = true;
    ferryGroup.add(saloonDeck);

    const saloonWindows = new THREE.Mesh(
      coreDisposer.trackGeometry(new THREE.BoxGeometry(12.35, 1.4, 40.0)),
      cabinGlassMat
    );
    saloonWindows.position.set(0, 6.1, 0);
    ferryGroup.add(saloonWindows);

    const funnel = new THREE.Mesh(
      coreDisposer.trackGeometry(new THREE.CylinderGeometry(1.3, 1.5, 3.6, 16)),
      wsfGreenMat
    );
    funnel.position.set(0, 9.4, 0);
    ferryGroup.add(funnel);

    // 4. Dynamic View-Tier Groups
    const roadGroup = new THREE.Group();
    worldRoot.add(roadGroup);
    roadGroupRef.current = roadGroup;

    const cityGroup = new THREE.Group();
    worldRoot.add(cityGroup);
    cityGroupRef.current = cityGroup;

    const colliderVisualGroup = new THREE.Group();
    worldRoot.add(colliderVisualGroup);
    colliderVisualGroupRef.current = colliderVisualGroup;

    const customPropsGroup = new THREE.Group();
    worldRoot.add(customPropsGroup);
    customPropsGroupRef.current = customPropsGroup;

    const characterGroup = new THREE.Group();
    worldRoot.add(characterGroup);
    characterGroupRef.current = characterGroup;

    // ========================================================================
    // 5. POINTER, HOVER RAYCAST CUTAWAY, & MOUSE-WHEEL FLOOR NAVIGATION
    // ========================================================================
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    const handlePointerDown = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);

      if (roadEditorModeRef.current && roadGroupRef.current) {
        const roadHits = raycaster.intersectObjects(roadGroupRef.current.children, true);
        const handleHit = roadHits.find(
          (h) =>
            h.object.userData?.handleType === 'node' ||
            h.object.userData?.handleType === 'control'
        );
        if (handleHit) {
          controls.enabled = false;
          draggingHandleRef.current = {
            type: handleHit.object.userData.handleType,
            id: handleHit.object.userData.handleId,
          };
          return;
        }
      }

      if (characterGroupRef.current) {
        const charHits = raycaster.intersectObjects(characterGroupRef.current.children, true);
        if (charHits.length > 0) {
          let obj: THREE.Object3D | null = charHits[0].object;
          while (obj && !obj.userData?.citizenId) {
            obj = obj.parent;
          }
          if (obj?.userData?.citizenId) {
            onSelectCitizen(obj.userData.citizenId);
            return;
          }
        }
      }

      // Inspect InstancedMesh module DCA address on click
      if (cityGroupRef.current) {
        const cityHits = raycaster.intersectObjects(cityGroupRef.current.children, true);
        const instHit = cityHits.find(
          (h) =>
            h.instanceId !== undefined &&
            Array.isArray(h.object.userData?.instanceAddresses)
        );
        if (instHit && instHit.instanceId !== undefined) {
          const addr = instHit.object.userData.instanceAddresses[instHit.instanceId];
          if (addr) setInspectedDcaAddress(addr);
        }
      }
    };

    const handlePointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);

      if (draggingHandleRef.current) {
        const intersectPt = new THREE.Vector3();
        if (raycaster.ray.intersectPlane(groundPlane, intersectPt)) {
          const snapped: [number, number, number] = [
            Number(intersectPt.x.toFixed(1)),
            0,
            Number(intersectPt.z.toFixed(1)),
          ];
          if (draggingHandleRef.current.type === 'node' && onUpdateRoadNodePosition) {
            onUpdateRoadNodePosition(draggingHandleRef.current.id, snapped);
          } else if (
            draggingHandleRef.current.type === 'control' &&
            onUpdateSegmentControlPoint
          ) {
            onUpdateSegmentControlPoint(draggingHandleRef.current.id, snapped);
          }
        }
        return;
      }

      // Step A: Raycast Hover Check against Building Bounding Volumes
      if (cityGroupRef.current && !roadEditorModeRef.current) {
        const hits = raycaster.intersectObjects(cityGroupRef.current.children, true);
        const volHit = hits.find((h) => h.object.userData?.isBuildingHoverVolume);

        if (volHit) {
          const ud = volHit.object.userData;
          const bIdx = ud.buildingIndex as number;
          const storyCount = ud.storyCount as number;
          const currentHover = hoveredBuildingRef.current;

          // Disable OrbitControls zoom while hovering a building so mouse-wheel steps floors!
          controls.enableZoom = false;

          if (!currentHover || currentHover.buildingIndex !== bIdx) {
            // Convert hit Y coordinate into initial floor index, or use pinned floor if locked
            const pinned = pinnedBuildingFloorsRef.current[bIdx];
            const hitY = Math.max(0, volHit.point.y);
            const rawFloor = Math.floor(hitY / 3.4);
            const initialFloor = pinned
              ? pinned.activeFloorIndex
              : Math.max(0, Math.min(storyCount - 1, rawFloor));

            setHoveredBuilding({
              buildingIndex: bIdx,
              buildingAddress: ud.buildingAddress,
              buildingLabel: ud.buildingLabel,
              activeFloorIndex: initialFloor,
              storyCount,
            });
          }
        } else {
          controls.enableZoom = true;
          if (hoveredBuildingRef.current !== null) {
            setHoveredBuilding(null);
          }
        }
      }
    };

    // Step B: Mouse-Wheel Floor Navigation when hovering over a building
    const handleWheel = (e: WheelEvent) => {
      const currentHover = hoveredBuildingRef.current;
      if (!currentHover) return;

      e.preventDefault();
      e.stopPropagation();

      const deltaFloor = e.deltaY < 0 ? 1 : -1;
      const nextFloor = Math.max(
        0,
        Math.min(
          currentHover.storyCount - 1,
          currentHover.activeFloorIndex + deltaFloor
        )
      );

      setHoveredBuilding({
        ...currentHover,
        activeFloorIndex: nextFloor,
      });

      // If this building is already pinned, also update its pinned floor index
      if (pinnedBuildingFloorsRef.current[currentHover.buildingIndex]?.isPinned) {
        setPinnedBuildingFloors((prev) => ({
          ...prev,
          [currentHover.buildingIndex]: {
            ...prev[currentHover.buildingIndex],
            activeFloorIndex: nextFloor,
          },
        }));
      }
    };

    const handlePointerUp = () => {
      if (draggingHandleRef.current) {
        draggingHandleRef.current = null;
        controls.enabled = true;
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    // ========================================================================
    // 6. 60HZ RENDER LOOP
    // ========================================================================
    const clock = new THREE.Clock();
    let frameId = 0;
    let lastOverlaySync = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      ferryGroup.position.z = 54.0 + Math.sin(elapsed * 0.28) * 3.5;
      ferryGroup.rotation.z = Math.sin(elapsed * 0.7) * 0.008;

      const hr = weatherRef.current.timeOfDayHour;
      const daylightFactor = Math.max(0.22, Math.sin(((hr - 5) / 16) * Math.PI));
      sunLight.intensity = 2.1 * daylightFactor;
      hemiLight.intensity = 0.95 * daylightFactor;

      updateMaterialCutawayUniforms(
        buildingMaterialsRef.current,
        cutawayArrayRef.current,
        hr
      );

      const currentCitizens = citizensRef.current;
      const rigsMap = characterRigsRef.current;

      for (const [id, rig] of rigsMap.entries()) {
        if (!currentCitizens.some((c) => c.id === id)) {
          characterGroup.remove(rig.rootGroup);
          scene.remove(rig.skeletonHelper);
          rig.skinnedMesh.geometry.dispose();
          rigsMap.delete(id);
        }
      }

      for (const citizen of currentCitizens) {
        let rig = rigsMap.get(citizen.id);
        if (!rig) {
          rig = buildSkinnedCharacterRig(citizen);
          rigsMap.set(citizen.id, rig);
          characterGroup.add(rig.rootGroup);
          scene.add(rig.skeletonHelper);
        }
        rig.skeletonHelper.visible = Boolean(showSkeletonRef.current);
        updateSkinnedCharacterRig(rig, citizen, dt, elapsed);
      }

      if (followRef.current) {
        const sel = currentCitizens.find((c) => c.id === selectedIdRef.current);
        if (sel) {
          controls.target.lerp(
            new THREE.Vector3(sel.position[0], sel.position[1] + 1.35, sel.position[2]),
            0.08
          );
        }
      }

      controls.update();

      bloomPass.enabled = bloomEnabledRef.current;
      composer.render();

      if (elapsed - lastOverlaySync > 0.065) {
        lastOverlaySync = elapsed;
        const w = renderer.domElement.clientWidth;
        const h = renderer.domElement.clientHeight;

        const nextOverlays: ProjectedCitizenOverlay[] = currentCitizens.map((c) => {
          const hMeters = getCitizenHeightMeters(c);
          const worldPos = new THREE.Vector3(
            c.position[0],
            (c.position[1] || 0) + hMeters + 0.35,
            c.position[2]
          );
          worldPos.project(camera);
          const visible = worldPos.z < 1.0 && worldPos.z > -1.0;
          const room = multiFloorNavigationRegistry.queryRoomAtWorldPosition(c.position);
          return {
            id: c.id,
            fullName: c.fullName,
            roleTitle: c.occupation,
            x: (worldPos.x * 0.5 + 0.5) * w,
            y: (-(worldPos.y * 0.5) + 0.5) * h,
            visible,
            speech: c.activeSpeechBubble,
            posture: c.activePosture,
            action: c.currentAction,
            inShadowRegression: c.stressState.inShadowRegression,
            heightMeters: hMeters,
            elevationFloorNumber: room ? room.storyIndex + 1 : 1,
            currentRoomZoningSlug: room ? room.semanticZoningSlug : null,
          };
        });
        setOverlays(nextOverlays);

        // Project 3D Building Pin UI Buttons (`interaction.ui.pin_button`)
        const nextBldgPins: ProjectedBuildingPinOverlay[] =
          compiledBuildingsRef.current.map((b) => {
            const wp = new THREE.Vector3(...b.roofPinAnchorWorld);
            wp.project(camera);
            return {
              buildingIndex: b.buildingIndex,
              buildingAddress: b.config.metaAddress,
              shortLabel: b.config.label.split(' ').slice(0, 3).join(' '),
              storyCount: b.config.storyCount,
              x: (wp.x * 0.5 + 0.5) * w,
              y: (-(wp.y * 0.5) + 0.5) * h,
              visible: wp.z < 1.0 && wp.z > -1.0,
            };
          });
        setBuildingPinOverlays(nextBldgPins);

        const nextPins: ProjectedTargetPin[] = BREMERTON_SMART_TARGETS.map((t) => {
          const wp = new THREE.Vector3(t.position[0], 2.2, t.position[2]);
          wp.project(camera);
          return {
            address: t.address,
            label: t.label,
            x: (wp.x * 0.5 + 0.5) * w,
            y: (-(wp.y * 0.5) + 0.5) * h,
            visible: wp.z < 1.0 && wp.z > -1.0,
          };
        });
        setTargetPins(nextPins);
      }
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const nw = container.clientWidth || window.innerWidth;
      const nh = container.clientHeight || window.innerHeight;
      const pr = renderer.getPixelRatio();
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
      composer.setSize(nw, nh);
      bloomPass.resolution.set(nw, nh);
      smaaPass.setSize(nw * pr, nh * pr);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('wheel', handleWheel);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('resize', handleResize);
      urbanDisposerRef.current.dispose();
      roadDisposerRef.current.dispose();
      coreDisposer.dispose();
      renderer.dispose();
    };
  }, []);

  // ==========================================================================
  // REBUILD 4-STAGE GENERATIVE SHAPE GRAMMAR + INSTANCED URBAN ARCHITECTURE
  // ==========================================================================
  useEffect(() => {
    const cityGroup = cityGroupRef.current;
    if (!cityGroup) return;

    const urbanDisposer = urbanDisposerRef.current;
    urbanDisposer.dispose();
    cityGroup.clear();

    const compiledBuildings = grammarConfigs.map((cfg, idx) => {
      const match = spatialNodes.find((n) => n.address === cfg.metaAddress);
      const syncedCfg: ParametricBuildingConfig = match
        ? {
            ...cfg,
            worldOrigin: [...match.resolvedPosition],
            rotationYRad: THREE.MathUtils.degToRad(match.rotationYDeg),
          }
        : cfg;
      return ParametricExtrusionGenerator.compileBuildingTree(
        syncedCfg,
        idx + 1,
        idx
      );
    });
    compiledBuildingsRef.current = compiledBuildings;

    const {
      districtGroup,
      windowInstancedMaterial,
      facadeInstancedMaterial,
      trimInstancedMaterial,
      interiorInstancedMaterial,
    } = ParametricExtrusionGenerator.fabricateInstancedUrbanScene(
      compiledBuildings,
      urbanDisposer,
      false
    );

    buildingMaterialsRef.current = [
      facadeInstancedMaterial,
      windowInstancedMaterial,
      trimInstancedMaterial,
      interiorInstancedMaterial,
    ];
    cityGroup.add(districtGroup);

    // Harborside Copper Ring Fountain Plaza
    const fountainNode = spatialNodes.find((n) => n.address.includes('fountain'));
    if (fountainNode) {
      const fGroup = new THREE.Group();
      fGroup.position.set(...fountainNode.resolvedPosition);
      fGroup.userData = {
        colliderAddress: fountainNode.address,
        colliderShape: 'cylinder',
        colliderTag: 'fixture',
      };
      const w = fountainNode.dimensionsMeters[0];
      const rimMesh = new THREE.Mesh(
        urbanDisposer.trackGeometry(
          new THREE.CylinderGeometry(w / 2, w / 2 + 0.3, 0.65, 32)
        ),
        urbanDisposer.trackMaterial(
          new THREE.MeshStandardMaterial({ color: 0x959088, roughness: 0.7 })
        )
      );
      rimMesh.position.y = 0.325;
      rimMesh.receiveShadow = true;
      fGroup.add(rimMesh);

      const ringInst = urbanDisposer.trackInstancedMesh(
        new THREE.InstancedMesh(
          urbanDisposer.trackGeometry(new THREE.TorusGeometry(1.0, 0.09, 12, 28)),
          urbanDisposer.trackMaterial(
            new THREE.MeshStandardMaterial({
              color: 0xb86f4c,
              metalness: 0.78,
              roughness: 0.28,
            })
          ),
          3
        )
      );
      const dummy = new THREE.Object3D();
      for (let tier = 0; tier < 3; tier++) {
        const s = 2.4 - tier * 0.65;
        dummy.position.set(0, 0.8 + tier * 0.55, 0);
        dummy.rotation.set(Math.PI / 2, 0, 0);
        dummy.scale.set(s, s, 1);
        dummy.updateMatrix();
        ringInst.setMatrixAt(tier, dummy.matrix);
      }
      ringInst.instanceMatrix.needsUpdate = true;
      fGroup.add(ringInst);
      cityGroup.add(fGroup);
    }

    // Manette Steel Truss Bridge Span
    const bridgeNode = spatialNodes.find((n) => n.address.includes('manette-bridge'));
    if (bridgeNode) {
      const bGroup = new THREE.Group();
      bGroup.position.set(...bridgeNode.resolvedPosition);
      const [w, h, d] = bridgeNode.dimensionsMeters;
      const trussMat = urbanDisposer.trackMaterial(
        new THREE.MeshStandardMaterial({
          color: 0x434d56,
          metalness: 0.68,
          roughness: 0.42,
        })
      );
      const deckMesh = new THREE.Mesh(
        urbanDisposer.trackGeometry(new THREE.BoxGeometry(w, 0.65, d)),
        trussMat
      );
      deckMesh.position.y = 0.4;
      deckMesh.receiveShadow = true;
      bGroup.add(deckMesh);

      const postInst = urbanDisposer.trackInstancedMesh(
        new THREE.InstancedMesh(
          urbanDisposer.trackGeometry(new THREE.BoxGeometry(1, 1, 1)),
          trussMat,
          18
        )
      );
      const dummy = new THREE.Object3D();
      let idx = 0;
      for (const sideZ of [-d / 2 + 0.35, d / 2 - 0.35]) {
        dummy.position.set(0, h, sideZ);
        dummy.scale.set(w, 0.45, 0.45);
        dummy.updateMatrix();
        postInst.setMatrixAt(idx++, dummy.matrix);

        const bays = 7;
        for (let b = 0; b <= bays; b++) {
          dummy.position.set(-w / 2 + (b * w) / bays, h / 2, sideZ);
          dummy.scale.set(0.4, h, 0.4);
          dummy.updateMatrix();
          postInst.setMatrixAt(idx++, dummy.matrix);
        }
      }
      postInst.instanceMatrix.needsUpdate = true;
      bGroup.add(postInst);
      cityGroup.add(bGroup);
    }

    initializeBremertonStaticColliders();
    autoSynthesizeSceneColliders(cityGroup);
    setMemStats(urbanDisposer.getStats());
    syncGpuCutawayUniforms(
      hoveredBuildingRef.current,
      pinnedBuildingFloorsRef.current,
      cutawayXRayMode
    );
  }, [spatialNodes, grammarConfigs, cutawayXRayMode, syncGpuCutawayUniforms]);

  // ==========================================================================
  // REBUILD SPLINE ROAD NETWORK, INTERSECTION JUNCTIONS & CIVIC PLAZAS
  // ==========================================================================
  useEffect(() => {
    const roadGroup = roadGroupRef.current;
    if (!roadGroup) return;

    const roadDisposer = roadDisposerRef.current;
    roadDisposer.dispose();
    roadGroup.clear();

    const roadTex = createRoadCrossSectionTexture(roadDisposer);
    const roadMat = roadDisposer.trackMaterial(
      new THREE.MeshStandardMaterial({
        map: roadTex,
        roughness: 0.85,
        metalness: 0.08,
      })
    );

    const nodeMap = new Map(splineRoadNetwork.nodes.map((n) => [n.id, n]));

    for (const seg of splineRoadNetwork.segments) {
      const startNode = nodeMap.get(seg.startNodeId);
      const endNode = nodeMap.get(seg.endNodeId);
      if (!startNode || !endNode) continue;

      const mesh = buildSplineRoadMesh(seg, startNode, endNode, roadMat);
      roadDisposer.trackObjectTree(mesh);
      roadGroup.add(mesh);

      if (roadEditorMode) {
        const ctrlMat = roadDisposer.trackMaterial(
          new THREE.MeshStandardMaterial({
            color: 0xf59e0b,
            emissive: 0xd97706,
            emissiveIntensity: 0.4,
          })
        );
        const ctrlSphere = new THREE.Mesh(
          roadDisposer.trackGeometry(new THREE.SphereGeometry(0.95, 16, 16)),
          ctrlMat
        );
        ctrlSphere.position.set(
          seg.controlPoint[0],
          seg.controlPoint[1] + 0.6,
          seg.controlPoint[2]
        );
        ctrlSphere.userData = {
          handleType: 'control',
          handleId: seg.id,
        };
        roadGroup.add(ctrlSphere);
      }
    }

    const asphaltCapMat = roadDisposer.trackMaterial(
      new THREE.MeshStandardMaterial({
        color: 0x343940,
        roughness: 0.85,
      })
    );

    for (const node of splineRoadNetwork.nodes) {
      if (node.isIntersection) {
        const cap = new THREE.Mesh(
          roadDisposer.trackGeometry(
            new THREE.CylinderGeometry(
              node.widthMeters * 0.58,
              node.widthMeters * 0.58,
              0.08,
              24
            )
          ),
          asphaltCapMat
        );
        cap.position.set(node.position[0], node.elevationMeters + 0.025, node.position[2]);
        cap.receiveShadow = true;
        roadGroup.add(cap);
      }

      if (roadEditorMode) {
        const nodeHandleMat = roadDisposer.trackMaterial(
          new THREE.MeshStandardMaterial({
            color: 0x0284c7,
            emissive: 0x0369a1,
            emissiveIntensity: 0.35,
          })
        );
        const handleMesh = new THREE.Mesh(
          roadDisposer.trackGeometry(new THREE.CylinderGeometry(1.15, 1.15, 0.45, 20)),
          nodeHandleMat
        );
        handleMesh.position.set(
          node.position[0],
          node.elevationMeters + 0.35,
          node.position[2]
        );
        handleMesh.userData = {
          handleType: 'node',
          handleId: node.id,
        };
        roadGroup.add(handleMesh);
      }
    }

    // Render Intersection Junction Bézier Lane Routing Vectors when Road Editor Mode is active
    if (roadEditorMode) {
      const junctionRoutes = computeIntersectionJunctionLaneRoutes(splineRoadNetwork);
      const lineMat = roadDisposer.trackMaterial(
        new THREE.LineBasicMaterial({ color: 0x38bdf8 })
      );
      for (const jr of junctionRoutes) {
        const pts = jr.points.map((p) => new THREE.Vector3(p[0], p[1] + 0.12, p[2]));
        const lineGeo = roadDisposer.trackGeometry(
          new THREE.BufferGeometry().setFromPoints(pts)
        );
        const line = new THREE.Line(lineGeo, lineMat);
        roadGroup.add(line);
      }
    }

    // Step C: Sidewalk-Welded Civic Plazas & Pocket Parks (`spatial.infrastructure.civic.plaza-park`)
    const plazasGroup = buildCivicPlazasAndParksInstancedGroup(
      splineRoadNetwork.civicPlazas || BREMERTON_DEFAULT_CIVIC_PLAZAS
    );
    roadDisposer.trackObjectTree(plazasGroup);
    roadGroup.add(plazasGroup);
  }, [splineRoadNetwork, roadEditorMode]);

  // ==========================================================================
  // RENDER PROCEDURAL COLLIDER WIREFRAMES WHEN TOGGLED ON
  // ==========================================================================
  useEffect(() => {
    const colGroup = colliderVisualGroupRef.current;
    if (!colGroup) return;
    colGroup.clear();
    if (!showColliders) return;

    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x059669,
      wireframe: true,
      transparent: true,
      opacity: 0.75,
    });

    for (const col of collisionSystem.getAll()) {
      if (col.shape === 'box' && col.halfExtents) {
        const m = new THREE.Mesh(
          new THREE.BoxGeometry(
            col.halfExtents[0] * 2,
            col.halfExtents[1] * 2,
            col.halfExtents[2] * 2
          ),
          wireMat
        );
        m.position.set(...col.center);
        colGroup.add(m);
      } else if (col.shape === 'cylinder' && col.radius) {
        const m = new THREE.Mesh(
          new THREE.CylinderGeometry(col.radius, col.radius, col.height || 1.8, 18),
          wireMat
        );
        m.position.set(...col.center);
        colGroup.add(m);
      }
    }
  }, [showColliders, spatialNodes, customProps]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-[#d6e3ee]">
      {/* 3D WebGL2 / r186 Canvas Mount */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Active Building Hover / Mouse-Wheel Floor Cutaway Banner */}
      {hoveredBuilding && (
        <div className="pointer-events-none absolute top-14 left-1/2 -translate-x-1/2 z-20 px-3.5 py-1.5 rounded-xl bg-[#FAF7F2]/95 border border-teal-600/50 shadow-md text-[11px] font-medium text-stone-800 flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-teal-600 animate-ping" />
          <span>
            <strong>{hoveredBuilding.buildingLabel}</strong> • Viewing{' '}
            <span className="font-mono font-bold text-teal-800">
              Floor {hoveredBuilding.activeFloorIndex + 1} / {hoveredBuilding.storyCount}
            </span>
          </span>
          <span className="px-1.5 py-0.5 rounded bg-[#F3EFE6] border border-stone-300 text-[10px] font-mono text-stone-600">
            Mouse-Wheel: Step Floors • Click Pin in 3D to Lock
          </span>
        </div>
      )}

      {/* CS2 Road Editor Active Banner */}
      {roadEditorMode && (
        <div className="pointer-events-none absolute top-14 left-1/2 -translate-x-1/2 z-20 px-3.5 py-1.5 rounded-lg bg-[#FAF7F2]/92 border border-amber-500/40 shadow-sm text-[11px] font-medium text-stone-800 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-sky-600 animate-pulse" />
          <span>
            <strong>CS2 Spline Road & Junction Mode:</strong> Drag Blue Nodes or Amber Bezier Tangents (Max 15° Incline • Min 25m Radius)
          </span>
        </div>
      )}

      {/* 3D Spatial UI Pin Buttons (`interaction.ui.pin_button`) Anchored to Each Building */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-10">
        {buildingPinOverlays.map((bp) => {
          if (!bp.visible) return null;
          const pinState = pinnedBuildingFloors[bp.buildingIndex];
          const isPinned = Boolean(pinState?.isPinned);
          const isHovered = hoveredBuilding?.buildingIndex === bp.buildingIndex;
          const displayedFloorIdx = isPinned
            ? pinState.activeFloorIndex
            : isHovered
            ? hoveredBuilding.activeFloorIndex
            : bp.storyCount - 1;

          return (
            <div
              key={bp.buildingAddress}
              style={{
                transform: `translate3d(${bp.x}px, ${bp.y}px, 0) translate(-50%, -50%)`,
              }}
              className="pointer-events-auto absolute top-0 left-0 flex items-center gap-1 px-2 py-1 rounded-lg bg-[#FAF7F2]/94 backdrop-blur-md border border-stone-300/90 shadow-md text-[10px] font-medium text-stone-800 transition-all"
            >
              <button
                type="button"
                onClick={() =>
                  handleTogglePinBuildingFloor(
                    bp.buildingIndex,
                    bp.buildingAddress,
                    Math.max(0, bp.storyCount - 2)
                  )
                }
                title={
                  isPinned
                    ? `Unpin ${bp.shortLabel} Floor ${displayedFloorIdx + 1}`
                    : `Pin ${bp.shortLabel} Cutaway at Floor ${displayedFloorIdx + 1}`
                }
                className={`px-1.5 py-0.5 rounded flex items-center gap-1 font-semibold transition-colors ${
                  isPinned
                    ? 'bg-amber-600 text-white shadow-xs'
                    : isHovered
                    ? 'bg-teal-700 text-white'
                    : 'bg-[#F3EFE6] text-stone-700 hover:bg-stone-200'
                }`}
              >
                <svg
                  className="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill={isPinned ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 17v5" />
                  <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
                </svg>
                <span>
                  {bp.shortLabel.split(' ')[0]} F{displayedFloorIdx + 1}/{bp.storyCount}
                </span>
              </button>

              {(isPinned || isHovered) && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      handleStepBuildingFloor(
                        bp.buildingIndex,
                        bp.buildingAddress,
                        bp.storyCount,
                        -1
                      )
                    }
                    title="Step Down 1 Floor"
                    className="w-4 h-4 rounded bg-stone-200/80 hover:bg-stone-300 text-stone-800 flex items-center justify-center font-mono font-bold"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleStepBuildingFloor(
                        bp.buildingIndex,
                        bp.buildingAddress,
                        bp.storyCount,
                        1
                      )
                    }
                    title="Step Up 1 Floor"
                    className="w-4 h-4 rounded bg-stone-200/80 hover:bg-stone-300 text-stone-800 flex items-center justify-center font-mono font-bold"
                  >
                    +
                  </button>
                  {onSendCitizenToBuildingFloor && (
                    <button
                      type="button"
                      onClick={() =>
                        onSendCitizenToBuildingFloor(
                          bp.buildingAddress,
                          displayedFloorIdx
                        )
                      }
                      title="Send Selected Citizen Upstairs to This Floor"
                      className="px-1.5 py-0.5 rounded bg-teal-700 hover:bg-teal-800 text-white font-semibold"
                    >
                      Visit
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom-Left r186 Pipeline Controls & Inspected Ontological Address Pill */}
      <div className="absolute bottom-3 left-3 z-10 flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => setShowSmartPins((v) => !v)}
          className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all border shadow-xs ${
            showSmartPins
              ? 'bg-teal-700 text-white border-teal-800'
              : 'bg-[#FAF7F2]/90 text-stone-700 border-stone-300/80 hover:bg-white'
          }`}
        >
          {showSmartPins ? 'Hide Affordance Pins' : 'Affordance Pins'}
        </button>

        <button
          onClick={() => setBloomEnabled((v) => !v)}
          className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all border shadow-xs ${
            bloomEnabled
              ? 'bg-amber-600 text-white border-amber-700'
              : 'bg-[#FAF7F2]/90 text-stone-700 border-stone-300/80 hover:bg-white'
          }`}
        >
          {bloomEnabled ? 'UnrealBloom + SMAA: ON' : 'Bloom: OFF'}
        </button>

        {Object.keys(pinnedBuildingFloors).length > 0 && (
          <button
            onClick={() => setPinnedBuildingFloors({})}
            className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-600 text-white border border-amber-700 shadow-xs"
          >
            Unpin All Floors ({Object.keys(pinnedBuildingFloors).length})
          </button>
        )}

        {inspectedDcaAddress && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FAF7F2]/95 border border-teal-600/50 text-[10px] font-mono text-teal-900 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
            <span>Ref: {inspectedDcaAddress}</span>
          </div>
        )}

        {memStats && (
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FAF7F2]/90 border border-stone-300/80 text-[10px] font-mono text-stone-700 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>
              r186 Instanced: {memStats.totalInstancesRendered} inst •{' '}
              {memStats.geometriesActive} geo • GPU Cutaway Mask Active
            </span>
          </div>
        )}
      </div>

      {/* Optional Smart Target Affordance Pins */}
      {showSmartPins &&
        targetPins.map(
          (pin) =>
            pin.visible && (
              <button
                key={pin.address}
                onClick={() => onSelectSmartTarget(pin.address)}
                style={{
                  transform: `translate3d(${pin.x}px, ${pin.y}px, 0) translate(-50%, -50%)`,
                }}
                className="absolute top-0 left-0 z-10 px-2 py-0.5 rounded bg-[#FAF7F2]/92 hover:bg-teal-700 hover:text-white text-stone-800 border border-stone-300/80 shadow-xs text-[10px] font-medium whitespace-nowrap transition-colors"
              >
                {pin.label}
              </button>
            )
        )}

      {/* Compact Daylight Citizen Nameplates & Speech Bubbles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {overlays.map((ov) => {
          if (!ov.visible) return null;
          const isSelected = ov.id === selectedCitizenId;
          return (
            <div
              key={ov.id}
              style={{
                transform: `translate3d(${ov.x}px, ${ov.y}px, 0) translate(-50%, -100%)`,
              }}
              className="absolute top-0 left-0 flex flex-col items-center gap-1"
            >
              {ov.speech && (
                <div className="max-w-[230px] px-2.5 py-1.5 rounded-lg bg-[#FAF7F2]/95 text-stone-800 border border-stone-300/90 shadow-md text-[11px] leading-snug">
                  {ov.speech}
                </div>
              )}
              <button
                onClick={() => onSelectCitizen(ov.id)}
                className={`pointer-events-auto px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-tight transition-all border shadow-xs flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-teal-700 text-white border-teal-800 scale-105'
                    : 'bg-[#FAF7F2]/88 text-stone-800 border-stone-300/80 hover:bg-white'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    ov.inShadowRegression
                      ? 'bg-rose-500'
                      : isSelected
                      ? 'bg-amber-300'
                      : 'bg-teal-600'
                  }`}
                />
                <span>{ov.fullName}</span>
                {ov.elevationFloorNumber > 1 && (
                  <span className="px-1 rounded bg-amber-500/20 font-mono text-[9px]">
                    F{ov.elevationFloorNumber}
                  </span>
                )}
                {ov.currentRoomZoningSlug && (
                  <span className="opacity-80 font-mono text-[9px]">
                    • {ov.currentRoomZoningSlug.split('.').pop()}
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
