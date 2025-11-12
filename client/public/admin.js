const API_URL = "http://localhost:4000";
const token = localStorage.getItem("jwt");

// redirect non-admins or unauthenticated users
if (!token) window.location.href = "/login";

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
    if (!res.ok) throw new Error(`Failed to fetch usage: ${res.status}`);
    const data = await res.json();

    totalUsersEl.textContent = data.total_users;
    totalCallsEl.textContent = data.total_api_calls;
  } catch (err) {
    console.error(err);
  }
}

// users list
async function loadUsers() {
  try {
    const res = await fetch(`${API_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
    const data = await res.json();

    const { users } = data;
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
    console.error(err);
    usersTable.innerHTML =
      '<tr><td colspan="6" class="error">Error loading users</td></tr>';
  }
}

// endpoint stats list
async function loadEndpoints() {
  try {
    const res = await fetch(`${API_URL}/api/admin/stats/endpoints`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Failed to fetch endpoints: ${res.status}`);
    const data = await res.json();

    const tableBody = document.querySelector("#endpoints-table tbody");

    if (!data.stats || data.stats.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="3">No data available</td></tr>';
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
    console.error(err);
    const tableBody = document.querySelector("#endpoints-table tbody");
    tableBody.innerHTML =
      '<tr><td colspan="3" class="error">Error loading endpoint stats</td></tr>';
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

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("jwt");
  window.location.href = "/login";
});

loadUsage();
loadUsers();
loadEndpoints();
