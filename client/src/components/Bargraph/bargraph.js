import { useState, useEffect } from "react";
import styles from "./style.module.css";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register necessary ChartJS components for a Bar chart
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function BudgetBarChart() {
  const [budgets, setBudgets] = useState([]);
  const [error, setError] = useState("");

  // API base URL
  const apiUrl = "http://localhost:8080/api";

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const res = await fetch(`${apiUrl}/budgetplan`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        throw new Error("Failed to fetch budget data");
      }
      const data = await res.json();
      setBudgets(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Define all possible budget categories (source names)
  const possibleCategories = [
    "transportation",
    "utilities",
    "entertainment",
    "shopping",
    "groceries",
    "other",
  ];

  // Always show these as x-axis labels
  const labels = possibleCategories;

  // Helper function to determine bar color based on spent and total
  const getBarColor = (spent, total) => {
    if (spent < total) return "#28a745"; // Green for under budget
    if (spent === total) return "#ffc107"; // Yellow for equal to budget
    return "#dc3545"; // Red for exceeded budget
  };

  // Build the spentData array for each category
  const spentData = possibleCategories.map((category) => {
    const budget = budgets.find(
      (b) => b.name.toLowerCase() === category.toLowerCase()
    );
    return budget ? budget.spent : 0;
  });

  // Build the remainingData array.
  // If remaining (total - spent) is negative, show the overspent amount as a positive number.
  const remainingData = possibleCategories.map((category) => {
    const budget = budgets.find(
      (b) => b.name.toLowerCase() === category.toLowerCase()
    );
    if (!budget) return 0;
    const rem = budget.total - budget.spent;
    return rem < 0 ? Math.abs(rem) : rem;
  });

  // Dynamically set bar colors based on spent and total for each category
  // For the "Spent" dataset, use the getBarColor function.
  const spentBarColors = possibleCategories.map((category) => {
    const budget = budgets.find(
      (b) => b.name.toLowerCase() === category.toLowerCase()
    );
    return budget ? getBarColor(budget.spent, budget.total) : "#28a745"; // Default to green if no budget
  });

  // For the "Remaining Budget" dataset, if overspent, show red; otherwise, show gray.
  const remainingBarColors = possibleCategories.map((category) => {
    const budget = budgets.find(
      (b) => b.name.toLowerCase() === category.toLowerCase()
    );
    if (budget) {
      return budget.spent > budget.total ? "#dc3545" : "#6c757d";
    }
    return "#6c757d";
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: "Spent",
        data: spentData,
        backgroundColor: spentBarColors, // Dynamic colors for spent bars
        borderColor: spentBarColors.map((color) => `${color}80`), // Slightly transparent border
        borderWidth: 1,
        stack: "stack1",
      },
      {
        label: "Remaining Budget",
        data: remainingData,
        backgroundColor: remainingBarColors, // Red if overspent, otherwise gray
        borderColor: remainingBarColors.map((color) => `${color}80`),
        borderWidth: 1,
        stack: "stack1",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // allow custom height
    plugins: {
      title: {
        display: true,
        text: "Budget vs Spending Chart",
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || "";
            const value = context.raw || 0;
            const category = labels[context.dataIndex];
            const budget = budgets.find(
              (b) => b.name.toLowerCase() === category.toLowerCase()
            );
            if (label === "Spent") {
              if (budget) {
                if (budget.spent < budget.total) {
                  return `${label}: ₹${value} (Under Budget)`;
                } else if (budget.spent === budget.total) {
                  return `${label}: ₹${value} (Budget Fully Spent)`;
                } else {
                  return `${label}: ₹${value} (Budget Exceeded)`;
                }
              }
            }
            if (label === "Remaining Budget") {
              if (budget && budget.spent > budget.total) {
                return `Overspent: ₹${Math.abs(budget.spent - budget.total)}`;
              }
            }
            return `${label}: ₹${value}`;
          },
        },
      },
      legend: {
        position: "top",
        labels: {
          generateLabels: (chart) => {
            return [
              {
                text: "Under Budget (Green)",
                fillStyle: "#28a745",
                strokeStyle: "#28a745",
                hidden: false,
              },
              {
                text: "Budget Fully Spent (Yellow)",
                fillStyle: "#ffc107",
                strokeStyle: "#ffc107",
                hidden: false,
              },
              {
                text: "Budget Exceeded (Red)",
                fillStyle: "#dc3545",
                strokeStyle: "#dc3545",
                hidden: false,
              },
              {
                text: "Remaining Budget (Gray)",
                fillStyle: "#6c757d",
                strokeStyle: "#6c757d",
                hidden: false,
              },
            ];
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        stacked: true,
      },
      x: {
        stacked: true,
      },
    },
  };

  return (
    <div className={styles.chartContainer}>
      {error && <p className={styles.error_msg}>{error}</p>}
      {/* Wrap the Bar chart in a div with a fixed height */}
      <div style={{ height: "400px" }}>
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
