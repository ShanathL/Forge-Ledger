// server/routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { requireAuth, JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, companyName } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'A valid email is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    const { user, company } = await db.createUser({
      name,
      email,
      password,
      companyName
    });

    const token = jwt.sign(
      { userId: user.id, companyId: company.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 86400000
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        company_id: user.company_id,
        company
      }
    });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const user = await db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    // If password_hash is null (like initial demo user seed), set or allow default
    let isMatch = false;
    if (!user.password_hash) {
      isMatch = password === 'password123' || password === 'admin';
    } else {
      isMatch = bcrypt.compareSync(password, user.password_hash);
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const company = user.company_id ? await db.getCompanyById(user.company_id) : null;

    const token = jwt.sign(
      { userId: user.id, companyId: user.company_id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 86400000
    });

    res.json({
      success: true,
      message: 'Signed in successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        company_id: user.company_id,
        company
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Signed out successfully' });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// PUT /api/auth/profile
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { name, email, phone, role, department, bio, emergency_contact, picture, preferences } = req.body;
    const updated = await db.updateUserProfile(req.user.id, {
      name,
      email,
      phone,
      role,
      department,
      bio,
      emergency_contact,
      picture,
      preferences
    });

    const safeUser = { ...updated };
    delete safeUser.password_hash;
    if (safeUser.preferences && typeof safeUser.preferences === 'string') {
      try { safeUser.preferences = JSON.parse(safeUser.preferences); } catch (_) {}
    }

    res.json({
      success: true,
      user: safeUser,
      message: 'Personal profile details updated successfully'
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/auth/change-password
router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword) {
      return res.status(400).json({ success: false, error: 'Current password is required' });
    }
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters long' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'New password and confirmation do not match' });
    }

    await db.changePassword(req.user.id, currentPassword, newPassword);

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (err) {
    res.status(err.status || 400).json({ success: false, error: err.message });
  }
});

// GET /api/auth/export-backup
router.get('/export-backup', requireAuth, async (req, res) => {
  try {
    const backup = await db.exportWorkspaceBackup(req.user.id, req.user.company_id);
    const companySlug = (backup.company?.name || 'workspace').toLowerCase().replace(/[^a-z0-9]/g, '-');
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `forgeledger-backup-${companySlug}-${dateStr}.json`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(JSON.stringify(backup, null, 2));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
