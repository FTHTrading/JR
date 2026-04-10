const express = require("express");
const fs = require("fs");
const path = require("path");
const { readLeads, writeLeads, summarize } = require("./store");

const app = express();
const PORT = process.env.PORT || 4099;
const CONFIG_PATH = path.join(__dirname, "..", "app.config.json");

const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));

function nextLeadId(leads) {
  const max = leads.reduce((highest, lead) => {
    const n = Number(String(lead.id || "").replace("JR-", ""));
    if (Number.isFinite(n)) return Math.max(highest, n);
    return highest;
  }, 0);
  return `JR-${String(max + 1).padStart(4, "0")}`;
}

function mapExternalIntake(payload) {
  const p = payload || {};
  const urgency = String(p.urgency_precheck || p.urgency || "green").toLowerCase();
  const safeUrgency = ["red", "amber", "green"].includes(urgency) ? urgency : "green";

  return {
    name: p.person_name || p.name || "Unnamed Lead",
    state: p.state || "UNKNOWN",
    caseType: p.case_type || "unknown",
    urgency: safeUrgency,
    ownerRole: config.defaultRole,
    summary: p.narrative_raw || p.summary || "",
    deadline: p.deadlines_raw || "",
    source: p.lead_source || "la.unykorn.org",
  };
}

function getRoleFromApiKey(req) {
  const auth = config.auth || {};
  if (!auth.enabled) return "admin";
  const apiKey = req.headers["x-jr-key"];
  if (!apiKey) return null;
  return (auth.apiKeys || {})[String(apiKey)] || null;
}

function requireRole(allowedRoles) {
  return (req, res, next) => {
    const role = getRoleFromApiKey(req);
    if (!role) {
      return res.status(401).json({ error: "Missing or invalid x-jr-key" });
    }
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ error: `Role ${role} is not authorized for this action` });
    }
    req.userRole = role;
    next();
  };
}

function buildFallbackResponse(message) {
  const lower = String(message || "").toLowerCase();

  if (lower.includes("evict") || lower.includes("landlord") || lower.includes("rent")) {
    return "I hear housing pressure in your message. I can help build a landlord timeline, payment proof index, and deadline checklist so counsel can act quickly.";
  }

  if (lower.includes("custody") || lower.includes("child") || lower.includes("family")) {
    return "I can organize a family matter packet with party map, event timeline, and child-impact notes. If safety is immediate, contact emergency services now and then share your documents for rapid escalation.";
  }

  if (lower.includes("arrest") || lower.includes("charge") || lower.includes("court")) {
    return "I can help structure your criminal-case intake into a hearing-ready summary with facts, dates, records, and open defense questions for licensed counsel review.";
  }

  return "I can help turn your situation into a structured case file: summary, timeline, evidence index, missing-doc checklist, and escalation path. Share what happened, where, and the next deadline.";
}

async function generateRitaResponse(message) {
  const persona = config.persona || {};
  const modelCfg = persona.model || {};
  const gpuMode = Boolean(modelCfg.useLocalLlm);

  if (gpuMode && modelCfg.endpoint && modelCfg.modelName) {
    try {
      const prompt = [
        persona.systemPrompt || "You are Rita, an empathetic legal advocacy intake assistant.",
        "Rules: Do not present legal advice. Focus on intake structure, urgency, evidence organization, and escalation.",
        `User message: ${message}`,
      ].join("\n\n");

      const response = await fetch(modelCfg.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: modelCfg.modelName,
          prompt,
          stream: false,
          options: {
            temperature: modelCfg.temperature ?? 0.3,
            num_ctx: modelCfg.contextWindow ?? 4096,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && typeof data.response === "string" && data.response.trim()) {
          return data.response.trim();
        }
      }
    } catch (error) {
      // Local model not reachable, fallback to deterministic response.
    }
  }

  return buildFallbackResponse(message);
}

async function getModelHealth() {
  const modelCfg = (config.persona || {}).model || {};
  if (!modelCfg.useLocalLlm || !modelCfg.healthEndpoint) {
    return { mode: "fallback", gpu: false, online: true };
  }

  try {
    const response = await fetch(modelCfg.healthEndpoint);
    return { mode: "gpu", gpu: true, online: response.ok };
  } catch (error) {
    return { mode: "gpu", gpu: true, online: false };
  }
}

async function getTtsHealth() {
  const voice = ((config.persona || {}).voice || {}).serverTts || {};
  if (!voice.enabled || !voice.healthEndpoint) {
    return { enabled: false, online: false };
  }

  try {
    const response = await fetch(voice.healthEndpoint);
    return { enabled: true, online: response.ok };
  } catch (error) {
    return { enabled: true, online: false };
  }
}

async function synthesizeVoice(text) {
  const voice = ((config.persona || {}).voice || {}).serverTts || {};
  if (!voice.enabled || !voice.endpoint) {
    return null;
  }

  const response = await fetch(voice.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice: voice.voice || "rita" }),
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  if (!data || typeof data.audioBase64 !== "string") {
    return null;
  }

  return {
    audioBase64: data.audioBase64,
    mimeType: data.mimeType || "audio/wav",
  };
}

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/api/config", (req, res) => {
  const safeConfig = {
    appName: config.appName,
    defaultRole: config.defaultRole,
    laEndpoint: config.laEndpoint,
    persona: {
      name: (config.persona || {}).name,
      role: (config.persona || {}).role,
      tone: (config.persona || {}).tone,
      voice: {
        provider: (((config.persona || {}).voice || {}).provider) || "browser-speech",
        preferredLocale: (((config.persona || {}).voice || {}).preferredLocale) || "en-US",
      },
    },
    auth: {
      enabled: Boolean((config.auth || {}).enabled),
    },
    slaHours: config.slaHours,
  };
  res.json(safeConfig);
});

app.get("/api/auth/whoami", (req, res) => {
  const role = getRoleFromApiKey(req);
  if (!role) {
    return res.status(401).json({ authenticated: false });
  }
  return res.json({ authenticated: true, role });
});

app.get("/api/persona", (req, res) => {
  const persona = config.persona || {};
  res.json({
    name: persona.name || "Rita",
    role: persona.role || "Advocacy Intake Guide",
    tone: persona.tone || "Calm, direct, and trauma-aware",
    voice: persona.voice || {
      provider: "browser-speech",
      preferredLocale: "en-US",
    },
  });
});

app.get("/api/persona/health", async (req, res) => {
  const model = await getModelHealth();
  const tts = await getTtsHealth();
  return res.json({ ...model, tts });
});

app.post("/api/persona/respond", async (req, res) => {
  const message = String((req.body || {}).message || "").trim();
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const reply = await generateRitaResponse(message);
  return res.json({
    message,
    reply,
    disclaimer:
      "Rita is an advocacy support persona and not a law firm representative. For legal advice, consult licensed counsel.",
  });
});

app.post("/api/persona/speak", async (req, res) => {
  const text = String((req.body || {}).text || "").trim();
  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  try {
    const audio = await synthesizeVoice(text);
    if (audio) {
      return res.json({ mode: "server-audio", ...audio });
    }

    return res.json({ mode: "browser-tts" });
  } catch (error) {
    return res.json({ mode: "browser-tts" });
  }
});

app.get("/api/dashboard", requireRole(["intake", "advocate", "reviewer", "admin"]), (req, res) => {
  const leads = readLeads();
  res.json({ summary: summarize(leads), leads });
});

app.get("/api/leads", requireRole(["intake", "advocate", "reviewer", "admin"]), (req, res) => {
  const role = (req.query.role || "all").toLowerCase();
  const urgency = (req.query.urgency || "all").toLowerCase();
  let leads = readLeads();

  if (role !== "all") {
    leads = leads.filter((lead) => lead.ownerRole === role);
  }

  if (urgency !== "all") {
    leads = leads.filter((lead) => lead.urgency === urgency);
  }

  res.json(leads);
});

app.post("/api/leads", requireRole(["intake", "admin"]), (req, res) => {
  const leads = readLeads();
  const payload = req.body || {};

  const newLead = {
    id: nextLeadId(leads),
    name: payload.name || "Unnamed Lead",
    state: payload.state || "UNKNOWN",
    caseType: payload.caseType || "unknown",
    urgency: payload.urgency || "green",
    status: "new",
    ownerRole: payload.ownerRole || config.defaultRole,
    summary: payload.summary || "",
    createdAt: new Date().toISOString(),
    deadline: payload.deadline || "",
    packetReady: false,
    source: payload.source || "manual",
  };

  leads.unshift(newLead);
  writeLeads(leads);
  res.status(201).json(newLead);
});

app.post("/api/integrations/la/intake", (req, res) => {
  const expectedKey = (((config.integrations || {}).la || {}).webhookKey) || "";
  const receivedKey = String(req.headers["x-la-webhook-key"] || "");

  if (!expectedKey || receivedKey !== expectedKey) {
    return res.status(401).json({ error: "Invalid LA webhook key" });
  }

  const leads = readLeads();
  const payload = mapExternalIntake(req.body || {});
  const newLead = {
    id: nextLeadId(leads),
    name: payload.name,
    state: payload.state,
    caseType: payload.caseType,
    urgency: payload.urgency,
    status: "new",
    ownerRole: payload.ownerRole,
    summary: payload.summary,
    createdAt: new Date().toISOString(),
    deadline: payload.deadline,
    packetReady: false,
    source: payload.source,
  };

  leads.unshift(newLead);
  writeLeads(leads);
  return res.status(201).json({ lead: newLead });
});

app.patch("/api/leads/:id", requireRole(["intake", "advocate", "reviewer", "admin"]), (req, res) => {
  const leads = readLeads();
  const idx = leads.findIndex((lead) => lead.id === req.params.id);

  if (idx === -1) {
    return res.status(404).json({ error: "Lead not found" });
  }

  leads[idx] = {
    ...leads[idx],
    ...req.body,
  };

  writeLeads(leads);
  return res.json(leads[idx]);
});

app.post("/api/packets/:id/generate", requireRole(["advocate", "reviewer", "admin"]), (req, res) => {
  const leads = readLeads();
  const idx = leads.findIndex((lead) => lead.id === req.params.id);

  if (idx === -1) {
    return res.status(404).json({ error: "Lead not found" });
  }

  const lead = leads[idx];
  const packet = {
    leadId: lead.id,
    generatedAt: new Date().toISOString(),
    sections: [
      "Case Summary",
      "Timeline",
      "Evidence Index",
      "Missing Documents",
      "Counsel Questions",
    ],
    disclaimer:
      "JR is a legal operations platform and does not provide legal advice. Red-tier matters require licensed counsel review.",
  };

  leads[idx].packetReady = true;
  leads[idx].status = "packet_ready";
  writeLeads(leads);

  return res.json({ packet, updatedLead: leads[idx] });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "site.html"));
});

app.get("/ops", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "site.html"));
});

app.listen(PORT, () => {
  console.log(`UNYKORN front site running at http://localhost:${PORT}`);
});
