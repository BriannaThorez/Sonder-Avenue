/**
 * Sonder Avenue — Agent-First Ontological Address Bus & Reference Resolver
 * Address: SYSTEM.Ontology.AddressBus.core-resolver
 * Compliance: DCR-2.1.15-01 (Word-Native Slugs), DCR-2.2.12-01 (Cache-Prefix Stability),
 *             DCR-2.2.15-01 (Canonical Domaining), DCR-2.2.40-01 (Addressing Doctrine)
 *
 * Ensures every 3D composer, toolset, BSP room, subtractive facade module, CS2 spline node/segment,
 * physics collider, and SkinnedMesh bone/clip is registered, discoverable, and mutable by its
 * canonical domained cased dot-notation address with kebab-case terminal slugs.
 */

export type DcaRootDomain =
  | 'citizen'
  | 'world'
  | 'lot'
  | 'prop'
  | 'dca'
  | 'SYSTEM'
  | 'DCA';

export type DcaComposerKind =
  | 'shape-grammar-composer'
  | 'spline-road-composer'
  | 'collision-physics-composer'
  | 'character-skinning-composer'
  | 'r186-postprocessing-composer'
  | 'persona-calculus-composer';

export interface DcaAddressDescriptor {
  /** Canonical domained dot-notation address, e.g. "world.bremerton.block-02.plot-240-burwell.floor-01.room.central-corridor" */
  address: string;
  /** Root ontology domain */
  rootDomain: DcaRootDomain;
  /** Owning 3D or cognitive composer */
  composer: DcaComposerKind;
  /** Terminal kebab-case slug */
  terminalSlug: string;
  /** Human & agent readable summary (Layer 1 progressive disclosure) */
  summary: string;
  /** 1:1 metric world position [x, y, z] in meters if spatial */
  worldPositionMeters?: [number, number, number];
  /** 1:1 metric dimensions or bounds [w, h, d] in meters if spatial */
  dimensionsMeters?: [number, number, number];
  /** Bi-directional InstancedMesh / BatchedMesh index if GPU-instanced */
  gpuInstanceSlot?: {
    batchGroupAddress: string;
    instanceId: number;
  };
  /** Structured metadata & agent-mutable properties (Layer 2 & 3 progressive disclosure) */
  telemetry: Record<string, string | number | boolean | number[]>;
}

export interface DcaReferenceCommand {
  targetAddress: string;
  operation:
    | 'inspect'
    | 'mutate-style'
    | 'mutate-stories'
    | 'mutate-window-grid'
    | 'mutate-position'
    | 'mutate-posture'
    | 'declip-collider';
  params?: Record<string, unknown>;
}

export interface DcaReferenceCommandResult {
  success: boolean;
  address: string;
  composer: DcaComposerKind | 'unknown';
  operation: string;
  summary: string;
  descriptor?: DcaAddressDescriptor;
}

/**
 * Strict DCA v2.2 Address Grammar Validator (DCR-2.1.15-01 & DCR-2.2.40-01):
 * - Must have at least 3 dot-separated segments
 * - Root domain must be one of the canonical domains
 * - Terminal segment must be valid kebab-case (`^[a-z0-9]+(-[a-z0-9]+)*$`)
 */
export function verifyCanonicalDcaSlugGrammar(address: string): {
  valid: boolean;
  rootDomain: string;
  terminalSlug: string;
  reason?: string;
} {
  if (!address || typeof address !== 'string') {
    return {
      valid: false,
      rootDomain: '',
      terminalSlug: '',
      reason: 'Empty or non-string address',
    };
  }
  const parts = address.trim().split('.');
  if (parts.length < 3) {
    return {
      valid: false,
      rootDomain: parts[0] || '',
      terminalSlug: parts[parts.length - 1] || '',
      reason: 'Address must contain at least 3 dot-separated ontological segments',
    };
  }
  const rootDomain = parts[0];
  const allowedRoots = new Set(['citizen', 'world', 'lot', 'prop', 'dca', 'SYSTEM', 'DCA']);
  if (!allowedRoots.has(rootDomain)) {
    return {
      valid: false,
      rootDomain,
      terminalSlug: parts[parts.length - 1],
      reason: `Root domain '${rootDomain}' is not in canonical set (citizen, world, lot, prop, dca, SYSTEM, DCA)`,
    };
  }
  const terminalSlug = parts[parts.length - 1];
  const kebabRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  if (!kebabRegex.test(terminalSlug)) {
    return {
      valid: false,
      rootDomain,
      terminalSlug,
      reason: `Terminal slug '${terminalSlug}' violates kebab-case grammar (DCR-2.1.15-01)`,
    };
  }
  return {
    valid: true,
    rootDomain,
    terminalSlug,
  };
}

/**
 * Helper to sanitize any string into a valid DCA kebab-case slug
 */
export function toKebabSlug(raw: string): string {
  return raw
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

/**
 * Global Agent-First Ontological Address Bus
 * Enforces DCR-2.2.12-01 (Cache-Prefix Stability) by returning deterministically sorted
 * address trees so agents can inspect `listAddresses()` before reading full descriptors.
 */
class DcaAddressOntologyBus {
  private registry = new Map<string, DcaAddressDescriptor>();
  private mutationHandlers = new Map<
    DcaComposerKind,
    (cmd: DcaReferenceCommand) => DcaReferenceCommandResult
  >();

  public register(descriptor: DcaAddressDescriptor): void {
    this.registry.set(descriptor.address, descriptor);
  }

  public registerBatch(descriptors: DcaAddressDescriptor[]): void {
    for (const d of descriptors) {
      this.registry.set(d.address, d);
    }
  }

  public clearComposerAddresses(composer: DcaComposerKind): void {
    for (const [addr, desc] of this.registry.entries()) {
      if (desc.composer === composer) {
        this.registry.delete(addr);
      }
    }
  }

  public registerMutationHandler(
    composer: DcaComposerKind,
    handler: (cmd: DcaReferenceCommand) => DcaReferenceCommandResult
  ): void {
    this.mutationHandlers.set(composer, handler);
  }

  /**
   * Layer 1 Progressive Disclosure: Returns lexicographically sorted canonical addresses
   * matching an optional prefix or composer filter (DCR-2.2.12-01 Cache-Prefix Stability).
   */
  public listAddresses(options?: {
    prefix?: string;
    composer?: DcaComposerKind;
    limit?: number;
  }): string[] {
    const prefix = options?.prefix?.trim();
    const composer = options?.composer;
    const matched: string[] = [];

    for (const [addr, desc] of this.registry.entries()) {
      if (prefix && !addr.startsWith(prefix)) continue;
      if (composer && desc.composer !== composer) continue;
      matched.push(addr);
    }

    matched.sort((a, b) => a.localeCompare(b));
    if (options?.limit && options.limit > 0) {
      return matched.slice(0, options.limit);
    }
    return matched;
  }

  /**
   * Layer 2 Progressive Disclosure: Resolves an address reference to its full descriptor.
   */
  public resolve(address: string): DcaAddressDescriptor | undefined {
    return this.registry.get(address);
  }

  /**
   * Resolves a prefix or partial reference (e.g. a building address when clicking a child window module)
   */
  public resolveWithAncestors(address: string): {
    exact?: DcaAddressDescriptor;
    ancestors: DcaAddressDescriptor[];
    childrenCount: number;
  } {
    const exact = this.registry.get(address);
    const parts = address.split('.');
    const ancestors: DcaAddressDescriptor[] = [];
    for (let i = 3; i < parts.length; i++) {
      const prefix = parts.slice(0, i).join('.');
      const anc = this.registry.get(prefix);
      if (anc) ancestors.push(anc);
    }
    let childrenCount = 0;
    const childPrefix = `${address}.`;
    for (const key of this.registry.keys()) {
      if (key.startsWith(childPrefix)) childrenCount++;
    }
    return { exact, ancestors, childrenCount };
  }

  /**
   * Executes an agent-first reference command directly against the registered composer.
   */
  public executeByReference(cmd: DcaReferenceCommand): DcaReferenceCommandResult {
    const desc = this.registry.get(cmd.targetAddress);
    if (cmd.operation === 'inspect') {
      if (!desc) {
        return {
          success: false,
          address: cmd.targetAddress,
          composer: 'unknown',
          operation: 'inspect',
          summary: `Address '${cmd.targetAddress}' not found in live ontology bus.`,
        };
      }
      return {
        success: true,
        address: desc.address,
        composer: desc.composer,
        operation: 'inspect',
        summary: desc.summary,
        descriptor: desc,
      };
    }

    const composer = desc?.composer;
    if (composer && this.mutationHandlers.has(composer)) {
      return this.mutationHandlers.get(composer)!(cmd);
    }

    return {
      success: Boolean(desc),
      address: cmd.targetAddress,
      composer: composer || 'unknown',
      operation: cmd.operation,
      summary: desc
        ? `Resolved '${cmd.targetAddress}' (${desc.summary})`
        : `Unresolved address '${cmd.targetAddress}'`,
      descriptor: desc,
    };
  }

  public getStats(): {
    totalRegisteredAddresses: number;
    byComposer: Record<DcaComposerKind, number>;
    grammarComplianceRate: number;
  } {
    const byComposer: Record<DcaComposerKind, number> = {
      'shape-grammar-composer': 0,
      'spline-road-composer': 0,
      'collision-physics-composer': 0,
      'character-skinning-composer': 0,
      'r186-postprocessing-composer': 0,
      'persona-calculus-composer': 0,
    };
    let validCount = 0;
    for (const [addr, desc] of this.registry.entries()) {
      byComposer[desc.composer] = (byComposer[desc.composer] || 0) + 1;
      if (verifyCanonicalDcaSlugGrammar(addr).valid) {
        validCount++;
      }
    }
    const total = this.registry.size;
    return {
      totalRegisteredAddresses: total,
      byComposer,
      grammarComplianceRate: total === 0 ? 1.0 : validCount / total,
    };
  }
}

export const dcaAddressBus = new DcaAddressOntologyBus();
