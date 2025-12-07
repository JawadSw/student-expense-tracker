import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import CategoryChart from './CategoryChart';

function getTodayISO() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

const FILTERS = {
  ALL: 'ALL',
  WEEK: 'WEEK',
  MONTH: 'MONTH',
};

function isThisMonth(dateString) {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return false;

  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth()
  );
}

function isThisWeek(dateString) {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return false;

  const now = new Date();
  const startOfWeek = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - now.getDay()
  );
  const endOfWeek = new Date(
    startOfWeek.getFullYear(),
    startOfWeek.getMonth(),
    startOfWeek.getDate() + 7
  );

  return d >= startOfWeek && d < endOfWeek;
}

export default function ExpenseScreen() {
  const db = useSQLiteContext();

  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(getTodayISO());
  const [filter, setFilter] = useState(FILTERS.ALL);

  // NEW FOR EDITING
  const [editingId, setEditingId] = useState(null);

  const loadExpenses = async () => {
    const rows = await db.getAllAsync(
      'SELECT * FROM expenses ORDER BY date DESC, id DESC;'
    );
    setExpenses(rows);
  };

  const addExpense = async () => {
    const amountNumber = parseFloat(amount);
    if (isNaN(amountNumber) || amountNumber <= 0) return;

    await db.runAsync(
      'INSERT INTO expenses (amount, category, note, date) VALUES (?, ?, ?, ?);',
      [amountNumber, category.trim(), note.trim() || null, date.trim()]
    );

    clearForm();
    loadExpenses();
  };

  const deleteExpense = async (id) => {
    await db.runAsync('DELETE FROM expenses WHERE id = ?;', [id]);
    loadExpenses();
  };

  // EDIT MODE LOGIC
  const startEditing = (item) => {
    setEditingId(item.id);
    setAmount(String(item.amount));
    setCategory(item.category);
    setNote(item.note || '');
    setDate(item.date);
  };

  const saveEdit = async () => {
    const amountNumber = parseFloat(amount);
    if (isNaN(amountNumber) || amountNumber <= 0) return;

    await db.runAsync(
      'UPDATE expenses SET amount = ?, category = ?, note = ?, date = ? WHERE id = ?;',
      [
        amountNumber,
        category.trim(),
        note.trim() || null,
        date.trim(),
        editingId,
      ]
    );

    clearForm();
    loadExpenses();
  };

  const clearForm = () => {
    setAmount('');
    setCategory('');
    setNote('');
    setDate(getTodayISO());
    setEditingId(null);
  };

  const renderExpense = ({ item }) => (
    <TouchableOpacity onPress={() => startEditing(item)}>
      <View style={styles.expenseRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.expenseAmount}>
            ${Number(item.amount).toFixed(2)}
          </Text>
          <Text style={styles.expenseCategory}>{item.category}</Text>
          <Text style={styles.expenseDate}>{item.date}</Text>
          {item.note ? <Text style={styles.expenseNote}>{item.note}</Text> : null}
        </View>

        <TouchableOpacity onPress={() => deleteExpense(item.id)}>
          <Text style={styles.delete}>✕</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  useEffect(() => {
    async function setup() {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS expenses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          amount REAL NOT NULL,
          category TEXT NOT NULL,
          note TEXT,
          date TEXT NOT NULL
        );
      `);
      await loadExpenses();
    }
    setup();
  }, []);

  const filteredExpenses = expenses.filter((exp) => {
    if (filter === FILTERS.ALL) return true;
    if (filter === FILTERS.WEEK) return isThisWeek(exp.date);
    if (filter === FILTERS.MONTH) return isThisMonth(exp.date);
    return true;
  });

  const overallTotal = filteredExpenses.reduce(
    (sum, exp) => sum + Number(exp.amount || 0),
    0
  );

  const categoryTotals = {};
  filteredExpenses.forEach((exp) => {
    categoryTotals[exp.category] =
      (categoryTotals[exp.category] || 0) + Number(exp.amount);
  });

  const filterLabel =
    filter === FILTERS.ALL
      ? 'All'
      : filter === FILTERS.WEEK
      ? 'This Week'
      : 'This Month';

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredExpenses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderExpense}
        ListHeaderComponent={
          <>
            <Text style={styles.heading}>Student Expense Tracker</Text>

            {/* FILTERS */}
            <View style={styles.filterRow}>
              {Object.values(FILTERS).map((f) => (
                <TouchableOpacity
                  key={f}
                  onPress={() => setFilter(f)}
                  style={[
                    styles.filterButton,
                    filter === f && styles.filterButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      filter === f && styles.filterTextActive,
                    ]}
                  >
                    {f === 'ALL'
                      ? 'All'
                      : f === 'WEEK'
                      ? 'This Week'
                      : 'This Month'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* TOTALS */}
            <View style={styles.totalCard}>
              <Text style={styles.totalTitle}>
                Total Spending ({filterLabel})
              </Text>
              <Text style={styles.totalAmount}>
                ${overallTotal.toFixed(2)}
              </Text>
            </View>

            {/* CATEGORY SUMMARY LIST */}
            <View style={styles.categoryCard}>
              <Text style={styles.categoryTitle}>
                By Category ({filterLabel})
              </Text>
              {Object.keys(categoryTotals).length === 0 ? (
                <Text style={styles.empty}>No expenses for this filter.</Text>
              ) : (
                Object.entries(categoryTotals).map(([cat, total]) => (
                  <View key={cat} style={styles.categoryRow}>
                    <Text style={styles.categoryName}>{cat}</Text>
                    <Text style={styles.categoryAmount}>
                      ${total.toFixed(2)}
                    </Text>
                  </View>
                ))
              )}
            </View>

            {/* CHART */}
            <CategoryChart
              categoryTotals={categoryTotals}
              filterLabel={filterLabel}
            />

            {/* FORM (ADD OR EDIT) */}
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Amount"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />

              <TextInput
                style={styles.input}
                placeholder="Category"
                placeholderTextColor="#9ca3af"
                value={category}
                onChangeText={setCategory}
              />

              <TextInput
                style={styles.input}
                placeholder="Note (optional)"
                placeholderTextColor="#9ca3af"
                value={note}
                onChangeText={setNote}
              />

              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9ca3af"
                value={date}
                onChangeText={setDate}
              />

              {editingId ? (
                <>
                  <Button title="Save Changes" onPress={saveEdit} />
                  <View style={{ height: 8 }} />
                  <Button
                    title="Cancel Edit"
                    color="#6b7280"
                    onPress={clearForm}
                  />
                </>
              ) : (
                <Button title="Add Expense" onPress={addExpense} />
              )}
            </View>
          </>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No expenses yet.</Text>
        }
        ListFooterComponent={
          <Text style={styles.footer}>
            Tap any expense to edit it — stored locally with SQLite.
          </Text>
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#111827' },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#374151',
    alignItems: 'center',
    backgroundColor: '#020617',
  },
  filterButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterText: {
    color: '#e5e7eb',
    fontSize: 12,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#f9fafb',
    fontWeight: '700',
  },
  totalCard: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  totalTitle: { color: '#e5e7eb', fontSize: 14, marginBottom: 4 },
  totalAmount: {
    color: '#fbbf24',
    fontSize: 22,
    fontWeight: '700',
  },
  categoryCard: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  categoryTitle: {
    color: '#e5e7eb',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  categoryName: { color: '#e5e7eb', fontSize: 13 },
  categoryAmount: {
    color: '#fbbf24',
    fontSize: 13,
    fontWeight: '600',
  },
  form: { marginBottom: 16, gap: 8 },
  input: {
    padding: 10,
    backgroundColor: '#1f2937',
    color: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fbbf24',
  },
  expenseCategory: { fontSize: 14, color: '#e5e7eb' },
  expenseDate: { fontSize: 12, color: '#9ca3af' },
  expenseNote: { fontSize: 12, color: '#9ca3af' },
  delete: { color: '#f87171', fontSize: 20, marginLeft: 12 },
  empty: { color: '#9ca3af', textAlign: 'center', marginTop: 12 },
  footer: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 12,
    fontSize: 12,
  },
});
