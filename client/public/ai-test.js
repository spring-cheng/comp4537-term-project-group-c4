import { MESSAGES } from "./lang/messages/en/user.js";

const token = localStorage.getItem("jwt");

// redirect unauthenticated users
if (!token) window.location.href = "/login";

const promptInput = document.getElementById("prompt");
const generateBtn = document.getElementById("generateBtn");
const responseContainer = document.getElementById("responseContainer");
const responseDiv = document.getElementById("response");
const messageDiv = document.getElementById("message");
const backBtn = document.getElementById("backBtn");

// Set text content from messages
document.getElementById("ai-test-title").textContent = MESSAGES.pageTitleAiTest;
document.getElementById("prompt-label").textContent = MESSAGES.promptLabel;
document.getElementById("prompt").placeholder = MESSAGES.promptPlaceholder;
document.getElementById("generateBtn").textContent = MESSAGES.generateResponse;
document.getElementById("response-label").textContent = MESSAGES.aiTest.response;
document.getElementById("backBtn").textContent = MESSAGES.backToDashboard;

// back to dashboard
backBtn.addEventListener("click", () => {
  window.location.href = "/dashboard";
});

// show message
function showMessage(text, isError = false) {
  messageDiv.textContent = text;
  messageDiv.className = isError ? "message error" : "message success";
  messageDiv.style.display = "block";

  setTimeout(() => {
    messageDiv.style.display = "none";
  }, 5000);
}

// generate response
generateBtn.addEventListener("click", async () => {
  const prompt = promptInput.value.trim();

  if (!prompt) {
    showMessage(MESSAGES.aiTest.pleaseEnterPrompt, true);
    return;
  }

  generateBtn.disabled = true;
  generateBtn.textContent = MESSAGES.generating;
  responseDiv.textContent = "";
  responseContainer.style.display = "block";

  try {
    const response = await fetch("http://localhost:4000/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        model: "tinyllama",
        prompt: prompt,
        options: { temperature: 0.5 },
      }),
    });

    if (!response.ok) {
      throw new Error(`${MESSAGES.apiError}${response.status}`);
    }

    // read streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter((line) => line.trim());

      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          if (data.response) {
            responseDiv.textContent += data.response;
          }
        } catch (e) {
          console.log("Could not parse line:", line);
        }
      }
    }

    showMessage(MESSAGES.responseSuccess, false);
  } catch (error) {
    console.error("Error:", error);
    showMessage(MESSAGES.responseFailed + error.message, true);
    responseDiv.textContent = MESSAGES.errorGenerating;
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = MESSAGES.generateResponse;
  }
});
