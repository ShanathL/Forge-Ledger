// server/routes/companies.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

// GET /api/companies - List all companies owned by user (max 3)
router.get('/', requireAuth, async (req, res) => {
  try {
    const companies = await db.getUserCompanies(req.user.id);
    res.json({
      success: true,
      data: companies,
      activeCompanyId: req.user.company_id,
      canAddMore: companies.length < 3
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/companies - Create a new company (max 3 limit)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, legal_name, registration_no, gst_no, email, phone, address, city, state, country } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Company name is required.' });
    }

    const newCompany = await db.createCompanyForUser(req.user.id, {
      name: name.trim(),
      legal_name: (legal_name || name).trim(),
      registration_no: (registration_no || '').trim(),
      gst_no: (gst_no || '').trim(),
      email: (email || req.user.email || '').trim(),
      phone: (phone || '').trim(),
      address: (address || '').trim(),
      city: (city || '').trim(),
      state: (state || '').trim(),
      country: country || 'India'
    });

    res.status(201).json({
      success: true,
      message: 'Company created and activated successfully',
      data: newCompany
    });
  } catch (err) {
    res.status(err.status || 400).json({ success: false, error: err.message });
  }
});

// POST /api/companies/switch - Switch the active workspace to another company owned by the user
router.post('/switch', requireAuth, async (req, res) => {
  try {
    const { companyId } = req.body;
    if (!companyId) {
      return res.status(400).json({ success: false, error: 'companyId is required.' });
    }

    const switchedCompany = await db.switchActiveCompany(req.user.id, companyId);
    res.json({
      success: true,
      message: `Switched active workspace to ${switchedCompany.name}`,
      activeCompany: switchedCompany
    });
  } catch (err) {
    res.status(err.status || 400).json({ success: false, error: err.message });
  }
});

module.exports = router;
