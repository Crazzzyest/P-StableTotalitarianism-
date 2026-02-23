import { useState } from 'react';
import { AlertTriangle, Shield, Eye, Clock, Skull, Cpu, PowerOff, Globe, X, Info, Activity } from 'lucide-react';

const Node = ({ title, description, value, onChange, icon: Icon, colorClass, accentColor }: any) => (
  <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-5 flex flex-col gap-4 relative backdrop-blur-sm transition-colors hover:bg-zinc-900">
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg shrink-0 ${colorClass}`}>
          <Icon size={18} />
        </div>
        <div>
          <h3 className="font-medium text-zinc-200 text-sm">{title}</h3>
          <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">{description}</p>
        </div>
      </div>
      <div className="text-xl font-mono text-zinc-300 shrink-0">
        {(value * 100).toFixed(0)}%
      </div>
    </div>
    
    <div className="mt-1 flex items-center gap-3">
      <span className="text-xs font-mono text-zinc-600">0%</span>
      <input 
        type="range" 
        min="0" 
        max="1" 
        step="0.01" 
        value={value} 
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="range-slider w-full"
        style={{ 
          backgroundImage: `linear-gradient(${accentColor}, ${accentColor})`,
          backgroundSize: `${value * 100}% 100%`,
          backgroundRepeat: 'no-repeat'
        }}
      />
      <span className="text-xs font-mono text-zinc-600">100%</span>
    </div>
  </div>
);

const MultiplyIcon = () => (
  <div className="flex justify-center my-1.5 opacity-50">
    <div className="bg-zinc-900 rounded-full p-1 border border-zinc-800">
      <X className="text-zinc-500" size={14} />
    </div>
  </div>
);

export default function App() {
  const [doomProbs, setDoomProbs] = useState({
    asiPossible: 0.8,
    misaligned: 0.4,
    notCaught: 0.3,
    extinctionCapable: 0.5
  });

  const [tProbs, setTProbs] = useState({
    deterrence: 0.6,
    internalSecurity: 0.7,
    persistence: 0.4
  });

  const pDoom = doomProbs.asiPossible * doomProbs.misaligned * doomProbs.notCaught * doomProbs.extinctionCapable;
  const pT = tProbs.deterrence * tProbs.internalSecurity * tProbs.persistence;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 font-sans p-6 md:p-12 selection:bg-indigo-500/30">
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
              <h2 className="text-xl font-medium text-zinc-100 flex items-center gap-2">
                <Skull className="text-red-400" size={20} />
                The Doom Chain
              </h2>
              <p className="text-sm text-zinc-500 mt-2">
                Extinction scenarios require a long chain of conditional failures. Each link multiplies the uncertainty.
              </p>
            </div>

            <Node 
              title="1. ASI is Possible"
              description="Artificial Superintelligence can be built and is technically feasible."
              value={doomProbs.asiPossible}
              onChange={(v: number) => setDoomProbs(p => ({...p, asiPossible: v}))}
              icon={Cpu}
              colorClass="bg-red-500/10 text-red-400"
              accentColor="#f87171"
            />
            <MultiplyIcon />
            <Node 
              title="2. Misaligned by Default"
              description="ASI is misaligned by default AND all alignment techniques fail."
              value={doomProbs.misaligned}
              onChange={(v: number) => setDoomProbs(p => ({...p, misaligned: v}))}
              icon={AlertTriangle}
              colorClass="bg-red-500/10 text-red-400"
              accentColor="#f87171"
            />
            <MultiplyIcon />
            <Node 
              title="3. Failure to Contain"
              description="We don't catch it and shut it down before irreversible catastrophe."
              value={doomProbs.notCaught}
              onChange={(v: number) => setDoomProbs(p => ({...p, notCaught: v}))}
              icon={PowerOff}
              colorClass="bg-red-500/10 text-red-400"
              accentColor="#f87171"
            />
            <MultiplyIcon />
            <Node 
              title="4. Extinction Capability"
              description="The AI is actually capable of causing human extinction."
              value={doomProbs.extinctionCapable}
              onChange={(v: number) => setDoomProbs(p => ({...p, extinctionCapable: v}))}
              icon={Globe}
              colorClass="bg-red-500/10 text-red-400"
              accentColor="#f87171"
            />
          </div>

          {/* Totalitarianism Chain */}
          <div className="space-y-2">
            <div className="mb-6 pb-4 border-b border-zinc-800/80">
              <h2 className="text-xl font-medium text-zinc-100 flex items-center gap-2">
                <Eye className="text-amber-400" size={20} />
                The Totalitarian Chain
              </h2>
              <p className="text-sm text-zinc-500 mt-2">
                Requires strictly weaker technology. If AGI is paused, P(Doom) falls more than P(T).
              </p>
            </div>

            <Node 
              title="1. Credible Deterrence"
              description="Making foreign military or political interference too costly to attempt. Destruction is structurally easier than defense."
              value={tProbs.deterrence}
              onChange={(v: number) => setTProbs(p => ({...p, deterrence: v}))}
              icon={Shield}
              colorClass="bg-amber-500/10 text-amber-400"
              accentColor="#fbbf24"
            />
            <MultiplyIcon />
            <Node 
              title="2. Internal Security"
              description="Omni-surveillance and autonomous lethal systems eliminate the cost-benefit case for dissent. Automated surveillance doesn't fear superiors."
              value={tProbs.internalSecurity}
              onChange={(v: number) => setTProbs(p => ({...p, internalSecurity: v}))}
              icon={Eye}
              colorClass="bg-amber-500/10 text-amber-400"
              accentColor="#fbbf24"
            />
            <MultiplyIcon />
            <Node 
              title="3. Persistence"
              description="Keeping the regime's values in power indefinitely via longevity tech, AI value encoding, or perfect lie detection."
              value={tProbs.persistence}
              onChange={(v: number) => setTProbs(p => ({...p, persistence: v}))}
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
  );
}
