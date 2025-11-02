# Backend API Server - Folder Structure

## Project Overview
RESTful API server built with Express.js using Object-Oriented Programming (OOP) principles. Provides authentication, user management, and admin functionality with JWT-based security.

---

## 📁 Folder Structure

```
server/
│
├── app.js                          # Main application entry point - initializes Express server, middleware, routes, and error handling
│
├── db/                             # Database layer
│   └── Database.js                 # Database connection class (Singleton pattern) - manages MySQL connection pool
│
├── models/                         # Data models (database entities)
│   └── User.js                     # User model class - handles all database operations for users (CRUD, queries)
│
├── services/                       # Business logic layer
│   ├── Auth.js                     # Authentication service - handles user registration, login, and token generation
│   ├── Admin.js                    # Admin service - provides admin-specific operations (user management, statistics)
│   ├── User.js                     # User service - handles user-related business logic (landing page data)
│   └── JWT.js                      # JWT service - handles JSON Web Token generation and verification
│
├── controllers/                    # HTTP request handlers
│   ├── Auth.js                     # Auth controller - processes authentication HTTP requests (register, login, logout)
│   ├── Admin.js                    # Admin controller - processes admin-related HTTP requests
│   └── Landing.js                  # Landing controller - processes landing page HTTP requests
│
├── routes/                         # API route definitions
│   ├── Auth.js                     # Auth routes - defines authentication endpoints (/api/auth/*)
│   ├── Admin.js                    # Admin routes - defines admin endpoints (/api/admin/*)
│   ├── Landing.js                  # Landing routes - defines landing page endpoint (/api/landing)
│   └── ai.js                       # AI routes - placeholder for AI-related endpoints
│
├── middleware/                     # Express middleware
│   ├── auth.js                     # Authentication middleware - verifies JWT tokens and checks admin role
│   └── validation.js               # Validation middleware - validates and sanitizes request input using express-validator
│
├── lang/                           # Internationalization
│   └── en/
│       └── messages.js             # English language messages - centralized error/success messages
│
└── package.json                    # Node.js dependencies and scripts
```

---

## 🔄 Request Flow

1. **Request arrives** → `app.js` receives HTTP request
2. **Route matches** → `routes/*.js` matches URL pattern
3. **Middleware executes** → `middleware/*.js` validates/auth checks
4. **Controller handles** → `controllers/*.js` processes the request
5. **Service logic** → `services/*.js` executes business logic
6. **Model queries** → `models/*.js` interacts with database
7. **Response sent** → JSON response returned to client

---

## 🔐 Security Features

- ✅ **Password Hashing**: Bcrypt with 10 salt rounds
- ✅ **JWT Authentication**: Token-based stateless authentication
- ✅ **SQL Injection Prevention**: Parameterized queries
- ✅ **XSS Protection**: Input sanitization
- ✅ **Input Validation**: express-validator for request validation

---

## 📋 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /me` - Get current user info (requires auth)
- `POST /logout` - Logout user (requires auth)

### Landing Page (`/api/landing`)
- `GET /` - Get landing page data (returns different data for admin vs user)

### Admin (`/api/admin`)
- `GET /users` - Get all users with statistics (admin only)
- `GET /usage` - Get API usage statistics (admin only)
- `GET /user/:id` - Get specific user details (admin only)
- `PATCH /user/:id/reset-api-calls` - Reset user's API calls (admin only)

---

## 🏗️ Architecture Pattern

**MVC-like OOP Structure:**
- **Routes** = Route definitions
- **Controllers** = Request/Response handling
- **Services** = Business logic
- **Models** = Data access layer
- **Middleware** = Cross-cutting concerns (auth, validation)

