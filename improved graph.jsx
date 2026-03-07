import { useState, useMemo, useEffect } from "react";

// ── Layout constants ────────────────────────────────────────────────────────
const VB = 1000, CX = 500, CY = 500, RING_R = 355;
const CENTER_GAP = 160;
const FONT = `'IBM Plex Mono', monospace`;

// ── Category metadata ───────────────────────────────────────────────────────
const CAT_COLOR = {
  policy: "#1A4A8A", ai: "#1A6A3A", risk: "#8A1A1A",
  social: "#0A4A6A", state: "#5A1A7A", outcome: "#7A4A0A", terminal: "#8A0A0A",
};
const CAT_LABEL = {
  policy: "AI Policy", ai: "AI Systems", risk: "Risk Factor",
  social: "Social Fabric", state: "State Power", outcome: "Outcome", terminal: "Terminal State",
};

// Base radius per category; nodes in DOUBLED get ×2
const BASE_R = { policy: 20, ai: 20, risk: 18, social: 18, state: 18, outcome: 30, terminal: 40 };
const DOUBLED = new Set(["emergency_powers", "ai_capability", "mass_casualty", "power_concentration"]);
const getR = n => (BASE_R[n.cat] ?? 18) * (DOUBLED.has(n.id) ? 2 : 1);
const isCenter = n => n.cat === "outcome" || n.cat === "terminal";

// ── Positions ───────────────────────────────────────────────────────────────
function computePositions(nodes) {
  const ring = nodes.filter(n => !isCenter(n));
  const center = nodes.filter(n => isCenter(n));
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

// ── Edge geometry ────────────────────────────────────────────────────────────
function edgePath(sid, tid, pos, nm) {
  const sp = pos[sid], tp = pos[tid];
  if (!sp || !tp) return "";
  const sr = getR(nm[sid]), tr = getR(nm[tid]);
  const mx = (sp.x + tp.x) / 2, my = (sp.y + tp.y) / 2;
  const cpx = mx + (CX - mx) * 0.3, cpy = my + (CY - my) * 0.3;
  const dx1 = cpx - sp.x, dy1 = cpy - sp.y, d1 = Math.sqrt(dx1 * dx1 + dy1 * dy1) || 1;
  const x1 = sp.x + dx1 / d1 * sr, y1 = sp.y + dy1 / d1 * sr;
  const dx2 = tp.x - cpx, dy2 = tp.y - cpy, d2 = Math.sqrt(dx2 * dx2 + dy2 * dy2) || 1;
  const x2 = tp.x - dx2 / d2 * (tr + 9), y2 = tp.y - dy2 / d2 * (tr + 9);
  return `M${x1.toFixed(1)} ${y1.toFixed(1)} Q${cpx.toFixed(1)} ${cpy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
}

function edgeMid(sid, tid, pos) {
  const sp = pos[sid], tp = pos[tid];
  if (!sp || !tp) return { x: CX, y: CY };
  const mx = (sp.x + tp.x) / 2, my = (sp.y + tp.y) / 2;
  const cpx = mx + (CX - mx) * 0.3, cpy = my + (CY - my) * 0.3;
  return { x: (sp.x + tp.x + cpx * 2) / 4, y: (sp.y + tp.y + cpy * 2) / 4 - 10 };
}

const lColor = l => l.color || (l.w > 0 ? "#00bb55" : "#dd2233");
const lMarker = l => l.w > 0 ? "url(#ap)" : "url(#an)";
const lMarkerDim = l => l.w > 0 ? "url(#apd)" : "url(#and)";

// ── Initial data ─────────────────────────────────────────────────────────────
const INIT_NODES = [
  { id: "open_source", cat: "policy", label: ["Open-Source", "AI"],
    desc: "Public release of model weights — enabling anyone to run, modify, and weaponize AI without gatekeeping.",
    threat: "Enables AI-designed pathogens and autonomous weapons. One mass-casualty event attributed to AI creates overwhelming mandate for Patriot Act-scale legislation. Open-source is the ONLY policy pathway with genuine countervailing effects: distributes power broadly, enables civic accountability tools, and may be the most reliable check on concentrated AI control." },
  { id: "ai_capability", cat: "ai", label: ["AI", "Capability"],
    desc: "Raw reasoning, persuasion, autonomy, and scientific discovery capacity of frontier AI systems.",
    threat: "Fuels the military race, structural unemployment, and the full infrastructure for consent manufacturing and surveillance. Also enables distributed tools for resilience, accountability journalism, and civic organizing." },
  { id: "military_ai_race", cat: "ai", label: ["Military AI", "Race"],
    desc: "State competition to develop AI for targeting, autonomous weapons, ISR, and cyber offense.",
    threat: "Compresses decision timelines, increases first-strike incentives, and legitimizes emergency consolidation of civilian AI under military/intelligence oversight — a well-documented historical pattern with nuclear technology." },
  { id: "nuclear_risk", cat: "risk", label: ["Nuclear", "Risk"],
    desc: "Probability of nuclear weapon use — via AI-optimized targeting or non-state actors using AI for materials acquisition.",
    threat: "Near-miss events alone trigger fear-driven legislation. Detonation is not required for the political consequence. Military AI lowers the modeled threshold for 'tactical' scenarios." },
  { id: "mass_casualty", cat: "risk", label: ["Mass Casualty", "Event"],
    desc: "Catastrophic attack — biological, chemical, or AI-autonomous — attributed to AI-enabled actors.",
    threat: "The Patriot Act was drafted and passed within weeks of 9/11. An AI-attributed mass casualty event would produce surveillance and restriction legislation with overwhelming popular mandate. Attribution is key: the event must be legible as AI-caused for the legislative cascade to follow." },
  { id: "mass_unemployment", cat: "risk", label: ["Mass", "Unemployment"],
    desc: "Structural displacement as AI automates knowledge economy work simultaneously, without historical transition periods.",
    threat: "Precarity fuels radicalization and demand for strongman solutions. Shrinks the middle class that sustains democratic norms. Per Bueno de Mesquita: when workers can't threaten regime change, they can be excluded from the winning coalition." },
  { id: "info_ecosystem_collapse", cat: "risk", label: ["Info Ecosystem", "Collapse"],
    desc: "Breakdown of shared epistemic foundations — AI-generated content drowns signal, verification impossible at scale.",
    threat: "Radicalization accelerates as people retreat to tribal information environments. Consent manufacturing becomes trivially cheap. Epistemic commons are the infrastructure of democracy." },
  { id: "political_radicalization", cat: "social", label: ["Political", "Radicalization"],
    desc: "Polarization past the point where opposing factions share institutional legitimacy.",
    threat: "Creates pressure for emergency measures, enables authoritarian actors to claim they are preventing greater violence, and destroys cross-partisan coalitions that constrain executive power." },
  { id: "public_fear", cat: "social", label: ["Public", "Fear"],
    desc: "Generalized existential anxiety following catastrophic events — the political raw material for emergency legislation.",
    threat: "Fear is historically the most reliable mandate for laws otherwise unpassable. Emergency legislation passed under fear rarely includes meaningful sunset clauses or judicial review provisions." },
  { id: "consent_manufacturing", cat: "state", label: ["Consent", "Manufacturing"],
    desc: "AI-enabled personalized persuasion at scale. Also the interpretability pathway: mechanistic sculpting of AI values toward loyalty to specific individuals.",
    threat: "Dissolves the distinction between genuine democratic mandate and manufactured one. Once value circuits in AI are readable, they become writable — loyalty becomes an engineering problem. A leader with both tools can reduce their effective winning coalition to near zero." },
  { id: "emergency_powers", cat: "state", label: ["Emergency", "Powers"],
    desc: "Extraordinary executive authority invoked during crisis — bypassing legislative, judicial, and constitutional constraints.",
    threat: "Emergency powers are rarely fully rescinded. Each crisis leaves a residual expansion that becomes the new baseline. The ratchet is only visible in retrospect against a forgotten prior baseline." },
  { id: "surveillance", cat: "state", label: ["Mass", "Surveillance"],
    desc: "AI-enabled real-time monitoring of communications, movement, finances, and social graphs at population scale.",
    threat: "Makes opposition organizing nearly impossible. Completes the control loop with consent manufacturing: population appears to consent to surveillance that prevents organizing against it." },
  { id: "world_gov", cat: "state", label: ["Supranational", "Authority"],
    desc: "A world governance body with authority to monitor, inspect, and sanction AI development globally.",
    threat: "Any body powerful enough to enforce a global AI pause is powerful enough to impose other policy unilaterally. No historical precedent for a benign supranational authority at this enforcement scope. Enforcement requires the same surveillance infrastructure that enables the terminal state." },
  { id: "civil_liberties", cat: "social", label: ["Civil", "Liberties"],
    desc: "Legal protections for speech, association, privacy, and due process.",
    threat: "Erosion is incremental and each step seems proportionate to the crisis at hand. Total accumulated loss is only visible compared to a baseline people no longer remember." },
  { id: "democratic_resilience", cat: "social", label: ["Democratic", "Resilience"],
    desc: "Institutional capacity to resist power concentration — checks, balances, press freedom, civic norms.",
    threat: "Degrades slowly then fails suddenly when stress exceeds institutional capacity. AI-enabled surveillance and consent manufacturing dramatically accelerate this threshold-crossing." },
  { id: "winning_coalition", cat: "social", label: ["Winning Coalition", "Size ↓"],
    desc: "The minimum number of people a leader must satisfy to remain in power (Bueno de Mesquita). AI enables this to shrink dramatically.",
    threat: "Large coalition forces leaders to provide public goods. Small coalition makes private benefits to a few sufficient. Surveillance, consent manufacturing, and unemployment each independently shrink this number. Together they may reduce it to near zero — the formal completion condition for stable autocracy." },
  { id: "aging_cured", cat: "ai", label: ["Aging", "Cured"],
    desc: "AI-enabled defeat of biological aging — existing power holders and coalition members no longer die of natural causes.",
    threat: "The succession problem in totalitarian regimes stems from needing to recruit new coalition members as old ones die. Curing aging eliminates succession pressure entirely. The winning coalition can remain permanently fixed — no new entrants ever required. Existing totalitarian structures become indefinitely stable without the destabilizing succession dynamic." },
  { id: "perfect_lie_detection", cat: "ai", label: ["Perfect Lie", "Detection"],
    desc: "AI systems capable of identifying deception with near-certainty — applied to loyalty testing, interrogation, and political vetting.",
    threat: "Eliminates the ability to form covert opposition or pretend loyalty while organizing resistance. The winning coalition can be shrunk to only verified loyalists. Removes the last credible threat that excluded groups could pose to the regime." },
  { id: "power_concentration", cat: "outcome", label: ["Power", "Concentration"],
    desc: "Decision-making authority accumulated in a small number of actors with limited accountability mechanisms remaining.",
    threat: "The structural endpoint common to all three AI policy pathways. Open-source → catastrophe → emergency powers. Interpretability → alignment capture (via consent manufacturing). Pause → world government. Three entry points, one destination." },
  { id: "totalitarianism", cat: "terminal", label: ["Stable", "Totalitarianism"],
    desc: "Near-total control over political, economic, and social life — potentially uniquely durable because AI closes every historical escape route simultaneously.",
    threat: "Real-time surveillance eliminates organizing, loyalty-sculpted AI replaces human enforcers, preemptive suppression acts before dissent forms, and a winning coalition reduced to single digits needs no broad legitimacy." },
];

const INIT_LINKS = [
  { s: "open_source", t: "ai_capability", w: 1, lbl: "accelerates" },
  { s: "open_source", t: "mass_casualty", w: 1, lbl: "enables" },
  { s: "open_source", t: "info_ecosystem_collapse", w: 1, lbl: "enables" },
  { s: "open_source", t: "democratic_resilience", w: 1, lbl: "distributes power" },
  { s: "ai_capability", t: "military_ai_race", w: 1, lbl: "fuels" },
  { s: "ai_capability", t: "mass_unemployment", w: 1, lbl: "drives" },
  { s: "ai_capability", t: "info_ecosystem_collapse", w: 1, lbl: "enables" },
  { s: "ai_capability", t: "surveillance", w: 1, lbl: "supercharges" },
  { s: "ai_capability", t: "nuclear_risk", w: 1, lbl: "amplifies" },
  { s: "ai_capability", t: "consent_manufacturing", w: 1, lbl: "enables" },
  { s: "ai_capability", t: "world_gov", w: 1, lbl: "demands governance" },
  { s: "ai_capability", t: "aging_cured", w: 1, lbl: "enables" },
  { s: "ai_capability", t: "perfect_lie_detection", w: 1, lbl: "enables" },
  { s: "military_ai_race", t: "nuclear_risk", w: 1, lbl: "escalates" },
  { s: "military_ai_race", t: "emergency_powers", w: 1, lbl: "justifies" },
  { s: "military_ai_race", t: "power_concentration", w: 1, lbl: "drives" },
  { s: "nuclear_risk", t: "public_fear", w: 1, lbl: "intensifies" },
  { s: "mass_casualty", t: "public_fear", w: 1, lbl: "triggers" },
  { s: "mass_casualty", t: "emergency_powers", w: 1, lbl: "mandates" },
  { s: "mass_unemployment", t: "political_radicalization", w: 1, lbl: "fuels" },
  { s: "mass_unemployment", t: "public_fear", w: 1, lbl: "amplifies" },
  { s: "mass_unemployment", t: "winning_coalition", w: -1, lbl: "shrinks" },
  { s: "info_ecosystem_collapse", t: "political_radicalization", w: 1, lbl: "accelerates" },
  { s: "info_ecosystem_collapse", t: "democratic_resilience", w: -1, lbl: "degrades" },
  { s: "info_ecosystem_collapse", t: "consent_manufacturing", w: 1, lbl: "enables" },
  { s: "political_radicalization", t: "emergency_powers", w: 1, lbl: "justifies" },
  { s: "political_radicalization", t: "democratic_resilience", w: -1, lbl: "degrades" },
  { s: "public_fear", t: "emergency_powers", w: 1, lbl: "demands" },
  { s: "consent_manufacturing", t: "power_concentration", w: 1, lbl: "enables" },
  { s: "consent_manufacturing", t: "democratic_resilience", w: -1, lbl: "undermines" },
  { s: "consent_manufacturing", t: "winning_coalition", w: -1, lbl: "shrinks" },
  { s: "emergency_powers", t: "civil_liberties", w: -1, lbl: "erodes" },
  { s: "emergency_powers", t: "surveillance", w: 1, lbl: "expands" },
  { s: "surveillance", t: "power_concentration", w: 1, lbl: "enables" },
  { s: "surveillance", t: "democratic_resilience", w: -1, lbl: "degrades" },
  { s: "surveillance", t: "winning_coalition", w: -1, lbl: "shrinks" },
  { s: "world_gov", t: "power_concentration", w: 1, lbl: "concentrates" },
  { s: "world_gov", t: "civil_liberties", w: -1, lbl: "threatens" },
  { s: "world_gov", t: "surveillance", w: 1, lbl: "requires" },
  { s: "civil_liberties", t: "democratic_resilience", w: 1, lbl: "sustains" },
  { s: "democratic_resilience", t: "power_concentration", w: -1, lbl: "resists" },
  { s: "winning_coalition", t: "power_concentration", w: -1, lbl: "constrains" },
  { s: "winning_coalition", t: "totalitarianism", w: -1, lbl: "prevents" },
  { s: "power_concentration", t: "totalitarianism", w: 1, lbl: "becomes" },
  { s: "aging_cured", t: "totalitarianism", w: 1, lbl: "stabilizes" },
  { s: "aging_cured", t: "winning_coalition", w: -1, lbl: "shrinks" },
  { s: "perfect_lie_detection", t: "winning_coalition", w: -1, lbl: "shrinks" },
];

// ── NodeLabel ────────────────────────────────────────────────────────────────
function NodeLabel({ node, p }) {
  const lines = Array.isArray(node.label) ? node.label : [node.label];
  const lh = 13, totalH = (lines.length - 1) * lh;
  if (isCenter(node)) {
    return lines.map((line, i) => (
      <text key={i} x={p.x} y={p.y - totalH / 2 + i * lh}
        textAnchor="middle" dominantBaseline="middle"
        fontSize="11" fill="#c8d4de" fontFamily={FONT} fontWeight="500">{line}</text>
    ));
  }
  const r = getR(node);
  const lx = p.x + Math.cos(p.a) * (r + 18);
  const ly = p.y + Math.sin(p.a) * (r + 18);
  const anchor = Math.cos(p.a) > 0.25 ? "start" : Math.cos(p.a) < -0.25 ? "end" : "middle";
  return lines.map((line, i) => (
    <text key={i} x={lx} y={ly - totalH / 2 + i * lh}
      textAnchor={anchor} dominantBaseline="middle"
      fontSize="10" fill="#5a7080" fontFamily={FONT}>{line}</text>
  ));
}

// ── Shared UI primitives ─────────────────────────────────────────────────────
const inputSt = { display: "block", width: "100%", background: "#0a1420", border: "1px solid #1a2a3a", color: "#5a7080", fontSize: "10px", padding: "5px 7px", fontFamily: FONT, marginBottom: "8px", outline: "none", borderRadius: "1px" };
const btnP = { background: "#0d2a3a", border: "1px solid #1a4a5a", color: "#5ab4d4", fontSize: "9px", padding: "5px 10px", cursor: "pointer", letterSpacing: "1px", borderRadius: "1px" };
const btnG = { background: "transparent", border: "1px solid #1a2a3a", color: "#3a5060", fontSize: "9px", padding: "5px 10px", cursor: "pointer", letterSpacing: "1px", borderRadius: "1px" };
const btnD = { background: "#2a0a0a", border: "1px solid #5a1a1a", color: "#cc3344", fontSize: "9px", padding: "5px 10px", cursor: "pointer", letterSpacing: "1px", borderRadius: "1px" };
const Lbl = ({ children }) => <div style={{ fontSize: "8px", letterSpacing: "1px", color: "#2a4050", marginBottom: "4px" }}>{children}</div>;
const Btn = ({ onClick, label, active, style }) => (
  <button onClick={onClick} style={{ background: active ? "#0d2a3a" : "#0d1822", border: `1px solid ${active ? "#2a5a7a" : "#1a2a3a"}`, color: active ? "#5ab4d4" : "#3a5060", fontSize: "9px", letterSpacing: "1px", padding: "4px 8px", cursor: "pointer", borderRadius: "1px", ...style }}>{label}</button>
);

// ── Sub-panels ───────────────────────────────────────────────────────────────
function Legend() {
  return (
    <div style={{ padding: "8px 12px", borderBottom: "1px solid #0d1822", flexShrink: 0 }}>
      <div style={{ fontSize: "7px", letterSpacing: "3px", color: "#1e3040", marginBottom: "6px" }}>NODE TYPES</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 4px", marginBottom: "8px" }}>
        {Object.entries(CAT_LABEL).map(([cat, label]) => (
          <div key={cat} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: CAT_COLOR[cat], flexShrink: 0 }} />
            <span style={{ fontSize: "9px", color: "#3a5060" }}>{label}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <svg width="20" height="6"><line x1="0" y1="3" x2="15" y2="3" stroke="#00bb55" strokeWidth="1.5" /><polygon points="13,0.5 13,5.5 20,3" fill="#00bb55" /></svg>
          <span style={{ fontSize: "8px", color: "#2a4050" }}>amplifies</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <svg width="20" height="6"><line x1="0" y1="3" x2="15" y2="3" stroke="#dd2233" strokeWidth="1.5" strokeDasharray="4,2" /><polygon points="13,0.5 13,5.5 20,3" fill="#dd2233" /></svg>
          <span style={{ fontSize: "8px", color: "#2a4050" }}>erodes/resists</span>
        </div>
      </div>
    </div>
  );
}

function NodeInfo({ node, links, nm }) {
  const col = node.customColor || CAT_COLOR[node.cat] || "#555";
  const label = (Array.isArray(node.label) ? node.label : [node.label]).join(" ");
  const incoming = links.filter(l => l.t === node.id);
  const outgoing = links.filter(l => l.s === node.id);
  const nodeLabel = n => (Array.isArray(n?.label) ? n.label : [n?.label || ""]).join(" ");
  return (
    <div>
      <div style={{ fontSize: "7px", letterSpacing: "3px", color: "#1e3040", marginBottom: "3px" }}>{(CAT_LABEL[node.cat] || "").toUpperCase()}</div>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "15px", lineHeight: 1.3, marginBottom: "8px", color: col, filter: "brightness(1.9)" }}>{label}</div>
      <div style={{ fontSize: "10px", color: "#3a5560", lineHeight: 1.8, marginBottom: "10px" }}>{node.desc}</div>
      {node.threat && (
        <div style={{ background: "#070f18", borderLeft: `2px solid ${col}`, padding: "7px 9px", marginBottom: "12px" }}>
          <div style={{ fontSize: "7px", letterSpacing: "2px", color: "#38280a", marginBottom: "3px" }}>THREAT VECTOR</div>
          <div style={{ fontSize: "9px", color: "#52400a", lineHeight: 1.75 }}>{node.threat}</div>
        </div>
      )}
      {incoming.length > 0 && (
        <div style={{ marginBottom: "10px" }}>
          <div style={{ fontSize: "7px", letterSpacing: "2px", color: "#1a2e40", marginBottom: "4px" }}>INFLUENCED BY</div>
          {incoming.map(l => (
            <div key={l.s} style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "3px" }}>
              <span style={{ fontSize: "10px", color: l.w > 0 ? "#00aa44" : "#cc2030", flexShrink: 0 }}>{l.w > 0 ? "▲" : "▼"}</span>
              <span style={{ fontSize: "9px", color: "#2a4050", flex: 1 }}>{nodeLabel(nm[l.s])}</span>
              <span style={{ fontSize: "8px", color: "#1a2a38" }}>{l.lbl}</span>
            </div>
          ))}
        </div>
      )}
      {outgoing.length > 0 && (
        <div>
          <div style={{ fontSize: "7px", letterSpacing: "2px", color: "#1a2e40", marginBottom: "4px" }}>INFLUENCES</div>
          {outgoing.map(l => (
            <div key={l.t} style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "3px" }}>
              <span style={{ fontSize: "10px", color: l.w > 0 ? "#00aa44" : "#cc2030", flexShrink: 0 }}>{l.w > 0 ? "▲" : "▼"}</span>
              <span style={{ fontSize: "9px", color: "#2a4050", flex: 1 }}>{nodeLabel(nm[l.t])}</span>
              <span style={{ fontSize: "8px", color: "#1a2a38" }}>{l.lbl}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NodeEdit({ node, updateNode, deleteNode }) {
  const [lb, setLb] = useState((Array.isArray(node.label) ? node.label : [node.label]).join("\n"));
  const [cat, setCat] = useState(node.cat);
  const [col, setCol] = useState(node.customColor || "");
  const save = () => updateNode(node.id, { label: lb.split("\n").map(s => s.trim()).filter(Boolean), cat, customColor: col || undefined });
  return (
    <div>
      <div style={{ fontSize: "7px", letterSpacing: "2px", color: "#1e3040", marginBottom: "10px" }}>EDIT NODE</div>
      <Lbl>Label (one line per row)</Lbl>
      <textarea value={lb} onChange={e => setLb(e.target.value)} rows={2} style={{ ...inputSt, resize: "vertical" }} />
      <Lbl>Category</Lbl>
      <select value={cat} onChange={e => setCat(e.target.value)} style={inputSt}>
        {Object.entries(CAT_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>
      <Lbl>Custom color (overrides category default)</Lbl>
      <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "10px" }}>
        <input type="color" value={col || CAT_COLOR[cat] || "#333333"} onChange={e => setCol(e.target.value)}
          style={{ width: "28px", height: "24px", border: "1px solid #1a2a3a", background: "transparent", cursor: "pointer", padding: "1px", flexShrink: 0 }} />
        <input value={col} onChange={e => setCol(e.target.value)} placeholder="hex or blank for default"
          style={{ ...inputSt, flex: 1, marginBottom: 0 }} />
        {col && <button onClick={() => setCol("")} style={{ ...btnG, padding: "0 6px", fontSize: "12px" }}>×</button>}
      </div>
      <div style={{ display: "flex", gap: "6px" }}>
        <button onClick={save} style={btnP}>Save</button>
        <button onClick={() => { if (window.confirm("Delete this node?")) deleteNode(node.id); }} style={btnD}>Delete</button>
      </div>
    </div>
  );
}

function EdgeInfo({ link, nm }) {
  const nodeLabel = n => (Array.isArray(n?.label) ? n.label : [n?.label || ""]).join(" ");
  return (
    <div>
      <div style={{ fontSize: "7px", letterSpacing: "2px", color: "#1e3040", marginBottom: "6px" }}>CONNECTION</div>
      <div style={{ fontSize: "11px", color: "#3a5060", marginBottom: "8px", lineHeight: 1.7 }}>
        <span style={{ color: lColor(link) }}>{link.w > 0 ? "▲" : "▼"} {link.lbl}</span><br />
        <span style={{ fontSize: "10px" }}>{nodeLabel(nm[link.s])} → {nodeLabel(nm[link.t])}</span>
      </div>
    </div>
  );
}

function EdgeEdit({ link, nm, updateLink, deleteLink }) {
  const [lbl, setLbl] = useState(link.lbl);
  const [pos, setPos] = useState(link.w > 0);
  const [col, setCol] = useState(link.color || "");
  const nodeLabel = n => (Array.isArray(n?.label) ? n.label : [n?.label || ""]).join(" ");
  const save = () => updateLink(link.s, link.t, { lbl, w: pos ? 1 : -1, color: col || undefined });
  return (
    <div>
      <div style={{ fontSize: "7px", letterSpacing: "2px", color: "#1e3040", marginBottom: "8px" }}>EDIT CONNECTION</div>
      <div style={{ fontSize: "9px", color: "#3a5060", marginBottom: "10px", lineHeight: 1.6 }}>
        {nodeLabel(nm[link.s])} → {nodeLabel(nm[link.t])}
      </div>
      <Lbl>Label</Lbl>
      <input value={lbl} onChange={e => setLbl(e.target.value)} style={inputSt} />
      <Lbl>Effect direction</Lbl>
      <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
        <button onClick={() => setPos(true)} style={pos ? { ...btnP, background: "#0a2a14", borderColor: "#1a5a2a" } : btnG}>▲ Amplifies</button>
        <button onClick={() => setPos(false)} style={!pos ? { ...btnP, background: "#2a0a0a", borderColor: "#5a1a1a", color: "#cc4455" } : btnG}>▼ Erodes</button>
      </div>
      <Lbl>Custom stroke color</Lbl>
      <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "10px" }}>
        <input type="color" value={col || (pos ? "#00bb55" : "#dd2233")} onChange={e => setCol(e.target.value)}
          style={{ width: "28px", height: "24px", border: "1px solid #1a2a3a", background: "transparent", cursor: "pointer", padding: "1px", flexShrink: 0 }} />
        <input value={col} onChange={e => setCol(e.target.value)} placeholder="blank for default"
          style={{ ...inputSt, flex: 1, marginBottom: 0 }} />
        {col && <button onClick={() => setCol("")} style={{ ...btnG, padding: "0 6px", fontSize: "12px" }}>×</button>}
      </div>
      <div style={{ display: "flex", gap: "6px" }}>
        <button onClick={save} style={btnP}>Save</button>
        <button onClick={() => deleteLink(link.s, link.t)} style={btnD}>Delete</button>
      </div>
    </div>
  );
}

function AddNodeForm({ onAdd, onCancel }) {
  const [label, setLabel] = useState("");
  const [cat, setCat] = useState("risk");
  return (
    <div>
      <div style={{ fontSize: "7px", letterSpacing: "2px", color: "#1e3040", marginBottom: "10px" }}>ADD NODE</div>
      <Lbl>Label (use Enter for second line)</Lbl>
      <textarea value={label} onChange={e => setLabel(e.target.value)} rows={2} style={{ ...inputSt, resize: "vertical" }} />
      <Lbl>Category</Lbl>
      <select value={cat} onChange={e => setCat(e.target.value)} style={inputSt}>
        {Object.entries(CAT_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>
      <div style={{ display: "flex", gap: "6px" }}>
        <button onClick={() => { if (label.trim()) onAdd({ label: label.trim(), cat }); }} style={btnP}>Add</button>
        <button onClick={onCancel} style={btnG}>Cancel</button>
      </div>
    </div>
  );
}

function EmptyState({ editMode }) {
  return (
    <div style={{ fontSize: "10px", lineHeight: 1.9 }}>
      <div style={{ fontSize: "7px", letterSpacing: "2px", color: "#1e3040", marginBottom: "8px" }}>ABOUT</div>
      <p style={{ color: "#253545", marginBottom: "8px" }}>Each major AI policy stance contains a distinct structural pathway to power concentration.</p>
      <p style={{ color: "#1a2a38", marginBottom: "8px" }}>Interpretability and AI Pause are folded into Consent Manufacturing and Supranational Authority respectively.</p>
      <p style={{ color: "#1a2a38" }}>Open-source AI is the only pathway with structural countervailing effects — green edge to Democratic Resilience.</p>
      {editMode && (
        <div style={{ marginTop: "10px", padding: "8px", background: "#07111a", border: "1px solid #0d1e2a", fontSize: "9px", color: "#2a4a5a", lineHeight: 1.8 }}>
          EDIT MODE<br />
          • Click node → edit label, category, color, delete<br />
          • Click "+ Edge" → click source node → click target node<br />
          • Click any edge → edit label, direction, color, delete<br />
          • "+ Node" → add to ring<br />
          • "Export ↓" → save JSON
        </div>
      )}
      <div style={{ marginTop: "12px", paddingTop: "8px", borderTop: "1px solid #0d1822", fontSize: "7px", letterSpacing: "2px", color: "#111e28" }}>
        CLICK NODE TO INSPECT · HOVER TO TRACE
      </div>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [nodes, setNodes] = useState(INIT_NODES);
  const [links, setLinks] = useState(INIT_LINKS);
  const [sel, setSel] = useState(null);   // null | {type:'node',id} | {type:'edge',key}
  const [hov, setHov] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [addingEdge, setAddingEdge] = useState(null); // null | {} | {source:id}
  const [showAddNode, setShowAddNode] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 680);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const pos = useMemo(() => computePositions(nodes), [nodes]);
  const nm = useMemo(() => Object.fromEntries(nodes.map(n => [n.id, n])), [nodes]);

  const activeId = sel?.type === "node" ? sel.id : hov;
  const hi = useMemo(() => {
    if (!activeId) return null;
    const al = links.filter(l => l.s === activeId || l.t === activeId);
    return {
      nodes: new Set([activeId, ...al.map(l => l.s), ...al.map(l => l.t)]),
      links: new Set(al.map(l => `${l.s}::${l.t}`)),
    };
  }, [activeId, links]);

  const handleNodeClick = node => {
    if (addingEdge !== null) {
      if (addingEdge.source === undefined) {
        setAddingEdge({ source: node.id });
      } else if (addingEdge.source !== node.id) {
        const nl = { s: addingEdge.source, t: node.id, w: 1, lbl: "enables" };
        setLinks(ls => [...ls, nl]);
        setAddingEdge(null);
        setSel({ type: "edge", key: `${nl.s}::${nl.t}` });
      }
      return;
    }
    setSel(s => s?.type === "node" && s.id === node.id ? null : { type: "node", id: node.id });
  };

  const handleEdgeClick = (e, link) => {
    if (!editMode) return;
    e.stopPropagation();
    const key = `${link.s}::${link.t}`;
    setSel(s => s?.type === "edge" && s.key === key ? null : { type: "edge", key });
  };

  const updateNode = (id, u) => setNodes(ns => ns.map(n => n.id === id ? { ...n, ...u } : n));
  const deleteNode = id => {
    setNodes(ns => ns.filter(n => n.id !== id));
    setLinks(ls => ls.filter(l => l.s !== id && l.t !== id));
    if (sel?.id === id) setSel(null);
  };
  const updateLink = (s, t, u) => setLinks(ls => ls.map(l => l.s === s && l.t === t ? { ...l, ...u } : l));
  const deleteLink = (s, t) => { setSel(null); setLinks(ls => ls.filter(l => !(l.s === s && l.t === t))); };
  const addNode = data => {
    const id = `${data.label.toLowerCase().replace(/\W+/g, "_")}_${Date.now().toString(36)}`;
    setNodes(ns => [...ns, { id, cat: data.cat, label: data.label.split("\n").map(s => s.trim()).filter(Boolean), desc: "", threat: "" }]);
    setShowAddNode(false);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify({ nodes, links }, null, 2)], { type: "application/json" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "power-graph.json" });
    a.click();
  };

  const selLink = sel?.type === "edge" ? links.find(l => `${l.s}::${l.t}` === sel.key) : null;

  const toggleEdit = () => { setEditMode(e => !e); setSel(null); setAddingEdge(null); setShowAddNode(false); };
  const addingEdgeLabel = addingEdge === null ? "+ Edge" : addingEdge.source === undefined ? "click source…" : `→ ${String(addingEdge.source).split("_")[0]}…`;

  return (
    <div style={{ background: "#06090c", minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: FONT, overflow: "hidden" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500&family=Playfair+Display:ital,wght@0,700;1,400&display=swap');*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#1a2a3a;border-radius:2px}select option{background:#0a1420}`}</style>

      {/* Header */}
      <div style={{ padding: "9px 14px", borderBottom: "1px solid #0d1822", display: "flex", alignItems: "center", gap: "8px", flexShrink: 0, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "7px", letterSpacing: "4px", color: "#1a2e40", marginBottom: "1px" }}>THREAT SYSTEMS ANALYSIS</div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "15px", color: "#9aabb8", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            AI Policy → Totalitarian Failure Modes
          </h1>
        </div>
        <div style={{ display: "flex", gap: "5px", alignItems: "center", flexShrink: 0, flexWrap: "wrap" }}>
          {editMode && <>
            <Btn onClick={() => { setShowAddNode(true); setSel(null); }} label="+ Node" />
            <Btn onClick={() => setAddingEdge(a => a !== null ? null : {})} label={addingEdgeLabel} active={addingEdge !== null} />
            <Btn onClick={exportJSON} label="Export ↓" />
          </>}
          <button onClick={toggleEdit} style={{ background: editMode ? "#0d2238" : "#0d1822", border: `1px solid ${editMode ? "#1a4a6a" : "#1a2a3a"}`, color: editMode ? "#5a9ab8" : "#3a5060", fontSize: "9px", letterSpacing: "2px", padding: "5px 9px", cursor: "pointer", borderRadius: "1px" }}>
            {editMode ? "EXIT EDIT" : "EDIT MODE"}
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: "flex", flex: 1, flexDirection: mobile ? "column" : "row", minHeight: 0, overflow: "hidden" }}>

        {/* SVG canvas */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "4px", minHeight: 0 }}>
          <svg viewBox={`0 0 ${VB} ${VB}`} preserveAspectRatio="xMidYMid meet"
            style={{ width: "100%", height: "100%", maxHeight: mobile ? "60vw" : "calc(100vh - 52px)", display: "block" }}>
            <defs>
              {[{ id: "ap", c: "#00bb55" }, { id: "an", c: "#dd2233" }, { id: "apd", c: "#041408" }, { id: "and", c: "#140408" }].map(({ id, c }) => (
                <marker key={id} id={id} markerWidth="7" markerHeight="6" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L7,3 z" fill={c} />
                </marker>
              ))}
              <filter id="g1"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              <filter id="g2"><feGaussianBlur stdDeviation="9" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>

            <rect width={VB} height={VB} fill="#06090c" />
            <circle cx={CX} cy={CY} r={RING_R} fill="none" stroke="#0d1820" strokeWidth="1" strokeDasharray="2,8" />

            {/* Edges */}
            {links.map(lk => {
              const key = `${lk.s}::${lk.t}`;
              const isAct = hi?.links.has(key);
              const isDim = hi && !isAct;
              const isSel = sel?.type === "edge" && sel.key === key;
              const col = isDim ? (lk.w > 0 ? "#041408" : "#140408") : lColor(lk);
              const marker = isDim ? lMarkerDim(lk) : lMarker(lk);
              const d = edgePath(lk.s, lk.t, pos, nm);
              const mid = (isAct || isSel) ? edgeMid(lk.s, lk.t, pos) : null;
              return (
                <g key={key} opacity={isDim ? 0.28 : 1}>
                  <path d={d} fill="none" stroke={col}
                    strokeWidth={isSel ? 2.5 : isAct ? 1.8 : 0.9}
                    strokeDasharray={lk.w < 0 ? "5,3" : "none"}
                    markerEnd={marker} />
                  {editMode && (
                    <path d={d} fill="none" stroke="transparent" strokeWidth="14"
                      style={{ cursor: "pointer" }} onClick={e => handleEdgeClick(e, lk)} />
                  )}
                  {(isAct || isSel) && mid && (
                    <text x={mid.x} y={mid.y} textAnchor="middle" fontSize="8"
                      fill={lColor(lk)} fontFamily={FONT}>{lk.lbl}</text>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map(node => {
              const p = pos[node.id];
              if (!p) return null;
              const r = getR(node);
              const col = node.customColor || CAT_COLOR[node.cat] || "#333";
              const isSel = sel?.type === "node" && sel.id === node.id;
              const isHov = hov === node.id;
              const isDim = hi && !hi.nodes.has(node.id);
              const isT = node.cat === "terminal";
              const isO = node.cat === "outcome";
              const isAddSrc = addingEdge?.source === node.id;
              return (
                <g key={node.id} opacity={isDim ? 0.07 : 1} style={{ cursor: "pointer" }}
                  onClick={() => handleNodeClick(node)}
                  onMouseEnter={() => setHov(node.id)}
                  onMouseLeave={() => setHov(null)}>
                  {isT && <>
                    <circle cx={p.x} cy={p.y} r={r + 14} fill="none" stroke={col} strokeWidth="0.7" strokeOpacity="0.35" />
                    <circle cx={p.x} cy={p.y} r={r + 24} fill="none" stroke={col} strokeWidth="0.3" strokeOpacity="0.18" />
                  </>}
                  {isO && <circle cx={p.x} cy={p.y} r={r + 11} fill="none" stroke={col} strokeWidth="0.5" strokeOpacity="0.3" />}
                  {isAddSrc && <circle cx={p.x} cy={p.y} r={r + 7} fill="none" stroke="#5ab4d4" strokeWidth="2" strokeDasharray="4,2" />}
                  <circle cx={p.x} cy={p.y} r={r}
                    fill={col} fillOpacity={isSel ? 1 : 0.72}
                    stroke={isSel ? "#ccd8e4" : isHov ? "#4a6070" : "#0d1822"}
                    strokeWidth={isSel ? 2 : 1}
                    filter={isT ? "url(#g2)" : isSel ? "url(#g1)" : "none"} />
                  <NodeLabel node={node} p={p} />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Right panel */}
        <div style={{ width: mobile ? "100%" : "270px", flexShrink: 0, borderLeft: mobile ? "none" : "1px solid #0d1822", borderTop: mobile ? "1px solid #0d1822" : "none", display: "flex", flexDirection: "column", overflow: "hidden", maxHeight: mobile ? "45vw" : undefined }}>
          <Legend />
          <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
            {editMode && showAddNode
              ? <AddNodeForm onAdd={addNode} onCancel={() => setShowAddNode(false)} />
              : sel?.type === "node" && nm[sel.id]
                ? editMode
                  ? <NodeEdit node={nm[sel.id]} updateNode={updateNode} deleteNode={deleteNode} />
                  : <NodeInfo node={nm[sel.id]} links={links} nm={nm} />
                : sel?.type === "edge" && selLink
                  ? editMode
                    ? <EdgeEdit link={selLink} nm={nm} updateLink={updateLink} deleteLink={deleteLink} />
                    : <EdgeInfo link={selLink} nm={nm} />
                  : <EmptyState editMode={editMode} />
            }
          </div>
        </div>
      </div>
    </div>
  );
}
