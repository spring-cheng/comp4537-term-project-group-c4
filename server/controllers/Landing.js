import UserService from "../services/User.js";
import { userMessages } from "../lang/en/messages.js";

/**
 * Landing Controller Class
 * Handles HTTP requests for landing pages
 */
class Landing {
  constructor() {
    this.userService = new UserService();
  }

  /**
   * Get landing page data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getLanding(req, res) {
    try {
      const data = await this.userService.getLandingData(req.user.id);
      res.json(data);
    } catch (error) {
      console.error("Landing page error:", error);
      const statusCode = error.message === userMessages.NOT_FOUND ? 404 : 500;
      res.status(statusCode).json({
        error: error.message || userMessages.SERVER_ERROR,
        details: error.message,
      });
    }
  }
}

export default Landing;

