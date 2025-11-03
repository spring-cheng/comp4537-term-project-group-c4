const API_URL = "http://localhost:4000";
const token = localStorage.getItem("jwt");

// redirect unauthenticated users
if (!token) window.location.href = "/login";

// DOM ref's
const userEmailEl = document.getElementById("user-email");
const totalApiCallsEl = document.getElementById("total-api-calls");

// load user data
async function loadUserData() {
  try {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Failed to fetch user data: ${res.status}`);
    const data = await res.json();

    userEmailEl.textContent = data.user.email || "N/A";
    totalApiCallsEl.textContent = data.user.api_calls ?? 0;
  } catch (err) {
    console.error(err);
    userEmailEl.textContent = "Error loading data";
    totalApiCallsEl.textContent = "Error";
  }
}

// logout handler
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("jwt");
  window.location.href = "/login";
});

loadUserData();

