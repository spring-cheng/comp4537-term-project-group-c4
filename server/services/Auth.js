import bcrypt from "bcrypt";
import User from "../models/User.js";
import { userMessages } from "../lang/en/messages.js";
import JWT from "./JWT.js";

/**
 * Authentication Service Class
 * Handles authentication business logic
 */
class Auth {
  constructor() {
    this.jwtService = new JWT();
  }

  /**
   * Register a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Token and user data
   */
  async register(email, password) {
    // Check if email already exists
    const emailExists = await User.emailExists(email);
    if (emailExists) {
      throw new Error(userMessages.EMAIL_EXISTS);
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User();
    await user.create(email, passwordHash);

    // Generate token
    const token = this.jwtService.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: user.toJSON(),
    };
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Token and user data
   */
  async login(email, password) {
    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      throw new Error(userMessages.LOGIN_FAILED);
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      throw new Error(userMessages.LOGIN_FAILED);
    }

    // Generate token
    const token = this.jwtService.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: user.toJSON(),
    };
  }

  /**
   * Get current user info
   * @param {number} userId - User ID
   * @returns {Promise<User>} User instance
   */
  async getCurrentUser(userId) {
    const user = await User.findByIdWithoutPassword(userId);
    if (!user) {
      throw new Error(userMessages.NOT_FOUND);
    }

    return user;
  }
}

export default Auth;

