import { useEffect, useState } from "react";
import Navigation from "../NavBar";
import styles from "./in.module.css"; // CSS Module import
import Line from "../Linegraph/Line";

export default function Income() {
  const [incomeSource, setIncomeSource] = useState("Salary"); // Default to Salary
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [incomes, setIncomes] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editId, setEditId] = useState(null);
  const [editIncomeSource, setEditIncomeSource] = useState("Salary");
  const [editAmount, setEditAmount] = useState("");
  const [editReference, setEditReference] = useState("");

  const apiUrl = "http://localhost:8080";

  // Helper to get the auth headers from localStorage
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    };
  };

  useEffect(() => {
    getItems();
  }, []);

  const getItems = () => {
    fetch(`${apiUrl}/income`, { method: "GET", headers: getAuthHeaders() })
      .then((res) => res.json())
      .then((res) => setIncomes(res))
      .catch(() => setError("Failed to fetch incomes"));
  };

  const handleSubmit = () => {
    setError("");

    if (!incomeSource.trim() || !amount.trim()) {
      setError("Income Source and Amount are required.");
      return;
    }

    fetch(`${apiUrl}/income`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        IncomeSource: incomeSource,
        Amount: Number(amount),
        reference,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        setMessage("Income added successfully");
        setIncomeSource("Salary");
        setAmount("");
        setReference("");
        setTimeout(() => setMessage(""), 3000);
        getItems(); // Refresh list
      })
      .catch(() => setError("Unable to create income entry"));
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this?")) {
      fetch(`${apiUrl}/income/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })
        .then(() => {
          setMessage("Income deleted successfully");
          setTimeout(() => setMessage(""), 3000);
          getItems(); // Refresh list
        })
        .catch(() => setError("Unable to delete income entry"));
    }
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setEditIncomeSource(item.IncomeSource);
    setEditAmount(item.Amount);
    setEditReference(item.reference);
  };

  const handleUpdate = () => {
    setError("");

    if (!editIncomeSource.trim() || !editAmount.toString().trim()) {
      setError("Income Source and Amount are required.");
      return;
    }

    fetch(`${apiUrl}/income/${editId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        IncomeSource: editIncomeSource,
        Amount: Number(editAmount),
        reference: editReference,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        setMessage("Income updated successfully");
        setTimeout(() => setMessage(""), 3000);
        setEditId(null);
        getItems(); // Refresh list
      })
      .catch(() => setError("Unable to update income entry"));
  };

  // Calculate Total Income
  const totalIncome = incomes.reduce((sum, item) => sum + item.Amount, 0);

  return (
    <div>
      <Navigation />
      <div className={styles.container}>
        <div className={styles.formContainer}>
          <h3>{editId ? "Edit Income" : "Add Income"}</h3>
          {message && <div className={styles.success_msg}>{message}</div>}
          <div className={styles.formGroup}>
            <select
              value={editId ? editIncomeSource : incomeSource}
              onChange={(e) =>
                editId ? setEditIncomeSource(e.target.value) : setIncomeSource(e.target.value)
              }
              className={styles.formControl}
            >
              <option value="Salary">Salary</option>
              <option value="Freelance">Freelance</option>
              <option value="Business">Business</option>
              <option value="Investments">Investments</option>
              <option value="Other">Other</option>
            </select>
            <input
              type="number"
              placeholder="Amount"
              value={editId ? editAmount : amount}
              onChange={(e) => (editId ? setEditAmount(e.target.value) : setAmount(e.target.value))}
              className={styles.formControl}
            />
            <input
              placeholder="Reference (optional)"
              value={editId ? editReference : reference}
              onChange={(e) =>
                editId ? setEditReference(e.target.value) : setReference(e.target.value)
              }
              className={styles.formControl}
            />
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

        <div className={styles.tableContainer}>
          <h3>Income List</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Income Source</th>
                <th>Amount (₹)</th>
                <th>Reference</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {incomes.map((item) => (
                <tr key={item._id}>
                  <td>{item.IncomeSource}</td>
                  <td>₹{item.Amount}</td>
                  <td>{item.reference || "N/A"}</td>
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

        <div className={styles.totalIncome}>
          <h4>Total Income: ₹{totalIncome.toFixed(2)}</h4>
        </div>
      </div>
    </div>
  );
}
