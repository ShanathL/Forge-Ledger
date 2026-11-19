// server/routes/team.js
// Team Management and Role-Based Access Control (RBAC) API
const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const ROLE_PERMISSIONS = {
  owner: {
    key: 'owner',
    title: 'Plant Owner / Superadmin',
    icon: '👑',
    color: '#f59e0b',
    description: 'Full unrestricted governance across all modules, sensitive financial statements, and company configuration.',
    allowedTabs: ['overview', 'inventory', 'sales', 'expenses', 'rawMaterials', 'production', 'payroll', 'reports', 'settings'],
    canViewFinancials: true,
    canEditInventory: true,
    canEditProduction: true,
    canDisbursePayroll: true,
    canManageTeam: true
  },
  operator: {
    key: 'operator',
    title: 'Shop Floor Operator',
    icon: '⚙️',
    color: '#f97316',
    description: 'Dedicated to machine shop floor queues, batch logging, and material availability. Financial totals and margins are strictly masked.',
    allowedTabs: ['production', 'rawMaterials', 'inventory', 'overview'],
    canViewFinancials: false,
    canEditInventory: false,
    canEditProduction: true,
    canDisbursePayroll: false,
    canManageTeam: false
  },
  clerk: {
    key: 'clerk',
    title: 'Warehouse & Stock Clerk',
    icon: '📦',
    color: '#10b981',
    description: 'Manages physical warehouse inventory, QR & barcode scanning, label printing, and stock count reconciliations.',
    allowedTabs: ['inventory', 'rawMaterials', 'production', 'overview'],
    canViewFinancials: false,
    canEditInventory: true,
    canEditProduction: false,
    canDisbursePayroll: false,
    canManageTeam: false
  },
  accountant: {
    key: 'accountant',
    title: 'Accountant & Compliance',
    icon: '📊',
    color: '#8b5cf6',
    description: 'Manages sales invoices, vendor expense OCR, tax/GST compliance, and monthly payroll disbursements.',
    allowedTabs: ['overview', 'sales', 'expenses', 'payroll', 'reports', 'settings'],
    canViewFinancials: true,
    canEditInventory: false,
    canEditProduction: false,
    canDisbursePayroll: true,
    canManageTeam: false
  }
};

// GET /api/team - Fetch all members of active company
router.get('/', requireAuth, async (req, res) => {
  try {
    const companyId = req.user.company_id || 1;
    const members = await db.getTeamMembers(companyId);
    res.json({
      success: true,
      data: members,
      roles: ROLE_PERMISSIONS,
      companyId
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/team/invite - Invite new colleague to company
router.post('/invite', requireAuth, async (req, res) => {
  try {
    const companyId = req.user.company_id || 1;
    const { name, email, role, department, phone } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Member full name is required' });
    }
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'A valid email address is required' });
    }

    const member = await db.inviteTeamMember(companyId, {
      name,
      email,
      role: role || 'operator',
      department: department || 'Operations',
      phone: phone || ''
    });

    res.status(201).json({
      success: true,
      message: `Invited ${member.name} (${member.role}) to workspace roster`,
      data: member
    });
  } catch (err) {
    res.status(err.status || 400).json({ success: false, error: err.message });
  }
});

// PATCH /api/team/:id/role - Update colleague role or department
router.patch('/:id/role', requireAuth, async (req, res) => {
  try {
    const companyId = req.user.company_id || 1;
    const { role, department } = req.body;

    if (!role) {
      return res.status(400).json({ success: false, error: 'Role is required' });
    }

    const updated = await db.updateTeamMemberRole(companyId, req.params.id, { role, department });
    res.json({
      success: true,
      message: `Updated role for ${updated.name} to ${updated.role}`,
      data: updated
    });
  } catch (err) {
    res.status(err.status || 400).json({ success: false, error: err.message });
  }
});

// DELETE /api/team/:id - Remove colleague from company
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const companyId = req.user.company_id || 1;
    await db.removeTeamMember(companyId, req.params.id);
    res.json({
      success: true,
      message: 'Member removed from company workspace'
    });
  } catch (err) {
    res.status(err.status || 400).json({ success: false, error: err.message });
  }
});

module.exports = router;
