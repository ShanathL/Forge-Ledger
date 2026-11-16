// server/routes/reports.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

// GET /api/reports/monthly
router.get('/monthly', requireAuth, async (req, res) => {
  try {
    const sales = await db.getSales(req.user.id);
    const expenses = await db.getExpenses(req.user.id);

    const monthMap = new Map();

    sales.forEach(s => {
      const m = (s.issued_date || '').slice(0, 7) || '2026-09';
      if (!monthMap.has(m)) monthMap.set(m, { month: m, sales: 0, expenses: 0 });
      const row = monthMap.get(m);
      row.sales += Number(s.amount) || 0;
    });

    expenses.forEach(e => {
      const m = (e.expense_date || '').slice(0, 7) || '2026-09';
      if (!monthMap.has(m)) monthMap.set(m, { month: m, sales: 0, expenses: 0 });
      const row = monthMap.get(m);
      row.expenses += Number(e.amount) || 0;
    });

    const monthly = Array.from(monthMap.values()).map(r => ({
      month: r.month,
      sales: Math.round(r.sales * 100) / 100,
      expenses: Math.round(r.expenses * 100) / 100,
      net: Math.round((r.sales - r.expenses) * 100) / 100
    })).sort((a, b) => a.month.localeCompare(b.month));

    const totalSales = sales.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    res.json({
      success: true,
      data: {
        monthly,
        totalSales: Math.round(totalSales * 100) / 100,
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        netMargin: Math.round((totalSales - totalExpenses) * 100) / 100
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
