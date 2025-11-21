const API_URL = "http://localhost:4000";
const token = localStorage.getItem("jwt");
const role = localStorage.getItem("role");

// redirect non-admins or unauthenticated users
if (!token) {
  window.location.href = "/login";
} else if (role !== "admin") {
  alert("Access denied. Admin privileges required.");
  window.location.href = "/dashboard";
}

// DOM ref's
const usersTable = document.querySelector("#users-table tbody");
const totalUsersEl = document.getElementById("total-users");
const totalCallsEl = document.getElementById("total-calls");

// usage statistics
async function loadUsage() {
  try {
    const res = await fetch(`${API_URL}/api/admin/usage`, {
      headers: { Authorization: `Bearer ${token}` },
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
    totalUsersEl.textContent = "Error";
    totalCallsEl.textContent = "Error";
    alert("Failed to load usage statistics: " + err.message);
  }
}

// users list
async function loadUsers() {
  try {
    const res = await fetch(`${API_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch users: ${res.status}`);
    }
    const data = await res.json();

    const { users } = data;
    if (!users || users.length === 0) {
      usersTable.innerHTML = '<tr><td colspan="5">No users found</td></tr>';
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
            <button class="reset-btn" onclick="resetCalls(${u.id})">Reset</button>
          </td>
        </tr>`
      )
      .join("");
  } catch (err) {
    console.error("Error loading users:", err);
    usersTable.innerHTML =
      '<tr><td colspan="5" class="error">Error loading users: ' + err.message + '</td></tr>';
  }
}

// endpoint stats list
async function loadEndpoints() {
  try {
    const res = await fetch(`${API_URL}/api/admin/stats/endpoints`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch endpoints: ${res.status}`);
    }
    const data = await res.json();

    const tableBody = document.querySelector("#endpoints-table tbody");

    if (!data.stats || data.stats.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="3">No endpoint statistics available</td></tr>';
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
      '<tr><td colspan="3" class="error">Error loading endpoint stats: ' + err.message + '</td></tr>';
  }
}

// reset a user's API call count
async function resetCalls(userId) {
  if (!confirm("Reset API calls for this user?")) return;

  try {
    const res = await fetch(`${API_URL}/api/admin/user/${userId}/reset-api-calls`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      alert("API calls reset successfully!");
      loadUsers();
      loadUsage();
    } else {
      const errData = await res.json();
      alert("Error: " + errData.error);
    }
  } catch (err) {
    console.error(err);
    alert("Network error");
  }
}

// Verify user is admin before loading data
async function verifyAdminAccess() {
  try {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      throw new Error("Failed to verify user");
    }
    const data = await res.json();

    if (data.user && data.user.role !== "admin") {
      alert("Access denied. Admin privileges required.");
      window.location.href = "/dashboard";
      return false;
    }

    // Update role in localStorage if needed
    if (data.user && data.user.role) {
      localStorage.setItem("role", data.user.role);
    }

    return true;
  } catch (err) {
    console.error("Error verifying admin access:", err);
    alert("Error verifying access. Please try logging in again.");
    window.location.href = "/login";
    return false;
  }
}

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("jwt");
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
