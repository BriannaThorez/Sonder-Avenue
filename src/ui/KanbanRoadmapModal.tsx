import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Plus, CheckCircle2, Sparkles } from 'lucide-react';

export type KanbanColumnId = 'discovery' | 'spec' | 'active';

export interface KanbanRoadmapCard {
  id: string;
  column: KanbanColumnId;
  domainSlug: string;
  title: string;
  questionPrompt: string;
  technicalBlueprint: string;
  priority: 'P0-CORE' | 'P1-HIGH' | 'P2-NEXT';
}

const INITIAL_ROADMAP_CARDS: KanbanRoadmapCard[] = [
  {
    id: 'roadmap-room-zoning-tags',
    column: 'discovery',
    domainSlug: 'citizen.[id].daemon.spatial-zone-sensor',
    title: 'Room Zoning Tags for LLM Agent Reflexive Harnesses',
    questionPrompt:
      'Should we map out how the room zoning tags should be passed to your LLM agents so their reflexive body harness understands what space they are standing in (e.g., "kitchen", "street")?',
    technicalBlueprint:
      'Bind Module B (BspFloorplanner) BspRoomCell.zoneTag ("kitchen", "corridor", "stairwell", "studio-loft", "cafe-roastery", "street") into the 10Hz somatic point-in-AABB lookup and inject `current_zone_tag` into CorticalIntentPacket & citizen.[id].daemon.heartbeat.',
    priority: 'P0-CORE',
  },
  {
    id: 'roadmap-stepped-stories-setbacks',
    column: 'discovery',
    domainSlug: 'world.bremerton.grammar.stepped-setbacks',
    title: 'Stepped Stories & Architectural Setbacks Rulebook',
    questionPrompt:
      'Do you want to outline how the system should handle stepped stories and setbacks for architectural variety?',
    technicalBlueprint:
      'Extend Module A (STYLE_RULE_DICTIONARY) with per-tier setback schedules (`setbackStartStory`, `setbackDepthMeters`, `cantileverOverhangMeters`, and rooftop terrace balustrades) so upper floors step back automatically while preserving structural column alignment.',
    priority: 'P0-CORE',
  },
  {
    id: 'roadmap-stairwell-vertical-pathing',
    column: 'discovery',
    domainSlug: 'world.bremerton.navmesh.vertical-stairwells',
    title: 'Stairwell Placement & Multi-Floor Vertical Connectivity',
    questionPrompt:
      'Would you like to detail the rulebook for stairwell placement and multi-floor path connectivity so characters can traverse vertical spaces?',
    technicalBlueprint:
      'Link `BspStoryPlan.stairwellCell` portals across stories (s -> s+1) as 3D nav-graph vertical edges (`[x, elevationY, z] -> [x, elevationY + storyH, z]`) so the 10Hz reflexive daemon smoothly interpolates character Y-elevation and knee-lift climb phase up/down stairs.',
    priority: 'P0-CORE',
  },
  {
    id: 'roadmap-4stage-shape-grammar',
    column: 'active',
    domainSlug: 'SYSTEM.Architecture.ShapeGrammar.r186',
    title: '4-Stage Generative Shape Grammar & BSP Engine',
    questionPrompt:
      'Operational pipeline translating domain-specific dot notation into nested geometric components on the fly.',
    technicalBlueprint:
      '1. Grammar Parser (Module A Codebook) -> 2. Spatial Splitting (Module B BSP Floorplanner) -> 3. Subtractive Matrix (Module C Hole Puncher) -> 4. Batched Assembly (Module D r186 InstancedMesh + Master TSL Shader).',
    priority: 'P0-CORE',
  },
];

interface KanbanRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KanbanRoadmapModal: React.FC<KanbanRoadmapModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [cards, setCards] = useState<KanbanRoadmapCard[]>(INITIAL_ROADMAP_CARDS);
  const [newTitle, setNewTitle] = useState('');
  const [newPrompt, setNewPrompt] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  if (!isOpen) return null;

  const moveCard = (cardId: string, dir: -1 | 1) => {
    const order: KanbanColumnId[] = ['discovery', 'spec', 'active'];
    setCards((prev) =>
      prev.map((c) => {
        if (c.id !== cardId) return c;
        const idx = order.indexOf(c.column);
        const nextIdx = Math.max(0, Math.min(order.length - 1, idx + dir));
        return { ...c, column: order[nextIdx] };
      })
    );
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPrompt.trim()) return;
    const added: KanbanRoadmapCard = {
      id: `roadmap-custom-${Date.now().toString().slice(-4)}`,
      column: 'discovery',
      domainSlug: `world.bremerton.grammar.custom-${Date.now().toString().slice(-3)}`,
      title: newTitle.trim(),
      questionPrompt: newPrompt.trim(),
      technicalBlueprint:
        'Queued for Generative Shape Grammar Engine (Modules A–D) & Three.js r186 Instanced Fabricator.',
      priority: 'P1-HIGH',
    };
    setCards((prev) => [added, ...prev]);
    setNewTitle('');
    setNewPrompt('');
    setShowAddForm(false);
  };

  const columns: Array<{
    id: KanbanColumnId;
    title: string;
    subtitle: string;
    badgeBg: string;
  }> = [
    {
      id: 'discovery',
      title: '1. Specialization & Discovery',
      subtitle: 'Next Architectural Decisions & Questions',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    },
    {
      id: 'spec',
      title: '2. Rulebook & BSP Spec',
      subtitle: 'Tokenized Grammar & Nav-Graph Schema',
      badgeBg: 'bg-sky-100 text-sky-900 border-sky-300',
    },
    {
      id: 'active',
      title: '3. Active in r186 Engine',
      subtitle: 'Compiled to InstancedMesh & TSL Shaders',
      badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    },
  ];

  return (
    <div className="fixed inset-x-4 top-13 bottom-4 z-40 max-w-5xl mx-auto flex flex-col rounded-2xl bg-[#FAF7F2]/96 backdrop-blur-xl border border-stone-300/90 shadow-2xl text-stone-800 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-stone-200/90 bg-[#F3EFE6]/95 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-teal-700 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-stone-900 leading-tight">
              Generative Shape Grammar & Autonomous Simulation Kanban Roadmap
            </h2>
            <p className="text-[11px] text-stone-600 font-mono">
              SYSTEM.Architecture.ShapeGrammar.roadmap • Three.js r186 Meta-Agent Specialization
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddForm((v) => !v)}
            className="px-2.5 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Roadmap Item</span>
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200/70 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Optional Add Card Bar */}
      {showAddForm && (
        <form
          onSubmit={handleAddCard}
          className="px-4 py-2.5 bg-white border-b border-stone-200 flex flex-wrap items-center gap-2 text-xs"
        >
          <input
            type="text"
            placeholder="Specialization title (e.g., Rooftop Terrace Zoning)..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1 min-w-[200px] px-2.5 py-1.5 rounded-md bg-[#FAF7F2] border border-stone-300"
          />
          <input
            type="text"
            placeholder="Specification question or rulebook note..."
            value={newPrompt}
            onChange={(e) => setNewPrompt(e.target.value)}
            className="flex-2 min-w-[260px] px-2.5 py-1.5 rounded-md bg-[#FAF7F2] border border-stone-300"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-md bg-emerald-700 text-white font-semibold"
          >
            Save to Board
          </button>
        </form>
      )}

      {/* 3-Column Kanban Board */}
      <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-3 gap-3.5 overflow-y-auto">
        {columns.map((col) => {
          const colCards = cards.filter((c) => c.column === col.id);
          return (
            <div
              key={col.id}
              className="flex flex-col rounded-xl bg-[#F3EFE6]/85 border border-stone-300/80 p-3 space-y-2.5"
            >
              <div className="flex items-center justify-between border-b border-stone-300/70 pb-2">
                <div>
                  <h3 className="text-xs font-bold text-stone-900">{col.title}</h3>
                  <p className="text-[10px] text-stone-500">{col.subtitle}</p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${col.badgeBg}`}
                >
                  {colCards.length}
                </span>
              </div>

              <div className="space-y-2.5 overflow-y-auto pr-0.5">
                {colCards.map((card) => (
                  <div
                    key={card.id}
                    className="p-3 rounded-xl bg-white border border-stone-200/90 shadow-xs space-y-2 hover:border-teal-600/60 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 truncate">
                        {card.domainSlug}
                      </span>
                      <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 shrink-0">
                        {card.priority}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-stone-900 leading-snug">
                      {card.title}
                    </h4>

                    <div className="p-2 rounded-lg bg-amber-50/75 border border-amber-200/80 text-[11px] text-stone-800 leading-relaxed">
                      “{card.questionPrompt}”
                    </div>

                    <div className="text-[10px] text-stone-600 leading-relaxed">
                      <strong className="text-stone-800">Technical Spec:</strong>{' '}
                      {card.technicalBlueprint}
                    </div>

                    <div className="pt-1 border-t border-stone-100 flex items-center justify-between">
                      <button
                        onClick={() => moveCard(card.id, -1)}
                        disabled={card.column === 'discovery'}
                        className="px-2 py-1 rounded text-[10px] font-medium text-stone-600 hover:bg-stone-100 disabled:opacity-30 flex items-center gap-1"
                      >
                        <ArrowLeft className="w-3 h-3" />
                        <span>Prev</span>
                      </button>

                      {card.column === 'active' ? (
                        <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Live in r186</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => moveCard(card.id, 1)}
                          className="px-2.5 py-1 rounded bg-teal-700 hover:bg-teal-800 text-white text-[10px] font-semibold flex items-center gap-1 transition-colors"
                        >
                          <span>Promote Stage</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
