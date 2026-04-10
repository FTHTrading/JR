let provider;
let signer;
let walletAddress = "";
let chainConfig;
let contractAbi;
let activeCase;

function setText(id, text) {
  document.getElementById(id).textContent = text;
}

function renderStatus(lines) {
  const panel = document.getElementById("statusPanel");
  panel.innerHTML = lines.map((line) => `<div>${line}</div>`).join("");
}

function renderPanel(id, lines) {
  const panel = document.getElementById(id);
  if (!panel) return;
  panel.innerHTML = lines.map((line) => `<div>${line}</div>`).join("");
}

async function getJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status} ${text}`);
  }
  return response.json();
}

async function loadChainConfig() {
  chainConfig = await getJson("/api/chain/config");
  setText("chainState", `Contract: ${chainConfig.contractAddress || "Not configured"}`);
  const abiBundle = await getJson(chainConfig.contractAbiPath || "/abi/CaseAnchor.json");
  contractAbi = abiBundle.abi;
}

async function connectWallet() {
  if (!window.ethereum) {
    renderStatus(["Wallet extension not detected. Install MetaMask or compatible wallet."]);
    return;
  }

  provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = await provider.getSigner();
  walletAddress = await signer.getAddress();
  setText("walletState", `Wallet: ${walletAddress}`);

  const network = await provider.getNetwork();
  setText("networkState", `Network: chainId ${network.chainId}`);
}

async function ensurePolygonNetwork() {
  if (!window.ethereum) throw new Error("Wallet not available");

  const targetHex = `0x${Number(chainConfig.chainId).toString(16)}`;
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: targetHex }],
    });
  } catch (error) {
    if (error.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: targetHex,
          chainName: chainConfig.networkName || "Polygon Mainnet",
          rpcUrls: [chainConfig.rpcUrl],
          nativeCurrency: { name: "MATIC", symbol: "POL", decimals: 18 },
          blockExplorerUrls: ["https://polygonscan.com"],
        }],
      });
    } else {
      throw error;
    }
  }
}

async function createCase(payload) {
  return getJson("/api/public/cases", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

async function lookupCase(payload) {
  return getJson("/api/public/cases/lookup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

async function persistTx(caseId, txHash) {
  return getJson(`/api/public/cases/${encodeURIComponent(caseId)}/tx`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      txHash,
      walletAddress,
      chainId: Number(chainConfig.chainId || 137),
    }),
  });
}

async function refreshCaseStatus() {
  if (!activeCase) return;
  const status = await getJson(`/api/public/cases/${encodeURIComponent(activeCase.caseId)}`);
  const txLink = status.txHash ? `${chainConfig.explorerBaseUrl}${status.txHash}` : "";
  renderStatus([
    `Case ID: ${status.caseId}`,
    `Status: ${status.onChainStatus}`,
    txLink ? `Tx: ${txLink}` : "Tx: not anchored yet",
    status.deadline ? `Deadline: ${status.deadline}` : "Deadline: not set",
  ]);
}

async function anchorOnChain() {
  if (!activeCase) throw new Error("Create case first");
  if (!signer) throw new Error("Connect wallet first");
  if (!chainConfig.contractAddress || /^0x0+$/.test(chainConfig.contractAddress)) {
    throw new Error("Contract address is not configured in app.config.json");
  }

  await ensurePolygonNetwork();

  const contract = new ethers.Contract(chainConfig.contractAddress, contractAbi, signer);
  const tx = await contract.anchorCase(activeCase.caseIdHash, activeCase.evidenceHash, activeCase.caseType);
  renderStatus([`Transaction submitted: ${tx.hash}`, "Waiting for confirmation..."]);
  await tx.wait(1);

  await persistTx(activeCase.caseId, tx.hash);
  await refreshCaseStatus();
}

async function init() {
  await loadChainConfig();

  const lookupForm = document.getElementById("lookupForm");
  const ritaLiteForm = document.getElementById("ritaLiteForm");

  document.getElementById("connectWalletBtn").addEventListener("click", async () => {
    try {
      await connectWallet();
    } catch (error) {
      renderStatus([`Wallet error: ${error.message}`]);
    }
  });

  document.getElementById("clientIntakeForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const payload = Object.fromEntries(formData.entries());
    payload.walletAddress = walletAddress;

    try {
      activeCase = await createCase(payload);
      setText("caseMeta", `Case ${activeCase.caseId} prepared. Ready to anchor on-chain.`);
      document.getElementById("anchorBtn").disabled = false;
      document.getElementById("statusBtn").disabled = false;
      renderStatus([
        `Case ID: ${activeCase.caseId}`,
        `Case hash: ${activeCase.caseIdHash}`,
        `Evidence hash: ${activeCase.evidenceHash}`,
        "Next step: click Anchor Case On Polygon",
      ]);
    } catch (error) {
      renderStatus([`Create case error: ${error.message}`]);
    }
  });

  document.getElementById("anchorBtn").addEventListener("click", async () => {
    try {
      await anchorOnChain();
    } catch (error) {
      renderStatus([`Anchor error: ${error.message}`]);
    }
  });

  document.getElementById("statusBtn").addEventListener("click", async () => {
    try {
      await refreshCaseStatus();
    } catch (error) {
      renderStatus([`Status error: ${error.message}`]);
    }
  });

  if (lookupForm) {
    lookupForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      renderPanel("lookupPanel", ["Checking case status..."]);

      const formData = new FormData(event.target);
      const payload = Object.fromEntries(formData.entries());

      try {
        const data = await lookupCase(payload);
        renderPanel("lookupPanel", [
          `Case ID: ${data.caseId}`,
          `Status: ${data.status}`,
          `Client: ${data.clientName}`,
          `Matter: ${data.matterType}`,
          data.txHash ? `Anchor TX: ${data.txHash}` : "Anchor TX: not anchored yet",
          `Updated: ${new Date(data.updatedAt).toLocaleString()}`,
        ]);
      } catch (error) {
        renderPanel("lookupPanel", [`Lookup error: ${error.message}`]);
      }
    });
  }

  if (ritaLiteForm) {
    ritaLiteForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      renderPanel("ritaLitePanel", ["Rita is preparing guidance..."]);

      const formData = new FormData(event.target);
      const clientName = String(formData.get("clientName") || "").trim();
      const summary = String(formData.get("summary") || "").trim();

      const prompt = [
        `Client: ${clientName}`,
        `Summary: ${summary}`,
        "Provide a calm, plain-language intake response with next steps and key documents to gather.",
      ].join("\n");

      try {
        const data = await getJson("/api/persona/respond", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, style: "professional" }),
        });

        renderPanel("ritaLitePanel", [data.reply || "No response generated."]);
      } catch (error) {
        renderPanel("ritaLitePanel", [`Rita error: ${error.message}`]);
      }
    });
  }

  renderStatus([
    "Portal ready.",
    "Connect wallet, submit intake, and anchor your case hash on Polygon.",
  ]);
}

init().catch((error) => {
  renderStatus([`Initialization error: ${error.message}`]);
});
