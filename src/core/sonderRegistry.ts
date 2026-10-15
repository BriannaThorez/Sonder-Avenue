/**
 * Sonder Avenue — Unified Central Editable Registry & Design System
 * Address: SYSTEM.Registry.SonderAvenue.central-spec
 * DCA Compliance: DCR-2.1.15-01 (Word-Native domained dot-notation), DCR-2.2.38-01 (Clamping), DCR-2.2.43 (1:1 Metric)
 */

// ============================================================================
// 1. INDUSTRY DESIGN STANDARD 5-COLOR RGBA PALETTE (Warm / Light Harmony)
// ============================================================================
export const SONDER_PALETTE = {
  // Primary brand / action accents (Warm Terracotta sunset)
  terracotta: {
    hex: '#d96b44',
    rgba: (alpha = 1) => `rgba(217, 107, 68, ${alpha})`,
    tailwind: 'text-[#d96b44] border-[#d96b44] bg-[#d96b44]',
  },
  // Soft, readable warm canvas & glass substrate (Warm Sand / Alabaster)
  warmSand: {
    hex: '#f7f3eb',
    rgba: (alpha = 1) => `rgba(247, 243, 235, ${alpha})`,
    tailwind: 'text-[#1e293b] bg-[#f7f3eb]',
  },
  // Deep marine ink for high-contrast typography (Pacific Slate Ink)
  pacificSlate: {
    hex: '#1e293b',
    rgba: (alpha = 0.85) => `rgba(30, 41, 59, ${alpha})`,
    tailwind: 'text-[#1e293b] border-stone-300/80',
  },
  // Growth / virtue badges / positive status (Fjord Teal / Sage)
  fjordTeal: {
    hex: '#2e7d73',
    rgba: (alpha = 1) => `rgba(46, 125, 115, ${alpha})`,
    tailwind: 'text-[#2e7d73] border-[#2e7d73] bg-[#2e7d73]',
  },
  // Plumbob / active focus / warm sunlight (Sunlit Amber)
  sunlitAmber: {
    hex: '#e59a28',
    rgba: (alpha = 1) => `rgba(229, 154, 40, ${alpha})`,
    tailwind: 'text-[#e59a28] border-[#e59a28] bg-[#e59a28]',
  },
} as const;

// 3-Layer Warm Daylight Liquid Glass styling tokens for compact, non-dark UI panels
export const LIQUID_GLASS_LAYERS = {
  // Layer 1: Warm Alabaster / Sand translucent glass substrate (no dark slate heaviness)
  substrate:
    'bg-[#FAF7F2]/92 border border-stone-300/80 text-slate-800 shadow-[0_12px_32px_rgba(30,41,59,0.14)]',
  // Layer 2: Refractive mid-layer warm specular sheen
  sheen: 'bg-gradient-to-b from-white/70 via-[#FAF7F2]/40 to-stone-100/60',
  // Layer 3: Interactive highlight & subtle terracotta border
  glowBorder: 'hover:border-[#d96b44]/50 transition-all duration-150',
  innerPill:
    'bg-stone-200/65 border border-stone-300/70 text-slate-700 hover:bg-stone-200/95 transition-colors',
} as const;

// ============================================================================
// 2. 1:1 SCALE BREMERTON WATERFRONT LANDMARKS & SMART TARGETS
//    True 1:1 Metric Scale where 1 unit = 1.00 meter (Citizen = 1.72m tall)
// ============================================================================
export interface BremertonBuildingSpec {
  address: string;
  name: string;
  category: 'commercial-brick' | 'civic-glass' | 'market-cafe' | 'marina-terminal' | 'cultural-pavilion';
  position: [number, number, number]; // x, y (ground=0), z in 1:1 meters
  dimensions: [number, number, number]; // width, height, depth in 1:1 meters
  colorHex: string;
  roofColorHex: string;
  floors: number;
  hasStorefront: boolean;
  signageText: string;
}

export const BREMERTON_1TO1_BUILDINGS: BremertonBuildingSpec[] = [
  {
    address: 'world.bremerton.block-02.plot-240-burwell',
    name: '240 Burwell St (Corner Lofts & Archival Studio)',
    category: 'commercial-brick',
    position: [-4.5, 0, -10.5],
    dimensions: [14.0, 11.4, 10.5],
    colorHex: '#9e3d2b',
    roofColorHex: '#3b3837',
    floors: 3,
    hasStorefront: true,
    signageText: '240 BURWELL LOFTS',
  },
  {
    address: 'world.bremerton.block-02.plot-heritage-brick',
    name: '100 Pacific Ave (Heritage Brick Bookshop & Mercantile)',
    category: 'commercial-brick',
    position: [-21.5, 0, -10.5],
    dimensions: [13.0, 14.2, 10.5],
    colorHex: '#7c2b1d',
    roofColorHex: '#27272a',
    floors: 4,
    hasStorefront: true,
    signageText: 'PACIFIC HERITAGE BOOKS',
  },
  {
    address: 'world.bremerton.block-02.plot-sinclair-cafe',
    name: 'Sinclair Sound Coffee Roasters & Bakery',
    category: 'market-cafe',
    position: [11.5, 0, -10.0],
    dimensions: [12.0, 7.8, 9.5],
    colorHex: '#9c6644',
    roofColorHex: '#582f0e',
    floors: 2,
    hasStorefront: true,
    signageText: 'SINCLAIR ROASTERY & CAFE',
  },
  {
    address: 'world.bremerton.block-03.plot-civic-atrium',
    name: 'Harborside Civic & Transit Glass Atrium',
    category: 'civic-glass',
    position: [27.5, 0, -10.5],
    dimensions: [15.0, 12.8, 11.0],
    colorHex: '#38bdf8',
    roofColorHex: '#0f172a',
    floors: 3,
    hasStorefront: true,
    signageText: 'HARBORSIDE CIVIC ATRIUM',
  },
  {
    address: 'world.bremerton.block-03.plot-arts-pavilion',
    name: 'Kitsap Maritime Arts & Timber Pavilion',
    category: 'cultural-pavilion',
    position: [-13.0, 0, -25.5],
    dimensions: [16.0, 9.6, 10.0],
    colorHex: '#b45309',
    roofColorHex: '#1e293b',
    floors: 2,
    hasStorefront: true,
    signageText: 'KITSAP ARTS PAVILION',
  },
  {
    address: 'world.bremerton.block-03.plot-north-apartments',
    name: 'Olympic View Terraced Apartments',
    category: 'commercial-brick',
    position: [8.0, 0, -25.5],
    dimensions: [18.0, 14.8, 10.5],
    colorHex: '#475569',
    roofColorHex: '#1e293b',
    floors: 4,
    hasStorefront: true,
    signageText: 'OLYMPIC VIEW RESIDENCES',
  },
  {
    address: 'world.bremerton.block-01.plot-ferry-terminal',
    name: 'Washington State Ferry Passenger Terminal (Slip 1)',
    category: 'marina-terminal',
    position: [-15.0, 0, 13.5],
    dimensions: [16.0, 7.6, 9.0],
    colorHex: '#15803d',
    roofColorHex: '#1e3a5f',
    floors: 2,
    hasStorefront: true,
    signageText: 'WSF BREMERTON - SEATTLE',
  },
];

// Interactive Smart Targets for Sims 4 style autonomy in 1:1 Metric Coordinates
export interface SmartTargetNode {
  address: string;
  label: string;
  position: [number, number, number];
  approachRadius: number;
  posture: 'sit-relaxed' | 'walk-composed' | 'lean-casual' | 'idle-lookaround' | 'inspect-prop';
  motiveSatisfied: 'energy' | 'hunger' | 'social' | 'fun' | 'comfort';
}

export const CENTRAL_SMART_TARGETS: SmartTargetNode[] = [
  {
    address: 'world.bremerton.harborside.park-bench-east',
    label: 'Plaza Cedar Bench (Harborside)',
    position: [-10.0, 0.0, 9.2],
    approachRadius: 1.4,
    posture: 'sit-relaxed',
    motiveSatisfied: 'comfort',
  },
  {
    address: 'world.bremerton.harborside.park-bench-west',
    label: 'Waterfront Bench (Sound View)',
    position: [6.5, 0.0, 4.8],
    approachRadius: 1.4,
    posture: 'sit-relaxed',
    motiveSatisfied: 'comfort',
  },
  {
    address: 'world.bremerton.cafe.outdoor-terrace-table',
    label: 'Sinclair Cafe Terrace Espresso Bar',
    position: [11.5, 0.0, -3.2],
    approachRadius: 1.6,
    posture: 'inspect-prop',
    motiveSatisfied: 'hunger',
  },
  {
    address: 'world.bremerton.ferry.turnstile-queue-gate',
    label: 'Ferry Slip 1 Turnstile Queue',
    position: [-15.0, 0.0, 8.2],
    approachRadius: 2.0,
    posture: 'lean-casual',
    motiveSatisfied: 'fun',
  },
  {
    address: 'world.bremerton.plaza.fountain-amphitheater',
    label: 'Harborside Fountain Core',
    position: [-12.5, 0.0, -2.5],
    approachRadius: 3.0,
    posture: 'idle-lookaround',
    motiveSatisfied: 'social',
  },
  {
    address: 'world.bremerton.burwell.pacific-ave-crosswalk',
    label: 'Burwell & Pacific Ave Crosswalk',
    position: [-4.5, 0.0, -3.5],
    approachRadius: 2.0,
    posture: 'walk-composed',
    motiveSatisfied: 'energy',
  },
];

// ============================================================================
// 3. PHYSICS & JOINT SPRING-DAMPER DYNAMICS CONSTANTS
// ============================================================================
export const SONDER_PHYSICS = {
  // Joint torsional spring constant (kp in N*m/rad)
  torsionalStiffnessKp: 38.0,
  // Joint damping coefficient (cd in N*m*s/rad)
  dampingCd: 4.8,
  // Gentle gravity sag factor (torque pull toward natural down)
  gravitySagFactor: 0.12,
  // Ground plane elevation in world units (meters)
  groundLevelY: 0.0,
  // Natural arm resting angle in radians (downwards with slight elbow flexion)
  naturalArmRestAngle: 0.08,
  // Foot sole thickness for ground alignment (meters)
  footSoleThickness: 0.045,
} as const;

// ============================================================================
// 4. SIMS 4 STYLE AUTONOMOUS MOTIVES
// ============================================================================
export interface CitizenMotives {
  energy: number;   // 0.0 .. 1.0 (sleep/rest)
  hunger: number;   // 0.0 .. 1.0 (coffee/meal)
  social: number;   // 0.0 .. 1.0 (conversations/banter)
  fun: number;      // 0.0 .. 1.0 (scenery/entertainment)
  comfort: number;  // 0.0 .. 1.0 (benches/seating)
  hygiene: number;  // 0.0 .. 1.0 (tidiness)
}

export const INITIAL_CITIZEN_MOTIVES: CitizenMotives = {
  energy: 0.88,
  hunger: 0.65,
  social: 0.72,
  fun: 0.80,
  comfort: 0.75,
  hygiene: 0.95,
};

// ============================================================================
// 5. CASED DOT-NOTATION ADDRESS VALIDATOR (DCR-2.1.15-01)
// ============================================================================
export function validateDcaAddress(addr: string): boolean {
  if (!addr || typeof addr !== 'string') return false;
  const dotPattern = /^[a-zA-Z0-9]+(\.[a-zA-Z0-9\-]+)+$/;
  return dotPattern.test(addr);
}
