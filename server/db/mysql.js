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
