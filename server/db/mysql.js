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

async function initDatabase() {
  try {
    // 1. Create database if it does not exist using a temporary connection without database selected
    const rootConn = await mysql.createConnection({
      host: poolConfig.host,
      port: poolConfig.port,
      user: poolConfig.user,
      password: poolConfig.password
    });

    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${poolConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await rootConn.end();

    // 2. Read schema file and execute
    const schemaPath = path.join(__dirname, '..', '..', 'database', 'db.sql');
    if (fs.existsSync(schemaPath)) {
      const sqlContent = fs.readFileSync(schemaPath, 'utf-8');
      const p = getPool();
      await p.query(sqlContent);
      console.log(`[MySQL] Database '${poolConfig.database}' initialized successfully.`);
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
