const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/journal
router.get('/', (req, res) => {
  try {
    const entries = db.getJournalEntries(req.query);
    res.json({ success: true, data: entries });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/journal
router.post('/', (req, res) => {
  try {
    const { date, reference, description, items } = req.body;
    if (!items || !Array.isArray(items) || items.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'A valid journal entry must contain at least 2 line items (debits and credits)'
      });
    }
    const entry = db.createJournalEntry({ date, reference, description, items });
    res.status(201).json({ success: true, data: entry });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
