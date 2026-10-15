/**
 * Zero-Cost WebRTC + BroadcastChannel Peer Compute Lease Coordinator
 * Synchronizes CorticalIntentPacket events, VFS leaf updates, and citizen.[id].daemon
 * compute leases across browser tabs and WebRTC DataChannels without paid services or signups.
 */

import { CorticalIntentPacket, CitizenEntity } from './citizenVfs';

export interface PeerNodeInfo {
  peerId: string;
  leasedCitizens: string[];
  transport: 'local' | 'broadcast-channel' | 'webrtc-datachannel';
  lastSeen: number;
}

export type MeshEventPayload =
  | { type: 'packet:dispatched'; packet: CorticalIntentPacket; fromPeerId: string }
  | { type: 'citizen:updated'; citizen: CitizenEntity; fromPeerId: string }
  | { type: 'weather:changed'; season: 'autumn-57f' | 'winter-35f'; fromPeerId: string }
  | { type: 'lease:rebalance'; peers: Array<{ peerId: string; leasedCitizens: string[] }> };

const FREE_STUN_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export class PeerComputeMesh {
  public readonly localPeerId: string;
  private broadcastChannel: BroadcastChannel | null = null;
  private ws: WebSocket | null = null;
  private rtcPeers = new Map<string, RTCPeerConnection>();
  private dataChannels = new Map<string, RTCDataChannel>();
  private knownPeers = new Map<string, PeerNodeInfo>();
  private onEventCallback: (event: MeshEventPayload) => void;
  private onRosterChangeCallback: (peers: PeerNodeInfo[]) => void;

  constructor(
    onEvent: (event: MeshEventPayload) => void,
    onRosterChange: (peers: PeerNodeInfo[]) => void
  ) {
    this.localPeerId = `node-${Math.random().toString(36).slice(2, 7)}`;
    this.onEventCallback = onEvent;
    this.onRosterChangeCallback = onRosterChange;

    this.knownPeers.set(this.localPeerId, {
      peerId: this.localPeerId,
      leasedCitizens: [],
      transport: 'local',
      lastSeen: Date.now(),
    });

    this.initBroadcastChannel();
    this.initWebSocketSignaling();
  }

  private initBroadcastChannel() {
    if (typeof BroadcastChannel === 'undefined') return;
    try {
      this.broadcastChannel = new BroadcastChannel('sonder_avenue_dca_mesh_v22');
      this.broadcastChannel.onmessage = (ev) => {
        const data = ev.data;
        if (!data || data.fromPeerId === this.localPeerId) return;

        if (data.type === 'peer:heartbeat') {
          this.knownPeers.set(data.fromPeerId, {
            peerId: data.fromPeerId,
            leasedCitizens: data.leasedCitizens || [],
            transport: 'broadcast-channel',
            lastSeen: Date.now(),
          });
          this.emitRoster();
          return;
        }

        this.onEventCallback(data as MeshEventPayload);
      };
    } catch {
      // Ignore if BroadcastChannel is restricted
    }
  }

  private initWebSocketSignaling() {
    if (typeof window === 'undefined') return;
    try {
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${proto}//${window.location.host}/ws/mesh`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.announcePresence([]);
      };

      this.ws.onmessage = async (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'mesh:roster' && Array.isArray(msg.peers)) {
            for (const p of msg.peers) {
              if (p.peerId !== this.localPeerId) {
                this.knownPeers.set(p.peerId, {
                  peerId: p.peerId,
                  leasedCitizens: p.leasedCitizens || [],
                  transport: this.dataChannels.has(p.peerId)
                    ? 'webrtc-datachannel'
                    : 'broadcast-channel',
                  lastSeen: Date.now(),
                });
                if (this.localPeerId < p.peerId && !this.rtcPeers.has(p.peerId)) {
                  await this.initiateWebRtcOffer(p.peerId);
                }
              }
            }
            this.emitRoster();
          } else if (msg.type === 'webrtc:offer' && msg.fromPeerId) {
            await this.handleWebRtcOffer(msg.fromPeerId, msg.sdp);
          } else if (msg.type === 'webrtc:answer' && msg.fromPeerId) {
            const pc = this.rtcPeers.get(msg.fromPeerId);
            if (pc && msg.sdp) {
              await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
            }
          } else if (msg.type === 'webrtc:ice' && msg.fromPeerId) {
            const pc = this.rtcPeers.get(msg.fromPeerId);
            if (pc && msg.candidate) {
              await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
            }
          } else if (msg.fromPeerId && msg.fromPeerId !== this.localPeerId) {
            this.onEventCallback(msg as MeshEventPayload);
          }
        } catch {
          // Ignore signaling parse errors
        }
      };
    } catch {
      // Offline / static host fallback uses BroadcastChannel
    }
  }

  private createPeerConnection(remotePeerId: string): RTCPeerConnection {
    const pc = new RTCPeerConnection({ iceServers: FREE_STUN_SERVERS });
    this.rtcPeers.set(remotePeerId, pc);

    pc.onicecandidate = (ev) => {
      if (ev.candidate && this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(
          JSON.stringify({
            type: 'webrtc:ice',
            targetPeerId: remotePeerId,
            candidate: ev.candidate,
          })
        );
      }
    };

    pc.ondatachannel = (ev) => {
      this.setupDataChannel(remotePeerId, ev.channel);
    };

    return pc;
  }

  private setupDataChannel(remotePeerId: string, channel: RTCDataChannel) {
    this.dataChannels.set(remotePeerId, channel);
    channel.onopen = () => {
      const existing = this.knownPeers.get(remotePeerId);
      if (existing) {
        existing.transport = 'webrtc-datachannel';
        this.emitRoster();
      }
    };
    channel.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data) as MeshEventPayload;
        this.onEventCallback(payload);
      } catch {
        // Ignore
      }
    };
  }

  private async initiateWebRtcOffer(remotePeerId: string) {
    if (typeof RTCPeerConnection === 'undefined') return;
    try {
      const pc = this.createPeerConnection(remotePeerId);
      const dc = pc.createDataChannel('sonder-dca-bus');
      this.setupDataChannel(remotePeerId, dc);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(
          JSON.stringify({
            type: 'webrtc:offer',
            targetPeerId: remotePeerId,
            sdp: offer,
          })
        );
      }
    } catch {
      // Ignore WebRTC setup failure in restricted environments
    }
  }

  private async handleWebRtcOffer(remotePeerId: string, sdp: RTCSessionDescriptionInit) {
    if (typeof RTCPeerConnection === 'undefined') return;
    try {
      const pc = this.createPeerConnection(remotePeerId);
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(
          JSON.stringify({
            type: 'webrtc:answer',
            targetPeerId: remotePeerId,
            sdp: answer,
          })
        );
      }
    } catch {
      // Ignore
    }
  }

  public announcePresence(leasedCitizens: string[]) {
    const self = this.knownPeers.get(this.localPeerId);
    if (self) {
      self.leasedCitizens = leasedCitizens;
      self.lastSeen = Date.now();
    }
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'peer:heartbeat',
        fromPeerId: this.localPeerId,
        leasedCitizens,
      });
    }
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'peer:announce',
          peerId: this.localPeerId,
          leasedCitizens,
        })
      );
    }
    this.emitRoster();
  }

  public broadcastEvent(payload: MeshEventPayload) {
    const serialized = JSON.stringify(payload);
    for (const dc of this.dataChannels.values()) {
      if (dc.readyState === 'open') {
        dc.send(serialized);
      }
    }
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage(payload);
    }
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(serialized);
    }
  }

  private emitRoster() {
    this.onRosterChangeCallback(Array.from(this.knownPeers.values()));
  }

  public dispose() {
    this.broadcastChannel?.close();
    this.ws?.close();
    for (const pc of this.rtcPeers.values()) {
      pc.close();
    }
  }
}
