import { MESSAGES } from "./lang/messages/en/user.js";
import { API_ENDPOINTS } from "./config.js";

// Check authentication by trying to fetch user data
// Token is stored in httpOnly cookie, so we can't check it directly

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
    const res = await fetch(API_ENDPOINTS.DASHBOARD, {
      credentials: 'include', // Include httpOnly cookie
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        // Not authenticated, redirect to login
        window.location.href = "/login";
        return;
      }
      throw new Error(`Failed to fetch user data: ${res.status}`);
    }

    const data = await res.json();

    userEmailEl.textContent = data.user.email || MESSAGES.notAvailable;
    totalApiCallsEl.textContent = data.api_usage?.api_calls ?? data.user.api_calls ?? 0;

    // Store role for client-side checks
    if (data.user && data.user.role) {
      localStorage.setItem('role', data.user.role);

      // Show delete button only for non-admin users
      if (data.user.role !== 'admin') {
        document.getElementById('deleteAccountBtn').style.display = 'block';
      }
    }
  } catch (err) {
    console.error(err);
    userEmailEl.textContent = MESSAGES.errorLoadingData;
    totalApiCallsEl.textContent = MESSAGES.error;
  }
}

// logout handler
document.getElementById("logoutBtn").addEventListener("click", async () => {
  try {
    // Call logout endpoint to clear httpOnly cookie
    await fetch(API_ENDPOINTS.AUTH.LOGOUT, {
      method: 'POST',
      credentials: 'include',
    });
  } catch (err) {
    console.error('Logout error:', err);
  }

  // Clear localStorage
  localStorage.removeItem("role");
  window.location.href = "/login";
});

// delete account handler
document.getElementById("deleteAccountBtn").addEventListener("click", async () => {
  // Show confirmation dialog
  if (!confirm(MESSAGES.confirmDeleteAccount)) {
    return;
  }

  try {
    const res = await fetch(API_ENDPOINTS.AUTH.DELETE_ACCOUNT, {
      method: 'DELETE',
      credentials: 'include',
    });

    const data = await res.json();

    if (res.ok) {
      alert(MESSAGES.deleteAccountSuccess);
      localStorage.removeItem("role");
      window.location.href = "/";
    } else {
      alert(MESSAGES.deleteAccountFailed + ': ' + (data.error || data.message));
    }
  } catch (err) {
    console.error('Delete account error:', err);
    alert(MESSAGES.networkError);
  }
});

loadUserData();

