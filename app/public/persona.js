let voiceEnabled = true;
let listening = false;

function appendMessage(who, text) {
  const chat = document.getElementById("chatWindow");
  const el = document.createElement("div");
  el.className = "msg";
  el.innerHTML = `<strong>${who}</strong><div>${text}</div>`;
  chat.appendChild(el);
  chat.scrollTop = chat.scrollHeight;
}

function speak(text) {
  if (!voiceEnabled || !window.speechSynthesis) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  utter.rate = 0.96;
  utter.pitch = 1.02;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

async function loadPersonaHealth() {
  const healthEl = document.getElementById("ritaHealth");
  try {
    const response = await fetch("/api/persona/health");
    const data = await response.json();
    if (data.gpu && data.online) {
      healthEl.textContent = "GPU mode online (5090 path)";
      healthEl.style.background = "#dcfce7";
      healthEl.style.color = "#166534";
      return;
    }

    if (data.gpu && !data.online) {
      healthEl.textContent = "GPU configured, fallback active";
      healthEl.style.background = "#ffedd5";
      healthEl.style.color = "#9a3412";
      return;
    }

    healthEl.textContent = "Fallback mode online";
    healthEl.style.background = "#e0f2fe";
    healthEl.style.color = "#0c4a6e";
  } catch (error) {
    healthEl.textContent = "Health check unavailable";
  }
}

function setupSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    return null;
  }

  const recognizer = new SpeechRecognition();
  recognizer.lang = "en-US";
  recognizer.interimResults = false;

  recognizer.onresult = (event) => {
    const text = event.results[0][0].transcript;
    document.getElementById("ritaInput").value = text;
  };

  recognizer.onend = () => {
    listening = false;
    document.getElementById("listenBtn").textContent = "Start Mic";
  };

  return recognizer;
}

async function askRita(message) {
  const response = await fetch("/api/persona/respond", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error("Rita request failed");
  }

  return response.json();
}

async function init() {
  appendMessage("Rita", "I am ready. Tell me what happened, where it happened, and your nearest deadline.");
  await loadPersonaHealth();

  const recognizer = setupSpeechRecognition();
  const form = document.getElementById("ritaForm");
  const input = document.getElementById("ritaInput");

  document.getElementById("voiceToggle").addEventListener("click", () => {
    voiceEnabled = !voiceEnabled;
    document.getElementById("voiceToggle").textContent = `Voice Reply: ${voiceEnabled ? "ON" : "OFF"}`;
    if (!voiceEnabled) window.speechSynthesis.cancel();
  });

  document.getElementById("listenBtn").addEventListener("click", () => {
    if (!recognizer) {
      appendMessage("System", "Speech recognition is not available in this browser.");
      return;
    }

    if (listening) {
      recognizer.stop();
      return;
    }

    listening = true;
    document.getElementById("listenBtn").textContent = "Stop Mic";
    recognizer.start();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = input.value.trim();
    if (!message) return;

    appendMessage("You", message);
    input.value = "";

    try {
      const data = await askRita(message);
      appendMessage("Rita", data.reply);
      speak(data.reply);
    } catch (error) {
      appendMessage("System", "Rita is temporarily unavailable. Please try again.");
    }
  });
}

init();
