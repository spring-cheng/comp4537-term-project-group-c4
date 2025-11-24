export const userMessages = {
  // Generic
  SERVER_RUNNING: "Server running successfully!",
  BAD_REQUEST: "Bad request.",
  INVALID_INPUT: "Invalid input.",
  NOT_FOUND: "Not found.",
  METHOD_NOT_ALLOWED: "Method not allowed.",
  SERVER_ERROR: "Internal server error.",

  // Security / Validation
  FORBIDDEN_SQL: "Forbidden SQL command detected.",

  // Database
  DB_CONNECTED: "Database connected successfully.",
  USERS_TABLE_READY: "'users' table is ready.",
  USER_CREATE_ERROR: "Error creating 'users' table.",
  USER_INSERT_ERROR: "Error inserting user data.",

  // Auth / Access
  UNAUTHORIZED: "Unauthorized access.",
  LOGIN_FAILED: "Invalid email or password.",
  LOGIN_SUCCESS: "Login successful.",
  REGISTER_SUCCESS: "User registered successfully.",
  REGISTER_FAILED: "User registration failed.",
  EMAIL_EXISTS: "Email already registered.",
  INVALID_EMAIL: "Invalid email format.",
  INVALID_PASSWORD: "Password must be at least 3 characters.",
  INVALID_FIRST_NAME: "First name is required.",
  LOGOUT_SUCCESS: "Logout successful.",
  DELETE_ACCOUNT_SUCCESS: "Account deleted successfully.",
  DELETE_ACCOUNT_FAILED: "Failed to delete account.",
  CANNOT_DELETE_ADMIN: "Admin accounts cannot be deleted.",
  TOKEN_MISSING: "Authentication token is missing.",
  TOKEN_INVALID: "Invalid or expired token.",

  // API usage
  API_LIMIT_REACHED: "Free API usage limit reached.",
  FREE_API_LIMIT: 20,
  API_KEY_MISSING: "API key is missing.",
  API_KEY_INVALID: "Invalid API key.",

  // Admin
  FORBIDDEN: "Forbidden. Admin access required.",
};
