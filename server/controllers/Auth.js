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

      res.status(201).json({
        message: userMessages.REGISTER_SUCCESS,
        token: result.token,
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

      res.json({
        message: userMessages.LOGIN_SUCCESS,
        token: result.token,
        user: result.user,
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
    res.json({
      message: userMessages.LOGOUT_SUCCESS,
    });
  }
}

export default Auth;

