import React, { useState } from 'react';
import {
  CitizenEntity,
  BREMERTON_SMART_TARGETS,
} from '../core/citizenVfs';
import { MessageSquare, Send, Sparkles, Compass } from 'lucide-react';

interface SmartChatPanelProps {
  citizen: CitizenEntity;
  allCitizens: CitizenEntity[];
  onSelectCitizen: (id: string) => void;
  onDispatchStimulus: (params: {
    citizenId: string;
    stimulusType: 'player.whisper' | 'player.chat';
    text: string;
    preferredTargetAddress?: string;
    useLiveGemini: boolean;
  }) => Promise<void>;
  couplingLogs: Array<{
    id: string;
    citizenA: string;
    citizenB: string;
    omega: number;
    classification: string;
    summary: string;
    timestamp: number;
  }>;
  isPinned: boolean;
  onTogglePin: () => void;
}

export const SmartChatPanel: React.FC<SmartChatPanelProps> = ({
  citizen,
  allCitizens,
  onSelectCitizen,
  onDispatchStimulus,
  couplingLogs,
  isPinned,
  onTogglePin,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [text, setText] = useState('');
  const [mode, setMode] = useState<'player.chat' | 'player.whisper'>('player.chat');
  const [useLiveGemini, setUseLiveGemini] = useState(false);

  const isExpanded = isPinned || isHovered;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const msg = text.trim();
    setText('');
    await onDispatchStimulus({
      citizenId: citizen.id,
      stimulusType: mode,
      text: msg,
      useLiveGemini,
    });
  };

  const handleQuickDirective = async (targetAddress: string, label: string) => {
    await onDispatchStimulus({
      citizenId: citizen.id,
      stimulusType: 'player.whisper',
      text: `Head over to ${label}`,
      preferredTargetAddress: targetAddress,
      useLiveGemini,
    });
  };

  const latestPacket = citizen.packetHistory[0];
  const previewLine =
    citizen.activeSpeechBubble ||
    latestPacket?.spokenDialogue ||
    citizen.lastCognitiveThought ||
    'Hover to converse or issue directives...';

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed bottom-3 right-3 z-30 w-[348px] flex flex-col rounded-xl bg-[#FAF7F2]/96 backdrop-blur-xl border transition-all duration-200 shadow-xl text-stone-800 ${
        isPinned
          ? 'border-amber-600/70 ring-1 ring-amber-500/30'
          : isHovered
          ? 'border-teal-600/60'
          : 'border-stone-300/90 hover:border-teal-600/50'
      }`}
    >
      {/* Top Header Bar (Always Visible in both Collapsed & Expanded states) */}
      <div
        className={`px-3 py-2 bg-[#F3EFE6]/95 flex items-center justify-between gap-2 rounded-t-xl ${
          isExpanded ? 'border-b border-stone-200/90' : 'rounded-b-xl'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="relative shrink-0">
            <MessageSquare className="w-3.5 h-3.5 text-teal-700" />
            <span
              className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${
                citizen.isCorticalThinking ? 'bg-amber-500 animate-ping' : 'bg-emerald-600'
              }`}
            />
          </div>

          {isExpanded ? (
            <select
              value={citizen.id}
              onChange={(e) => onSelectCitizen(e.target.value)}
              aria-label="Select Active Citizen"
              className="bg-transparent font-semibold text-xs text-stone-900 focus:outline-none cursor-pointer truncate max-w-[185px]"
            >
              {allCitizens.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} — {c.occupation}
                </option>
              ))}
            </select>
          ) : (
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-xs text-stone-900 truncate">
                  {citizen.fullName}
                </span>
                <span className="text-[10px] text-stone-500 truncate">
                  · {citizen.occupation}
                </span>
              </div>
              <div className="text-[10px] text-stone-600 truncate italic">
                {previewLine}
              </div>
            </div>
          )}
        </div>

        {/* Upper-Right Controls: Mode Toggle (when expanded) + Icon-Only Thumbtack Pin with Tooltip */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isExpanded && (
            <button
              type="button"
              onClick={() => setUseLiveGemini((v) => !v)}
              title={
                useLiveGemini
                  ? 'Using Live Gemini Cortical Bus (Click for 0ms Local Reflex)'
                  : 'Using 0ms Local Neurosymbolic Bus (Click for Live Gemini)'
              }
              className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold border transition-colors ${
                useLiveGemini
                  ? 'bg-amber-600 text-white border-amber-700'
                  : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-100'
              }`}
            >
              {useLiveGemini ? 'Gemini Live' : 'Local 0ms'}
            </button>
          )}

          {/* Upper-Right Thumbtack Icon Button (Just an Icon with Tooltip) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin();
            }}
            title={
              isPinned
                ? 'Unpin Chat (Auto-Collapse When Mouse Leaves)'
                : 'Pin Chat Open'
            }
            aria-label={
              isPinned
                ? 'Unpin Chat (Auto-Collapse When Mouse Leaves)'
                : 'Pin Chat Open'
            }
            className={`group relative w-6 h-6 rounded-md flex items-center justify-center transition-all ${
              isPinned
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/80'
            }`}
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform ${
                isPinned ? 'rotate-0' : 'rotate-45'
              }`}
              viewBox="0 0 24 24"
              fill={isPinned ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 17v5" />
              <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
            </svg>
            <span className="pointer-events-none absolute bottom-full mb-1.5 right-0 px-2 py-1 rounded-md bg-stone-900/95 text-[#FAF7F2] text-[10px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-50">
              {isPinned
                ? 'Unpin Chat (Auto-Collapse on Leave)'
                : 'Pin Chat Open'}
            </span>
          </button>
        </div>
      </div>

      {/* Pop-Open Body (Visible on Hover or when Thumbtack is Pinned) */}
      {isExpanded && (
        <>
          {/* Quick 1:1 Destination Directives */}
          <div className="px-2.5 py-1.5 bg-[#FAF7F2] border-b border-stone-200/80 flex items-center gap-1 overflow-x-auto no-scrollbar">
            <Compass className="w-3 h-3 text-stone-400 shrink-0 mr-0.5" />
            {BREMERTON_SMART_TARGETS.map((t) => (
              <button
                key={t.address}
                type="button"
                onClick={() => handleQuickDirective(t.address, t.label)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap border transition-colors ${
                  citizen.targetAddress === t.address
                    ? 'bg-teal-700 text-white border-teal-800'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {t.label.split(' (')[0]}
              </button>
            ))}
          </div>

          {/* Stream of Consciousness & Dialogue History */}
          <div className="p-2.5 max-h-[235px] overflow-y-auto space-y-1.5 text-[11px] bg-white/65">
            {citizen.packetHistory.length === 0 ? (
              <div className="p-2.5 rounded-lg bg-white border border-stone-200/80 text-[11px] text-stone-600 space-y-1">
                <div className="font-medium text-stone-800">
                  “{citizen.activeSpeechBubble || 'Taking in the Bremerton waterfront breeze.'}”
                </div>
                <div className="text-[10px] text-stone-500 italic">
                  {citizen.lastCognitiveThought}
                </div>
              </div>
            ) : (
              citizen.packetHistory.slice(0, 6).map((pkt) => (
                <div
                  key={pkt.packetId}
                  className="p-2 rounded-lg bg-white border border-stone-200/90 shadow-2xs space-y-0.5"
                >
                  <div className="flex items-center justify-between text-[9px] font-mono text-stone-500">
                    <span>
                      {pkt.motorDirective.action} · {pkt.motorDirective.postureSynergy}
                    </span>
                    <span>{pkt.source}</span>
                  </div>
                  {pkt.spokenDialogue && (
                    <div className="font-medium text-stone-900">
                      “{pkt.spokenDialogue}”
                    </div>
                  )}
                  <div className="text-[10px] text-stone-600 italic">
                    {pkt.cognitiveThought}
                  </div>
                </div>
              ))
            )}

            {couplingLogs.slice(0, 2).map((log) => (
              <div
                key={log.id}
                className="p-1.5 rounded bg-amber-50/90 border border-amber-200/80 text-[10px] text-amber-950"
              >
                <span className="font-semibold">
                  Synaptic Coupling Ω={log.omega.toFixed(2)}:
                </span>{' '}
                {log.summary}
              </div>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleSubmit}
            className="p-2 border-t border-stone-200/90 bg-[#F3EFE6]/95 rounded-b-xl flex items-center gap-1.5"
          >
            <button
              type="button"
              onClick={() =>
                setMode((m) =>
                  m === 'player.chat' ? 'player.whisper' : 'player.chat'
                )
              }
              title={
                mode === 'player.whisper'
                  ? 'Subconscious Whisper Mode (Direct Intent)'
                  : 'Direct Conversation Mode'
              }
              className={`px-2 py-1 rounded text-[10px] font-semibold border shrink-0 transition-colors ${
                mode === 'player.whisper'
                  ? 'bg-amber-600 text-white border-amber-700'
                  : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
              }`}
            >
              {mode === 'player.whisper' ? 'Whisper' : 'Speak'}
            </button>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Converse or whisper to ${citizen.fullName.split(' ')[0]}...`}
              className="flex-1 px-2.5 py-1 rounded bg-white border border-stone-300 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-teal-600"
            />
            <button
              type="submit"
              disabled={citizen.isCorticalThinking}
              title="Send Stimulus to Citizen"
              className="p-1.5 rounded bg-teal-700 hover:bg-teal-800 text-white transition-colors"
            >
              {citizen.isCorticalThinking ? (
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
            </button>
          </form>
        </>
      )}
    </div>
  );
};
