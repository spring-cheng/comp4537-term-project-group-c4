import express from "express";
import AuthController from "../controllers/Auth.js";
import { validateRegisterInput, validateLoginInput } from "../middleware/validation.js";
import authMiddleware from "../middleware/auth.js";

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication and account operations
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: test@example.com
 *               password:
 *                 type: string
 *                 minLength: 3
 *                 example: Password123!
 *     responses:
 *       201:
 *         description: User registered successfully. JWT token is set in httpOnly cookie (authToken).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered successfully.
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     api_calls:
 *                       type: integer
 *         headers:
 *           Set-Cookie:
 *             description: JWT token in httpOnly cookie
 *             schema:
 *               type: string
 *               example: authToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Path=/; Max-Age=7200
 *       400:
 *         description: Bad request — email already exists or validation failed
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user and set JWT token in httpOnly cookie
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: test@example.com
 *               password:
 *                 type: string
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: Login successful. JWT token is set in httpOnly cookie (authToken). Token is NOT returned in response body for security.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful.
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     api_calls:
 *                       type: integer
 *         headers:
 *           Set-Cookie:
 *             description: JWT token in httpOnly cookie (7 days expiration)
 *             schema:
 *               type: string
 *               example: authToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Path=/; Max-Age=604800
 *       400:
 *         description: Bad request — missing fields or invalid JSON
 *       401:
 *         description: Unauthorized — invalid email or password
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get the currently authenticated user
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current user info returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     api_calls:
 *                       type: integer
 *       401:
 *         description: Unauthorized — missing or invalid token in httpOnly cookie
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user and clear httpOnly cookie
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User logged out successfully. httpOnly cookie is cleared.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logout successful.
 *         headers:
 *           Set-Cookie:
 *             description: Clears the authToken cookie
 *             schema:
 *               type: string
 *               example: authToken=; HttpOnly; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT
 *       401:
 *         description: Unauthorized — missing or invalid token in httpOnly cookie
 *       500:
 *         description: Internal server error
 */

/**
 * Auth Routes Class
 * Handles all authentication-related routes
 */
class Auth {
  constructor() {
    this.router = express.Router();
    this.authController = new AuthController();
    this.initializeRoutes();
  }

  /**
   * Initialize all auth routes
   */
  initializeRoutes() {
    /**
     * POST /api/auth/register
     * Register a new user
     */
    this.router.post("/register", validateRegisterInput, (req, res) => {
      this.authController.register(req, res).catch((err) => {
        console.error("Unhandled error in register:", err);
        res.status(500).json({ error: "Internal server error" });
      });
    });

    /**
     * POST /api/auth/login
     * Login user
     */
    this.router.post("/login", validateLoginInput, (req, res) => {
      this.authController.login(req, res).catch((err) => {
        console.error("Unhandled error in login:", err);
        res.status(500).json({ error: "Internal server error" });
      });
    });

    /**
     * GET /api/auth/me
     * Get current user info (requires authentication)
     */
    this.router.get("/me", authMiddleware.authenticateToken(), (req, res) => {
      this.authController.getMe(req, res).catch((err) => {
        console.error("Unhandled error in getMe:", err);
        res.status(500).json({ error: "Internal server error" });
      });
    });

    /**
     * POST /api/auth/logout
     * Logout user (client should discard token)
     */
    this.router.post("/logout", authMiddleware.authenticateToken(), (req, res) => {
      this.authController.logout(req, res);
    });
  }

  /**
   * Get the router instance
   * @returns {express.Router} Express router
   */
  getRouter() {
    return this.router;
  }
}

export default Auth;

