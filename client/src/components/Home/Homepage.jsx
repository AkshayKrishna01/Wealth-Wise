import React from "react";
import { Link } from "react-router-dom";
import styles from "./home.module.css"; // Import your CSS module

import Navigation from "../NavBar";
import Footer from "../footer";

const ExpenseTrackerHome = () => {
  return (
    <>
      <Navigation />
      <div className={styles.home}>
        <div className={styles["home-page"]}>
          <header className={styles.hero}>
            <div className={styles["hero-content"]}>
              <h1>Welcome to WealthWise</h1>
              <p>
                Track your expenses, manage your budgets, and stay in control of your spending!
              </p>
              <Link to="/dashboard" className={styles["explore-btn"]}>
                 Start The Journey
              </Link>
            </div>
          </header>

          <section className={styles.intro}>
            <h2>Our Features</h2>
            <div className={styles.features}>
              <Link to="/Expenses" className={styles.featureLink}>
                <div className={styles.feature}>
                  <h3>Add Expenses</h3>
                  <p>
                    Quickly record your daily expenses with an intuitive interface.
                  </p>
                </div>
              </Link>
              <Link to="/Budgetplan" className={styles.featureLink}>
                <div className={styles.feature}>
                  <h3>Budget Management</h3>
                  <p>
                    Set budgets and receive alerts when spending nears or exceeds limits.
                  </p>
                </div>
              </Link>
              <Link to="/dashboard" className={styles.featureLink}>
                <div className={styles.feature}>
                  <h3>DashBoard</h3>
                  <p>
                    Visualize your spending patterns with detailed charts and reports.
                  </p>
                </div>
              </Link>
            </div>
          </section>
        </div>
      </div>
      <div className="footer">        <Footer /></div>
    </>
  );
};

export default ExpenseTrackerHome;
