import { useEffect, useState } from "react";
import styles from "./styles.module.css";
import Footer from "../footer/index";
import Pie from "../piechart/Pie";
import Line from "../Linegraph/Line";
import Navigation from "../NavBar/index";
import Bar from "../Bargraph/bargraph";

const Main = () => {
  const [incomes, setIncomes] = useState([]);
  const [error, setError] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [selectedBudget, setSelectedBudget] = useState(null); // State to track selected budget

  // Updated base API URL with /api prefix
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
    fetchExpenses();
    fetchBudgets();
  }, []);

  // Fetch all budget plans for the authenticated user
  const fetchBudgets = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/budgetplan`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to fetch budget plans");
      const data = await res.json();
      setBudgets(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch expenses from backend with auth headers
  const fetchExpenses = () => {
    fetch(`${apiUrl}/api/expense`, { method: "GET", headers: getAuthHeaders() })
      .then((res) => res.json())
      .then((data) => setExpenses(data))
      .catch(() => setError("Failed to fetch expenses"));
  };

  // Fetch incomes for the authenticated user
  const getItems = () => {
    fetch(`${apiUrl}/income`, { method: "GET", headers: getAuthHeaders() })
      .then((res) => res.json())
      .then((data) => setIncomes(data))
      .catch(() => setError("Failed to fetch incomes"));
  };

  const totalIncome = incomes.reduce((sum, item) => sum + item.Amount, 0);
  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
  const remainingBalance = totalIncome - totalExpense;

  // Filter expenses based on the selected budget
  const filteredExpenses = selectedBudget
    ? expenses.filter((expense) => expense.expense === selectedBudget.name)
    : [];

  // Helper function to determine progress bar color
  const getProgressBarColor = (spent, total) => {
    if (spent < total) return "#28a745"; // Green for under budget
    if (spent === total) return "#ffc107"; // Yellow for equal to budget
    return "#dc3545"; // Red for exceeded budget
  };

  return (
    <div>
      <Navigation />
      <div className={styles.main_container}>
        {/* Dashboard Header */}
        <header className={styles.dashboardHeader}>
          <h1>Dashboard</h1>
          <p>An overview of your financial status</p>
        </header>

        {/* Overview Section */}
        <section className={styles.overview}>
          <div className={styles.summaryCard}>
            <h2>Total Income</h2>
            <p className={styles.num}>₹{totalIncome}</p>
          </div>
          <div className={styles.summaryCard}>
            <h2>Total Expense</h2>
            <p className={styles.num2}>₹{totalExpense}</p>
          </div>
          <div className={styles.summaryCard}>
            <h2>Remaining Balance</h2>
            <p className={styles.num3}>₹{remainingBalance}</p>
          </div>
        </section>

        {/* Charts Section */}
        <section className={styles.chartsSection}>
          <div className={styles.pie}>
            <h2>Expense Distribution</h2>
            <Pie />
          </div>

          <div className={styles.chartWrapper}>
            <h2>Budget Breakdown</h2>
            <Bar />
          </div>
        </section>
      </div>
      <div className={styles.chartWrapper}>
        <h2>Income vs Expense Trend</h2>
        <Line />
      </div>

      {/* Budget Plans Section */}
      <div className={styles.showBudget}>
        <h2>My Budget Plans</h2>
        {error && <div className={styles.error_msg}>{error}</div>}
        <div className={styles.budgetGrid}>
          {budgets.map((plan) => (
            <div
              key={plan._id}
              className={styles.budgetCard}
              onClick={() => setSelectedBudget(plan)}
            >
              <div className={styles.budgetHeader}>
                <span className={styles.icon}>{plan.icon}</span>
                <span className={styles.budgetTitle}>{plan.name}</span>
                <span className={styles.amount}>₹{plan.total}</span>
              </div>
              <p>{plan.items} Item(s)</p>
              <div className={styles.progressBar}>
                <div
                  className={styles.progress}
                  style={{
                    width: plan.total > 0 ? `${(plan.spent / plan.total) * 100}%` : "0%",
                    backgroundColor: getProgressBarColor(plan.spent, plan.total), // Dynamic color
                  }}
                ></div>
              </div>
              <p className={styles.budgetInfo}>
                ₹{plan.spent} Spent | ₹{plan.total - plan.spent} Remaining
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Display Filtered Expenses */}
      {selectedBudget && (
        <div className={styles.container}>
          <h2>Expenses for {selectedBudget.name}</h2>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Expense Source</th>
                  <th>Amount</th>
                  <th>Reference</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr key={expense._id}>
                    <td>{expense.expenseType}</td>
                    <td>{expense.expense}</td>
                    <td>₹{expense.amount}</td>
                    <td>{expense.reference || "N/A"}</td>
                    <td>{new Date(expense.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className={styles.foot}>
        <Footer />
      </div>
    </div>
  );
};

export default Main;