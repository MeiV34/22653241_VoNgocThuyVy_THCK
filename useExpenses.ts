// Câu 10: Custom hook useExpenses để đóng gói logic
import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { db } from './db';
import { Expense } from './types';

export const useExpenses = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [importing, setImporting] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Load expenses từ database
    const loadExpenses = useCallback(() => {
        try {
            const result = db.getAllSync<Expense>(
                'SELECT * FROM expenses ORDER BY created_at DESC',
            );
            setExpenses(result);
        } catch (error) {
            console.error('Error loading expenses:', error);
        }
    }, []);

    // Refresh expenses (cho pull to refresh)
    const refreshExpenses = useCallback(async () => {
        setRefreshing(true);
        loadExpenses();
        // Simulate delay for better UX
        setTimeout(() => setRefreshing(false), 500);
    }, [loadExpenses]);

    // Insert expense mới
    const insertExpense = useCallback(
        (title: string, amount: number, category: string | null) => {
            try {
                const now = Date.now();
                db.runSync(
                    'INSERT INTO expenses (title, amount, category, paid, created_at) VALUES (?, ?, ?, ?, ?)',
                    [title, amount, category, 1, now],
                );
                loadExpenses();
                return true;
            } catch (error) {
                console.error('Error inserting expense:', error);
                return false;
            }
        },
        [loadExpenses],
    );

    // Update expense
    const updateExpense = useCallback(
        (
            id: number,
            title: string,
            amount: number,
            category: string | null,
        ) => {
            try {
                db.runSync(
                    'UPDATE expenses SET title = ?, amount = ?, category = ? WHERE id = ?',
                    [title, amount, category, id],
                );
                loadExpenses();
                return true;
            } catch (error) {
                console.error('Error updating expense:', error);
                return false;
            }
        },
        [loadExpenses],
    );

    // Delete expense
    const deleteExpense = useCallback(
        (id: number) => {
            try {
                db.runSync('DELETE FROM expenses WHERE id = ?', [id]);
                loadExpenses();
                return true;
            } catch (error) {
                console.error('Error deleting expense:', error);
                return false;
            }
        },
        [loadExpenses],
    );

    // Toggle paid status
    const togglePaid = useCallback(
        (expense: Expense) => {
            try {
                const newPaidStatus = expense.paid === 1 ? 0 : 1;
                db.runSync('UPDATE expenses SET paid = ? WHERE id = ?', [
                    newPaidStatus,
                    expense.id,
                ]);
                loadExpenses();
                return true;
            } catch (error) {
                console.error('Error toggling paid status:', error);
                return false;
            }
        },
        [loadExpenses],
    );

    // Import từ API
    const importFromAPI = useCallback(async () => {
        if (importing) return;

        setImporting(true);

        try {
            const response = await fetch(
                'https://fakestoreapi.com/products?limit=5',
            );

            if (!response.ok) {
                throw new Error('Không thể kết nối API');
            }

            const data = await response.json();

            let importedCount = 0;
            const now = Date.now();

            for (const item of data) {
                const title = item.title || 'Sản phẩm';
                const amount = item.price || 0;

                const existing = db.getFirstSync<{ count: number }>(
                    'SELECT COUNT(*) as count FROM expenses WHERE title = ? AND amount = ?',
                    [title, amount],
                );

                if (existing && existing.count === 0) {
                    db.runSync(
                        'INSERT INTO expenses (title, amount, category, paid, created_at) VALUES (?, ?, ?, ?, ?)',
                        [title, amount, item.category || 'Import', 1, now],
                    );
                    importedCount++;
                }
            }

            loadExpenses();

            Alert.alert(
                'Thành công',
                `Đã import ${importedCount} khoản chi tiêu mới!`,
            );
        } catch (error) {
            console.error('Error importing from API:', error);
            Alert.alert('Lỗi', 'Không thể import dữ liệu từ API!');
        } finally {
            setImporting(false);
        }
    }, [importing, loadExpenses]);

    // Filter expenses theo search query
    const filteredExpenses = useMemo(() => {
        if (!searchQuery.trim()) {
            return expenses;
        }

        const query = searchQuery.toLowerCase().trim();
        return expenses.filter(
            (expense) =>
                expense.title.toLowerCase().includes(query) ||
                (expense.category &&
                    expense.category.toLowerCase().includes(query)),
        );
    }, [expenses, searchQuery]);

    // Câu 10: Tính tổng tiền
    const totalAmount = useMemo(() => {
        return filteredExpenses.reduce(
            (sum, expense) => sum + expense.amount,
            0,
        );
    }, [filteredExpenses]);

    return {
        expenses,
        filteredExpenses,
        searchQuery,
        setSearchQuery,
        importing,
        refreshing,
        totalAmount,
        loadExpenses,
        refreshExpenses,
        insertExpense,
        updateExpense,
        deleteExpense,
        togglePaid,
        importFromAPI,
    };
};
