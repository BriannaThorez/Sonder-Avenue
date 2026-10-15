# Working Implementation Plan (`[WORKING_DOCUMENTS]`)

---
address: DEVELOPMENT.ImplementationPlans.sonder-avenue-master
status: "ACTIVE_EXECUTION"
dca_conformance: "DCA v2.2.43"
---

## Execution Checklist

1. **DCA v2.2 Repository & Runtime Guard (`src/core/dcaRuntimeGuard.ts`)**:
   - Enforces `DCR-2.1.15-01` (Word-native `kebab-case` slugs), `DCR-2.2.33-01` (Verify-Twice Specification Rule), `DCR-2.2.40-01` (Addressing Doctrine `citizen.[id].{mind,body,daemon}.*`), and `DCR-2.2.20-01` (`dca_key.md` attribution).
2. **Persona Calculus Mathematical Engine (`src/core/personaCalculus.ts`)**:
   - 24 VIA Character Strengths & 6 Virtues normalized on the hypersphere $S^{23}$ ($\|\vec{\psi}\| = 1$) with Agentic Willpower magnitude $\|\vec{\Psi}\|$.
   - Diagonal Allostatic Stress Operator $\hat{S}$ with Sanity Determinant $\det(\hat{S})$ and Flux Hysteresis.
   - Symbolic Firewall / Cognitive Logic Gate $\mathcal{G}$ ($Si, Ne, Ti, Fe$ + Need for Closure $\mathcal{K}$).
   - Synaptic Coupling $\Omega = \vec{\psi}_A \cdot \vec{\psi}_B$ and Neighborhood Cultural Field Tensor $\mathcal{F}$.
3. **Address-Resolved VFS & Zero-Cost Persistence (`src/core/citizenVfs.ts` & `src/core/peerComputeMesh.ts`)**:
   - Hydrates complete `citizen.[id].{mind,body,daemon}.*.md` workspaces with Progressive Disclosure YAML frontmatter (`DCR-2.2.13-01`).
   - Persists to browser **IndexedDB** and synchronizes daemon leases and `CorticalIntentPacket` streams across **WebRTC DataChannels (`RTCPeerConnection`) + `BroadcastChannel`**.
4. **Packetized Mind-to-Body Daemon Engine (`src/daemons/citizenDaemonEngine.ts`)**:
   - 10Hz subconscious locomotion, queue following, bench sitting, object pickup, and 36-pose IK solver.
   - Packetized `CorticalIntentPacket` bus supporting both the **Deterministic Cortical Stub** (default zero-latency pilot) and **Live Server-Side Gemini Cortical Bus (`/api/cortical/think`)**.
5. **WebGL2 Bremerton Diorama & 16-Segment Character Factory (`src/world/BremertonDioramaCanvas.tsx`)**:
   - Tilt-shift orthographic diorama (`240 Burwell St`, Ferry Terminal, Naval Pier, Suspension Bridge, Parked Sedans, Park Benches, Commuter Queue) with `Sept 12, 57°F` ↔ `Dec 26, 35°F Snow` toggle.
   - 16-segment procedural mannequin rig with instant toggle between **Artist Mannequin Mode** (porcelain segments + charcoal joints) and **Jane Do / Jane Doe Attire Mode** (terracotta collared polo, dark cuffed jeans, brown sneakers).
