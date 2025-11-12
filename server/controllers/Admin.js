import AdminService from "../services/Admin.js";
import { userMessages } from "../lang/en/messages.js";

/**
 * Admin Controller Class
 * Handles HTTP requests for admin operations
 */
class Admin {
  constructor() {
    this.adminService = new AdminService();
  }

  /**
   * Get all users
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUsers(req, res) {
    try {
      const result = await this.adminService.getAllUsers();
      res.json(result);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({
        error: userMessages.SERVER_ERROR,
        details: error.message,
      });
    }
  }

  /**
   * Get usage statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUsage(req, res) {
    try {
      const stats = await this.adminService.getUsageStats();
      res.json(stats);
    } catch (error) {
      console.error("Get usage stats error:", error);
      res.status(500).json({
        error: userMessages.SERVER_ERROR,
        details: error.message,
      });
    }
  }

  /**
   * Get user by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUserById(req, res) {
    try {
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        return res.status(400).json({
          error: userMessages.INVALID_INPUT,
          details: "Invalid user ID.",
        });
      }

      const user = await this.adminService.getUserById(userId);
      res.json({ user });
    } catch (error) {
      console.error("Get user detail error:", error);
      const statusCode = error.message === userMessages.NOT_FOUND ? 404 : 500;
      res.status(statusCode).json({
        error: error.message || userMessages.SERVER_ERROR,
        details: error.message,
      });
    }
  }

  /**
   * Reset user API calls
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async resetApiCalls(req, res) {
    try {
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        return res.status(400).json({
          error: userMessages.INVALID_INPUT,
          details: "Invalid user ID.",
        });
      }

      await this.adminService.resetUserApiCalls(userId);

      res.json({
        message: "API calls reset successfully.",
        user_id: userId,
      });
    } catch (error) {
      console.error("Reset API calls error:", error);
      const statusCode = error.message === userMessages.NOT_FOUND ? 404 : 400;
      res.status(statusCode).json({
        error: error.message || userMessages.SERVER_ERROR,
        details: error.message,
      });
    }
  }

  /**
 * Get endpoint usage statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
  async getEndpointStats(req, res) {
    try {
      const stats = await this.adminService.getEndpointStats();
      res.json({ stats });
    } catch (error) {
      console.error("Get endpoint stats error:", error);
      res.status(500).json({
        error: userMessages.SERVER_ERROR,
        details: error.message,
      });
    }
  }

}

export default Admin;

