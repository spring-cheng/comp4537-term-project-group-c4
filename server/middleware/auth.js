import JWT from "../services/JWT.js";
import { userMessages } from "../lang/en/messages.js";

/**
 * Auth Middleware Class
 * Handles authentication middleware
 */
class Auth {
  constructor() {
    this.jwtService = new JWT();
  }

  /**
   * Verify JWT token from httpOnly cookie
   * Only supports httpOnly cookies for security
   * @returns {Function} Express middleware function
   */
  authenticateToken() {
    return (req, res, next) => {
      // Get token from httpOnly cookie only
      const token = req.cookies?.authToken;

      if (!token) {
        return res.status(401).json({
          error: userMessages.TOKEN_MISSING,
        });
      }

      try {
        const user = this.jwtService.verifyToken(token);
        req.user = user;
        next();
      } catch (error) {
        return res.status(403).json({
          error: userMessages.TOKEN_INVALID,
        });
      }
    };
  }

  /**
   * Require admin role
   * @returns {Function} Express middleware function
   */
  requireAdmin() {
    return (req, res, next) => {
      if (req.user && req.user.role === "admin") {
        next();
      } else {
        return res.status(403).json({
          error: userMessages.FORBIDDEN,
        });
      }
    };
  }

  /**
   * Validate API key (for testing: accepts 'supersecret')
   * Optionally validates JWT token for user identification and API call tracking
   * @returns {Function} Express middleware function
   */
  validateApiKey() {
    return (req, res, next) => {
      const apiKey = req.headers["x-api-key"];

      // Check if API key is provided
      if (!apiKey) {
        return res.status(401).json({
          error: userMessages.API_KEY_MISSING,
        });
      }

      // For testing: validate against shared secret
      const TEST_API_KEY = "supersecret";
      if (apiKey !== TEST_API_KEY) {
        return res.status(403).json({
          error: userMessages.API_KEY_INVALID,
        });
      }

      // Optionally verify JWT token from httpOnly cookie (for user identification)
      const token = req.cookies?.authToken;

      if (token) {
        try {
          const user = this.jwtService.verifyToken(token);
          req.user = user; // Attach user info for API call tracking
        } catch (error) {
          // JWT invalid, but API key is valid - continue without user info
          // (user won't be tracked for this call)
        }
      }

      next();
    };
  }
}

export default new Auth();

