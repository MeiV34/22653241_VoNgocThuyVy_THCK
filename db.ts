import * as SQLite from 'expo-sqlite';

// Mở kết nối database
export const db = SQLite.openDatabaseSync('expenses.db');

// Khởi tạo database
export const initDatabase = () => {
    try {
        console.log('Initializing database...');

        // Câu 2: Tạo bảng expenses nếu chưa tồn tại
        db.execSync(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL, 
        amount REAL NOT NULL,
        category TEXT,
        paid INTEGER DEFAULT 1,
        created_at INTEGER
      );
    `);

        // Câu 2: Seed dữ liệu mẫu (chỉ chạy nếu bảng trống)
        const result = db.getFirstSync<{ count: number }>(
            'SELECT COUNT(*) as count FROM expenses',
        );

        if (result && result.count === 0) {
            const now = Date.now();

            db.runSync(
                'INSERT INTO expenses (title, amount, category, paid, created_at) VALUES (?, ?, ?, ?, ?)',
                ['Cà phê', 30000, 'Ăn uống', 1, now],
            );

            db.runSync(
                'INSERT INTO expenses (title, amount, category, paid, created_at) VALUES (?, ?, ?, ?, ?)',
                ['Ăn trưa', 50000, 'Ăn uống', 1, now],
            );

            db.runSync(
                'INSERT INTO expenses (title, amount, category, paid, created_at) VALUES (?, ?, ?, ?, ?)',
                ['Xăng xe', 100000, 'Di chuyển', 0, now],
            );

            console.log('Seeded 3 sample expenses');
        }

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
};
