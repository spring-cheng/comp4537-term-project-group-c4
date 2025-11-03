import { body, validationResult } from "express-validator";
import { userMessages } from "../lang/en/messages.js";

/**
 * Middleware to handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    
    // Map validation errors to user messages
    let errorMessage = userMessages.INVALID_INPUT;
    if (firstError.msg === "Email is required" || firstError.msg === "Invalid email format") {
      errorMessage = userMessages.INVALID_EMAIL;
    } else if (firstError.msg === "Password must be at least 3 characters") {
      errorMessage = userMessages.INVALID_PASSWORD;
    }

    return res.status(400).json({
      error: errorMessage,
      details: firstError.msg,
      errors: errors.array(),
    });
  }
  next();
};

/**
 * Validation rules for registration
 */
export const validateRegisterInput = [
  // Email validation
  body("email")
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(), // Normalize email format

  // Password validation
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 3 })
    .withMessage("Password must be at least 3 characters"),

  // Handle validation errors
  handleValidationErrors,
];

/**
 * Validation rules for login
 */
export const validateLoginInput = [
  // Email validation
  body("email")
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(), // Normalize email format

  // Password validation
  body("password")
    .notEmpty()
    .withMessage("Password is required"),

  // Handle validation errors
  handleValidationErrors,
];

/**
 * Validation rules for AI chat prompt
 */
export const validateChatPrompt = [
  body("prompt")
    .trim()
    .notEmpty()
    .withMessage("Prompt is required and cannot be empty")
    .isLength({ min: 1, max: 5000 })
    .withMessage("Prompt must be between 1 and 5000 characters")
    .escape(), // Sanitize HTML to prevent XSS

  // Handle validation errors
  handleValidationErrors,
];
