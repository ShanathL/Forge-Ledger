// server/routes/expenses.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

// GET /api/expenses
router.get('/', requireAuth, async (req, res) => {
  try {
    const expenses = await db.getExpenses(req.user.id, req.user.company_id);
    res.json({ success: true, data: expenses });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/expenses
router.post('/', requireAuth, async (req, res) => {
  try {
    const { description, category, expense_date, payment_method, amount } = req.body;
    const expense = await db.createExpense(req.user.id, req.user.company_id, {
      description,
      category,
      expense_date,
      payment_method,
      amount
    });
    res.status(201).json({ success: true, data: expense });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE /api/expenses/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await db.deleteExpense(req.user.id, req.user.company_id, req.params.id);
    res.json({ success: true, message: 'Expense deleted' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
