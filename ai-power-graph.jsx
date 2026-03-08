import { useState, useRef, useMemo } from "react";
import {
  GRAPH_SPEC,
  DEFAULT_NODES,
  DEFAULT_LINKS,
  CATEGORY_META,
  GRAPH_WIDTH,
  GRAPH_HEIGHT,
  getR,
  computePositions,
  normalizeLinkForLoad,
} from "./src/graph-spec.js";

function normalizeLink(l) {
  return normalizeLinkForLoad(l);
}

function edgePath(sid, tid, pos, nm) {
  const sp = pos[sid];
  const tp = pos[tid];
  if (!sp || !tp) return "";
  const sr = nm[sid] ? getR(nm[sid]) : 18;
  const tr = nm[tid] ? getR(nm[tid]) : 18;
  const mx = (sp.x + tp.x) / 2;
  const my = (sp.y + tp.y) / 2;
  const dx = tp.x - sp.x;
  const dy = tp.y - sp.y;
  const perp = Math.sqrt(dx * dx + dy * dy) || 1;
  const cpx = mx + (-dy / perp) * 40;
  const cpy = my + (dx / perp) * 40;
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
  if (!sp || !tp) return { x: 0, y: 0 };
  const mx = (sp.x + tp.x) / 2;
  const my = (sp.y + tp.y) / 2;
  const dx = tp.x - sp.x;
  const dy = tp.y - sp.y;
  const perp = Math.sqrt(dx * dx + dy * dy) || 1;
  const cpx = mx + (-dy / perp) * 40;
  const cpy = my + (dx / perp) * 40;
  return { x: (sp.x + tp.x + cpx * 2) / 4, y: (sp.y + tp.y + cpy * 2) / 4 - 10 };
}

const linkKey = (l) => `${l.source}::${l.target}`;
const linkColor = (link) => link.color ?? (link.weight > 0 ? "#00cc66" : "#cc2233");

const MOVE_STEP = 40;

export default function AiPowerGraph() {
  const containerRef = useRef(null);
  const [nodes, setNodes] = useState(() => [...DEFAULT_NODES]);
  const [links, setLinks] = useState(() => DEFAULT_LINKS.map((l) => ({ ...l })));
  const [manualPos, setManualPos] = useState({});
  const [selected, setSelected] = useState(null); // { type: 'node', node } | { type: 'link', link } | null
  const [hovered, setHovered] = useState(null);
  const [addingLinkSource, setAddingLinkSource] = useState(null); // null | "" | nodeId. Node click is handled only via mousedown (no dragRef/mouseup) so add-edge target click always fires handleNodeClick.
  const [authToken, setAuthToken] = useState(() => typeof localStorage !== "undefined" ? localStorage.getItem("graph_auth_token") : null);
  const [username, setUsername] = useState(() => typeof localStorage !== "undefined" ? localStorage.getItem("graph_username") : null);
  const [saveStatus, setSaveStatus] = useState(null);

  const nodeMap = useMemo(() => Object.fromEntries(nodes.map((n) => [n.id, n])), [nodes]);
  const positions = useMemo(() => computePositions(nodes, manualPos), [nodes, manualPos]);

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

  const moveNode = (nodeId, dx, dy) => {
    const pos = positions[nodeId];
    if (!pos) return;
    setManualPos((prev) => ({ ...prev, [nodeId]: { x: pos.x + dx, y: pos.y + dy } }));
  };

  const rawApi = typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL ? String(import.meta.env.VITE_API_URL).trim().replace(/\/$/, "") : "";
  const apiBase = rawApi && !/^https?:\/\//i.test(rawApi) ? `https://${rawApi}` : rawApi;
  const authHeaders = () => (authToken ? { Authorization: `Bearer ${authToken}` } : {});

  const parseJson = async (res) => {
    const text = await res.text();
    if (text.trimStart().startsWith("<")) {
      throw new Error(
        apiBase
          ? "API returned HTML. VITE_API_URL should be your backend service URL (the one built with Dockerfile.api), not the frontend. Use the backend's Public Endpoint with https://."
          : "API returned HTML. Is the backend running? In production, deploy the API as a separate service and set VITE_API_URL to its URL (e.g. https://your-api.sliplane.app)."
      );
    }
    try {
      return JSON.parse(text);
    } catch {
      throw new Error("Invalid response: " + (text.slice(0, 80) || res.status));
    }
  };

  const register = async (u, p) => {
    try {
      const res = await fetch(`${apiBase}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password: p }),
      });
      const data = await parseJson(res);
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
      const data = await parseJson(res);
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
        body: JSON.stringify({ links, manualPos }),
      });
      const data = await parseJson(res).catch((e) => { throw e; });
      if (data?.error) { setSaveStatus(data.error); return; }
      if (!res.ok) throw new Error(data?.error || res.statusText);
      setSaveStatus("Saved.");
    } catch (e) {
      setSaveStatus("Error: " + (e.message || "Save failed"));
    }
  };
  const loadGraph = async () => {
    if (!authToken) { setSaveStatus("Log in first."); return; }
    try {
      const res = await fetch(`${apiBase}/api/load`, { headers: authHeaders() });
      const data = await parseJson(res).catch((e) => { throw e; });
      if (data?.error) { setSaveStatus(data.error); return; }
      if (!res.ok) throw new Error(data?.error || res.statusText);
      if (data.links && Array.isArray(data.links)) {
        setLinks(data.links.map((l) => normalizeLink(l)));
      }
      if (data.manualPos && typeof data.manualPos === "object") {
        setManualPos(data.manualPos);
      }
      if (data.links || data.manualPos) setSaveStatus("Loaded.");
    } catch (e) {
      setSaveStatus("Error: " + (e.message || "Load failed"));
    }
  };

  return (
    <div style={{ background: "#06090c", minHeight: "100%", display: "flex", flexDirection: "column", fontFamily: "'IBM Plex Mono', monospace", color: "#7a90a8" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500&family=Playfair+Display:ital,wght@0,700;1,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; height: 6px; } ::-webkit-scrollbar-track { background: #0a0f14; } ::-webkit-scrollbar-thumb { background: #1a2a3a; border-radius: 3px; }
        .graph-canvas { overflow: auto; }
        .graph-canvas::-webkit-scrollbar { width: 10px; height: 10px; }
        .graph-canvas::-webkit-scrollbar-thumb { background: #2a3a4a; }
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
          {GRAPH_SPEC.meta?.title ?? "AI Policy → Totalitarian Failure Modes"}
          <span style={{ fontStyle: "italic", fontWeight: 400, fontSize: "14px", color: "#3a5570", marginLeft: "12px" }}>dependency graph</span>
        </h1>
        {GRAPH_SPEC.meta?.subtitle && (
          <div style={{ fontSize: "11px", color: "#3a5570", marginTop: "4px", lineHeight: 1.4 }}>{GRAPH_SPEC.meta.subtitle}</div>
        )}
      </div>

      <div className="graph-layout" style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0, minWidth: 0 }}>
        {/* Graph canvas: fixed-size SVG inside scroll container so you can scroll across the full graph */}
        <div ref={containerRef} className="graph-canvas" style={{ flex: 1, position: "relative", overflow: "auto", minHeight: 280, minWidth: 0 }}>
          <svg
            width={GRAPH_WIDTH}
            height={GRAPH_HEIGHT}
            viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
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

            {/* Links – curved paths */}
            {links.map((link) => {
              const key = linkKey(link);
              const isActive = highlighted?.linkKeys.has(key);
              const isDim = highlighted && !isActive;
              const pos = link.weight > 0;
              const col = isDim ? (pos ? "#0a1e10" : "#1e0a0c") : linkColor(link);
              const op = isDim ? 0.28 : 1;
              const mId = isDim ? (pos ? "arr-pos-dim" : "arr-neg-dim") : (pos ? "arr-pos" : "arr-neg");
              const sw = isActive ? 1.8 : 0.9;
              const d = edgePath(link.source, link.target, positions, nodeMap);
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

            {/* Nodes – column layout */}
            {nodes.map((node) => {
              const pos = positions[node.id];
              if (!pos) return null;
              const cat = node.category ?? node.cat;
              const isSel = selected?.type === "node" && selected.node?.id === node.id;
              const isHov = hovered === node.id;
              const isDim = highlighted && !highlighted.nodeIds.has(node.id);
              const meta = CATEGORY_META[cat] ?? CATEGORY_META.ai;
              const r = getR(node);
              const words = Array.isArray(node.label) ? node.label : (node.label != null ? String(node.label).split(" ") : []);

              const isAddSrc = addingLinkSource === node.id;
              return (
                <NodeGroup key={node.id} id={node.id} x={pos.x} y={pos.y} r={r}
                  color={meta.color} isSel={isSel} isHov={isHov} isDim={isDim}
                  words={words} category={cat} isAddSource={isAddSrc}
                  onSelect={() => handleNodeClick(node)}
                  onHover={() => setHovered(node.id)} onHoverEnd={() => setHovered(null)}
                />
              );
            })}
          </svg>

          <div style={{ position: "absolute", bottom: "16px", left: "16px", fontSize: "9px", letterSpacing: "2px", color: "#1e3040", pointerEvents: "none" }}>
            {addingLinkSource ? (addingLinkSource === "" ? "Click source node" : "Click target node") : !selected && !hovered ? "CLICK NODE · CLICK EDGE TO EDIT · SCROLL TO SEE FULL CHAIN" : null}
          </div>
        </div>

        {/* Right panel - below graph on mobile so it doesn't hide the graph */}
        <div className="graph-panel" style={{ width: "280px", flexShrink: 0, borderLeft: "1px solid #0d1822", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Legend />
          <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
            {selected?.type === "link"
              ? <EdgeEdit key={linkKey(selected.link)} link={selected.link} nodeMap={nodeMap} onUpdate={updateLink} onDelete={deleteLink} onClose={() => setSelected(null)} />
              : selected?.type === "node"
                ? <NodeInfo node={selected.node} links={links} nodeMap={nodeMap} onMove={moveNode} moveStep={MOVE_STEP} />
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

function nodeLabel(node) {
  const l = node?.label;
  return Array.isArray(l) ? l.join(" ") : (l != null ? String(l) : node?.id ?? "");
}

function NodeInfo({ node, links, nodeMap, onMove, moveStep }) {
  const cat = node.category ?? node.cat;
  const meta = CATEGORY_META[cat] ?? CATEGORY_META.ai;
  const incoming = links.filter((l) => l.target === node.id);
  const outgoing = links.filter((l) => l.source === node.id);
  const step = moveStep ?? 40;

  return (
    <div>
      <div style={{ fontSize: "8px", letterSpacing: "3px", color: "#2a4060", marginBottom: "6px" }}>
        {(meta?.label ?? "NODE").toUpperCase()}
      </div>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", color: meta.color, filter: "brightness(1.6)", marginBottom: "12px", lineHeight: "1.3" }}>
        {nodeLabel(node)}
      </div>
      {onMove && (
        <div style={{ marginBottom: "14px" }}>
          <div style={{ fontSize: "8px", letterSpacing: "2px", color: "#2a4060", marginBottom: "6px" }}>MOVE NODE</div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            <button type="button" onClick={() => onMove(node.id, -step, 0)} style={{ padding: "4px 8px", fontSize: "10px", background: "#0d1822", border: "1px solid #1a2a3a", color: "#5a7080", borderRadius: "2px", cursor: "pointer" }}>← Left</button>
            <button type="button" onClick={() => onMove(node.id, step, 0)} style={{ padding: "4px 8px", fontSize: "10px", background: "#0d1822", border: "1px solid #1a2a3a", color: "#5a7080", borderRadius: "2px", cursor: "pointer" }}>Right →</button>
            <button type="button" onClick={() => onMove(node.id, 0, -step)} style={{ padding: "4px 8px", fontSize: "10px", background: "#0d1822", border: "1px solid #1a2a3a", color: "#5a7080", borderRadius: "2px", cursor: "pointer" }}>↑ Up</button>
            <button type="button" onClick={() => onMove(node.id, 0, step)} style={{ padding: "4px 8px", fontSize: "10px", background: "#0d1822", border: "1px solid #1a2a3a", color: "#5a7080", borderRadius: "2px", cursor: "pointer" }}>↓ Down</button>
          </div>
        </div>
      )}
      <div style={{ fontSize: "11px", color: "#5a7080", lineHeight: "1.75", marginBottom: "14px" }}>
        {node.description ?? node.desc ?? ""}
      </div>
      {(node.threat ?? "").length > 0 && (
        <div style={{ background: "#08101a", border: `1px solid #0d1822`, borderLeft: `2px solid ${meta.color}`, padding: "10px 12px", marginBottom: "16px" }}>
          <div style={{ fontSize: "8px", letterSpacing: "2px", color: "#3a2a10", marginBottom: "5px" }}>THREAT VECTOR</div>
          <div style={{ fontSize: "10px", color: "#6a5030", lineHeight: "1.7" }}>{node.threat}</div>
        </div>
      )}

      {incoming.length > 0 && (
        <div style={{ marginBottom: "14px" }}>
          <div style={{ fontSize: "8px", letterSpacing: "2px", color: "#2a4060", marginBottom: "7px" }}>INFLUENCED BY</div>
          {incoming.map(l => {
            const src = nodeMap?.[l.source];
            return (
              <div key={l.source} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                <span style={{ color: l.weight > 0 ? "#00cc66" : "#cc2233", fontSize: "10px", flexShrink: 0 }}>
                  {l.weight > 0 ? "▲" : "▼"}
                </span>
                <span style={{ fontSize: "10px", color: "#3a5060", flex: 1 }}>{nodeLabel(src)}</span>
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
            const tgt = nodeMap?.[l.target];
            return (
              <div key={l.target} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                <span style={{ color: l.weight > 0 ? "#00cc66" : "#cc2233", fontSize: "10px", flexShrink: 0 }}>
                  {l.weight > 0 ? "▲" : "▼"}
                </span>
                <span style={{ fontSize: "10px", color: "#3a5060", flex: 1 }}>{nodeLabel(tgt)}</span>
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
  const src = nodeMap?.[link.source];
  const tgt = nodeMap?.[link.target];
  const srcLabel = Array.isArray(src?.label) ? src.label.join(" ") : (src?.label ?? link.source);
  const tgtLabel = Array.isArray(tgt?.label) ? tgt.label.join(" ") : (tgt?.label ?? link.target);
  const save = () => {
    onUpdate(link.source, link.target, { label, color: color || undefined, weight: weightPos ? 1 : -1 });
  };
  return (
    <div>
      <div style={{ fontSize: "8px", letterSpacing: "2px", color: "#2a4060", marginBottom: "6px" }}>EDIT CONNECTION</div>
      <div style={{ fontSize: "10px", color: "#5a7080", marginBottom: "10px" }}>
        {srcLabel} → {tgtLabel}
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
        Nodes are arranged left-to-right by causal distance — each column shows effects of the prior column. <strong style={{ color: "#3a5060" }}>Scroll horizontally to traverse the full chain.</strong> Green edges amplify; dashed red erode or resist.
      </div>
      <div style={{ marginTop: "12px", fontSize: "9px", color: "#1e2a38", letterSpacing: "1px" }}>
        CLICK NODE TO INSPECT · CLICK EDGE TO EDIT · SCROLL TO SEE ALL COLUMNS
      </div>
    </div>
  );
}
