// server/server.js
// Main Express Application for ForgeLedger
// Reference: Lanka Shanath, "Integrated Manufacturing Workspace for Small Manufacturers"

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const mysql = require('./db/mysql');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const inventoryRoutes = require('./routes/inventory');
const salesRoutes = require('./routes/sales');
const expensesRoutes = require('./routes/expenses');
const employeeRoutes = require('./routes/employees');
const productionRoutes = require('./routes/production');
const rawMaterialRoutes = require('./routes/rawMaterials');
const reportRoutes = require('./routes/reports');
const settingsRoutes = require('./routes/settings');
const companyRoutes = require('./routes/companies');
const aiRoutes = require('./routes/ai');
const teamRoutes = require('./routes/team');

const app = express();
const PORT = process.env.PORT || 4000;

// Security and parser middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

// Static file serving for SPA client
app.use(express.static(path.join(__dirname, '..', 'public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'ForgeLedger',
    version: '2.0.0',
    mysqlConnected: mysql.isAvailable(),
    timestamp: new Date().toISOString()
  });
});

// Database Seed / Verification endpoint
app.post('/api/health/seed', async (req, res) => {
  try {
    const success = await mysql.initDatabase(true);
    res.json({ success, message: 'Database tables and seeds initialized successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Mount protected and public API routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/raw-materials', rawMaterialRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/team', teamRoutes);

// SPA client fallback
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, error: 'Endpoint not found' });
  }
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'An internal server error occurred'
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` ForgeLedger Server Running on http://localhost:${PORT}`);
  console.log(` MySQL Status: ${mysql.isAvailable() ? 'CONNECTED' : 'STANDALONE (Fallback Mode)'}`);
  console.log(` Workspace: D:\\Forge Ledger`);
  console.log(`====================================================`);
});
