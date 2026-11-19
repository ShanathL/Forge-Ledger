// server/db/mysql.js
// MySQL / MariaDB Connection Pool & Transaction Manager for ForgeLedger
// Reference: Lanka Shanath, "Integrated Manufacturing Workspace for Small Manufacturers"

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'forge_ledger',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
  decimalNumbers: true
};

let pool = null;
let isConnected = false;

function getPool() {
  if (!pool) {
    pool = mysql.createPool(poolConfig);
  }
  return pool;
}

async function checkConnection() {
  try {
    const p = getPool();
    const conn = await p.getConnection();
    conn.release();
    isConnected = true;
    return true;
  } catch (err) {
    isConnected = false;
    return false;
  }
}

async function initDatabase(force = false) {
  try {
    const dbName = poolConfig.database;

    // 1. Create database if it does not exist using a temporary connection without database selected
    const rootConn = await mysql.createConnection({
      host: poolConfig.host,
      port: poolConfig.port,
      user: poolConfig.user,
      password: poolConfig.password
    });

    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await rootConn.end();

    const p = getPool();
    await p.query(`USE \`${dbName}\`;`);

    // 2. Check if tables already exist
    const [existing] = await p.query(
      `SELECT COUNT(*) AS cnt FROM information_schema.tables WHERE table_schema = ? AND table_name = 'users'`,
      [dbName]
    );

    const tablesExist = existing[0] && Number(existing[0].cnt) > 0;

    const schemaPath = path.join(__dirname, '..', '..', 'database', 'db.sql');
    if (fs.existsSync(schemaPath) && (!tablesExist || force)) {
      const sqlContent = fs.readFileSync(schemaPath, 'utf-8');
      await p.query(sqlContent);
      console.log(`[MySQL] Database '${dbName}' populated with tables and seed data successfully.`);
    } else {
      console.log(`[MySQL] Database '${dbName}' tables verified and ready.`);
    }

    // Ensure items column exists on sales table
    try {
      const [colItems] = await p.query(
        `SELECT COUNT(*) AS cnt FROM information_schema.columns WHERE table_schema = ? AND table_name = 'sales' AND column_name = 'items'`,
        [dbName]
      );
      if (colItems[0] && Number(colItems[0].cnt) === 0) {
        await p.query(`ALTER TABLE sales ADD COLUMN items LONGTEXT NULL;`);
        console.log(`[MySQL Migration] Added items column on 'sales'.`);
      }
    } catch (itemsErr) {
      console.warn('[MySQL Migration Notice for sales.items]:', itemsErr.message);
    }

    // Ensure company_id exists on all tenant tables and backfill if needed
    const tenantTables = ['inventory', 'sales', 'expenses', 'employees', 'production_runs'];
    for (const tbl of tenantTables) {
      try {
        const [col] = await p.query(
          `SELECT COUNT(*) AS cnt FROM information_schema.columns WHERE table_schema = ? AND table_name = ? AND column_name = 'company_id'`,
          [dbName, tbl]
        );
        if (col[0] && Number(col[0].cnt) === 0) {
          await p.query(`ALTER TABLE \`${tbl}\` ADD COLUMN company_id INT UNSIGNED NULL;`);
          await p.query(`UPDATE \`${tbl}\` SET company_id = (SELECT company_id FROM users WHERE users.id = \`${tbl}\`.user_id LIMIT 1) WHERE company_id IS NULL;`);
          console.log(`[MySQL Migration] Added and backfilled company_id column on '${tbl}'.`);
        }
      } catch (colErr) {
        console.warn(`[MySQL Migration Notice for ${tbl}]:`, colErr.message);
      }
    }

    // Ensure personal profile columns exist on users table
    const userProfileCols = [
      { name: 'phone', type: 'VARCHAR(50) NULL DEFAULT ""' },
      { name: 'role', type: 'VARCHAR(100) NULL DEFAULT "Plant Manager"' },
      { name: 'department', type: 'VARCHAR(100) NULL DEFAULT "Operations"' },
      { name: 'bio', type: 'TEXT NULL' },
      { name: 'emergency_contact', type: 'VARCHAR(100) NULL DEFAULT ""' },
      { name: 'preferences', type: 'LONGTEXT NULL' }
    ];
    for (const col of userProfileCols) {
      try {
        const [colExist] = await p.query(
          `SELECT COUNT(*) AS cnt FROM information_schema.columns WHERE table_schema = ? AND table_name = 'users' AND column_name = ?`,
          [dbName, col.name]
        );
        if (colExist[0] && Number(colExist[0].cnt) === 0) {
          await p.query(`ALTER TABLE users ADD COLUMN \`${col.name}\` ${col.type};`);
          console.log(`[MySQL Migration] Added ${col.name} column on 'users'.`);
        }
      } catch (uErr) {
        console.warn(`[MySQL Migration Notice for users.${col.name}]:`, uErr.message);
      }
    }


    // Ensure is_demo column exists on users and enrich demo account
    try {
      const [colDemo] = await p.query(
        `SELECT COUNT(*) AS cnt FROM information_schema.columns WHERE table_schema = ? AND table_name = 'users' AND column_name = 'is_demo'`,
        [dbName]
      );
      if (colDemo[0] && Number(colDemo[0].cnt) === 0) {
        await p.query(`ALTER TABLE users ADD COLUMN is_demo TINYINT(1) NOT NULL DEFAULT 0;`);
        console.log("[MySQL Migration] Added 'is_demo' column on 'users'.");
      }
      await p.query(`UPDATE users SET is_demo = 1 WHERE email = 'demo@forgeledger.local' OR id = 1;`);

      // Check if demo account exists and needs enriched AI data
      const [demoUsers] = await p.query(
        `SELECT id, company_id FROM users WHERE email = 'demo@forgeledger.local' OR id = 1 LIMIT 1`
      );
      if (demoUsers && demoUsers.length > 0) {
        const demoId = demoUsers[0].id;
        const compId = demoUsers[0].company_id || 1;

        const [invCount] = await p.query(
          `SELECT COUNT(*) AS cnt FROM inventory WHERE user_id = ?`,
          [demoId]
        );

        if (!invCount[0] || Number(invCount[0].cnt) < 10) {
          console.log('[MySQL] Enriching demo account with full manufacturing dataset for AI features...');
          await p.query(`DELETE FROM inventory WHERE user_id = ?`, [demoId]);
          await p.query(`DELETE FROM sales WHERE user_id = ?`, [demoId]);
          await p.query(`DELETE FROM expenses WHERE user_id = ?`, [demoId]);
          await p.query(`DELETE FROM production_runs WHERE user_id = ?`, [demoId]);
          await p.query(`DELETE FROM employees WHERE user_id = ?`, [demoId]);

          await p.query(`
            INSERT INTO inventory (user_id, company_id, item_name, sku, category, quantity, unit, unit_cost, reorder_level) VALUES
              (?, ?, 'Steel sheets, 2mm', 'RM-ST-002', 'Raw material', 12.00, 'sheets', 1840.00, 35.00),
              (?, ?, 'Aluminium rods, 6061-T6', 'RM-AL-011', 'Raw material', 86.00, 'kg', 420.00, 30.00),
              (?, ?, 'Forged Carbon Steel Billets 100mm', 'RM-CS-104', 'Raw material', 18.00, 'billets', 2650.00, 25.00),
              (?, ?, 'Brass Hex Stock 32mm', 'RM-BR-032', 'Raw material', 140.00, 'kg', 580.00, 40.00),
              (?, ?, 'Hydraulic Nitrile O-Ring Kits', 'RM-OR-500', 'Raw material', 95.00, 'kits', 85.00, 30.00),
              (?, ?, 'CNC Cutting Fluid & Lubricant', 'RM-CL-020', 'Raw material', 6.00, 'drums', 3200.00, 10.00),
              (?, ?, 'Assembly bracket', 'FG-AB-204', 'Finished good', 160.00, 'units', 285.00, 40.00),
              (?, ?, 'Heavy Industrial Flange 4-Inch', 'FG-FL-401', 'Finished good', 85.00, 'units', 1240.00, 25.00),
              (?, ?, 'Precision Spur Gearbox 1:10', 'FG-GB-810', 'Finished good', 28.00, 'units', 3400.00, 15.00),
              (?, ?, 'Hydraulic Control Valve 500PSI', 'FG-HV-502', 'Finished good', 42.00, 'units', 1850.00, 20.00),
              (?, ?, 'Turned Brass Bushing Set', 'FG-BB-108', 'Finished good', 320.00, 'units', 110.00, 80.00),
              (?, ?, 'Stainless Shaft Coupler 25mm', 'FG-SC-325', 'Finished good', 110.00, 'units', 460.00, 30.00)
          `, [
            demoId, compId, demoId, compId, demoId, compId, demoId, compId, demoId, compId, demoId, compId,
            demoId, compId, demoId, compId, demoId, compId, demoId, compId, demoId, compId, demoId, compId
          ]);

          await p.query(`
            INSERT INTO sales (user_id, company_id, invoice_no, customer, issued_date, due_date, amount, status, items) VALUES
              (?, ?, 'INV-1048', 'Northstar Retail Solutions', '2026-09-08', '2026-09-15', 48600.00, 'Paid', ?),
              (?, ?, 'INV-1047', 'Veda Industrial Supply', '2026-09-06', '2026-09-15', 32400.00, 'Paid', ?),
              (?, ?, 'INV-1049', 'Tata Motors Heavy Engineering', '2026-09-11', '2026-09-25', 86000.00, 'Paid', ?),
              (?, ?, 'INV-1050', 'Larsen & Toubro Machinery Division', '2026-09-14', '2026-09-28', 116000.00, 'Paid', ?),
              (?, ?, 'INV-1051', 'BHEL Power Equipment Plant', '2026-09-18', '2026-10-05', 64000.00, 'Pending', ?),
              (?, ?, 'INV-1052', 'Mahindra Precision Dynamics', '2026-09-22', '2026-10-10', 41700.00, 'Pending', ?),
              (?, ?, 'INV-1045', 'Omkar Fabrications', '2026-09-01', '2026-09-05', 48200.00, 'Overdue', ?)
          `, [
            demoId, compId, JSON.stringify([{ itemName: 'Assembly bracket', quantity: 72, unitPrice: 450, total: 32400 }, { itemName: 'Stainless Shaft Coupler 25mm', quantity: 22, unitPrice: 720, total: 16200 }]),
            demoId, compId, JSON.stringify([{ itemName: 'Turned Brass Bushing Set', quantity: 120, unitPrice: 165, total: 19800 }, { itemName: 'Assembly bracket', quantity: 28, unitPrice: 450, total: 12600 }]),
            demoId, compId, JSON.stringify([{ itemName: 'Heavy Industrial Flange 4-Inch', quantity: 40, unitPrice: 2150, total: 86000 }]),
            demoId, compId, JSON.stringify([{ itemName: 'Precision Spur Gearbox 1:10', quantity: 20, unitPrice: 5800, total: 116000 }]),
            demoId, compId, JSON.stringify([{ itemName: 'Hydraulic Control Valve 500PSI', quantity: 20, unitPrice: 3200, total: 64000 }]),
            demoId, compId, JSON.stringify([{ itemName: 'Stainless Shaft Coupler 25mm', quantity: 35, unitPrice: 720, total: 25200 }, { itemName: 'Turned Brass Bushing Set', quantity: 100, unitPrice: 165, total: 16500 }]),
            demoId, compId, JSON.stringify([{ itemName: 'Heavy Industrial Flange 4-Inch', quantity: 16, unitPrice: 2150, total: 34400 }, { itemName: 'Assembly bracket', quantity: 30, unitPrice: 450, total: 13800 }])
          ]);

          await p.query(`
            INSERT INTO expenses (user_id, company_id, description, category, expense_date, payment_method, amount) VALUES
              (?, ?, 'Factory 3-Phase Electricity Bill (TNEB Power Grid)', 'Utilities', '2026-09-07', 'Bank transfer', 34800.00),
              (?, ?, 'Diesel Generator Fuel & Compressed Air Backups', 'Utilities', '2026-09-15', 'UPI', 14200.00),
              (?, ?, 'Bulk Steel Sheet Procurement (Tata Steel Distribution)', 'Materials', '2026-09-04', 'Bank transfer', 55200.00),
              (?, ?, 'Aluminium Extrusions & Brass Rod Restock', 'Materials', '2026-09-12', 'Bank transfer', 32600.00),
              (?, ?, 'Packaging Cartons & Strapping Band Rolls', 'Materials', '2026-09-05', 'UPI', 12900.00),
              (?, ?, 'CNC Milling Spindle Servicing & Carbide Inserts', 'Maintenance', '2026-09-03', 'Bank transfer', 18600.00),
              (?, ?, 'Hydraulic Press Calibration & Filter Replacements', 'Maintenance', '2026-09-19', 'UPI', 8400.00),
              (?, ?, 'Industrial Estate Shed Lease - Guindy Plot 45', 'Rent', '2026-09-01', 'Bank transfer', 45000.00),
              (?, ?, 'Freight & Logistics Dispatch (Blue Dart Freight)', 'Logistics', '2026-09-16', 'UPI', 9800.00)
          `, [
            demoId, compId, demoId, compId, demoId, compId, demoId, compId, demoId, compId,
            demoId, compId, demoId, compId, demoId, compId, demoId, compId
          ]);

          await p.query(`
            INSERT INTO production_runs (user_id, company_id, run_date, product, quantity, status) VALUES
              (?, ?, '2026-09-05', 'Assembly bracket', 100.00, 'Completed'),
              (?, ?, '2026-09-10', 'Assembly bracket', 150.00, 'In progress'),
              (?, ?, '2026-09-08', 'Heavy Industrial Flange 4-Inch', 50.00, 'Completed'),
              (?, ?, '2026-09-16', 'Hydraulic Control Valve 500PSI', 35.00, 'In progress'),
              (?, ?, '2026-09-24', 'Precision Spur Gearbox 1:10', 20.00, 'Planned'),
              (?, ?, '2026-09-12', 'Turned Brass Bushing Set', 250.00, 'Completed')
          `, [
            demoId, compId, demoId, compId, demoId, compId, demoId, compId, demoId, compId, demoId, compId
          ]);

          await p.query(`
            INSERT INTO employees (user_id, company_id, name, role, monthly_salary, status) VALUES
              (?, ?, 'Demo Employee', 'Shop Floor Operator', 28000.00, 'Active'),
              (?, ?, 'Kavita Sundaram', 'Warehouse Clerk', 24500.00, 'Active'),
              (?, ?, 'Suresh Nair', 'Accountant & Tax Lead', 36000.00, 'Active'),
              (?, ?, 'Arjun Patel', 'Senior CNC Machinist', 32000.00, 'Active')
          `, [
            demoId, compId, demoId, compId, demoId, compId, demoId, compId
          ]);

          console.log('[MySQL] Demo account successfully enriched with 12 items, 7 sales, 9 expenses, 6 runs, 4 staff.');
        }
      }
    } catch (demoErr) {
      console.warn('[MySQL Demo Data Enrichment Notice]:', demoErr.message);
    }
    isConnected = true;
    return true;
  } catch (err) {
    console.warn(`[MySQL Warning] Could not connect to MySQL at ${poolConfig.host}:${poolConfig.port}: ${err.message}`);
    console.warn(`[MySQL Warning] Ensure MySQL / MariaDB (e.g. XAMPP) is running. Fallback storage is available.`);
    isConnected = false;
    return false;
  }
}

async function query(sql, params = []) {
  const p = getPool();
  const [rows] = await p.query(sql, params);
  return rows;
}

// Transaction wrapper with auto rollback on error
async function withTransaction(callback) {
  const p = getPool();
  const conn = await p.getConnection();
  try {
    await conn.beginTransaction();
    const result = await callback(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = {
  getPool,
  query,
  withTransaction,
  initDatabase,
  checkConnection,
  isAvailable: () => isConnected
};
