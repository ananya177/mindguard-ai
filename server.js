import http from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync, createReadStream } from "node:fs";
import { extname, join, resolve } from "node:path";
import crypto from "node:crypto";

const PORT = process.env.PORT || 4173;
const HOST = process.env.HOST || "127.0.0.1";
const ROOT = resolve(".");
const PUBLIC_DIR = join(ROOT, "public");
const DATA_DIR = join(ROOT, "data");
const DB_FILE = join(DATA_DIR, "mindguard-db.json");
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg"
};

async function ensureDb() {
  await mkdir(DATA_DIR, { recursive: true });
  if (!existsSync(DB_FILE)) {
    const seed = {
      users: [],
      sessions: [],
      phq9Assessments: [],
      moodCheckins: [],
      chatMessages: [],
      postAnalyses: [],
      imageAnalyses: [],
      crisisAlerts: [],
      activityPlans: []
    };
    await writeJson(DB_FILE, seed);
  }
}

async function readDb() {
  await ensureDb();
  return JSON.parse(await readFile(DB_FILE, "utf8"));
}

async function writeDb(db) {
  await writeJson(DB_FILE, db);
}

async function writeJson(file, payload) {
  await writeFile(file, JSON.stringify(payload, null, 2));
}

function hashPassword(password) {
  return crypto.createHash("sha256").update(`mindguard:${password}`).digest("hex");
}

function id(prefix) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function parseCookies(req) {
  return Object.fromEntries(
    (req.headers.cookie || "")
      .split(";")
      .filter(Boolean)
      .map((cookie) => {
        const [key, ...rest] = cookie.trim().split("=");
        return [key, decodeURIComponent(rest.join("="))];
      })
  );
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  const raw = Buffer.concat(chunks).toString("utf8");
  try {
    return JSON.parse(raw);
  } catch {
    return { raw };
  }
}

async function getAuthUser(req, db) {
  const token = parseCookies(req).mg_session || req.headers.authorization?.replace("Bearer ", "");
  if (!token) return null;
  const session = db.sessions.find((item) => item.token === token && new Date(item.expiresAt) > new Date());
  if (!session) return null;
  const user = db.users.find((item) => item.id === session.userId);
  return user || null;
}

function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    consent: user.consent,
    createdAt: user.createdAt
  };
}

function requireRole(user, roles) {
  return user && roles.includes(user.role);
}

const riskWords = {
  suicidal: ["suicide", "kill myself", "end my life", "self harm", "can't go on", "no reason to live"],
  depressive: ["empty", "hopeless", "worthless", "depressed", "sad", "alone", "tired", "numb"],
  anxious: ["panic", "anxious", "worried", "fear", "overthinking", "dread"],
  stressed: ["stressed", "burned out", "overwhelmed", "pressure", "exhausted"]
};

function analyzeText(text = "") {
  const normalized = text.toLowerCase();
  const hits = Object.fromEntries(
    Object.entries(riskWords).map(([label, words]) => [label, words.filter((word) => normalized.includes(word))])
  );
  const score = {
    suicidalRisk: hits.suicidal.length * 0.45,
    depressive: hits.depressive.length * 0.16,
    anxious: hits.anxious.length * 0.13,
    stressed: hits.stressed.length * 0.12
  };
  let label = "neutral";
  if (score.suicidalRisk > 0) label = "suicidal-risk";
  else if (score.depressive >= Math.max(score.anxious, score.stressed, 0.16)) label = "depressive";
  else if (score.anxious >= Math.max(score.stressed, 0.13)) label = "anxious";
  else if (score.stressed > 0) label = "stressed";
  else if (normalized.length > 12) label = "non-depressive";

  const negativeTerms = [...hits.suicidal, ...hits.depressive, ...hits.anxious, ...hits.stressed];
  const confidence = Math.min(0.96, 0.42 + negativeTerms.length * 0.12 + (label === "suicidal-risk" ? 0.18 : 0));
  const sentimentScore = Math.max(-1, Math.min(1, 0.2 - negativeTerms.length * 0.22));
  const riskLevel = label === "suicidal-risk" ? "High" : negativeTerms.length >= 4 ? "High" : negativeTerms.length >= 2 ? "Moderate" : "Low";

  return {
    label,
    confidence: Number(confidence.toFixed(2)),
    sentimentScore: Number(sentimentScore.toFixed(2)),
    emotions: {
      sadness: Number(Math.min(0.95, hits.depressive.length * 0.22).toFixed(2)),
      anxiety: Number(Math.min(0.9, hits.anxious.length * 0.26).toFixed(2)),
      stress: Number(Math.min(0.85, hits.stressed.length * 0.24).toFixed(2)),
      crisis: Number(Math.min(0.98, hits.suicidal.length * 0.52).toFixed(2))
    },
    importantPhrases: negativeTerms.slice(0, 8),
    riskLevel,
    disclaimer: "This is not a clinical diagnosis."
  };
}

function scorePhq9(answers = []) {
  const totalScore = answers.reduce((sum, value) => sum + Number(value || 0), 0);
  let riskLevel = "Low";
  if (totalScore >= 20 || Number(answers[8] || 0) > 0) riskLevel = "High";
  else if (totalScore >= 10) riskLevel = "Moderate";
  return { totalScore, riskLevel, disclaimer: "This is not a clinical diagnosis." };
}

function moodTrend(checkins) {
  const recent = checkins.slice(-7);
  if (!recent.length) return { averageMood: 0, trend: "No data yet", points: [] };
  const points = recent.map((item) => ({ date: item.createdAt.slice(5, 10), mood: item.moodScore, stress: item.stressScore, sleepQuality: item.sleepQuality }));
  const averageMood = recent.reduce((sum, item) => sum + item.moodScore, 0) / recent.length;
  const first = recent[0].moodScore;
  const last = recent[recent.length - 1].moodScore;
  return {
    averageMood: Number(averageMood.toFixed(1)),
    trend: last > first ? "Improving" : last < first ? "Declining" : "Stable",
    points
  };
}

function mcpOrchestrate({ type, input, user, db }) {
  const userCheckins = db.moodCheckins.filter((item) => item.userId === user?.id);
  const history = user?.consent?.moodHistory ? moodTrend(userCheckins) : { trend: "History disabled", points: [] };
  const textResult = analyzeText(input.text || "");
  const crisis = crisisResources(input.region || "US");
  const recommendations = copingRecommendations(textResult.riskLevel, history.trend);
  return {
    mcpWorkflow: [
      "text_analysis_model",
      type === "image" ? "ocr_extractor" : "public_post_analyzer",
      type === "image" ? "image_emotion_model" : null,
      "mood_history_database",
      "crisis_resource_finder",
      "explainability_engine"
    ].filter(Boolean),
    textResult,
    moodContext: history,
    crisisResources: textResult.riskLevel === "High" ? crisis : crisis.slice(0, 1),
    recommendations
  };
}

function copingRecommendations(riskLevel, trend) {
  const base = [
    "Try a two-minute box-breathing exercise.",
    "Write three sentences about what felt heavy today and one small thing that helped.",
    "Send a short check-in message to a trusted person."
  ];
  if (riskLevel === "High") {
    return [
      "If you may be in immediate danger, contact emergency services now.",
      "Call or text 988 in the U.S. for the Suicide & Crisis Lifeline.",
      "Move near another person or a safer shared space if possible."
    ];
  }
  if (trend === "Declining") return [...base, "Plan one low-effort positive activity for the next 24 hours."];
  return base;
}

function crisisResources(region) {
  return [
    {
      name: "988 Suicide & Crisis Lifeline",
      region,
      contact: "Call or text 988",
      url: "https://988lifeline.org"
    },
    {
      name: "Emergency Services",
      region,
      contact: "Call local emergency services if there is immediate danger",
      url: ""
    }
  ];
}

function supportiveChatReply(message, result) {
  const text = String(message || "").toLowerCase();
  if (result.textResult.riskLevel === "High") {
    return "I am really sorry you are carrying this. I cannot provide emergency care, but your safety matters right now. If you may be in immediate danger, call emergency services. In the U.S., call or text 988 for the Suicide & Crisis Lifeline. If you can, move near someone you trust and tell them you need support.";
  }

  if (/^(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(text.trim())) {
    return "Hi, I am here with you. How are you feeling right now: calm, stressed, sad, tired, anxious, or something else?";
  }

  if (/help|can you|please|what should i do|support/.test(text)) {
    return "Yes. We can take this one step at a time. Tell me what feels most difficult right now: your thoughts, your body, your sleep, your mood, or a situation you are dealing with?";
  }

  if (/anxious|anxiety|panic|worried|worry|overthinking|fear/.test(text)) {
    return "That sounds like anxiety may be showing up. Try this for 30 seconds: place both feet on the floor, look around, and name 5 things you can see. Then tell me what worry is taking the most space right now.";
  }

  if (/stress|stressed|overwhelmed|pressure|burned out|busy/.test(text)) {
    return "That sounds heavy. Let’s lower the pressure a little: choose one tiny next action, not the whole solution. What is one task or thought that feels most overwhelming?";
  }

  if (/sad|depressed|empty|hopeless|alone|lonely|cry/.test(text)) {
    return "I am sorry it feels this way. You do not have to explain everything at once. Would it help to write one sentence starting with: “The hardest part today is…”?";
  }

  if (/sleep|tired|insomnia|night|rest/.test(text)) {
    return "Sleep struggles can make everything feel sharper. Tonight, try a gentle wind-down: dim lights, put the phone away for 10 minutes, and breathe slowly. Has sleep been too little, too much, or restless?";
  }

  if (/journal|write|prompt/.test(text)) {
    return "Here is a journal prompt: “What feeling visited me today, what did it need, and what is one kind response I can give myself?” Keep it short, even three lines is enough.";
  }

  const phrase = result.textResult.importantPhrases.length
    ? `I noticed themes like ${result.textResult.importantPhrases.slice(0, 3).join(", ")}.`
    : "Thank you for telling me.";
  return `${phrase} I can offer supportive insight, not a diagnosis. What would help most right now: a breathing exercise, a journal prompt, a grounding step, or talking through what happened?`;
}

async function handleApi(req, res, pathname) {
  const db = await readDb();
  const user = await getAuthUser(req, db);
  const body = ["POST", "PATCH", "PUT"].includes(req.method) ? await readBody(req) : {};

  if (pathname === "/api/auth/signup" && req.method === "POST") {
    if (!body.email || !body.password) return sendJson(res, 400, { error: "Email and password are required." });
    if (db.users.some((item) => item.email === body.email)) return sendJson(res, 409, { error: "Email already exists." });
    const nextUser = {
      id: id("user"),
      name: body.name || "MindGuard User",
      email: body.email,
      passwordHash: hashPassword(body.password),
      role: body.role || "user",
      consent: { moodHistory: true, research: false, highRiskAlerts: false, imageAnalysis: true },
      createdAt: new Date().toISOString()
    };
    db.users.push(nextUser);
    await writeDb(db);
    return createSession(res, db, nextUser);
  }

  if (pathname === "/api/auth/login" && req.method === "POST") {
    const found = db.users.find((item) => item.email === body.email && item.passwordHash === hashPassword(body.password || ""));
    if (!found) return sendJson(res, 401, { error: "Invalid email or password." });
    return createSession(res, db, found);
  }

  if (pathname === "/api/auth/logout" && req.method === "POST") {
    const token = parseCookies(req).mg_session;
    db.sessions = db.sessions.filter((item) => item.token !== token);
    await writeDb(db);
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Set-Cookie": "mg_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0"
    });
    return res.end(JSON.stringify({ ok: true }));
  }

  if (pathname === "/api/auth/forgot-password" && req.method === "POST") {
    return sendJson(res, 200, { ok: true, message: "Prototype reset link generated. In production, send a secure email token." });
  }

  if (pathname === "/api/auth/me" && req.method === "GET") {
    return sendJson(res, 200, { user: publicUser(user) });
  }

  if (!user) return sendJson(res, 401, { error: "Authentication required." });

  if (pathname === "/api/users/me" && req.method === "PATCH") {
    user.name = body.name ?? user.name;
    user.consent = { ...user.consent, ...(body.consent || {}) };
    await writeDb(db);
    return sendJson(res, 200, { user: publicUser(user) });
  }

  if (pathname === "/api/screening/phq9" && req.method === "POST") {
    const result = scorePhq9(body.answers || []);
    const row = { id: id("phq9"), userId: user.id, answers: body.answers || [], ...result, createdAt: new Date().toISOString() };
    db.phq9Assessments.push(row);
    if (result.riskLevel === "High") db.crisisAlerts.push({ id: id("alert"), userId: user.id, triggerSource: "phq9", riskLevel: "High", resolved: false, createdAt: row.createdAt });
    await writeDb(db);
    return sendJson(res, 200, row);
  }

  if (pathname === "/api/screening/history" && req.method === "GET") {
    return sendJson(res, 200, { assessments: db.phq9Assessments.filter((item) => item.userId === user.id) });
  }

  if (pathname === "/api/mood/checkin" && req.method === "POST") {
    const row = { id: id("mood"), userId: user.id, moodScore: Number(body.moodScore), stressScore: Number(body.stressScore), sleepQuality: Number(body.sleepQuality), energyLevel: Number(body.energyLevel), notes: body.notes || "", createdAt: new Date().toISOString() };
    db.moodCheckins.push(row);
    await writeDb(db);
    return sendJson(res, 200, { checkin: row, trend: moodTrend(db.moodCheckins.filter((item) => item.userId === user.id)) });
  }

  if (pathname === "/api/mood/trends" && req.method === "GET") {
    return sendJson(res, 200, moodTrend(db.moodCheckins.filter((item) => item.userId === user.id)));
  }

  if (pathname === "/api/analysis/post" && req.method === "POST") {
    const result = mcpOrchestrate({ type: "post", input: { text: body.text || "" }, user, db });
    const row = { id: id("post"), userId: user.id, inputText: body.text || "", ...result.textResult, createdAt: new Date().toISOString() };
    db.postAnalyses.push(row);
    if (result.textResult.riskLevel === "High") db.crisisAlerts.push({ id: id("alert"), userId: user.id, triggerSource: "post", riskLevel: "High", resolved: false, detectedTerms: result.textResult.importantPhrases, createdAt: row.createdAt });
    await writeDb(db);
    return sendJson(res, 200, { analysis: row, ...result });
  }

  if (pathname === "/api/analysis/image" && req.method === "POST") {
    const ocrText = body.ocrText || body.caption || "";
    const result = mcpOrchestrate({ type: "image", input: { text: ocrText }, user, db });
    const visualEmotions = {
      sadness: body.visualTone === "sad" ? 0.72 : 0.22,
      tension: body.visualTone === "tense" ? 0.67 : 0.18,
      neutral: body.visualTone === "neutral" ? 0.72 : 0.3
    };
    const row = { id: id("image"), userId: user.id, ocrText, visualTone: body.visualTone || "unknown", visualEmotions, combinedPrediction: result.textResult.label, confidence: result.textResult.confidence, riskLevel: result.textResult.riskLevel, explanation: result.textResult.importantPhrases, createdAt: new Date().toISOString() };
    db.imageAnalyses.push(row);
    await writeDb(db);
    return sendJson(res, 200, { analysis: row, ...result, visualEmotions });
  }

  if (pathname === "/api/chat/message" && req.method === "POST") {
    const result = mcpOrchestrate({ type: "chat", input: { text: body.message || "" }, user, db });
    const reply = supportiveChatReply(body.message || "", result);
    const userMessage = { id: id("chat"), userId: user.id, sender: "user", message: body.message || "", riskFlag: result.textResult.riskLevel === "High", createdAt: new Date().toISOString() };
    const assistantMessage = { id: id("chat"), userId: user.id, sender: "assistant", message: reply, riskFlag: result.textResult.riskLevel === "High", createdAt: new Date().toISOString() };
    db.chatMessages.push(userMessage, assistantMessage);
    if (result.textResult.riskLevel === "High") db.crisisAlerts.push({ id: id("alert"), userId: user.id, triggerSource: "chat", riskLevel: "High", resolved: false, detectedTerms: result.textResult.importantPhrases, createdAt: userMessage.createdAt });
    await writeDb(db);
    return sendJson(res, 200, { reply, result, messages: [userMessage, assistantMessage] });
  }

  if (pathname === "/api/chat/messages" && req.method === "GET") {
    return sendJson(res, 200, { messages: db.chatMessages.filter((item) => item.userId === user.id).slice(-30) });
  }

  if (pathname === "/api/support/resources" && req.method === "GET") {
    return sendJson(res, 200, { crisis: crisisResources("US"), coping: copingRecommendations("Low", "Stable") });
  }

  if (pathname === "/api/admin/dashboard" && req.method === "GET") {
    if (!requireRole(user, ["admin", "counselor", "researcher"])) return sendJson(res, 403, { error: "Insufficient role." });
    const anonymizedMood = db.moodCheckins.map((item) => ({ moodScore: item.moodScore, stressScore: item.stressScore, createdAt: item.createdAt }));
    return sendJson(res, 200, {
      users: db.users.length,
      alerts: db.crisisAlerts,
      aggregate: {
        assessments: db.phq9Assessments.length,
        postAnalyses: db.postAnalyses.length,
        imageAnalyses: db.imageAnalyses.length,
        averageMood: anonymizedMood.length ? Number((anonymizedMood.reduce((sum, item) => sum + item.moodScore, 0) / anonymizedMood.length).toFixed(1)) : 0
      }
    });
  }

  return sendJson(res, 404, { error: "API route not found." });
}

async function createSession(res, db, user) {
  const token = crypto.randomBytes(32).toString("hex");
  db.sessions.push({ id: id("session"), userId: user.id, token, expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString() });
  await writeDb(db);
  res.writeHead(200, {
    "Content-Type": "application/json; charset=utf-8",
    "Set-Cookie": `mg_session=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL_MS / 1000}`
  });
  res.end(JSON.stringify({ user: publicUser(user) }));
}

function serveStatic(req, res, pathname) {
  const filePath = pathname === "/" ? join(PUBLIC_DIR, "index.html") : join(PUBLIC_DIR, pathname);
  const resolved = resolve(filePath);
  if (!resolved.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }
  const fallback = join(PUBLIC_DIR, "index.html");
  const target = existsSync(resolved) ? resolved : fallback;
  const ext = extname(target);
  res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
  createReadStream(target).pipe(res);
}

await ensureDb();

http
  .createServer(async (req, res) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      if (url.pathname.startsWith("/api/")) return await handleApi(req, res, url.pathname);
      return serveStatic(req, res, url.pathname);
    } catch (error) {
      console.error(error);
      return sendJson(res, 500, { error: "Internal server error." });
    }
  })
  .listen(PORT, HOST, () => {
    console.log(`MindGuard AI running at http://${HOST}:${PORT}`);
  });
