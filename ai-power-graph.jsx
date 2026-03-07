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
  {
    id: "aging_cured", label: "Aging Cured", category: "ai",
    description: "AI-enabled defeat of biological aging — existing power holders and coalition members no longer die of natural causes.",
    threat: "The succession problem in totalitarian regimes stems from needing to recruit new coalition members as old ones die. Curing aging eliminates succession pressure entirely; the ruling coalition can remain permanently fixed.",
  },
  {
    id: "regime_stability", label: "Regime Stability", category: "outcome",
    description: "The succession question in totalitarian regimes is a problem stemming from adding new people to the ruling coalition as older members die. Technologies that remove succession pressure (e.g. longevity, perfect loyalty detection) directly enable regime stability.",
    threat: "Without succession pressure, totalitarian structures can become indefinitely stable with no destabilizing turnover.",
  },
  {
    id: "perfect_lie_detection", label: "Perfect Lie Detection", category: "ai",
    description: "AI systems capable of identifying deception with near-certainty — applied to loyalty testing, interrogation, and political vetting.",
    threat: "Eliminates the ability to form covert opposition or pretend loyalty while organizing resistance. The winning coalition can be shrunk to only verified loyalists.",
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
  { source: "ai_capability", target: "aging_cured", weight: 0.7, label: "enables" },
  { source: "aging_cured", target: "regime_stability", weight: 0.85, label: "stabilizes" },
  { source: "ai_capability", target: "perfect_lie_detection", weight: 0.65, label: "enables" },
  { source: "perfect_lie_detection", target: "regime_stability", weight: 0.8, label: "strengthens" },
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

// Layout from improved graph: 1000 viewBox, ring + center nodes, curved edges
const VB = 1000;
const CX = 500;
const CY = 500;
const RING_R = 355;
const CENTER_GAP = 160;

const isCenter = (node) => node.category === "outcome" || node.category === "terminal";

const BASE_R = { policy: 20, ai: 20, risk: 18, social: 18, state: 18, outcome: 30, terminal: 40 };
const DOUBLED = new Set(["ai_capability", "mass_casualty", "emergency_powers", "power_concentration"]);
const getR = (node) => (BASE_R[node.category] ?? 18) * (DOUBLED.has(node.id) ? 2 : 1);

function computePositions(nodes) {
  const ring = nodes.filter((n) => !isCenter(n));
  const center = nodes.filter((n) => isCenter(n));
  const pos = {};
  ring.forEach((n, i) => {
    const a = (i / ring.length) * Math.PI * 2 - Math.PI / 2;
    pos[n.id] = { x: CX + RING_R * Math.cos(a), y: CY + RING_R * Math.sin(a), a };
  });
  const totalH = (center.length - 1) * CENTER_GAP;
  center.forEach((n, i) => {
    pos[n.id] = { x: CX, y: CY - totalH / 2 + i * CENTER_GAP, a: 0 };
  });
  return pos;
}

function edgePath(sid, tid, pos, nm) {
  const sp = pos[sid];
  const tp = pos[tid];
  if (!sp || !tp) return "";
  const sr = getR(nm[sid]);
  const tr = getR(nm[tid]);
  const mx = (sp.x + tp.x) / 2;
  const my = (sp.y + tp.y) / 2;
  const cpx = mx + (CX - mx) * 0.3;
  const cpy = my + (CY - my) * 0.3;
  const dx1 = cpx - sp.x;
  const dy1 = cpy - sp.y;
  const d1 = Math.sqrt(dx1 * dx1 + dy1 * dy1) || 1;
  const x1 = sp.x + (dx1 / d1) * sr;
  const y1 = sp.y + (dy1 / d1) * sr;
  const dx2 = tp.x - cpx;
  const dy2 = tp.y - cpy;
  const d2 = Math.sqrt(dx2 * dx2 + dy2 * dy2) || 1;
  const x2 = tp.x - (dx2 / d2) * (tr + 9);
  const y2 = tp.y - (dy2 / d2) * (tr + 9);
  return `M${x1.toFixed(1)} ${y1.toFixed(1)} Q${cpx.toFixed(1)} ${cpy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
}

function edgeMid(sid, tid, pos) {
  const sp = pos[sid];
  const tp = pos[tid];
  if (!sp || !tp) return { x: CX, y: CY };
  const mx = (sp.x + tp.x) / 2;
  const my = (sp.y + tp.y) / 2;
  const cpx = mx + (CX - mx) * 0.3;
  const cpy = my + (CY - my) * 0.3;
  return { x: (sp.x + tp.x + cpx * 2) / 4, y: (sp.y + tp.y + cpy * 2) / 4 - 10 };
}

const NODE_MAP = Object.fromEntries(NODES.map((n) => [n.id, n]));
const RING_POSITIONS = computePositions(NODES);

const linkKey = (l) => `${l.source}::${l.target}`;
const linkColor = (link) => link.color ?? (link.weight > 0 ? "#00cc66" : "#cc2233");

export default function AiPowerGraph() {
  const containerRef = useRef(null);
  const [links, setLinks] = useState(() => LINKS.map((l) => ({ ...l })));
  const [selected, setSelected] = useState(null); // { type: 'node', node } | { type: 'link', link } | null
  const [hovered, setHovered] = useState(null);
  const [addingLinkSource, setAddingLinkSource] = useState(null); // null | nodeId when waiting for target
  const [containerSize, setContainerSize] = useState({ w: VB, h: VB });
  const [authToken, setAuthToken] = useState(() => typeof localStorage !== "undefined" ? localStorage.getItem("graph_auth_token") : null);
  const [username, setUsername] = useState(() => typeof localStorage !== "undefined" ? localStorage.getItem("graph_username") : null);
  const [saveStatus, setSaveStatus] = useState(null);
  const positions = RING_POSITIONS;

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ w: rect.width || VB, h: Math.max(rect.height, 400) });
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const activeNodeId = selected?.type === "node" ? selected.node?.id : hovered;
  const selectedLink = selected?.type === "link" ? selected.link : null;
  const highlighted = useMemo(() => {
    const activeId = activeNodeId;
    if (!activeId && !selectedLink) return null;
    const activeLinks = links.filter((l) => l.source === activeId || l.target === activeId || selectedLink === l);
    const nodeIds = new Set([
      ...(activeId ? [activeId] : []),
      ...(selectedLink ? [selectedLink.source, selectedLink.target] : []),
      ...activeLinks.flatMap((l) => [l.source, l.target]),
    ]);
    const linkKeys = new Set(activeLinks.map((l) => linkKey(l)));
    return { nodeIds, linkKeys };
  }, [activeNodeId, selectedLink, links]);

  const handleNodeClick = (node) => {
    if (addingLinkSource !== null) {
      if (addingLinkSource === "") {
        setAddingLinkSource(node.id);
      } else if (addingLinkSource !== node.id) {
        if (!links.some((l) => l.source === addingLinkSource && l.target === node.id)) {
          setLinks((prev) => [...prev, { source: addingLinkSource, target: node.id, weight: 1, label: "enables" }]);
        }
        setAddingLinkSource(null);
      }
      return;
    }
    setSelected((s) => (s?.type === "node" && s.node?.id === node.id ? null : { type: "node", node }));
  };

  const updateLink = (source, target, updates) => {
    setLinks((prev) => prev.map((l) => (l.source === source && l.target === target ? { ...l, ...updates } : l)));
    if (selectedLink && selectedLink.source === source && selectedLink.target === target) {
      setSelected({ type: "link", link: { ...selectedLink, ...updates } });
    }
  };
  const deleteLink = (source, target) => {
    setLinks((prev) => prev.filter((l) => !(l.source === source && l.target === target)));
    setSelected(null);
  };

  const apiBase = "";
  const authHeaders = () => (authToken ? { Authorization: `Bearer ${authToken}` } : {});

  const register = async (u, p) => {
    try {
      const res = await fetch(`${apiBase}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password: p }),
      });
      const data = await res.json();
      if (data.error) { setSaveStatus(data.error); return; }
      if (data.token) {
        localStorage.setItem("graph_auth_token", data.token);
        localStorage.setItem("graph_username", data.username);
        setAuthToken(data.token);
        setUsername(data.username);
        setSaveStatus("Registered and logged in.");
      }
    } catch (e) {
      setSaveStatus("Error: " + (e.message || "Server unreachable"));
    }
  };
  const login = async (u, p) => {
    try {
      const res = await fetch(`${apiBase}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password: p }),
      });
      const data = await res.json();
      if (data.error) { setSaveStatus(data.error); return; }
      if (data.token) {
        localStorage.setItem("graph_auth_token", data.token);
        localStorage.setItem("graph_username", data.username);
        setAuthToken(data.token);
        setUsername(data.username);
        setSaveStatus("Logged in.");
      }
    } catch (e) {
      setSaveStatus("Error: " + (e.message || "Server unreachable"));
    }
  };
  const logout = () => {
    localStorage.removeItem("graph_auth_token");
    localStorage.removeItem("graph_username");
    setAuthToken(null);
    setUsername(null);
    setSaveStatus(null);
  };
  const saveGraph = async () => {
    if (!authToken) { setSaveStatus("Log in first."); return; }
    setSaveStatus("saving");
    try {
      const res = await fetch(`${apiBase}/api/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ links }),
      });
      if (!res.ok) { const t = await res.text(); throw new Error(t); }
      setSaveStatus("Saved.");
    } catch (e) {
      setSaveStatus("Error: " + (e.message || "Save failed"));
    }
  };
  const loadGraph = async () => {
    if (!authToken) { setSaveStatus("Log in first."); return; }
    try {
      const res = await fetch(`${apiBase}/api/load`, { headers: authHeaders() });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (data.links && Array.isArray(data.links)) {
        setLinks(data.links);
        setSaveStatus("Loaded.");
      }
    } catch (e) {
      setSaveStatus("Error: " + (e.message || "Load failed"));
    }
  };

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
            viewBox={`0 0 ${VB} ${VB}`}
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
            <rect width={VB} height={VB} fill="url(#bg-grad)" />
            <circle cx={CX} cy={CY} r={RING_R} fill="none" stroke="#0d1820" strokeWidth="1" strokeDasharray="2,8" />

            {/* Links – curved paths toward center */}
            {links.map((link) => {
              const key = linkKey(link);
              const isActive = highlighted?.linkKeys.has(key);
              const isDim = highlighted && !isActive;
              const pos = link.weight > 0;
              const col = isDim ? (pos ? "#0a1e10" : "#1e0a0c") : linkColor(link);
              const op = isDim ? 0.28 : 1;
              const mId = isDim ? (pos ? "arr-pos-dim" : "arr-neg-dim") : (pos ? "arr-pos" : "arr-neg");
              const sw = isActive ? 1.8 : 0.9;
              const d = edgePath(link.source, link.target, positions, NODE_MAP);
              const mid = isActive ? edgeMid(link.source, link.target, positions) : null;

              return (
                <g key={key} opacity={op}>
                  <path
                    d={d}
                    fill="none"
                    stroke={col}
                    strokeWidth={sw}
                    strokeDasharray={pos ? "none" : "5,3"}
                    markerEnd={`url(#${mId})`}
                  />
                  <path
                    d={d}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="16"
                    style={{ cursor: "pointer" }}
                    onClick={(e) => { e.stopPropagation(); setSelected((s) => (s?.type === "link" && linkKey(s.link) === key ? null : { type: "link", link })); }}
                  />
                  {isActive && mid && (
                    <text x={mid.x} y={mid.y} textAnchor="middle" fontSize="8" fill={linkColor(link)} fontFamily="'IBM Plex Mono'" letterSpacing="1">
                      {link.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Nodes – ring + center, radius from getR */}
            {NODES.map((node) => {
              const pos = positions[node.id];
              if (!pos) return null;
              const isSel = selected?.type === "node" && selected.node?.id === node.id;
              const isHov = hovered === node.id;
              const isDim = highlighted && !highlighted.nodeIds.has(node.id);
              const meta = CATEGORY_META[node.category];
              const r = getR(node);
              const words = node.label.split(" ");

              const isAddSrc = addingLinkSource === node.id;
              return (
                <NodeGroup key={node.id} id={node.id} x={pos.x} y={pos.y} r={r}
                  color={meta.color} isSel={isSel} isHov={isHov} isDim={isDim}
                  words={words} category={node.category} isAddSource={isAddSrc}
                  onSelect={() => handleNodeClick(node)}
                  onHover={() => setHovered(node.id)} onHoverEnd={() => setHovered(null)}
                />
              );
            })}
          </svg>

          <div style={{ position: "absolute", bottom: "16px", left: "50%", transform: "translateX(-50%)", fontSize: "9px", letterSpacing: "3px", color: "#1e3040", pointerEvents: "none", textAlign: "center" }}>
            {addingLinkSource ? (addingLinkSource === "" ? "Click source node" : "Click target node") : !selected && !hovered ? "CLICK NODE TO INSPECT · CLICK EDGE TO EDIT" : null}
          </div>
        </div>

        {/* Right panel - below graph on mobile so it doesn't hide the graph */}
        <div className="graph-panel" style={{ width: "280px", flexShrink: 0, borderLeft: "1px solid #0d1822", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Legend />
          <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
            {selected?.type === "link"
              ? <EdgeEdit key={linkKey(selected.link)} link={selected.link} nodeMap={NODE_MAP} onUpdate={updateLink} onDelete={deleteLink} onClose={() => setSelected(null)} />
              : selected?.type === "node"
                ? <NodeInfo node={selected.node} links={links} />
                : <EmptyState
                    onAddConnection={() => setAddingLinkSource(addingLinkSource === null ? "" : null)}
                    addingLinkSource={addingLinkSource}
                    onRegister={register}
                    onLogin={login}
                    onLogout={logout}
                    onSave={saveGraph}
                    onLoad={loadGraph}
                    authToken={authToken}
                    username={username}
                    saveStatus={saveStatus}
                  />
            }
          </div>
        </div>
      </div>
    </div>
  );
}

function NodeGroup({ id, x, y, r, color, isSel, isHov, isDim, words, category, isAddSource, onSelect, onHover, onHoverEnd }) {
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
      {isAddSource && <circle r={r + 10} fill="none" stroke="#5ab4d4" strokeWidth="2" strokeDasharray="4,3" />}
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

function NodeInfo({ node, links }) {
  const meta = CATEGORY_META[node.category];
  const incoming = links.filter((l) => l.target === node.id);
  const outgoing = links.filter((l) => l.source === node.id);

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

function EdgeEdit({ link, nodeMap, onUpdate, onDelete, onClose }) {
  const [label, setLabel] = useState(link.label);
  const [color, setColor] = useState(link.color ?? "");
  const [weightPos, setWeightPos] = useState(link.weight > 0);
  const src = nodeMap[link.source];
  const tgt = nodeMap[link.target];
  const save = () => {
    onUpdate(link.source, link.target, { label, color: color || undefined, weight: weightPos ? 1 : -1 });
  };
  return (
    <div>
      <div style={{ fontSize: "8px", letterSpacing: "2px", color: "#2a4060", marginBottom: "6px" }}>EDIT CONNECTION</div>
      <div style={{ fontSize: "10px", color: "#5a7080", marginBottom: "10px" }}>
        {src?.label} → {tgt?.label}
      </div>
      <label style={{ display: "block", fontSize: "9px", color: "#3a5060", marginBottom: "4px" }}>Label</label>
      <input value={label} onChange={(e) => setLabel(e.target.value)} style={{ width: "100%", background: "#0a1420", border: "1px solid #1a2a3a", color: "#8a9aa8", fontSize: "11px", padding: "6px 8px", marginBottom: "10px", borderRadius: "2px" }} />
      <label style={{ display: "block", fontSize: "9px", color: "#3a5060", marginBottom: "4px" }}>Color (optional)</label>
      <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "10px" }}>
        <input type="color" value={color || (weightPos ? "#00cc66" : "#cc2233")} onChange={(e) => setColor(e.target.value)} style={{ width: "28px", height: "24px", border: "1px solid #1a2a3a", background: "transparent", cursor: "pointer", padding: 0 }} />
        <input value={color} onChange={(e) => setColor(e.target.value)} placeholder="hex or blank" style={{ flex: 1, background: "#0a1420", border: "1px solid #1a2a3a", color: "#5a7080", fontSize: "10px", padding: "5px 8px", borderRadius: "2px" }} />
      </div>
      <label style={{ display: "block", fontSize: "9px", color: "#3a5060", marginBottom: "4px" }}>Direction</label>
      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        <button type="button" onClick={() => setWeightPos(true)} style={{ padding: "4px 10px", fontSize: "10px", background: weightPos ? "#0d2a18" : "#0d1822", border: `1px solid ${weightPos ? "#1a5a2a" : "#1a2a3a"}`, color: weightPos ? "#00cc66" : "#3a5060", borderRadius: "2px", cursor: "pointer" }}>▲ Amplifies</button>
        <button type="button" onClick={() => setWeightPos(false)} style={{ padding: "4px 10px", fontSize: "10px", background: !weightPos ? "#2a0a0a" : "#0d1822", border: `1px solid ${!weightPos ? "#5a1a1a" : "#1a2a3a"}`, color: !weightPos ? "#cc2233" : "#3a5060", borderRadius: "2px", cursor: "pointer" }}>▼ Erodes</button>
      </div>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button type="button" onClick={save} style={{ padding: "6px 12px", fontSize: "10px", background: "#0d2a3a", border: "1px solid #1a4a5a", color: "#5ab4d4", borderRadius: "2px", cursor: "pointer" }}>Save</button>
        <button type="button" onClick={onClose} style={{ padding: "6px 12px", fontSize: "10px", background: "transparent", border: "1px solid #1a2a3a", color: "#5a7080", borderRadius: "2px", cursor: "pointer" }}>Close</button>
        <button type="button" onClick={() => { if (typeof window !== "undefined" && window.confirm("Delete this connection?")) onDelete(link.source, link.target); }} style={{ padding: "6px 12px", fontSize: "10px", background: "#2a0a0a", border: "1px solid #5a1a1a", color: "#cc4455", borderRadius: "2px", cursor: "pointer" }}>Delete</button>
      </div>
    </div>
  );
}

function EmptyState({ onAddConnection, addingLinkSource, onRegister, onLogin, onLogout, onSave, onLoad, authToken, username, saveStatus }) {
  const [regUser, setRegUser] = useState("");
  const [regPass, setRegPass] = useState("");
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const inputStyle = { width: "100%", marginBottom: "6px", background: "#0a1420", border: "1px solid #1a2a3a", color: "#8a9aa8", fontSize: "11px", padding: "5px 8px", borderRadius: "2px", boxSizing: "border-box" };
  const btn = (onClick, label, primary) => ({ padding: "5px 10px", fontSize: "9px", background: primary ? "#0d2a3a" : "transparent", border: `1px solid ${primary ? "#1a4a5a" : "#1a2a3a"}`, color: primary ? "#5ab4d4" : "#5a7080", borderRadius: "2px", cursor: "pointer" });
  return (
    <div style={{ color: "#1e3040", fontSize: "11px", lineHeight: "1.8" }}>
      <div style={{ marginBottom: "12px", color: "#2a4060", letterSpacing: "2px", fontSize: "8px" }}>CONNECTIONS</div>
      <button type="button" onClick={onAddConnection} style={{ marginBottom: "16px", padding: "6px 12px", fontSize: "10px", background: addingLinkSource !== null ? "#1a3a4a" : "#0d1822", border: "1px solid #1a2a3a", color: "#5a9ab8", borderRadius: "2px", cursor: "pointer" }}>
        {addingLinkSource !== null ? "Cancel add connection" : "Add connection"}
      </button>

      <div style={{ marginBottom: "10px", color: "#2a4060", letterSpacing: "2px", fontSize: "8px" }}>SAVE / LOAD</div>
      {!authToken ? (
        <>
          <div style={{ fontSize: "9px", color: "#3a5060", marginBottom: "4px" }}>Register</div>
          <input value={regUser} onChange={(e) => setRegUser(e.target.value)} placeholder="Username" style={inputStyle} />
          <input type="password" value={regPass} onChange={(e) => setRegPass(e.target.value)} placeholder="Password" style={inputStyle} />
          <button type="button" onClick={() => { if (regUser.trim() && regPass) onRegister(regUser.trim(), regPass); }} style={btn(null, "Register", true)}>Register</button>
          <div style={{ fontSize: "9px", color: "#3a5060", marginTop: "12px", marginBottom: "4px" }}>Login</div>
          <input value={loginUser} onChange={(e) => setLoginUser(e.target.value)} placeholder="Username" style={inputStyle} />
          <input type="password" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} placeholder="Password" style={inputStyle} />
          <button type="button" onClick={() => { if (loginUser.trim() && loginPass) onLogin(loginUser.trim(), loginPass); }} style={btn(null, "Login", true)}>Login</button>
        </>
      ) : (
        <>
          <div style={{ fontSize: "10px", color: "#5a7080", marginBottom: "8px" }}>Logged in as <strong style={{ color: "#7a90a8" }}>{username}</strong></div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "6px" }}>
            <button type="button" onClick={onSave} style={btn(null, "Save", true)}>Save</button>
            <button type="button" onClick={onLoad} style={btn(null, "Load", false)}>Load</button>
            <button type="button" onClick={onLogout} style={{ ...btn(null, "Logout", false), color: "#8a5566" }}>Logout</button>
          </div>
        </>
      )}
      {saveStatus && <div style={{ fontSize: "10px", color: saveStatus.toLowerCase().startsWith("error") ? "#aa4444" : "#3a6060", marginTop: "6px" }}>{saveStatus}</div>}

      <div style={{ marginTop: "20px", paddingTop: "14px", borderTop: "1px solid #0d1822", color: "#2a4060", letterSpacing: "2px", fontSize: "8px" }}>ABOUT</div>
      <div style={{ color: "#2a4060", lineHeight: "1.9", marginTop: "6px" }}>
        Each major AI policy stance contains a distinct structural pathway to power concentration. This graph maps causal dependencies. Green edges amplify; dashed red erode or resist.
      </div>
      <div style={{ marginTop: "12px", fontSize: "9px", color: "#1e2a38", letterSpacing: "1px" }}>
        CLICK NODE TO INSPECT · CLICK EDGE TO EDIT
      </div>
    </div>
  );
}
