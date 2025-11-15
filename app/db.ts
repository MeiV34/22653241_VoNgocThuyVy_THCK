// db.ts
import * as SQLite from 'expo-sqlite';

// SQLite API mới — phải dùng openDatabaseSync
export const db = SQLite.openDatabaseSync('expenses.db');

// Hàm tạo bảng
export function initDB() {
  db.execAsync(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
}
