const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/contacts?type=CUSTOMER or VENDOR
router.get('/', (req, res) => {
  try {
    const contacts = db.getContacts(req.query.type);
    res.json({ success: true, data: contacts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/contacts
router.post('/', (req, res) => {
  try {
    const { name, type, company, email, phone, address, taxNumber, notes } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }
    const contact = db.addContact({ name, type, company, email, phone, address, taxNumber, notes });
    res.status(201).json({ success: true, data: contact });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PUT /api/contacts/:id
router.put('/:id', (req, res) => {
  try {
    const updated = db.updateContact(req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE /api/contacts/:id
router.delete('/:id', (req, res) => {
  try {
    db.deleteContact(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
