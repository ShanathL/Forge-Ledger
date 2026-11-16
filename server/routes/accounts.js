const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/accounts
router.get('/', (req, res) => {
  try {
    const accounts = db.getAccounts();
    res.json({ success: true, data: accounts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/accounts
router.post('/', (req, res) => {
  try {
    const { code, name, type, subtype, description } = req.body;
    if (!code || !name || !type) {
      return res.status(400).json({ success: false, error: 'Code, Name and Type are required' });
    }
    const created = db.addAccount({ code, name, type, subtype, description });
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PUT /api/accounts/:id
router.put('/:id', (req, res) => {
  try {
    const updated = db.updateAccount(req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
