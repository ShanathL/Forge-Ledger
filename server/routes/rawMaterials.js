// server/routes/rawMaterials.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

// GET /api/raw-materials
router.get('/', requireAuth, async (req, res) => {
  try {
    const materials = await db.getInventory(req.user.id, { category: 'Raw material' });
    res.json({ success: true, data: materials });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/raw-materials
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, sku, unit, quantity, unit_cost } = req.body;
    const item = await db.createInventoryItem(req.user.id, {
      item_name: name,
      sku: sku || `RM-${Date.now().toString().slice(-4)}`,
      category: 'Raw material',
      quantity: Number(quantity) || 0,
      unit: unit || 'kg',
      unit_cost: Number(unit_cost) || 0,
      reorder_level: 10
    });
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE /api/raw-materials/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await db.deleteInventoryItem(req.user.id, req.params.id);
    res.json({ success: true, message: 'Raw material deleted' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
