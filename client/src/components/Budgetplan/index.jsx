import React, { useState, useEffect } from "react";
import styles from "./styles.module.css";
import Navigation from "../NavBar";

const BudgetPlan = () => {
  const [budgets, setBudgets] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Form state for creating a new budget plan
  const [name, setName] = useState("transportation"); // Default to "transportation"
  const [total, setTotal] = useState("");
  const [spent, setSpent] = useState(0); // Initialize to 0
  const [items, setItems] = useState(0); // Initialize to 0
  const [icon, setIcon] = useState("💰"); // Default icon

  // State for icon picker
  const [showIconPicker, setShowIconPicker] = useState(false);
  const icons = ["💰", "🚗", "🍽️", "🏠", "🛒", "💡", "🎉", "📚", "✈️", "🎵"];

  // Editing state
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editTotal, setEditTotal] = useState("");
  const [editSpent, setEditSpent] = useState("");
  const [editItems, setEditItems] = useState("");
  const [editIcon, setEditIcon] = useState("");

  const apiUrl = "http://localhost:8080/api";

  // Helper to get auth headers from localStorage token
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    };
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  // Fetch all budget plans
  const fetchBudgets = async () => {
    try {
      const res = await fetch(`${apiUrl}/budgetplan`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to fetch budget plans");
      const data = await res.json();
      setBudgets(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch expenses for a specific category and calculate spent and items
  const fetchExpensesForCategory = async (category) => {
    try {
      const res = await fetch(`${apiUrl}/expense`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to fetch expenses");
      const expenses = await res.json();
      const matchingExpenses = expenses.filter((exp) => exp.expense === category);
      const totalSpent = matchingExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const totalItems = matchingExpenses.length;
      return { totalSpent, totalItems };
    } catch (err) {
      console.error("Failed to fetch expenses:", err.message);
      return { totalSpent: 0, totalItems: 0 };
    }
  };

  // Handle form submission for creating a new budget plan
  const handleSubmit = async () => {
    if (!name || !total) {
      setError("Name and Total are required");
      return;
    }
    try {
      // Fetch expenses for the selected category
      const { totalSpent, totalItems } = await fetchExpensesForCategory(name);

      // Create the budget plan
      const res = await fetch(`${apiUrl}/budgetplan`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name,
          total: Number(total),
          spent: totalSpent,
          items: totalItems,
          icon: icon || "💰",
        }),
      });
      if (!res.ok) throw new Error("Failed to create budget plan");
      setMessage("Budget plan created successfully!");
      // Clear form fields
      setName("transportation");
      setTotal("");
      setSpent(0);
      setItems(0);
      setIcon("💰");
      fetchBudgets();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle deletion of a budget plan
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this budget plan?")) {
      try {
        const res = await fetch(`${apiUrl}/budgetplan/${id}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error("Failed to delete budget plan");
        setMessage("Budget plan deleted successfully");
        fetchBudgets();
        setTimeout(() => setMessage(""), 3000);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  // Handle editing a budget plan
  const handleEdit = (plan) => {
    setEditId(plan._id);
    setEditName(plan.name);
    setEditTotal(plan.total);
    setEditSpent(plan.spent);
    setEditItems(plan.items);
    setEditIcon(plan.icon);
  };

  // Handle updating a budget plan
  const handleUpdate = async () => {
    if (!editName || !editTotal) {
      setError("Name and Total are required");
      return;
    }
    try {
      const res = await fetch(`${apiUrl}/budgetplan/${editId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: editName,
          total: Number(editTotal),
          spent: Number(editSpent) || 0,
          items: Number(editItems) || 0,
          icon: editIcon || "💰",
        }),
      });
      if (!res.ok) throw new Error("Failed to update budget plan");
      setMessage("Budget plan updated successfully");
      setEditId(null);
      fetchBudgets();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // Helper function to determine progress bar color
  const getProgressBarColor = (spent, total) => {
    if (spent < total) return styles.progressUnder; // Green
    if (spent === total) return styles.progressEqual; // Yellow
    return styles.progressExceeded; // Red
  };

  return (
    <>
      <Navigation />
      <div className={styles.container}>
        <h2>My Budget Plans</h2>
        {/* Form for Create / Edit */}
        <div className={styles.formContainer}>
          <h3>{editId ? "Edit Budget Plan" : "Create New Budget Plan"}</h3>
          {error && <div className={styles.error_msg}>{error}</div>}
          {message && <div className={styles.success_msg}>{message}</div>}
          <div className={styles.formGroup}>
            {editId ? (
              <select
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className={styles.formControl}
              >
                <option value="transportation">Transportation</option>
                <option value="utilities">Utilities</option>
                <option value="entertainment">Entertainment</option>
                <option value="shopping">Shopping</option>
                <option value="groceries">Groceries</option>
                <option value="other">Other</option>
              </select>
            ) : (
              <select
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.formControl}
              >
                <option value="transportation">Transportation</option>
                <option value="utilities">Utilities</option>
                <option value="entertainment">Entertainment</option>
                <option value="shopping">Shopping</option>
                <option value="groceries">Groceries</option>
                <option value="other">Other</option>
              </select>
            )}

            {/* Icon Picker */}
            <div className={styles.iconPickerWrapper}>
              <input
                type="text"
                placeholder="Select Icon"
                value={editId ? editIcon : icon}
                readOnly
                className={styles.formControl}
                onClick={() => setShowIconPicker(true)}
              />
              {showIconPicker && (
                <div className={styles.iconPicker}>
                  {icons.map((ic) => (
                    <span
                      key={ic}
                      className={styles.iconOption}
                      onClick={() => {
                        if (editId) {
                          setEditIcon(ic);
                        } else {
                          setIcon(ic);
                        }
                        setShowIconPicker(false);
                      }}
                    >
                      {ic}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {editId ? (
              <input
                type="number"
                placeholder="Total Amount"
                value={editTotal}
                onChange={(e) => setEditTotal(e.target.value)}
                className={styles.formControl}
              />
            ) : (
              <input
                type="number"
                placeholder="Total Amount"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                className={styles.formControl}
              />
            )}
          </div>
          {editId ? (
            <div className={styles.buttonGroup}>
              <button className={styles.btnSuccess} onClick={handleUpdate}>
                Update Plan
              </button>
              <button className={styles.btnSecondary} onClick={() => setEditId(null)}>
                Cancel
              </button>
            </div>
          ) : (
            <button className={styles.btnDark} onClick={handleSubmit}>
              Create New Plan
            </button>
          )}
        </div>

        {/* Budget Grid */}
        <div className={styles.budgetGrid}>
          {budgets.map((plan) => (
            <div key={plan._id} className={styles.budgetCard}>
              <div className={styles.budgetHeader}>
                <span className={styles.icon}>{plan.icon}</span>
                <span className={styles.budgetTitle}>{plan.name}</span>
                <span className={styles.amount}>₹{plan.total}</span>
              </div>
              <p>{plan.items} Item(s)</p>
              <div className={styles.progressBar}>
                <div
                  className={`${styles.progress} ${getProgressBarColor(plan.spent, plan.total)}`}
                  style={{
                    width: plan.total > 0 ? `${(plan.spent / plan.total) * 100}%` : "0%",
                  }}
                ></div>
              </div>
              <p className={styles.budgetInfo}>
                ₹{plan.spent} Spent | ₹{plan.total - plan.spent} Remaining
              </p>
              <div className={styles.cardButtons}>
                <button className={styles.btnWarning} onClick={() => handleEdit(plan)}>
                  Edit
                </button>
                <button className={styles.btnDanger} onClick={() => handleDelete(plan._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default BudgetPlan;