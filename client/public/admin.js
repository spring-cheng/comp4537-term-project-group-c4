import { MESSAGES } from "./lang/messages/en/user.js";
import { API_ENDPOINTS } from "./config.js";

// DOM ref's
const usersTable = document.querySelector("#users-table tbody");
const totalUsersEl = document.getElementById("total-users");
const totalCallsEl = document.getElementById("total-calls");

// Set text content from messages
document.getElementById("admin-title").textContent = MESSAGES.adminTitle;
document.getElementById("system-stats").textContent = MESSAGES.admin.systemStatistics;
document.getElementById("total-users-label").textContent = MESSAGES.admin.totalUsers;
document.getElementById("total-calls-label").textContent = MESSAGES.admin.totalApiCalls;
document.getElementById("all-users").textContent = MESSAGES.admin.allUsers;
document.getElementById("endpoint-stats").textContent = MESSAGES.admin.apiEndpointStats;
document.getElementById("th-id").textContent = MESSAGES.admin.tableHeaders.id;
document.getElementById("th-email").textContent = MESSAGES.admin.tableHeaders.email;
document.getElementById("th-role").textContent = MESSAGES.admin.tableHeaders.role;
document.getElementById("th-api-calls").textContent = MESSAGES.admin.tableHeaders.apiCalls;
document.getElementById("th-actions").textContent = MESSAGES.admin.tableHeaders.actions;
document.getElementById("th-method").textContent = MESSAGES.admin.tableHeaders.method;
document.getElementById("th-endpoint").textContent = MESSAGES.admin.tableHeaders.endpoint;
document.getElementById("th-requests").textContent = MESSAGES.admin.tableHeaders.requests;
document.getElementById("users-loading").textContent = MESSAGES.loading;
document.getElementById("endpoints-loading").textContent = MESSAGES.loading;
document.getElementById("logoutBtn").textContent = MESSAGES.logoutButton;

// usage statistics
async function loadUsage() {
  try {
    const res = await fetch(API_ENDPOINTS.ADMIN.USAGE, {
      credentials: 'include', // Include httpOnly cookie
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch usage: ${res.status}`);
    }
    const data = await res.json();

    totalUsersEl.textContent = data.total_users ?? 0;
    totalCallsEl.textContent = data.total_api_calls ?? 0;
  } catch (err) {
    console.error("Error loading usage:", err);
    totalUsersEl.textContent = MESSAGES.error;
    totalCallsEl.textContent = MESSAGES.error;
    alert(MESSAGES.admin.failedToLoadUsage + err.message);
  }
}

// users list
async function loadUsers() {
  try {
    const res = await fetch(API_ENDPOINTS.ADMIN.USERS, {
      credentials: 'include', // Include httpOnly cookie
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch users: ${res.status}`);
    }
    const data = await res.json();

    const { users } = data;
    if (!users || users.length === 0) {
      usersTable.innerHTML = `<tr><td colspan="5">${MESSAGES.admin.noUsersFound}</td></tr>`;
      return;
    }

    usersTable.innerHTML = users
      .map(
        (u) => `
        <tr>
          <td>${u.id}</td>
          <td>${u.email}</td>
          <td>${u.role}</td>
          <td>${u.api_calls ?? 0}</td>
          <td>
            <button class="reset-btn" onclick="resetCalls(${u.id})">${MESSAGES.resetButton}</button>
          </td>
        </tr>`
      )
      .join("");
  } catch (err) {
    console.error("Error loading users:", err);
    usersTable.innerHTML =
      `<tr><td colspan="5" class="error">${MESSAGES.admin.errorLoadingUsers}${err.message}</td></tr>`;
  }
}

// endpoint stats list
async function loadEndpoints() {
  try {
    const res = await fetch(API_ENDPOINTS.ADMIN.ENDPOINT_STATS, {
      credentials: 'include', // Include httpOnly cookie
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch endpoints: ${res.status}`);
    }
    const data = await res.json();

    const tableBody = document.querySelector("#endpoints-table tbody");

    if (!data.stats || data.stats.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="3">${MESSAGES.admin.noEndpointStats}</td></tr>`;
      return;
    }

    tableBody.innerHTML = data.stats
      .map(
        (s) => `
        <tr>
          <td>${s.method}</td>
          <td>${s.endpoint}</td>
          <td>${s.count}</td>
        </tr>`
      )
      .join("");
  } catch (err) {
    console.error("Error loading endpoints:", err);
    const tableBody = document.querySelector("#endpoints-table tbody");
    tableBody.innerHTML =
      `<tr><td colspan="3" class="error">${MESSAGES.admin.errorLoadingEndpoints}${err.message}</td></tr>`;
  }
}

// reset a user's API call count
async function resetCalls(userId) {
  if (!confirm(MESSAGES.admin.resetConfirm)) return;

  try {
    const res = await fetch(API_ENDPOINTS.ADMIN.RESET_API_CALLS(userId), {
      method: "PATCH",
      credentials: 'include', // Include httpOnly cookie
    });

    if (res.ok) {
      alert(MESSAGES.resetSuccess);
      loadUsers();
      loadUsage();
    } else {
      const errData = await res.json();
      alert(MESSAGES.admin.resetError + errData.error);
    }
  } catch (err) {
    console.error(err);
    alert(MESSAGES.networkError);
  }
}

// Verify user is admin before loading data
async function verifyAdminAccess() {
  try {
    const res = await fetch(API_ENDPOINTS.AUTH.ME, {
      credentials: 'include', // Include httpOnly cookie
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        window.location.href = "/login";
        return false;
      }
      throw new Error(MESSAGES.admin.failedToVerifyUser);
    }

    const data = await res.json();

    if (data.user && data.user.role !== "admin") {
      alert(MESSAGES.admin.accessDenied);
      window.location.href = "/dashboard";
      return false;
    }

    // Update role in localStorage for client-side checks
    if (data.user && data.user.role) {
      localStorage.setItem("role", data.user.role);
    }

    return true;
  } catch (err) {
    console.error("Error verifying admin access:", err);
    alert(MESSAGES.admin.errorVerifyingAccess);
    window.location.href = "/login";
    return false;
  }
}

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

// Initialize page
(async () => {
  const isAdmin = await verifyAdminAccess();
  if (isAdmin) {
    loadUsage();
    loadUsers();
    loadEndpoints();
  }
})();
