const express = require("express");
const fs = require("fs");
const path = require("path");
const { readLeads, writeLeads, summarize } = require("./store");

const app = express();
const PORT = process.env.PORT || 4099;
const CONFIG_PATH = path.join(__dirname, "..", "app.config.json");

const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/api/config", (req, res) => {
  res.json(config);
});

app.get("/api/dashboard", (req, res) => {
  const leads = readLeads();
  res.json({ summary: summarize(leads), leads });
});

app.get("/api/leads", (req, res) => {
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

app.post("/api/leads", (req, res) => {
  const leads = readLeads();
  const payload = req.body || {};

  const nextIdNum = leads.length + 1;
  const newLead = {
    id: `JR-${String(nextIdNum).padStart(4, "0")}`,
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

app.patch("/api/leads/:id", (req, res) => {
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

app.post("/api/packets/:id/generate", (req, res) => {
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

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`JR Ops Console running at http://localhost:${PORT}`);
});
