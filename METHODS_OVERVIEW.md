# Repository Methods Overview

This document provides a comprehensive overview of all methods used in the COMP4537 Term Project Group C4 repository.

---

## Table of Contents
1. [Database Layer](#database-layer)
2. [Models](#models)
3. [Services](#services)
4. [Controllers](#controllers)
5. [Middleware](#middleware)
6. [Utilities](#utilities)
7. [Client-Side Methods](#client-side-methods)

---

## Database Layer

### Database.js
**Location:** `server/db/Database.js`  
**Purpose:** Singleton pattern for managing MySQL database connection pool

#### Methods:
- **`query(sql, params = [])`**
  - Executes SQL query with parameters
  - Parameters: SQL string, optional array of query parameters
  - Returns: Promise with query result
  - Handles errors with logging

- **`getPool()`**
  - Returns the MySQL connection pool instance
  - Returns: Connection pool object

---

## Models

### User.js
**Location:** `server/models/User.js`  
**Purpose:** User model class handling all database operations related to users

#### Static Methods:
- **`initTable()`**
  - Initializes users table in database
  - Creates table with id, email, password_hash, role, and created_at columns
  - Returns: Promise

- **`findByEmail(email)`**
  - Finds user by email address
  - Parameters: email string
  - Returns: Promise<User|null>

- **`findById(id)`**
  - Finds user by ID
  - Parameters: user ID (number)
  - Returns: Promise<User|null>

- **`findByIdWithoutPassword(id)`**
  - Finds user by ID without password field, includes API usage
  - Parameters: user ID (number)
  - Returns: Promise<Object|null> with user data and api_calls

- **`emailExists(email)`**
  - Checks if email already exists in database
  - Parameters: email string
  - Returns: Promise<boolean>

- **`findAll()`**
  - Gets all users with API usage statistics
  - Returns: Promise<Array<Object>> with user data including api_calls

- **`deleteById(id)`**
  - Deletes user by ID
  - Parameters: user ID (number)
  - Returns: Promise<void>

#### Instance Methods:
- **`create(email, passwordHash, role = 'user')`**
  - Creates a new user in database
  - Parameters: email, hashed password, role (defaults to 'user')
  - Returns: Promise<User>
  - Also initializes API usage entry

- **`save()`**
  - Saves or updates user in database
  - Updates if ID exists, creates new user otherwise
  - Returns: Promise<User>

- **`incrementApiCalls()`**
  - Increments API call count for user (not for admin users)
  - Returns: Promise<void>

- **`resetApiCalls()`**
  - Resets API call count to 0
  - Returns: Promise<void>

- **`getApiCalls()`**
  - Gets current API call count
  - Returns: Promise<number>

- **`toJSON()`**
  - Converts user to JSON without sensitive data (no password)
  - Returns: Object with id, email, role, created_at

- **`toJSONWithUsage()`**
  - Converts user to JSON with API usage statistics
  - Returns: Promise<Object> with id, email, role, api_calls, created_at

- **`delete()`**
  - Deletes current user account
  - Returns: Promise<void>

### UserApiUsage.js
**Location:** `server/models/UserApiUsage.js`  
**Purpose:** Handles API usage statistics separate from user info

#### Static Methods:
- **`initTable()`**
  - Initializes user_api_usage table
  - Creates table with id, user_id, api_calls, and created_at
  - Returns: Promise

- **`getApiCalls(userId)`**
  - Gets API call count for a user
  - Creates entry with 0 calls if doesn't exist
  - Parameters: user ID (number)
  - Returns: Promise<number>

- **`incrementApiCalls(userId)`**
  - Increments API call count for a user
  - Uses ON DUPLICATE KEY UPDATE for atomic operation
  - Parameters: user ID (number)
  - Returns: Promise<void>

- **`resetApiCalls(userId)`**
  - Resets API call count to 0 for a user
  - Parameters: user ID (number)
  - Returns: Promise<void>

---

## Services

### Auth.js (Service)
**Location:** `server/services/Auth.js`  
**Purpose:** Authentication service handling registration, login, and user management

#### Methods:
- **`register(email, password)`**
  - Registers a new user
  - Checks email uniqueness, hashes password, creates user, generates JWT
  - Parameters: email, plain text password
  - Returns: Promise<Object> with token and user data
  - Throws error if email exists

- **`login(email, password)`**
  - Logs in a user
  - Validates credentials, generates JWT token
  - Parameters: email, plain text password
  - Returns: Promise<Object> with token and user data
  - Throws error if credentials invalid

- **`getCurrentUser(userId)`**
  - Gets current user information by ID
  - Parameters: user ID (number)
  - Returns: Promise<User>
  - Throws error if user not found

- **`deleteAccount(userId)`**
  - Deletes user account
  - Prevents deletion of admin accounts
  - Parameters: user ID (number)
  - Returns: Promise<void>
  - Throws error if user not found or is admin

### Admin.js (Service)
**Location:** `server/services/Admin.js`  
**Purpose:** Admin service handling user management and statistics

#### Static Methods:
- **`initEndpointStatsTable()`**
  - Initializes endpoint_stats table for API endpoint tracking
  - Returns: Promise

#### Instance Methods:
- **`getAllUsers()`**
  - Gets all users with overall statistics
  - Returns: Promise<Object> with users array and statistics (total_users, total_api_calls, active_users, average_api_calls_per_user)

- **`getUsageStats()`**
  - Gets API usage statistics across all users
  - Returns: Promise<Object> with total_api_calls, users_at_limit, users_with_usage, free_api_limit, total_users

- **`getUserById(userId)`**
  - Gets detailed user information by ID
  - Parameters: user ID (number)
  - Returns: Promise<Object> with user details, limit_reached, and remaining_calls
  - Throws error if user not found

- **`resetUserApiCalls(userId)`**
  - Resets API call count for a specific user
  - Parameters: user ID (number)
  - Returns: Promise<void>
  - Throws error if user not found

- **`getEndpointStats()`**
  - Gets endpoint usage statistics
  - Returns: Promise<Array> of endpoint stats (method, endpoint, count)
  - Returns empty array if table doesn't exist

### User.js (Service)
**Location:** `server/services/User.js`  
**Purpose:** User service handling landing page data

#### Methods:
- **`getLandingData(userId)`**
  - Gets landing page data for a user
  - Routes to admin or user landing data based on role
  - Parameters: user ID (number)
  - Returns: Promise<Object>
  - Throws error if user not found

- **`getAdminLandingData(user)`**
  - Gets admin dashboard data with all users and statistics
  - Parameters: User instance
  - Returns: Promise<Object> with role, user, and dashboard data

- **`getUserLandingData(user)`**
  - Gets regular user landing page data with API usage
  - Parameters: User instance
  - Returns: Object with role, user, and api_usage data

### Dashboard.js (Service)
**Location:** `server/services/Dashboard.js`  
**Purpose:** Dashboard service handling dashboard-specific business logic

#### Methods:
- **`getDashboardData(userId)`**
  - Gets dashboard data for a user
  - Includes user info and API usage (calls, limit, remaining, limit_reached)
  - Parameters: user ID (number)
  - Returns: Promise<Object>
  - Throws error if user not found

### JWT.js (Service)
**Location:** `server/services/JWT.js`  
**Purpose:** JWT service for token operations

#### Methods:
- **`generateToken(payload)`**
  - Generates JWT token with 7-day expiration
  - Parameters: payload object (user data)
  - Returns: string (JWT token)

- **`verifyToken(token)`**
  - Verifies and decodes JWT token
  - Parameters: JWT token string
  - Returns: Object (decoded payload)
  - Throws error if invalid or expired

- **`getSecret()`**
  - Returns JWT secret key
  - Returns: string

---

## Controllers

### Auth.js (Controller)
**Location:** `server/controllers/Auth.js`  
**Purpose:** HTTP request handlers for authentication

#### Methods:
- **`register(req, res)`**
  - Handles user registration HTTP request
  - Sets httpOnly cookie with JWT token
  - Returns: 201 status with user data or error

- **`login(req, res)`**
  - Handles user login HTTP request
  - Sets httpOnly cookie with JWT token
  - Returns: 200 status with user data or 401 error

- **`getMe(req, res)`**
  - Gets current authenticated user information
  - Requires authentication middleware
  - Returns: 200 status with user data or 404 error

- **`logout(req, res)`**
  - Handles user logout
  - Clears httpOnly authentication cookie
  - Returns: 200 status with success message

- **`deleteAccount(req, res)`**
  - Handles permanent user account deletion
  - Clears httpOnly cookie after deletion
  - Returns: 200 status or 404/500 error

### Admin.js (Controller)
**Location:** `server/controllers/Admin.js`  
**Purpose:** HTTP request handlers for admin operations

#### Methods:
- **`getUsers(req, res)`**
  - Gets all users with statistics
  - Admin only endpoint
  - Returns: 200 status with users and stats or 500 error

- **`getUsage(req, res)`**
  - Gets API usage statistics
  - Admin only endpoint
  - Returns: 200 status with usage stats or 500 error

- **`getUserById(req, res)`**
  - Gets specific user details by ID
  - Admin only endpoint
  - Validates user ID parameter
  - Returns: 200 status with user data or 400/404/500 error

- **`resetApiCalls(req, res)`**
  - Resets API call count for a specific user
  - Admin only endpoint
  - Validates user ID parameter
  - Returns: 200 status with success message or 400/404 error

- **`getEndpointStats(req, res)`**
  - Gets endpoint usage statistics
  - Admin only endpoint
  - Returns: 200 status with endpoint stats or 500 error

### Landing.js (Controller)
**Location:** `server/controllers/Landing.js`  
**Purpose:** HTTP request handlers for landing page

#### Methods:
- **`getLanding(req, res)`**
  - Gets landing page data for authenticated user
  - Returns different data for admin vs regular user
  - Returns: 200 status with landing data or 404/500 error

### Dashboard.js (Controller)
**Location:** `server/controllers/Dashboard.js`  
**Purpose:** HTTP request handlers for dashboard

#### Methods:
- **`getDashboard(req, res)`**
  - Gets dashboard data for authenticated user
  - Returns: 200 status with dashboard data or 404/500 error

---

## Middleware

### auth.js (Middleware)
**Location:** `server/middleware/auth.js`  
**Purpose:** Authentication middleware for JWT verification

#### Methods:
- **`authenticateToken()`**
  - Middleware to verify JWT token from httpOnly cookie
  - Attaches user data to request object
  - Returns: Express middleware function
  - Sends 401 if token missing, 403 if invalid

- **`requireAdmin()`**
  - Middleware to require admin role
  - Checks if authenticated user has admin role
  - Returns: Express middleware function
  - Sends 403 if not admin

- **`validateApiKey()`**
  - Middleware to validate API key header
  - Optionally verifies JWT for user identification
  - Uses 'supersecret' as test API key
  - Returns: Express middleware function
  - Sends 401 if key missing, 403 if invalid

### validation.js (Middleware)
**Location:** `server/middleware/validation.js`  
**Purpose:** Input validation and sanitization

#### Functions:
- **`handleValidationErrors(req, res, next)`**
  - Middleware to handle validation errors
  - Maps validation errors to user messages
  - Returns: 400 status with error details or calls next()

#### Validation Rule Arrays:
- **`validateRegisterInput`**
  - Array of validation rules for registration
  - Validates and sanitizes email (required, valid format, normalized)
  - Validates password (required, min 3 characters)
  - Includes error handler

- **`validateLoginInput`**
  - Array of validation rules for login
  - Validates and sanitizes email (required, valid format, normalized)
  - Validates password (required)
  - Includes error handler

- **`validateChatPrompt`**
  - Array of validation rules for AI chat prompts
  - Validates prompt (required, 1-5000 characters, sanitized)
  - Includes error handler

---

## Utilities

### defaultAdmin.js
**Location:** `server/utils/defaultAdmin.js`  
**Purpose:** Creates default admin user

#### Methods:
- **`create()`**
  - Creates default admin user if doesn't exist
  - Email: admin@admin.com, Password: 111, Role: admin
  - Returns: Promise<void>

- **`hashPassword(password)`**
  - Hashes password using bcrypt
  - Parameters: plain text password
  - Returns: Promise<string> (hashed password)

- **`logAdminCreated()`**
  - Logs admin creation success message to console
  - Returns: void

---

## Client-Side Methods

### script.js
**Location:** `client/public/script.js`  
**Purpose:** Authentication page functionality (login/registration)

#### Functions:
- **`loadMessages()`**
  - Async function to load internationalization messages
  - Returns: Promise<void>

- **`showMessage(elementId, message, isError = false)`**
  - Displays temporary message to user
  - Parameters: element ID, message text, error flag
  - Auto-hides after 5 seconds

- **`handleRegistration(event)`**
  - Async event handler for registration form
  - Validates input, sends POST request, redirects on success
  - Parameters: form submit event

- **`handleLogin(event)`**
  - Async event handler for login form
  - Validates input, sends POST request, stores role, redirects
  - Parameters: form submit event

### dashboard.js
**Location:** `client/public/dashboard.js`  
**Purpose:** User dashboard functionality

#### Functions:
- **`loadUserData()`**
  - Async function to load and display user data
  - Fetches dashboard data, updates UI
  - Redirects to login if not authenticated
  - Shows delete button for non-admin users

#### Event Handlers:
- **Logout button click handler**
  - Calls logout endpoint, clears localStorage, redirects to login

- **Delete account button click handler**
  - Shows confirmation dialog
  - Calls delete account endpoint, redirects to home

### admin.js
**Location:** `client/public/admin.js`  
**Purpose:** Admin dashboard functionality

#### Functions:
- **`loadUsage()`**
  - Async function to load and display API usage statistics
  - Updates total users and total API calls

- **`loadUsers()`**
  - Async function to load and display all users in table
  - Shows user ID, email, role, API calls, and reset button

- **`loadEndpoints()`**
  - Async function to load and display endpoint statistics
  - Shows method, endpoint, and request count

- **`resetCalls(userId)`**
  - Async function to reset API calls for a user
  - Parameters: user ID
  - Shows confirmation dialog, reloads data on success

- **`verifyAdminAccess()`**
  - Async function to verify user has admin access
  - Redirects non-admin users to dashboard
  - Returns: Promise<boolean>

#### Event Handlers:
- **Logout button click handler**
  - Calls logout endpoint, clears localStorage, redirects to login

### ai-test.js
**Location:** `client/public/ai-test.js`  
**Purpose:** AI model testing interface

#### Functions:
- **`loadApiUsage()`**
  - Async function to load and display API usage
  - Shows different messages for admin vs regular users
  - Displays warnings for low calls or limit reached
  - Updates warning container based on usage status

- **`showMessage(text, isError = false)`**
  - Displays temporary message
  - Parameters: message text, error flag
  - Auto-hides after 5 seconds

#### Event Handlers:
- **Generate button click handler**
  - Validates prompt input
  - Sends POST request to AI generation endpoint
  - Reads streaming response
  - Updates API usage after completion
  - Handles warnings and errors

- **Back button click handler**
  - Redirects to dashboard

---

## Summary Statistics

### Server-Side
- **Total Classes:** 10
- **Total Methods:** 60+
- **Architecture:** MVC-like OOP pattern with separate services layer

### Client-Side  
- **Total Functions:** 15+
- **Total Event Handlers:** 6+

### Method Categories
- **Database Operations:** 18 methods
- **Authentication & Authorization:** 8 methods
- **User Management:** 12 methods
- **Admin Operations:** 7 methods
- **Validation & Middleware:** 6 methods
- **Client UI Methods:** 15+ methods

---

## Key Patterns Used

1. **Singleton Pattern:** Database connection (Database.js)
2. **OOP Class-based:** All models, services, and controllers
3. **Middleware Pattern:** Express middleware for auth and validation
4. **Service Layer Pattern:** Separation of business logic from controllers
5. **Repository Pattern:** Models handle data access
6. **JWT Authentication:** Stateless authentication with httpOnly cookies
7. **Async/Await:** Consistent use of promises and async operations
8. **Error Handling:** Try-catch blocks with appropriate error messages

---

*Last updated: December 2024*
