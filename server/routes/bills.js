const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/bills
router.get('/', (req, res) => {
  try {
    const bills = db.getBills();
    res.json({ success: true, data: bills });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/bills
router.post('/', (req, res) => {
  try {
    const { vendorId, issueDate, dueDate, category, expenseAccountId, amount, items, notes } = req.body;
    if (!vendorId) {
      return res.status(400).json({ success: false, error: 'Vendor is required' });
    }
    const bill = db.createBill({
      vendorId,
      issueDate,
      dueDate,
      category,
      expenseAccountId,
      amount,
      items,
      notes
    });
    res.status(201).json({ success: true, data: bill });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/bills/:id/pay
router.post('/:id/pay', (req, res) => {
  try {
    const { amount, date, paymentMethod, withdrawAccountId, notes } = req.body;
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, error: 'Valid payment amount is required' });
    }
    const result = db.recordBillPayment(req.params.id, {
      amount,
      date,
      paymentMethod,
      withdrawAccountId,
      notes
    });
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
