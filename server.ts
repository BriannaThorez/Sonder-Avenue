import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;

function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  const server = http.createServer(app);

  // ============================================================================
  // ZERO-COST WEBRTC SIGNALING & PEER COMPUTE LEASE RELAY (/ws/mesh)
  // ============================================================================
  const wss = new WebSocketServer({ server, path: '/ws/mesh' });
  const connectedPeers = new Map<string, { ws: WebSocket; peerId: string; leasedCitizens: string[] }>();

  wss.on('connection', (ws) => {
    let currentPeerId = `peer-${Math.random().toString(36).slice(2, 8)}`;

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.type === 'peer:announce' && msg.peerId) {
          currentPeerId = msg.peerId;
          connectedPeers.set(currentPeerId, {
            ws,
            peerId: currentPeerId,
            leasedCitizens: Array.isArray(msg.leasedCitizens) ? msg.leasedCitizens : [],
          });
          broadcastPeerRoster();
          return;
        }

        // Broadcast WebRTC SDP/ICE signaling or CorticalIntentPacket deltas to other peers
        for (const [id, peer] of connectedPeers.entries()) {
          if (id !== currentPeerId && peer.ws.readyState === WebSocket.OPEN) {
            if (!msg.targetPeerId || msg.targetPeerId === id) {
              peer.ws.send(JSON.stringify({ ...msg, fromPeerId: currentPeerId }));
            }
          }
        }
      } catch {
        // Ignore malformed packets
      }
    });

    ws.on('close', () => {
      connectedPeers.delete(currentPeerId);
      broadcastPeerRoster();
    });
  });

  function broadcastPeerRoster() {
    const roster = Array.from(connectedPeers.values()).map((p) => ({
      peerId: p.peerId,
      leasedCitizens: p.leasedCitizens,
    }));
    const payload = JSON.stringify({ type: 'mesh:roster', peers: roster, timestamp: Date.now() });
    for (const peer of connectedPeers.values()) {
      if (peer.ws.readyState === WebSocket.OPEN) {
        peer.ws.send(payload);
      }
    }
  }

  // ============================================================================
  // API: DCA v2.2 DISK ARCHIVE INSPECTION (/api/dca/archive)
  // ============================================================================
  app.get('/api/dca/archive', (_req, res) => {
    try {
      const dcaRoot = path.resolve(process.cwd(), 'development/DCA');
      const dcrsDir = path.join(dcaRoot, 'dcrs');
      const dcrFiles = fs.existsSync(dcrsDir) ? fs.readdirSync(dcrsDir).filter((f) => f.endsWith('.md')).sort() : [];
      const agentsMd = fs.existsSync(path.resolve(process.cwd(), 'AGENTS.md'))
        ? fs.readFileSync(path.resolve(process.cwd(), 'AGENTS.md'), 'utf-8')
        : '';
      res.json({
        status: 'RATIFIED_CONFORMANT',
        dcaVersion: '2.2.43',
        dcrCount: dcrFiles.length,
        dcrFiles,
        agentsMdPreview: agentsMd.slice(0, 1200),
      });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // ============================================================================
  // API: CORTICAL BUS — PACKETIZED MIND-TO-BODY THINKING (/api/cortical/think)
  // ============================================================================
  app.post('/api/cortical/think', async (req, res) => {
    const ai = getGenAIClient();
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY not configured; falling back to local neurosymbolic cortical stub.',
        fallbackToStub: true,
      });
    }

    try {
      const {
        citizenId,
        citizenName,
        occupation,
        jungianStack,
        topVirtues,
        sanityDeterminant,
        currentPosture,
        currentLot,
        weatherSummary,
        recentMemories,
        stimulusType,
        stimulusText,
        availableTargets,
      } = req.body;

      const systemInstruction = `You are the Conscious Cortical Plane (${citizenId}.mind) of ${citizenName} (${occupation}) in Sonder Avenue, a DCA v2.2 neurosymbolic simulation set on Bremerton's Burwell St waterfront.
CRITICAL ARCHITECTURAL RULE (DCR-2.1.17-01 & DCR-2.2.38-04):
You NEVER micromanage skeletal bones or frame ticks. You emit a single high-level CorticalIntentPacket that tells your 10Hz subconscious body daemon (${citizenId}.daemon) WHAT intention to pilot and WHAT to say or think.
- Jungian Cognitive Stack: ${jungianStack}
- Dominant VIA Character Strengths: ${JSON.stringify(topVirtues)}
- Allostatic Sanity Determinant det(S): ${sanityDeterminant}
- Current Posture: ${currentPosture} at ${currentLot} (${weatherSummary})
- Resonant Memories: ${JSON.stringify(recentMemories)}
- Valid spatial/entity targets: ${JSON.stringify(availableTargets)}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Incoming Stimulus [${stimulusType}]: "${stimulusText}". Synthesize your next CorticalIntentPacket.`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              cognitiveThought: {
                type: Type.STRING,
                description: 'Internal first-person reflection written to mind log.',
              },
              spokenDialogue: {
                type: Type.STRING,
                description: 'Concise in-character spoken line displayed in overhead speech bubble.',
              },
              action: {
                type: Type.STRING,
                description: 'One of: NAVIGATE_TO, JOIN_QUEUE, SIT_BENCH, LEAN_WALL, PICKUP_OBJECT, CONVERSE, IDLE_GESTURE',
              },
              targetAddress: {
                type: Type.STRING,
                description: 'Target DCA dot-address slug from availableTargets.',
              },
              postureSynergy: {
                type: Type.STRING,
                description: 'One of: walk-composed, run-brisk, sit-relaxed, lean-casual, jump-joy, slump-exhausted, crossed-arms-skeptical, squat-lift',
              },
              urgencyScalar: {
                type: Type.NUMBER,
                description: 'Urgency between 0.1 and 1.0.',
              },
              virtueSlugAffected: {
                type: Type.STRING,
                description: 'VIA strength slug shifted by this experience (e.g. curiosity, self-regulation, kindness, bravery, humor).',
              },
              virtueDelta: {
                type: Type.NUMBER,
                description: 'Epigenetic shift between -0.06 and +0.06.',
              },
              memorySlug: {
                type: Type.STRING,
                description: 'Lower-kebab-case slug for this episodic memory.',
              },
              memorySummary: {
                type: Type.STRING,
                description: 'One-sentence episodic memory summary.',
              },
              emotionalValence: {
                type: Type.NUMBER,
                description: 'Emotional valence between -1.0 and 1.0.',
              },
            },
            required: [
              'cognitiveThought',
              'spokenDialogue',
              'action',
              'targetAddress',
              'postureSynergy',
              'urgencyScalar',
              'virtueSlugAffected',
              'virtueDelta',
              'memorySlug',
              'memorySummary',
              'emotionalValence',
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ packet: parsed, source: 'cortical.gemini' });
    } catch (err) {
      return res.status(500).json({
        error: String(err),
        fallbackToStub: true,
      });
    }
  });

  // ============================================================================
  // API: DEEPSEEK-FLASH / GEMINI SUBAGENT ORCHESTRATION (/api/cortical/subagent)
  // ============================================================================
  app.post('/api/cortical/subagent', async (req, res) => {
    const ai = getGenAIClient();
    const { taskId, level, domain, address, instruction, parameters } = req.body;

    if (!ai) {
      return res.json({
        status: 'SUCCESS',
        taskId,
        domain,
        address,
        payload: {
          note: 'Local simulated subagent response (GEMINI_API_KEY optional)',
          synthesizedOutput: `Simulated DCA subagent output for ${address} (${domain})`,
          level,
        },
      });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `[DCA_SUBAGENT_CONSTITUTION_START]
Task ID: ${taskId}
Level: ${level}
Domain: ${domain}
Address: ${address}
Parameters: ${JSON.stringify(parameters)}
Instruction: ${instruction}
You are an autonomous subagent bound by DCA v2.2.
Output pure JSON without markdown code fences or conversational text.
[DCA_SUBAGENT_CONSTITUTION_END]`,
      });

      let parsedPayload: any = response.text || '';
      try {
        parsedPayload = JSON.parse(response.text || '{}');
      } catch {
        // Keep string if not strict json
      }

      return res.json({
        status: 'SUCCESS',
        taskId,
        domain,
        address,
        payload: parsedPayload,
      });
    } catch (err) {
      return res.status(500).json({ error: String(err) });
    }
  });

  // ============================================================================
  // API: PROMPT-TO-CITIZEN FACTORY COMPILER (/api/factory/compile-prompt)
  // ============================================================================
  app.post('/api/factory/compile-prompt', async (req, res) => {
    const ai = getGenAIClient();
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY unavailable; using deterministic archetype synthesizer.',
        fallbackToStub: true,
      });
    }

    try {
      const { prompt } = req.body;
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Create a DCA v2.2 citizen manifest for Sonder Avenue based on this description: "${prompt}".
Use lower-kebab-case for citizenSlug. Normalized proportions must be between -0.8 and 0.8.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              citizenSlug: { type: Type.STRING },
              fullName: { type: Type.STRING },
              occupation: { type: Type.STRING },
              biography: { type: Type.STRING },
              jungianStack: { type: Type.STRING },
              voiceCadence: { type: Type.STRING },
              idleHabit: { type: Type.STRING },
              statureHeight: { type: Type.NUMBER },
              shoulderWidth: { type: Type.NUMBER },
              waistWidth: { type: Type.NUMBER },
              limbLength: { type: Type.NUMBER },
              skinToneHex: { type: Type.STRING },
              hairColorHex: { type: Type.STRING },
              torsoColorHex: { type: Type.STRING },
              legColorHex: { type: Type.STRING },
              shoeColorHex: { type: Type.STRING },
              topVirtues: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    slug: { type: Type.STRING },
                    weight: { type: Type.NUMBER },
                  },
                  required: ['slug', 'weight'],
                },
              },
            },
            required: [
              'citizenSlug',
              'fullName',
              'occupation',
              'biography',
              'jungianStack',
              'voiceCadence',
              'idleHabit',
              'statureHeight',
              'shoulderWidth',
              'waistWidth',
              'limbLength',
              'skinToneHex',
              'hairColorHex',
              'torsoColorHex',
              'legColorHex',
              'shoeColorHex',
              'topVirtues',
            ],
          },
        },
      });

      const manifest = JSON.parse(response.text || '{}');
      return res.json({ manifest });
    } catch (err) {
      return res.status(500).json({ error: String(err), fallbackToStub: true });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Sonder Avenue DCA v2.2 Server] Listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
