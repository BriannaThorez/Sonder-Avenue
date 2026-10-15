/**
 * @domain spatial.structural.geometry.extrusion
 * @description Decomposes building lots into stepped-setback multi-story shells, terrace caps, BSP zoned rooms, and multi-floor pedestrian stair graphs.
 * @inputs lot_footprint: Vector2[], story_count: Integer, style_token: String
 * @outputs structural_mesh_group: THREE.Group, compiled_trees: CompiledBuildingTree[], pedestrian_graph: MultiFloorWaypointsRegistry
 * @dependencies spatial.structural.grammar.blueprint, spatial.structural.rendering.r186-instance-manager, SYSTEM.Ontology.AddressBus.core-resolver
 */

import * as THREE from 'three';
import {
  SceneResourceDisposer,
  createTslFacadeNodeMaterial,
  createTslWindowInstancedMaterial,
  createTslCutawayStandardMaterial,
} from './r186EngineArchitecture';
import { dcaAddressBus, DcaAddressDescriptor } from './dcaAddressOntologyBus';

// ============================================================================
// MODULE A: spatial.structural.grammar.blueprint (THE TOKENIZED RULEBOOK)
// ============================================================================
export type PnwStyleToken =
  | 'pnw.craftsman.weathered'
  | 'pnw.residential.townhouse'
  | 'pnw.heritage.masonry'
  | 'pnw.roastery.timber'
  | 'pnw.civic.atrium'
  | 'pnw.maritime.terminal';

export interface SetbackTierRule {
  minFloorNumber: number; // 1-indexed (e.g. 1, 4, 9)
  maxFloorNumber: number; // 1-indexed (e.g. 3, 8, 12)
  tierLabel: 'Base Podium' | 'Tower Setback' | 'Stepped Terrace';
  footprintScaleFactor: number; // 1.0 (100%), 0.8 (20% inset), 0.6 (40% inset)
  marginInsetMeters: number;
  spawnsPerimeterTerrace: boolean; // Triggers structural.surface.terrace on exposed slab below
}

export const CANONICAL_SETBACK_TIERS: SetbackTierRule[] = [
  {
    minFloorNumber: 1,
    maxFloorNumber: 3,
    tierLabel: 'Base Podium',
    footprintScaleFactor: 1.0,
    marginInsetMeters: 0.0,
    spawnsPerimeterTerrace: false,
  },
  {
    minFloorNumber: 4,
    maxFloorNumber: 8,
    tierLabel: 'Tower Setback',
    footprintScaleFactor: 0.8,
    marginInsetMeters: 1.35,
    spawnsPerimeterTerrace: true,
  },
  {
    minFloorNumber: 9,
    maxFloorNumber: 12,
    tierLabel: 'Stepped Terrace',
    footprintScaleFactor: 0.6,
    marginInsetMeters: 2.7,
    spawnsPerimeterTerrace: true,
  },
];

export interface StyleGrammarRule {
  token: PnwStyleToken;
  blueprintAddress: string;
  label: string;
  roofPitchDeg: number;
  eaveOverhangMeters: number;
  sidingMaterialType:
    | 'horizontal-lap-cedar'
    | 'kiln-brick-course'
    | 'board-and-batten'
    | 'zinc-standing-seam'
    | 'heavy-timber-curtain';
  wallThicknessMeters: number;
  defaultWindowIntervalMeters: number;
  windowWidthMeters: number;
  windowHeightRatio: number;
  doorWidthMeters: number;
  doorHeightMeters: number;
  groundFloorHeightMeters: number;
  upperStoryHeightMeters: number;
  setbackStartStory: number; // 0-indexed story where first setback occurs (default 3 = Level 4)
  setbackDepthMeters: number;
  palette: {
    primaryWallHex: string;
    secondaryWallHex: string;
    trimCorniceHex: string;
    interiorPartitionHex: string;
    floorSlabHex: string;
    terraceDeckHex: string;
    roofHex: string;
  };
  weatherGrimeCoefficient: number;
}

export const STYLE_RULE_DICTIONARY: Record<PnwStyleToken, StyleGrammarRule> = {
  'pnw.craftsman.weathered': {
    token: 'pnw.craftsman.weathered',
    blueprintAddress: 'dca.spatial.structural.grammar.style.pnw-craftsman-weathered',
    label: 'PNW Weathered Craftsman (22° Gable & Cedar Lap)',
    roofPitchDeg: 22,
    eaveOverhangMeters: 0.55,
    sidingMaterialType: 'horizontal-lap-cedar',
    wallThicknessMeters: 0.24,
    defaultWindowIntervalMeters: 3.0,
    windowWidthMeters: 1.35,
    windowHeightRatio: 0.56,
    doorWidthMeters: 1.6,
    doorHeightMeters: 2.35,
    groundFloorHeightMeters: 3.6,
    upperStoryHeightMeters: 3.1,
    setbackStartStory: 2,
    setbackDepthMeters: 1.25,
    palette: {
      primaryWallHex: '#DFD7C8',
      secondaryWallHex: '#C7BCA9',
      trimCorniceHex: '#2F3A36',
      interiorPartitionHex: '#EFECE6',
      floorSlabHex: '#B89B78',
      terraceDeckHex: '#9C8265',
      roofHex: '#374440',
    },
    weatherGrimeCoefficient: 0.42,
  },
  'pnw.residential.townhouse': {
    token: 'pnw.residential.townhouse',
    blueprintAddress: 'dca.spatial.structural.grammar.style.pnw-residential-townhouse',
    label: 'PNW Urban Courtyard Townhouse',
    roofPitchDeg: 14,
    eaveOverhangMeters: 0.4,
    sidingMaterialType: 'board-and-batten',
    wallThicknessMeters: 0.24,
    defaultWindowIntervalMeters: 3.0,
    windowWidthMeters: 1.45,
    windowHeightRatio: 0.6,
    doorWidthMeters: 1.8,
    doorHeightMeters: 2.45,
    groundFloorHeightMeters: 3.8,
    upperStoryHeightMeters: 3.2,
    setbackStartStory: 3, // Level 4 (index 3) triggers 20% Tower Setback + Terrace
    setbackDepthMeters: 1.35,
    palette: {
      primaryWallHex: '#EAE4D8',
      secondaryWallHex: '#D5CBB8',
      trimCorniceHex: '#2C353D',
      interiorPartitionHex: '#F4F1EA',
      floorSlabHex: '#C2A886',
      terraceDeckHex: '#A68B6B',
      roofHex: '#2E363E',
    },
    weatherGrimeCoefficient: 0.34,
  },
  'pnw.heritage.masonry': {
    token: 'pnw.heritage.masonry',
    blueprintAddress: 'dca.spatial.structural.grammar.style.pnw-heritage-masonry',
    label: 'Pacific Ave Heritage Kiln Masonry',
    roofPitchDeg: 6,
    eaveOverhangMeters: 0.35,
    sidingMaterialType: 'kiln-brick-course',
    wallThicknessMeters: 0.28,
    defaultWindowIntervalMeters: 3.0,
    windowWidthMeters: 1.3,
    windowHeightRatio: 0.58,
    doorWidthMeters: 1.9,
    doorHeightMeters: 2.6,
    groundFloorHeightMeters: 4.0,
    upperStoryHeightMeters: 3.4,
    setbackStartStory: 3,
    setbackDepthMeters: 1.25,
    palette: {
      primaryWallHex: '#9A4838',
      secondaryWallHex: '#7E382B',
      trimCorniceHex: '#C8BFA8',
      interiorPartitionHex: '#EDE8DF',
      floorSlabHex: '#9C8265',
      terraceDeckHex: '#876F55',
      roofHex: '#3B3734',
    },
    weatherGrimeCoefficient: 0.52,
  },
  'pnw.roastery.timber': {
    token: 'pnw.roastery.timber',
    blueprintAddress: 'dca.spatial.structural.grammar.style.pnw-roastery-timber',
    label: 'Sinclair Charred Cedar & Espresso Pavilion',
    roofPitchDeg: 18,
    eaveOverhangMeters: 0.65,
    sidingMaterialType: 'horizontal-lap-cedar',
    wallThicknessMeters: 0.22,
    defaultWindowIntervalMeters: 3.0,
    windowWidthMeters: 1.65,
    windowHeightRatio: 0.64,
    doorWidthMeters: 2.0,
    doorHeightMeters: 2.5,
    groundFloorHeightMeters: 3.7,
    upperStoryHeightMeters: 3.0,
    setbackStartStory: 2,
    setbackDepthMeters: 1.3,
    palette: {
      primaryWallHex: '#8E5A38',
      secondaryWallHex: '#6E4327',
      trimCorniceHex: '#1F262B',
      interiorPartitionHex: '#F2EDE4',
      floorSlabHex: '#A8845E',
      terraceDeckHex: '#8F6D49',
      roofHex: '#252B30',
    },
    weatherGrimeCoefficient: 0.3,
  },
  'pnw.civic.atrium': {
    token: 'pnw.civic.atrium',
    blueprintAddress: 'dca.spatial.structural.grammar.style.pnw-civic-atrium',
    label: 'Harborside Heavy-Timber & Zinc Civic Atrium',
    roofPitchDeg: 12,
    eaveOverhangMeters: 0.5,
    sidingMaterialType: 'zinc-standing-seam',
    wallThicknessMeters: 0.25,
    defaultWindowIntervalMeters: 3.5,
    windowWidthMeters: 1.9,
    windowHeightRatio: 0.68,
    doorWidthMeters: 2.2,
    doorHeightMeters: 2.7,
    groundFloorHeightMeters: 4.2,
    upperStoryHeightMeters: 3.5,
    setbackStartStory: 2,
    setbackDepthMeters: 1.35,
    palette: {
      primaryWallHex: '#CFD9E0',
      secondaryWallHex: '#B6C4CE',
      trimCorniceHex: '#2C3A45',
      interiorPartitionHex: '#F5F7F8',
      floorSlabHex: '#C7C2B8',
      terraceDeckHex: '#AEB6BC',
      roofHex: '#2A3640',
    },
    weatherGrimeCoefficient: 0.25,
  },
  'pnw.maritime.terminal': {
    token: 'pnw.maritime.terminal',
    blueprintAddress: 'dca.spatial.structural.grammar.style.pnw-maritime-terminal',
    label: 'Washington State Ferries Timber-Truss Headhouse',
    roofPitchDeg: 20,
    eaveOverhangMeters: 0.7,
    sidingMaterialType: 'heavy-timber-curtain',
    wallThicknessMeters: 0.26,
    defaultWindowIntervalMeters: 3.5,
    windowWidthMeters: 1.75,
    windowHeightRatio: 0.62,
    doorWidthMeters: 2.4,
    doorHeightMeters: 2.7,
    groundFloorHeightMeters: 4.4,
    upperStoryHeightMeters: 3.6,
    setbackStartStory: 1,
    setbackDepthMeters: 1.1,
    palette: {
      primaryWallHex: '#F2EFE8',
      secondaryWallHex: '#E0DBD0',
      trimCorniceHex: '#0F5C3F',
      interiorPartitionHex: '#F7F5F0',
      floorSlabHex: '#B5AEA2',
      terraceDeckHex: '#9E978B',
      roofHex: '#0F5C3F',
    },
    weatherGrimeCoefficient: 0.32,
  },
};

// ============================================================================
// MODULE B: spatial.structural.zoning.floorplan & MULTI-FLOOR CONNECTIVITY
// ============================================================================
export type RoomZoneTag =
  | 'corridor'
  | 'stairwell'
  | 'lobby'
  | 'kitchen'
  | 'living-salon'
  | 'studio-loft'
  | 'cafe-roastery'
  | 'archive-study'
  | 'transit-concourse'
  | 'terrace-deck';

export type SemanticZoningSlug =
  | 'zoning.residential.circulation.hallway'
  | 'zoning.vertical.core.stairwell'
  | 'zoning.commercial.retail.storefront'
  | 'zoning.residential.apartment.kitchen'
  | 'zoning.residential.apartment.living'
  | 'zoning.residential.apartment.bedroom'
  | 'zoning.commercial.roastery.espresso-bar'
  | 'zoning.civic.archive.study-hall'
  | 'zoning.civic.atrium.concourse'
  | 'structural.surface.terrace';

export const ZONE_TAG_TO_SEMANTIC_SLUG: Record<RoomZoneTag, SemanticZoningSlug> = {
  corridor: 'zoning.residential.circulation.hallway',
  stairwell: 'zoning.vertical.core.stairwell',
  lobby: 'zoning.commercial.retail.storefront',
  kitchen: 'zoning.residential.apartment.kitchen',
  'living-salon': 'zoning.residential.apartment.living',
  'studio-loft': 'zoning.residential.apartment.bedroom',
  'cafe-roastery': 'zoning.commercial.roastery.espresso-bar',
  'archive-study': 'zoning.civic.archive.study-hall',
  'transit-concourse': 'zoning.civic.atrium.concourse',
  'terrace-deck': 'structural.surface.terrace',
};

export interface BspRoomCell {
  roomId: string;
  address: string;
  buildingAddress: string;
  storyIndex: number; // 0-indexed (0 = Floor 1)
  zoneTag: RoomZoneTag;
  semanticZoningSlug: SemanticZoningSlug;
  reflexiveAffordanceAction: string;
  boundsMin: [number, number]; // local [minX, minZ] in meters
  boundsMax: [number, number]; // local [maxX, maxZ] in meters
  centerWorld: [number, number, number]; // resolved 1:1 world [x, y, z]
  areaSqMeters: number;
  connectedDoorPortals: Array<[number, number]>;
}

export interface BspInteriorPartitionWall {
  start: [number, number];
  end: [number, number];
  storyIndex: number;
  elevationY: number;
  heightMeters: number;
  hasDoorwayPortal: boolean;
  doorwayCenterT: number;
}

export interface PedestrianWaypointNode {
  waypointAddress: string;
  buildingAddress: string;
  storyIndex: number;
  kind:
    | 'spatial.network.pedestrian.entry-threshold'
    | 'spatial.network.pedestrian.hallway'
    | 'spatial.network.pedestrian.vertical.stairwell'
    | 'spatial.network.pedestrian.room-anchor'
    | 'spatial.network.pedestrian.terrace-walk';
  worldPosition: [number, number, number];
  connectedWaypointAddresses: string[];
  semanticZoningSlug: SemanticZoningSlug;
}

export interface BspStoryPlan {
  storyIndex: number;
  floorNumber: number; // 1-indexed (Level 1..12)
  setbackTierLabel: 'Base Podium' | 'Tower Setback' | 'Stepped Terrace';
  footprintScaleFactor: number; // 1.0, 0.8, 0.6
  elevationY: number;
  heightMeters: number;
  setbackInsetMeters: number;
  hasExposedPerimeterTerrace: boolean;
  terraceSurfaceToken?: 'structural.surface.terrace';
  rooms: BspRoomCell[];
  interiorWalls: BspInteriorPartitionWall[];
  stairwellCell: BspRoomCell;
  waypoints: PedestrianWaypointNode[];
}

const ZONE_REFLEXIVE_AFFORDANCE: Record<RoomZoneTag, string> = {
  corridor: 'Traverse internal circulation hallway toward stairwell or apartment doorway',
  stairwell: 'Ascend or descend multi-story vertical stairwell gateway',
  lobby: 'Browse ground-floor storefront reception & community bulletin board',
  kitchen: 'Prepare espresso, simmer coastal chowder, or dine at kitchen island',
  'living-salon': 'Relax on apartment sofa, converse, or gaze across Puget Sound',
  'studio-loft': 'Read archival manuscripts, sketch at studio desk, or rest',
  'cafe-roastery': 'Order single-origin espresso & converse at roastery counter',
  'archive-study': 'Inspect maritime charts & quiet reading tables',
  'transit-concourse': 'Queue for Washington State Ferry departure gate',
  'terrace-deck': 'Step onto inset setback terrace rail overlooking Bremerton waterfront',
};

/**
 * Evaluates Step A setback rules (Levels 1-3 = 100%, Levels 4-8 = 80%, Levels 9-12 = 60%)
 * combined with the style rule's setback trigger.
 */
export function computeStorySetbackParameters(
  storyIndex: number,
  rule: StyleGrammarRule
): {
  floorNumber: number;
  tierLabel: 'Base Podium' | 'Tower Setback' | 'Stepped Terrace';
  footprintScaleFactor: number;
  setbackInsetMeters: number;
  isSetbackTransitionStory: boolean;
} {
  const floorNumber = storyIndex + 1;
  if (floorNumber >= 9) {
    return {
      floorNumber,
      tierLabel: 'Stepped Terrace',
      footprintScaleFactor: 0.6,
      setbackInsetMeters: rule.setbackDepthMeters * 2.0,
      isSetbackTransitionStory: floorNumber === 9,
    };
  }
  if (floorNumber >= 4 || storyIndex >= rule.setbackStartStory) {
    const triggerFloor = Math.min(4, rule.setbackStartStory + 1);
    return {
      floorNumber,
      tierLabel: 'Tower Setback',
      footprintScaleFactor: 0.8,
      setbackInsetMeters: rule.setbackDepthMeters,
      isSetbackTransitionStory: floorNumber === triggerFloor,
    };
  }
  return {
    floorNumber,
    tierLabel: 'Base Podium',
    footprintScaleFactor: 1.0,
    setbackInsetMeters: 0.0,
    isSetbackTransitionStory: false,
  };
}

/**
 * Stage 2 (Step C & Step D): Executes Binary Space Partitioning (BSP) on a building's 2D footprint
 * bounds to slice each story into a central circulation spine (`zoning.residential.circulation.hallway`),
 * a vertical `spatial.network.pedestrian.vertical.stairwell` shaft, semantic room cells, and
 * `structural.surface.terrace` roof decks when an upper setback occurs.
 */
export function computeBspStoryFloorplan(params: {
  buildingAddress: string;
  worldOrigin: [number, number, number];
  footprintPolygon: Array<[number, number]>;
  storyIndex: number;
  elevationY: number;
  storyHeight: number;
  setbackInsetMeters: number;
  tierLabel: 'Base Podium' | 'Tower Setback' | 'Stepped Terrace';
  footprintScaleFactor: number;
  hasExposedPerimeterTerrace: boolean;
  targetRoomCount: number;
  styleToken: PnwStyleToken;
}): BspStoryPlan {
  const {
    buildingAddress,
    worldOrigin,
    footprintPolygon,
    storyIndex,
    elevationY,
    storyHeight,
    setbackInsetMeters,
    tierLabel,
    footprintScaleFactor,
    hasExposedPerimeterTerrace,
    targetRoomCount,
    styleToken,
  } = params;

  const floorNumStr = String(storyIndex + 1).padStart(2, '0');
  let rawMinX = Infinity,
    rawMaxX = -Infinity,
    rawMinZ = Infinity,
    rawMaxZ = -Infinity;
  for (const [vx, vz] of footprintPolygon) {
    if (vx < rawMinX) rawMinX = vx;
    if (vx > rawMaxX) rawMaxX = vx;
    if (vz < rawMinZ) rawMinZ = vz;
    if (vz > rawMaxZ) rawMaxZ = vz;
  }

  const minX = rawMinX + setbackInsetMeters;
  const maxX = rawMaxX - setbackInsetMeters;
  const minZ = rawMinZ + setbackInsetMeters;
  const maxZ = rawMaxZ - setbackInsetMeters;

  const rooms: BspRoomCell[] = [];
  const interiorWalls: BspInteriorPartitionWall[] = [];
  const waypoints: PedestrianWaypointNode[] = [];

  // 1. Carve Central East-West Circulation Hallway + Vertical Stairwell Core
  const corridorHalfDepth = 1.05; // 2.1m clear hallway width
  const centerZ = (minZ + maxZ) * 0.5;
  const corrMinZ = centerZ - corridorHalfDepth;
  const corrMaxZ = centerZ + corridorHalfDepth;

  const stairWidth = 2.6;
  const stairMinX = maxX - stairWidth;

  const stairwellAddress = `${buildingAddress}.floor-${floorNumStr}.room.stairwell-core`;
  const stairwellWaypointAddr = `${buildingAddress}.floor-${floorNumStr}.waypoint.vertical-stairwell`;
  const hallwayWaypointAddr = `${buildingAddress}.floor-${floorNumStr}.waypoint.central-hallway`;

  const stairwellCell: BspRoomCell = {
    roomId: `${buildingAddress}.s${storyIndex}.stairwell`,
    address: stairwellAddress,
    buildingAddress,
    storyIndex,
    zoneTag: 'stairwell',
    semanticZoningSlug: ZONE_TAG_TO_SEMANTIC_SLUG.stairwell,
    reflexiveAffordanceAction: ZONE_REFLEXIVE_AFFORDANCE.stairwell,
    boundsMin: [stairMinX, corrMinZ],
    boundsMax: [maxX, corrMaxZ],
    centerWorld: [
      Number((worldOrigin[0] + (stairMinX + maxX) * 0.5).toFixed(2)),
      Number(elevationY.toFixed(2)),
      Number((worldOrigin[2] + centerZ).toFixed(2)),
    ],
    areaSqMeters: Number((stairWidth * (corrMaxZ - corrMinZ)).toFixed(1)),
    connectedDoorPortals: [[stairMinX, centerZ]],
  };
  rooms.push(stairwellCell);

  const corridorCell: BspRoomCell = {
    roomId: `${buildingAddress}.s${storyIndex}.corridor`,
    address: `${buildingAddress}.floor-${floorNumStr}.room.central-corridor`,
    buildingAddress,
    storyIndex,
    zoneTag: 'corridor',
    semanticZoningSlug: ZONE_TAG_TO_SEMANTIC_SLUG.corridor,
    reflexiveAffordanceAction: ZONE_REFLEXIVE_AFFORDANCE.corridor,
    boundsMin: [minX, corrMinZ],
    boundsMax: [stairMinX, corrMaxZ],
    centerWorld: [
      Number((worldOrigin[0] + (minX + stairMinX) * 0.5).toFixed(2)),
      Number(elevationY.toFixed(2)),
      Number((worldOrigin[2] + centerZ).toFixed(2)),
    ],
    areaSqMeters: Number(((stairMinX - minX) * (corrMaxZ - corrMinZ)).toFixed(1)),
    connectedDoorPortals: [[(minX + stairMinX) * 0.5, corrMaxZ]],
  };
  rooms.push(corridorCell);

  // Register Stairwell Vertical Gateway Waypoint (links to floor below & floor above)
  const stairConnections: string[] = [hallwayWaypointAddr];
  if (storyIndex > 0) {
    const prevFloorStr = String(storyIndex).padStart(2, '0');
    stairConnections.push(
      `${buildingAddress}.floor-${prevFloorStr}.waypoint.vertical-stairwell`
    );
  }
  waypoints.push({
    waypointAddress: stairwellWaypointAddr,
    buildingAddress,
    storyIndex,
    kind: 'spatial.network.pedestrian.vertical.stairwell',
    worldPosition: [...stairwellCell.centerWorld],
    connectedWaypointAddresses: stairConnections,
    semanticZoningSlug: 'zoning.vertical.core.stairwell',
  });

  const hallwayConnections: string[] = [stairwellWaypointAddr];

  // If Ground Floor (storyIndex === 0), add street entry threshold waypoint on South streetfront
  if (storyIndex === 0) {
    const entryWaypointAddr = `${buildingAddress}.floor-01.waypoint.street-entry-threshold`;
    hallwayConnections.push(entryWaypointAddr);
    waypoints.push({
      waypointAddress: entryWaypointAddr,
      buildingAddress,
      storyIndex: 0,
      kind: 'spatial.network.pedestrian.entry-threshold',
      worldPosition: [
        Number((worldOrigin[0] + (minX + maxX) * 0.5).toFixed(2)),
        0,
        Number((worldOrigin[2] + maxZ + 1.2).toFixed(2)),
      ],
      connectedWaypointAddresses: [hallwayWaypointAddr],
      semanticZoningSlug: 'zoning.commercial.retail.storefront',
    });
  }

  // If this floor sits on a setback transition, register the exposed perimeter terrace cell (`structural.surface.terrace`)
  if (hasExposedPerimeterTerrace) {
    const terraceAddr = `${buildingAddress}.floor-${floorNumStr}.room.stepped-terrace-deck`;
    const terraceWpAddr = `${buildingAddress}.floor-${floorNumStr}.waypoint.terrace-promenade`;
    const terraceWorld: [number, number, number] = [
      Number((worldOrigin[0] + (rawMinX + rawMaxX) * 0.5).toFixed(2)),
      Number(elevationY.toFixed(2)),
      Number((worldOrigin[2] + rawMaxZ - setbackInsetMeters * 0.5).toFixed(2)),
    ];
    rooms.push({
      roomId: `${buildingAddress}.s${storyIndex}.terrace`,
      address: terraceAddr,
      buildingAddress,
      storyIndex,
      zoneTag: 'terrace-deck',
      semanticZoningSlug: 'structural.surface.terrace',
      reflexiveAffordanceAction: ZONE_REFLEXIVE_AFFORDANCE['terrace-deck'],
      boundsMin: [rawMinX, maxZ],
      boundsMax: [rawMaxX, rawMaxZ],
      centerWorld: terraceWorld,
      areaSqMeters: Number(((rawMaxX - rawMinX) * setbackInsetMeters).toFixed(1)),
      connectedDoorPortals: [[(minX + maxX) * 0.5, maxZ]],
    });
    hallwayConnections.push(terraceWpAddr);
    waypoints.push({
      waypointAddress: terraceWpAddr,
      buildingAddress,
      storyIndex,
      kind: 'spatial.network.pedestrian.terrace-walk',
      worldPosition: terraceWorld,
      connectedWaypointAddresses: [hallwayWaypointAddr],
      semanticZoningSlug: 'structural.surface.terrace',
    });
  }

  // Partition North Wing (minZ -> corrMinZ) and South Wing (corrMaxZ -> maxZ) via BSP
  const bayPartitions = Math.max(2, Math.min(4, Math.ceil(targetRoomCount / 2)));
  const spanX = maxX - minX;
  const cellW = spanX / bayPartitions;

  const groundZones: RoomZoneTag[] =
    styleToken === 'pnw.roastery.timber'
      ? ['cafe-roastery', 'kitchen', 'lobby', 'archive-study']
      : styleToken === 'pnw.maritime.terminal'
      ? ['transit-concourse', 'lobby', 'transit-concourse', 'archive-study']
      : ['lobby', 'kitchen', 'living-salon', 'archive-study'];

  const upperZones: RoomZoneTag[] = [
    'living-salon',
    'kitchen',
    'studio-loft',
    'archive-study',
  ];

  for (let b = 0; b < bayPartitions; b++) {
    const rx0 = minX + b * cellW;
    const rx1 = minX + (b + 1) * cellW;
    const midX = (rx0 + rx1) * 0.5;
    const bayStr = String(b + 1).padStart(2, '0');

    const nTag =
      storyIndex === 0
        ? groundZones[b % groundZones.length]
        : upperZones[b % upperZones.length];
    const sTag =
      storyIndex === 0
        ? groundZones[(b + 1) % groundZones.length]
        : upperZones[(b + 2) % upperZones.length];

    const northRoomAddr = `${buildingAddress}.floor-${floorNumStr}.room.${nTag}-north-${bayStr}`;
    const northCenter: [number, number, number] = [
      Number((worldOrigin[0] + midX).toFixed(2)),
      Number(elevationY.toFixed(2)),
      Number((worldOrigin[2] + (minZ + corrMinZ) * 0.5).toFixed(2)),
    ];
    rooms.push({
      roomId: `${buildingAddress}.s${storyIndex}.north-${b}`,
      address: northRoomAddr,
      buildingAddress,
      storyIndex,
      zoneTag: nTag,
      semanticZoningSlug: ZONE_TAG_TO_SEMANTIC_SLUG[nTag],
      reflexiveAffordanceAction: ZONE_REFLEXIVE_AFFORDANCE[nTag],
      boundsMin: [rx0, minZ],
      boundsMax: [rx1, corrMinZ],
      centerWorld: northCenter,
      areaSqMeters: Number(((rx1 - rx0) * (corrMinZ - minZ)).toFixed(1)),
      connectedDoorPortals: [[midX, corrMinZ]],
    });

    const northWpAddr = `${buildingAddress}.floor-${floorNumStr}.waypoint.${nTag}-north-${bayStr}`;
    hallwayConnections.push(northWpAddr);
    waypoints.push({
      waypointAddress: northWpAddr,
      buildingAddress,
      storyIndex,
      kind: 'spatial.network.pedestrian.room-anchor',
      worldPosition: northCenter,
      connectedWaypointAddresses: [hallwayWaypointAddr],
      semanticZoningSlug: ZONE_TAG_TO_SEMANTIC_SLUG[nTag],
    });

    const southRoomAddr = `${buildingAddress}.floor-${floorNumStr}.room.${sTag}-south-${bayStr}`;
    const southCenter: [number, number, number] = [
      Number((worldOrigin[0] + midX).toFixed(2)),
      Number(elevationY.toFixed(2)),
      Number((worldOrigin[2] + (corrMaxZ + maxZ) * 0.5).toFixed(2)),
    ];
    rooms.push({
      roomId: `${buildingAddress}.s${storyIndex}.south-${b}`,
      address: southRoomAddr,
      buildingAddress,
      storyIndex,
      zoneTag: sTag,
      semanticZoningSlug: ZONE_TAG_TO_SEMANTIC_SLUG[sTag],
      reflexiveAffordanceAction: ZONE_REFLEXIVE_AFFORDANCE[sTag],
      boundsMin: [rx0, corrMaxZ],
      boundsMax: [rx1, maxZ],
      centerWorld: southCenter,
      areaSqMeters: Number(((rx1 - rx0) * (maxZ - corrMaxZ)).toFixed(1)),
      connectedDoorPortals: [[midX, corrMaxZ]],
    });

    const southWpAddr = `${buildingAddress}.floor-${floorNumStr}.waypoint.${sTag}-south-${bayStr}`;
    hallwayConnections.push(southWpAddr);
    waypoints.push({
      waypointAddress: southWpAddr,
      buildingAddress,
      storyIndex,
      kind: 'spatial.network.pedestrian.room-anchor',
      worldPosition: southCenter,
      connectedWaypointAddresses: [hallwayWaypointAddr],
      semanticZoningSlug: ZONE_TAG_TO_SEMANTIC_SLUG[sTag],
    });

    interiorWalls.push({
      start: [rx0, corrMinZ],
      end: [rx1, corrMinZ],
      storyIndex,
      elevationY,
      heightMeters: storyHeight,
      hasDoorwayPortal: true,
      doorwayCenterT: 0.5,
    });

    interiorWalls.push({
      start: [rx0, corrMaxZ],
      end: [rx1, corrMaxZ],
      storyIndex,
      elevationY,
      heightMeters: storyHeight,
      hasDoorwayPortal: true,
      doorwayCenterT: 0.5,
    });

    if (b > 0) {
      interiorWalls.push({
        start: [rx0, minZ],
        end: [rx0, corrMinZ],
        storyIndex,
        elevationY,
        heightMeters: storyHeight,
        hasDoorwayPortal: false,
        doorwayCenterT: 0.5,
      });
      interiorWalls.push({
        start: [rx0, corrMaxZ],
        end: [rx0, maxZ],
        storyIndex,
        elevationY,
        heightMeters: storyHeight,
        hasDoorwayPortal: false,
        doorwayCenterT: 0.5,
      });
    }
  }

  waypoints.push({
    waypointAddress: hallwayWaypointAddr,
    buildingAddress,
    storyIndex,
    kind: 'spatial.network.pedestrian.hallway',
    worldPosition: [...corridorCell.centerWorld],
    connectedWaypointAddresses: hallwayConnections,
    semanticZoningSlug: 'zoning.residential.circulation.hallway',
  });

  return {
    storyIndex,
    floorNumber: storyIndex + 1,
    setbackTierLabel: tierLabel,
    footprintScaleFactor,
    elevationY,
    heightMeters: storyHeight,
    setbackInsetMeters,
    hasExposedPerimeterTerrace,
    terraceSurfaceToken: hasExposedPerimeterTerrace
      ? 'structural.surface.terrace'
      : undefined,
    rooms,
    interiorWalls,
    stairwellCell,
    waypoints,
  };
}

// ============================================================================
// MODULE C: SUBTRACTIVE FACE PROCESSOR & TERRACE/CORNICE KIT
// ============================================================================
export interface SubtractiveWallModule {
  dcaAddress: string;
  moduleType:
    | 'solid-pier'
    | 'window-sill'
    | 'window-lintel'
    | 'window-pane'
    | 'window-frame'
    | 'door-frame'
    | 'belt-cornice'
    | 'terrace-railing';
  buildingIndex: number;
  floorIndex: number; // Float used by GPU cutaway discard mask
  worldPosition: [number, number, number];
  rotationYRad: number;
  scaleMeters: [number, number, number];
  colorHex: string;
  seed: number;
  lumState: number;
}

export function processWallFaceSubtractiveGrid(params: {
  buildingAddress: string;
  buildingIndex: number;
  edgeIndex: number;
  worldOrigin: [number, number, number];
  buildingRotationYRad: number;
  edgeStart: [number, number];
  edgeEnd: [number, number];
  storyIndex: number;
  elevationY: number;
  storyHeight: number;
  setbackInset: number;
  hasExposedPerimeterTerrace: boolean;
  windowIntervalMeters: number;
  rule: StyleGrammarRule;
  isPrimaryStreetFront: boolean;
  lotSeed: number;
}): SubtractiveWallModule[] {
  const {
    buildingAddress,
    buildingIndex,
    edgeIndex,
    worldOrigin,
    buildingRotationYRad,
    edgeStart,
    edgeEnd,
    storyIndex,
    elevationY,
    storyHeight,
    setbackInset,
    hasExposedPerimeterTerrace,
    windowIntervalMeters,
    rule,
    isPrimaryStreetFront,
    lotSeed,
  } = params;

  const modules: SubtractiveWallModule[] = [];
  const dx = edgeEnd[0] - edgeStart[0];
  const dz = edgeEnd[1] - edgeStart[1];
  const edgeLen = Math.hypot(dx, dz);
  if (edgeLen < 1.8) return modules;

  const floorNumStr = String(storyIndex + 1).padStart(2, '0');
  const edgeSlug = `edge-${String(edgeIndex + 1).padStart(2, '0')}`;
  const edgeAngle = Math.atan2(dx, dz) - Math.PI / 2;
  const normalX = dz / edgeLen;
  const normalZ = -dx / edgeLen;
  const dirX = dx / edgeLen;
  const dirZ = dz / edgeLen;

  const effectiveEdgeLen = Math.max(2.0, edgeLen - Math.abs(setbackInset) * 1.4);
  const bayCount = Math.max(
    1,
    Math.round(effectiveEdgeLen / Math.max(2.0, windowIntervalMeters))
  );
  const bayWidth = edgeLen / bayCount;
  const wallT = rule.wallThicknessMeters;

  // Exterior wall modules get floorIndex = storyIndex + 0.25 so that when cutaway is set to
  // `storyIndex + 0.1`, the inspected floor's exterior walls vanish while its interior stays visible!
  const exteriorWallFloorTag = storyIndex + 0.25;

  // Inter-story Horizontal Belt Cornice / Base Molding
  const midEdgeX =
    worldOrigin[0] + (edgeStart[0] + edgeEnd[0]) * 0.5 + normalX * setbackInset;
  const midEdgeZ =
    worldOrigin[2] + (edgeStart[1] + edgeEnd[1]) * 0.5 + normalZ * setbackInset;
  modules.push({
    dcaAddress: `${buildingAddress}.floor-${floorNumStr}.${edgeSlug}.cornice-trim`,
    moduleType: 'belt-cornice',
    buildingIndex,
    floorIndex: exteriorWallFloorTag,
    worldPosition: [
      midEdgeX,
      worldOrigin[1] + elevationY + storyHeight - 0.09,
      midEdgeZ,
    ],
    rotationYRad: buildingRotationYRad + edgeAngle,
    scaleMeters: [edgeLen + 0.16, 0.18, wallT + 0.14],
    colorHex: rule.palette.trimCorniceHex,
    seed: lotSeed + storyIndex * 11,
    lumState: 0,
  });

  // Step A.2: If this story inset created an exposed terrace on the outer boundary of the floor below,
  // spawn perimeter terrace safety railings & drainage trim along the outer polygon edge!
  if (hasExposedPerimeterTerrace) {
    const outerMidX = worldOrigin[0] + (edgeStart[0] + edgeEnd[0]) * 0.5;
    const outerMidZ = worldOrigin[2] + (edgeStart[1] + edgeEnd[1]) * 0.5;
    modules.push({
      dcaAddress: `${buildingAddress}.floor-${floorNumStr}.${edgeSlug}.terrace-railing`,
      moduleType: 'terrace-railing',
      buildingIndex,
      floorIndex: storyIndex, // Visible when inspecting this terrace floor!
      worldPosition: [outerMidX, worldOrigin[1] + elevationY + 0.52, outerMidZ],
      rotationYRad: buildingRotationYRad + edgeAngle,
      scaleMeters: [edgeLen, 1.04, 0.09],
      colorHex: rule.palette.trimCorniceHex,
      seed: lotSeed + 77,
      lumState: 0,
    });
  }

  for (let b = 0; b < bayCount; b++) {
    const bayStr = `bay-${String(b + 1).padStart(2, '0')}`;
    const centerDist = (b + 0.5) * bayWidth;
    const bx =
      worldOrigin[0] + edgeStart[0] + dirX * centerDist + normalX * setbackInset;
    const bz =
      worldOrigin[2] + edgeStart[1] + dirZ * centerDist + normalZ * setbackInset;
    const seed = lotSeed * 97 + storyIndex * 31 + b * 13;

    const isGroundOrTerraceDoorBay =
      (storyIndex === 0 || hasExposedPerimeterTerrace) &&
      isPrimaryStreetFront &&
      b === Math.floor(bayCount / 2);

    if (isGroundOrTerraceDoorBay) {
      const doorW = Math.min(rule.doorWidthMeters, bayWidth * 0.64);
      const doorH = Math.min(rule.doorHeightMeters, storyHeight - 0.45);
      const pierW = Math.max(0.22, (bayWidth - doorW) * 0.5);

      for (const side of [-1, 1]) {
        const offset = side * (doorW * 0.5 + pierW * 0.5);
        const sideSlug = side < 0 ? 'pier-left' : 'pier-right';
        modules.push({
          dcaAddress: `${buildingAddress}.floor-${floorNumStr}.${edgeSlug}.${bayStr}.${sideSlug}`,
          moduleType: 'solid-pier',
          buildingIndex,
          floorIndex: exteriorWallFloorTag,
          worldPosition: [
            bx + dirX * offset,
            worldOrigin[1] + elevationY + storyHeight * 0.5,
            bz + dirZ * offset,
          ],
          rotationYRad: buildingRotationYRad + edgeAngle,
          scaleMeters: [pierW, storyHeight, wallT],
          colorHex: rule.palette.primaryWallHex,
          seed: seed + side,
          lumState: 0,
        });
      }

      const lintelH = storyHeight - doorH;
      if (lintelH > 0.15) {
        modules.push({
          dcaAddress: `${buildingAddress}.floor-${floorNumStr}.${edgeSlug}.${bayStr}.transom-lintel`,
          moduleType: 'window-lintel',
          buildingIndex,
          floorIndex: exteriorWallFloorTag,
          worldPosition: [
            bx,
            worldOrigin[1] + elevationY + doorH + lintelH * 0.5,
            bz,
          ],
          rotationYRad: buildingRotationYRad + edgeAngle,
          scaleMeters: [doorW, lintelH, wallT],
          colorHex: rule.palette.secondaryWallHex,
          seed,
          lumState: 0,
        });
      }

      modules.push({
        dcaAddress: `${buildingAddress}.floor-${floorNumStr}.${edgeSlug}.${bayStr}.door-portal`,
        moduleType: 'door-frame',
        buildingIndex,
        floorIndex: storyIndex, // Keep doorway threshold visible on active floor cutaway
        worldPosition: [
          bx + normalX * 0.04,
          worldOrigin[1] + elevationY + doorH * 0.5,
          bz + normalZ * 0.04,
        ],
        rotationYRad: buildingRotationYRad + edgeAngle,
        scaleMeters: [doorW + 0.18, doorH + 0.08, wallT + 0.08],
        colorHex: rule.palette.trimCorniceHex,
        seed,
        lumState: 0.9,
      });
    } else {
      const winW = Math.min(rule.windowWidthMeters, bayWidth * 0.58);
      const winH = storyHeight * rule.windowHeightRatio;
      const sillH = (storyHeight - winH) * 0.45;
      const lintelH = storyHeight - winH - sillH;
      const pierW = Math.max(0.2, (bayWidth - winW) * 0.5);

      for (const side of [-1, 1]) {
        const offset = side * (winW * 0.5 + pierW * 0.5);
        const sideSlug = side < 0 ? 'pier-left' : 'pier-right';
        modules.push({
          dcaAddress: `${buildingAddress}.floor-${floorNumStr}.${edgeSlug}.${bayStr}.${sideSlug}`,
          moduleType: 'solid-pier',
          buildingIndex,
          floorIndex: exteriorWallFloorTag,
          worldPosition: [
            bx + dirX * offset,
            worldOrigin[1] + elevationY + storyHeight * 0.5,
            bz + dirZ * offset,
          ],
          rotationYRad: buildingRotationYRad + edgeAngle,
          scaleMeters: [pierW, storyHeight, wallT],
          colorHex: rule.palette.primaryWallHex,
          seed: seed + side,
          lumState: 0,
        });
      }

      modules.push({
        dcaAddress: `${buildingAddress}.floor-${floorNumStr}.${edgeSlug}.${bayStr}.window-sill`,
        moduleType: 'window-sill',
        buildingIndex,
        floorIndex: exteriorWallFloorTag,
        worldPosition: [bx, worldOrigin[1] + elevationY + sillH * 0.5, bz],
        rotationYRad: buildingRotationYRad + edgeAngle,
        scaleMeters: [winW, sillH, wallT],
        colorHex: rule.palette.secondaryWallHex,
        seed,
        lumState: 0,
      });

      modules.push({
        dcaAddress: `${buildingAddress}.floor-${floorNumStr}.${edgeSlug}.${bayStr}.window-lintel`,
        moduleType: 'window-lintel',
        buildingIndex,
        floorIndex: exteriorWallFloorTag,
        worldPosition: [
          bx,
          worldOrigin[1] + elevationY + sillH + winH + lintelH * 0.5,
          bz,
        ],
        rotationYRad: buildingRotationYRad + edgeAngle,
        scaleMeters: [winW, lintelH, wallT],
        colorHex: rule.palette.primaryWallHex,
        seed: seed + 5,
        lumState: 0,
      });

      const winCenterY = worldOrigin[1] + elevationY + sillH + winH * 0.5;
      modules.push({
        dcaAddress: `${buildingAddress}.floor-${floorNumStr}.${edgeSlug}.${bayStr}.window-frame`,
        moduleType: 'window-frame',
        buildingIndex,
        floorIndex: exteriorWallFloorTag,
        worldPosition: [bx + normalX * 0.02, winCenterY, bz + normalZ * 0.02],
        rotationYRad: buildingRotationYRad + edgeAngle,
        scaleMeters: [winW + 0.12, winH + 0.12, wallT * 0.85],
        colorHex: rule.palette.trimCorniceHex,
        seed,
        lumState: 0,
      });

      const pseudoLum = Math.abs(Math.sin(seed * 12.9898) * 43758.5453) % 1;
      modules.push({
        dcaAddress: `${buildingAddress}.floor-${floorNumStr}.${edgeSlug}.${bayStr}.window-pane`,
        moduleType: 'window-pane',
        buildingIndex,
        floorIndex: exteriorWallFloorTag,
        worldPosition: [bx + normalX * 0.03, winCenterY, bz + normalZ * 0.03],
        rotationYRad: buildingRotationYRad + edgeAngle,
        scaleMeters: [winW - 0.06, winH - 0.06, 0.06],
        colorHex: '#FFFFFF',
        seed,
        lumState: pseudoLum,
      });
    }
  }

  return modules;
}

// ============================================================================
// MODULE D: UNIFIED INSTANCED MANAGER, MULTI-FLOOR GRAPH & MASTER GENERATOR
// ============================================================================
export interface ParametricBuildingConfig {
  metaAddress: string;
  label: string;
  footprintCoordinates: Array<[number, number]>;
  worldOrigin: [number, number, number];
  rotationYRad: number;
  storyCount: number;
  styleToken: PnwStyleToken;
  windowIntervalMeters: number;
  internalRoomCount: number;
}

export interface CompiledBuildingTree {
  buildingIndex: number;
  config: ParametricBuildingConfig;
  rule: StyleGrammarRule;
  stories: BspStoryPlan[];
  subtractiveModules: SubtractiveWallModule[];
  totalHeightMeters: number;
  boundsMinWorld: [number, number, number];
  boundsMaxWorld: [number, number, number];
  roofPinAnchorWorld: [number, number, number];
  totalRoomsCount: number;
  totalVoidOpeningsCount: number;
  totalWaypointsCount: number;
}

/**
 * Live Multi-Floor Interior Zoning & Pedestrian Graph Registry
 * Queried at 10Hz by `citizenDaemonEngine.ts` for Reflexive Mind Reading and Vertical Stair Traversal.
 */
class MultiFloorWaypointsRegistry {
  private roomsByAddress = new Map<string, BspRoomCell>();
  private allRooms: BspRoomCell[] = [];
  private waypointsByAddress = new Map<string, PedestrianWaypointNode>();
  private buildingsByIndex: CompiledBuildingTree[] = [];

  public rebuildFromCompiledBuildings(buildings: CompiledBuildingTree[]): void {
    this.roomsByAddress.clear();
    this.allRooms = [];
    this.waypointsByAddress.clear();
    this.buildingsByIndex = buildings;

    for (const bldg of buildings) {
      for (const st of bldg.stories) {
        for (const rm of st.rooms) {
          this.roomsByAddress.set(rm.address, rm);
          this.allRooms.push(rm);
        }
        for (const wp of st.waypoints) {
          // Also add upward link to next floor stairwell if not top story
          if (
            wp.kind === 'spatial.network.pedestrian.vertical.stairwell' &&
            st.storyIndex < bldg.stories.length - 1
          ) {
            const nextFloorStr = String(st.storyIndex + 2).padStart(2, '0');
            const upAddr = `${bldg.config.metaAddress}.floor-${nextFloorStr}.waypoint.vertical-stairwell`;
            if (!wp.connectedWaypointAddresses.includes(upAddr)) {
              wp.connectedWaypointAddresses.push(upAddr);
            }
          }
          this.waypointsByAddress.set(wp.waypointAddress, wp);
        }
      }
    }
  }

  public getCompiledBuildings(): CompiledBuildingTree[] {
    return this.buildingsByIndex;
  }

  /**
   * Step C (Reflexive Mind Reading): Queries the exact semantic interior zoning tag
   * (`zoning.residential.apartment.kitchen`, `structural.surface.terrace`, etc.) at a 3D coordinate.
   */
  public queryRoomAtWorldPosition(
    pos: [number, number, number]
  ): BspRoomCell | null {
    for (const bldg of this.buildingsByIndex) {
      const [ox, oy, oz] = bldg.config.worldOrigin;
      const localX = pos[0] - ox;
      const localY = pos[1] - oy;
      const localZ = pos[2] - oz;
      if (localY < -0.5 || localY > bldg.totalHeightMeters + 1.5) continue;

      for (const st of bldg.stories) {
        if (
          localY >= st.elevationY - 0.6 &&
          localY <= st.elevationY + st.heightMeters + 0.6
        ) {
          for (const rm of st.rooms) {
            if (
              localX >= rm.boundsMin[0] - 0.4 &&
              localX <= rm.boundsMax[0] + 0.4 &&
              localZ >= rm.boundsMin[1] - 0.4 &&
              localZ <= rm.boundsMax[1] + 0.4
            ) {
              return rm;
            }
          }
        }
      }
    }
    return null;
  }

  /**
   * Step D (Multi-Floor Path Connectivity): Computes a 3D multi-floor waypoint sequence
   * from any world coordinate into a target building floor/room via the ground entry threshold
   * and vertical stairwell nodes (`spatial.network.pedestrian.vertical.stairwell`).
   */
  public planMultiFloorPathToRoom(
    currentPos: [number, number, number],
    targetBuildingAddress: string,
    targetStoryIndex: number,
    preferredZoneTag?: RoomZoneTag
  ): {
    targetRoom: BspRoomCell | null;
    waypointsWorld: Array<[number, number, number]>;
  } {
    const bldg = this.buildingsByIndex.find(
      (b) => b.config.metaAddress === targetBuildingAddress
    );
    if (!bldg) {
      return { targetRoom: null, waypointsWorld: [] };
    }
    const clampedStory = Math.max(
      0,
      Math.min(bldg.stories.length - 1, targetStoryIndex)
    );
    const storyPlan = bldg.stories[clampedStory];
    const targetRoom =
      storyPlan.rooms.find(
        (r) =>
          (preferredZoneTag ? r.zoneTag === preferredZoneTag : false) ||
          r.zoneTag === 'living-salon' ||
          r.zoneTag === 'kitchen' ||
          r.zoneTag === 'terrace-deck'
      ) || storyPlan.rooms[storyPlan.rooms.length - 1];

    const route: Array<[number, number, number]> = [];
    const groundStory = bldg.stories[0];

    // If citizen is currently outside or on ground level and target is on an upper floor,
    // route through ground street threshold -> ground stairwell -> target floor stairwell -> hallway -> room
    if (Math.abs(currentPos[1] - storyPlan.elevationY) > 1.2) {
      const entryWp = groundStory.waypoints.find(
        (w) => w.kind === 'spatial.network.pedestrian.entry-threshold'
      );
      if (entryWp && currentPos[1] < 0.8) {
        route.push([...entryWp.worldPosition]);
      }
      route.push([...groundStory.stairwellCell.centerWorld]);
      if (clampedStory > 0) {
        route.push([...storyPlan.stairwellCell.centerWorld]);
      }
    }

    route.push([...targetRoom.centerWorld]);
    return { targetRoom, waypointsWorld: route };
  }
}

export const multiFloorNavigationRegistry = new MultiFloorWaypointsRegistry();

export class ParametricExtrusionGenerator {
  public static parseMetaInputString(
    metaInput: string,
    overrideStyle?: PnwStyleToken,
    overrideStories?: number,
    overrideWindowInterval?: number,
    overrideRoomCount?: number
  ): Partial<ParametricBuildingConfig> {
    const clean = metaInput.trim().toLowerCase();
    let inferredStyle: PnwStyleToken = 'pnw.residential.townhouse';

    if (clean.includes('craftsman') || clean.includes('weathered')) {
      inferredStyle = 'pnw.craftsman.weathered';
    } else if (
      clean.includes('brick') ||
      clean.includes('heritage') ||
      clean.includes('masonry')
    ) {
      inferredStyle = 'pnw.heritage.masonry';
    } else if (
      clean.includes('cafe') ||
      clean.includes('roastery') ||
      clean.includes('timber')
    ) {
      inferredStyle = 'pnw.roastery.timber';
    } else if (clean.includes('civic') || clean.includes('atrium')) {
      inferredStyle = 'pnw.civic.atrium';
    } else if (
      clean.includes('ferry') ||
      clean.includes('terminal') ||
      clean.includes('maritime')
    ) {
      inferredStyle = 'pnw.maritime.terminal';
    }

    const styleToken = overrideStyle || inferredStyle;
    const rule = STYLE_RULE_DICTIONARY[styleToken];

    return {
      metaAddress: clean,
      styleToken,
      storyCount: overrideStories ?? 4,
      windowIntervalMeters:
        overrideWindowInterval ?? rule.defaultWindowIntervalMeters,
      internalRoomCount: overrideRoomCount ?? 6,
    };
  }

  public static compileBuildingTree(
    config: ParametricBuildingConfig,
    lotSeed = 1,
    buildingIndex = 0
  ): CompiledBuildingTree {
    const rule =
      STYLE_RULE_DICTIONARY[config.styleToken] ||
      STYLE_RULE_DICTIONARY['pnw.residential.townhouse'];

    const stories: BspStoryPlan[] = [];
    const subtractiveModules: SubtractiveWallModule[] = [];

    let minX = Infinity,
      maxX = -Infinity,
      minZ = Infinity,
      maxZ = -Infinity;
    for (const [vx, vz] of config.footprintCoordinates) {
      if (vx < minX) minX = vx;
      if (vx > maxX) maxX = vx;
      if (vz < minZ) minZ = vz;
      if (vz > maxZ) maxZ = vz;
    }

    let currentElevationY = 0;
    for (let s = 0; s < config.storyCount; s++) {
      const storyH =
        s === 0 ? rule.groundFloorHeightMeters : rule.upperStoryHeightMeters;
      const setbackSpec = computeStorySetbackParameters(s, rule);

      const storyPlan = computeBspStoryFloorplan({
        buildingAddress: config.metaAddress,
        worldOrigin: config.worldOrigin,
        footprintPolygon: config.footprintCoordinates,
        storyIndex: s,
        elevationY: currentElevationY,
        storyHeight: storyH,
        setbackInsetMeters: setbackSpec.setbackInsetMeters,
        tierLabel: setbackSpec.tierLabel,
        footprintScaleFactor: setbackSpec.footprintScaleFactor,
        hasExposedPerimeterTerrace: setbackSpec.isSetbackTransitionStory,
        targetRoomCount: config.internalRoomCount,
        styleToken: config.styleToken,
      });
      stories.push(storyPlan);

      const poly = config.footprintCoordinates;
      for (let e = 0; e < poly.length; e++) {
        const pA = poly[e];
        const pB = poly[(e + 1) % poly.length];
        const faceMods = processWallFaceSubtractiveGrid({
          buildingAddress: config.metaAddress,
          buildingIndex,
          edgeIndex: e,
          worldOrigin: config.worldOrigin,
          buildingRotationYRad: config.rotationYRad,
          edgeStart: pA,
          edgeEnd: pB,
          storyIndex: s,
          elevationY: currentElevationY,
          storyHeight: storyH,
          setbackInset: -setbackSpec.setbackInsetMeters,
          hasExposedPerimeterTerrace: setbackSpec.isSetbackTransitionStory,
          windowIntervalMeters: config.windowIntervalMeters,
          rule,
          isPrimaryStreetFront: e === 1 || e === 2,
          lotSeed: lotSeed + e,
        });
        subtractiveModules.push(...faceMods);
      }

      currentElevationY += storyH;
    }

    const totalRoomsCount = stories.reduce((acc, st) => acc + st.rooms.length, 0);
    const totalVoidOpeningsCount = subtractiveModules.filter(
      (m) => m.moduleType === 'window-pane' || m.moduleType === 'door-frame'
    ).length;
    const totalWaypointsCount = stories.reduce(
      (acc, st) => acc + st.waypoints.length,
      0
    );

    const centerLocalX = (minX + maxX) * 0.5;
    const centerLocalZ = (minZ + maxZ) * 0.5;

    return {
      buildingIndex,
      config,
      rule,
      stories,
      subtractiveModules,
      totalHeightMeters: currentElevationY,
      boundsMinWorld: [
        config.worldOrigin[0] + minX,
        config.worldOrigin[1],
        config.worldOrigin[2] + minZ,
      ],
      boundsMaxWorld: [
        config.worldOrigin[0] + maxX,
        config.worldOrigin[1] + currentElevationY,
        config.worldOrigin[2] + maxZ,
      ],
      roofPinAnchorWorld: [
        config.worldOrigin[0] + centerLocalX,
        config.worldOrigin[1] + currentElevationY + 1.8,
        config.worldOrigin[2] + centerLocalZ,
      ],
      totalRoomsCount,
      totalVoidOpeningsCount,
      totalWaypointsCount,
    };
  }

  /**
   * Stage 4: Batched & Instanced Assembly (The Fabricator for Three.js r186)
   * Stamps all exterior subtractive modules, stepped terrace railings, interior BSP partition walls,
   * interior room furniture/fixtures, stairwell steps, floor slabs, and pitched roofs into unified
   * THREE.InstancedMesh buffers with `aBuildingId` and `aFloorIndex` attributes for 0ms GPU cutaway!
   */
  public static fabricateInstancedUrbanScene(
    compiledBuildings: CompiledBuildingTree[],
    disposer: SceneResourceDisposer,
    cutawayXRayMode = false
  ): {
    districtGroup: THREE.Group;
    windowInstancedMaterial: THREE.MeshStandardMaterial;
    facadeInstancedMaterial: THREE.MeshStandardMaterial;
    trimInstancedMaterial: THREE.MeshStandardMaterial;
    interiorInstancedMaterial: THREE.MeshStandardMaterial;
  } {
    const districtGroup = new THREE.Group();
    districtGroup.name = 'world.bremerton.shape-grammar-instanced-district';

    // Sync Multi-Floor Navigation & Semantic Zoning Registry
    multiFloorNavigationRegistry.rebuildFromCompiledBuildings(compiledBuildings);

    // Clear and re-populate Agent-First Ontology Address Bus for shape-grammar-composer
    dcaAddressBus.clearComposerAddresses('shape-grammar-composer');
    const busDescriptors: DcaAddressDescriptor[] = [];

    const facadeMat = createTslFacadeNodeMaterial(disposer, 0xffffff);
    const windowMat = createTslWindowInstancedMaterial(disposer);
    const trimMat = createTslCutawayStandardMaterial(disposer, 0.52, 0.36);
    const interiorMat = createTslCutawayStandardMaterial(disposer, 0.78, 0.08);

    interface InstancedItemSpec {
      dcaAddress: string;
      matrix: THREE.Matrix4;
      color: THREE.Color;
      buildingId: number;
      floorIndex: number;
      seed: number;
      grime: number;
      lum: number;
    }

    const wallItems: InstancedItemSpec[] = [];
    const trimItems: InstancedItemSpec[] = [];
    const windowItems: InstancedItemSpec[] = [];
    const interiorItems: InstancedItemSpec[] = [];

    const dummy = new THREE.Object3D();

    compiledBuildings.forEach((bldg, bIdx) => {
      const { config, rule, stories, subtractiveModules, totalHeightMeters } = bldg;

      let minX = Infinity,
        maxX = -Infinity,
        minZ = Infinity,
        maxZ = -Infinity;
      for (const [vx, vz] of config.footprintCoordinates) {
        if (vx < minX) minX = vx;
        if (vx > maxX) maxX = vx;
        if (vz < minZ) minZ = vz;
        if (vz > maxZ) maxZ = vz;
      }

      // Register Root Building Blueprint in Ontology Bus
      busDescriptors.push({
        address: config.metaAddress,
        rootDomain: 'world',
        composer: 'shape-grammar-composer',
        terminalSlug: config.metaAddress.split('.').pop() || 'building',
        summary: `${config.label} (${config.storyCount}F • ${config.styleToken} • ${bldg.totalRoomsCount} BSP rooms)`,
        worldPositionMeters: [...config.worldOrigin],
        dimensionsMeters: [maxX - minX, totalHeightMeters, maxZ - minZ],
        telemetry: {
          buildingIndex: bIdx,
          styleToken: config.styleToken,
          storyCount: config.storyCount,
          roofPitchDeg: rule.roofPitchDeg,
          setbackStartStory: rule.setbackStartStory,
          totalRooms: bldg.totalRoomsCount,
          totalVoidOpenings: bldg.totalVoidOpeningsCount,
        },
      });

      // Invisible Raycast & Physics Bounds Proxy tagged with buildingIndex & totalHeightMeters
      // so hovering any building in 3D space immediately resolves buildingIndex & hovered floor!
      const colliderProxy = new THREE.Group();
      colliderProxy.position.set(...config.worldOrigin);
      colliderProxy.rotation.y = config.rotationYRad;
      const boundsMesh = new THREE.Mesh(
        disposer.trackGeometry(
          new THREE.BoxGeometry(maxX - minX, totalHeightMeters, maxZ - minZ)
        ),
        disposer.trackMaterial(
          new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0.0,
            depthWrite: false,
          })
        )
      );
      boundsMesh.position.set(
        (minX + maxX) * 0.5,
        totalHeightMeters * 0.5,
        (minZ + maxZ) * 0.5
      );
      boundsMesh.userData = {
        isBuildingHoverVolume: true,
        buildingIndex: bIdx,
        buildingAddress: config.metaAddress,
        buildingLabel: config.label,
        storyCount: config.storyCount,
        groundFloorHeightMeters: rule.groundFloorHeightMeters,
        upperStoryHeightMeters: rule.upperStoryHeightMeters,
        totalHeightMeters,
      };
      colliderProxy.add(boundsMesh);
      colliderProxy.userData = {
        colliderAddress: config.metaAddress,
        colliderShape: 'box',
        colliderTag: 'building',
      };
      districtGroup.add(colliderProxy);

      const slabColor = new THREE.Color(rule.palette.floorSlabHex);
      const terraceColor = new THREE.Color(rule.palette.terraceDeckHex);
      const partColor = new THREE.Color(rule.palette.interiorPartitionHex);
      const roofColor = new THREE.Color(rule.palette.roofHex);
      const furnitureWood = new THREE.Color('#8A5A36');
      const furnitureFabric = new THREE.Color('#3B6E6C');
      const furnitureCounter = new THREE.Color('#D8D2C5');

      stories.forEach((st) => {
        const floorNumStr = String(st.storyIndex + 1).padStart(2, '0');
        const inset = st.setbackInsetMeters;
        const slabW = maxX - minX - inset * 2;
        const slabD = maxZ - minZ - inset * 2;

        // If this story has an exposed perimeter terrace, render the full outer slab in terrace decking color
        if (st.hasExposedPerimeterTerrace) {
          dummy.position.set(
            config.worldOrigin[0] + (minX + maxX) * 0.5,
            config.worldOrigin[1] + st.elevationY + 0.06,
            config.worldOrigin[2] + (minZ + maxZ) * 0.5
          );
          dummy.rotation.set(0, config.rotationYRad, 0);
          dummy.scale.set(maxX - minX, 0.14, maxZ - minZ);
          dummy.updateMatrix();
          interiorItems.push({
            dcaAddress: `${config.metaAddress}.floor-${floorNumStr}.surface.terrace`,
            matrix: dummy.matrix.clone(),
            color: terraceColor,
            buildingId: bIdx,
            floorIndex: st.storyIndex,
            seed: bIdx * 13 + st.storyIndex,
            grime: 0.2,
            lum: 0,
          });
        }

        // Main Interior Floor Slab (`floorIndex = st.storyIndex`)
        dummy.position.set(
          config.worldOrigin[0] + (minX + maxX) * 0.5,
          config.worldOrigin[1] + st.elevationY + 0.09,
          config.worldOrigin[2] + (minZ + maxZ) * 0.5
        );
        dummy.rotation.set(0, config.rotationYRad, 0);
        dummy.scale.set(slabW, 0.16, slabD);
        dummy.updateMatrix();
        interiorItems.push({
          dcaAddress: `${config.metaAddress}.floor-${floorNumStr}.slab.primary`,
          matrix: dummy.matrix.clone(),
          color: slabColor,
          buildingId: bIdx,
          floorIndex: st.storyIndex,
          seed: bIdx * 17 + st.storyIndex,
          grime: 0.15,
          lum: 0,
        });

        // Register each BSP Room Cell in the Ontology Bus AND stamp context-specific interior furniture!
        st.rooms.forEach((rm) => {
          busDescriptors.push({
            address: rm.address,
            rootDomain: 'world',
            composer: 'shape-grammar-composer',
            terminalSlug: rm.address.split('.').pop() || rm.zoneTag,
            summary: `Floor ${st.floorNumber} ${rm.zoneTag} (${rm.semanticZoningSlug} • ${rm.areaSqMeters}m²)`,
            worldPositionMeters: [...rm.centerWorld],
            dimensionsMeters: [
              rm.boundsMax[0] - rm.boundsMin[0],
              st.heightMeters,
              rm.boundsMax[1] - rm.boundsMin[1],
            ],
            telemetry: {
              buildingIndex: bIdx,
              floorNumber: st.floorNumber,
              semanticZoningSlug: rm.semanticZoningSlug,
              reflexiveAffordance: rm.reflexiveAffordanceAction,
              areaSqMeters: rm.areaSqMeters,
            },
          });

          // Stamp procedural interior furniture/fixtures based on Semantic Zoning Slug
          if (rm.zoneTag === 'kitchen' || rm.zoneTag === 'cafe-roastery') {
            dummy.position.set(
              rm.centerWorld[0],
              config.worldOrigin[1] + st.elevationY + 0.52,
              rm.centerWorld[2]
            );
            dummy.rotation.set(0, config.rotationYRad, 0);
            dummy.scale.set(1.8, 0.88, 0.85);
            dummy.updateMatrix();
            interiorItems.push({
              dcaAddress: `${rm.address}.fixture.island-counter`,
              matrix: dummy.matrix.clone(),
              color: furnitureCounter,
              buildingId: bIdx,
              floorIndex: st.storyIndex,
              seed: bIdx + st.storyIndex,
              grime: 0.1,
              lum: 0,
            });
          } else if (rm.zoneTag === 'living-salon' || rm.zoneTag === 'lobby') {
            dummy.position.set(
              rm.centerWorld[0],
              config.worldOrigin[1] + st.elevationY + 0.42,
              rm.centerWorld[2]
            );
            dummy.rotation.set(0, config.rotationYRad, 0);
            dummy.scale.set(1.9, 0.68, 0.95);
            dummy.updateMatrix();
            interiorItems.push({
              dcaAddress: `${rm.address}.fixture.lounge-sofa`,
              matrix: dummy.matrix.clone(),
              color: furnitureFabric,
              buildingId: bIdx,
              floorIndex: st.storyIndex,
              seed: bIdx + st.storyIndex,
              grime: 0.1,
              lum: 0,
            });
          } else if (rm.zoneTag === 'studio-loft' || rm.zoneTag === 'archive-study') {
            dummy.position.set(
              rm.centerWorld[0],
              config.worldOrigin[1] + st.elevationY + 0.48,
              rm.centerWorld[2]
            );
            dummy.rotation.set(0, config.rotationYRad, 0);
            dummy.scale.set(1.6, 0.76, 1.1);
            dummy.updateMatrix();
            interiorItems.push({
              dcaAddress: `${rm.address}.fixture.archival-desk`,
              matrix: dummy.matrix.clone(),
              color: furnitureWood,
              buildingId: bIdx,
              floorIndex: st.storyIndex,
              seed: bIdx + st.storyIndex,
              grime: 0.1,
              lum: 0,
            });
          } else if (rm.zoneTag === 'terrace-deck') {
            // Terrace cedar planter bench
            dummy.position.set(
              rm.centerWorld[0],
              config.worldOrigin[1] + st.elevationY + 0.45,
              rm.centerWorld[2]
            );
            dummy.rotation.set(0, config.rotationYRad, 0);
            dummy.scale.set(2.2, 0.65, 0.75);
            dummy.updateMatrix();
            interiorItems.push({
              dcaAddress: `${rm.address}.fixture.terrace-planter`,
              matrix: dummy.matrix.clone(),
              color: furnitureWood,
              buildingId: bIdx,
              floorIndex: st.storyIndex,
              seed: bIdx + st.storyIndex,
              grime: 0.15,
              lum: 0,
            });
          }
        });

        // BSP Interior Partition Walls (low cutaway height of 1.35m so overhead cutaway clearly reveals room layouts!)
        const wallH = 1.38;
        st.interiorWalls.forEach((iw, wIdx) => {
          const wx = iw.end[0] - iw.start[0];
          const wz = iw.end[1] - iw.start[1];
          const wLen = Math.hypot(wx, wz);
          if (wLen < 0.5) return;
          const wAng = Math.atan2(wx, wz) - Math.PI / 2;

          if (iw.hasDoorwayPortal && wLen > 1.8) {
            const segLen = (wLen - 1.15) * 0.5;
            for (const side of [-1, 1]) {
              const t = 0.5 + side * ((1.15 * 0.5 + segLen * 0.5) / wLen);
              dummy.position.set(
                config.worldOrigin[0] + iw.start[0] + wx * t,
                config.worldOrigin[1] + st.elevationY + wallH * 0.5,
                config.worldOrigin[2] + iw.start[1] + wz * t
              );
              dummy.rotation.set(0, config.rotationYRad + wAng, 0);
              dummy.scale.set(segLen, wallH, 0.14);
              dummy.updateMatrix();
              interiorItems.push({
                dcaAddress: `${config.metaAddress}.floor-${floorNumStr}.partition.wall-${wIdx}-${side < 0 ? 'a' : 'b'}`,
                matrix: dummy.matrix.clone(),
                color: partColor,
                buildingId: bIdx,
                floorIndex: st.storyIndex,
                seed: bIdx + wIdx,
                grime: 0.08,
                lum: 0,
              });
            }
          } else {
            dummy.position.set(
              config.worldOrigin[0] + (iw.start[0] + iw.end[0]) * 0.5,
              config.worldOrigin[1] + st.elevationY + wallH * 0.5,
              config.worldOrigin[2] + (iw.start[1] + iw.end[1]) * 0.5
            );
            dummy.rotation.set(0, config.rotationYRad + wAng, 0);
            dummy.scale.set(wLen, wallH, 0.14);
            dummy.updateMatrix();
            interiorItems.push({
              dcaAddress: `${config.metaAddress}.floor-${floorNumStr}.partition.wall-${wIdx}`,
              matrix: dummy.matrix.clone(),
              color: partColor,
              buildingId: bIdx,
              floorIndex: st.storyIndex,
              seed: bIdx + wIdx,
              grime: 0.08,
              lum: 0,
            });
          }
        });

        // Vertical Stairwell Flight connecting this story to the next (`spatial.network.pedestrian.vertical.stairwell`)
        const sc = st.stairwellCell;
        const stepsCount = 7;
        for (let k = 0; k < stepsCount; k++) {
          const kt = (k + 0.5) / stepsCount;
          dummy.position.set(
            sc.centerWorld[0] - 0.85 + kt * 1.7,
            config.worldOrigin[1] + st.elevationY + kt * st.heightMeters,
            sc.centerWorld[2]
          );
          dummy.rotation.set(0, config.rotationYRad, 0);
          dummy.scale.set(0.32, 0.14, 1.25);
          dummy.updateMatrix();
          interiorItems.push({
            dcaAddress: `${sc.address}.step-${String(k + 1).padStart(2, '0')}`,
            matrix: dummy.matrix.clone(),
            color: roofColor,
            buildingId: bIdx,
            floorIndex: st.storyIndex,
            seed: bIdx + k,
            grime: 0.1,
            lum: 0,
          });
        }
      });

      // Top Roof Crown (`floorIndex = config.storyCount + 0.5` so any floor cutaway hides the roof!)
      if (!cutawayXRayMode) {
        const topStory = stories[stories.length - 1];
        const topInset = topStory ? topStory.setbackInsetMeters : 0;
        const roofW = maxX - minX - topInset * 2 + rule.eaveOverhangMeters * 2;
        const roofD = maxZ - minZ - topInset * 2 + rule.eaveOverhangMeters * 2;
        const roofH = Math.max(
          0.38,
          Math.tan(THREE.MathUtils.degToRad(rule.roofPitchDeg)) * (roofD * 0.22)
        );

        dummy.position.set(
          config.worldOrigin[0] + (minX + maxX) * 0.5,
          config.worldOrigin[1] + totalHeightMeters + roofH * 0.5,
          config.worldOrigin[2] + (minZ + maxZ) * 0.5
        );
        dummy.rotation.set(0, config.rotationYRad, 0);
        dummy.scale.set(roofW, roofH, roofD);
        dummy.updateMatrix();
        trimItems.push({
          dcaAddress: `${config.metaAddress}.roof.primary-crown`,
          matrix: dummy.matrix.clone(),
          color: roofColor,
          buildingId: bIdx,
          floorIndex: config.storyCount + 0.5,
          seed: bIdx * 31,
          grime: rule.weatherGrimeCoefficient,
          lum: 0,
        });
      }

      // Collect Exterior Subtractive Face Modules
      subtractiveModules.forEach((mod) => {
        if (
          cutawayXRayMode &&
          mod.worldPosition[1] > 3.9 &&
          mod.worldPosition[2] > config.worldOrigin[2]
        ) {
          return;
        }

        dummy.position.set(...mod.worldPosition);
        dummy.rotation.set(0, mod.rotationYRad, 0);
        dummy.scale.set(...mod.scaleMeters);
        dummy.updateMatrix();

        const itemSpec: InstancedItemSpec = {
          dcaAddress: mod.dcaAddress,
          matrix: dummy.matrix.clone(),
          color: new THREE.Color(mod.colorHex),
          buildingId: mod.buildingIndex,
          floorIndex: mod.floorIndex,
          seed: mod.seed + bIdx * 19,
          grime: rule.weatherGrimeCoefficient,
          lum: mod.lumState,
        };

        if (mod.moduleType === 'window-pane') {
          windowItems.push(itemSpec);
        } else if (
          mod.moduleType === 'window-frame' ||
          mod.moduleType === 'door-frame' ||
          mod.moduleType === 'belt-cornice' ||
          mod.moduleType === 'terrace-railing'
        ) {
          trimItems.push(itemSpec);
        } else {
          wallItems.push(itemSpec);
        }
      });
    });

    dcaAddressBus.registerBatch(busDescriptors);

    const unitBox = new THREE.BoxGeometry(1, 1, 1);

    // Helper to build a GPU-Cutaway-Ready InstancedMesh with bi-directional `instanceId <-> dcaAddress`
    const buildAttributedInstancedMesh = (
      items: InstancedItemSpec[],
      mat: THREE.MeshStandardMaterial,
      meshName: string
    ) => {
      const geo = disposer.trackGeometry(unitBox.clone());
      const count = items.length;
      const seeds = new Float32Array(count);
      const grimes = new Float32Array(count);
      const bldgIds = new Float32Array(count);
      const floorIndices = new Float32Array(count);
      const lums = new Float32Array(count);
      const instanceAddresses: string[] = new Array(count);

      const inst = disposer.trackInstancedMesh(
        new THREE.InstancedMesh(geo, mat, count)
      );
      inst.name = meshName;
      inst.castShadow = true;
      inst.receiveShadow = true;

      items.forEach((item, idx) => {
        inst.setMatrixAt(idx, item.matrix);
        inst.setColorAt(idx, item.color);
        seeds[idx] = item.seed;
        grimes[idx] = item.grime;
        bldgIds[idx] = item.buildingId;
        floorIndices[idx] = item.floorIndex;
        lums[idx] = item.lum;
        instanceAddresses[idx] = item.dcaAddress;
      });

      geo.setAttribute('aInstanceSeed', new THREE.InstancedBufferAttribute(seeds, 1));
      geo.setAttribute('aWeatherGrime', new THREE.InstancedBufferAttribute(grimes, 1));
      geo.setAttribute('aBuildingId', new THREE.InstancedBufferAttribute(bldgIds, 1));
      geo.setAttribute(
        'aFloorIndex',
        new THREE.InstancedBufferAttribute(floorIndices, 1)
      );
      geo.setAttribute(
        'aWindowLumState',
        new THREE.InstancedBufferAttribute(lums, 1)
      );

      inst.instanceMatrix.needsUpdate = true;
      if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
      inst.userData = {
        instanceAddresses,
        composer: 'shape-grammar-composer',
      };
      districtGroup.add(inst);
    };

    if (wallItems.length > 0) {
      buildAttributedInstancedMesh(
        wallItems,
        facadeMat,
        'world.bremerton.instanced.exterior-walls'
      );
    }
    if (trimItems.length > 0) {
      buildAttributedInstancedMesh(
        trimItems,
        trimMat,
        'world.bremerton.instanced.trim-terraces-roofs'
      );
    }
    if (windowItems.length > 0) {
      buildAttributedInstancedMesh(
        windowItems,
        windowMat,
        'world.bremerton.instanced.windows'
      );
    }
    if (interiorItems.length > 0) {
      buildAttributedInstancedMesh(
        interiorItems,
        interiorMat,
        'world.bremerton.instanced.bsp-interiors-furniture'
      );
    }

    unitBox.dispose();

    return {
      districtGroup,
      windowInstancedMaterial: windowMat,
      facadeInstancedMaterial: facadeMat,
      trimInstancedMaterial: trimMat,
      interiorInstancedMaterial: interiorMat,
    };
  }
}

export const BREMERTON_DEFAULT_GRAMMAR_CONFIGS: ParametricBuildingConfig[] = [
  {
    metaAddress: 'world.bremerton.block-02.plot-240-burwell',
    label: '240 Burwell St Courtyard Townhouse Lofts',
    footprintCoordinates: [
      [-8.0, -6.0],
      [8.0, -6.0],
      [8.0, 4.4],
      [6.4, 6.0],
      [-2.2, 6.0],
      [-2.2, 3.8],
      [-8.0, 3.8],
    ],
    worldOrigin: [-6.0, 0, -13.5],
    rotationYRad: 0,
    storyCount: 5, // Shows Base Podium (Floors 1-3) + Tower Setback (Floors 4-5) with Terrace!
    styleToken: 'pnw.residential.townhouse',
    windowIntervalMeters: 3.0,
    internalRoomCount: 6,
  },
  {
    metaAddress: 'world.bremerton.block-02.plot-heritage-brick',
    label: 'Pacific Ave Heritage Masonry Apartments',
    footprintCoordinates: [
      [-7.0, -6.0],
      [7.0, -6.0],
      [7.0, 6.0],
      [-4.8, 6.0],
      [-7.0, 3.6],
    ],
    worldOrigin: [-26.0, 0, -14.0],
    rotationYRad: 0,
    storyCount: 5,
    styleToken: 'pnw.heritage.masonry',
    windowIntervalMeters: 3.0,
    internalRoomCount: 6,
  },
  {
    metaAddress: 'world.bremerton.block-02.plot-sinclair-cafe',
    label: 'Sinclair Sound Roasters & Weathered Craftsman',
    footprintCoordinates: [
      [-6.5, -5.5],
      [6.5, -5.5],
      [6.5, 3.2],
      [3.8, 5.5],
      [-6.5, 5.5],
    ],
    worldOrigin: [12.0, 0, -13.0],
    rotationYRad: 0,
    storyCount: 4,
    styleToken: 'pnw.roastery.timber',
    windowIntervalMeters: 3.0,
    internalRoomCount: 4,
  },
  {
    metaAddress: 'world.bremerton.block-03.plot-civic-atrium',
    label: 'Harborside Heavy-Timber & Zinc Civic Atrium',
    footprintCoordinates: [
      [-8.0, -6.0],
      [8.0, -6.0],
      [6.8, 6.0],
      [-6.8, 6.0],
    ],
    worldOrigin: [30.0, 0, -13.0],
    rotationYRad: 0,
    storyCount: 4,
    styleToken: 'pnw.civic.atrium',
    windowIntervalMeters: 3.5,
    internalRoomCount: 6,
  },
  {
    metaAddress: 'world.bremerton.block-01.plot-maritime-guild',
    label: 'Puget Sound Weathered Craftsman Guild',
    footprintCoordinates: [
      [-7.5, -5.8],
      [7.5, -5.8],
      [7.5, 4.2],
      [4.5, 5.8],
      [-7.5, 5.8],
    ],
    worldOrigin: [-46.0, 0, -13.5],
    rotationYRad: 0,
    storyCount: 4,
    styleToken: 'pnw.craftsman.weathered',
    windowIntervalMeters: 3.0,
    internalRoomCount: 6,
  },
  {
    metaAddress: 'world.bremerton.block-01.plot-ferry-terminal',
    label: 'Bremerton Ferry Terminal Slip 1 Headhouse',
    footprintCoordinates: [
      [-9.0, -5.0],
      [9.0, -5.0],
      [7.6, 5.0],
      [-7.6, 5.0],
    ],
    worldOrigin: [-22.0, 0, 22.0],
    rotationYRad: 0,
    storyCount: 2,
    styleToken: 'pnw.maritime.terminal',
    windowIntervalMeters: 3.5,
    internalRoomCount: 4,
  },
];
