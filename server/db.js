// server/db.js
// Database service for ForgeLedger
// Implements exact schema from database.sql:
// users, companies, inventory, sales, expenses, employees, production_runs

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const mysql = require('./db/mysql');

const DATA_DIR = path.join(__dirname, '..', 'data');
const JSON_FILE = path.join(DATA_DIR, 'forgeledger.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial state populated from database.sql
const initialData = {
  users: [
    {
      id: 1,
      name: 'Demo User',
      email: 'demo@forgeledger.local',
      password_hash: bcrypt.hashSync('password123', 10),
      picture: '',
      company_id: 1,
      created_at: '2026-09-01T10:00:00.000Z',
      updated_at: '2026-09-01T10:00:00.000Z'
    }
  ],
  companies: [
    {
      id: 1,
      owner_user_id: 1,
      name: 'Riverton Works',
      legal_name: 'Riverton Works',
      registration_no: 'REG-2026-RW',
      gst_no: '33AAAAA0000A1Z5',
      email: 'contact@rivertonworks.local',
      phone: '+91 98765 43210',
      address: 'Plot 45, Industrial Estate, Guindy',
      city: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
      currency: '₹',
      created_at: '2026-09-01T10:00:00.000Z',
      updated_at: '2026-09-01T10:00:00.000Z'
    }
  ],
  inventory: [
    {
      id: 1,
      user_id: 1,
      item_name: 'Steel sheets, 2mm',
      sku: 'RM-ST-002',
      category: 'Raw material',
      quantity: 12.00,
      unit: 'sheets',
      unit_cost: 1840.00,
      reorder_level: 30.00,
      created_at: '2026-09-01T10:00:00.000Z',
      updated_at: '2026-09-01T10:00:00.000Z'
    },
    {
      id: 2,
      user_id: 1,
      item_name: 'Aluminium rods',
      sku: 'RM-AL-011',
      category: 'Raw material',
      quantity: 86.00,
      unit: 'kg',
      unit_cost: 420.00,
      reorder_level: 30.00,
      created_at: '2026-09-01T10:00:00.000Z',
      updated_at: '2026-09-01T10:00:00.000Z'
    },
    {
      id: 3,
      user_id: 1,
      item_name: 'Assembly bracket',
      sku: 'FG-AB-204',
      category: 'Finished good',
      quantity: 240.00,
      unit: 'units',
      unit_cost: 285.00,
      reorder_level: 50.00,
      created_at: '2026-09-01T10:00:00.000Z',
      updated_at: '2026-09-01T10:00:00.000Z'
    }
  ],
  sales: [
    {
      id: 1,
      user_id: 1,
      invoice_no: 'INV-1048',
      customer: 'Northstar Retail',
      issued_date: '2026-09-08',
      due_date: '2026-09-15',
      amount: 48600.00,
      status: 'Paid',
      created_at: '2026-09-08T10:00:00.000Z',
      updated_at: '2026-09-08T10:00:00.000Z'
    },
    {
      id: 2,
      user_id: 1,
      invoice_no: 'INV-1047',
      customer: 'Veda Industrial Supply',
      issued_date: '2026-09-06',
      due_date: '2026-09-15',
      amount: 32400.00,
      status: 'Pending',
      created_at: '2026-09-06T10:00:00.000Z',
      updated_at: '2026-09-06T10:00:00.000Z'
    },
    {
      id: 3,
      user_id: 1,
      invoice_no: 'INV-1045',
      customer: 'Omkar Fabrications',
      issued_date: '2026-09-01',
      due_date: '2026-09-05',
      amount: 48200.00,
      status: 'Overdue',
      created_at: '2026-09-01T10:00:00.000Z',
      updated_at: '2026-09-01T10:00:00.000Z'
    }
  ],
  expenses: [
    {
      id: 1,
      user_id: 1,
      description: 'Factory electricity bill',
      category: 'Utilities',
      expense_date: '2026-09-07',
      payment_method: 'Bank transfer',
      amount: 28450.00,
      created_at: '2026-09-07T10:00:00.000Z',
      updated_at: '2026-09-07T10:00:00.000Z'
    },
    {
      id: 2,
      user_id: 1,
      description: 'Packaging supplies',
      category: 'Materials',
      expense_date: '2026-09-05',
      payment_method: 'UPI',
      amount: 12900.00,
      created_at: '2026-09-05T10:00:00.000Z',
      updated_at: '2026-09-05T10:00:00.000Z'
    },
    {
      id: 3,
      user_id: 1,
      description: 'Equipment servicing',
      category: 'Maintenance',
      expense_date: '2026-09-03',
      payment_method: 'Bank transfer',
      amount: 18600.00,
      created_at: '2026-09-03T10:00:00.000Z',
      updated_at: '2026-09-03T10:00:00.000Z'
    }
  ],
  employees: [
    {
      id: 1,
      user_id: 1,
      name: 'Demo Employee',
      role: 'Production Operator',
      monthly_salary: 28000.00,
      status: 'Active',
      created_at: '2026-09-01T10:00:00.000Z',
      updated_at: '2026-09-01T10:00:00.000Z'
    }
  ],
  production_runs: [
    {
      id: 1,
      user_id: 1,
      run_date: '2026-09-05',
      product: 'Assembly bracket',
      quantity: 100.00,
      status: 'Completed',
      created_at: '2026-09-05T10:00:00.000Z'
    },
    {
      id: 2,
      user_id: 1,
      run_date: '2026-09-10',
      product: 'Assembly bracket',
      quantity: 150.00,
      status: 'In progress',
      created_at: '2026-09-10T10:00:00.000Z'
    }
  ],
  sequences: {
    user: 2,
    company: 2,
    inventory: 4,
    sales: 4,
    expenses: 4,
    employees: 2,
    production_runs: 3
  }
};

class DatabaseManager {
  constructor() {
    this.useMySQL = false;
    this.data = initialData;
    this.loadJson();
  }

  loadJson() {
    try {
      if (fs.existsSync(JSON_FILE)) {
        const raw = fs.readFileSync(JSON_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.data = JSON.parse(JSON.stringify(initialData));
        this.saveJson();
      }
    } catch (err) {
      this.data = JSON.parse(JSON.stringify(initialData));
      this.saveJson();
    }
  }

  saveJson() {
    try {
      fs.writeFileSync(JSON_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
      return true;
    } catch (err) {
      console.error('Save failed:', err.message);
      return false;
    }
  }

  nextId(table) {
    if (!this.data.sequences[table]) {
      this.data.sequences[table] = 1;
    }
    const val = this.data.sequences[table];
    this.data.sequences[table] += 1;
    this.saveJson();
    return val;
  }

  // --- Auth / Users / Companies ---
  async findUserByEmail(email) {
    const cleanEmail = email.toLowerCase().trim();
    if (this.useMySQL) {
      const rows = await mysql.query('SELECT * FROM users WHERE email = ?', [cleanEmail]);
      return rows[0] || null;
    }
    return this.data.users.find(u => u.email.toLowerCase() === cleanEmail) || null;
  }

  async findUserById(id) {
    if (this.useMySQL) {
      const rows = await mysql.query('SELECT * FROM users WHERE id = ?', [Number(id)]);
      return rows[0] || null;
    }
    return this.data.users.find(u => u.id === Number(id)) || null;
  }

  async createUser({ name, email, password, companyName }) {
    const existing = await this.findUserByEmail(email);
    if (existing) {
      const err = new Error('A user with this email address already exists');
      err.status = 409;
      throw err;
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    if (this.useMySQL) {
      return await mysql.withTransaction(async (conn) => {
        const [userRes] = await conn.query(
          'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
          [name.trim(), email.toLowerCase().trim(), hash]
        );
        const userId = userRes.insertId;

        const [compRes] = await conn.query(
          'INSERT INTO companies (owner_user_id, name, legal_name, country) VALUES (?, ?, ?, ?)',
          [userId, (companyName || `${name}'s Company`).trim(), (companyName || `${name}'s Company`).trim(), 'India']
        );
        const companyId = compRes.insertId;

        await conn.query('UPDATE users SET company_id = ? WHERE id = ?', [companyId, userId]);

        const [users] = await conn.query('SELECT * FROM users WHERE id = ?', [userId]);
        const [comps] = await conn.query('SELECT * FROM companies WHERE id = ?', [companyId]);

        return { user: users[0], company: comps[0] };
      });
    }

    // Local JSON
    const userId = this.nextId('user');
    const companyId = this.nextId('company');

    const user = {
      id: userId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password_hash: hash,
      picture: '',
      company_id: companyId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const company = {
      id: companyId,
      owner_user_id: userId,
      name: (companyName || `${name}'s Company`).trim(),
      legal_name: (companyName || `${name}'s Company`).trim(),
      registration_no: '',
      gst_no: '',
      email: email.toLowerCase().trim(),
      phone: '',
      address: '',
      city: '',
      state: '',
      country: 'India',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.data.users.push(user);
    this.data.companies.push(company);
    this.saveJson();

    return { user, company };
  }

  async getCompanyById(companyId) {
    if (this.useMySQL) {
      const rows = await mysql.query('SELECT * FROM companies WHERE id = ?', [Number(companyId)]);
      return rows[0] || null;
    }
    return this.data.companies.find(c => c.id === Number(companyId)) || null;
  }

  async updateCompany(companyId, updates) {
    if (this.useMySQL) {
      const sql = `
        UPDATE companies SET 
          name = COALESCE(?, name),
          legal_name = COALESCE(?, legal_name),
          registration_no = COALESCE(?, registration_no),
          gst_no = COALESCE(?, gst_no),
          email = COALESCE(?, email),
          phone = COALESCE(?, phone),
          address = COALESCE(?, address),
          city = COALESCE(?, city),
          state = COALESCE(?, state),
          country = COALESCE(?, country)
        WHERE id = ?
      `;
      await mysql.query(sql, [
        updates.name || null,
        updates.legal_name || null,
        updates.registration_no || null,
        updates.gst_no || null,
        updates.email || null,
        updates.phone || null,
        updates.address || null,
        updates.city || null,
        updates.state || null,
        updates.country || null,
        Number(companyId)
      ]);
      return await this.getCompanyById(companyId);
    }

    const idx = this.data.companies.findIndex(c => c.id === Number(companyId));
    if (idx === -1) throw new Error('Company not found');
    this.data.companies[idx] = {
      ...this.data.companies[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.saveJson();
    return this.data.companies[idx];
  }

  // --- Inventory ---
  async getInventory(userId, filter = {}) {
    if (this.useMySQL) {
      let sql = 'SELECT * FROM inventory WHERE user_id = ?';
      const params = [Number(userId)];
      if (filter.category) {
        sql += ' AND category = ?';
        params.push(filter.category);
      }
      if (filter.lowStockOnly) {
        sql += ' AND quantity <= reorder_level';
      }
      sql += ' ORDER BY id DESC';
      return await mysql.query(sql, params);
    }

    let items = this.data.inventory.filter(i => i.user_id === Number(userId));
    if (filter.category) {
      items = items.filter(i => i.category.toLowerCase() === filter.category.toLowerCase());
    }
    if (filter.lowStockOnly) {
      items = items.filter(i => Number(i.quantity) <= Number(i.reorder_level));
    }
    if (filter.search) {
      const q = filter.search.toLowerCase().trim();
      items = items.filter(i => i.item_name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q));
    }
    return items.sort((a, b) => b.id - a.id);
  }

  async createInventoryItem(userId, { item_name, sku, category, quantity, unit, unit_cost, reorder_level }) {
    if (!item_name || !item_name.trim()) throw new Error('Item name is required');
    const itemSku = sku && sku.trim() ? sku.trim() : `SKU-${Date.now().toString().slice(-6)}`;

    if (this.useMySQL) {
      const res = await mysql.query(
        'INSERT INTO inventory (user_id, item_name, sku, category, quantity, unit, unit_cost, reorder_level) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          Number(userId),
          item_name.trim(),
          itemSku,
          category || 'General',
          Number(quantity) || 0,
          unit || 'units',
          Number(unit_cost) || 0,
          Number(reorder_level) || 0
        ]
      );
      const rows = await mysql.query('SELECT * FROM inventory WHERE id = ?', [res.insertId]);
      return rows[0];
    }

    const id = this.nextId('inventory');
    const newItem = {
      id,
      user_id: Number(userId),
      item_name: item_name.trim(),
      sku: itemSku,
      category: category || 'General',
      quantity: Number(quantity) || 0,
      unit: unit || 'units',
      unit_cost: Number(unit_cost) || 0,
      reorder_level: Number(reorder_level) || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.data.inventory.unshift(newItem);
    this.saveJson();
    return newItem;
  }

  async updateInventoryItem(userId, itemId, updates) {
    if (this.useMySQL) {
      await mysql.query(
        'UPDATE inventory SET item_name = COALESCE(?, item_name), sku = COALESCE(?, sku), category = COALESCE(?, category), quantity = COALESCE(?, quantity), unit = COALESCE(?, unit), unit_cost = COALESCE(?, unit_cost), reorder_level = COALESCE(?, reorder_level) WHERE id = ? AND user_id = ?',
        [
          updates.item_name || null,
          updates.sku || null,
          updates.category || null,
          updates.quantity !== undefined ? Number(updates.quantity) : null,
          updates.unit || null,
          updates.unit_cost !== undefined ? Number(updates.unit_cost) : null,
          updates.reorder_level !== undefined ? Number(updates.reorder_level) : null,
          Number(itemId),
          Number(userId)
        ]
      );
      const rows = await mysql.query('SELECT * FROM inventory WHERE id = ?', [Number(itemId)]);
      return rows[0];
    }

    const idx = this.data.inventory.findIndex(i => i.id === Number(itemId) && i.user_id === Number(userId));
    if (idx === -1) throw new Error('Inventory item not found');
    this.data.inventory[idx] = {
      ...this.data.inventory[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.saveJson();
    return this.data.inventory[idx];
  }

  async deleteInventoryItem(userId, itemId) {
    if (this.useMySQL) {
      await mysql.query('DELETE FROM inventory WHERE id = ? AND user_id = ?', [Number(itemId), Number(userId)]);
      return true;
    }
    this.data.inventory = this.data.inventory.filter(i => !(i.id === Number(itemId) && i.user_id === Number(userId)));
    this.saveJson();
    return true;
  }

  // --- Sales ---
  async getSales(userId) {
    if (this.useMySQL) {
      return await mysql.query('SELECT * FROM sales WHERE user_id = ? ORDER BY issued_date DESC, id DESC', [Number(userId)]);
    }
    return this.data.sales
      .filter(s => s.user_id === Number(userId))
      .sort((a, b) => new Date(b.issued_date) - new Date(a.issued_date));
  }

  async createSale(userId, { invoice_no, customer, issued_date, due_date, amount, status }) {
    if (!customer || !customer.trim()) throw new Error('Customer name is required');
    const invNo = invoice_no && invoice_no.trim() ? invoice_no.trim() : `INV-${Math.floor(1000 + Math.random() * 9000)}`;

    if (this.useMySQL) {
      const res = await mysql.query(
        'INSERT INTO sales (user_id, invoice_no, customer, issued_date, due_date, amount, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          Number(userId),
          invNo,
          customer.trim(),
          issued_date || new Date().toISOString().split('T')[0],
          due_date || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          Number(amount) || 0,
          status || 'Pending'
        ]
      );
      const rows = await mysql.query('SELECT * FROM sales WHERE id = ?', [res.insertId]);
      return rows[0];
    }

    const id = this.nextId('sales');
    const newSale = {
      id,
      user_id: Number(userId),
      invoice_no: invNo,
      customer: customer.trim(),
      issued_date: issued_date || new Date().toISOString().split('T')[0],
      due_date: due_date || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      amount: Number(amount) || 0,
      status: status || 'Pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.data.sales.unshift(newSale);
    this.saveJson();
    return newSale;
  }

  async updateSale(userId, saleId, updates) {
    if (this.useMySQL) {
      await mysql.query(
        'UPDATE sales SET customer = COALESCE(?, customer), issued_date = COALESCE(?, issued_date), due_date = COALESCE(?, due_date), amount = COALESCE(?, amount), status = COALESCE(?, status) WHERE id = ? AND user_id = ?',
        [
          updates.customer || null,
          updates.issued_date || null,
          updates.due_date || null,
          updates.amount !== undefined ? Number(updates.amount) : null,
          updates.status || null,
          Number(saleId),
          Number(userId)
        ]
      );
      const rows = await mysql.query('SELECT * FROM sales WHERE id = ?', [Number(saleId)]);
      return rows[0];
    }

    const idx = this.data.sales.findIndex(s => s.id === Number(saleId) && s.user_id === Number(userId));
    if (idx === -1) throw new Error('Sale not found');
    this.data.sales[idx] = { ...this.data.sales[idx], ...updates, updated_at: new Date().toISOString() };
    this.saveJson();
    return this.data.sales[idx];
  }

  async deleteSale(userId, saleId) {
    if (this.useMySQL) {
      await mysql.query('DELETE FROM sales WHERE id = ? AND user_id = ?', [Number(saleId), Number(userId)]);
      return true;
    }
    this.data.sales = this.data.sales.filter(s => !(s.id === Number(saleId) && s.user_id === Number(userId)));
    this.saveJson();
    return true;
  }

  // --- Expenses ---
  async getExpenses(userId) {
    if (this.useMySQL) {
      return await mysql.query('SELECT * FROM expenses WHERE user_id = ? ORDER BY expense_date DESC, id DESC', [Number(userId)]);
    }
    return this.data.expenses
      .filter(e => e.user_id === Number(userId))
      .sort((a, b) => new Date(b.expense_date) - new Date(a.expense_date));
  }

  async createExpense(userId, { description, category, expense_date, payment_method, amount }) {
    if (!description || !description.trim()) throw new Error('Description is required');

    if (this.useMySQL) {
      const res = await mysql.query(
        'INSERT INTO expenses (user_id, description, category, expense_date, payment_method, amount) VALUES (?, ?, ?, ?, ?, ?)',
        [
          Number(userId),
          description.trim(),
          category || 'General',
          expense_date || new Date().toISOString().split('T')[0],
          payment_method || 'Bank transfer',
          Number(amount) || 0
        ]
      );
      const rows = await mysql.query('SELECT * FROM expenses WHERE id = ?', [res.insertId]);
      return rows[0];
    }

    const id = this.nextId('expenses');
    const newExp = {
      id,
      user_id: Number(userId),
      description: description.trim(),
      category: category || 'General',
      expense_date: expense_date || new Date().toISOString().split('T')[0],
      payment_method: payment_method || 'Bank transfer',
      amount: Number(amount) || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.data.expenses.unshift(newExp);
    this.saveJson();
    return newExp;
  }

  async deleteExpense(userId, expenseId) {
    if (this.useMySQL) {
      await mysql.query('DELETE FROM expenses WHERE id = ? AND user_id = ?', [Number(expenseId), Number(userId)]);
      return true;
    }
    this.data.expenses = this.data.expenses.filter(e => !(e.id === Number(expenseId) && e.user_id === Number(userId)));
    this.saveJson();
    return true;
  }

  // --- Employees / Payroll ---
  async getEmployees(userId) {
    if (this.useMySQL) {
      return await mysql.query('SELECT * FROM employees WHERE user_id = ? ORDER BY id DESC', [Number(userId)]);
    }
    return this.data.employees.filter(e => e.user_id === Number(userId));
  }

  async createEmployee(userId, { name, role, monthly_salary, status }) {
    if (!name || !name.trim()) throw new Error('Employee name is required');

    if (this.useMySQL) {
      const res = await mysql.query(
        'INSERT INTO employees (user_id, name, role, monthly_salary, status) VALUES (?, ?, ?, ?, ?)',
        [Number(userId), name.trim(), role || 'Staff', Number(monthly_salary) || 0, status || 'Active']
      );
      const rows = await mysql.query('SELECT * FROM employees WHERE id = ?', [res.insertId]);
      return rows[0];
    }

    const id = this.nextId('employees');
    const newEmp = {
      id,
      user_id: Number(userId),
      name: name.trim(),
      role: role || 'Staff',
      monthly_salary: Number(monthly_salary) || 0,
      status: status || 'Active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.data.employees.unshift(newEmp);
    this.saveJson();
    return newEmp;
  }

  async updateEmployee(userId, employeeId, updates) {
    if (this.useMySQL) {
      await mysql.query(
        'UPDATE employees SET name = COALESCE(?, name), role = COALESCE(?, role), monthly_salary = COALESCE(?, monthly_salary), status = COALESCE(?, status) WHERE id = ? AND user_id = ?',
        [
          updates.name || null,
          updates.role || null,
          updates.monthly_salary !== undefined ? Number(updates.monthly_salary) : null,
          updates.status || null,
          Number(employeeId),
          Number(userId)
        ]
      );
      const rows = await mysql.query('SELECT * FROM employees WHERE id = ?', [Number(employeeId)]);
      return rows[0];
    }

    const idx = this.data.employees.findIndex(e => e.id === Number(employeeId) && e.user_id === Number(userId));
    if (idx === -1) throw new Error('Employee not found');
    this.data.employees[idx] = { ...this.data.employees[idx], ...updates, updated_at: new Date().toISOString() };
    this.saveJson();
    return this.data.employees[idx];
  }

  async deleteEmployee(userId, employeeId) {
    if (this.useMySQL) {
      await mysql.query('DELETE FROM employees WHERE id = ? AND user_id = ?', [Number(employeeId), Number(userId)]);
      return true;
    }
    this.data.employees = this.data.employees.filter(e => !(e.id === Number(employeeId) && e.user_id === Number(userId)));
    this.saveJson();
    return true;
  }

  // --- Production Runs ---
  async getProductionRuns(userId) {
    if (this.useMySQL) {
      return await mysql.query('SELECT * FROM production_runs WHERE user_id = ? ORDER BY run_date DESC, id DESC', [Number(userId)]);
    }
    return this.data.production_runs
      .filter(p => p.user_id === Number(userId))
      .sort((a, b) => new Date(b.run_date) - new Date(a.run_date));
  }

  async createProductionRun(userId, { run_date, product, quantity, status }) {
    if (!product || !product.trim()) throw new Error('Product name is required');

    if (this.useMySQL) {
      const res = await mysql.query(
        'INSERT INTO production_runs (user_id, run_date, product, quantity, status) VALUES (?, ?, ?, ?, ?)',
        [
          Number(userId),
          run_date || new Date().toISOString().split('T')[0],
          product.trim(),
          Number(quantity) || 0,
          status || 'Planned'
        ]
      );
      const rows = await mysql.query('SELECT * FROM production_runs WHERE id = ?', [res.insertId]);
      return rows[0];
    }

    const id = this.nextId('production_runs');
    const newRun = {
      id,
      user_id: Number(userId),
      run_date: run_date || new Date().toISOString().split('T')[0],
      product: product.trim(),
      quantity: Number(quantity) || 0,
      status: status || 'Planned',
      created_at: new Date().toISOString()
    };
    this.data.production_runs.unshift(newRun);
    this.saveJson();
    return newRun;
  }

  async updateProductionRunStatus(userId, runId, status) {
    if (this.useMySQL) {
      await mysql.query('UPDATE production_runs SET status = ? WHERE id = ? AND user_id = ?', [status, Number(runId), Number(userId)]);
      const rows = await mysql.query('SELECT * FROM production_runs WHERE id = ?', [Number(runId)]);
      return rows[0];
    }

    const idx = this.data.production_runs.findIndex(p => p.id === Number(runId) && p.user_id === Number(userId));
    if (idx === -1) throw new Error('Production run not found');
    this.data.production_runs[idx].status = status;
    this.saveJson();
    return this.data.production_runs[idx];
  }

  // --- Dashboard Aggregates ---
  async getDashboardSummary(userId) {
    const sales = await this.getSales(userId);
    const expenses = await this.getExpenses(userId);
    const inventory = await this.getInventory(userId);
    const employees = await this.getEmployees(userId);

    const totalSales = sales.reduce((sum, s) => sum + Number(s.amount), 0);
    const paidSales = sales.filter(s => s.status === 'Paid').reduce((sum, s) => sum + Number(s.amount), 0);
    const pendingSales = sales.filter(s => s.status === 'Pending').reduce((sum, s) => sum + Number(s.amount), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    const inventoryValue = inventory.reduce((sum, i) => sum + (Number(i.quantity) * Number(i.unit_cost)), 0);
    const lowStockCount = inventory.filter(i => Number(i.quantity) <= Number(i.reorder_level)).length;

    const totalPayroll = employees
      .filter(e => e.status === 'Active')
      .reduce((sum, e) => sum + Number(e.monthly_salary), 0);

    return {
      totalSales: Math.round(totalSales * 100) / 100,
      paidSales: Math.round(paidSales * 100) / 100,
      pendingSales: Math.round(pendingSales * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      netRevenue: Math.round((totalSales - totalExpenses) * 100) / 100,
      inventoryCount: inventory.length,
      inventoryValue: Math.round(inventoryValue * 100) / 100,
      lowStockCount,
      employeeCount: employees.length,
      monthlyPayroll: Math.round(totalPayroll * 100) / 100,
      recentSales: sales.slice(0, 5)
    };
  }
}

const dbManager = new DatabaseManager();

// Automatically attempt MySQL connection on startup
(async () => {
  const connected = await mysql.checkConnection();
  if (connected) {
    dbManager.useMySQL = true;
    console.log('[Database] Connected to MySQL successfully.');
    await mysql.initDatabase();
  } else {
    console.log('[Database] MySQL server not detected. Using high-performance persistent storage.');
  }
})();

module.exports = dbManager;
