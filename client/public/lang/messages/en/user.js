export const MESSAGES = {
  // Page Titles
  title: "User Registration",
  loginTitle: "Login",
  dashboardTitle: "User Dashboard",
  adminTitle: "Admin Dashboard",
  aiTestTitle: "AI Test",
  pageTitleAiTest: "Test TinyLlama Model",

  // Form Labels
  emailLabel: "Email Address",
  passwordLabel: "Password (min 3 characters)",
  confirmPasswordLabel: "Confirm Password",
  promptLabel: "Enter your prompt:",
  promptPlaceholder: "Type your message here...",

  // Buttons
  registerButton: "Register",
  loginButton: "Login",
  logoutButton: "Logout",
  generateResponse: "Generate Response",
  testAiModel: "Test AI Model",
  backToDashboard: "Back to Dashboard",
  resetButton: "Reset",

  // Empty/Default
  messageDiv: "",
  notAvailable: "N/A",
  loading: "Loading...",

  // Validation messages
  fillAllFields: "Please fill in all fields",
  passwordMinLength: "Password must be at least 3 characters",

  // Button states
  registering: "Registering...",
  loggingIn: "Logging in...",
  generating: "Generating...",

  // Success messages
  registrationSuccess: "Registration successful! Redirecting...",
  loginSuccess: "Login successful! Redirecting...",
  responseSuccess: "Response generated successfully!",
  resetSuccess: "API calls reset successfully!",

  // Error messages
  registrationFailed: "Registration failed",
  loginFailed: "Login failed",
  networkError: "Network error. Please check if server is running",
  errorLoadingData: "Error loading data",
  error: "Error",
  errorGenerating: "Error generating response.",
  responseFailed: "Failed to generate response: ",
  apiError: "API error: ",

  // Dashboard
  dashboard: {
    yourInformation: "Your Information",
    email: "Email",
    totalApiCalls: "Total API Calls",
  },

  // Admin
  admin: {
    accessDenied: "Access denied. Admin privileges required.",
    errorVerifyingAccess: "Error verifying access. Please try logging in again.",
    failedToLoadUsage: "Failed to load usage statistics: ",
    failedToVerifyUser: "Failed to verify user",
    systemStatistics: "System Statistics",
    totalUsers: "Total Users",
    totalApiCalls: "Total API Calls",
    allUsers: "All Users",
    apiEndpointStats: "API Endpoint Stats",
    noUsersFound: "No users found",
    errorLoadingUsers: "Error loading users: ",
    noEndpointStats: "No endpoint statistics available",
    errorLoadingEndpoints: "Error loading endpoint stats: ",
    resetConfirm: "Reset API calls for this user?",
    resetError: "Error: ",
    tableHeaders: {
      id: "ID",
      email: "Email",
      role: "Role",
      apiCalls: "API Calls",
      actions: "Actions",
      method: "Method",
      endpoint: "Endpoint",
      requests: "Requests",
    },
  },

  // AI Test
  aiTest: {
    pleaseEnterPrompt: "Please enter a prompt",
    response: "Response:",
    apiUsage: "API Usage",
    unableToLoadUsage: "Unable to load API usage",
    adminUnlimitedCalls: "Admin: Unlimited API calls (Used: {apiCalls})",
    apiCallsFormat: "API Calls: {apiCalls} / {limit} (Remaining: {remaining})",
    limitReachedWarning: "⚠️ You have reached your free API call limit of {limit}. Requests will still be processed, but please consider upgrading for continued service.",
    lowCallsWarning: "⚠️ Warning: You have {remaining} free API call{plural} remaining.",
    warningPrefix: "⚠️ ",
  },
};
