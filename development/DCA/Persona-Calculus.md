# Persona Calculus: Mathematical & Symbolic Modeling of Entities

---
address: DCA.Theory.PersonaCalculus.mathematical-modeling-of-entities
dca_version: "2.2.43"
ratified_dcr: "DCR-2.2.0-02-neurosymbolic-integration"
---

This document serves as the formal specification for the **Sonder Avenue Entity Cognitive Simulation Engine**, bridging the gap between raw statistical weights and symbolic reasoning. It defines the "soul" not as a list of adjectives, but as a dynamic trajectory through a high-dimensional manifold, governed by the laws of cognitive "physics."

## 1. The Persona State Vector ($\vec{\Psi}$)

An entity is defined as a vector $\vec{\Psi}$ in an $n$-dimensional manifold ($n = 24$ for the core VIA Character Strengths & Virtues, extendable with HEXACO and Moral Foundations sub-manifolds)—specifically a hyper-spherical latent space $S^{n-1}$.

### The Geometry of the Soul and Manifold Curvature
- **Hyperspherical Normalization ($\|\vec{\psi}\| = 1$)**: Enforces the **Law of Conservation of Personality**. An entity cannot be maximum in every trait simultaneously; hyper-specialization in *Self-Regulation* or *Prudence* mathematically trades off against unconstrained *Zest* or *Impulsivity*.
- **Magnitude ($\|\vec{\Psi}\|$ — Agentic Willpower / Personality Inertia)**:
  - **High-Magnitude ($\|\vec{\Psi}\| \gg 1$)**: Fixed character with strong convictions (Heavy Social Mass Object). Resists external cultural drift and anchors the local Field Tensor $\mathcal{F}$.
  - **Low-Magnitude ($\|\vec{\Psi}\| \ll 1$)**: Impressionable, high-plasticity entity pulled easily by external social tides.
- **Latent Drift**: Without social stimulus, $\vec{\Psi}$ drifts exponentially back toward the citizen's Constitutional Baseline Eigenstate ($\vec{\Psi}_{\text{base}}$).

## 2. The Cognitive Logic Gate ($\mathcal{G}$) — Symbolic Firewall

Before any action or cortical response is executed, Predicate Logic evaluates permissibility against the citizen's Jungian Logic Stack ($Si, Ne, Ti, Fe$) and Need for Closure ($\mathcal{K}$):
- **Priority Gates**: $Si$-dominant agents apply a Historical Weighting Operator favoring precedent and routine unless environmental stress exceeds safety bounds; $Ne$-dominant agents apply an Inverse Weighting favoring novel affordances.
- **The Uncertainty Rejector ($\mathcal{K}$)**: High Need for Closure prunes untested possibilities as a high-pass filter on action selection.
- **Cognitive Dissonance Resolution**: When an environmental input $\vec{E}$ creates disparity $\Delta \theta > \theta_{\text{crit}}$, the daemon resolves it via **Vector Rationalization** (learning), **Devaluation** (denial), or **Manifold Repair** (long-term trauma/epiphany bias).

## 3. The Stress Operator ($\hat{S}$) — Allostatic Load Matrix

Stress acts as a diagonal Linear Transformation Matrix $\hat{S}$ that warps $\vec{\Psi}' = \hat{S}\vec{\Psi}$ in real time based on somatic inputs (thermal cold, fatigue, crowding):
- **Eigenvalue Decay**: Under high stress, eigenvalues for *Openness/Curiosity* and *Agreeableness/Kindness* shrink toward zero ("Tunnel Vision").
- **Eigenvalue Amplification**: Coefficients for *Emotionality* and *Need for Closure* scale upward ($\lambda > 1$).
- **Determinant of Sanity ($\det(\hat{S})$) & Flux Hysteresis**: If $\det(\hat{S}) < \tau_{\text{break}}$, the citizen enters a Shadow-Function regression and requires a hysteresis cool-down period to recover.

## 4. Interaction Dynamics: Synaptic Coupling ($\Omega$)

When citizens $A$ and $B$ interact, their Compatibility Index is $\Omega = \vec{\psi}_A \cdot \vec{\psi}_B \in [-1, +1]$:
- **High Synergy ($\Omega > 0.65$)**: Axiological Resonance, shared memory trust multiplier, and consensus rotation ($\Delta \vec{\Psi}$).
- **Low Synergy ($\Omega < -0.25$)**: Triggers the **Omega Devaluation Filter**, attenuating the interlocutor's influence and inducing entrenchment rotation away from the rival.
- **Axiological Annihilation ($\Omega \to -1.0$)**: Antipodal collision triggering immediate social avoidance or confrontation.

## 5. Formal Virtue Functions ($\nabla V$) & Potential Wells

Repeated virtuous actions deepen Habitual Potential Wells in the utility landscape, increasing Axiological Inertia. Competing high-magnitude virtues with opposing gradients ($\nabla V_1 + \nabla V_2 \approx \vec{0}$) induce **Axiological Tension / Choice Paralysis** (manifesting as the reflective `• • • • •` hesitation bubble).

## 6. Emergent Culture: The Field Tensor ($\mathcal{F}$)

The neighborhood culture is the Mean Field $\mathcal{F} = \frac{1}{N}\sum_{i=1}^N \vec{\Psi}_i$, exerting an Acculturation Force on low-inertia citizens while high-magnitude disruptors can trigger Manifold Collapse (cultural realignment).

## 7. Five-Step Active Inference Pipeline

1. **State Encoding**: Serialize $\vec{\Psi}$ and warped $\hat{S}\vec{\Psi}$ into the `citizen.[id]` manifest.
2. **Mood-State Dependent Memory Indexing**: Retrieve memories from `citizen.[id].mind.memory.*` via emotional-valence cosine similarity.
3. **Symbolic Logic Filtering ($\mathcal{G}$)**: Prune out-of-character actions before cortical or motor execution.
4. **Cortical Packet Synthesis**: Emit `CorticalIntentPacket` from either the deterministic neurosymbolic stub or the attached Gemini cortical LLM.
5. **Autobiographical Cognitive Loopback**: Apply epigenetic delta $\Delta\vec{\Psi}$ to `citizen.[id].mind.soul.*` so the citizen becomes the person they enacted.
