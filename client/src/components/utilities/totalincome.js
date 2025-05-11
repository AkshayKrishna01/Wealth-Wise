import { useEffect, useState } from "react";

const apiUrl = "http://localhost:8080";

// Helper to get the auth headers from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
};

// Custom hook to fetch incomes and calculate total
const useIncomeData = () => {
  const [incomes, setIncomes] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getItems();
  }, []);

  const getItems = () => {
    fetch(`${apiUrl}/income`, { method: "GET", headers: getAuthHeaders() })
      .then((res) => res.json())
      .then((res) => setIncomes(res))
      .catch(() => setError("Failed to fetch incomes"));
  };

  const calculateTotalIncome = () => {
    return incomes.reduce((sum, item) => sum + item.Amount, 0);
  };

  return { incomes, totalIncome: calculateTotalIncome(), error, getItems };
};
export default useIncomeData;