import cors from "cors";
import express from "express";
import { userMessages } from "./lang/en/messages.js";
import User from "./models/User.js";
import AdminService from "./services/Admin.js";
import Admin from "./routes/admin.js";
import AI from "./routes/ai.js";
import Auth from "./routes/auth.js";
import Dashboard from "./routes/Dashboard.js";
import Landing from "./routes/Landing.js";
import DefaultAdmin from "./utils/defaultAdmin.js";
import Database from "./db/Database.js";
import { setupSwagger } from "./config/swagger.js";

/**
 * Express Application Class
 */
class App {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 4000;
    this.initializeMiddleware();
    setupSwagger(this.app);
    this.initializeDatabase();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Initialize middleware
   */
  initializeMiddleware() {
    // CORS configuration - allow requests from client origin (port 8080)
    this.app.use(cors({
      origin: 'http://localhost:8080',
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
    }));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use((req, res, next) => {
      req.cookies = {};
      if (req.headers.cookie) {
        req.headers.cookie.split(';').forEach(cookie => {
          const parts = cookie.trim().split('=');
          if (parts.length === 2) {
            req.cookies[parts[0]] = decodeURIComponent(parts[1]);
          }
        });
      }
      next();
    });

    // Track API endpoint usage counts
    this.app.use(async (req, res, next) => {
      try {
        const sql = `
          INSERT INTO endpoint_stats (method, endpoint, count)
          VALUES (?, ?, 1)
          ON DUPLICATE KEY UPDATE count = count + 1
        `;
        await Database.query(sql, [req.method, req.path]);
      } catch (err) {
        console.error("Error updating endpoint stats:", err.message);
      }
      next();
    });
  }

  /**
   * Initialize database
   */
  async initializeDatabase() {
    try {
      await User.initTable();
      await AdminService.initEndpointStatsTable();
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
    const dashboardRoutes = new Dashboard();
    const adminRoutes = new Admin();
    const aiRoutes = new AI();

    // Register API routes
    this.app.use("/api/auth", authRoutes.getRouter());
    this.app.use("/api/landing", landingRoutes.getRouter());
    this.app.use("/api/dashboard", dashboardRoutes.getRouter());
    this.app.use("/api/admin", adminRoutes.getRouter());
    this.app.use("/api", aiRoutes.getRouter());
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
