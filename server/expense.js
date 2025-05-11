const express = require("express");
const mongoose = require("mongoose");
const authenticateUser = require("./middleware/authMiddleware"); // Your auth middleware

const router = express.Router();

const ExpenseSchema = new mongoose.Schema({
  expenseType: { 
    type: String, 
    enum: ["Monthly", "Daily"], 
    required: true 
  },
  expense: { 
    type: String, 
    enum: ["transportation", "entertainment", "utilities", "shopping", "groceries", "other"],
    required: true 
  },
  amount: { type: Number, required: true },
  reference: { type: String },
  date: { type: Date, required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

const ExpenseModel = mongoose.model("Expense", ExpenseSchema);

router.post("/expense", authenticateUser, async (req, res) => {
  const { expenseType, expense, amount, reference, date } = req.body;
  const userId = req.user._id;

  try {
    const newExpense = new ExpenseModel({ expenseType, expense, amount, reference, date, user_id: userId });
    await newExpense.save();
    res.status(201).json(newExpense);
  } catch (error) {
    console.error("Error adding expense:", error);
    res.status(500).json({ message: "Failed to add expense", error: error.message });
  }
});

router.get("/expense", authenticateUser, async (req, res) => {
  const userId = req.user._id;
  try {
    const expenses = await ExpenseModel.find({ user_id: userId }).sort({ date: 1 });
    res.json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ message: "Failed to retrieve expenses", error: error.message });
  }
});

router.put("/expense/:id", authenticateUser, async (req, res) => {
  const { expenseType, expense, amount, reference, date } = req.body;
  const { id } = req.params;
  const userId = req.user._id;

  try {
    const updatedExpense = await ExpenseModel.findOneAndUpdate(
      { _id: id, user_id: userId },
      { expenseType, expense, amount, reference, date },
      { new: true }
    );
    if (!updatedExpense) {
      return res.status(404).json({ message: "Expense not found or not authorized" });
    }
    res.json(updatedExpense);
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({ message: "Failed to update expense", error: error.message });
  }
});

router.delete("/expense/:id", authenticateUser, async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  try {
    const deletedExpense = await ExpenseModel.findOneAndDelete({ _id: id, user_id: userId });
    if (!deletedExpense) {
      return res.status(404).json({ message: "Expense not found or not authorized" });
    }
    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ message: "Failed to delete expense", error: error.message });
  }
});

router.get("/expense/graph/daily", authenticateUser, async (req, res) => { 
  const userId = req.user._id;
  try {
    const dailyData = await ExpenseModel.aggregate([
      { 
        $match: { 
          expenseType: "Daily", 
          user_id: new mongoose.Types.ObjectId(userId)
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          totalAmount: { $sum: "$amount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json(dailyData);
  } catch (error) {
    console.error("Error aggregating daily expense data:", error);
    res.status(500).json({ message: "Failed to fetch daily expense data", error: error.message });
  }
});

module.exports = router;
