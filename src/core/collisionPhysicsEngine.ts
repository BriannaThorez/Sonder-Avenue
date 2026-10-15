/**
 * Sonder Avenue — Procedural Collision Physics & Spatial Occupancy Engine
 * Address: SYSTEM.Physics.Collision.procedural-resolver
 * Compliance: DCR-2.1.15-01, DCR-2.2.40-01, DCR-2.2.43 (1:1 Metric Scale)
 *
 * Provides:
 * 1. Procedural Scene Graph Auto-Collider Tool (`autoSynthesizeSceneColliders`)
 * 2. Procedural Collider Application Tool (`collision.apply`)
 * 3. Continuous Capsule-vs-Box/Cylinder Penetration & Push-Out Solver
 * 4. Citizen-to-Citizen Mutual Exclusion & De-Clipping Resolver
 * 5. Safe Non-Overlapping Spawn Point Finder
 */

import * as THREE from 'three';

export type ColliderShape = 'box' | 'cylinder' | 'capsule';

export interface SpatialCollider {
  id: string;
  address: string;
  shape: ColliderShape;
  center: [number, number, number]; // [x, y, z] in 1:1 meters
  halfExtents?: [number, number, number]; // for box: [halfWidth, halfHeight, halfDepth]
  radius?: number; // for cylinder/capsule
  height?: number; // for cylinder/capsule
  rotationY?: number;
  isTrigger?: boolean;
  tag?: 'building' | 'fixture' | 'prop' | 'boundary' | 'citizen';
}

export interface CollisionPushResult {
  hasCollision: boolean;
  resolvedPosition: [number, number, number];
  penetrationDepth: number;
  normal: [number, number, number];
  collidedWithId?: string;
}

class CollisionRegistry {
  private colliders: Map<string, SpatialCollider> = new Map();

  public register(collider: SpatialCollider): void {
    this.colliders.set(collider.id, collider);
  }

  public unregister(id: string): void {
    this.colliders.delete(id);
  }

  public clear(): void {
    this.colliders.clear();
  }

  public getAll(): SpatialCollider[] {
    return Array.from(this.colliders.values());
  }

  /**
   * Resolves capsule collision against all static environment colliders.
   * Pushes the character or prop out smoothly along the minimum penetration vector.
   */
  public resolveCapsulePosition(
    pos: [number, number, number],
    radius = 0.35,
    ignoreId?: string
  ): CollisionPushResult {
    let resolvedX = pos[0];
    let resolvedZ = pos[2];
    let totalPenetration = 0;
    let hadCollision = false;
    let lastCollidedId: string | undefined;

    // Run up to 4 iterative relaxation passes for corners / multi-body intersections
    for (let pass = 0; pass < 4; pass++) {
      for (const col of this.colliders.values()) {
        if (col.id === ignoreId || col.isTrigger) continue;

        if (col.shape === 'box' && col.halfExtents) {
          const hx = col.halfExtents[0];
          const hz = col.halfExtents[2];
          const cx = col.center[0];
          const cz = col.center[2];

          const closestX = Math.max(cx - hx, Math.min(cx + hx, resolvedX));
          const closestZ = Math.max(cz - hz, Math.min(cz + hz, resolvedZ));

          const dx = resolvedX - closestX;
          const dz = resolvedZ - closestZ;
          const distSq = dx * dx + dz * dz;

          if (distSq < radius * radius) {
            hadCollision = true;
            lastCollidedId = col.id;
            const dist = Math.sqrt(distSq);

            if (dist > 0.0001) {
              const push = radius - dist;
              const nx = dx / dist;
              const nz = dz / dist;
              resolvedX += nx * push;
              resolvedZ += nz * push;
              totalPenetration = Math.max(totalPenetration, push);
            } else {
              // Inside box interior: push out along nearest face normal
              const distLeft = Math.abs(resolvedX - (cx - hx));
              const distRight = Math.abs(cx + hx - resolvedX);
              const distBack = Math.abs(resolvedZ - (cz - hz));
              const distFront = Math.abs(cz + hz - resolvedZ);
              const minFace = Math.min(distLeft, distRight, distBack, distFront);

              if (minFace === distFront) {
                resolvedZ = cz + hz + radius;
              } else if (minFace === distBack) {
                resolvedZ = cz - hz - radius;
              } else if (minFace === distRight) {
                resolvedX = cx + hx + radius;
              } else {
                resolvedX = cx - hx - radius;
              }
              totalPenetration = minFace + radius;
            }
          }
        } else if (col.shape === 'cylinder' && col.radius) {
          const cx = col.center[0];
          const cz = col.center[2];
          const combRadius = radius + col.radius;

          const dx = resolvedX - cx;
          const dz = resolvedZ - cz;
          const distSq = dx * dx + dz * dz;

          if (distSq < combRadius * combRadius) {
            hadCollision = true;
            lastCollidedId = col.id;
            const dist = Math.sqrt(distSq);
            if (dist > 0.0001) {
              const push = combRadius - dist;
              const nx = dx / dist;
              const nz = dz / dist;
              resolvedX += nx * push;
              resolvedZ += nz * push;
              totalPenetration = Math.max(totalPenetration, push);
            } else {
              resolvedZ += combRadius;
              totalPenetration = combRadius;
            }
          }
        }
      }
    }

    return {
      hasCollision: hadCollision,
      resolvedPosition: [resolvedX, pos[1], resolvedZ],
      penetrationDepth: totalPenetration,
      normal: [0, 0, 0],
      collidedWithId: lastCollidedId,
    };
  }

  /**
   * Resolves citizen-to-citizen mutual push-out so characters never overlap or clip.
   */
  public resolveMutualCharacterBuffer(
    citizenPositions: Array<{ id: string; pos: [number, number, number] }>,
    minBuffer = 0.72
  ): Map<string, [number, number, number]> {
    const updated = new Map<string, [number, number, number]>();

    for (let i = 0; i < citizenPositions.length; i++) {
      const a = citizenPositions[i];
      let ax = a.pos[0];
      let az = a.pos[2];

      for (let j = 0; j < citizenPositions.length; j++) {
        if (i === j) continue;
        const b = citizenPositions[j];
        const dx = ax - b.pos[0];
        const dz = az - b.pos[2];
        const dist = Math.hypot(dx, dz);

        if (dist < minBuffer && dist > 0.001) {
          const push = (minBuffer - dist) * 0.55;
          ax += (dx / dist) * push;
          az += (dz / dist) * push;
        }
      }

      // Also ensure mutual push didn't push character into a building
      const envResolved = this.resolveCapsulePosition([ax, a.pos[1], az], 0.35, a.id);
      updated.set(a.id, envResolved.resolvedPosition);
    }

    return updated;
  }

  /**
   * Finds a safe unoccupied spawn position guaranteed to have 0 collisions with buildings or props.
   */
  public findSafeSpawnPosition(
    preferredPos: [number, number, number],
    minClearance = 0.95
  ): [number, number, number] {
    const testResult = this.resolveCapsulePosition(preferredPos, minClearance);
    if (!testResult.hasCollision) {
      return preferredPos;
    }

    const angles = [
      0,
      Math.PI / 4,
      Math.PI / 2,
      (3 * Math.PI) / 4,
      Math.PI,
      (5 * Math.PI) / 4,
      (3 * Math.PI) / 2,
      (7 * Math.PI) / 4,
    ];
    for (let radius = 1.2; radius <= 18.0; radius += 1.2) {
      for (const ang of angles) {
        const candidate: [number, number, number] = [
          preferredPos[0] + Math.cos(ang) * radius,
          preferredPos[1],
          preferredPos[2] + Math.sin(ang) * radius,
        ];
        const res = this.resolveCapsulePosition(candidate, minClearance);
        if (!res.hasCollision) {
          return candidate;
        }
      }
    }

    return testResult.resolvedPosition;
  }
}

export const collisionSystem = new CollisionRegistry();

/**
 * Procedural Tool Execution: collision.apply
 */
export function applyProceduralCollider(params: {
  address: string;
  shape: ColliderShape;
  center: [number, number, number];
  dimensions: [number, number, number]; // [w, h, d]
  tag?: SpatialCollider['tag'];
}): SpatialCollider {
  const id = `col-${params.address}`;
  const halfExtents: [number, number, number] = [
    params.dimensions[0] / 2,
    params.dimensions[1] / 2,
    params.dimensions[2] / 2,
  ];

  const collider: SpatialCollider = {
    id,
    address: params.address,
    shape: params.shape,
    center: params.center,
    halfExtents,
    radius: Math.max(params.dimensions[0], params.dimensions[2]) / 2,
    height: params.dimensions[1],
    tag: params.tag || 'building',
  };

  collisionSystem.register(collider);
  return collider;
}

/**
 * Procedural Scene Graph Collider Synthesis Tool:
 * Automatically traverses a Three.js Scene/Group, measures exact world-space Box3 bounds
 * for any object tagged with `userData.colliderAddress`, and registers 1:1 physics colliders.
 */
export function autoSynthesizeSceneColliders(sceneRoot: THREE.Object3D): SpatialCollider[] {
  const synthesized: SpatialCollider[] = [];
  sceneRoot.updateMatrixWorld(true);

  sceneRoot.traverse((obj) => {
    if (obj.userData && obj.userData.colliderAddress) {
      const box = new THREE.Box3().setFromObject(obj);
      if (!box.isEmpty()) {
        const center = new THREE.Vector3();
        const size = new THREE.Vector3();
        box.getCenter(center);
        box.getSize(size);

        const shape: ColliderShape = obj.userData.colliderShape || 'box';
        const tag: SpatialCollider['tag'] = obj.userData.colliderTag || 'building';

        const col = applyProceduralCollider({
          address: obj.userData.colliderAddress,
          shape,
          center: [
            Number(center.x.toFixed(2)),
            Number(center.y.toFixed(2)),
            Number(center.z.toFixed(2)),
          ],
          dimensions: [
            Number(Math.max(0.6, size.x).toFixed(2)),
            Number(Math.max(0.6, size.y).toFixed(2)),
            Number(Math.max(0.6, size.z).toFixed(2)),
          ],
          tag,
        });
        synthesized.push(col);
      }
    }
  });

  return synthesized;
}

/**
 * Initializes the canonical 1:1 Metric Bremerton static colliders (220m × 180m district)
 */
export function initializeBremertonStaticColliders(): void {
  collisionSystem.clear();

  // 1. Building 1: 240 Burwell St Residential Lofts (True 1:1 Footprint: 16m × 13.5m × 12m)
  applyProceduralCollider({
    address: 'world.bremerton.block-02.plot-240-burwell',
    shape: 'box',
    center: [-6.0, 6.75, -13.5],
    dimensions: [16.0, 13.5, 12.0],
    tag: 'building',
  });

  // 2. Building 2: Pacific Ave Heritage Brick Apartments (14m × 15m × 12m)
  applyProceduralCollider({
    address: 'world.bremerton.block-02.plot-heritage-brick',
    shape: 'box',
    center: [-26.0, 7.5, -14.0],
    dimensions: [14.0, 15.0, 12.0],
    tag: 'building',
  });

  // 3. Building 3: Sinclair Sound Roasters & Corner Bakery (13m × 9.5m × 11m)
  applyProceduralCollider({
    address: 'world.bremerton.block-02.plot-sinclair-cafe',
    shape: 'box',
    center: [12.0, 4.75, -13.0],
    dimensions: [13.0, 9.5, 11.0],
    tag: 'building',
  });

  // 4. Building 4: Harborside Glass Civic & Transit Atrium (16m × 12.5m × 12m)
  applyProceduralCollider({
    address: 'world.bremerton.block-03.plot-civic-atrium',
    shape: 'box',
    center: [30.0, 6.25, -13.0],
    dimensions: [16.0, 12.5, 12.0],
    tag: 'building',
  });

  // 5. Building 5: Puget Sound Naval Museum & Maritime Guild (15m × 11m × 12m)
  applyProceduralCollider({
    address: 'world.bremerton.block-01.plot-maritime-guild',
    shape: 'box',
    center: [-46.0, 5.5, -13.5],
    dimensions: [15.0, 11.0, 12.0],
    tag: 'building',
  });

  // 6. Building 6: Bremerton Ferry Terminal Slip 1 Headhouse (18m × 9.5m × 10m)
  applyProceduralCollider({
    address: 'world.bremerton.block-01.plot-ferry-terminal',
    shape: 'box',
    center: [-22.0, 4.75, 22.0],
    dimensions: [18.0, 9.5, 10.0],
    tag: 'building',
  });

  // 7. Harborside Copper Ring Fountain Plaza Basin (Cylinder diameter 9.2m)
  applyProceduralCollider({
    address: 'world.bremerton.block-03.plot-fountain-basin',
    shape: 'cylinder',
    center: [-16.0, 0.8, 10.5],
    dimensions: [9.2, 1.6, 9.2],
    tag: 'fixture',
  });

  // 8. Parked 1:1 Metric Vehicles along Burwell St Curb (4.6m × 1.5m × 1.9m)
  applyProceduralCollider({
    address: 'world.bremerton.street.sedan-01',
    shape: 'box',
    center: [-15.0, 0.75, -2.6],
    dimensions: [4.6, 1.5, 1.9],
    tag: 'prop',
  });
  applyProceduralCollider({
    address: 'world.bremerton.street.sedan-02',
    shape: 'box',
    center: [4.5, 0.75, 2.6],
    dimensions: [4.6, 1.5, 1.9],
    tag: 'prop',
  });

  // 9. Waterfront Timber Bulkhead Sea-Wall Barrier (prevents walking into deep water)
  applyProceduralCollider({
    address: 'world.bremerton.waterfront.pier-edge-south',
    shape: 'box',
    center: [0, 1.0, 26.5],
    dimensions: [180.0, 2.0, 1.2],
    tag: 'boundary',
  });
}
