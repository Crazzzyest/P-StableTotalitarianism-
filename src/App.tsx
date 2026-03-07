import { useState } from 'react';
import { AlertTriangle, Shield, Eye, Clock, Skull, Cpu, PowerOff, Globe, X, Info, Activity, Plus, Trash2, LayoutGrid } from 'lucide-react';
import AiPowerGraph from '../ai-power-graph.jsx';

function combine(probs: number[], mode: 'all' | 'any'): number {
  if (probs.length === 0) return 0;
  if (mode === 'all') return probs.reduce((a, b) => a * b, 1);
  return 1 - probs.reduce((acc, p) => acc * (1 - p), 1);
}

type SubLink = { id: string; label: string; value: number };
type ChainNodeState = { combineMode: 'all' | 'any'; subLinks: SubLink[] };

const ChainNode = ({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  nodeState,
  onNodeStateChange,
  icon: Icon,
  colorClass,
  accentColor,
}: {
  title: string;
  description: string;
  onTitleChange?: (v: string) => void;
  onDescriptionChange?: (v: string) => void;
  nodeState: ChainNodeState;
  onNodeStateChange: (s: ChainNodeState) => void;
  icon: any;
  colorClass: string;
  accentColor: string;
}) => {
  const values = nodeState.subLinks.map((s) => s.value);
  const effectiveValue = combine(values, nodeState.combineMode);

  const setSubLink = (id: string, patch: Partial<SubLink>) => {
    onNodeStateChange({
      ...nodeState,
      subLinks: nodeState.subLinks.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    });
  };
  const addSubLink = () => {
    onNodeStateChange({
      ...nodeState,
      subLinks: [...nodeState.subLinks, { id: `s-${Date.now()}`, label: '', value: 0.5 }],
    });
  };
  const removeSubLink = (id: string) => {
    if (nodeState.subLinks.length <= 1) return;
    onNodeStateChange({
      ...nodeState,
      subLinks: nodeState.subLinks.filter((s) => s.id !== id),
    });
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-5 flex flex-col gap-4 relative backdrop-blur-sm transition-colors hover:bg-zinc-900">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`p-2 rounded-lg shrink-0 ${colorClass}`}>
            <Icon size={18} />
          </div>
          <div className="min-w-0 flex-1">
            {onTitleChange ? (
              <input
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                className="font-medium text-zinc-200 text-sm bg-transparent border border-zinc-600/50 rounded px-2 py-1 w-full focus:border-zinc-500 focus:outline-none"
              />
            ) : (
              <h3 className="font-medium text-zinc-200 text-sm">{title}</h3>
            )}
            {onDescriptionChange ? (
              <textarea
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                rows={3}
                className="text-xs text-zinc-500 mt-1.5 leading-relaxed bg-transparent border border-zinc-600/50 rounded px-2 py-1.5 w-full resize-y focus:border-zinc-500 focus:outline-none"
              />
            ) : (
              <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">{description}</p>
            )}
          </div>
        </div>
        <div className="text-xl font-mono text-zinc-300 shrink-0">
          {(effectiveValue * 100).toFixed(0)}%
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-zinc-500">Combine:</span>
        <button
          type="button"
          onClick={() => onNodeStateChange({ ...nodeState, combineMode: 'all' })}
          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
            nodeState.combineMode === 'all'
              ? 'bg-zinc-600 text-zinc-100'
              : 'bg-zinc-800/80 text-zinc-500 hover:text-zinc-300'
          }`}
        >
          All true
        </button>
        <button
          type="button"
          onClick={() => onNodeStateChange({ ...nodeState, combineMode: 'any' })}
          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
            nodeState.combineMode === 'any'
              ? 'bg-zinc-600 text-zinc-100'
              : 'bg-zinc-800/80 text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Any true
        </button>
      </div>

      <div className="space-y-3">
        {nodeState.subLinks.map((sub) => (
          <div key={sub.id} className="flex items-center gap-2 flex-wrap">
            <input
              placeholder="Sub-link label"
              value={sub.label}
              onChange={(e) => setSubLink(sub.id, { label: e.target.value })}
              className="text-xs text-zinc-400 bg-zinc-800/50 border border-zinc-700/50 rounded px-2 py-1 flex-1 min-w-[80px] max-w-[140px] focus:border-zinc-500 focus:outline-none"
            />
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-xs font-mono text-zinc-600 w-8">{(sub.value * 100).toFixed(0)}%</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={sub.value}
                onChange={(e) => setSubLink(sub.id, { value: parseFloat(e.target.value) })}
                className="range-slider flex-1"
                style={{
                  backgroundImage: `linear-gradient(${accentColor}, ${accentColor})`,
                  backgroundSize: `${sub.value * 100}% 100%`,
                  backgroundRepeat: 'no-repeat',
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => removeSubLink(sub.id)}
              disabled={nodeState.subLinks.length <= 1}
              className="p-1.5 rounded text-zinc-500 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-30 disabled:pointer-events-none"
              title="Remove sub-link"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addSubLink}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 px-2 py-1 rounded hover:bg-zinc-800/50"
        >
          <Plus size={14} /> Add sub-link
        </button>
      </div>
    </div>
  );
};

const MultiplyIcon = () => (
  <div className="flex justify-center my-1.5 opacity-50">
    <div className="bg-zinc-900 rounded-full p-1 border border-zinc-800">
      <X className="text-zinc-500" size={14} />
    </div>
  </div>
);

const defaultDoomText = {
  chainTitle: 'The Doom Chain',
  chainSubtitle: 'Extinction scenarios require a long chain of conditional failures. Each link multiplies the uncertainty.',
  nodes: [
    { title: '1. ASI is Possible', description: 'Artificial Superintelligence can be built and is technically feasible.' },
    { title: '2. Misaligned by Default', description: 'ASI is misaligned by default AND all alignment techniques fail.' },
    { title: '3. Failure to Contain', description: "We don't catch it and shut it down before irreversible catastrophe." },
    { title: '4. Extinction Capability', description: 'The AI is actually capable of causing human extinction.' },
  ],
};

const defaultTText = {
  chainTitle: 'The Totalitarian Chain',
  chainSubtitle: 'Requires strictly weaker technology. If AGI is paused, P(Doom) falls more than P(T).',
  nodes: [
    { title: '1. Credible Deterrence', description: 'Making foreign military or political interference too costly to attempt. Destruction is structurally easier than defense.' },
    { title: '2. Internal Security', description: "Omni-surveillance and autonomous lethal systems eliminate the cost-benefit case for dissent. Automated surveillance doesn't fear superiors." },
    { title: '3. Persistence', description: "Keeping the regime's values in power indefinitely via longevity tech, AI value encoding, or perfect lie detection." },
  ],
};

const initialDoomNodes: ChainNodeState[] = [
  { combineMode: 'all', subLinks: [{ id: 'd1', label: '', value: 0.8 }] },
  { combineMode: 'all', subLinks: [{ id: 'd2', label: '', value: 0.4 }] },
  { combineMode: 'all', subLinks: [{ id: 'd3', label: '', value: 0.3 }] },
  { combineMode: 'all', subLinks: [{ id: 'd4', label: '', value: 0.5 }] },
];
const initialTNodes: ChainNodeState[] = [
  { combineMode: 'all', subLinks: [{ id: 't1', label: '', value: 0.6 }] },
  { combineMode: 'all', subLinks: [{ id: 't2', label: '', value: 0.7 }] },
  { combineMode: 'all', subLinks: [{ id: 't3', label: '', value: 0.4 }] },
];

export default function App() {
  const [doomNodes, setDoomNodes] = useState<ChainNodeState[]>(initialDoomNodes);
  const [tNodes, setTNodes] = useState<ChainNodeState[]>(initialTNodes);

  const [doomText, setDoomText] = useState(defaultDoomText);
  const [tText, setTText] = useState(defaultTText);

  const doomLinkValues = doomNodes.map((n) => combine(n.subLinks.map((s) => s.value), n.combineMode));
  const tLinkValues = tNodes.map((n) => combine(n.subLinks.map((s) => s.value), n.combineMode));
  const pDoom = doomLinkValues.reduce((a, b) => a * b, 1);
  const pT = tLinkValues.reduce((a, b) => a * b, 1);

  const [activeTab, setActiveTab] = useState<'model' | 'graph'>('model');

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 font-sans selection:bg-indigo-500/30 flex flex-col">
      <div className="flex border-b border-zinc-800/80 shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('model')}
          className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'model'
              ? 'border-indigo-500 text-zinc-100'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Activity size={16} />
          P(Doom) vs P(T)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('graph')}
          className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'graph'
              ? 'border-indigo-500 text-zinc-100'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <LayoutGrid size={16} />
          AI Power Graph
        </button>
      </div>

      {activeTab === 'graph' ? (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <AiPowerGraph />
        </div>
      ) : (
      <div className="flex-1 p-6 md:p-12 overflow-auto">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-400">
            <Activity size={14} className="text-indigo-400" />
            Interactive Probability Model
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-zinc-100 tracking-tight">
            P(Doom) vs P(Stable Totalitarianism)
          </h1>
          <p className="text-zinc-400 max-w-3xl leading-relaxed text-sm md:text-base">
            AI doom discourse is built on a long chain of conditional probabilities. In contrast, stable totalitarianism requires strictly weaker technology and fewer conditional steps. Adjust the sliders below to explore how the compounding probabilities affect the final outcomes.
          </p>
        </header>

        {/* Comparison Dashboard */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 md:p-8 backdrop-blur-md">
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-6 flex items-center gap-2">
            <Globe size={16} /> Cumulative Probability
          </h2>
          
          <div className="space-y-8">
            {/* P(Doom) Bar */}
            <div className="relative">
              <div className="flex justify-between items-end mb-3">
                <div>
                  <div className="text-red-400 font-medium text-lg flex items-center gap-2">
                    <Skull size={18} /> P(Doom)
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">Human extinction via misaligned ASI</div>
                </div>
                <div className="text-3xl font-mono text-zinc-100">
                  {(pDoom * 100).toFixed(2)}%
                </div>
              </div>
              <div className="h-3 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800/50">
                <div 
                  className="h-full bg-gradient-to-r from-red-900 to-red-500 transition-all duration-500 ease-out relative"
                  style={{ width: `${Math.max(pDoom * 100, 0.5)}%` }}
                >
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4yKSIvPjwvc3ZnPg==')] opacity-50"></div>
                </div>
              </div>
            </div>

            {/* P(T) Bar */}
            <div className="relative">
              <div className="flex justify-between items-end mb-3">
                <div>
                  <div className="text-amber-400 font-medium text-lg flex items-center gap-2">
                    <Eye size={18} /> P(Stable Totalitarianism)
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">Indefinite regime survival via AI capabilities</div>
                </div>
                <div className="text-3xl font-mono text-zinc-100">
                  {(pT * 100).toFixed(2)}%
                </div>
              </div>
              <div className="h-3 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800/50">
                <div 
                  className="h-full bg-gradient-to-r from-amber-900 to-amber-500 transition-all duration-500 ease-out relative"
                  style={{ width: `${Math.max(pT * 100, 0.5)}%` }}
                >
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4yKSIvPjwvc3ZnPg==')] opacity-50"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chains */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          
          {/* Doom Chain */}
          <div className="space-y-2">
            <div className="mb-6 pb-4 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <Skull className="text-red-400 shrink-0" size={20} />
                <input
                  value={doomText.chainTitle}
                  onChange={(e) => setDoomText(t => ({ ...t, chainTitle: e.target.value }))}
                  className="text-xl font-medium text-zinc-100 bg-transparent border border-transparent hover:border-zinc-600/50 rounded px-2 py-0.5 focus:border-zinc-500 focus:outline-none w-full"
                />
              </div>
              <textarea
                value={doomText.chainSubtitle}
                onChange={(e) => setDoomText(t => ({ ...t, chainSubtitle: e.target.value }))}
                rows={2}
                className="text-sm text-zinc-500 mt-2 w-full bg-transparent border border-transparent hover:border-zinc-600/50 rounded px-2 py-1 resize-y focus:border-zinc-500 focus:outline-none"
              />
            </div>

            <ChainNode
              title={doomText.nodes[0].title}
              description={doomText.nodes[0].description}
              onTitleChange={(v) => setDoomText(t => ({ ...t, nodes: t.nodes.map((n, i) => i === 0 ? { ...n, title: v } : n) }))}
              onDescriptionChange={(v) => setDoomText(t => ({ ...t, nodes: t.nodes.map((n, i) => i === 0 ? { ...n, description: v } : n) }))}
              nodeState={doomNodes[0]}
              onNodeStateChange={(s) => setDoomNodes(arr => [s, arr[1], arr[2], arr[3]])}
              icon={Cpu}
              colorClass="bg-red-500/10 text-red-400"
              accentColor="#f87171"
            />
            <MultiplyIcon />
            <ChainNode
              title={doomText.nodes[1].title}
              description={doomText.nodes[1].description}
              onTitleChange={(v) => setDoomText(t => ({ ...t, nodes: t.nodes.map((n, i) => i === 1 ? { ...n, title: v } : n) }))}
              onDescriptionChange={(v) => setDoomText(t => ({ ...t, nodes: t.nodes.map((n, i) => i === 1 ? { ...n, description: v } : n) }))}
              nodeState={doomNodes[1]}
              onNodeStateChange={(s) => setDoomNodes(arr => [arr[0], s, arr[2], arr[3]])}
              icon={AlertTriangle}
              colorClass="bg-red-500/10 text-red-400"
              accentColor="#f87171"
            />
            <MultiplyIcon />
            <ChainNode
              title={doomText.nodes[2].title}
              description={doomText.nodes[2].description}
              onTitleChange={(v) => setDoomText(t => ({ ...t, nodes: t.nodes.map((n, i) => i === 2 ? { ...n, title: v } : n) }))}
              onDescriptionChange={(v) => setDoomText(t => ({ ...t, nodes: t.nodes.map((n, i) => i === 2 ? { ...n, description: v } : n) }))}
              nodeState={doomNodes[2]}
              onNodeStateChange={(s) => setDoomNodes(arr => [arr[0], arr[1], s, arr[3]])}
              icon={PowerOff}
              colorClass="bg-red-500/10 text-red-400"
              accentColor="#f87171"
            />
            <MultiplyIcon />
            <ChainNode
              title={doomText.nodes[3].title}
              description={doomText.nodes[3].description}
              onTitleChange={(v) => setDoomText(t => ({ ...t, nodes: t.nodes.map((n, i) => i === 3 ? { ...n, title: v } : n) }))}
              onDescriptionChange={(v) => setDoomText(t => ({ ...t, nodes: t.nodes.map((n, i) => i === 3 ? { ...n, description: v } : n) }))}
              nodeState={doomNodes[3]}
              onNodeStateChange={(s) => setDoomNodes(arr => [arr[0], arr[1], arr[2], s])}
              icon={Globe}
              colorClass="bg-red-500/10 text-red-400"
              accentColor="#f87171"
            />
          </div>

          {/* Totalitarianism Chain */}
          <div className="space-y-2">
            <div className="mb-6 pb-4 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <Eye className="text-amber-400 shrink-0" size={20} />
                <input
                  value={tText.chainTitle}
                  onChange={(e) => setTText(t => ({ ...t, chainTitle: e.target.value }))}
                  className="text-xl font-medium text-zinc-100 bg-transparent border border-transparent hover:border-zinc-600/50 rounded px-2 py-0.5 focus:border-zinc-500 focus:outline-none w-full"
                />
              </div>
              <textarea
                value={tText.chainSubtitle}
                onChange={(e) => setTText(t => ({ ...t, chainSubtitle: e.target.value }))}
                rows={2}
                className="text-sm text-zinc-500 mt-2 w-full bg-transparent border border-transparent hover:border-zinc-600/50 rounded px-2 py-1 resize-y focus:border-zinc-500 focus:outline-none"
              />
            </div>

            <ChainNode
              title={tText.nodes[0].title}
              description={tText.nodes[0].description}
              onTitleChange={(v) => setTText(t => ({ ...t, nodes: t.nodes.map((n, i) => i === 0 ? { ...n, title: v } : n) }))}
              onDescriptionChange={(v) => setTText(t => ({ ...t, nodes: t.nodes.map((n, i) => i === 0 ? { ...n, description: v } : n) }))}
              nodeState={tNodes[0]}
              onNodeStateChange={(s) => setTNodes(arr => [s, arr[1], arr[2]])}
              icon={Shield}
              colorClass="bg-amber-500/10 text-amber-400"
              accentColor="#fbbf24"
            />
            <MultiplyIcon />
            <ChainNode
              title={tText.nodes[1].title}
              description={tText.nodes[1].description}
              onTitleChange={(v) => setTText(t => ({ ...t, nodes: t.nodes.map((n, i) => i === 1 ? { ...n, title: v } : n) }))}
              onDescriptionChange={(v) => setTText(t => ({ ...t, nodes: t.nodes.map((n, i) => i === 1 ? { ...n, description: v } : n) }))}
              nodeState={tNodes[1]}
              onNodeStateChange={(s) => setTNodes(arr => [arr[0], s, arr[2]])}
              icon={Eye}
              colorClass="bg-amber-500/10 text-amber-400"
              accentColor="#fbbf24"
            />
            <MultiplyIcon />
            <ChainNode
              title={tText.nodes[2].title}
              description={tText.nodes[2].description}
              onTitleChange={(v) => setTText(t => ({ ...t, nodes: t.nodes.map((n, i) => i === 2 ? { ...n, title: v } : n) }))}
              onDescriptionChange={(v) => setTText(t => ({ ...t, nodes: t.nodes.map((n, i) => i === 2 ? { ...n, description: v } : n) }))}
              nodeState={tNodes[2]}
              onNodeStateChange={(s) => setTNodes(arr => [arr[0], arr[1], s])}
              icon={Clock}
              colorClass="bg-amber-500/10 text-amber-400"
              accentColor="#fbbf24"
            />
            
            <div className="mt-8 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
              <div className="flex gap-3">
                <Info className="text-indigo-400 shrink-0 mt-0.5" size={18} />
                <p className="text-xs text-indigo-200/70 leading-relaxed">
                  <strong className="text-indigo-300 font-medium">The Core Pattern:</strong> All three requirements are shifted upward by AI capabilities, and shifted faster than P(Doom) is. The loyalty of human soldiers becomes less relevant, removing the human element that typically defeats violence.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
      </div>
      )}
    </div>
  );
}
