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
   * Verify JWT token
   * @returns {Function} Express middleware function
   */
  authenticateToken() {
    return (req, res, next) => {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

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
}

export default new Auth();

