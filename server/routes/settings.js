// server/routes/settings.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

// GET /api/settings
router.get('/', requireAuth, async (req, res) => {
  try {
    const company = await db.getCompanyById(req.user.company_id);
    res.json({ success: true, data: company });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/settings
router.put('/', requireAuth, async (req, res) => {
  try {
    const updated = await db.updateCompany(req.user.company_id, req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
