// server/routes/sales.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

// GET /api/sales
router.get('/', requireAuth, async (req, res) => {
  try {
    const sales = await db.getSales(req.user.id, req.user.company_id);
    res.json({ success: true, data: sales });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/sales
router.post('/', requireAuth, async (req, res) => {
  try {
    const { invoice_no, customer, issued_date, due_date, amount, status } = req.body;
    const sale = await db.createSale(req.user.id, req.user.company_id, {
      invoice_no,
      customer,
      issued_date,
      due_date,
      amount,
      status
    });
    res.status(201).json({ success: true, data: sale });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PUT /api/sales/:id
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const updated = await db.updateSale(req.user.id, req.user.company_id, req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE /api/sales/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await db.deleteSale(req.user.id, req.user.company_id, req.params.id);
    res.json({ success: true, message: 'Sale deleted' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
