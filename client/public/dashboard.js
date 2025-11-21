import { MESSAGES } from "./lang/messages/en/user.js";

const API_URL = "http://localhost:4000";
const token = localStorage.getItem("jwt");

// redirect unauthenticated users
if (!token) window.location.href = "/login";

// DOM ref's
const userEmailEl = document.getElementById("user-email");
const totalApiCallsEl = document.getElementById("total-api-calls");

// Set text content from messages
document.getElementById("dashboard-title").textContent = MESSAGES.dashboardTitle;
document.getElementById("your-information").textContent = MESSAGES.dashboard.yourInformation;
document.getElementById("email-label").textContent = MESSAGES.dashboard.email;
document.getElementById("api-calls-label").textContent = MESSAGES.dashboard.totalApiCalls;
document.getElementById("testAiBtn").textContent = MESSAGES.testAiModel;
document.getElementById("logoutBtn").textContent = MESSAGES.logoutButton;
userEmailEl.textContent = MESSAGES.loading;

// load user data
async function loadUserData() {
  try {
    const res = await fetch(`${API_URL}/api/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Failed to fetch user data: ${res.status}`);
    const data = await res.json();

    userEmailEl.textContent = data.user.email || MESSAGES.notAvailable;
    totalApiCallsEl.textContent = data.api_usage?.api_calls ?? data.user.api_calls ?? 0;
  } catch (err) {
    console.error(err);
    userEmailEl.textContent = MESSAGES.errorLoadingData;
    totalApiCallsEl.textContent = MESSAGES.error;
  }
}

// logout handler
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("jwt");
  window.location.href = "/login";
});

loadUserData();

