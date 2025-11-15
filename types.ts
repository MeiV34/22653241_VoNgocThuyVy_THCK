// Định nghĩa kiểu dữ liệu cho Expense
export interface Expense {
    id: number;
    title: string;
    amount: number;
    category: string | null;
    paid: number;
    created_at: number;
}
