import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";

const port = 4199;
const base = `http://localhost:${port}`;

function startServer() {
  const child = spawn(process.execPath, ["server.js"], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"]
  });
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Server did not start in time.")), 5000);
    child.stdout.on("data", (chunk) => {
      if (chunk.toString().includes("MindGuard AI running")) {
        clearTimeout(timer);
        resolve(child);
      }
    });
    child.stderr.on("data", (chunk) => {
      const text = chunk.toString();
      if (text.includes("EADDRINUSE")) reject(new Error(text));
    });
  });
}

async function request(path, options = {}, cookie = "") {
  const response = await fetch(`${base}${path}`, {
    headers: { "Content-Type": "application/json", Cookie: cookie, ...(options.headers || {}) },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const setCookie = response.headers.get("set-cookie") || cookie;
  const data = await response.json();
  return { response, data, cookie: setCookie.split(";")[0] };
}

test("MindGuard API supports login, screening, mood trends, and high-risk post analysis", async (t) => {
  const server = await startServer();
  t.after(() => server.kill());

  const login = await request("/api/auth/login", {
    method: "POST",
    body: { email: "user@mindguard.test", password: "password123" }
  });
  assert.equal(login.response.status, 200);
  assert.equal(login.data.user.role, "user");

  const phq = await request(
    "/api/screening/phq9",
    { method: "POST", body: { answers: [1, 1, 1, 1, 1, 1, 1, 1, 0] } },
    login.cookie
  );
  assert.equal(phq.response.status, 200);
  assert.equal(phq.data.riskLevel, "Low");

  const mood = await request(
    "/api/mood/checkin",
    { method: "POST", body: { moodScore: 6, stressScore: 4, sleepQuality: 7, energyLevel: 5, notes: "steady" } },
    login.cookie
  );
  assert.equal(mood.response.status, 200);
  assert.equal(mood.data.trend.averageMood >= 1, true);

  const post = await request(
    "/api/analysis/post",
    { method: "POST", body: { text: "I feel hopeless, empty, alone, and I can't go on." } },
    login.cookie
  );
  assert.equal(post.response.status, 200);
  assert.equal(post.data.analysis.riskLevel, "High");
  assert.equal(post.data.analysis.label, "suicidal-risk");
  assert.ok(post.data.mcpWorkflow.includes("crisis_resource_finder"));
});
