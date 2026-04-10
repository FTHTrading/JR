const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "..", "data", "leads.json");

function readLeads() {
  const raw = fs.readFileSync(DATA_PATH, "utf8");
  return JSON.parse(raw);
}

function writeLeads(leads) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(leads, null, 2), "utf8");
}

function summarize(leads) {
  const summary = {
    total: leads.length,
    byUrgency: { red: 0, amber: 0, green: 0 },
    byStatus: {},
    packetReady: 0,
  };

  for (const lead of leads) {
    if (summary.byUrgency[lead.urgency] !== undefined) {
      summary.byUrgency[lead.urgency] += 1;
    }
    summary.byStatus[lead.status] = (summary.byStatus[lead.status] || 0) + 1;
    if (lead.packetReady) summary.packetReady += 1;
  }

  return summary;
}

module.exports = {
  readLeads,
  writeLeads,
  summarize,
};
