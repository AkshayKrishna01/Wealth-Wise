import { useState, useEffect } from "react";

const useExpenseData = () => {
  const [expenses, setExpenses] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const apiUrl = "http://localhost:8080/api/expense";

  // Helper to get auth headers (JWT from localStorage)
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    };
  };

  // Fetch expenses from backend
  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = () => {
    fetch(apiUrl, { method: "GET", headers: getAuthHeaders() })
      .then((res) => res.json())
      .then((data) => {
        setExpenses(data);
        const total = data.reduce((sum, item) => sum + item.amount, 0);
        setTotalExpense(total);
      })
      .catch((error) => console.error("Failed to fetch expenses:", error));
  };

  return { totalExpense, expenses, fetchExpenses };
};

export default useExpenseData;
