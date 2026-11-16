// server/routes/inventory.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

// GET /api/inventory
router.get('/', requireAuth, async (req, res) => {
  try {
    const items = await db.getInventory(req.user.id, req.user.company_id, req.query);
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/inventory
router.post('/', requireAuth, async (req, res) => {
  try {
    const { item_name, sku, category, quantity, unit, unit_cost, reorder_level } = req.body;
    const item = await db.createInventoryItem(req.user.id, req.user.company_id, {
      item_name,
      sku,
      category,
      quantity,
      unit,
      unit_cost,
      reorder_level
    });
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PUT /api/inventory/:id
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const updated = await db.updateInventoryItem(req.user.id, req.user.company_id, req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE /api/inventory/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await db.deleteInventoryItem(req.user.id, req.user.company_id, req.params.id);
    res.json({ success: true, message: 'Item deleted' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
