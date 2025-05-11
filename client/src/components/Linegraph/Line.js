import { useState, useEffect } from "react"; 
import styles from "./style.module.css";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Daily() {
  const [graphData, setGraphData] = useState([]);
  const [error, setError] = useState("");

  // API base URL
  const apiUrl = "http://localhost:8080/api";

  // Helper to attach auth header (if token is required)
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    };
  };

  // Fetch aggregated daily expense data when the component mounts
  useEffect(() => {
    fetchGraphData();
  }, []);

  const fetchGraphData = async () => {
    try {
      const res = await fetch(`${apiUrl}/expense/graph/daily`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        throw new Error("Failed to fetch aggregated daily expense data");
      }
      const data = await res.json();
      console.log("Aggregated daily data:", data);
      setGraphData(data);
    } catch (err) {
      console.error("Error fetching aggregated daily data:", err);
      setError(err.message || "Failed to fetch aggregated daily expense data");
    }
  };

  // Compute the current week's dates (Monday to Sunday) in ISO format (yyyy-mm-dd)
  const getCurrentWeekDates = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Sun) ... 6 (Sat)
    // For calculation, treat Sunday as 7 so Monday is calculated correctly.
    const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - offset);

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(monday);
      currentDate.setDate(monday.getDate() + i);
      weekDates.push(currentDate.toISOString().split("T")[0]);
    }
    return weekDates;
  };

  // Generate week labels and data for the graph using the aggregated data
  const getWeekData = () => {
    const weekDates = getCurrentWeekDates();

    // For each date, look for a matching entry in graphData; if none, use 0.
    const weekData = weekDates.map(dateStr => {
      const entry = graphData.find(item => item._id === dateStr);
      return entry ? entry.totalAmount : 0;
    });

    // Format labels as "Day(dd|mm|yyyy)"
    const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const weekLabels = weekDates.map((dateStr, index) => {
      const d = new Date(dateStr);
      const day = d.getDate();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${dayNames[index]}(${day}|${month}|${year})`;
    });

    return { weekLabels, weekData };
  };

  const { weekLabels, weekData } = getWeekData();

  const chartData = {
    labels: weekLabels,
    datasets: [{
      label: "Weekly Spending",
      data: weekData,
      borderColor: "black",
      backgroundColor: "yellow",
      tension: 0.1,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allow custom height
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Daily Expense Graph" },
    },
  };

  return (
    <div className={styles.line}>
      {error && <p>{error}</p>}
      {/* Wrap the Line chart in a div with a fixed height */}
      <div style={{ height: "400px" }}>
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
