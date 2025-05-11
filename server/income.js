const express = require("express");
const mongoose = require("mongoose");
const authenticateUser = require("./middleware/authMiddleware"); // Import your auth middleware

const router = express.Router();

const IncomeSchema = new mongoose.Schema({
  IncomeSource: { type: String, required: true },
  Amount: { type: Number, required: true },
  reference: { type: String },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // New field
});

const IncomeModel = mongoose.model("Income", IncomeSchema);

router.post("/income", authenticateUser, async (req, res) => {
  const { IncomeSource, Amount, reference } = req.body;
  const userId = req.user._id; 
  try {
    const newIncome = new IncomeModel({ IncomeSource, Amount, reference, user_id: userId });
    await newIncome.save();
    res.status(201).json(newIncome);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/income", authenticateUser, async (req, res) => {
  const userId = req.user._id;
  try {
    const incomes = await IncomeModel.find({ user_id: userId });
    res.json(incomes);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.put("/income/:id", authenticateUser, async (req, res) => {
  const { IncomeSource, Amount, reference } = req.body;
  const id = req.params.id;
  const userId = req.user._id;

  try {
    const updatedIncome = await IncomeModel.findOneAndUpdate(
      { _id: id, user_id: userId },
      { IncomeSource, Amount, reference },
      { new: true }
    );

    if (!updatedIncome) {
      return res.status(404).json({ message: "Income entry not found or not authorized" });
    }
    res.json(updatedIncome);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.delete("/income/:id", authenticateUser, async (req, res) => {
  const id = req.params.id;
  const userId = req.user._id;
  try {
    const deletedItem = await IncomeModel.findOneAndDelete({ _id: id, user_id: userId });
    if (!deletedItem) {
      return res.status(404).json({ message: "Income entry not found or not authorized" });
    }
    res.status(200).json({ message: "Income entry deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
