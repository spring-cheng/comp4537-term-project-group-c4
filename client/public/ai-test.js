import { MESSAGES } from "./lang/messages/en/user.js";
import { API_ENDPOINTS } from "./config.js";

// Authentication will be checked via API calls (token is in httpOnly cookie)

const promptInput = document.getElementById("prompt");
const generateBtn = document.getElementById("generateBtn");
const responseContainer = document.getElementById("responseContainer");
const responseDiv = document.getElementById("response");
const messageDiv = document.getElementById("message");
const backBtn = document.getElementById("backBtn");
const apiUsageText = document.getElementById("apiUsageText");
const warningContainer = document.getElementById("warningContainer");
const warningText = document.getElementById("warningText");

// Set text content from messages
document.getElementById("ai-test-title").textContent = MESSAGES.pageTitleAiTest;
document.getElementById("api-usage-title").textContent = MESSAGES.aiTest.apiUsage;
document.getElementById("prompt-label").textContent = MESSAGES.promptLabel;
document.getElementById("prompt").placeholder = MESSAGES.promptPlaceholder;
document.getElementById("generateBtn").textContent = MESSAGES.generateResponse;
document.getElementById("response-label").textContent = MESSAGES.aiTest.response;
document.getElementById("backBtn").textContent = MESSAGES.backToDashboard;

// back to dashboard
backBtn.addEventListener("click", () => {
  window.location.href = "/dashboard";
});

// Load API usage information
async function loadApiUsage() {
  try {
    const res = await fetch(API_ENDPOINTS.DASHBOARD, {
      credentials: 'include', // Include httpOnly cookie
    });
    if (!res.ok) throw new Error("Failed to load API usage");

    const data = await res.json();
    const apiCalls = data.api_usage?.api_calls ?? data.user?.api_calls ?? 0;
    const limit = data.api_usage?.limit ?? 20;
    const remaining = data.api_usage?.remaining_calls ?? (limit - apiCalls);
    const limitReached = data.api_usage?.limit_reached ?? false;

    if (data.user?.role === "admin") {
      apiUsageText.textContent = MESSAGES.aiTest.adminUnlimitedCalls.replace("{apiCalls}", apiCalls);
      apiUsageText.style.color = "#28a745";
    } else {
      apiUsageText.textContent = MESSAGES.aiTest.apiCallsFormat
        .replace("{apiCalls}", apiCalls)
        .replace("{limit}", limit)
        .replace("{remaining}", remaining);

      if (limitReached) {
        apiUsageText.style.color = "#dc3545";
        warningContainer.style.display = "block";
        warningContainer.className = "warning-container warning-limit-reached";
        warningText.textContent = MESSAGES.aiTest.limitReachedWarning.replace("{limit}", limit);
      } else if (remaining <= 3) {
        apiUsageText.style.color = "#ffc107";
        warningContainer.style.display = "block";
        warningContainer.className = "warning-container warning-low-calls";
        const plural = remaining === 1 ? "" : "s";
        warningText.textContent = MESSAGES.aiTest.lowCallsWarning
          .replace("{remaining}", remaining)
          .replace("{plural}", plural);
      } else {
        apiUsageText.style.color = "#28a745";
        warningContainer.style.display = "none";
        warningContainer.className = "warning-container";
      }
    }
  } catch (err) {
    console.error("Error loading API usage:", err);
    apiUsageText.textContent = MESSAGES.aiTest.unableToLoadUsage;
    apiUsageText.style.color = "#dc3545";
  }
}

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
    const response = await fetch(API_ENDPOINTS.AI.GENERATE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include', // Include httpOnly cookie
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
    let firstChunk = true;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter((line) => line.trim());

      for (const line of lines) {
        try {
          const data = JSON.parse(line);

          // Check for warning message (sent first by server)
          if (data.warning) {
            warningContainer.style.display = "block";
            warningText.textContent = MESSAGES.aiTest.warningPrefix + data.warning;

            if (data.limit_reached) {
              warningContainer.className = "warning-container warning-limit-reached";
            } else {
              warningContainer.className = "warning-container warning-low-calls";
            }

            // Update API usage display
            if (data.api_calls !== null && data.limit !== null) {
              const remaining = Math.max(0, data.limit - data.api_calls);
              apiUsageText.textContent = MESSAGES.aiTest.apiCallsFormat
                .replace("{apiCalls}", data.api_calls)
                .replace("{limit}", data.limit)
                .replace("{remaining}", remaining);
              apiUsageText.style.color = data.limit_reached ? "#dc3545" : "#ffc107";
            }

            // Reload API usage after request completes
            setTimeout(() => loadApiUsage(), 1000);
            continue;
          }

          // Handle response data
          if (data.response) {
            responseDiv.textContent += data.response;
          }
        } catch (e) {
          // If it's not JSON, it might be part of the response text
          if (firstChunk && !line.startsWith("{")) {
            responseDiv.textContent += line;
          } else {
            console.log("Could not parse line:", line);
          }
        }
      }

      firstChunk = false;
    }

    // Reload API usage after successful request
    await loadApiUsage();
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

// Load API usage on page load
loadApiUsage();
