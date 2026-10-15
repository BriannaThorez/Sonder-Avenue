import React from 'react';
import { CitizenEntity } from '../core/citizenVfs';
import { VIA_VIRTUE_DEFINITIONS } from '../core/personaCalculus';
import { Brain, Activity, X } from 'lucide-react';

interface PersonaCalculusPanelProps {
  citizen: CitizenEntity;
  weatherTempF: number;
  onUpdateVirtueWeight: (virtueSlug: string, newWeight: number) => void;
  onClose?: () => void;
}

export const PersonaCalculusPanel: React.FC<PersonaCalculusPanelProps> = ({
  citizen,
  onUpdateVirtueWeight,
  onClose,
}) => {
  const topVirtues = [...VIA_VIRTUE_DEFINITIONS]
    .map((d) => ({
      ...d,
      weight: citizen.virtueWeights[d.slug] ?? 0.5,
    }))
    .sort((a, b) => b.weight - a.weight);

  return (
    <div className="fixed top-12 right-3 z-30 w-[330px] max-h-[calc(100vh-64px)] flex flex-col rounded-xl bg-[#FAF7F2]/94 backdrop-blur-xl border border-stone-300/90 shadow-xl text-stone-800 overflow-hidden">
      <div className="px-3.5 py-2.5 border-b border-stone-200/90 bg-[#F3EFE6]/90 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-teal-700" />
          <div>
            <h2 className="text-xs font-semibold text-stone-900 leading-tight">
              Persona Calculus (S²³ Hypersphere)
            </h2>
            <p className="text-[10px] text-stone-500 font-mono">
              {citizen.fullName} • Gate: {citizen.jungianFunction}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-md text-stone-500 hover:text-stone-800 hover:bg-stone-200/70"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="p-3.5 overflow-y-auto space-y-3 text-xs">
        {/* Somatic Homeostasis & Stress Operator S_hat */}
        <div className="p-2.5 rounded-lg bg-white/90 border border-stone-200/90 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1">
              <Activity className="w-3 h-3 text-teal-700" />
              <span>Somatic Drives & Stress Operator Ŝ</span>
            </span>
            <span className="font-mono text-[10px] font-semibold text-teal-800">
              det(Ŝ)={citizen.stressState.sanityDeterminant.toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            <div className="p-1.5 rounded bg-[#FAF7F2] border border-stone-200/70 flex justify-between">
              <span className="text-stone-600">Energy</span>
              <span className="font-mono font-semibold text-stone-900">
                {(citizen.drives.metabolicEnergy * 100).toFixed(0)}%
              </span>
            </div>
            <div className="p-1.5 rounded bg-[#FAF7F2] border border-stone-200/70 flex justify-between">
              <span className="text-stone-600">Thermal</span>
              <span className="font-mono font-semibold text-stone-900">
                {(citizen.drives.thermalComfort * 100).toFixed(0)}%
              </span>
            </div>
            <div className="p-1.5 rounded bg-[#FAF7F2] border border-stone-200/70 flex justify-between">
              <span className="text-stone-600">Social</span>
              <span className="font-mono font-semibold text-stone-900">
                {(citizen.drives.socialEquilibrium * 100).toFixed(0)}%
              </span>
            </div>
            <div className="p-1.5 rounded bg-[#FAF7F2] border border-stone-200/70 flex justify-between">
              <span className="text-stone-600">Fatigue</span>
              <span className="font-mono font-semibold text-stone-900">
                {(citizen.drives.muscularFatigue * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* 24 VIA Virtues S^23 Sliders */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
              24 VIA Character Strengths (‖Ψ‖ = 1)
            </span>
          </div>
          <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
            {topVirtues.map((v) => (
              <div
                key={v.slug}
                className="p-1.5 rounded bg-white border border-stone-200/80 space-y-0.5"
              >
                <div className="flex justify-between text-[10px]">
                  <span className="font-medium text-stone-800">{v.label}</span>
                  <span className="font-mono text-teal-700 font-semibold">
                    {v.weight.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={0.98}
                  step={0.02}
                  value={v.weight}
                  onChange={(e) =>
                    onUpdateVirtueWeight(v.slug, parseFloat(e.target.value))
                  }
                  className="w-full h-1.5 accent-teal-700 bg-stone-200 rounded-lg cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
