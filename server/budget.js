const express = require("express");
const mongoose = require("mongoose");
const authenticateUser = require("./middleware/authMiddleware"); // Your auth middleware

const router = express.Router();

const BudgetPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  total: { type: Number, required: true },
  spent: { type: Number, required: true, default: 0 },
  items: { type: Number, required: true, default: 0 },
  icon: { type: String, default: "💰" },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

const BudgetPlan = mongoose.model("BudgetPlan", BudgetPlanSchema);

router.post("/budgetplan", authenticateUser, async (req, res) => {
  const { name, total, spent, items, icon } = req.body;
  const userId = req.user._id;

  try {
    const newBudgetPlan = new BudgetPlan({
      name,
      total,
      spent,
      items,
      icon,
      user_id: userId,
    });
    await newBudgetPlan.save();
    res.status(201).json(newBudgetPlan);
  } catch (error) {
    console.error("Error creating budget plan:", error);
    res.status(500).json({ message: "Failed to create budget plan", error: error.message });
  }
});

router.get("/budgetplan", authenticateUser, async (req, res) => {
  const userId = req.user._id;
  try {
    const budgetPlans = await BudgetPlan.find({ user_id: userId }).lean();
    res.json(budgetPlans);
  } catch (error) {
    console.error("Error fetching budget plans:", error);
    res.status(500).json({ message: "Failed to retrieve budget plans", error: error.message });
  }
});

router.put("/budgetplan/:id", authenticateUser, async (req, res) => {
  const { name, total, spent, items, icon } = req.body;
  const { id } = req.params;
  const userId = req.user._id;

  try {
    const updatedBudget = await BudgetPlan.findOneAndUpdate(
      { _id: id, user_id: userId },
      { name, total, spent, items, icon },
      { new: true }
    );
    if (!updatedBudget) {
      return res.status(404).json({ message: "Budget plan not found or not authorized" });
    }
    res.json(updatedBudget);
  } catch (error) {
    console.error("Error updating budget plan:", error);
    res.status(500).json({ message: "Failed to update budget plan", error: error.message });
  }
});

router.delete("/budgetplan/:id", authenticateUser, async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  try {
    const deletedBudget = await BudgetPlan.findOneAndDelete({ _id: id, user_id: userId });
    if (!deletedBudget) {
      return res.status(404).json({ message: "Budget plan not found or not authorized" });
    }
    res.json({ message: "Budget plan deleted successfully" });
  } catch (error) {
    console.error("Error deleting budget plan:", error);
    res.status(500).json({ message: "Failed to delete budget plan", error: error.message });
  }
});

router.post("/budgetplan/add-expense", authenticateUser, async (req, res) => {
  const { budgetName, amount } = req.body;
  const userId = req.user._id;

  try {
    const budgetPlan = await BudgetPlan.findOne({ name: budgetName, user_id: userId });
    if (!budgetPlan) {
      return res.status(404).json({ message: "Budget plan not found" });
    }

    budgetPlan.spent += Number(amount);
    budgetPlan.items += 1;
    await budgetPlan.save();

    res.json({ message: "Budget updated successfully", budget: budgetPlan });
  } catch (error) {
    console.error("Error updating budget with expense:", error);
    res.status(500).json({ message: "Failed to update budget", error: error.message });
  }
});

module.exports = router;
