# Sonder Avenue — Phase 2 Implementation Plan: Neurosymbolic Life Simulator & DeepSeek-Flash Orchestration

---
address: SYSTEM.Planning.SonderAvenue.phase-2-master-plan
version: "2.3.0"
dca_compliance: "DCR-2.1.15-01 .. DCR-2.2.43-01"
licensee_pointer: "./dca_key.md"
status: "PROPOSED_FOR_REVIEW"
---

## 1. Executive Teleological & Axiomatic Intent Analysis

### 1.1 Axiomatic Basis ($A_m$)
The user's core vision is a high-fidelity, autonomous life simulator where characters ("citizens") possess biological, psychological, and physical agency. Rather than superficial puppet animations or static ragdolls, characters must exhibit:
1. **Bicameral Integrity**: Higher cortical reasoning (LLM / Cortical Bus) dispatches high-level intents (`NAVIGATE_TO`, `CONVERSE`, `INSPECT`), while the onboard subconscious daemon (`citizen.[id].daemon`) autonomously solves locomotion, joint resting states, obstacle avoidance, and foot planting via spring-damper physics and Persona Calculus.
2. **DCA v2.2 Contractual Discipline**: Every bone, joint, thought, memory, and property resides at a cased dot-notation address (e.g., `citizen.jane-do.body.cranium.hair-cap`, `citizen.jane-do.mind.persona.temperament.warmth`).
3. **Sims 4 Familiarity with Next-Gen Aesthetics**: A 3-layer semi-transparent liquid glass interface with warm, light color harmony, immune to extreme OS display scaling (250% Windows DPI), paired with in-canvas Drei thought bubbles and plumbobs.

### 1.2 Axiological Values ($V$)
- **Anti-Slop & Craft**: High fidelity out of the box. Beautiful proportions matching the reference photography and turnarounds, natural hair placement, realistic resting joint tension with gravity, and organic foot planting.
- **Usability & Flow**: Sliders in the Character Factory must not fight continuous animations; players can pose, sculpt, and animate smoothly.
- **Progressive Disclosure**: Subagent orchestration skills must follow agentskills.io progressive disclosure standards with rigorous purpose definitions and self-auditing DCA contracts.

### 1.3 Teleological Objective ($T$)
Deliver a 1:1 scale stylized Bremerton waterfront world populated by living citizens, controlled via an intuitive Sims-inspired interface and an expand-on-hover smart chat panel, backed by a reusable DeepSeek-Flash agent orchestration skill.

---

## 2. Architecture & Workstream Breakdown

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   SONDER AVENUE ARCHITECTURE                            │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  ┌───────────────────────┐   ┌───────────────────────────┐   ┌───────────────────────┐ │
│  │ DeepSeek-Flash Skill   │   │  Responsive Sims 4 GUI    │   │  Expand/Pin Chat Panel │ │
│  │ /skills/deepseek_flash │   │  - 3-Layer Liquid Glass   │   │  - Hover peek/Pin     │ │
│  │ Orchestration + DCA    │   │  - DPI Viewport Scaler    │   │  - @ autocomplete     │ │
│  │ Contract Enforcer      │   │  - 5-Color RGBA Palette   │   │  - Cortical Dispatch  │ │
│  └──────────┬────────────┘   └─────────────┬─────────────┘   └───────────┬───────────┘ │
│             │                              │                             │             │
│  ┌──────────▼──────────────────────────────▼─────────────────────────────▼───────────┐ │
│  │                       App.tsx & Unified Central Reference                         │ │
│  │                       (cased dot-notation registry & VFS)                         │ │
│  └─────────────────────────────────────────┬─────────────────────────────────────────┘ │
│                                            │                                           │
│       ┌────────────────────────────────────┴───────────────────────────────────┐       │
│       │                                                                        │       │
│  ┌────▼───────────────────────────────────┐    ┌───────────────────────────────▼─────┐ │
│  │ WebGL2 3D World (Three.js + Drei Canvas)│    │ Neurosymbolic Subconscious Daemon    │ │
│  │ - 1:1 Bremerton Waterfront Diorama     │    │ - Joint Strength & Gravity Sag      │ │
│  │ - Procedural Architecture & Shadows    │    │ - Damped Spring Kinematics (kp, cd) │ │
│  │ - Realigned Jane Do Rig + Hair Fix     │    │ - Foot Planting & Ground Collision  │ │
│  │ - In-Canvas Drei Bubbles & Plumbobs    │    │ - Sims 4 Free-Will Motive System    │ │
│  └────────────────────────────────────────┘    └─────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Implementation Steps

### Workstream 1: Reusable Progressive-Disclosure DeepSeek-Flash Orchestration Skill
**File Target**: `/skills/deepseek_flash_orchestration/SKILL.md`
- **Specification**:
  - Follow the **agentskills.io** open standard with YAML frontmatter (`name`, `description`, `version`, `author`, `compliance`).
  - Add explicit **Purpose** statement defining the axiomatic intent of DeepSeek-Flash (4.1) subagent delegation.
  - Implement **Progressive Disclosure**:
    - *Level 1 (Entry)*: Fast metadata and single-action dispatch commands.
    - *Level 2 (Protocol)*: Context packet formation, DCA v2.2 constitutional verification, prompt constraints, and anti-hallucination guardrails.
    - *Level 3 (Subagent Mesh)*: Multi-agent consensus, arbitration of conflicting outputs, and formal proofs of compliance.
  - Enforce DCA v2.2 adherence: Subagents are bound to word-native dot-notation addresses, 24-virtue hypersphere normalization, and bicameral separation.

### Workstream 2: Unified Central Editable Registry (`src/core/sonderRegistry.ts`)
- Consolidate all constants, 5-color RGBA palettes, cased dot-notation addresses, biometrics clamps, joint ranges, building footprints, and motive thresholds into a single, clean central file.
- Provide typed getters and validation functions to guarantee cross-module coherence.

### Workstream 3: High-Fidelity Character Rig, Hair Alignment & Factory Slider Rework
**File Target**: `src/world/BremertonDioramaCanvas.tsx`, `src/ui/CharacterFactoryPanel.tsx`
- **Hair Geometry Realignment**:
  - Fix current bug where hair cap is positioned below the cranium top (`0.145` $\rightarrow$ raised to `0.205`, scaled and sculpted over the scalp dome).
  - Add layered parted locks with front bangs and angled bob sides that drape naturally over the temples and nape, matching the reference images.
- **Enhanced Aesthetic Fidelity**:
  - Refined facial features: delicate eyebrow arches, upper eyelid shadow, soft lip crease, nose bridge definition.
  - Realistic clothing geometry: crisp polo collar with button placket, high-waisted belted trousers with subtle seam ridges, and sculpted casual oxford sneakers.
- **Slider & Animation Conflict Resolution**:
  - Implement a three-state slider mode:
    1. **Live Preview Mode**: Sliders apply direct kinematic offsets added to the base pose without being clobbered by continuous animation resets.
    2. **Freeze Pose / Mannequin Mode**: Suspends cyclic walking/running loops so players can meticulously tweak every joint in static equilibrium.
    3. **Physics Rest Blend**: Joint sliders set the *neutral target angle* $\theta_0$; the spring-damper system pulls the limbs toward this angle subject to simulated muscle stiffness.

### Workstream 4: Physics-Informed Joint Locomotion, Joint Strength & Foot Planting
**File Target**: `src/world/BremertonDioramaCanvas.tsx`, `src/daemons/citizenDaemonEngine.ts`
- **Joint Dynamics Model**:
  - Assign each joint a torsional stiffness $k_p$ (spring constant) and damping $c_d$:
    $$\tau_j = -k_p (\theta_j - \theta_{target}) - c_d \dot{\theta}_j + \tau_{gravity}$$
  - Apply gentle gravity sag factor ($g_{sag} = 9.81 \times 0.04$) to upper arms, forearms, and spine so limbs naturally rest with realistic mass and compliance rather than stiff robotic postures.
- **Foot Planting & Ground Collision**:
  - Implement two-bone analytical Inverse Kinematics (IK) for legs: hip to knee to ankle.
  - When walking, detect heel-strike and toe-off phases; clamp the planted foot to ground level ($y = 0.0$ or platform height) to prevent ground penetration or unnatural moonwalking.
- **Sims 4 Style Free-Will Motive System**:
  - Citizens evaluate 6 primary motives: *Energy, Hunger/Coffee, Social, Fun, Comfort, Hygiene*.
  - When unassigned, citizens autonomously pick nearby Smart Targets (e.g., waterfront bench, cafe counter, fountain plaza, ferry turnstile) and navigate with natural turn-in-place kinematics and obstacle avoidance.

### Workstream 5: 1:1 Scale Stylized Bremerton Waterfront Procedural Diorama
**File Target**: `src/world/BremertonDioramaCanvas.tsx`
- **Real-World Bremerton Layout (1:1 Proportions)**:
  - **Burwell Street Corridor**: Two-lane asphalt with striping, curbed sidewalks, pedestrian crossings, and streetlights.
  - **Bremerton Ferry Terminal**: Pier 1 gantry, passenger queue canopy, ferry slips, and realistic Puget Sound water with procedural ripples and reflections.
  - **Harborside Plaza & Fountain Park**: Stepped amphitheater, civic copper statues, waterfront wooden boardwalk, planters with evergreen Pacific Northwest pines and birch trees.
  - **Commercial Streetscape**: 3-4 multi-story Bremerton mixed-use buildings (brick facades, large street-level storefronts, glowing interior windows, rooftop HVAC units).
- **Stylized Visual Treatment**:
  - Warm, vibrant PNW color grading matching reference images (rich brick, slate blues, mossy greens, weathered cedar timber).
  - Directional sunlight casting crisp cascaded soft shadows, paired with an ambient hemisphere sky light and subtle depth fog.

### Workstream 6: Sims 4-Familiar 3-Layer Liquid Glass UI with DPI Scaling Immunity
**File Target**: `src/ui/LiquidGlassTheme.ts`, `src/ui/*`, `src/App.tsx`
- **Windows 250% Scaling & Viewport Compensation**:
  - Implement an auto-scaling root container using CSS viewport clamp formula (`vmin`/`vh` bounding) plus a manual **UI Zoom Slider** (50% to 150%) in the top utility bar.
  - Entire UI remains pixel-crisp and proportional regardless of OS zoom or high-DPI retina displays.
- **3-Layer Liquid Glass Hierarchy**:
  - *Layer 1 (Atmospheric Base)*: Translucent warm slate (`rgba(28, 32, 42, 0.55)`) with `backdrop-filter: blur(18px)`.
  - *Layer 2 (Refractive Mid-Surface)*: Highlight sheen border (`1px solid rgba(255, 255, 255, 0.18)`), inner box shadow for glass depth.
  - *Layer 3 (Specular Content)*: Crisp typography, warm amber accents (`rgba(224, 130, 84, 0.95)`), soft cream text (`rgba(248, 245, 238, 0.95)`).
- **5-Color RGBA Harmony**:
  1. *Terracotta Sunset*: `rgba(217, 107, 68, 1.0)` (Primary actions, selection rings)
  2. *Warm Sand / Cream*: `rgba(247, 243, 235, 1.0)` (Primary text, cards)
  3. *Pacific Slate*: `rgba(30, 41, 59, 0.85)` (Glass panel substrate)
  4. *Fjord Teal / Sage*: `rgba(56, 149, 138, 1.0)` (Virtue badges, positive feedback)
  5. *Sunlit Amber*: `rgba(245, 179, 66, 1.0)` (Plumbob, active focus)
- **In-Canvas Drei Elements**:
  - Floating 3D Sims-style green/amber Plumbob rotating smoothly above the active citizen's head.
  - 3D thought balloons and interaction icons rendered directly above citizens in canvas space.

### Workstream 7: Expand-on-Hover / Pin-on-Click Smart Chat & Command Panel
**File Target**: `src/ui/SmartChatPanel.tsx`, `src/App.tsx`
- **UX Interaction Flow**:
  - Default: Compact collapsed pill at bottom-right ("💬 Sonder Avenue Comms").
  - Hover: Smoothly expands into a glass preview card showing recent banter.
  - Click / Pin: Pins the full chat terminal open so it stays in place during typing.
- **Smart Features**:
  - `@` autocomplete: Typing `@` opens an autosuggest list of all active citizens in the diorama (`@jane-do`, `@marcus-v`, `@elena-r`, etc.) with keyboard navigation.
  - Automatic citizen targeting: Clicking any citizen in the 3D scene automatically opens the chat panel pre-targeted to that citizen's cortical whisper channel.
  - Dual Mode: Direct citizen whisper vs. global avenue broadcast.
  - Connected to the Cortical Bus (local deterministic daemon responses + optional server-side Gemini cognition).

---

## 4. Verification and Acceptance Criteria

1. **Build & Lint**:
   - `compile_applet` succeeds with 0 TypeScript or build errors.
   - Hot reload runs cleanly on port 3000.
2. **Visual & Anatomical Verification**:
   - Jane Do's hair cap sits firmly on top of the cranium without gaps or clipping into the forehead.
   - Character model displays refined facial geometry, crisp attire seams, and natural hand poses.
   - Sliders in the Character Factory immediately update the model's bones without jitter or animation fighting.
3. **Locomotion & Physics**:
   - Citizen walking animations feature natural hip sway, foot planting at ground level, and gentle gravity sag on resting limbs.
   - Obstacle collisions prevent walking through buildings or falling off pier edges.
4. **UI Usability**:
   - Under 250% Windows display scaling, the UI scales cleanly without overflowing or obscuring the 3D viewport.
   - UI Zoom slider allows players to smoothly scale the UI from 50% to 150%.
   - Chat panel expands on hover, pins on click, and provides instant `@` auto-complete for citizens.
5. **DCA & Skill Compliance**:
   - `/skills/deepseek_flash_orchestration/SKILL.md` is valid, well-structured, and compliant with both agentskills.io and the DCA v2.2 specification.
   - All addresses adhere to domained cased dot-notation (`SYSTEM.*`, `citizen.[id].*`).
