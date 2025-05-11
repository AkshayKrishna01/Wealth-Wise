import { Route, Routes, Navigate } from "react-router-dom";
import DashBoard from "./components/DashBoard/index";
import Signup from "./components/Signup/index";
import Login from "./components/Login/index";
import Income from "./components/Income/index"
import Expense from "./components/Expense/index"
import Budgetplan from "./components/Budgetplan/index"
import Home from "./components/Home/Homepage"
function App() {
	const user = localStorage.getItem("token");

	return (
<Routes>
			{user && <Route path="/" exact element={<Home />} />}
			<Route path="/dashboard" exact element={<DashBoard />} />

			<Route path="/signup" exact element={<Signup />} />
			<Route path="/login" exact element={<Login />} />
			<Route path="/Income" exact element={<Income />} />
			<Route path="/Expenses" exact element={<Expense/>} />
			<Route path="/Budgetplan" exact element={<Budgetplan/>} />		
			<Route path="/" element={<Navigate replace to="/login" />} />
		</Routes>
	);
}


export default App;
