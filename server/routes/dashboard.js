// server/routes/dashboard.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

// GET /api/dashboard/summary
router.get('/summary', requireAuth, async (req, res) => {
  try {
    const summary = await db.getDashboardSummary(req.user.id, req.user.company_id);
    res.json({ success: true, data: summary });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
