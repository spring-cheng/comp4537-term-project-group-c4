// Base URL for the API server
// TODO: Change to the production URL
export const API_BASE_URL = "http://localhost:4000";

// Full API endpoint base (includes /api prefix)
export const API_URL = `${API_BASE_URL}/api`;

// Individual API endpoints (for convenience)
export const API_ENDPOINTS = {
    // Authentication
    AUTH: {
        REGISTER: `${API_URL}/auth/register`,
        LOGIN: `${API_URL}/auth/login`,
        LOGOUT: `${API_URL}/auth/logout`,
        ME: `${API_URL}/auth/me`,
    },

    // Dashboard
    DASHBOARD: `${API_URL}/dashboard`,

    // Admin
    ADMIN: {
        USERS: `${API_URL}/admin/users`,
        USAGE: `${API_URL}/admin/usage`,
        USER_BY_ID: (id) => `${API_URL}/admin/user/${id}`,
        RESET_API_CALLS: (id) => `${API_URL}/admin/user/${id}/reset-api-calls`,
        ENDPOINT_STATS: `${API_URL}/admin/stats/endpoints`,
    },

    // AI
    AI: {
        GENERATE: `${API_URL}/generate`,
    },
};

