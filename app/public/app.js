async function fetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
}

function makeKpi(label, value) {
  const el = document.createElement("div");
  el.className = "kpi";
  el.innerHTML = `<div class="label">${label}</div><div class="value">${value}</div>`;
  return el;
}

function renderKpis(summary) {
  const container = document.getElementById("kpis");
  container.innerHTML = "";
  container.appendChild(makeKpi("Total Leads", summary.total));
  container.appendChild(makeKpi("Red", summary.byUrgency.red || 0));
  container.appendChild(makeKpi("Amber", summary.byUrgency.amber || 0));
  container.appendChild(makeKpi("Green", summary.byUrgency.green || 0));
  container.appendChild(makeKpi("Packet Ready", summary.packetReady));
}

function leadMeta(lead) {
  return `${lead.id} • ${lead.caseType} • ${lead.state} • owner:${lead.ownerRole} • status:${lead.status}`;
}

async function refreshLeads() {
  const role = document.getElementById("role").value;
  const urgency = document.getElementById("urgency").value;

  const [dashboard, leads] = await Promise.all([
    fetchJson("/api/dashboard"),
    fetchJson(`/api/leads?role=${encodeURIComponent(role)}&urgency=${encodeURIComponent(urgency)}`),
  ]);

  renderKpis(dashboard.summary);
  renderLeadList(leads);
}

function renderLeadList(leads) {
  const list = document.getElementById("leadList");
  const template = document.getElementById("leadCardTemplate");
  list.innerHTML = "";

  for (const lead of leads) {
    const node = template.content.cloneNode(true);
    node.querySelector("h3").textContent = lead.name;

    const badge = node.querySelector(".urgency");
    badge.textContent = lead.urgency;
    badge.classList.add(lead.urgency);

    node.querySelector(".meta").textContent = leadMeta(lead);
    node.querySelector(".summary").textContent = lead.summary || "No summary yet.";

    const [packetBtn, statusBtn] = node.querySelectorAll("button");

    packetBtn.addEventListener("click", async () => {
      await fetchJson(`/api/packets/${lead.id}/generate`, { method: "POST" });
      await refreshLeads();
    });

    statusBtn.addEventListener("click", async () => {
      await fetchJson(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "in_review" }),
      });
      await refreshLeads();
    });

    list.appendChild(node);
  }
}

async function init() {
  const status = document.getElementById("appStatus");
  const config = await fetchJson("/api/config");
  status.textContent = `Online • default role: ${config.defaultRole}`;

  document.getElementById("refresh").addEventListener("click", refreshLeads);

  document.getElementById("newLeadForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    const payload = Object.fromEntries(form.entries());

    await fetchJson("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    event.target.reset();
    await refreshLeads();
  });

  await refreshLeads();
}

init().catch((err) => {
  const status = document.getElementById("appStatus");
  status.textContent = "Offline";
  console.error(err);
});
