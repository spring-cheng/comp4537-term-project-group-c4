import jwt from "jsonwebtoken";

/**
 * JWT Service Class, serverless implementation of session management
 * Handles JWT token operations
 */
class JWT {
  constructor() {
    // TODO: Update JWT_SECRET in .env file 
    this.secret = process.env.JWT_SECRET || "secret-key-change-in-production-!!!!";
    this.expiresIn = "7d";
  }

  /**
   * Generate JWT token
   * @param {Object} payload - Token payload
   * @returns {string} JWT token
   */
  generateToken(payload) {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Object} Decoded token payload
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, this.secret);
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  /**
   * Get JWT secret
   * @returns {string} JWT secret
   */
  getSecret() {
    return this.secret;
  }
}

export default JWT;

