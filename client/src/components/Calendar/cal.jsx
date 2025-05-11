import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./Calendar.module.css"; // Make sure this file exists and has your styles

const CalendarApp = () => {
  const [visitedDates, setVisitedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];
  const currentDate = new Date(today);
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Helper: returns the auth headers for API requests
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  useEffect(() => {
    const fetchVisitedDates = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/visited-dates", {
          headers: getAuthHeaders(), // call the function to get headers
        });
        // Assuming each visit object has a 'date' field
        setVisitedDates(res.data.map((visit) => visit.date));
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch visited dates.");
        console.error(err);
        setLoading(false);
      }
    };

    const saveVisit = async () => {
      try {
        await axios.post(
          "http://localhost:8080/api/visit",
          { date: today },
          {
            headers: getAuthHeaders(),
          }
        );
      } catch (err) {
        console.error("Error saving visit:", err);
      }
    };

    // Save today’s visit and then fetch visited dates
    saveVisit();
    fetchVisitedDates();
  }, [today]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={styles.calendarContainer}>
      <h1 className={styles.header}>Days Logged</h1>
      <div className={styles.dateHeader}>
        <h2>{today}</h2>
      </div>
      <div className={styles.calendar}>
        {Array.from({ length: daysInMonth }, (_, index) => {
          const day = index + 1;
          const date = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isToday = date === today;
          const isVisited = visitedDates.includes(date);

          return (
            <div
              key={date}
              className={`${styles.day} ${isToday ? styles.today : ""} ${isVisited ? styles.visited : ""}`}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarApp;
