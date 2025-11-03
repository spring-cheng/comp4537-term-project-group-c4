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
  generateBtn.textContent = MESSAGES.aiTest.generating;
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
      throw new Error(`${MESSAGES.aiTest.apiError}${response.status}`);
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

    showMessage(MESSAGES.aiTest.responseSuccess, false);
  } catch (error) {
    console.error("Error:", error);
    showMessage(MESSAGES.aiTest.responseFailed + error.message, true);
    responseDiv.textContent = MESSAGES.aiTest.errorGenerating;
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = MESSAGES.aiTest.generateResponse;
  }
});
