/**
 * Minimal API for saving/loading graph connections. No passwords — token is the credential.
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
app.use(express.json({ limit: "1mb" }));

let store = Object.create(null);

async function loadStore() {
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    store = JSON.parse(raw);
  } catch (e) {
    if (e.code !== "ENOENT") console.error("Load store:", e.message);
    store = Object.create(null);
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

app.post("/api/register", (req, res) => {
  const token = randomUUID();
  store[token] = { links: [], updatedAt: new Date().toISOString() };
  saveStore();
  res.json({ token });
});

app.post("/api/save", (req, res) => {
  const { token, links } = req.body || {};
  if (!token || !Array.isArray(links)) {
    return res.status(400).send("Missing token or links");
  }
  store[token] = { links, updatedAt: new Date().toISOString() };
  saveStore();
  res.json({ ok: true });
});

app.get("/api/load", (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(400).send("Missing token");
  const data = store[token];
  if (!data) return res.status(404).send("No data for this key");
  res.json({ links: data.links || [] });
});

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => console.log(`Graph save API on http://localhost:${PORT}`));
