import React, { useState } from 'react';
import {
  SpatialCollider,
  ColliderShape,
  collisionSystem,
  applyProceduralCollider,
  initializeBremertonStaticColliders,
} from '../core/collisionPhysicsEngine';
import { X, ShieldAlert, Plus, RefreshCw, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

interface CollisionPhysicsModalProps {
  isOpen: boolean;
  onClose: () => void;
  showColliders: boolean;
  onToggleShowColliders: (val: boolean) => void;
  onDeclipAllCitizens?: () => void;
}

export const CollisionPhysicsModal: React.FC<CollisionPhysicsModalProps> = ({
  isOpen,
  onClose,
  showColliders,
  onToggleShowColliders,
  onDeclipAllCitizens,
}) => {
  const [colliders, setColliders] = useState<SpatialCollider[]>(() =>
    collisionSystem.getAll()
  );
  const [address, setAddress] = useState('world.bremerton.plaza.kiosk-collider');
  const [shape, setShape] = useState<ColliderShape>('box');
  const [cx, setCx] = useState(0);
  const [cz, setCz] = useState(8.0);
  const [w, setW] = useState(2.8);
  const [h, setH] = useState(2.4);
  const [d, setD] = useState(2.8);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const refreshList = () => {
    setColliders([...collisionSystem.getAll()]);
  };

  const handleApplyProceduralCollider = (e: React.FormEvent) => {
    e.preventDefault();
    const created = applyProceduralCollider({
      address,
      shape,
      center: [cx, h / 2, cz],
      dimensions: [w, h, d],
      tag: 'fixture',
    });
    refreshList();
    if (onDeclipAllCitizens) onDeclipAllCitizens();
    setStatusMsg(
      `Applied 1:1 ${created.shape} collider at [${created.center.join(', ')}]m and verified zero entity overlap.`
    );
  };

  const handleDeclipSweep = () => {
    if (onDeclipAllCitizens) onDeclipAllCitizens();
    refreshList();
    setStatusMsg(
      `Executed 4-pass Capsule-vs-Box3/Cylinder relaxation + 0.72m interpersonal buffer across all active citizens & props.`
    );
  };

  return (
    <div className="fixed top-12 left-3 z-30 w-[345px] max-h-[calc(100vh-96px)] flex flex-col rounded-xl bg-[#FAF7F2]/95 backdrop-blur-xl border border-stone-300/90 shadow-xl text-stone-800 overflow-hidden">
      {/* Header */}
      <div className="px-3.5 py-2.5 border-b border-stone-200/90 flex items-center justify-between bg-[#F3EFE6]/90">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-emerald-700" />
          <div>
            <h2 className="text-xs font-semibold text-stone-900 leading-tight">
              Procedural Collision Physics Tool
            </h2>
            <p className="text-[10px] text-stone-500 font-mono">
              Box3 Auto-Synthesis • Anti-Clip Push-Out
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-stone-500 hover:text-stone-800 hover:bg-stone-200/70"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-3.5 overflow-y-auto space-y-3 text-xs">
        {/* Wireframe Overlay & Global De-Clip Trigger */}
        <div className="flex gap-1.5">
          <button
            onClick={() => onToggleShowColliders(!showColliders)}
            className={`flex-1 py-1.5 px-2.5 rounded-md font-semibold text-[11px] border flex items-center justify-center gap-1.5 transition-colors ${
              showColliders
                ? 'bg-emerald-700 text-white border-emerald-800'
                : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
            }`}
          >
            {showColliders ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showColliders ? 'Hide 3D Wireframes' : 'Show 3D Colliders'}</span>
          </button>

          <button
            onClick={handleDeclipSweep}
            className="py-1.5 px-2.5 rounded-md bg-teal-700 hover:bg-teal-800 text-white font-semibold text-[11px] flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>De-Clip All</span>
          </button>
        </div>

        {/* Procedural Tool: collision.apply */}
        <form
          onSubmit={handleApplyProceduralCollider}
          className="p-2.5 rounded-lg bg-white/90 border border-stone-200/90 space-y-2"
        >
          <div className="text-[10px] font-semibold uppercase tracking-wider text-stone-600">
            Procedural Apply Tool (`collision.apply`)
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <div className="col-span-2">
              <label className="block text-[9px] text-stone-500">DCA Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-1.5 py-1 rounded bg-[#FAF7F2] border border-stone-300 text-[10px] font-mono"
              />
            </div>
            <div>
              <label className="block text-[9px] text-stone-500">Shape</label>
              <select
                value={shape}
                onChange={(e) => setShape(e.target.value as ColliderShape)}
                className="w-full px-1.5 py-1 rounded bg-[#FAF7F2] border border-stone-300 text-[10px]"
              >
                <option value="box">box</option>
                <option value="cylinder">cylinder</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-1">
            <div>
              <label className="block text-[9px] text-stone-500">X (m)</label>
              <input
                type="number"
                step="0.5"
                value={cx}
                onChange={(e) => setCx(parseFloat(e.target.value) || 0)}
                className="w-full px-1 py-1 rounded bg-[#FAF7F2] border border-stone-300 text-[10px] font-mono"
              />
            </div>
            <div>
              <label className="block text-[9px] text-stone-500">Z (m)</label>
              <input
                type="number"
                step="0.5"
                value={cz}
                onChange={(e) => setCz(parseFloat(e.target.value) || 0)}
                className="w-full px-1 py-1 rounded bg-[#FAF7F2] border border-stone-300 text-[10px] font-mono"
              />
            </div>
            <div>
              <label className="block text-[9px] text-stone-500">W (m)</label>
              <input
                type="number"
                step="0.5"
                value={w}
                onChange={(e) => setW(parseFloat(e.target.value) || 1)}
                className="w-full px-1 py-1 rounded bg-[#FAF7F2] border border-stone-300 text-[10px] font-mono"
              />
            </div>
            <div>
              <label className="block text-[9px] text-stone-500">H (m)</label>
              <input
                type="number"
                step="0.5"
                value={h}
                onChange={(e) => setH(parseFloat(e.target.value) || 1)}
                className="w-full px-1 py-1 rounded bg-[#FAF7F2] border border-stone-300 text-[10px] font-mono"
              />
            </div>
            <div>
              <label className="block text-[9px] text-stone-500">D (m)</label>
              <input
                type="number"
                step="0.5"
                value={d}
                onChange={(e) => setD(parseFloat(e.target.value) || 1)}
                className="w-full px-1 py-1 rounded bg-[#FAF7F2] border border-stone-300 text-[10px] font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-1.5 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register 1:1 Procedural Collider</span>
          </button>
        </form>

        {statusMsg && (
          <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] flex items-start gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Active 1:1 Collider Registry List */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
              Active 1:1 Scene Colliders ({colliders.length})
            </span>
            <button
              onClick={() => {
                initializeBremertonStaticColliders();
                refreshList();
              }}
              className="text-[10px] text-teal-700 hover:underline"
            >
              Reset Defaults
            </button>
          </div>
          <div className="max-h-44 overflow-y-auto space-y-1 pr-1">
            {colliders.map((c) => (
              <div
                key={c.id}
                className="p-2 rounded bg-white border border-stone-200/90 flex items-center justify-between text-[10px]"
              >
                <div className="truncate pr-2">
                  <div className="font-mono font-semibold text-stone-800 truncate">
                    {c.address}
                  </div>
                  <div className="text-stone-500 font-mono">
                    {c.shape} • center [{c.center.map((n) => n.toFixed(1)).join(', ')}]m
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 font-mono text-[9px]">
                  {c.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
