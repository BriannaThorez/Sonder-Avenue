import React, { useState } from 'react';
import {
  CitizenEntity,
  BREMERTON_SMART_TARGETS,
} from '../core/citizenVfs';
import { MessageSquare, Send, Sparkles, Compass, X } from 'lucide-react';

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
  isOpen?: boolean;
  onClose?: () => void;
}

export const SmartChatPanel: React.FC<SmartChatPanelProps> = ({
  citizen,
  allCitizens,
  onSelectCitizen,
  onDispatchStimulus,
  couplingLogs,
  isOpen = true,
  onClose,
}) => {
  const [text, setText] = useState('');
  const [mode, setMode] = useState<'player.chat' | 'player.whisper'>('player.chat');
  const [useLiveGemini, setUseLiveGemini] = useState(false);

  if (!isOpen) return null;

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

  return (
    <div className="fixed bottom-3 right-3 z-20 w-[335px] max-h-[370px] flex flex-col rounded-xl bg-[#FAF7F2]/94 backdrop-blur-xl border border-stone-300/90 shadow-xl text-stone-800 overflow-hidden">
      {/* Compact Header */}
      <div className="px-3 py-2 border-b border-stone-200/90 bg-[#F3EFE6]/90 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-3.5 h-3.5 text-teal-700" />
          <select
            value={citizen.id}
            onChange={(e) => onSelectCitizen(e.target.value)}
            className="bg-transparent font-semibold text-xs text-stone-900 focus:outline-none cursor-pointer"
          >
            {allCitizens.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName} — {c.occupation}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setUseLiveGemini((v) => !v)}
            title="Toggle Live Gemini Cortical Bus vs Zero-Latency Neurosymbolic Stub"
            className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold border transition-colors ${
              useLiveGemini
                ? 'bg-amber-600 text-white border-amber-700'
                : 'bg-white text-stone-600 border-stone-300'
            }`}
          >
            {useLiveGemini ? 'Gemini Live' : 'Local 0ms'}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded text-stone-500 hover:text-stone-800 hover:bg-stone-200/60"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Quick 1:1 Destination Chips */}
      <div className="px-2.5 py-1.5 bg-[#FAF7F2] border-b border-stone-200/80 flex items-center gap-1 overflow-x-auto no-scrollbar">
        <Compass className="w-3 h-3 text-stone-400 shrink-0 mr-0.5" />
        {BREMERTON_SMART_TARGETS.map((t) => (
          <button
            key={t.address}
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
      <div className="flex-1 p-2.5 overflow-y-auto space-y-1.5 text-[11px] bg-white/60">
        {citizen.packetHistory.slice(0, 6).map((pkt) => (
          <div
            key={pkt.packetId}
            className="p-2 rounded-lg bg-white border border-stone-200/90 shadow-2xs space-y-0.5"
          >
            <div className="flex items-center justify-between text-[9px] font-mono text-stone-400">
              <span>{pkt.motorDirective.action} → {pkt.motorDirective.postureSynergy}</span>
              <span>{pkt.source}</span>
            </div>
            {pkt.spokenDialogue && (
              <div className="font-medium text-stone-900">“{pkt.spokenDialogue}”</div>
            )}
            <div className="text-[10px] text-stone-600 italic">{pkt.cognitiveThought}</div>
          </div>
        ))}

        {couplingLogs.slice(0, 2).map((log) => (
          <div
            key={log.id}
            className="p-1.5 rounded bg-amber-50/90 border border-amber-200/80 text-[10px] text-amber-950"
          >
            <span className="font-semibold">Synaptic Ω={log.omega.toFixed(2)}:</span>{' '}
            {log.summary}
          </div>
        ))}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={handleSubmit}
        className="p-2 border-t border-stone-200/90 bg-[#F3EFE6]/90 flex items-center gap-1.5"
      >
        <button
          type="button"
          onClick={() =>
            setMode((m) => (m === 'player.chat' ? 'player.whisper' : 'player.chat'))
          }
          className={`px-2 py-1 rounded text-[10px] font-semibold border shrink-0 ${
            mode === 'player.whisper'
              ? 'bg-amber-600 text-white border-amber-700'
              : 'bg-white text-stone-700 border-stone-300'
          }`}
        >
          {mode === 'player.whisper' ? 'Whisper' : 'Speak'}
        </button>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Direct or converse with ${citizen.fullName.split(' ')[0]}...`}
          className="flex-1 px-2.5 py-1 rounded bg-white border border-stone-300 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-teal-600"
        />
        <button
          type="submit"
          disabled={citizen.isCorticalThinking}
          className="p-1.5 rounded bg-teal-700 hover:bg-teal-800 text-white transition-colors"
        >
          {citizen.isCorticalThinking ? (
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
        </button>
      </form>
    </div>
  );
};
