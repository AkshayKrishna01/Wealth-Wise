import { useEffect, useState } from "react";
import "./style.css"
import { Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    Tooltip,
    Legend,
    ArcElement
);

const PieChart=()=>{
    const [incomes, setIncomes] = useState([]);
    const [error, setError] = useState("");
    const [expenses, setExpenses] = useState([]);
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
      fetchExpenses()
    }, []);
    const apiUr = "http://localhost:8080/api/expense";
  
    // Helper to get auth headers (JWT from localStorage)
  
  
    // Fetch all expenses and graph data when component mounts
    
  
    // Fetch expenses from backend with auth headers
    const fetchExpenses = () => {
      fetch(apiUr, { method: "GET", headers: getAuthHeaders() })
        .then((res) => res.json())
        .then((data) => setExpenses(data))
        .catch(() => setError("Failed to fetch expenses"));
    };
  
    
    const getItems = () => {
      fetch(`${apiUrl}/income`, { method: "GET", headers: getAuthHeaders() })
        .then((res) => res.json())
        .then((res) => setIncomes(res))
        .catch(() => setError("Failed to fetch incomes"));
    };
    const totalIncome=incomes.reduce((sum, item) => sum + item.Amount, 0);
    const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
  
      const remainingBalance = totalIncome - totalExpense; 
  
 const PieChartData={
    labels:["Expense","Remaining"],
    datasets:[{
        label:"Money spent",
        data:[totalExpense,remainingBalance],
        backgroundColor:[
            "beige","black",
        ],
        hoverOffset:4,
    },]
}
    const options={}
    return<div className="piesize"><Pie options={options} data={PieChartData}/></div>
}
export default PieChart;