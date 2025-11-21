import AuthService from "../services/Auth.js";
import { userMessages } from "../lang/en/messages.js";

/**
 * Auth Controller Class
 * Handles HTTP requests for authentication
 */
class Auth {
  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Register a new user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async register(req, res) {
    try {
      const { email, password } = req.body;

      const result = await this.authService.register(email, password);

      // Set httpOnly cookie with JWT token
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'lax', // CSRF protection
        maxAge: 2 * 60 * 60 * 1000, // 2 hours
        path: '/', // Available for all paths
      };

      res.cookie('authToken', result.token, cookieOptions);

      res.status(201).json({
        message: userMessages.REGISTER_SUCCESS,
        user: result.user,
      });
    } catch (error) {
      console.error("Registration error:", error);
      const statusCode = error.message === userMessages.EMAIL_EXISTS ? 400 : 500;
      res.status(statusCode).json({
        error: error.message || userMessages.REGISTER_FAILED,
        details: error.message,
      });
    }
  }

  /**
   * Login user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      const result = await this.authService.login(email, password);

      // Set httpOnly cookie with JWT token
      const cookieOptions = {
        httpOnly: true, // Prevents JavaScript access (XSS protection)
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'lax', // CSRF protection
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        path: '/', // Available for all paths
      };

      res.cookie('authToken', result.token, cookieOptions);

      res.json({
        message: userMessages.LOGIN_SUCCESS,
        user: result.user,
        // Don't send token in response body for security (it's in httpOnly cookie)
      });
    } catch (error) {
      console.error("Login error:", error);
      const statusCode = error.message === userMessages.LOGIN_FAILED ? 401 : 500;
      res.status(statusCode).json({
        error: error.message || userMessages.LOGIN_FAILED,
        details: error.message,
      });
    }
  }

  /**
   * Get current user info
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getMe(req, res) {
    try {
      const user = await this.authService.getCurrentUser(req.user.id);

      res.json({
        user: user.toJSON(),
      });
    } catch (error) {
      console.error("Get user info error:", error);
      const statusCode = error.message === userMessages.NOT_FOUND ? 404 : 500;
      res.status(statusCode).json({
        error: error.message || userMessages.SERVER_ERROR,
        details: error.message,
      });
    }
  }

  /**
   * Logout user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  logout(req, res) {
    // Clear the httpOnly cookie
    res.clearCookie('authToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    res.json({
      message: userMessages.LOGOUT_SUCCESS,
    });
  }
}

export default Auth;

