// server/routes/employees.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

// GET /api/employees
router.get('/', requireAuth, async (req, res) => {
  try {
    const employees = await db.getEmployees(req.user.id, req.user.company_id);
    res.json({ success: true, data: employees });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/employees
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, role, monthly_salary, status } = req.body;
    const employee = await db.createEmployee(req.user.id, req.user.company_id, {
      name,
      role,
      monthly_salary,
      status
    });
    res.status(201).json({ success: true, data: employee });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PUT /api/employees/:id
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const updated = await db.updateEmployee(req.user.id, req.user.company_id, req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE /api/employees/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await db.deleteEmployee(req.user.id, req.user.company_id, req.params.id);
    res.json({ success: true, message: 'Employee deleted' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
