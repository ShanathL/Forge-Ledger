// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'forgeledger_production_jwt_secret_srm_cse_2026_super_secure_key_32chars';

async function requireAuth(req, res, next) {
  try {
    let token = null;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please sign in.'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await db.findUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Session expired or user account not found.'
      });
    }

    const company = user.company_id ? await db.getCompanyById(user.company_id) : null;

    let parsedPrefs = null;
    if (user.preferences) {
      if (typeof user.preferences === 'string') {
        try { parsedPrefs = JSON.parse(user.preferences); } catch (_) { parsedPrefs = null; }
      } else {
        parsedPrefs = user.preferences;
      }
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role || 'Plant Manager',
      department: user.department || 'Operations',
      bio: user.bio || '',
      emergency_contact: user.emergency_contact || '',
      picture: user.picture || '',
      preferences: parsedPrefs,
      company_id: user.company_id,
      company: company || { name: 'My Workspace', currency: '₹' }
    };

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired session token.'
    });
  }
}

module.exports = {
  requireAuth,
  JWT_SECRET
};
