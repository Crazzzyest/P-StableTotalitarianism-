/**
 * Canonical graph spec: positions, layers, categories, nodes, links.
 * layout: layered-left-to-right; positions from longest-path (critical path).
 */
export const GRAPH_SPEC = {
  meta: {
    title: "AI Policy → Totalitarian Failure Modes",
    subtitle: "Dependency graph mapping causal chains from AI policy choices to power concentration outcomes",
    layout: "layered-left-to-right",
    layerAlgorithm: "longest-path (critical path)",
    edgeConvention: { positive: "amplifies/enables (green solid)", negative: "erodes/resists (red dashed)" },
  },
  categories: [
    { id: "policy", label: "AI Policy", color: "#1A4A8A" },
    { id: "ai", label: "AI Systems", color: "#1A6A3A" },
    { id: "risk", label: "Risk Factor", color: "#8A1A1A" },
    { id: "social", label: "Social Fabric", color: "#0A4A6A" },
    { id: "state", label: "State Power", color: "#5A1A7A" },
    { id: "outcome", label: "Outcome", color: "#7A4A0A" },
    { id: "terminal", label: "Terminal State", color: "#8A0A0A" },
  ],
  sizeRules: {
    baseRadius: { policy: 20, ai: 20, risk: 18, social: 18, state: 18, outcome: 30, terminal: 42 },
    doubled: ["emergency_powers", "ai_capability", "mass_casualty", "power_concentration"],
  },
  nodes: [
    { id: "open_source", label: "Open-Source AI", labelLines: ["Open-Source", "AI"], category: "policy", description: "Public release of model weights — enabling anyone to run, modify, and weaponize AI without gatekeeping.", threatVector: "Enables AI-designed pathogens and autonomous weapons. One mass-casualty event attributed to AI creates overwhelming mandate for Patriot Act-scale legislation. Open-source is the ONLY policy pathway with genuine countervailing effects: distributes power broadly, enables civic accountability tools, and may be the most reliable check on concentrated AI control.", layer: 0, layerName: "ROOT", position: { x: 80, y: 425 }, radius: 20 },
    { id: "ai_capability", label: "AI Capability", labelLines: ["AI", "Capability"], category: "ai", description: "Raw reasoning, persuasion, autonomy, and scientific discovery capacity of frontier AI systems.", threatVector: "Fuels the military race, structural unemployment, and the full infrastructure for consent manufacturing and surveillance. Also enables distributed tools for resilience, accountability journalism, and civic organizing.", layer: 1, layerName: "1ST ORDER", position: { x: 290, y: 368 }, radius: 40 },
    { id: "military_ai_race", label: "Military AI Race", labelLines: ["Military AI", "Race"], category: "ai", description: "State competition to develop AI for targeting, autonomous weapons, ISR, and cyber offense.", threatVector: "Compresses decision timelines, increases first-strike incentives, and legitimizes emergency consolidation of civilian AI under military/intelligence oversight.", layer: 2, layerName: "2ND ORDER", position: { x: 500, y: 138 }, radius: 20 },
    { id: "nuclear_risk", label: "Nuclear Risk", labelLines: ["Nuclear", "Risk"], category: "risk", description: "Probability of nuclear weapon use — via AI-optimized targeting or non-state actors using AI for materials acquisition.", threatVector: "Near-miss events alone trigger fear-driven legislation. Military AI lowers the modeled threshold for 'tactical' scenarios, making escalation easier to rationalize.", layer: 3, layerName: "3RD ORDER", position: { x: 710, y: 310 }, radius: 18 },
    { id: "mass_casualty", label: "Mass Casualty Event", labelLines: ["Mass Casualty", "Event"], category: "risk", description: "Catastrophic attack — biological, chemical, or AI-autonomous — attributed to AI-enabled actors.", threatVector: "The Patriot Act was drafted and passed within weeks of 9/11. An AI-attributed mass casualty event would produce surveillance and restriction legislation with overwhelming popular mandate.", layer: 1, layerName: "1ST ORDER", position: { x: 290, y: 483 }, radius: 36 },
    { id: "mass_unemployment", label: "Mass Unemployment", labelLines: ["Mass", "Unemployment"], category: "risk", description: "Structural displacement as AI automates knowledge economy work simultaneously, without historical transition periods.", threatVector: "Precarity fuels radicalization and demand for strongman solutions. Shrinks the middle class that sustains democratic norms.", layer: 2, layerName: "2ND ORDER", position: { x: 500, y: 253 }, radius: 18 },
    { id: "info_ecosystem_collapse", label: "Info Ecosystem Collapse", labelLines: ["Info Ecosystem", "Collapse"], category: "risk", description: "Breakdown of shared epistemic foundations — AI-generated content drowns signal, verification impossible at scale.", threatVector: "Radicalization accelerates as people retreat to tribal information environments. Consent manufacturing becomes trivially cheap.", layer: 2, layerName: "2ND ORDER", position: { x: 500, y: 368 }, radius: 18 },
    { id: "political_radicalization", label: "Political Radicalization", labelLines: ["Political", "Radicalization"], category: "social", description: "Polarization past the point where opposing factions share institutional legitimacy.", threatVector: "Creates pressure for emergency measures, enables authoritarian actors to claim they are preventing greater violence, destroys cross-partisan coalitions that constrain executive power.", layer: 3, layerName: "3RD ORDER", position: { x: 710, y: 425 }, radius: 18 },
    { id: "public_fear", label: "Public Fear", labelLines: ["Public", "Fear"], category: "social", description: "Generalized existential anxiety following catastrophic events — the political raw material for emergency legislation.", threatVector: "Fear is historically the most reliable mandate for laws otherwise unpassable. Emergency legislation passed under fear rarely includes sunset clauses.", layer: 4, layerName: "4TH ORDER", position: { x: 920, y: 425 }, radius: 18 },
    { id: "consent_manufacturing", label: "Consent Manufacturing", labelLines: ["Consent", "Manufacturing"], category: "state", description: "AI-enabled personalized persuasion at scale, plus mechanistic sculpting of AI values toward loyalty to specific individuals.", threatVector: "Dissolves the distinction between genuine democratic mandate and manufactured one. Once value circuits in AI are readable, they become writable — loyalty becomes an engineering problem.", layer: 3, layerName: "3RD ORDER", position: { x: 710, y: 540 }, radius: 18 },
    { id: "emergency_powers", label: "Emergency Powers", labelLines: ["Emergency", "Powers"], category: "state", description: "Extraordinary executive authority invoked during crisis — bypassing legislative, judicial, and constitutional constraints.", threatVector: "Emergency powers are rarely fully rescinded. Each crisis leaves a residual expansion that becomes the new baseline. The ratchet is only visible in retrospect.", layer: 5, layerName: "5TH ORDER", position: { x: 1130, y: 425 }, radius: 36 },
    { id: "surveillance", label: "Mass Surveillance", labelLines: ["Mass", "Surveillance"], category: "state", description: "AI-enabled real-time monitoring of communications, movement, finances, and social graphs at population scale.", threatVector: "Makes opposition organizing nearly impossible. Completes the control loop with consent manufacturing: population appears to consent to surveillance that prevents organizing against it.", layer: 6, layerName: "6TH ORDER", position: { x: 1340, y: 368 }, radius: 18 },
    { id: "world_gov", label: "Supranational Authority", labelLines: ["Supranational", "Authority"], category: "state", description: "A world governance body with authority to monitor, inspect, and sanction AI development globally.", threatVector: "Any body powerful enough to enforce a global AI pause is powerful enough to impose other policy unilaterally. Enforcement requires the same surveillance infrastructure that enables the terminal state.", layer: 2, layerName: "2ND ORDER", position: { x: 500, y: 483 }, radius: 18 },
    { id: "civil_liberties", label: "Civil Liberties", labelLines: ["Civil", "Liberties"], category: "social", description: "Legal protections for speech, association, privacy, and due process.", threatVector: "Erosion is incremental and each step seems proportionate to the crisis at hand. Total accumulated loss is only visible compared to a baseline people no longer remember.", layer: 6, layerName: "6TH ORDER", position: { x: 1340, y: 483 }, radius: 18 },
    { id: "democratic_resilience", label: "Democratic Resilience", labelLines: ["Democratic", "Resilience"], category: "social", description: "Institutional capacity to resist power concentration — checks, balances, press freedom, civic norms.", threatVector: "Degrades slowly then fails suddenly when stress exceeds institutional capacity. AI-enabled surveillance and consent manufacturing dramatically accelerate this threshold-crossing.", layer: 7, layerName: "7TH ORDER", position: { x: 1550, y: 368 }, radius: 18 },
    { id: "winning_coalition", label: "Winning Coalition Size ↓", labelLines: ["Winning Coalition", "Size ↓"], category: "social", description: "The minimum number of people a leader must satisfy to remain in power (Bueno de Mesquita). AI enables this to shrink dramatically.", threatVector: "Large coalition forces leaders to provide public goods. Small coalition makes private benefits sufficient. Surveillance, consent manufacturing, and unemployment each independently shrink this number. Together they may reduce it to near zero.", layer: 7, layerName: "7TH ORDER", position: { x: 1550, y: 483 }, radius: 18 },
    { id: "aging_cured", label: "Aging Cured", labelLines: ["Aging", "Cured"], category: "ai", description: "AI-enabled defeat of biological aging — existing power holders and coalition members no longer die of natural causes.", threatVector: "The succession problem in totalitarian regimes stems from needing to recruit new coalition members as old ones die. Curing aging eliminates succession pressure entirely — the winning coalition can remain permanently fixed.", layer: 2, layerName: "2ND ORDER", position: { x: 500, y: 598 }, radius: 20 },
    { id: "perfect_lie_detection", label: "Perfect Lie Detection", labelLines: ["Perfect Lie", "Detection"], category: "ai", description: "AI systems capable of identifying deception with near-certainty — applied to loyalty testing, interrogation, and political vetting.", threatVector: "Eliminates the ability to form covert opposition or pretend loyalty while organizing resistance. The winning coalition can be shrunk to only verified loyalists.", layer: 2, layerName: "2ND ORDER", position: { x: 500, y: 713 }, radius: 20 },
    { id: "power_concentration", label: "Power Concentration", labelLines: ["Power", "Concentration"], category: "outcome", description: "Decision-making authority accumulated in a small number of actors with limited accountability mechanisms remaining.", threatVector: "The structural endpoint common to all three AI policy pathways. Three entry points, one destination.", layer: 8, layerName: "8TH ORDER", position: { x: 1760, y: 425 }, radius: 60 },
    { id: "totalitarianism", label: "Stable Totalitarianism", labelLines: ["Stable", "Totalitarianism"], category: "terminal", description: "Near-total control over political, economic, and social life — potentially uniquely durable because AI closes every historical escape route simultaneously.", threatVector: "Real-time surveillance eliminates organizing, loyalty-sculpted AI replaces human enforcers, preemptive suppression acts before dissent forms.", layer: 9, layerName: "TERMINAL", position: { x: 1970, y: 425 }, radius: 42 },
  ],
  links: [
    { source: "open_source", target: "ai_capability", direction: "positive", label: "accelerates", w: 1 },
    { source: "open_source", target: "mass_casualty", direction: "positive", label: "enables", w: 1 },
    { source: "open_source", target: "info_ecosystem_collapse", direction: "positive", label: "enables", w: 1 },
    { source: "open_source", target: "democratic_resilience", direction: "positive", label: "distributes power", w: 1 },
    { source: "ai_capability", target: "military_ai_race", direction: "positive", label: "fuels", w: 1 },
    { source: "ai_capability", target: "mass_unemployment", direction: "positive", label: "drives", w: 1 },
    { source: "ai_capability", target: "info_ecosystem_collapse", direction: "positive", label: "enables", w: 1 },
    { source: "ai_capability", target: "surveillance", direction: "positive", label: "supercharges", w: 1 },
    { source: "ai_capability", target: "nuclear_risk", direction: "positive", label: "amplifies", w: 1 },
    { source: "ai_capability", target: "consent_manufacturing", direction: "positive", label: "enables", w: 1 },
    { source: "ai_capability", target: "world_gov", direction: "positive", label: "demands governance", w: 1 },
    { source: "ai_capability", target: "aging_cured", direction: "positive", label: "enables", w: 1 },
    { source: "ai_capability", target: "perfect_lie_detection", direction: "positive", label: "enables", w: 1 },
    { source: "military_ai_race", target: "nuclear_risk", direction: "positive", label: "escalates", w: 1 },
    { source: "military_ai_race", target: "emergency_powers", direction: "positive", label: "justifies", w: 1 },
    { source: "military_ai_race", target: "power_concentration", direction: "positive", label: "drives", w: 1 },
    { source: "nuclear_risk", target: "public_fear", direction: "positive", label: "intensifies", w: 1 },
    { source: "mass_casualty", target: "public_fear", direction: "positive", label: "triggers", w: 1 },
    { source: "mass_casualty", target: "emergency_powers", direction: "positive", label: "mandates", w: 1 },
    { source: "mass_unemployment", target: "political_radicalization", direction: "positive", label: "fuels", w: 1 },
    { source: "mass_unemployment", target: "public_fear", direction: "positive", label: "amplifies", w: 1 },
    { source: "mass_unemployment", target: "winning_coalition", direction: "negative", label: "shrinks", w: -1 },
    { source: "info_ecosystem_collapse", target: "political_radicalization", direction: "positive", label: "accelerates", w: 1 },
    { source: "info_ecosystem_collapse", target: "democratic_resilience", direction: "negative", label: "degrades", w: -1 },
    { source: "info_ecosystem_collapse", target: "consent_manufacturing", direction: "positive", label: "enables", w: 1 },
    { source: "political_radicalization", target: "emergency_powers", direction: "positive", label: "justifies", w: 1 },
    { source: "political_radicalization", target: "democratic_resilience", direction: "negative", label: "degrades", w: -1 },
    { source: "public_fear", target: "emergency_powers", direction: "positive", label: "demands", w: 1 },
    { source: "consent_manufacturing", target: "power_concentration", direction: "positive", label: "enables", w: 1 },
    { source: "consent_manufacturing", target: "democratic_resilience", direction: "negative", label: "undermines", w: -1 },
    { source: "consent_manufacturing", target: "winning_coalition", direction: "negative", label: "shrinks", w: -1 },
    { source: "emergency_powers", target: "civil_liberties", direction: "negative", label: "erodes", w: -1 },
    { source: "emergency_powers", target: "surveillance", direction: "positive", label: "expands", w: 1 },
    { source: "surveillance", target: "power_concentration", direction: "positive", label: "enables", w: 1 },
    { source: "surveillance", target: "democratic_resilience", direction: "negative", label: "degrades", w: -1 },
    { source: "surveillance", target: "winning_coalition", direction: "negative", label: "shrinks", w: -1 },
    { source: "world_gov", target: "power_concentration", direction: "positive", label: "concentrates", w: 1 },
    { source: "world_gov", target: "civil_liberties", direction: "negative", label: "threatens", w: -1 },
    { source: "world_gov", target: "surveillance", direction: "positive", label: "requires", w: 1 },
    { source: "civil_liberties", target: "democratic_resilience", direction: "positive", label: "sustains", w: 1 },
    { source: "democratic_resilience", target: "power_concentration", direction: "negative", label: "resists", w: -1 },
    { source: "winning_coalition", target: "power_concentration", direction: "negative", label: "constrains", w: -1 },
    { source: "winning_coalition", target: "totalitarianism", direction: "negative", label: "prevents", w: -1 },
    { source: "power_concentration", target: "totalitarianism", direction: "positive", label: "becomes", w: 1 },
    { source: "aging_cured", target: "totalitarianism", direction: "positive", label: "stabilizes", w: 1 },
    { source: "aging_cured", target: "winning_coalition", direction: "negative", label: "shrinks", w: -1 },
    { source: "perfect_lie_detection", target: "winning_coalition", direction: "negative", label: "shrinks", w: -1 },
  ],
  canvas: { width: 2260, height: 850 },
};

export const GRAPH_WIDTH = GRAPH_SPEC.canvas.width;
export const GRAPH_HEIGHT = GRAPH_SPEC.canvas.height;

export const CATEGORY_META = Object.fromEntries(
  GRAPH_SPEC.categories.map((c) => [c.id, { color: c.color, label: c.label }])
);

const BASE_R = GRAPH_SPEC.sizeRules.baseRadius;
const DOUBLED = new Set(GRAPH_SPEC.sizeRules.doubled);

export function getR(node) {
  if (node && typeof node.radius === "number") return node.radius;
  const cat = node?.category ?? node?.cat;
  const base = BASE_R[cat] ?? 18;
  return base * (node && DOUBLED.has(node.id) ? 2 : 1);
}

function normalizeNode(n) {
  const label = Array.isArray(n.labelLines) ? n.labelLines : (Array.isArray(n.label) ? n.label : (n.label != null ? String(n.label).split(" ") : []));
  return {
    id: n.id,
    label,
    category: n.category ?? n.cat,
    description: n.description ?? n.desc ?? "",
    threat: n.threatVector ?? n.threat ?? "",
    position: n.position && typeof n.position.x === "number" && typeof n.position.y === "number" ? { ...n.position } : { x: GRAPH_WIDTH / 2, y: GRAPH_HEIGHT / 2 },
    radius: n.radius,
    layer: n.layer,
    layerName: n.layerName,
  };
}

function normalizeLink(l) {
  const w = typeof l.w === "number" ? l.w : (l.direction === "negative" ? -1 : 1);
  return {
    source: l.source ?? l.s,
    target: l.target ?? l.t,
    weight: w,
    label: l.label ?? l.lbl ?? "enables",
    color: l.color,
  };
}

export const DEFAULT_NODES = GRAPH_SPEC.nodes.map(normalizeNode);
export const DEFAULT_LINKS = GRAPH_SPEC.links.map(normalizeLink);

export function computePositions(nodes, manualPos) {
  const pos = {};
  nodes.forEach((n) => {
    const override = manualPos[n.id];
    if (override && typeof override.x === "number" && typeof override.y === "number") {
      pos[n.id] = { x: override.x, y: override.y };
      return;
    }
    const p = n.position;
    if (p && typeof p.x === "number" && typeof p.y === "number") {
      pos[n.id] = { x: p.x, y: p.y };
      return;
    }
    pos[n.id] = { x: GRAPH_WIDTH / 2, y: GRAPH_HEIGHT / 2 };
  });
  return pos;
}

export function normalizeLinkForLoad(l) {
  return normalizeLink(l);
}
