const express = require("express");
const mongoose = require("mongoose");
const authenticate = require("./middleware/authMiddleware");

const router = express.Router();

// Schema and Model for visits
const visitSchema = new mongoose.Schema({
  date: { type: String, required: true },
});
const Visit = mongoose.model("Visit", visitSchema);

// GET visited dates (protected)
router.get("/api/visited-dates", authenticate, async (req, res) => {
  try {
    const visits = await Visit.find({});
    res.json(visits);
  } catch (err) {
    res.status(500).json({ error: "Error fetching visited dates" });
  }
});

// POST a visit (protected)
router.post("/api/visit", authenticate, async (req, res) => {
  try {
    const { date } = req.body;
    const existingVisit = await Visit.findOne({ date });
    if (!existingVisit) {
      const visit = new Visit({ date });
      await visit.save();
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Error saving visit" });
  }
});

module.exports = router;
