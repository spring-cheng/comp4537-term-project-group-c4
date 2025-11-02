import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

/**
 * Database Connection Class
 * Singleton pattern for database connection pool
 */
class Database {
  constructor() {
    if (Database.instance) {
      return Database.instance;
    }

    const {
      MYSQL_HOST,
      MYSQL_PORT,
      MYSQL_USER,
      MYSQL_PASSWORD,
      MYSQL_DATABASE,
    } = process.env;

    this.pool = mysql.createPool({
      host: MYSQL_HOST,
      port: MYSQL_PORT,
      user: MYSQL_USER,
      password: MYSQL_PASSWORD,
      database: MYSQL_DATABASE,
    });

    Database.instance = this;
  }

  /**
   * Execute a query
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise} Query result
   */
  async query(sql, params = []) {
    try {
      return await this.pool.query(sql, params);
    } catch (error) {
      console.error("Database query error:", error);
      throw error;
    }
  }

  /**
   * Get the connection pool
   * @returns {Object} Connection pool
   */
  getPool() {
    return this.pool;
  }
}

export default new Database();

