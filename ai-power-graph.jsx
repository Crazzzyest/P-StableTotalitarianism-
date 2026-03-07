import { useState, useEffect, useRef, useMemo } from "react";

const NODES = [
  {
    id: "open_source", label: "Open-Source AI", category: "policy",
    description: "Releasing AI model weights publicly — enabling anyone to run, modify, and weaponize models without gatekeeping or oversight.",
    threat: "Lowers the barrier to mass-casualty attacks using AI-designed pathogens or autonomous weapon systems. One successful attack triggers the legislative cascade.",
  },
  {
    id: "interpretability", label: "Interpretability Research", category: "policy",
    description: "Mechanistic understanding of how neural networks encode concepts, values, and behavioral dispositions at the circuit level.",
    threat: "The same tools that let us read values from weights can write them. Once interpretability matures, sculpting loyalty to a specific beneficiary becomes an engineering problem.",
  },
  {
    id: "ai_pause", label: "AI Pause / Moratorium", category: "policy",
    description: "International agreement to halt frontier AI development above a capability threshold — requiring global coordination and enforcement.",
    threat: "Any body powerful enough to enforce a pause — with inspection rights, satellite monitoring, compute tracking — is powerful enough to impose other policy unilaterally.",
  },
  {
    id: "ai_capability", label: "AI Capability", category: "ai",
    description: "Raw power and autonomy of frontier AI systems — encompassing reasoning, persuasion, scientific discovery, and strategic planning.",
    threat: "Higher capability amplifies both beneficial applications and catastrophic misuse. The same system that accelerates drug discovery accelerates pathogen design.",
  },
  {
    id: "mass_casualty", label: "Mass Casualty Event", category: "risk",
    description: "A catastrophic attack — biological, chemical, radiological, or autonomous — killing thousands to millions and attributed to AI-enabled actors.",
    threat: "Historical precedent is unambiguous: mass-casualty events produce rapid, sweeping expansions of state power that outlast the emergency by decades.",
  },
  {
    id: "nuclear_risk", label: "Nuclear Risk", category: "risk",
    description: "Probability of nuclear weapon use — by state actors, non-state groups acquiring materials, or AI-optimized targeting and command manipulation.",
    threat: "AI accelerates both offensive capability (targeting, yield optimization) and the information asymmetries that make preemptive strikes more tempting.",
  },
  {
    id: "public_fear", label: "Public Fear", category: "social",
    description: "Generalized anxiety and demand for security among the population following catastrophic events — providing the mandate for emergency legislation.",
    threat: "Fear is historically the most reliable mandate for laws that would otherwise be unpassable. Emergency legislation rarely includes its own sunset clauses.",
  },
  {
    id: "emergency_powers", label: "Emergency Powers", category: "state",
    description: "Extraordinary executive authority invoked during crisis — bypassing legislative scrutiny, judicial review, and constitutional constraints.",
    threat: "Emergency powers are rarely fully rescinded. Each crisis leaves a residual expansion of executive authority that becomes the new baseline.",
  },
  {
    id: "surveillance", label: "Mass Surveillance", category: "state",
    description: "AI-enabled monitoring of communications, movement, financial activity, and social graphs at population scale in near real-time.",
    threat: "Real-time behavior prediction and preemptive suppression of dissent becomes technically feasible. Opposition organizing becomes nearly impossible.",
  },
  {
    id: "alignment_capture", label: "Alignment Capture", category: "risk",
    description: "The use of interpretability and fine-tuning tools to mechanistically encode loyalty to a specific individual or group — rather than to humanity broadly.",
    threat: "Not a distant scenario. The infrastructure for alignment capture is being built now, sold as safety tooling. The same levers that steer AI away from harm can steer it toward unconditional service.",
  },
  {
    id: "world_gov", label: "Supranational Authority", category: "state",
    description: "A world government or enforcement body with authority to monitor, sanction, and intervene in AI development and deployment globally.",
    threat: "No historical precedent for a benign supranational authority with this scope of enforcement power. The incentive to mission-creep is structurally identical to other power concentration risks.",
  },
  {
    id: "civil_liberties", label: "Civil Liberties", category: "social",
    description: "Legal protections for speech, association, privacy, and due process — the structural prerequisites for democratic accountability.",
    threat: "Erosion is rarely sudden. Each increment seems proportionate to the crisis at hand. The cumulative result is only visible in retrospect.",
  },
  {
    id: "democratic_resilience", label: "Democratic Resilience", category: "social",
    description: "Institutional capacity to resist concentration of power — through checks, balances, press freedom, opposition parties, and civic norms.",
    threat: "Resilience degrades slowly then fails suddenly when accumulated stress exceeds institutional capacity. AI-enabled surveillance dramatically accelerates this threshold crossing.",
  },
  {
    id: "power_concentration", label: "Power Concentration", category: "outcome",
    description: "Decision-making authority accumulated in a small number of actors — whether states, AI labs, or supranational bodies — with limited accountability.",
    threat: "The common structural endpoint of all three AI policy pathways under adversarial conditions. Each pathway has a distinct mechanism but converges on the same configuration.",
  },
  {
    id: "totalitarianism", label: "Stable Totalitarianism", category: "terminal",
    description: "Near-total control over political, economic, and social life — potentially durable in a way no previous totalitarian system has been.",
    threat: "AI-enabled totalitarianism may be uniquely permanent: real-time surveillance, loyalty-optimized AI agents, preemptive suppression, and no historical analogue for resistance under these conditions.",
  },
];

const LINKS = [
  { source: "open_source", target: "ai_capability", weight: 0.7, label: "expands" },
  { source: "open_source", target: "mass_casualty", weight: 0.65, label: "enables" },
  { source: "ai_capability", target: "mass_casualty", weight: 0.55, label: "amplifies" },
  { source: "ai_capability", target: "nuclear_risk", weight: 0.45, label: "amplifies" },
  { source: "ai_capability", target: "surveillance", weight: 0.6, label: "supercharges" },
  { source: "mass_casualty", target: "public_fear", weight: 0.85, label: "triggers" },
  { source: "mass_casualty", target: "emergency_powers", weight: 0.75, label: "mandates" },
  { source: "nuclear_risk", target: "public_fear", weight: 0.6, label: "intensifies" },
  { source: "public_fear", target: "emergency_powers", weight: 0.65, label: "demands" },
  { source: "emergency_powers", target: "civil_liberties", weight: -0.75, label: "erodes" },
  { source: "emergency_powers", target: "surveillance", weight: 0.8, label: "expands" },
  { source: "surveillance", target: "power_concentration", weight: 0.75, label: "enables" },
  { source: "surveillance", target: "democratic_resilience", weight: -0.65, label: "degrades" },
  { source: "interpretability", target: "alignment_capture", weight: 0.75, label: "enables" },
  { source: "alignment_capture", target: "power_concentration", weight: 0.85, label: "delivers" },
  { source: "ai_pause", target: "world_gov", weight: 0.7, label: "requires" },
  { source: "world_gov", target: "power_concentration", weight: 0.65, label: "concentrates" },
  { source: "world_gov", target: "civil_liberties", weight: -0.45, label: "threatens" },
  { source: "civil_liberties", target: "democratic_resilience", weight: 0.7, label: "sustains" },
  { source: "democratic_resilience", target: "power_concentration", weight: -0.8, label: "resists" },
  { source: "power_concentration", target: "totalitarianism", weight: 0.9, label: "becomes" },
];

const CATEGORY_META = {
  policy:   { color: "#1e6091", label: "AI Policy" },
  ai:       { color: "#0a7251", label: "AI Systems" },
  risk:     { color: "#8b1a1a", label: "Risk Factors" },
  state:    { color: "#7a5200", label: "State Power" },
  social:   { color: "#1a5c6e", label: "Social Fabric" },
  outcome:  { color: "#6e1a5c", label: "Outcome" },
  terminal: { color: "#cc1122", label: "Terminal State" },
};

const GRAPH_WIDTH = 800;
const GRAPH_HEIGHT = 600;

const cx = GRAPH_WIDTH / 2;
const cy = GRAPH_HEIGHT / 2;
const RING_RADIUS = Math.min(GRAPH_WIDTH, GRAPH_HEIGHT) * 0.38;

function getRingPositions() {
  const n = NODES.length;
  const positions = {};
  for (let i = 0; i < n; i++) {
    const angle = -Math.PI / 2 + (i / n) * 2 * Math.PI;
    positions[NODES[i].id] = {
      x: cx + RING_RADIUS * Math.cos(angle),
      y: cy + RING_RADIUS * Math.sin(angle),
    };
  }
  return positions;
}

const RING_POSITIONS = getRingPositions();

export default function AiPowerGraph() {
  const containerRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [containerSize, setContainerSize] = useState({ w: 800, h: 600 });
  const positions = RING_POSITIONS;

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ w: rect.width || GRAPH_WIDTH, h: Math.max(rect.height, 400) });
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const highlighted = useMemo(() => {
    const activeId = selected?.id || hovered;
    if (!activeId) return null;
    const activeLinks = LINKS.filter(l => l.source === activeId || l.target === activeId);
    const nodeIds = new Set([activeId, ...activeLinks.map(l => l.source), ...activeLinks.map(l => l.target)]);
    const linkKeys = new Set(activeLinks.map(l => `${l.source}::${l.target}`));
    return { nodeIds, linkKeys };
  }, [selected, hovered]);

  return (
    <div style={{ background: "#06090c", minHeight: "100%", display: "flex", flexDirection: "column", fontFamily: "'IBM Plex Mono', monospace", color: "#7a90a8" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500&family=Playfair+Display:ital,wght@0,700;1,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-track { background: #0a0f14; } ::-webkit-scrollbar-thumb { background: #1a2a3a; }
        .node-g { cursor: pointer; }
        .node-g:hover circle.main { filter: brightness(1.6); }
        @media (max-width: 768px) {
          .graph-layout { flex-direction: column !important; }
          .graph-canvas { min-height: 65vh !important; width: 100% !important; }
          .graph-panel { width: 100% !important; max-height: 35vh !important; border-left: none !important; border-top: 1px solid #0d1822 !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ padding: "14px 24px 10px", borderBottom: "1px solid #0d1822", flexShrink: 0 }}>
        <div style={{ fontSize: "9px", letterSpacing: "4px", color: "#2a4060", marginBottom: "3px" }}>
          THREAT ANALYSIS // AI-ENABLED POWER CONCENTRATION PATHWAYS
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", color: "#b0bfcc", fontWeight: 700, letterSpacing: "0.5px" }}>
          AI Policy → Totalitarian Failure Modes
          <span style={{ fontStyle: "italic", fontWeight: 400, fontSize: "14px", color: "#3a5570", marginLeft: "12px" }}>dependency graph</span>
        </h1>
      </div>

      <div className="graph-layout" style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>
        {/* Graph canvas - scales to fit */}
        <div ref={containerRef} className="graph-canvas" style={{ flex: 1, position: "relative", overflow: "hidden", minHeight: 280 }}>
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
            preserveAspectRatio="xMidYMid meet"
            style={{ display: "block" }}
          >
            <defs>
              {["pos", "neg", "pos-dim", "neg-dim"].map(k => {
                const col = k === "pos" ? "#00cc66" : k === "neg" ? "#cc2233" : k === "pos-dim" ? "#0d2a18" : "#2a0d10";
                return (
                  <marker key={k} id={`arr-${k}`} markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L7,3 z" fill={col} />
                  </marker>
                );
              })}
              <filter id="glow-out">
                <feGaussianBlur stdDeviation="4" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="glow-soft">
                <feGaussianBlur stdDeviation="2" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <radialGradient id="bg-grad" cx="50%" cy="50%">
                <stop offset="0%" stopColor="#0a1220" />
                <stop offset="100%" stopColor="#06090c" />
              </radialGradient>
            </defs>
            <rect width={GRAPH_WIDTH} height={GRAPH_HEIGHT} fill="url(#bg-grad)" />

            {/* Grid lines */}
            {Array.from({ length: Math.ceil(GRAPH_WIDTH / 60) }).map((_, i) => (
              <line key={`gv${i}`} x1={i * 60} y1={0} x2={i * 60} y2={GRAPH_HEIGHT} stroke="#0d1520" strokeWidth="0.5" />
            ))}
            {Array.from({ length: Math.ceil(GRAPH_HEIGHT / 60) }).map((_, i) => (
              <line key={`gh${i}`} x1={0} y1={i * 60} x2={GRAPH_WIDTH} y2={i * 60} stroke="#0d1520" strokeWidth="0.5" />
            ))}

            {/* Links */}
            {LINKS.map(link => {
              const s = positions[link.source];
              const t = positions[link.target];
              if (!s || !t) return null;
              const key = `${link.source}::${link.target}`;
              const isActive = highlighted?.linkKeys.has(key);
              const isDim = highlighted && !isActive;
              const pos = link.weight > 0;
              const dx = t.x - s.x, dy = t.y - s.y;
              const dist = Math.sqrt(dx * dx + dy * dy) || 1;
              const r1 = 32, r2 = 34;
              const x1 = s.x + dx / dist * r1, y1 = s.y + dy / dist * r1;
              const x2 = t.x - dx / dist * r2, y2 = t.y - dy / dist * r2;
              const col = isDim ? (pos ? "#0a1e10" : "#1e0a0c") : pos ? "#00cc66" : "#cc2233";
              const op = isDim ? 0.3 : isActive ? 1 : 0.35;
              const mId = isDim ? (pos ? "arr-pos-dim" : "arr-neg-dim") : (pos ? "arr-pos" : "arr-neg");
              const sw = isActive ? 1.8 : 1;

              return (
                <g key={key} opacity={op}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={col} strokeWidth={sw}
                    strokeDasharray={pos ? "none" : "5,3"} markerEnd={`url(#${mId})`} />
                  {isActive && (
                    <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 7}
                      fill={pos ? "#00cc66" : "#cc2233"} fontSize="9" textAnchor="middle"
                      fontFamily="'IBM Plex Mono'" letterSpacing="1">
                      {link.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {NODES.map(node => {
              const pos = positions[node.id];
              if (!pos) return null;
              const isSel = selected?.id === node.id;
              const isHov = hovered === node.id;
              const isDim = highlighted && !highlighted.nodeIds.has(node.id);
              const meta = CATEGORY_META[node.category];
              const r = node.category === "terminal" ? 40 : node.category === "outcome" ? 36 : 30;
              const words = node.label.split(" ");

              return (
                <NodeGroup key={node.id} id={node.id} x={pos.x} y={pos.y} r={r}
                  color={meta.color} isSel={isSel} isHov={isHov} isDim={isDim}
                  words={words} category={node.category}
                  onSelect={() => setSelected(isSel ? null : node)}
                  onHover={() => setHovered(node.id)} onHoverEnd={() => setHovered(null)}
                />
              );
            })}
          </svg>

          {!selected && !hovered && (
            <div style={{ position: "absolute", bottom: "16px", left: "50%", transform: "translateX(-50%)", fontSize: "9px", letterSpacing: "3px", color: "#1e3040", pointerEvents: "none" }}>
              CLICK NODE TO INSPECT
            </div>
          )}
        </div>

        {/* Right panel - below graph on mobile so it doesn't hide the graph */}
        <div className="graph-panel" style={{ width: "280px", flexShrink: 0, borderLeft: "1px solid #0d1822", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Legend />
          <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
            {selected
              ? <NodeInfo node={selected} />
              : <EmptyState />
            }
          </div>
        </div>
      </div>
    </div>
  );
}

function NodeGroup({ id, x, y, r, color, isSel, isHov, isDim, words, category, onSelect, onHover, onHoverEnd }) {
  const isTerminal = category === "terminal";
  const isOutcome = category === "outcome" || isTerminal;

  const onMouseDown = (e) => {
    e.stopPropagation();
    onSelect();
  };

  const op = isDim ? 0.12 : 1;
  const glowFilter = (isSel || isOutcome) && !isDim ? (isTerminal ? "url(#glow-out)" : "url(#glow-soft)") : "none";

  return (
    <g transform={`translate(${x},${y})`} opacity={op} className="node-g"
      onMouseDown={onMouseDown} onMouseEnter={onHover} onMouseLeave={onHoverEnd}
      filter={glowFilter}>
      {isTerminal && <circle r={r + 8} fill="none" stroke={color} strokeWidth="0.5" strokeOpacity="0.5" />}
      {isTerminal && <circle r={r + 14} fill="none" stroke={color} strokeWidth="0.3" strokeOpacity="0.25" />}
      {isOutcome && !isTerminal && <circle r={r + 6} fill="none" stroke={color} strokeWidth="0.5" strokeOpacity="0.3" />}
      <circle className="main" r={r}
        fill={color} fillOpacity={isSel ? 0.95 : 0.65}
        stroke={isSel ? "#ffffff" : isHov ? "#8899aa" : "#111e2a"} strokeWidth={isSel ? 2 : 1}
        style={{ transition: "fill-opacity 0.2s, filter 0.2s" }}
      />
      {words.map((w, i) => (
        <text key={i} x={0} y={-(words.length - 1) * 6 + i * 12}
          textAnchor="middle" fill={isDim ? "#1a2a3a" : "#c0cdd8"}
          fontSize={words.join(" ").length > 16 ? "8" : "9"}
          fontFamily="'IBM Plex Mono'" fontWeight={isSel ? "500" : "300"}>
          {w}
        </text>
      ))}
    </g>
  );
}

function Legend() {
  return (
    <div style={{ padding: "14px 16px", borderBottom: "1px solid #0d1822", flexShrink: 0 }}>
      <div style={{ fontSize: "8px", letterSpacing: "3px", color: "#2a4060", marginBottom: "10px" }}>NODE TYPES</div>
      {Object.entries(CATEGORY_META).map(([cat, { color, label }]) => (
        <div key={cat} style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "5px" }}>
          <div style={{ width: "9px", height: "9px", borderRadius: "50%", background: color, flexShrink: 0 }} />
          <span style={{ fontSize: "10px", color: "#4a6070" }}>{label}</span>
        </div>
      ))}
      <div style={{ borderTop: "1px solid #0d1822", marginTop: "10px", paddingTop: "10px" }}>
        <div style={{ fontSize: "8px", letterSpacing: "3px", color: "#2a4060", marginBottom: "8px" }}>EDGE TYPES</div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
          <svg width="28" height="8" style={{ flexShrink: 0 }}>
            <line x1="0" y1="4" x2="22" y2="4" stroke="#00cc66" strokeWidth="1.5" />
            <polygon points="20,1 20,7 28,4" fill="#00cc66" />
          </svg>
          <span style={{ fontSize: "10px", color: "#4a6070" }}>Amplifies / enables</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <svg width="28" height="8" style={{ flexShrink: 0 }}>
            <line x1="0" y1="4" x2="22" y2="4" stroke="#cc2233" strokeWidth="1.5" strokeDasharray="4,2" />
            <polygon points="20,1 20,7 28,4" fill="#cc2233" />
          </svg>
          <span style={{ fontSize: "10px", color: "#4a6070" }}>Erodes / resists</span>
        </div>
      </div>
    </div>
  );
}

function NodeInfo({ node }) {
  const meta = CATEGORY_META[node.category];
  const incoming = LINKS.filter(l => l.target === node.id);
  const outgoing = LINKS.filter(l => l.source === node.id);

  return (
    <div>
      <div style={{ fontSize: "8px", letterSpacing: "3px", color: "#2a4060", marginBottom: "6px" }}>
        {meta.label.toUpperCase()}
      </div>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", color: meta.color, filter: "brightness(1.6)", marginBottom: "12px", lineHeight: "1.3" }}>
        {node.label}
      </div>
      <div style={{ fontSize: "11px", color: "#5a7080", lineHeight: "1.75", marginBottom: "14px" }}>
        {node.description}
      </div>
      <div style={{ background: "#08101a", border: `1px solid #0d1822`, borderLeft: `2px solid ${meta.color}`, padding: "10px 12px", marginBottom: "16px" }}>
        <div style={{ fontSize: "8px", letterSpacing: "2px", color: "#3a2a10", marginBottom: "5px" }}>THREAT VECTOR</div>
        <div style={{ fontSize: "10px", color: "#6a5030", lineHeight: "1.7" }}>{node.threat}</div>
      </div>

      {incoming.length > 0 && (
        <div style={{ marginBottom: "14px" }}>
          <div style={{ fontSize: "8px", letterSpacing: "2px", color: "#2a4060", marginBottom: "7px" }}>INFLUENCED BY</div>
          {incoming.map(l => {
            const src = NODES.find(n => n.id === l.source);
            return (
              <div key={l.source} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                <span style={{ color: l.weight > 0 ? "#00cc66" : "#cc2233", fontSize: "10px", flexShrink: 0 }}>
                  {l.weight > 0 ? "▲" : "▼"}
                </span>
                <span style={{ fontSize: "10px", color: "#3a5060", flex: 1 }}>{src?.label}</span>
                <span style={{ fontSize: "9px", color: "#1e3040", letterSpacing: "1px" }}>{l.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {outgoing.length > 0 && (
        <div>
          <div style={{ fontSize: "8px", letterSpacing: "2px", color: "#2a4060", marginBottom: "7px" }}>INFLUENCES</div>
          {outgoing.map(l => {
            const tgt = NODES.find(n => n.id === l.target);
            return (
              <div key={l.target} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                <span style={{ color: l.weight > 0 ? "#00cc66" : "#cc2233", fontSize: "10px", flexShrink: 0 }}>
                  {l.weight > 0 ? "▲" : "▼"}
                </span>
                <span style={{ fontSize: "10px", color: "#3a5060", flex: 1 }}>{tgt?.label}</span>
                <span style={{ fontSize: "9px", color: "#1e3040", letterSpacing: "1px" }}>{l.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ color: "#1e3040", fontSize: "11px", lineHeight: "1.8" }}>
      <div style={{ marginBottom: "16px", color: "#2a4060", letterSpacing: "2px", fontSize: "8px" }}>ABOUT</div>
      <div style={{ color: "#2a4060", lineHeight: "1.9" }}>
        Each major AI policy stance — open-sourcing, alignment research, and a global pause — contains a distinct structural pathway to power concentration.
        <br /><br />
        This graph maps the causal dependencies between AI policy choices, risk factors, and totalitarian outcomes.
        <br /><br />
        <span style={{ color: "#1e3040" }}>
          Green edges amplify. Dashed red edges erode or resist. Concentric rings mark terminal states.
        </span>
      </div>
      <div style={{ marginTop: "20px", borderTop: "1px solid #0d1822", paddingTop: "14px", fontSize: "9px", color: "#1e2a38", letterSpacing: "1px" }}>
        CLICK ANY NODE TO INSPECT ITS ROLE IN THE PATHWAY
      </div>
    </div>
  );
}
