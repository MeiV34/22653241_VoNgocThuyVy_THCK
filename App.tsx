import { StatusBar } from 'expo-status-bar';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    Modal,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { useEffect, useState } from 'react';
import { initDatabase } from './db';
import { Expense } from './types';
import { useExpenses } from './useExpenses'; // Câu 10: Import custom hook

export default function App() {
    // Câu 10: Sử dụng custom hook
    const {
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
    } = useExpenses();

    // Câu 4: State cho Modal thêm/sửa chi tiêu
    const [modalVisible, setModalVisible] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [formTitle, setFormTitle] = useState('');
    const [formAmount, setFormAmount] = useState('');
    const [formCategory, setFormCategory] = useState('');

    useEffect(() => {
        initDatabase();
        loadExpenses();
    }, [loadExpenses]);

    // Câu 3: Format số tiền
    const formatAmount = (amount: number) => {
        return amount.toLocaleString('vi-VN') + 'đ';
    };

    // Câu 4: Mở Modal để thêm chi tiêu mới   
    const openAddModal = () => {
        setEditingExpense(null);
        setFormTitle('');
        setFormAmount('');
        setFormCategory('');
        setModalVisible(true); 
    };

    // Câu 6: Mở Modal để sửa chi tiêu
    const openEditModal = (expense: Expense) => {
        setEditingExpense(expense);
        setFormTitle(expense.title);
        setFormAmount(expense.amount.toString());
        setFormCategory(expense.category || '');
        setModalVisible(true);
    };

    // Câu 7: Wrapper để xóa chi tiêu với xác nhận
    const handleDeleteExpense = (expense: Expense) => {
        Alert.alert(
            'Xác nhận xóa',
            `Bạn có chắc muốn xóa "${expense.title}"?`,
            [
                {
                    text: 'Hủy',
                    style: 'cancel',
                },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: () => {
                        deleteExpense(expense.id);
                        setModalVisible(false);
                    },
                },
            ],
        );
    };

    // Câu 4: Validate và lưu chi tiêu mới
    const saveExpense = () => {
        // Validate title
        if (!formTitle.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề chi tiêu!');
            return;
        }

        // Validate amount
        const amount = parseFloat(formAmount);
        if (isNaN(amount) || amount <= 0) {
            Alert.alert('Lỗi', 'Vui lòng nhập số tiền hợp lệ (> 0)!');
            return;
        }

        let success = false;
        if (editingExpense) {
            // Câu 6: Update
            success = updateExpense(
                editingExpense.id,
                formTitle.trim(),
                amount,
                formCategory.trim() || null,
            );
        } else {
            // Câu 4: Insert
            success = insertExpense(
                formTitle.trim(),
                amount,
                formCategory.trim() || null,
            );
        }

        if (success) {
            // Đóng Modal và reset form
            setModalVisible(false);
            setFormTitle('');
            setFormAmount('');
            setFormCategory('');
            setEditingExpense(null);
        } else {
            Alert.alert('Lỗi', 'Không thể lưu chi tiêu!');
        }
    };

    // Câu 3: Render từng item trong danh sách
    const renderExpenseItem = ({ item }: { item: Expense }) => (
        <TouchableOpacity
            style={styles.expenseItem}
            onPress={() => togglePaid(item)} // Câu 5: Chạm để toggle paid
            onLongPress={() => openEditModal(item)} // Câu 6: Nhấn giữ để sửa
            activeOpacity={0.7}
        >
            <View style={styles.expenseInfo}>
                <Text style={styles.expenseTitle}>{item.title}</Text>
                <Text style={styles.expenseAmount}>
                    {formatAmount(item.amount)}
                </Text>
                {item.category && (
                    <Text style={styles.expenseCategory}>
                        📁 {item.category}
                    </Text>
                )}
            </View>
            <View style={styles.expenseStatus}>
                <Text
                    style={[
                        styles.paidBadge,
                        item.paid ? styles.paidTrue : styles.paidFalse,
                    ]}
                >
                    {item.paid ? '✓ Đã trả' : '⏳ Nợ'}
                </Text>
            </View>
        </TouchableOpacity>
    );

    // Câu 3: Empty state khi không có dữ liệu
    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>📝</Text>
            <Text style={styles.emptyMessage}>Chưa có khoản chi tiêu nào.</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="auto" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>💰 Expense Notes</Text>

                {/* Câu 8: Search Input */}
                <TextInput
                    style={styles.searchInput}
                    placeholder="🔍 Tìm kiếm theo tiêu đề hoặc danh mục..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#aaa"
                />

                {/* Câu 9: Nút Import từ API */}
                <TouchableOpacity
                    style={[
                        styles.importButton,
                        importing && styles.importButtonDisabled,
                    ]}
                    onPress={importFromAPI}
                    disabled={importing}
                >
                    <Text style={styles.importButtonText}>
                        {importing ? '⏳ Đang import...' : '📥 Import từ API'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Câu 3: Danh sách chi tiêu với FlatList */}
            {/* Câu 8: Sử dụng filteredExpenses thay vì expenses */}
            {/* Câu 10: Thêm Pull to Refresh */}
            <FlatList
                data={filteredExpenses}
                renderItem={renderExpenseItem}
                keyExtractor={(item) => item.id.toString()}
                ListEmptyComponent={renderEmptyState}
                contentContainerStyle={
                    filteredExpenses.length === 0
                        ? styles.emptyList
                        : styles.list
                }
                refreshing={refreshing}
                onRefresh={refreshExpenses}
            />

            {/* Câu 10: Hiển thị tổng tiền */}
            {filteredExpenses.length > 0 && (
                <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Tổng chi tiêu:</Text>
                    <Text style={styles.totalAmount}>
                        {formatAmount(totalAmount)}
                    </Text>
                </View>
            )}

            {/* Câu 4: Nút thêm chi tiêu */}
            <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
                <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>

            {/* Câu 4: Modal thêm/sửa chi tiêu */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalContainer}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {editingExpense
                                ? 'Sửa chi tiêu'
                                : 'Thêm chi tiêu mới'}
                        </Text>

                        <ScrollView style={styles.formContainer}>
                            {/* Title Input */}
                            <Text style={styles.label}>
                                Tiêu đề <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nhập tiêu đề chi tiêu"
                                value={formTitle}
                                onChangeText={setFormTitle}
                            />

                            {/* Amount Input */}
                            <Text style={styles.label}>
                                Số tiền <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nhập số tiền"
                                value={formAmount}
                                onChangeText={setFormAmount}
                                keyboardType="numeric"
                            />

                            {/* Category Input */}
                            <Text style={styles.label}>
                                Danh mục (tùy chọn)
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nhập danh mục"
                                value={formCategory}
                                onChangeText={setFormCategory}
                            />
                        </ScrollView>

                        {/* Buttons */}
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Hủy</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, styles.saveButton]}
                                onPress={saveExpense}
                            >
                                <Text style={styles.saveButtonText}>Lưu</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Câu 7: Nút xóa (chỉ hiện khi đang sửa) */}
                        {editingExpense && (
                            <TouchableOpacity
                                style={[styles.button, styles.deleteButton]}
                                onPress={() =>
                                    handleDeleteExpense(editingExpense)
                                }
                            >
                                <Text style={styles.deleteButtonText}>
                                    🗑️ Xóa chi tiêu
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#4CAF50',
        padding: 20,
        paddingTop: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    // Câu 8: Style cho Search Input
    searchInput: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#333',
    },
    // Câu 9: Styles cho Import Button
    importButton: {
        backgroundColor: '#2196F3',
        borderRadius: 8,
        padding: 12,
        marginTop: 10,
        alignItems: 'center',
    },
    importButtonDisabled: {
        backgroundColor: '#90CAF9',
    },
    importButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    list: {
        padding: 10,
    },
    emptyList: {
        flex: 1,
    },
    expenseItem: {
        backgroundColor: '#fff',
        padding: 15,
        marginVertical: 5,
        marginHorizontal: 10,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    expenseInfo: {
        flex: 1,
    },
    expenseTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
    },
    expenseAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginBottom: 5,
    },
    expenseCategory: {
        fontSize: 14,
        color: '#666',
    },
    expenseStatus: {
        marginLeft: 10,
    },
    paidBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
        fontSize: 12,
        fontWeight: '600',
    },
    paidTrue: {
        backgroundColor: '#E8F5E9',
        color: '#4CAF50',
    },
    paidFalse: {
        backgroundColor: '#FFF3E0',
        color: '#FF9800',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 64,
        marginBottom: 10,
    },
    emptyMessage: {
        fontSize: 18,
        color: '#999',
        textAlign: 'center',
    },
    addButton: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        backgroundColor: '#4CAF50',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    addButtonText: {
        fontSize: 32,
        color: '#fff',
        fontWeight: 'bold',
    },
    // Câu 4: Styles cho Modal
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    formContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        marginTop: 10,
    },
    required: {
        color: '#f44336',
    },
    input: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    button: {
        flex: 1,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#f5f5f5',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        backgroundColor: '#4CAF50',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    // Câu 7: Styles cho nút xóa
    deleteButton: {
        backgroundColor: '#f44336',
        marginTop: 10,
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    // Câu 10: Styles cho tổng tiền
    totalContainer: {
        backgroundColor: '#fff',
        padding: 15,
        borderTopWidth: 2,
        borderTopColor: '#4CAF50',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    totalAmount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
});