/**
 * @domain spatial.infrastructure.network.road
 * @description Generates centerline spline roads, ordered parametric lane profiles, intersection Bézier lane matrices, angular/slope self-failure guards, and sidewalk-welded civic plazas/parks.
 * @inputs nodes: RoadSplineNode[], segments: RoadSplineSegment[], civic_plazas: CivicPlazaParkSpec[]
 * @outputs road_mesh_group: THREE.Group, junction_routes: JunctionBezierLaneRoute[], telemetry: SegmentCurveTelemetry
 * @dependencies spatial.structural.rendering.r186-instance-manager, SYSTEM.Ontology.AddressBus.core-resolver
 */

import * as THREE from 'three';
import { dcaAddressBus, DcaAddressDescriptor } from './dcaAddressOntologyBus';

export type RoadToolMode =
  | 'straight'
  | 'simple-curve'
  | 'complex-curve'
  | 'roundabout'
  | 'replace-upgrade';

export type LaneTrackKind =
  | 'sidewalk_left'
  | 'parking_lane_left'
  | 'driving_lane_01'
  | 'driving_lane_02'
  | 'bike_lane_right'
  | 'sidewalk_right';

export interface ParametricLaneTrack {
  laneAddressSlug: string;
  kind: LaneTrackKind;
  travelCategory: 'travel.pedestrian.sidewalk' | 'travel.vehicle.car' | 'travel.vehicle.bus' | 'travel.micromobility.bike';
  directionSign: -1 | 0 | 1; // -1 = reverse, +1 = forward, 0 = bidirectional pedestrian
  widthMeters: number;
  lateralOffsetFromCenterMeters: number;
}

export interface RoadSplineNode {
  id: string;
  address: string;
  position: [number, number, number];
  widthMeters: number;
  isIntersection: boolean;
  elevationMeters: number;
}

export interface RoadSplineSegment {
  id: string;
  address: string;
  startNodeId: string;
  endNodeId: string;
  controlPoint: [number, number, number];
  controlPoint2?: [number, number, number];
  curveMode: RoadToolMode;
  lanes: 1 | 2;
  roadType: 'arterial' | 'collector' | 'pedestrian-promenade' | 'roundabout-ring';
  speedLimitMph: number;
  hasSidewalks: boolean;
  hasCrosswalkStart: boolean;
  hasCrosswalkEnd: boolean;
  parametricProfile?: ParametricLaneTrack[];
}

export interface CivicPlazaParkSpec {
  id: string;
  address: string; // e.g. "world.bremerton.civic.harborside-plaza"
  label: string;
  kind: 'civic-plaza' | 'pocket-park' | 'waterfront-esplanade';
  anchoredRoadSegmentId: string; // Welds edge directly to road sidewalk boundary vector
  centerWorld: [number, number, number];
  dimensionsMeters: [number, number]; // [widthX, depthZ]
  tilePatternColorHex: string;
  benchCount: number;
  treeCount: number;
  streetlightCount: number;
  receptacleCount: number;
  pedestrianPathNodes: Array<[number, number, number]>;
}

export interface SplineRoadNetworkData {
  nodes: RoadSplineNode[];
  segments: RoadSplineSegment[];
  civicPlazas?: CivicPlazaParkSpec[];
}

export type RoadSelfFailureCode =
  | 'VALID'
  | 'INCLINE_EXCEEDED_15DEG'
  | 'RADIUS_SHARPER_THAN_25M';

export interface SegmentCurveTelemetry {
  lengthMeters: number;
  minRadiusMeters: number;
  maxGradePercent: number;
  inclineDeg: number;
  recommendedSpeedMph: number;
  selfFailureCode: RoadSelfFailureCode;
  isPlacementBlocked: boolean;
  failureMessage: string | null;
  laneTracks: ParametricLaneTrack[];
}

export interface JunctionBezierLaneRoute {
  junctionAddress: string;
  nodeId: string;
  fromSegmentId: string;
  toSegmentId: string;
  points: Array<[number, number, number]>;
}

/**
 * Step A: Builds the ordered parametric lane profile (`sidewalk_left`, `driving_lane_01`, etc.)
 * and computes exact lateral offsets from the centerline spline.
 */
export function buildOrderedParametricLaneProfile(
  segment: RoadSplineSegment,
  totalWidthMeters: number
): ParametricLaneTrack[] {
  if (segment.roadType === 'pedestrian-promenade') {
    const half = totalWidthMeters * 0.25;
    return [
      {
        laneAddressSlug: `${segment.address}.lane.sidewalk-left`,
        kind: 'sidewalk_left',
        travelCategory: 'travel.pedestrian.sidewalk',
        directionSign: 0,
        widthMeters: totalWidthMeters * 0.5,
        lateralOffsetFromCenterMeters: -half,
      },
      {
        laneAddressSlug: `${segment.address}.lane.sidewalk-right`,
        kind: 'sidewalk_right',
        travelCategory: 'travel.pedestrian.sidewalk',
        directionSign: 0,
        widthMeters: totalWidthMeters * 0.5,
        lateralOffsetFromCenterMeters: half,
      },
    ];
  }

  const sidewalkW = segment.hasSidewalks ? 2.4 : 0.6;
  const roadbedW = Math.max(3.6, totalWidthMeters - sidewalkW * 2);

  if (segment.lanes === 1) {
    return [
      {
        laneAddressSlug: `${segment.address}.lane.sidewalk-left`,
        kind: 'sidewalk_left',
        travelCategory: 'travel.pedestrian.sidewalk',
        directionSign: 0,
        widthMeters: sidewalkW,
        lateralOffsetFromCenterMeters: -(roadbedW * 0.5 + sidewalkW * 0.5),
      },
      {
        laneAddressSlug: `${segment.address}.lane.driving-01`,
        kind: 'driving_lane_01',
        travelCategory: 'travel.vehicle.car',
        directionSign: 1,
        widthMeters: roadbedW,
        lateralOffsetFromCenterMeters: 0,
      },
      {
        laneAddressSlug: `${segment.address}.lane.sidewalk-right`,
        kind: 'sidewalk_right',
        travelCategory: 'travel.pedestrian.sidewalk',
        directionSign: 0,
        widthMeters: sidewalkW,
        lateralOffsetFromCenterMeters: roadbedW * 0.5 + sidewalkW * 0.5,
      },
    ];
  }

  const singleLaneW = roadbedW * 0.5;
  return [
    {
      laneAddressSlug: `${segment.address}.lane.sidewalk-left`,
      kind: 'sidewalk_left',
      travelCategory: 'travel.pedestrian.sidewalk',
      directionSign: 0,
      widthMeters: sidewalkW,
      lateralOffsetFromCenterMeters: -(roadbedW * 0.5 + sidewalkW * 0.5),
    },
    {
      laneAddressSlug: `${segment.address}.lane.driving-01-westbound`,
      kind: 'driving_lane_01',
      travelCategory: 'travel.vehicle.car',
      directionSign: -1,
      widthMeters: singleLaneW,
      lateralOffsetFromCenterMeters: -singleLaneW * 0.5,
    },
    {
      laneAddressSlug: `${segment.address}.lane.driving-02-eastbound`,
      kind: 'driving_lane_02',
      travelCategory: 'travel.vehicle.bus',
      directionSign: 1,
      widthMeters: singleLaneW,
      lateralOffsetFromCenterMeters: singleLaneW * 0.5,
    },
    {
      laneAddressSlug: `${segment.address}.lane.sidewalk-right`,
      kind: 'sidewalk_right',
      travelCategory: 'travel.pedestrian.sidewalk',
      directionSign: 0,
      widthMeters: sidewalkW,
      lateralOffsetFromCenterMeters: roadbedW * 0.5 + sidewalkW * 0.5,
    },
  ];
}

export const BREMERTON_DEFAULT_CIVIC_PLAZAS: CivicPlazaParkSpec[] = [
  {
    id: 'plaza-harborside-fountain',
    address: 'world.bremerton.civic.harborside-plaza',
    label: 'Harborside Fountain Civic Plaza (Sidewalk-Welded)',
    kind: 'civic-plaza',
    anchoredRoadSegmentId: 'seg.pacific-waterfront-south',
    centerWorld: [-20.0, 0.04, 10.5],
    dimensionsMeters: [18.0, 12.0],
    tilePatternColorHex: '#D5CEC2',
    benchCount: 4,
    treeCount: 4,
    streetlightCount: 4,
    receptacleCount: 2,
    pedestrianPathNodes: [
      [-25.0, 0, 8.5],
      [-20.0, 0, 10.5],
      [-15.0, 0, 12.5],
    ],
  },
  {
    id: 'park-burwell-pocket',
    address: 'world.bremerton.civic.burwell-pocket-park',
    label: 'Burwell & Pacific Cedar Pocket Park',
    kind: 'pocket-park',
    anchoredRoadSegmentId: 'seg.burwell-west',
    centerWorld: [-16.0, 0.04, -5.5],
    dimensionsMeters: [12.0, 8.5],
    tilePatternColorHex: '#BFC9B8',
    benchCount: 3,
    treeCount: 5,
    streetlightCount: 2,
    receptacleCount: 2,
    pedestrianPathNodes: [
      [-19.0, 0, -5.5],
      [-16.0, 0, -5.5],
      [-13.0, 0, -5.5],
    ],
  },
  {
    id: 'plaza-roastery-courtyard',
    address: 'world.bremerton.civic.sinclair-roastery-courtyard',
    label: 'Sinclair Roastery Sidewalk Esplanade',
    kind: 'waterfront-esplanade',
    anchoredRoadSegmentId: 'seg.burwell-east',
    centerWorld: [16.0, 0.04, 8.5],
    dimensionsMeters: [15.0, 10.0],
    tilePatternColorHex: '#D8CFC2',
    benchCount: 3,
    treeCount: 3,
    streetlightCount: 3,
    receptacleCount: 2,
    pedestrianPathNodes: [
      [12.0, 0, 8.5],
      [16.0, 0, 8.5],
      [20.0, 0, 8.5],
    ],
  },
];

export const BREMERTON_SPLINE_ROAD_NETWORK: SplineRoadNetworkData = {
  nodes: [
    {
      id: 'node.burwell-west',
      address: 'world.bremerton.roads.node.burwell-west-entry',
      position: [-65.0, 0, -1.5],
      widthMeters: 10.2,
      isIntersection: false,
      elevationMeters: 0,
    },
    {
      id: 'node.burwell-pacific-intersection',
      address: 'world.bremerton.roads.node.burwell-pacific-intersection',
      position: [-8.0, 0, -1.0],
      widthMeters: 10.6,
      isIntersection: true,
      elevationMeters: 0,
    },
    {
      id: 'node.burwell-washington-intersection',
      address: 'world.bremerton.roads.node.burwell-washington-intersection',
      position: [28.0, 0, -0.5],
      widthMeters: 10.2,
      isIntersection: true,
      elevationMeters: 0,
    },
    {
      id: 'node.manette-bridge-south',
      address: 'world.bremerton.roads.node.manette-bridge-approach',
      position: [68.0, 0, 2.0],
      widthMeters: 9.8,
      isIntersection: false,
      elevationMeters: 0,
    },
    {
      id: 'node.pacific-north',
      address: 'world.bremerton.roads.node.pacific-north-arts',
      position: [-9.5, 0, -38.0],
      widthMeters: 9.6,
      isIntersection: false,
      elevationMeters: 0,
    },
    {
      id: 'node.pacific-waterfront-roundabout',
      address: 'world.bremerton.roads.node.harborside-plaza-junction',
      position: [-7.5, 0, 14.5],
      widthMeters: 10.4,
      isIntersection: true,
      elevationMeters: 0,
    },
    {
      id: 'node.boardwalk-west-ferry',
      address: 'world.bremerton.roads.node.ferry-terminal-esplanade',
      position: [-42.0, 0, 17.5],
      widthMeters: 7.5,
      isIntersection: false,
      elevationMeters: 0,
    },
    {
      id: 'node.boardwalk-east-marina',
      address: 'world.bremerton.roads.node.marina-overlook-east',
      position: [38.0, 0, 16.5],
      widthMeters: 7.5,
      isIntersection: false,
      elevationMeters: 0,
    },
  ],
  segments: [
    {
      id: 'seg.burwell-west',
      address: 'world.bremerton.roads.segment.burwell-west-corridor',
      startNodeId: 'node.burwell-west',
      endNodeId: 'node.burwell-pacific-intersection',
      controlPoint: [-36.0, 0, -3.2],
      curveMode: 'simple-curve',
      lanes: 2,
      roadType: 'collector',
      speedLimitMph: 20,
      hasSidewalks: true,
      hasCrosswalkStart: false,
      hasCrosswalkEnd: true,
    },
    {
      id: 'seg.burwell-east',
      address: 'world.bremerton.roads.segment.burwell-east-corridor',
      startNodeId: 'node.burwell-pacific-intersection',
      endNodeId: 'node.burwell-washington-intersection',
      controlPoint: [10.0, 0, 1.2],
      curveMode: 'simple-curve',
      lanes: 2,
      roadType: 'collector',
      speedLimitMph: 20,
      hasSidewalks: true,
      hasCrosswalkStart: true,
      hasCrosswalkEnd: true,
    },
    {
      id: 'seg.manette-approach',
      address: 'world.bremerton.roads.segment.manette-bridge-approach',
      startNodeId: 'node.burwell-washington-intersection',
      endNodeId: 'node.manette-bridge-south',
      controlPoint: [48.0, 0, -1.8],
      curveMode: 'simple-curve',
      lanes: 2,
      roadType: 'collector',
      speedLimitMph: 25,
      hasSidewalks: true,
      hasCrosswalkStart: true,
      hasCrosswalkEnd: false,
    },
    {
      id: 'seg.pacific-north-ave',
      address: 'world.bremerton.roads.segment.pacific-ave-north',
      startNodeId: 'node.pacific-north',
      endNodeId: 'node.burwell-pacific-intersection',
      controlPoint: [-11.0, 0, -19.5],
      curveMode: 'simple-curve',
      lanes: 2,
      roadType: 'collector',
      speedLimitMph: 20,
      hasSidewalks: true,
      hasCrosswalkStart: false,
      hasCrosswalkEnd: true,
    },
    {
      id: 'seg.pacific-waterfront-south',
      address: 'world.bremerton.roads.segment.pacific-ave-harborside',
      startNodeId: 'node.burwell-pacific-intersection',
      endNodeId: 'node.pacific-waterfront-roundabout',
      controlPoint: [-5.8, 0, 6.8],
      curveMode: 'simple-curve',
      lanes: 1,
      roadType: 'collector',
      speedLimitMph: 15,
      hasSidewalks: true,
      hasCrosswalkStart: true,
      hasCrosswalkEnd: true,
    },
    {
      id: 'seg.waterfront-promenade-west',
      address: 'world.bremerton.roads.segment.ferry-promenade-walkway',
      startNodeId: 'node.boardwalk-west-ferry',
      endNodeId: 'node.pacific-waterfront-roundabout',
      controlPoint: [-24.0, 0, 19.5],
      curveMode: 'simple-curve',
      lanes: 1,
      roadType: 'pedestrian-promenade',
      speedLimitMph: 5,
      hasSidewalks: true,
      hasCrosswalkStart: false,
      hasCrosswalkEnd: true,
    },
    {
      id: 'seg.waterfront-promenade-east',
      address: 'world.bremerton.roads.segment.harborside-promenade-east',
      startNodeId: 'node.pacific-waterfront-roundabout',
      endNodeId: 'node.boardwalk-east-marina',
      controlPoint: [15.0, 0, 18.2],
      curveMode: 'simple-curve',
      lanes: 1,
      roadType: 'pedestrian-promenade',
      speedLimitMph: 5,
      hasSidewalks: true,
      hasCrosswalkStart: true,
      hasCrosswalkEnd: false,
    },
  ],
  civicPlazas: BREMERTON_DEFAULT_CIVIC_PLAZAS,
};

function createSplineCurve(
  segment: RoadSplineSegment,
  startNode: RoadSplineNode,
  endNode: RoadSplineNode
): THREE.Curve<THREE.Vector3> {
  const p0 = new THREE.Vector3(
    startNode.position[0],
    startNode.elevationMeters,
    startNode.position[2]
  );
  const p2 = new THREE.Vector3(
    endNode.position[0],
    endNode.elevationMeters,
    endNode.position[2]
  );

  if (segment.curveMode === 'straight') {
    return new THREE.LineCurve3(p0, p2);
  }

  const p1 = new THREE.Vector3(
    segment.controlPoint[0],
    segment.controlPoint[1],
    segment.controlPoint[2]
  );

  if (segment.curveMode === 'complex-curve' && segment.controlPoint2) {
    const p1b = new THREE.Vector3(
      segment.controlPoint2[0],
      segment.controlPoint2[1],
      segment.controlPoint2[2]
    );
    return new THREE.CubicBezierCurve3(p0, p1, p1b, p2);
  }

  return new THREE.QuadraticBezierCurve3(p0, p1, p2);
}

/**
 * Step A.3: Computes CS2 curve telemetry AND enforces strict Angular & Slope Self-Failure rules:
 * - Incline exceeding 15.0° triggers `INCLINE_EXCEEDED_15DEG`
 * - Vehicular corner sharper than 25.0m radius triggers `RADIUS_SHARPER_THAN_25M`
 */
export function computeSegmentTelemetry(
  segment: RoadSplineSegment,
  startNode: RoadSplineNode,
  endNode: RoadSplineNode
): SegmentCurveTelemetry {
  const curve = createSplineCurve(segment, startNode, endNode);
  const lengthMeters = curve.getLength();

  const tA = curve.getTangent(0.1).normalize();
  const tB = curve.getTangent(0.5).normalize();
  const tC = curve.getTangent(0.9).normalize();
  const angleChange = tA.angleTo(tB) + tB.angleTo(tC);
  const minRadiusMeters =
    angleChange > 0.01 ? lengthMeters / angleChange : 999.0;

  const dy = Math.abs(endNode.elevationMeters - startNode.elevationMeters);
  const maxGradePercent =
    lengthMeters > 0.1 ? (dy / lengthMeters) * 100 : 0.0;
  const inclineDeg = THREE.MathUtils.radToDeg(
    Math.atan2(dy, Math.max(0.1, lengthMeters))
  );

  const avgWidth = (startNode.widthMeters + endNode.widthMeters) * 0.5;
  const laneTracks = buildOrderedParametricLaneProfile(segment, avgWidth);

  let selfFailureCode: RoadSelfFailureCode = 'VALID';
  let failureMessage: string | null = null;

  const minAllowedRadius =
    segment.roadType === 'pedestrian-promenade' ||
    segment.roadType === 'roundabout-ring'
      ? 8.0
      : 25.0;

  if (inclineDeg > 15.0) {
    selfFailureCode = 'INCLINE_EXCEEDED_15DEG';
    failureMessage = `Structural Self-Failure: Road incline (${inclineDeg.toFixed(1)}°) exceeds maximum 15.0° grade limit.`;
  } else if (minRadiusMeters < minAllowedRadius) {
    selfFailureCode = 'RADIUS_SHARPER_THAN_25M';
    failureMessage = `Structural Self-Failure: Turn radius (${minRadiusMeters.toFixed(1)}m) is sharper than minimum ${minAllowedRadius.toFixed(0)}m radius.`;
  }

  return {
    lengthMeters: Number(lengthMeters.toFixed(1)),
    minRadiusMeters: Number(Math.min(999, minRadiusMeters).toFixed(1)),
    maxGradePercent: Number(maxGradePercent.toFixed(1)),
    inclineDeg: Number(inclineDeg.toFixed(1)),
    recommendedSpeedMph: segment.speedLimitMph,
    selfFailureCode,
    isPlacementBlocked: selfFailureCode !== 'VALID',
    failureMessage,
    laneTracks,
  };
}

/**
 * Step B: Intersection Junction Manager (`spatial.infrastructure.intersection.junction`)
 * Computes smooth internal Bézier lane-routing paths connecting incoming and outgoing road splines
 * across every intersection node.
 */
export function computeIntersectionJunctionLaneRoutes(
  network: SplineRoadNetworkData
): JunctionBezierLaneRoute[] {
  const routes: JunctionBezierLaneRoute[] = [];
  const nodeMap = new Map(network.nodes.map((n) => [n.id, n]));

  for (const node of network.nodes) {
    if (!node.isIntersection) continue;
    const connectedSegs = network.segments.filter(
      (s) => s.startNodeId === node.id || s.endNodeId === node.id
    );
    if (connectedSegs.length < 2) continue;

    for (let i = 0; i < connectedSegs.length; i++) {
      for (let j = i + 1; j < connectedSegs.length; j++) {
        const segA = connectedSegs[i];
        const segB = connectedSegs[j];
        const nAStart = nodeMap.get(segA.startNodeId);
        const nAEnd = nodeMap.get(segA.endNodeId);
        const nBStart = nodeMap.get(segB.startNodeId);
        const nBEnd = nodeMap.get(segB.endNodeId);
        if (!nAStart || !nAEnd || !nBStart || !nBEnd) continue;

        const curveA = createSplineCurve(segA, nAStart, nAEnd);
        const curveB = createSplineCurve(segB, nBStart, nBEnd);

        const tA = segA.endNodeId === node.id ? 0.86 : 0.14;
        const tB = segB.startNodeId === node.id ? 0.14 : 0.86;

        const ptA = curveA.getPoint(tA);
        const ptB = curveB.getPoint(tB);
        const center = new THREE.Vector3(
          node.position[0],
          node.elevationMeters + 0.12,
          node.position[2]
        );

        const bezier = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(ptA.x, ptA.y + 0.12, ptA.z),
          center,
          new THREE.Vector3(ptB.x, ptB.y + 0.12, ptB.z)
        );
        const sampled = bezier
          .getPoints(10)
          .map((v) => [v.x, v.y, v.z] as [number, number, number]);

        routes.push({
          junctionAddress: `world.bremerton.roads.junction.${node.id.replace('node.', '')}.${segA.id.replace('seg.', '')}-to-${segB.id.replace('seg.', '')}`,
          nodeId: node.id,
          fromSegmentId: segA.id,
          toSegmentId: segB.id,
          points: sampled,
        });
      }
    }
  }

  return routes;
}

/**
 * Builds the 3D ribbon mesh for a spline road segment, including:
 * - Dynamic junction boundary trimming at intersection ends
 * - Raised granite curbs
 * - InstancedMesh zebra crosswalks
 * - InstancedMesh PNW heritage gooseneck streetlamps along the sidewalk edge
 * - Structural Self-Failure warning highlight if angular/slope limits are violated
 */
export function buildSplineRoadMesh(
  segment: RoadSplineSegment,
  startNode: RoadSplineNode,
  endNode: RoadSplineNode,
  roadMaterial: THREE.Material
): THREE.Group {
  const group = new THREE.Group();
  group.name = segment.address;

  const telemetry = computeSegmentTelemetry(segment, startNode, endNode);
  const curve = createSplineCurve(segment, startNode, endNode);
  const length = Math.max(1.0, curve.getLength());
  const divisions = Math.max(24, Math.min(84, Math.ceil(length * 1.4)));

  // Step B.1: Dynamic Boundary Trimming at Intersection Junctions
  const startTrimT = startNode.isIntersection
    ? Math.min(0.18, (startNode.widthMeters * 0.36) / length)
    : 0.0;
  const endTrimT = endNode.isIntersection
    ? Math.max(0.82, 1.0 - (endNode.widthMeters * 0.36) / length)
    : 1.0;

  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const curbPositions: number[] = [];
  const curbNormals: number[] = [];
  const curbIndices: number[] = [];

  const up = new THREE.Vector3(0, 1, 0);

  for (let i = 0; i <= divisions; i++) {
    const rawT = i / divisions;
    const t = startTrimT + rawT * (endTrimT - startTrimT);
    const pt = curve.getPoint(t);
    const tangent = curve.getTangent(t).normalize();
    const binormal = new THREE.Vector3().crossVectors(tangent, up).normalize();

    const width = THREE.MathUtils.lerp(
      startNode.widthMeters,
      endNode.widthMeters,
      t
    );
    const halfW = width * 0.5;

    const leftPt = pt.clone().addScaledVector(binormal, -halfW);
    const rightPt = pt.clone().addScaledVector(binormal, halfW);

    const roadY = pt.y + 0.035;
    positions.push(leftPt.x, roadY, leftPt.z);
    positions.push(rightPt.x, roadY, rightPt.z);

    normals.push(0, 1, 0, 0, 1, 0);
    const vRepeat = (t * length) / 7.5;
    uvs.push(vRepeat, 0, vRepeat, 1);

    if (i < divisions) {
      const base = i * 2;
      indices.push(base, base + 1, base + 2);
      indices.push(base + 1, base + 3, base + 2);
    }

    if (segment.hasSidewalks) {
      const sidewalkW = Math.max(2.2, width * 0.22);
      for (const side of [-1, 1]) {
        const innerDist = halfW - sidewalkW;
        const outerDist = halfW;
        const pInner = pt.clone().addScaledVector(binormal, side * innerDist);
        const pOuter = pt.clone().addScaledVector(binormal, side * outerDist);
        const curbY = pt.y + 0.14;

        curbPositions.push(pInner.x, curbY, pInner.z);
        curbPositions.push(pOuter.x, curbY, pOuter.z);
        curbNormals.push(0, 1, 0, 0, 1, 0);
      }

      if (i < divisions) {
        const cBase = i * 4;
        curbIndices.push(cBase, cBase + 1, cBase + 4);
        curbIndices.push(cBase + 1, cBase + 5, cBase + 4);
        curbIndices.push(cBase + 2, cBase + 3, cBase + 6);
        curbIndices.push(cBase + 3, cBase + 7, cBase + 6);
      }
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);

  // If angular or incline self-failure rule is triggered, tint segment with warning overlay!
  const effectiveMat = telemetry.isPlacementBlocked
    ? new THREE.MeshStandardMaterial({
        color: 0xdc2626,
        emissive: 0x991b1b,
        emissiveIntensity: 0.45,
        roughness: 0.5,
      })
    : roadMaterial;

  const roadMesh = new THREE.Mesh(geo, effectiveMat);
  roadMesh.receiveShadow = true;
  roadMesh.userData = {
    dcaAddress: segment.address,
    telemetry,
  };
  group.add(roadMesh);

  if (segment.hasSidewalks && curbPositions.length > 0) {
    const curbGeo = new THREE.BufferGeometry();
    curbGeo.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(curbPositions, 3)
    );
    curbGeo.setAttribute(
      'normal',
      new THREE.Float32BufferAttribute(curbNormals, 3)
    );
    curbGeo.setIndex(curbIndices);

    const curbColor =
      segment.roadType === 'pedestrian-promenade' ? 0xd8cfc2 : 0xd5cec2;
    const curbMat = new THREE.MeshStandardMaterial({
      color: curbColor,
      roughness: 0.82,
    });
    const curbMesh = new THREE.Mesh(curbGeo, curbMat);
    curbMesh.receiveShadow = true;
    curbMesh.castShadow = true;
    group.add(curbMesh);
  }

  // Instanced Crosswalk Stripes
  const crosswalkTransforms: THREE.Matrix4[] = [];
  const dummy = new THREE.Object3D();

  const collectCrosswalkMatrices = (tPos: number) => {
    const pt = curve.getPoint(tPos);
    const tangent = curve.getTangent(tPos).normalize();
    const binormal = new THREE.Vector3().crossVectors(tangent, up).normalize();
    const width = THREE.MathUtils.lerp(
      startNode.widthMeters,
      endNode.widthMeters,
      tPos
    );
    const roadwayW = width * 0.54;
    const stripeCount = 5;
    const angleY = Math.atan2(tangent.x, tangent.z);

    for (let s = 0; s < stripeCount; s++) {
      const offset = ((s + 0.5) / stripeCount - 0.5) * roadwayW;
      const sp = pt.clone().addScaledVector(binormal, offset);
      dummy.position.set(sp.x, pt.y + 0.055, sp.z);
      dummy.rotation.set(0, angleY, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      crosswalkTransforms.push(dummy.matrix.clone());
    }
  };

  if (segment.hasCrosswalkStart && length > 10) {
    collectCrosswalkMatrices(Math.min(0.22, startTrimT + 3.2 / length));
  }
  if (segment.hasCrosswalkEnd && length > 10) {
    collectCrosswalkMatrices(Math.max(0.78, endTrimT - 3.2 / length));
  }

  if (crosswalkTransforms.length > 0) {
    const stripeGeo = new THREE.BoxGeometry(0.45, 0.02, 2.2);
    const stripeMat = new THREE.MeshStandardMaterial({
      color: 0xf5f3ef,
      roughness: 0.65,
    });
    const cwInst = new THREE.InstancedMesh(
      stripeGeo,
      stripeMat,
      crosswalkTransforms.length
    );
    cwInst.receiveShadow = true;
    crosswalkTransforms.forEach((m, idx) => cwInst.setMatrixAt(idx, m));
    cwInst.instanceMatrix.needsUpdate = true;
    group.add(cwInst);
  }

  return group;
}

/**
 * Step C: Sidewalks, Plazas, Parks, & Open Spaces (`spatial.infrastructure.civic.plaza-park`)
 * Welds civic plazas & pocket parks to the road network and populates benches, trees,
 * heritage gooseneck streetlights, and receptacles using unified THREE.InstancedMesh nodes.
 */
export function buildCivicPlazasAndParksInstancedGroup(
  plazas: CivicPlazaParkSpec[]
): THREE.Group {
  const root = new THREE.Group();
  root.name = 'world.bremerton.civic.plazas-and-parks-instanced';

  const benchMatrices: THREE.Matrix4[] = [];
  const treeTrunkMatrices: THREE.Matrix4[] = [];
  const treeCanopyMatrices: THREE.Matrix4[] = [];
  const lampPostMatrices: THREE.Matrix4[] = [];
  const lampBulbMatrices: THREE.Matrix4[] = [];
  const binMatrices: THREE.Matrix4[] = [];

  const dummy = new THREE.Object3D();
  const busDescriptors: DcaAddressDescriptor[] = [];

  plazas.forEach((plaza) => {
    const [cx, cy, cz] = plaza.centerWorld;
    const [w, d] = plaza.dimensionsMeters;

    busDescriptors.push({
      address: plaza.address,
      rootDomain: 'world',
      composer: 'spline-road-composer',
      terminalSlug: plaza.address.split('.').pop() || plaza.id,
      summary: `${plaza.label} (${w}m × ${d}m • Welded to ${plaza.anchoredRoadSegmentId})`,
      worldPositionMeters: [...plaza.centerWorld],
      dimensionsMeters: [w, 0.2, d],
      telemetry: {
        kind: plaza.kind,
        anchoredRoadSegmentId: plaza.anchoredRoadSegmentId,
        benchCount: plaza.benchCount,
        treeCount: plaza.treeCount,
        streetlightCount: plaza.streetlightCount,
      },
    });

    // Decorative Ground Tile Surface Slab welded to sidewalk elevation
    const tileMesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, 0.14, d),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(plaza.tilePatternColorHex),
        roughness: 0.84,
      })
    );
    tileMesh.position.set(cx, cy + 0.05, cz);
    tileMesh.receiveShadow = true;
    tileMesh.userData = { dcaAddress: plaza.address };
    root.add(tileMesh);

    // Populate Perimeter Benches
    for (let b = 0; b < plaza.benchCount; b++) {
      const t = (b + 0.5) / plaza.benchCount - 0.5;
      dummy.position.set(cx + t * (w * 0.72), cy + 0.45, cz - d * 0.34);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1.9, 0.42, 0.62);
      dummy.updateMatrix();
      benchMatrices.push(dummy.matrix.clone());
    }

    // Populate Foliage (Douglas Fir Trees)
    for (let tr = 0; tr < plaza.treeCount; tr++) {
      const angle = (tr / Math.max(1, plaza.treeCount)) * Math.PI * 2;
      const tx = cx + Math.cos(angle) * (w * 0.38);
      const tz = cz + Math.sin(angle) * (d * 0.36);

      dummy.position.set(tx, cy + 1.6, tz);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(0.32, 3.2, 0.32);
      dummy.updateMatrix();
      treeTrunkMatrices.push(dummy.matrix.clone());

      dummy.position.set(tx, cy + 4.4, tz);
      dummy.scale.set(2.1, 4.6, 2.1);
      dummy.updateMatrix();
      treeCanopyMatrices.push(dummy.matrix.clone());
    }

    // Populate Heritage Streetlights
    for (let lm = 0; lm < plaza.streetlightCount; lm++) {
      const sideX = lm % 2 === 0 ? -w * 0.44 : w * 0.44;
      const sideZ = lm < 2 ? -d * 0.42 : d * 0.42;
      dummy.position.set(cx + sideX, cy + 2.4, cz + sideZ);
      dummy.scale.set(0.14, 4.8, 0.14);
      dummy.updateMatrix();
      lampPostMatrices.push(dummy.matrix.clone());

      dummy.position.set(cx + sideX, cy + 4.9, cz + sideZ);
      dummy.scale.set(0.38, 0.38, 0.38);
      dummy.updateMatrix();
      lampBulbMatrices.push(dummy.matrix.clone());
    }

    // Populate Trash / Recycling Receptacles
    for (let rc = 0; rc < plaza.receptacleCount; rc++) {
      const rx = cx + (rc === 0 ? -w * 0.4 : w * 0.4);
      dummy.position.set(rx, cy + 0.5, cz);
      dummy.scale.set(0.45, 0.9, 0.45);
      dummy.updateMatrix();
      binMatrices.push(dummy.matrix.clone());
    }
  });

  dcaAddressBus.registerBatch(busDescriptors);

  const addInstancedBatch = (
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    matrices: THREE.Matrix4[]
  ) => {
    if (matrices.length === 0) return;
    const inst = new THREE.InstancedMesh(geo, mat, matrices.length);
    inst.castShadow = true;
    inst.receiveShadow = true;
    matrices.forEach((m, idx) => inst.setMatrixAt(idx, m));
    inst.instanceMatrix.needsUpdate = true;
    root.add(inst);
  };

  addInstancedBatch(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0x8c5832, roughness: 0.76 }),
    benchMatrices
  );
  addInstancedBatch(
    new THREE.CylinderGeometry(0.5, 0.65, 1, 10),
    new THREE.MeshStandardMaterial({ color: 0x5c4028, roughness: 0.9 }),
    treeTrunkMatrices
  );
  addInstancedBatch(
    new THREE.ConeGeometry(0.65, 1, 12),
    new THREE.MeshStandardMaterial({ color: 0x2d5a43, roughness: 0.82 }),
    treeCanopyMatrices
  );
  addInstancedBatch(
    new THREE.CylinderGeometry(0.5, 0.65, 1, 10),
    new THREE.MeshStandardMaterial({
      color: 0x263238,
      metalness: 0.72,
      roughness: 0.35,
    }),
    lampPostMatrices
  );
  addInstancedBatch(
    new THREE.SphereGeometry(0.5, 12, 12),
    new THREE.MeshStandardMaterial({
      color: 0xfff3c4,
      emissive: 0xffb74d,
      emissiveIntensity: 1.4,
    }),
    lampBulbMatrices
  );
  addInstancedBatch(
    new THREE.CylinderGeometry(0.5, 0.45, 1, 12),
    new THREE.MeshStandardMaterial({ color: 0x37474f, roughness: 0.6 }),
    binMatrices
  );

  return root;
}

export function createRoundaboutOnNetwork(
  network: SplineRoadNetworkData,
  center: [number, number, number],
  radiusMeters = 9.5
): SplineRoadNetworkData {
  const ts = Date.now().toString().slice(-4);
  const nNorth: RoadSplineNode = {
    id: `node.ra-n-${ts}`,
    address: `world.bremerton.roads.node.roundabout-north-${ts}`,
    position: [center[0], center[1], center[2] - radiusMeters],
    widthMeters: 6.8,
    isIntersection: true,
    elevationMeters: center[1],
  };
  const nEast: RoadSplineNode = {
    id: `node.ra-e-${ts}`,
    address: `world.bremerton.roads.node.roundabout-east-${ts}`,
    position: [center[0] + radiusMeters, center[1], center[2]],
    widthMeters: 6.8,
    isIntersection: true,
    elevationMeters: center[1],
  };
  const nSouth: RoadSplineNode = {
    id: `node.ra-s-${ts}`,
    address: `world.bremerton.roads.node.roundabout-south-${ts}`,
    position: [center[0], center[1], center[2] + radiusMeters],
    widthMeters: 6.8,
    isIntersection: true,
    elevationMeters: center[1],
  };
  const nWest: RoadSplineNode = {
    id: `node.ra-w-${ts}`,
    address: `world.bremerton.roads.node.roundabout-west-${ts}`,
    position: [center[0] - radiusMeters, center[1], center[2]],
    widthMeters: 6.8,
    isIntersection: true,
    elevationMeters: center[1],
  };

  const k = radiusMeters * 0.95;
  const ringSegs: RoadSplineSegment[] = [
    {
      id: `seg.ra-ne-${ts}`,
      address: `world.bremerton.roads.segment.roundabout-ne-${ts}`,
      startNodeId: nNorth.id,
      endNodeId: nEast.id,
      controlPoint: [center[0] + k, center[1], center[2] - k],
      curveMode: 'simple-curve',
      lanes: 1,
      roadType: 'roundabout-ring',
      speedLimitMph: 15,
      hasSidewalks: true,
      hasCrosswalkStart: false,
      hasCrosswalkEnd: false,
    },
    {
      id: `seg.ra-es-${ts}`,
      address: `world.bremerton.roads.segment.roundabout-es-${ts}`,
      startNodeId: nEast.id,
      endNodeId: nSouth.id,
      controlPoint: [center[0] + k, center[1], center[2] + k],
      curveMode: 'simple-curve',
      lanes: 1,
      roadType: 'roundabout-ring',
      speedLimitMph: 15,
      hasSidewalks: true,
      hasCrosswalkStart: false,
      hasCrosswalkEnd: false,
    },
    {
      id: `seg.ra-sw-${ts}`,
      address: `world.bremerton.roads.segment.roundabout-sw-${ts}`,
      startNodeId: nSouth.id,
      endNodeId: nWest.id,
      controlPoint: [center[0] - k, center[1], center[2] + k],
      curveMode: 'simple-curve',
      lanes: 1,
      roadType: 'roundabout-ring',
      speedLimitMph: 15,
      hasSidewalks: true,
      hasCrosswalkStart: false,
      hasCrosswalkEnd: false,
    },
    {
      id: `seg.ra-wn-${ts}`,
      address: `world.bremerton.roads.segment.roundabout-wn-${ts}`,
      startNodeId: nWest.id,
      endNodeId: nNorth.id,
      controlPoint: [center[0] - k, center[1], center[2] - k],
      curveMode: 'simple-curve',
      lanes: 1,
      roadType: 'roundabout-ring',
      speedLimitMph: 15,
      hasSidewalks: true,
      hasCrosswalkStart: false,
      hasCrosswalkEnd: false,
    },
  ];

  return {
    ...network,
    nodes: [...network.nodes, nNorth, nEast, nSouth, nWest],
    segments: [...network.segments, ...ringSegs],
  };
}
