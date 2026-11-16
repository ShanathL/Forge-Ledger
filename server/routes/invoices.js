const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/invoices
router.get('/', (req, res) => {
  try {
    const invoices = db.getInvoices();
    res.json({ success: true, data: invoices });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/invoices
router.post('/', (req, res) => {
  try {
    const { customerId, issueDate, dueDate, items, taxRate, notes } = req.body;
    if (!customerId) {
      return res.status(400).json({ success: false, error: 'Customer is required' });
    }
    if (!items || !items.length) {
      return res.status(400).json({ success: false, error: 'At least one line item is required' });
    }
    const invoice = db.createInvoice({ customerId, issueDate, dueDate, items, taxRate, notes });
    res.status(201).json({ success: true, data: invoice });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/invoices/:id/pay
router.post('/:id/pay', (req, res) => {
  try {
    const { amount, date, paymentMethod, depositAccountId, notes } = req.body;
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, error: 'Valid payment amount is required' });
    }
    const result = db.recordInvoicePayment(req.params.id, {
      amount,
      date,
      paymentMethod,
      depositAccountId,
      notes
    });
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
