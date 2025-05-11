import { useEffect, useState } from "react";
import Navigation from "../NavBar";
import styles from "./style.module.css";

export default function CombinedExpense() {
  // Form state for adding/updating an expense
  const [expenseType, setExpenseType] = useState("Monthly");
  const [expense, setExpense] = useState("transportation"); // default source/category
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [date, setDate] = useState("");

  // Data state
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Editing state
  const [editId, setEditId] = useState(null);
  const [editExpenseType, setEditExpenseType] = useState("Monthly");
  const [editExpense, setEditExpense] = useState("transportation");
  const [editAmount, setEditAmount] = useState("");
  const [editReference, setEditReference] = useState("");
  const [editDate, setEditDate] = useState("");

  // API URLs for expense and budget routes
  const expenseApiUrl = "http://localhost:8080/api/expense";
  const budgetApiUrl = "http://localhost:8080/api/budgetplan";

  // Helper to get auth headers (JWT from localStorage)
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    };
  };

  // Fetch all expenses on mount
  useEffect(() => {
    getItems();
  }, []);

  // Fetch expenses from backend
  const getItems = () => {
    fetch(expenseApiUrl, { method: "GET", headers: getAuthHeaders() })
      .then((res) => res.json())
      .then((data) => setExpenses(data))
      .catch(() => setError("Failed to fetch expenses"));
  };

  // Add a new expense, then update the corresponding budget spending
  const handleSubmit = () => {
    setError("");
    if (!expense.trim() || !amount.trim() || !date.trim()) {
      setError("Expense, Amount, and Date are required.");
      return;
    }
    const payload = {
      expenseType,
      expense,
      amount: Number(amount),
      reference,
      date,
    };

    fetch(expenseApiUrl, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to create expense entry");
        return res.json();
      })
      .then(async () => {
        setMessage("Expense added successfully");
        // Update the corresponding budget plan for this expense category
        try {
          const budgetPayload = {
            budgetName: expense, // assuming budget 'name' is same as expense source/category
            amount: Number(amount),
          };
          const resBudget = await fetch(
            `${budgetApiUrl}/add-expense`,
            {
              method: "POST",
              headers: getAuthHeaders(),
              body: JSON.stringify(budgetPayload),
            }
          );
          if (!resBudget.ok) {
            console.error("Failed to update budget spending");
          }
        } catch (err) {
          console.error("Error updating budget spending:", err);
        }
        // Reset form fields
        setExpenseType("Monthly");
        setExpense("transportation");
        setAmount("");
        setReference("");
        setDate("");
        setTimeout(() => setMessage(""), 3000);
        getItems();
      })
      .catch(() => setError("Unable to create expense entry"));
  };

  // Delete an expense
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this?")) {
      fetch(`${expenseApiUrl}/${id}`, { method: "DELETE", headers: getAuthHeaders() })
        .then(() => {
          setMessage("Expense deleted successfully");
          setTimeout(() => setMessage(""), 3000);
          getItems();
        })
        .catch(() => setError("Unable to delete expense entry"));
    }
  };

  // Set editing state for an expense entry
  const handleEdit = (item) => {
    setEditId(item._id);
    setEditExpenseType(item.expenseType);
    setEditExpense(item.expense);
    setEditAmount(item.amount);
    setEditReference(item.reference);
    setEditDate(item.date.substring(0, 10));
  };

  // Update an expense entry
  const handleUpdate = () => {
    setError("");
    if (!editExpense.trim() || !editAmount.toString().trim() || !editDate.trim()) {
      setError("Expense, Amount, and Date are required.");
      return;
    }
    const payload = {
      expenseType: editExpenseType,
      expense: editExpense,
      amount: Number(editAmount),
      reference: editReference,
      date: editDate,
    };

    fetch(`${expenseApiUrl}/${editId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then(() => {
        setMessage("Expense updated successfully");
        setTimeout(() => setMessage(""), 3000);
        setEditId(null);
        getItems();
      })
      .catch(() => setError("Unable to update expense entry"));
  };

  // Calculate total expense amount
  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div>
      <Navigation />
      <div className={styles.container}>
        {/* Form Container */}
        <div className={styles.formContainer}>
          <h3>{editId ? "Edit Expense" : "Add Expense"}</h3>
          {message && <div className={styles.success_msg}>{message}</div>}
          <div className={styles.formGroup}>
            {/* Expense Type Dropdown */}
            {editId ? (
              <select
                value={editExpenseType}
                onChange={(e) => setEditExpenseType(e.target.value)}
                className={styles.formControl}
              >
                <option value="Monthly">Monthly</option>
                <option value="Daily">Daily</option>
              </select>
            ) : (
              <select
                value={expenseType}
                onChange={(e) => setExpenseType(e.target.value)}
                className={styles.formControl}
              >
                <option value="Monthly">Monthly</option>
                <option value="Daily">Daily</option>
              </select>
            )}

            {/* Expense Source Dropdown */}
            {editId ? (
              <select
                value={editExpense}
                onChange={(e) => setEditExpense(e.target.value)}
                className={styles.formControl}
              >
                <option value="transportation">transportation</option>
                <option value="entertainment">entertainment</option>
                <option value="utilities">utilities</option>
                <option value="shopping">shopping</option>
                <option value="groceries">groceries</option>
                <option value="other">other</option>
              </select>
            ) : (
              <select
                value={expense}
                onChange={(e) => setExpense(e.target.value)}
                className={styles.formControl}
              >
                <option value="transportation">transportation</option>
                <option value="entertainment">entertainment</option>
                <option value="utilities">utilities</option>
                <option value="shopping">shopping</option>
                <option value="groceries">groceries</option>
                <option value="other">other</option>
              </select>
            )}

            {editId ? (
              <input
                type="number"
                placeholder="Amount"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                className={styles.formControl}
              />
            ) : (
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={styles.formControl}
              />
            )}

            {editId ? (
              <input
                placeholder="Reference (optional)"
                value={editReference}
                onChange={(e) => setEditReference(e.target.value)}
                className={styles.formControl}
              />
            ) : (
              <input
                placeholder="Reference (optional)"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className={styles.formControl}
              />
            )}

            {editId ? (
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className={styles.formControl}
              />
            ) : (
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={styles.formControl}
              />
            )}

            {editId ? (
              <div className={styles.buttonGroup}>
                <button className={styles.btnSuccess} onClick={handleUpdate}>
                  Update
                </button>
                <button className={styles.btnSecondary} onClick={() => setEditId(null)}>
                  Cancel
                </button>
              </div>
            ) : (
              <button className={styles.btnDark} onClick={handleSubmit}>
                Submit
              </button>
            )}
          </div>
          {error && <div className={styles.error_msg}>{error}</div>}
        </div>

        {/* Expense Table */}
        <div className={styles.tableContainer}>
          <h3>Expense List</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Type</th>
                <th>Expense Source</th>
                <th>Amount</th>
                <th>Reference</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((item) => (
                <tr key={item._id}>
                  <td>{item.expenseType}</td>
                  <td>{item.expense}</td>
                  <td>₹{item.amount}</td>
                  <td>{item.reference || "N/A"}</td>
                  <td>{new Date(item.date).toLocaleDateString()}</td>
                  <td>
                    <button className={styles.btnWarning} onClick={() => handleEdit(item)}>
                      Edit
                    </button>
                    <button className={styles.btnDanger} onClick={() => handleDelete(item._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total Expense Display */}
        <div className={styles.totalExpense}>
          <h4>Total Expense: ₹{totalExpense.toFixed(2)}</h4>
        </div>
      </div>
    </div>
  );
}
