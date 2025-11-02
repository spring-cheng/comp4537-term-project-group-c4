import cors from "cors";
import express from "express";
import User from "./models/User.js";
import { userMessages } from "./lang/en/messages.js";
import Auth from "./routes/Auth.js";
import Landing from "./routes/Landing.js";
import Admin from "./routes/Admin.js";
import DefaultAdmin from "./utils/defaultAdmin.js";

/**
 * Express Application Class
 */
class App {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 4000;
    this.initializeMiddleware();
    this.initializeDatabase();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Initialize middleware
   */
  initializeMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  /**
   * Initialize database
   */
  async initializeDatabase() {
    try {
      await User.initTable();
      // Create default admin user
      await DefaultAdmin.create();
    } catch (error) {
      console.error("Database initialization error:", error);
    }
  }

  /**
   * Initialize routes
   */
  initializeRoutes() {
    // Root route
    this.app.get("/", (_req, res) => {
      res.json({ message: userMessages.SERVER_RUNNING });
    });

    // Initialize route classes
    const authRoutes = new Auth();
    const landingRoutes = new Landing();
    const adminRoutes = new Admin();

    // Register API routes
    this.app.use("/api/auth", authRoutes.getRouter());
    this.app.use("/api/landing", landingRoutes.getRouter());
    this.app.use("/api/admin", adminRoutes.getRouter());
  }

  /**
   * Initialize error handling
   */
  initializeErrorHandling() {
    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        error: userMessages.NOT_FOUND,
        path: req.path,
      });
    });

    // Error handling middleware
    this.app.use((err, req, res, next) => {
      console.error("Error:", err);
      res.status(err.status || 500).json({
        error: err.message || userMessages.SERVER_ERROR,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
      });
    });
  }

  /**
   * Start the server
   */
  start() {
    this.app.listen(this.port, () => {
      console.log(`${userMessages.SERVER_RUNNING} Port ${this.port}`);
    });
  }
}

// Create and start the application
const app = new App();
app.start();

export default app;
