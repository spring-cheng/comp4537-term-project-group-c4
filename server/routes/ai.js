import express from "express";
import authMiddleware from "../middleware/auth.js";
import User from "../models/User.js";
import { userMessages } from "../lang/en/messages.js";

/**
 * @swagger
 * tags:
 *   name: AI
 *   description: AI/ML model endpoints using TinyLlama (HuggingFace)
 */

/**
 * @swagger
 * /api/generate:
 *   post:
 *     summary: Generate text using the TinyLlama model
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [prompt]
 *             properties:
 *               model:
 *                 type: string
 *                 example: tinyllama
 *               prompt:
 *                 type: string
 *                 example: "Write a haiku about the ocean."
 *               options:
 *                 type: object
 *                 example: { "temperature": 0.7 }
 *     responses:
 *       200:
 *         description: AI-generated text (streamed response)
 *       400:
 *         description: Bad request — missing prompt or invalid payload
 *       401:
 *         description: Unauthorized — missing/invalid JWT
 *       500:
 *         description: AI inference error or model failure
 */

/**
 * AI Routes Class
 */
class AI {
  constructor() {
    this.router = express.Router();
    this.initializeRoutes();
  }

  /**
   * Initialize routes
   */
  initializeRoutes() {
    this.router.post("/generate", authMiddleware.authenticateToken(), this.generate.bind(this));
  }

  /**
   * Generate text using TinyLlama model
   * POST /api/generate
   * Checks API call limit and sends warning if limit reached, but continues processing
   */
  async generate(req, res) {
    try {
      const { model, prompt, options } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      // Check user's API call limit before processing
      let user = null;
      let limitReached = false;
      let warningMessage = null;
      const FREE_API_LIMIT = userMessages.FREE_API_LIMIT || 20;

      if (req.user && req.user.id) {
        try {
          user = await User.findById(req.user.id);
          if (user && user.role !== "admin") {
            const currentCalls = user.api_calls || 0;
            if (currentCalls >= FREE_API_LIMIT) {
              limitReached = true;
              warningMessage = `Warning: You have reached your free API call limit of ${FREE_API_LIMIT}. This request will still be processed, but please consider upgrading for continued service.`;
            } else if (currentCalls === FREE_API_LIMIT - 1) {
              warningMessage = `Warning: This is your last free API call. You have used ${currentCalls} of ${FREE_API_LIMIT} free calls.`;
            }
          }
        } catch (error) {
          console.error("Failed to check API call limit:", error);
          // Continue processing even if check fails
        }
      }

      const response = await fetch("https://charlieho.me/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "supersecret",
        },
        body: JSON.stringify({
          model: model || "tinyllama",
          prompt,
          options: options || { temperature: 0.5 },
        }),
      });

      if (!response.ok) {
        throw new Error(`TinyLlama API error: ${response.status}`);
      }

      // Set headers for streaming response
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Transfer-Encoding", "chunked");

      // Send warning message first if limit reached (before streaming response)
      if (warningMessage) {
        res.write(JSON.stringify({
          warning: warningMessage,
          limit_reached: limitReached,
          api_calls: user ? (user.api_calls || 0) : null,
          limit: FREE_API_LIMIT
        }) + "\n");
      }

      // Stream response back to client
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        res.write(chunk);
      }

      res.end();

      // Increment API calls for the user AFTER response is sent (only if not admin)
      // This happens AFTER the response, so service continues even after limit
      if (user && user.role !== "admin") {
        try {
          await user.incrementApiCalls();
        } catch (error) {
          console.error("Failed to increment API calls:", error);
          // Don't fail the request if tracking fails
        }
      }
    } catch (error) {
      console.error("AI generation error:", error);
      res.status(500).json({
        error: "Failed to generate response",
        details: error.message,
      });
    }
  }

  /**
   * Get router
   */
  getRouter() {
    return this.router;
  }
}

export default AI;
