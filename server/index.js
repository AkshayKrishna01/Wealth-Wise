const express = require("express");
const app = express();
const cors = require("cors");
const connection = require("./db").default;
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const incomeRoutes = require("./income");
const expenseRoutes = require("./expense");
const budgetRoute=require("./budget");

app.use(express.json());
app.use(cors());
require("dotenv").config();


app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

app.use("/", incomeRoutes);
app.use("/api",expenseRoutes);
app.use("/api",budgetRoute);
app.post("/logout", (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: true,  // Ensure it's only sent over HTTPS
        sameSite: "None"
    });
    return res.status(200).json({ message: "Logged out successfully" });
});

const port = 8080;
app.listen(port, console.log(`Listening on port ${port}...`),connection());

