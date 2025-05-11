import { NavLink, useNavigate } from "react-router-dom";
import styles from "./styles.module.css";

const Navigation = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    console.log(localStorage.getItem("token"));
    localStorage.removeItem("token");
    navigate('/signup')
};


  return (
    <div className={styles.nav_links_container}>
      <nav className={styles.navbar}>
        <h1 className={styles.nav_logo}>WealthWise</h1>
        <div className={styles.nav_links_container}>
          <div className={styles.nav_links}>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? `${styles.nav_link} ${styles.active}` : styles.nav_link
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive ? `${styles.nav_link} ${styles.active}` : styles.nav_link
              }
            >
              DashBoard
            </NavLink>
            <NavLink
              to="/Income"
              className={({ isActive }) =>
                isActive ? `${styles.nav_link} ${styles.active}` : styles.nav_link
              }
            >
              Income
            </NavLink>
            <NavLink
              to="/Expenses"
              className={({ isActive }) =>
                isActive ? `${styles.nav_link} ${styles.active}` : styles.nav_link
              }
            >
              Expenses
            </NavLink>
            <NavLink
              to="/Budgetplan"
              className={({ isActive }) =>
                isActive ? `${styles.nav_link} ${styles.active}` : styles.nav_link
              }
            >
              BudgetPlan
            </NavLink>
          </div>
          <div className="login-bar">
            <p className={styles.logoutBar}>|</p>
          </div>
          <button className={styles.white_btn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Navigation;
