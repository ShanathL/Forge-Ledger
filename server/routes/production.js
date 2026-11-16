// server/routes/production.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

// GET /api/production
router.get('/', requireAuth, async (req, res) => {
  try {
    const runs = await db.getProductionRuns(req.user.id, req.user.company_id);
    res.json({ success: true, data: runs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/production
router.post('/', requireAuth, async (req, res) => {
  try {
    const { run_date, product, quantity, status } = req.body;
    const run = await db.createProductionRun(req.user.id, req.user.company_id, {
      run_date,
      product,
      quantity,
      status
    });
    res.status(201).json({ success: true, data: run });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PATCH /api/production/:id/status
router.patch('/:id/status', requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, error: 'Status is required' });
    const run = await db.updateProductionRunStatus(req.user.id, req.user.company_id, req.params.id, status);
    res.json({ success: true, data: run });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
