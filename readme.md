# Backend API Server - Folder Structure

## Project Overview
RESTful API server built with Express.js using Object-Oriented Programming (OOP) principles. Provides authentication, user management, and admin functionality with JWT-based security.

---
##  LLM Model

**Model:** [TinyLlama-1.1B-Chat-v1.0](https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0)

A lightweight 1.1B parameter language model from TinyLlama, optimized for chat applications.

##  Folder Structure

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


##  API Endpoints

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

### LLM API (`/api/generate`)
- `POST /generate` - Generate text using TinyLlama model

**Endpoint:** `https://charlieho.me/api/generate`

**Headers:**
- `Content-Type: application/json`
- `x-api-key: supersecret` (Testing: all users use this shared key)
- `Authorization: Bearer <JWT_TOKEN>` (Optional: for user identification and API call tracking)

**Request Body:**
```json
{
  "model": "tinyllama",
  "prompt": "Your prompt text here",
  "options": {
    "temperature": 0.5
  }
}
```

**Response:**
- Streaming response with JSON lines (Server-Sent Events format)
- Each line contains a JSON object with a `response` field
- Response format: `{"response": "generated text chunk"}\n`

**Example Usage:**
```javascript
const response = await fetch("https://charlieho.me/api/generate", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": " ",  
  },
  body: JSON.stringify({
    model: "tinyllama",
    prompt: "Hello, how are you?",
    options: { temperature: 0.5 }
  })
});

// Read streaming response
const reader = response.body.getReader();
const decoder = new TextDecoder();
// ... process stream
```

---

### Architecture Pattern

**MVC-like OOP Structure:**
- **Routes** = Route definitions
- **Controllers** = Request/Response handling
- **Services** = Business logic
- **Models** = Data access layer
- **Middleware** = Cross-cutting concerns (auth, validation)

