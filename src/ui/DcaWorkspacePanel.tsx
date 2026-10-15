import React, { useState } from 'react';
import {
  CitizenEntity,
  listCitizenVfsAddresses,
  readCitizenVfsDocument,
} from '../core/citizenVfs';
import {
  INSTRUCTION_AUDIT_LEDGER,
  CHIEF_QA_3_LAYER_SKILL_SPEC,
  invokeChiefQaProgressiveSkill,
  ChiefQaProgressiveReport,
  dispatchSubagentTask,
  SubagentTaskResult,
} from '../core/deepseekOrchestrator';
import { FolderTree, CheckCircle2, Cpu, ShieldCheck, X, Play } from 'lucide-react';

interface DcaWorkspacePanelProps {
  citizen: CitizenEntity;
  onClose?: () => void;
}

export const DcaWorkspacePanel: React.FC<DcaWorkspacePanelProps> = ({
  citizen,
  onClose,
}) => {
  const [tab, setTab] = useState<'qa' | 'audit' | 'vfs'>('qa');
  const addresses = listCitizenVfsAddresses(citizen);
  const [selectedAddr, setSelectedAddr] = useState<string>(addresses[0] || '');
  const [qaReport, setQaReport] = useState<ChiefQaProgressiveReport>(() =>
    invokeChiefQaProgressiveSkill(3)
  );
  const [subagentResult, setSubagentResult] = useState<SubagentTaskResult | null>(
    null
  );
  const [runningAgent, setRunningAgent] = useState(false);

  const doc = selectedAddr ? readCitizenVfsDocument(citizen, selectedAddr) : null;

  const handleInvokeQaLayer = (layer: 1 | 2 | 3) => {
    const report = invokeChiefQaProgressiveSkill(layer);
    setQaReport(report);
  };

  const handleRunDeepSeekAudit = async (
    domain: 'chief-qa' | 'body' | 'world'
  ) => {
    setRunningAgent(true);
    const res = await dispatchSubagentTask({
      taskId: `ds-v41-${Date.now().toString().slice(-4)}`,
      level: 3,
      domain,
      contextAddress:
        domain === 'body'
          ? `${citizen.id}.body.Torso.waist-joint`
          : 'world.bremerton.block-02.plot-240-burwell',
      instruction: `Execute DeepSeek-Flash v4.1 Chief Code QA 3-Layer Progressive Skill in ${domain} domain.`,
    });
    setSubagentResult(res);
    setRunningAgent(false);
  };

  return (
    <div className="fixed top-12 right-3 z-30 w-[385px] max-h-[calc(100vh-64px)] flex flex-col rounded-xl bg-[#FAF7F2]/95 backdrop-blur-xl border border-stone-300/90 shadow-xl text-stone-800 overflow-hidden">
      {/* Header */}
      <div className="px-3.5 py-2.5 border-b border-stone-200/90 bg-[#F3EFE6]/90 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-teal-700" />
          <div>
            <h2 className="text-xs font-semibold text-stone-900 leading-tight">
              DeepSeek-Flash v4.1 Chief Code QA
            </h2>
            <p className="text-[10px] text-stone-500 font-mono">
              DCA.Agent.DeepSeekFlash-v4_1.chief-code-qa • 3-Layer Skill
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

      {/* Tabs */}
      <div className="px-3 pt-2 flex gap-1 border-b border-stone-200/80 bg-[#FAF7F2]">
        <button
          onClick={() => setTab('qa')}
          className={`flex-1 pb-2 text-[10px] font-semibold border-b-2 transition-colors flex items-center justify-center gap-1 ${
            tab === 'qa'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <ShieldCheck className="w-3 h-3" />
          <span>3-Layer QA Skill</span>
        </button>
        <button
          onClick={() => setTab('audit')}
          className={`flex-1 pb-2 text-[10px] font-semibold border-b-2 transition-colors flex items-center justify-center gap-1 ${
            tab === 'audit'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <CheckCircle2 className="w-3 h-3" />
          <span>Audit Ledger</span>
        </button>
        <button
          onClick={() => setTab('vfs')}
          className={`flex-1 pb-2 text-[10px] font-semibold border-b-2 transition-colors flex items-center justify-center gap-1 ${
            tab === 'vfs'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <FolderTree className="w-3 h-3" />
          <span>VFS ({addresses.length})</span>
        </button>
      </div>

      <div className="p-3.5 overflow-y-auto space-y-3 text-xs">
        {tab === 'qa' && (
          <>
            {/* 3-Layer Progressive Disclosure Skill Selector */}
            <div className="p-2.5 rounded-lg bg-white border border-stone-200/90 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-800">
                  Invoke 3-Layer Progressive Disclosure QA
                </span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                  {qaReport.overallComplianceScore}% PASS
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {CHIEF_QA_3_LAYER_SKILL_SPEC.map((spec) => (
                  <button
                    key={spec.layerNumber}
                    onClick={() => handleInvokeQaLayer(spec.layerNumber)}
                    className={`py-1.5 px-2 rounded text-[10px] font-semibold border transition-all ${
                      qaReport.invokedLayer === spec.layerNumber
                        ? 'bg-teal-700 text-white border-teal-800 shadow-xs'
                        : 'bg-[#FAF7F2] text-stone-700 border-stone-300 hover:bg-stone-200/70'
                    }`}
                  >
                    Layer {spec.layerNumber}
                  </button>
                ))}
              </div>

              <div className="p-2 rounded bg-[#FAF7F2] border border-stone-200/80 text-[10px] font-mono text-stone-700">
                {qaReport.executiveVerdict}
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {qaReport.checks.map((chk) => (
                  <div
                    key={chk.checkAddress}
                    className="p-2 rounded bg-[#FAF7F2] border border-stone-200/80 space-y-0.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-semibold text-teal-800">
                        {chk.checkAddress}
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                        {chk.metric}
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-600 leading-snug">
                      {chk.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Ontology Bus Sample Addresses */}
            <div className="p-2.5 rounded-lg bg-white border border-stone-200/90 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                  Live Ontology Bus ({qaReport.totalAddressesAudited} Addresses)
                </span>
                <button
                  onClick={() => handleRunDeepSeekAudit('chief-qa')}
                  disabled={runningAgent}
                  className="px-2 py-0.5 rounded bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-semibold flex items-center gap-1"
                >
                  <Play className="w-2.5 h-2.5" />
                  <span>Run Subagent</span>
                </button>
              </div>
              <div className="max-h-28 overflow-y-auto space-y-0.5 font-mono text-[9px] text-stone-700 bg-[#FAF7F2] p-2 rounded border border-stone-200/80">
                {qaReport.sampleCanonicalAddresses.map((addr) => (
                  <div key={addr} className="truncate">
                    • {addr}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === 'audit' && (
          <div className="space-y-2">
            {subagentResult && (
              <div className="p-2.5 rounded-lg bg-white border border-teal-600/40 space-y-1">
                <div className="font-mono text-[10px] font-semibold text-teal-800">
                  Subagent Task: {subagentResult.taskId} ({subagentResult.status})
                </div>
                {subagentResult.auditLog.map((log, idx) => (
                  <div key={idx} className="text-[10px] font-mono text-stone-600">
                    {log}
                  </div>
                ))}
              </div>
            )}
            {INSTRUCTION_AUDIT_LEDGER.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-lg bg-white border border-stone-200/90 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[11px] text-stone-900">
                    {item.instructionTitle}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px] font-semibold">
                    {item.status}
                  </span>
                </div>
                <div className="font-mono text-[9px] text-teal-800">
                  {item.dcaAddress}
                </div>
                <p className="text-[10px] text-stone-600 leading-snug">
                  {item.remediationApplied}
                </p>
              </div>
            ))}
          </div>
        )}

        {tab === 'vfs' && (
          <div className="space-y-2">
            <select
              value={selectedAddr}
              onChange={(e) => setSelectedAddr(e.target.value)}
              className="w-full px-2 py-1.5 rounded bg-white border border-stone-300 font-mono text-[10px]"
            >
              {addresses.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            {doc && (
              <pre className="p-2.5 rounded-lg bg-white border border-stone-200/90 font-mono text-[10px] text-stone-700 whitespace-pre-wrap max-h-72 overflow-y-auto">
                {doc}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
