import { userMessages } from "../lang/en/messages.js";
import { db } from "./connect.js";

export async function initUserTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('user', 'admin') DEFAULT 'user',
      api_calls INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `;

  try {
    await db.query(sql);
    console.log(userMessages.USERS_TABLE_READY);
  } catch (err) {
    console.error(`${userMessages.USER_CREATE_ERROR} ${err.message}`);
  }
}
