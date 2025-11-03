import express from "express";
import authMiddleware from "../middleware/auth.js";
import User from "../models/User.js";

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
   */
  async generate(req, res) {
    try {
      const { model, prompt, options } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
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

      // Increment API calls for the user (only if not admin)
      if (req.user && req.user.id) {
        try {
          const user = await User.findById(req.user.id);
          if (user) {
            await user.incrementApiCalls();
          }
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
