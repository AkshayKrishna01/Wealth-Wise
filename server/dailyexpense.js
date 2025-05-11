const express = require("express");
const mongoose = require("mongoose");

const dailyexpenseSchema = new mongoose.Schema({
    source: { type: String, required: true }, 
    amount: { type: Number, required: true, min: [0, "Amount must be a positive number"] }, 
    date: { type: Date, default: Date.now, required: true }, 
});

const DailyExpense = mongoose.model("DailyExpense", dailyexpenseSchema);

const router = express.Router();

router.post("/dailyexpense", async (req, res) => {
    try {
        const { source, amount, date } = req.body;

        console.log("Received data:", { source, amount, date });

        if (!source || !amount || !date) {
            return res.status(400).json({ error: "All fields are required" });
        }

        if (isNaN(amount) || amount < 0) {
            return res.status(400).json({ error: "Amount must be a valid positive number" });
        }

        const parsedDate = new Date(date);
        if (isNaN(parsedDate)) {
            return res.status(400).json({ error: "Invalid date format" });
        }

        const newExpense = new DailyExpense({
            source,
            amount,
            date: parsedDate,
        });

        await newExpense.save();
        res.json({ message: "Expense added successfully!" });
    } catch (err) {
        console.error("Error adding expense:", err);
        res.status(500).json({ error: err.message });
    }
});

router.get("/dailyexpense", async (req, res) => {
    try {
        const expenses = await DailyExpense.find().sort({ date: -1 });
        res.json(expenses);
    } catch (err) {
        console.error("Error fetching expenses:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
