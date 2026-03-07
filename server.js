/**
 * Simple API: register/login (username + password, no hashing), save/load graph per user.
 * Run: node server.js (listens on 3001). Use Vite proxy /api -> http://localhost:3001
 */
import express from "express";
import { readFile, writeFile, mkdir } from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");
const STORE_PATH = path.join(DATA_DIR, "graph-store.json");

const app = express();

// Allow frontend on another origin (e.g. Sliplane frontend → backend)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});
app.use(express.json({ limit: "1mb" }));

// store = { users: { username: { password, links } }, sessions: { token: username } }
let store = { users: Object.create(null), sessions: Object.create(null) };

async function loadStore() {
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    const data = JSON.parse(raw);
    if (data.users) store.users = data.users;
    if (data.sessions) store.sessions = data.sessions;
  } catch (e) {
    if (e.code !== "ENOENT") console.error("Load store:", e.message);
  }
}

async function saveStore() {
  try {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(STORE_PATH, JSON.stringify(store, null, 0), "utf8");
  } catch (e) {
    console.error("Save store:", e.message);
  }
}

await loadStore();

function getUsername(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return null;
  return store.sessions[auth.slice(7)] || null;
}

app.post("/api/register", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: "Username and password required" });
  const u = String(username).trim().toLowerCase();
  if (!u) return res.status(400).json({ error: "Username required" });
  if (store.users[u]) return res.status(400).json({ error: "Username taken" });
  store.users[u] = { password: String(password), links: [] };
  const token = randomUUID();
  store.sessions[token] = u;
  saveStore();
  res.json({ token, username: u });
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: "Username and password required" });
  const u = String(username).trim().toLowerCase();
  const user = store.users[u];
  if (!user || user.password !== String(password)) return res.status(401).json({ error: "Invalid username or password" });
  const token = randomUUID();
  store.sessions[token] = u;
  saveStore();
  res.json({ token, username: u });
});

app.post("/api/save", (req, res) => {
  const username = getUsername(req);
  if (!username) return res.status(401).json({ error: "Not logged in" });
  const { links } = req.body || {};
  if (!Array.isArray(links)) return res.status(400).json({ error: "links array required" });
  store.users[username].links = links;
  saveStore();
  res.json({ ok: true });
});

app.get("/api/load", (req, res) => {
  const username = getUsername(req);
  if (!username) return res.status(401).json({ error: "Not logged in" });
  const links = store.users[username]?.links ?? [];
  res.json({ links });
});

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => console.log(`Graph API on http://localhost:${PORT}`));
