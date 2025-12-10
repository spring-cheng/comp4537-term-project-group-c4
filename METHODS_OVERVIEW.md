# Methods Overview - Complete API Reference

This document provides a comprehensive overview of all methods used in the COMP4537 Term Project Group C4 application, organized by class/module.

---

## Table of Contents

1. [Database Layer](#database-layer)
2. [Models](#models)
3. [Services](#services)
4. [Controllers](#controllers)
5. [Middleware](#middleware)
6. [Routes](#routes)
7. [Utilities](#utilities)
8. [Client-Side Methods](#client-side-methods)

---

## Database Layer

### Database Class (`server/db/Database.js`)

Singleton pattern for managing MySQL database connection pool.

#### Methods:

- **`constructor()`**
  - Initializes database connection pool using environment variables
  - Implements singleton pattern
  - Returns existing instance if already created

- **`async query(sql, params = [])`**
  - Execute a SQL query with optional parameters
  - **Parameters:**
    - `sql` (string): SQL query string
    - `params` (Array): Query parameters for prepared statements
  - **Returns:** Promise with query results
  - **Throws:** Database query errors

- **`getPool()`**
  - Get the MySQL connection pool instance
  - **Returns:** Connection pool object

---

## Models

### User Model (`server/models/User.js`)

Handles all database operations related to users.

#### Static Methods:

- **`static async initTable()`**
  - Initialize users table in database
  - Creates table with columns: id, email, password_hash, role, created_at
  - **Returns:** Promise<void>
  - **Throws:** Database errors

- **`static async findByEmail(email)`**
  - Find user by email address
  - **Parameters:**
    - `email` (string): User email
  - **Returns:** Promise<User|null> - User instance or null if not found

- **`static async findById(id)`**
  - Find user by ID
  - **Parameters:**
    - `id` (number): User ID
  - **Returns:** Promise<User|null> - User instance or null if not found

- **`static async findByIdWithoutPassword(id)`**
  - Find user by ID with API usage data (excludes password)
  - **Parameters:**
    - `id` (number): User ID
  - **Returns:** Promise<Object|null> - User data with api_calls or null

- **`static async emailExists(email)`**
  - Check if email already exists in database
  - **Parameters:**
    - `email` (string): User email
  - **Returns:** Promise<boolean> - True if email exists

- **`static async findAll()`**
  - Get all users with their API usage statistics
  - **Returns:** Promise<Array<Object>> - Array of user data with api_calls

- **`static async deleteById(id)`**
  - Delete user by ID
  - **Parameters:**
    - `id` (number): User ID
  - **Returns:** Promise<void>

#### Instance Methods:

- **`constructor(data = {})`**
  - Initialize User instance with data
  - **Parameters:**
    - `data` (Object): User data object

- **`async create(email, passwordHash, role = "user")`**
  - Create a new user in database (instance method that saves the current user object)
  - **Parameters:**
    - `email` (string): User email
    - `passwordHash` (string): Hashed password
    - `role` (string): User role (default: "user")
  - **Returns:** Promise<User> - Created user instance with populated ID
  - **Note:** This method sets the instance properties and inserts into database

- **`async save()`**
  - Save user to database (update if exists, insert if new)
  - **Returns:** Promise<User> - Updated user instance

- **`async incrementApiCalls()`**
  - Increment API calls count for user (skips admin users)
  - **Returns:** Promise<void>

- **`async resetApiCalls()`**
  - Reset API calls count to 0
  - **Returns:** Promise<void>

- **`async getApiCalls()`**
  - Get current API calls count
  - **Returns:** Promise<number> - API calls count

- **`toJSON()`**
  - Convert user to JSON (excludes sensitive data like password)
  - **Returns:** Object - User data without password

- **`async toJSONWithUsage()`**
  - Convert user to JSON with API usage data
  - **Returns:** Promise<Object> - User data with api_calls

- **`async delete()`**
  - Delete user account
  - **Returns:** Promise<void>
  - **Throws:** Error if user has no ID

### UserApiUsage Model (`server/models/UserApiUsage.js`)

Handles API usage statistics separate from user info.

#### Static Methods:

- **`static async initTable()`**
  - Initialize user_api_usage table
  - Creates table with foreign key to users table
  - **Returns:** Promise<void>

- **`static async getApiCalls(userId)`**
  - Get API usage count for a user (creates entry if doesn't exist)
  - **Parameters:**
    - `userId` (number): User ID
  - **Returns:** Promise<number> - API call count

- **`static async incrementApiCalls(userId)`**
  - Increment API calls for a user by 1
  - **Parameters:**
    - `userId` (number): User ID
  - **Returns:** Promise<void>

- **`static async resetApiCalls(userId)`**
  - Reset API calls count to 0 for a user
  - **Parameters:**
    - `userId` (number): User ID
  - **Returns:** Promise<void>

#### Instance Methods:

- **`constructor(data = {})`**
  - Initialize UserApiUsage instance
  - **Parameters:**
    - `data` (Object): Usage data object

---

## Services

### Auth Service (`server/services/Auth.js`)

Handles authentication business logic.

#### Methods:

- **`constructor()`**
  - Initialize Auth service with JWT service instance

- **`async register(email, password)`**
  - Register a new user
  - **Parameters:**
    - `email` (string): User email
    - `password` (string): User password (plain text)
  - **Returns:** Promise<Object> - Object with token and user data
  - **Throws:** Error if email already exists

- **`async login(email, password)`**
  - Login user
  - **Parameters:**
    - `email` (string): User email
    - `password` (string): User password
  - **Returns:** Promise<Object> - Object with token and user data
  - **Throws:** Error if credentials are invalid

- **`async getCurrentUser(userId)`**
  - Get current user information by ID
  - **Parameters:**
    - `userId` (number): User ID
  - **Returns:** Promise<User> - User instance
  - **Throws:** Error if user not found

- **`async deleteAccount(userId)`**
  - Delete user account (prevents admin deletion)
  - **Parameters:**
    - `userId` (number): User ID
  - **Returns:** Promise<void>
  - **Throws:** Error if user not found or is admin

### JWT Service (`server/services/JWT.js`)

Handles JWT token operations.

#### Methods:

- **`constructor()`**
  - Initialize JWT service with secret and expiration settings

- **`generateToken(payload)`**
  - Generate JWT token from payload
  - **Parameters:**
    - `payload` (Object): Token payload (user data)
  - **Returns:** string - JWT token
  - Token expires in 7 days

- **`verifyToken(token)`**
  - Verify and decode JWT token
  - **Parameters:**
    - `token` (string): JWT token
  - **Returns:** Object - Decoded token payload
  - **Throws:** Error if token is invalid or expired

- **`getSecret()`**
  - Get JWT secret key
  - **Returns:** string - JWT secret

### Dashboard Service (`server/services/Dashboard.js`)

Handles dashboard-related business logic.

#### Methods:

- **`async getDashboardData(userId)`**
  - Get dashboard data for a user
  - **Parameters:**
    - `userId` (number): User ID
  - **Returns:** Promise<Object> - Dashboard data with user info and API usage
  - **Throws:** Error if user not found

### User Service (`server/services/User.js`)

Handles user-related business logic.

#### Methods:

- **`async getLandingData(userId)`**
  - Get landing page data (different for admin vs regular user)
  - **Parameters:**
    - `userId` (number): User ID
  - **Returns:** Promise<Object> - Landing page data
  - **Throws:** Error if user not found

- **`async getAdminLandingData(user)`**
  - Get admin landing page data with system statistics
  - **Parameters:**
    - `user` (User): Admin user instance
  - **Returns:** Promise<Object> - Admin dashboard data with statistics

- **`getUserLandingData(user)`**
  - Get regular user landing page data
  - **Parameters:**
    - `user` (User): User instance
  - **Returns:** Object - User landing page data with API usage

### Admin Service (`server/services/Admin.js`)

Handles admin-related business logic.

#### Static Methods:

- **`static async initEndpointStatsTable()`**
  - Initialize endpoint_stats table for tracking API usage
  - **Returns:** Promise<void>

#### Instance Methods:

- **`async getAllUsers()`**
  - Get all users with statistics
  - **Returns:** Promise<Object> - Users array and statistics object

- **`async getUsageStats()`**
  - Get API usage statistics summary
  - **Returns:** Promise<Object> - Usage statistics

- **`async getUserById(userId)`**
  - Get user details by ID
  - **Parameters:**
    - `userId` (number): User ID
  - **Returns:** Promise<Object> - User details with API limits
  - **Throws:** Error if user not found

- **`async resetUserApiCalls(userId)`**
  - Reset user's API calls to 0
  - **Parameters:**
    - `userId` (number): User ID
  - **Returns:** Promise<void>
  - **Throws:** Error if user not found

- **`async getEndpointStats()`**
  - Get endpoint usage statistics
  - **Returns:** Promise<Array> - Array of endpoint stats with method, endpoint, count

---

## Controllers

### Auth Controller (`server/controllers/Auth.js`)

Handles HTTP requests for authentication.

#### Methods:

- **`constructor()`**
  - Initialize Auth controller with AuthService instance

- **`async register(req, res)`**
  - Register a new user (POST /api/auth/register)
  - **Parameters:**
    - `req` (Object): Express request object
    - `res` (Object): Express response object
  - Sets httpOnly cookie with JWT token
  - **Returns:** JSON response with user data

- **`async login(req, res)`**
  - Login user (POST /api/auth/login)
  - **Parameters:**
    - `req` (Object): Express request object
    - `res` (Object): Express response object
  - Sets httpOnly cookie with JWT token
  - **Returns:** JSON response with user data

- **`async getMe(req, res)`**
  - Get current user info (GET /api/auth/me)
  - **Parameters:**
    - `req` (Object): Express request object (requires auth)
    - `res` (Object): Express response object
  - **Returns:** JSON response with user data

- **`logout(req, res)`**
  - Logout user (POST /api/auth/logout)
  - **Parameters:**
    - `req` (Object): Express request object
    - `res` (Object): Express response object
  - Clears httpOnly cookie
  - **Returns:** JSON response with success message

- **`async deleteAccount(req, res)`**
  - Delete user account (DELETE /api/auth/account)
  - **Parameters:**
    - `req` (Object): Express request object (requires auth)
    - `res` (Object): Express response object
  - Clears httpOnly cookie after deletion
  - **Returns:** JSON response with success message

### Admin Controller (`server/controllers/Admin.js`)

Handles HTTP requests for admin operations.

#### Methods:

- **`constructor()`**
  - Initialize Admin controller with AdminService instance

- **`async getUsers(req, res)`**
  - Get all users (GET /api/admin/users)
  - **Parameters:**
    - `req` (Object): Express request object (requires admin auth)
    - `res` (Object): Express response object
  - **Returns:** JSON response with users and statistics

- **`async getUsage(req, res)`**
  - Get usage statistics (GET /api/admin/usage)
  - **Parameters:**
    - `req` (Object): Express request object (requires admin auth)
    - `res` (Object): Express response object
  - **Returns:** JSON response with usage stats

- **`async getUserById(req, res)`**
  - Get user by ID (GET /api/admin/user/:id)
  - **Parameters:**
    - `req` (Object): Express request object with id param (requires admin auth)
    - `res` (Object): Express response object
  - **Returns:** JSON response with user details

- **`async resetApiCalls(req, res)`**
  - Reset user API calls (PATCH /api/admin/user/:id/reset-api-calls)
  - **Parameters:**
    - `req` (Object): Express request object with id param (requires admin auth)
    - `res` (Object): Express response object
  - **Returns:** JSON response with success message

- **`async getEndpointStats(req, res)`**
  - Get endpoint statistics (GET /api/admin/stats/endpoints)
  - **Parameters:**
    - `req` (Object): Express request object (requires admin auth)
    - `res` (Object): Express response object
  - **Returns:** JSON response with endpoint stats

### Landing Controller (`server/controllers/Landing.js`)

Handles HTTP requests for landing pages.

#### Methods:

- **`constructor()`**
  - Initialize Landing controller with UserService instance

- **`async getLanding(req, res)`**
  - Get landing page data (GET /api/landing)
  - **Parameters:**
    - `req` (Object): Express request object (requires auth)
    - `res` (Object): Express response object
  - **Returns:** JSON response with landing page data (admin or user specific)

### Dashboard Controller (`server/controllers/Dashboard.js`)

Handles HTTP requests for dashboard.

#### Methods:

- **`constructor()`**
  - Initialize Dashboard controller with DashboardService instance

- **`async getDashboard(req, res)`**
  - Get dashboard data (GET /api/dashboard)
  - **Parameters:**
    - `req` (Object): Express request object (requires auth)
    - `res` (Object): Express response object
  - **Returns:** JSON response with dashboard data

---

## Middleware

### Auth Middleware (`server/middleware/auth.js`)

Handles authentication middleware.

#### Methods:

- **`constructor()`**
  - Initialize Auth middleware with JWT service instance

- **`authenticateToken()`**
  - Verify JWT token from httpOnly cookie
  - **Returns:** Function - Express middleware function
  - Attaches user data to req.user if valid
  - Returns 401 if token missing, 403 if invalid

- **`requireAdmin()`**
  - Require admin role
  - **Returns:** Function - Express middleware function
  - Returns 403 if user is not admin

- **`validateApiKey()`**
  - Validate API key and optionally JWT token
  - **Returns:** Function - Express middleware function
  - Checks x-api-key header
  - Optionally verifies JWT for user identification
  - Returns 401 if API key missing, 403 if invalid

### Validation Middleware (`server/middleware/validation.js`)

#### Functions:

- **`handleValidationErrors(req, res, next)`**
  - Handle validation errors from express-validator
  - **Parameters:**
    - `req` (Object): Express request object
    - `res` (Object): Express response object
    - `next` (Function): Next middleware function
  - Returns 400 with error details if validation fails

#### Validation Arrays:

- **`validateRegisterInput`**
  - Array of validation rules for registration
  - Validates email format and password length (min 3 chars)

- **`validateLoginInput`**
  - Array of validation rules for login
  - Validates email format and password presence

- **`validateChatPrompt`**
  - Array of validation rules for AI chat prompts
  - Validates prompt length (1-5000 chars) and sanitizes HTML

---

## Routes

### Auth Routes (`server/routes/auth.js`)

Handles all authentication-related routes.

#### Methods:

- **`constructor()`**
  - Initialize Auth routes with Express router and AuthController

- **`initializeRoutes()`**
  - Initialize all auth routes:
    - POST /api/auth/register
    - POST /api/auth/login
    - GET /api/auth/me (requires auth)
    - POST /api/auth/logout (requires auth)
    - DELETE /api/auth/account (requires auth)

- **`getRouter()`**
  - Get the Express router instance
  - **Returns:** express.Router

### Admin Routes (`server/routes/admin.js`)

Handles all admin-related routes.

#### Methods:

- **`constructor()`**
  - Initialize Admin routes with Express router and AdminController

- **`initializeRoutes()`**
  - Initialize all admin routes (all require auth + admin role):
    - GET /api/admin/users
    - GET /api/admin/usage
    - GET /api/admin/user/:id
    - PATCH /api/admin/user/:id/reset-api-calls
    - GET /api/admin/stats/endpoints

- **`getRouter()`**
  - Get the Express router instance
  - **Returns:** express.Router

---

## Utilities

### DefaultAdmin (`server/utils/defaultAdmin.js`)

Handles creation of default admin user.

#### Methods:

- **`constructor()`**
  - Initialize with default admin credentials (configurable in the class)

- **`async create()`**
  - Create default admin user if doesn't exist
  - **Returns:** Promise<void>

- **`async hashPassword(password)`**
  - Hash password using bcrypt
  - **Parameters:**
    - `password` (string): Plain text password
  - **Returns:** Promise<string> - Hashed password

- **`logAdminCreated()`**
  - Log admin creation success message to console

---

## Client-Side Methods

### Registration & Login Script (`client/public/script.js`)

#### Functions:

- **`async loadMessages()`**
  - Load internationalization messages
  - **Returns:** Promise<void>

- **`showMessage(elementId, message, isError = false)`**
  - Display message to user
  - **Parameters:**
    - `elementId` (string): DOM element ID
    - `message` (string): Message text
    - `isError` (boolean): Whether message is an error

- **`async handleRegistration(event)`**
  - Handle registration form submission
  - **Parameters:**
    - `event` (Event): Form submit event
  - Validates input and sends POST to /api/auth/register

- **`async handleLogin(event)`**
  - Handle login form submission
  - **Parameters:**
    - `event` (Event): Form submit event
  - Validates input and sends POST to /api/auth/login

### Dashboard Script (`client/public/dashboard.js`)

#### Functions:

- **`async loadUserData()`**
  - Load user data from API and update UI
  - Fetches from /api/dashboard
  - Redirects to login if not authenticated

### Admin Script (`client/public/admin.js`)

#### Functions:

- **`async loadUsage()`**
  - Load API usage statistics
  - Fetches from /api/admin/usage

- **`async loadUsers()`**
  - Load users list and display in table
  - Fetches from /api/admin/users

- **`async loadEndpoints()`**
  - Load endpoint statistics
  - Fetches from /api/admin/stats/endpoints

- **`async resetCalls(userId)`**
  - Reset user's API call count
  - **Parameters:**
    - `userId` (number): User ID
  - Sends PATCH to /api/admin/user/:id/reset-api-calls

- **`async verifyAdminAccess()`**
  - Verify user has admin access
  - **Returns:** Promise<boolean>
  - Redirects non-admin users to dashboard

### AI Test Script (`client/public/ai-test.js`)

#### Functions:

- **`async loadApiUsage()`**
  - Load and display API usage information
  - Updates warning messages based on remaining calls

- **`showMessage(text, isError = false)`**
  - Display message to user
  - **Parameters:**
    - `text` (string): Message text
    - `isError` (boolean): Whether message is an error

- **`generateBtn.addEventListener("click", async () => {...})`**
  - Generate AI response from user prompt
  - Sends POST to /api/generate
  - Handles streaming response

---

## Application Class (`server/app.js`)

Main Express application entry point.

#### Methods:

- **`constructor()`**
  - Initialize Express app, middleware, database, routes, and error handling

- **`initializeMiddleware()`**
  - Initialize Express middleware:
    - Trust proxy
    - CORS configuration
    - JSON/URL-encoded body parsing
    - Cookie parsing
    - Endpoint statistics tracking

- **`async initializeDatabase()`**
  - Initialize database tables and default admin user

- **`initializeRoutes()`**
  - Initialize all API route classes and register them

- **`initializeErrorHandling()`**
  - Initialize 404 handler and global error handler

- **`start()`**
  - Start the Express server on configured port

---

## Summary

This application uses an **Object-Oriented MVC architecture** with the following layers:

1. **Database Layer** - Singleton database connection
2. **Models** - Data access layer (User, UserApiUsage)
3. **Services** - Business logic layer (Auth, JWT, Dashboard, User, Admin)
4. **Controllers** - HTTP request handlers (Auth, Admin, Landing, Dashboard)
5. **Routes** - API endpoint definitions
6. **Middleware** - Authentication, validation, error handling
7. **Client** - Frontend JavaScript for UI interactions

**Total Methods Count:**
- **Backend (Server):** 70+ methods across all classes
  - Database Layer: 3 methods
  - Models: 22 methods
  - Services: 17 methods
  - Controllers: 13 methods
  - Middleware: 6 methods/functions
  - Routes: 6 methods
  - Utilities: 3 methods
- **Frontend (Client):** 15+ JavaScript functions
- **Combined:** 85+ methods/functions

**Key Design Patterns:**
- Singleton (Database)
- MVC (Routes → Controllers → Services → Models)
- Middleware Chain (Express)
- JWT-based Authentication
- OOP Class-based Architecture
