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

  async updateUserProfile(id, updates = {}) {
    const userId = Number(id);
    const { name, email, phone, role, department, bio, emergency_contact, picture, preferences } = updates;

    if (this.useMySQL) {
      const fields = [];
      const values = [];

      if (name !== undefined) { fields.push('name = ?'); values.push(name.trim()); }
      if (email !== undefined) { fields.push('email = ?'); values.push(email.toLowerCase().trim()); }
      if (phone !== undefined) { fields.push('phone = ?'); values.push(phone.trim()); }
      if (role !== undefined) { fields.push('role = ?'); values.push(role.trim()); }
      if (department !== undefined) { fields.push('department = ?'); values.push(department.trim()); }
      if (bio !== undefined) { fields.push('bio = ?'); values.push(bio); }
      if (emergency_contact !== undefined) { fields.push('emergency_contact = ?'); values.push(emergency_contact.trim()); }
      if (picture !== undefined) { fields.push('picture = ?'); values.push(picture); }
      if (preferences !== undefined) {
        fields.push('preferences = ?');
        values.push(typeof preferences === 'string' ? preferences : JSON.stringify(preferences));
      }

      if (fields.length > 0) {
        values.push(userId);
        await mysql.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
      }
      return await this.findUserById(userId);
    }

    const user = this.data.users.find(u => u.id === userId);
    if (!user) throw new Error('User not found');
    if (name !== undefined) user.name = name.trim();
    if (email !== undefined) user.email = email.toLowerCase().trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (role !== undefined) user.role = role.trim();
    if (department !== undefined) user.department = department.trim();
    if (bio !== undefined) user.bio = bio;
    if (emergency_contact !== undefined) user.emergency_contact = emergency_contact.trim();
    if (picture !== undefined) user.picture = picture;
    if (preferences !== undefined) user.preferences = preferences;
    user.updated_at = new Date().toISOString();
    this.saveJson();
    return user;
  }

  async changePassword(userId, currentPassword, newPassword) {
    const id = Number(userId);
    let user;
    if (this.useMySQL) {
      const rows = await mysql.query('SELECT * FROM users WHERE id = ?', [id]);
      user = rows[0];
    } else {
      user = this.data.users.find(u => u.id === id);
    }
    if (!user) throw new Error('User not found');

    let isMatch = false;
    if (!user.password_hash) {
      isMatch = currentPassword === 'password123' || currentPassword === 'admin';
    } else {
      isMatch = bcrypt.compareSync(currentPassword, user.password_hash);
    }

    if (!isMatch) {
      const err = new Error('Current password is incorrect');
      err.status = 401;
      throw err;
    }

    if (!newPassword || newPassword.length < 6) {
      const err = new Error('New password must be at least 6 characters long');
      err.status = 400;
      throw err;
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(newPassword, salt);

    if (this.useMySQL) {
      await mysql.query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, id]);
    } else {
      user.password_hash = hash;
      user.updated_at = new Date().toISOString();
      this.saveJson();
    }

    return true;
  }

  async exportWorkspaceBackup(userId, companyId) {
    const compId = await this.resolveCompanyId(userId, companyId);
    const company = await this.getCompanyById(compId);
    const inventory = await this.getInventory(userId, compId);
    const sales = await this.getSales(userId, compId);
    const expenses = await this.getExpenses(userId, compId);
    const employees = await this.getEmployees(userId, compId);
    const production = await this.getProductionRuns(userId, compId);

    return {
      appName: 'ForgeLedger',
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      company: company || { id: compId, name: 'Workspace' },
      stats: {
        totalInventoryItems: inventory.length,
        finishedGoodsCount: inventory.filter(i => i.category !== 'Raw material').length,
        rawMaterialsCount: inventory.filter(i => i.category === 'Raw material').length,
        totalSales: sales.length,
        totalExpenses: expenses.length,
        totalEmployees: employees.length,
        totalProductionRuns: production.length
      },
      data: {
        company,
        inventory,
        sales,
        expenses,
        employees,
        production
      }
    };
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
    if (!companyId) return null;
    if (this.useMySQL) {
      const rows = await mysql.query('SELECT * FROM companies WHERE id = ?', [Number(companyId)]);
      return rows[0] || null;
    }
    return this.data.companies.find(c => c.id === Number(companyId)) || null;
  }

  async getUserCompanies(userId) {
    if (this.useMySQL) {
      return await mysql.query('SELECT * FROM companies WHERE owner_user_id = ? ORDER BY id ASC', [Number(userId)]);
    }
    return this.data.companies.filter(c => Number(c.owner_user_id) === Number(userId));
  }

  async getUserCompanyCount(userId) {
    if (this.useMySQL) {
      const rows = await mysql.query('SELECT COUNT(*) AS cnt FROM companies WHERE owner_user_id = ?', [Number(userId)]);
      return Number(rows[0]?.cnt || 0);
    }
    return this.data.companies.filter(c => Number(c.owner_user_id) === Number(userId)).length;
  }

  async createCompanyForUser(userId, { name, legal_name, registration_no, gst_no, email, phone, address, city, state, country }) {
    const count = await this.getUserCompanyCount(userId);
    if (count >= 3) {
      const err = new Error('A single user can manage a maximum of 3 companies.');
      err.status = 400;
      throw err;
    }

    const companyName = (name || `Company ${count + 1}`).trim();
    if (this.useMySQL) {
      const res = await mysql.query(
        'INSERT INTO companies (owner_user_id, name, legal_name, registration_no, gst_no, email, phone, address, city, state, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          Number(userId),
          companyName,
          (legal_name || companyName).trim(),
          (registration_no || '').trim(),
          (gst_no || '').trim(),
          (email || '').trim(),
          (phone || '').trim(),
          (address || '').trim(),
          (city || '').trim(),
          (state || '').trim(),
          country || 'India'
        ]
      );
      const newCompanyId = res.insertId;
      await this.switchActiveCompany(userId, newCompanyId);
      return await this.getCompanyById(newCompanyId);
    }

    const newCompanyId = this.nextId('company');
    const newCompany = {
      id: newCompanyId,
      owner_user_id: Number(userId),
      name: companyName,
      legal_name: (legal_name || companyName).trim(),
      registration_no: (registration_no || '').trim(),
      gst_no: (gst_no || '').trim(),
      email: (email || '').trim(),
      phone: (phone || '').trim(),
      address: (address || '').trim(),
      city: (city || '').trim(),
      state: (state || '').trim(),
      country: country || 'India',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.data.companies.push(newCompany);
    await this.switchActiveCompany(userId, newCompanyId);
    this.saveJson();
    return newCompany;
  }

  async switchActiveCompany(userId, companyId) {
    const comp = await this.getCompanyById(companyId);
    if (!comp || Number(comp.owner_user_id) !== Number(userId)) {
      const err = new Error('Access denied to this company.');
      err.status = 403;
      throw err;
    }

    if (this.useMySQL) {
      await mysql.query('UPDATE users SET company_id = ? WHERE id = ?', [Number(companyId), Number(userId)]);
      return comp;
    }

    const user = this.data.users.find(u => Number(u.id) === Number(userId));
    if (user) {
      user.company_id = Number(companyId);
      this.saveJson();
    }
    return comp;
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

  async getTeamMembers(companyId) {
    const compId = Number(companyId);
    const company = await this.getCompanyById(compId);
    const ownerId = company ? Number(company.owner_user_id) : 1;

    const defaultTeam = [
      {
        name: 'Ramesh Kumar',
        email: 'ramesh.operator@rivertonworks.local',
        phone: '+91 98765 11223',
        role: 'operator',
        department: 'Shop Floor & Machining',
        picture: 'gradient:from-amber-500 to-orange-600'
      },
      {
        name: 'Suresh Patel',
        email: 'suresh.clerk@rivertonworks.local',
        phone: '+91 98765 33445',
        role: 'clerk',
        department: 'Warehouse & Logistics',
        picture: 'gradient:from-emerald-500 to-teal-600'
      },
      {
        name: 'Priya Nair',
        email: 'priya.accountant@rivertonworks.local',
        phone: '+91 98765 55667',
        role: 'accountant',
        department: 'Accounts & Tax Compliance',
        picture: 'gradient:from-indigo-500 to-purple-600'
      }
    ];

    if (this.useMySQL) {
      let members = await mysql.query(
        'SELECT id, name, email, phone, role, department, bio, emergency_contact, picture, company_id, created_at, updated_at FROM users WHERE company_id = ? ORDER BY id ASC',
        [compId]
      );

      if (members.length <= 1) {
        for (const tm of defaultTeam) {
          const [exists] = await mysql.query('SELECT id FROM users WHERE email = ?', [tm.email]);
          if (!exists || exists.length === 0) {
            await mysql.query(
              'INSERT INTO users (name, email, phone, role, department, picture, company_id, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
              [tm.name, tm.email, tm.phone, tm.role, tm.department, tm.picture, compId, bcrypt.hashSync('password123', 10)]
            );
          }
        }
        members = await mysql.query(
          'SELECT id, name, email, phone, role, department, bio, emergency_contact, picture, company_id, created_at, updated_at FROM users WHERE company_id = ? ORDER BY id ASC',
          [compId]
        );
      }

      return members.map(m => ({
        ...m,
        is_owner: Number(m.id) === ownerId,
        status: 'Active'
      }));
    }

    let members = this.data.users.filter(u => Number(u.company_id) === compId);
    if (members.length <= 1) {
      for (const tm of defaultTeam) {
        const already = this.data.users.find(u => u.email === tm.email);
        if (!already) {
          const newId = this.nextId('user');
          const newUser = {
            id: newId,
            ...tm,
            company_id: compId,
            password_hash: bcrypt.hashSync('password123', 10),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          this.data.users.push(newUser);
        }
      }
      this.saveJson();
      members = this.data.users.filter(u => Number(u.company_id) === compId);
    }

    return members.map(m => {
      const safe = { ...m };
      delete safe.password_hash;
      safe.is_owner = Number(m.id) === ownerId;
      safe.status = 'Active';
      return safe;
    });
  }

  async inviteTeamMember(companyId, { name, email, role, department, phone }) {
    const compId = Number(companyId);
    if (!name || !name.trim()) throw new Error('Member name is required');
    if (!email || !email.includes('@')) throw new Error('Valid email address is required');

    const cleanEmail = email.toLowerCase().trim();
    const cleanRole = ['owner', 'operator', 'clerk', 'accountant'].includes(role) ? role : 'operator';
    const cleanDept = (department || 'Operations').trim();
    const cleanPhone = (phone || '').trim();

    if (this.useMySQL) {
      const [existing] = await mysql.query('SELECT id, company_id FROM users WHERE email = ?', [cleanEmail]);
      if (existing && existing.length > 0) {
        if (Number(existing[0].company_id) === compId) {
          throw new Error(`A team member with email ${cleanEmail} is already in this company.`);
        }
        await mysql.query('UPDATE users SET company_id = ?, role = ?, department = ? WHERE id = ?', [compId, cleanRole, cleanDept, existing[0].id]);
        const [updated] = await mysql.query('SELECT id, name, email, phone, role, department, picture, company_id, created_at FROM users WHERE id = ?', [existing[0].id]);
        return { ...updated[0], is_owner: false, status: 'Active' };
      }

      const res = await mysql.query(
        'INSERT INTO users (name, email, phone, role, department, picture, company_id, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [name.trim(), cleanEmail, cleanPhone, cleanRole, cleanDept, '', compId, bcrypt.hashSync('password123', 10)]
      );
      return {
        id: res.insertId,
        name: name.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        role: cleanRole,
        department: cleanDept,
        company_id: compId,
        is_owner: false,
        status: 'Active',
        created_at: new Date().toISOString()
      };
    }

    const existing = this.data.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing && Number(existing.company_id) === compId) {
      throw new Error(`A team member with email ${cleanEmail} is already in this company.`);
    }

    const newId = this.nextId('user');
    const newMember = {
      id: newId,
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      role: cleanRole,
      department: cleanDept,
      picture: '',
      company_id: compId,
      password_hash: bcrypt.hashSync('password123', 10),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.data.users.push(newMember);
    this.saveJson();

    const safe = { ...newMember };
    delete safe.password_hash;
    safe.is_owner = false;
    safe.status = 'Active';
    return safe;
  }

  async updateTeamMemberRole(companyId, memberId, { role, department }) {
    const compId = Number(companyId);
    const mId = Number(memberId);
    const company = await this.getCompanyById(compId);
    if (company && Number(company.owner_user_id) === mId) {
      throw new Error('Cannot modify role for the primary workspace owner.');
    }

    const cleanRole = ['owner', 'operator', 'clerk', 'accountant'].includes(role) ? role : 'operator';

    if (this.useMySQL) {
      await mysql.query('UPDATE users SET role = ?, department = COALESCE(?, department) WHERE id = ? AND company_id = ?', [cleanRole, department || null, mId, compId]);
      const [rows] = await mysql.query('SELECT id, name, email, phone, role, department, picture, company_id FROM users WHERE id = ?', [mId]);
      if (!rows || rows.length === 0) throw new Error('Team member not found');
      return { ...rows[0], is_owner: false, status: 'Active' };
    }

    const user = this.data.users.find(u => Number(u.id) === mId && Number(u.company_id) === compId);
    if (!user) throw new Error('Team member not found');
    user.role = cleanRole;
    if (department !== undefined) user.department = department.trim();
    user.updated_at = new Date().toISOString();
    this.saveJson();

    const safe = { ...user };
    delete safe.password_hash;
    safe.is_owner = false;
    safe.status = 'Active';
    return safe;
  }

  async removeTeamMember(companyId, memberId) {
    const compId = Number(companyId);
    const mId = Number(memberId);
    const company = await this.getCompanyById(compId);
    if (company && Number(company.owner_user_id) === mId) {
      throw new Error('Cannot remove the primary workspace owner.');
    }

    if (this.useMySQL) {
      await mysql.query('DELETE FROM users WHERE id = ? AND company_id = ?', [mId, compId]);
      return true;
    }

    const idx = this.data.users.findIndex(u => Number(u.id) === mId && Number(u.company_id) === compId);
    if (idx === -1) throw new Error('Team member not found');
    this.data.users.splice(idx, 1);
    this.saveJson();
    return true;
  }

  // Helper to extract active company id
  async resolveCompanyId(userId, companyId) {
    if (companyId) return Number(companyId);
    const user = await this.findUserById(userId);
    return user ? Number(user.company_id) : 1;
  }

  // --- Inventory ---
  async getInventory(userId, companyIdOrFilter, filterArg = {}) {
    let companyId = null;
    let filter = {};
    if (typeof companyIdOrFilter === 'object' && companyIdOrFilter !== null) {
      filter = companyIdOrFilter;
      companyId = await this.resolveCompanyId(userId, null);
    } else {
      companyId = await this.resolveCompanyId(userId, companyIdOrFilter);
      filter = filterArg || {};
    }

    if (this.useMySQL) {
      let sql = 'SELECT * FROM inventory WHERE user_id = ? AND (company_id = ? OR (company_id IS NULL AND ? = (SELECT company_id FROM users WHERE id = ?)))';
      const params = [Number(userId), Number(companyId), Number(companyId), Number(userId)];
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

    let items = this.data.inventory.filter(i => Number(i.user_id) === Number(userId) && (Number(i.company_id) === Number(companyId) || (!i.company_id && Number(companyId) === 1)));
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

  async createInventoryItem(userId, companyIdOrData, dataArg) {
    let companyId = null;
    let data = {};
    if (dataArg !== undefined) {
      companyId = await this.resolveCompanyId(userId, companyIdOrData);
      data = dataArg;
    } else {
      data = companyIdOrData || {};
      companyId = await this.resolveCompanyId(userId, data.company_id);
    }

    const { item_name, sku, category, quantity, unit, unit_cost, reorder_level } = data;
    if (!item_name || !item_name.trim()) throw new Error('Item name is required');
    const itemSku = sku && sku.trim() ? sku.trim() : `SKU-${Date.now().toString().slice(-6)}`;

    if (this.useMySQL) {
      const res = await mysql.query(
        'INSERT INTO inventory (user_id, company_id, item_name, sku, category, quantity, unit, unit_cost, reorder_level) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          Number(userId),
          Number(companyId),
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
      company_id: Number(companyId),
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

  async updateInventoryItem(userId, companyIdOrItemId, itemIdOrUpdates, updatesArg) {
    let companyId = null;
    let itemId = null;
    let updates = {};
    if (updatesArg !== undefined) {
      companyId = await this.resolveCompanyId(userId, companyIdOrItemId);
      itemId = itemIdOrUpdates;
      updates = updatesArg;
    } else {
      companyId = await this.resolveCompanyId(userId, null);
      itemId = companyIdOrItemId;
      updates = itemIdOrUpdates;
    }

    if (this.useMySQL) {
      await mysql.query(
        'UPDATE inventory SET item_name = COALESCE(?, item_name), sku = COALESCE(?, sku), category = COALESCE(?, category), quantity = COALESCE(?, quantity), unit = COALESCE(?, unit), unit_cost = COALESCE(?, unit_cost), reorder_level = COALESCE(?, reorder_level) WHERE id = ? AND user_id = ? AND (company_id = ? OR company_id IS NULL)',
        [
          updates.item_name || null,
          updates.sku || null,
          updates.category || null,
          updates.quantity !== undefined ? Number(updates.quantity) : null,
          updates.unit || null,
          updates.unit_cost !== undefined ? Number(updates.unit_cost) : null,
          updates.reorder_level !== undefined ? Number(updates.reorder_level) : null,
          Number(itemId),
          Number(userId),
          Number(companyId)
        ]
      );
      const rows = await mysql.query('SELECT * FROM inventory WHERE id = ?', [Number(itemId)]);
      return rows[0];
    }

    const idx = this.data.inventory.findIndex(i => i.id === Number(itemId) && i.user_id === Number(userId) && (Number(i.company_id) === Number(companyId) || !i.company_id));
    if (idx === -1) throw new Error('Inventory item not found');
    this.data.inventory[idx] = {
      ...this.data.inventory[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.saveJson();
    return this.data.inventory[idx];
  }

  async deleteInventoryItem(userId, companyIdOrItemId, itemIdArg) {
    const companyId = itemIdArg !== undefined ? await this.resolveCompanyId(userId, companyIdOrItemId) : await this.resolveCompanyId(userId, null);
    const itemId = itemIdArg !== undefined ? itemIdArg : companyIdOrItemId;

    if (this.useMySQL) {
      await mysql.query('DELETE FROM inventory WHERE id = ? AND user_id = ? AND (company_id = ? OR company_id IS NULL)', [Number(itemId), Number(userId), Number(companyId)]);
      return true;
    }
    this.data.inventory = this.data.inventory.filter(i => !(i.id === Number(itemId) && i.user_id === Number(userId) && (Number(i.company_id) === Number(companyId) || !i.company_id)));
    this.saveJson();
    return true;
  }

  // --- Sales ---
  async getSales(userId, companyId) {
    const compId = await this.resolveCompanyId(userId, companyId);
    let rows = [];
    if (this.useMySQL) {
      rows = await mysql.query(
        'SELECT * FROM sales WHERE user_id = ? AND (company_id = ? OR (company_id IS NULL AND ? = (SELECT company_id FROM users WHERE id = ?))) ORDER BY issued_date DESC, id DESC',
        [Number(userId), Number(compId), Number(compId), Number(userId)]
      );
    } else {
      rows = this.data.sales
        .filter(s => Number(s.user_id) === Number(userId) && (Number(s.company_id) === Number(compId) || (!s.company_id && Number(compId) === 1)))
        .sort((a, b) => new Date(b.issued_date) - new Date(a.issued_date));
    }
    return rows.map(s => {
      if (s.items && typeof s.items === 'string') {
        try { s.items = JSON.parse(s.items); } catch (_) {}
      }
      return s;
    });
  }

  async createSale(userId, companyIdOrData, dataArg) {
    const compId = dataArg !== undefined ? await this.resolveCompanyId(userId, companyIdOrData) : await this.resolveCompanyId(userId, null);
    const data = dataArg !== undefined ? dataArg : companyIdOrData;
    const { invoice_no, customer, issued_date, due_date, amount, status, items } = data;

    if (!customer || !customer.trim()) throw new Error('Customer name is required');
    const invNo = invoice_no && invoice_no.trim() ? invoice_no.trim() : `INV-${Math.floor(1000 + Math.random() * 9000)}`;
    const itemsJson = items && Array.isArray(items) ? JSON.stringify(items) : (typeof items === 'string' ? items : null);

    if (this.useMySQL) {
      const res = await mysql.query(
        'INSERT INTO sales (user_id, company_id, invoice_no, customer, issued_date, due_date, amount, status, items) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          Number(userId),
          Number(compId),
          invNo,
          customer.trim(),
          issued_date || new Date().toISOString().split('T')[0],
          due_date || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          Number(amount) || 0,
          status || 'Pending',
          itemsJson
        ]
      );

      // Automatic Stock Decrement on Payment
      if ((status || '').toLowerCase() === 'paid' && items && Array.isArray(items)) {
        for (const item of items) {
          const qty = Number(item.quantity) || 0;
          if (qty > 0) {
            if (item.product_id) {
              await mysql.query(
                'UPDATE inventory SET quantity = GREATEST(0, quantity - ?) WHERE id = ? AND user_id = ? AND (company_id = ? OR company_id IS NULL)',
                [qty, Number(item.product_id), Number(userId), Number(compId)]
              );
            } else if (item.product_name) {
              await mysql.query(
                'UPDATE inventory SET quantity = GREATEST(0, quantity - ?) WHERE item_name = ? AND user_id = ? AND (company_id = ? OR company_id IS NULL)',
                [qty, item.product_name, Number(userId), Number(compId)]
              );
            }
          }
        }
      }

      const rows = await mysql.query('SELECT * FROM sales WHERE id = ?', [res.insertId]);
      const created = rows[0];
      if (created && created.items && typeof created.items === 'string') {
        try { created.items = JSON.parse(created.items); } catch (_) {}
      }
      return created;
    }

    const id = this.nextId('sales');
    const parsedItems = items && Array.isArray(items) ? items : (itemsJson ? JSON.parse(itemsJson) : null);
    const newSale = {
      id,
      user_id: Number(userId),
      company_id: Number(compId),
      invoice_no: invNo,
      customer: customer.trim(),
      issued_date: issued_date || new Date().toISOString().split('T')[0],
      due_date: due_date || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      amount: Number(amount) || 0,
      status: status || 'Pending',
      items: parsedItems,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.data.sales.unshift(newSale);

    // Fallback storage: Automatic Stock Decrement on Payment
    if ((status || '').toLowerCase() === 'paid' && parsedItems && Array.isArray(parsedItems)) {
      for (const item of parsedItems) {
        const qty = Number(item.quantity) || 0;
        if (qty > 0) {
          const invItem = this.data.inventory.find(i => 
            (item.product_id && Number(i.id) === Number(item.product_id)) ||
            (item.product_name && i.item_name === item.product_name)
          );
          if (invItem) {
            invItem.quantity = Math.max(0, (Number(invItem.quantity) || 0) - qty);
            invItem.updated_at = new Date().toISOString();
          }
        }
      }
    }

    this.saveJson();
    return newSale;
  }

  async updateSale(userId, companyIdOrSaleId, saleIdOrUpdates, updatesArg) {
    const compId = updatesArg !== undefined ? await this.resolveCompanyId(userId, companyIdOrSaleId) : await this.resolveCompanyId(userId, null);
    const saleId = updatesArg !== undefined ? saleIdOrUpdates : companyIdOrSaleId;
    const updates = updatesArg !== undefined ? updatesArg : saleIdOrUpdates;

    let prevSale = null;
    if (this.useMySQL) {
      const prevRows = await mysql.query('SELECT * FROM sales WHERE id = ?', [Number(saleId)]);
      prevSale = prevRows[0];
    } else {
      prevSale = this.data.sales.find(s => s.id === Number(saleId));
    }

    const itemsJson = updates.items !== undefined ? (Array.isArray(updates.items) ? JSON.stringify(updates.items) : updates.items) : null;

    if (this.useMySQL) {
      await mysql.query(
        'UPDATE sales SET customer = COALESCE(?, customer), issued_date = COALESCE(?, issued_date), due_date = COALESCE(?, due_date), amount = COALESCE(?, amount), status = COALESCE(?, status), items = COALESCE(?, items) WHERE id = ? AND user_id = ? AND (company_id = ? OR company_id IS NULL)',
        [
          updates.customer || null,
          updates.issued_date || null,
          updates.due_date || null,
          updates.amount !== undefined ? Number(updates.amount) : null,
          updates.status || null,
          itemsJson,
          Number(saleId),
          Number(userId),
          Number(compId)
        ]
      );

      // Decrement stock if status changed to Paid!
      if (prevSale && (prevSale.status || '').toLowerCase() !== 'paid' && (updates.status || '').toLowerCase() === 'paid') {
        let saleItems = [];
        try {
          saleItems = updates.items || (prevSale.items ? JSON.parse(prevSale.items) : []);
        } catch (_) {}
        if (Array.isArray(saleItems)) {
          for (const item of saleItems) {
            const qty = Number(item.quantity) || 0;
            if (qty > 0) {
              if (item.product_id) {
                await mysql.query(
                  'UPDATE inventory SET quantity = GREATEST(0, quantity - ?) WHERE id = ? AND user_id = ? AND (company_id = ? OR company_id IS NULL)',
                  [qty, Number(item.product_id), Number(userId), Number(compId)]
                );
              } else if (item.product_name) {
                await mysql.query(
                  'UPDATE inventory SET quantity = GREATEST(0, quantity - ?) WHERE item_name = ? AND user_id = ? AND (company_id = ? OR company_id IS NULL)',
                  [qty, item.product_name, Number(userId), Number(compId)]
                );
              }
            }
          }
        }
      }

      const rows = await mysql.query('SELECT * FROM sales WHERE id = ?', [Number(saleId)]);
      const updated = rows[0];
      if (updated && updated.items && typeof updated.items === 'string') {
        try { updated.items = JSON.parse(updated.items); } catch (_) {}
      }
      return updated;
    }

    const idx = this.data.sales.findIndex(s => s.id === Number(saleId) && s.user_id === Number(userId) && (Number(s.company_id) === Number(compId) || !s.company_id));
    if (idx === -1) throw new Error('Sale not found');
    const oldStatus = (this.data.sales[idx].status || '').toLowerCase();
    this.data.sales[idx] = { ...this.data.sales[idx], ...updates, updated_at: new Date().toISOString() };

    if (oldStatus !== 'paid' && (updates.status || '').toLowerCase() === 'paid') {
      const saleItems = updates.items || this.data.sales[idx].items || [];
      if (Array.isArray(saleItems)) {
        for (const item of saleItems) {
          const qty = Number(item.quantity) || 0;
          if (qty > 0) {
            const invItem = this.data.inventory.find(i => 
              (item.product_id && Number(i.id) === Number(item.product_id)) ||
              (item.product_name && i.item_name === item.product_name)
            );
            if (invItem) {
              invItem.quantity = Math.max(0, (Number(invItem.quantity) || 0) - qty);
              invItem.updated_at = new Date().toISOString();
            }
          }
        }
      }
    }

    this.saveJson();
    return this.data.sales[idx];
  }

  async deleteSale(userId, companyIdOrSaleId, saleIdArg) {
    const compId = saleIdArg !== undefined ? await this.resolveCompanyId(userId, companyIdOrSaleId) : await this.resolveCompanyId(userId, null);
    const saleId = saleIdArg !== undefined ? saleIdArg : companyIdOrSaleId;

    if (this.useMySQL) {
      await mysql.query('DELETE FROM sales WHERE id = ? AND user_id = ? AND (company_id = ? OR company_id IS NULL)', [Number(saleId), Number(userId), Number(compId)]);
      return true;
    }
    this.data.sales = this.data.sales.filter(s => !(s.id === Number(saleId) && s.user_id === Number(userId) && (Number(s.company_id) === Number(compId) || !s.company_id)));
    this.saveJson();
    return true;
  }

  // --- Expenses ---
  async getExpenses(userId, companyId) {
    const compId = await this.resolveCompanyId(userId, companyId);
    if (this.useMySQL) {
      return await mysql.query(
        'SELECT * FROM expenses WHERE user_id = ? AND (company_id = ? OR (company_id IS NULL AND ? = (SELECT company_id FROM users WHERE id = ?))) ORDER BY expense_date DESC, id DESC',
        [Number(userId), Number(compId), Number(compId), Number(userId)]
      );
    }
    return this.data.expenses
      .filter(e => Number(e.user_id) === Number(userId) && (Number(e.company_id) === Number(compId) || (!e.company_id && Number(compId) === 1)))
      .sort((a, b) => new Date(b.expense_date) - new Date(a.expense_date));
  }

  async createExpense(userId, companyIdOrData, dataArg) {
    const compId = dataArg !== undefined ? await this.resolveCompanyId(userId, companyIdOrData) : await this.resolveCompanyId(userId, null);
    const data = dataArg !== undefined ? dataArg : companyIdOrData;
    const { description, category, expense_date, payment_method, amount } = data;

    if (!description || !description.trim()) throw new Error('Description is required');

    if (this.useMySQL) {
      const res = await mysql.query(
        'INSERT INTO expenses (user_id, company_id, description, category, expense_date, payment_method, amount) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          Number(userId),
          Number(compId),
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
      company_id: Number(compId),
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

  async deleteExpense(userId, companyIdOrExpId, expIdArg) {
    const compId = expIdArg !== undefined ? await this.resolveCompanyId(userId, companyIdOrExpId) : await this.resolveCompanyId(userId, null);
    const expenseId = expIdArg !== undefined ? expIdArg : companyIdOrExpId;

    if (this.useMySQL) {
      await mysql.query('DELETE FROM expenses WHERE id = ? AND user_id = ? AND (company_id = ? OR company_id IS NULL)', [Number(expenseId), Number(userId), Number(compId)]);
      return true;
    }
    this.data.expenses = this.data.expenses.filter(e => !(e.id === Number(expenseId) && e.user_id === Number(userId) && (Number(e.company_id) === Number(compId) || !e.company_id)));
    this.saveJson();
    return true;
  }

  // --- Employees / Payroll ---
  async getEmployees(userId, companyId) {
    const compId = await this.resolveCompanyId(userId, companyId);
    if (this.useMySQL) {
      return await mysql.query(
        'SELECT * FROM employees WHERE user_id = ? AND (company_id = ? OR (company_id IS NULL AND ? = (SELECT company_id FROM users WHERE id = ?))) ORDER BY id DESC',
        [Number(userId), Number(compId), Number(compId), Number(userId)]
      );
    }
    return this.data.employees.filter(e => Number(e.user_id) === Number(userId) && (Number(e.company_id) === Number(compId) || (!e.company_id && Number(compId) === 1)));
  }

  async createEmployee(userId, companyIdOrData, dataArg) {
    const compId = dataArg !== undefined ? await this.resolveCompanyId(userId, companyIdOrData) : await this.resolveCompanyId(userId, null);
    const data = dataArg !== undefined ? dataArg : companyIdOrData;
    const { name, role, monthly_salary, status } = data;

    if (!name || !name.trim()) throw new Error('Employee name is required');

    if (this.useMySQL) {
      const res = await mysql.query(
        'INSERT INTO employees (user_id, company_id, name, role, monthly_salary, status) VALUES (?, ?, ?, ?, ?, ?)',
        [Number(userId), Number(compId), name.trim(), role || 'Staff', Number(monthly_salary) || 0, status || 'Active']
      );
      const rows = await mysql.query('SELECT * FROM employees WHERE id = ?', [res.insertId]);
      return rows[0];
    }

    const id = this.nextId('employees');
    const newEmp = {
      id,
      user_id: Number(userId),
      company_id: Number(compId),
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

  async updateEmployee(userId, companyIdOrEmpId, empIdOrUpdates, updatesArg) {
    const compId = updatesArg !== undefined ? await this.resolveCompanyId(userId, companyIdOrEmpId) : await this.resolveCompanyId(userId, null);
    const employeeId = updatesArg !== undefined ? empIdOrUpdates : companyIdOrEmpId;
    const updates = updatesArg !== undefined ? updatesArg : empIdOrUpdates;

    if (this.useMySQL) {
      await mysql.query(
        'UPDATE employees SET name = COALESCE(?, name), role = COALESCE(?, role), monthly_salary = COALESCE(?, monthly_salary), status = COALESCE(?, status) WHERE id = ? AND user_id = ? AND (company_id = ? OR company_id IS NULL)',
        [
          updates.name || null,
          updates.role || null,
          updates.monthly_salary !== undefined ? Number(updates.monthly_salary) : null,
          updates.status || null,
          Number(employeeId),
          Number(userId),
          Number(compId)
        ]
      );
      const rows = await mysql.query('SELECT * FROM employees WHERE id = ?', [Number(employeeId)]);
      return rows[0];
    }

    const idx = this.data.employees.findIndex(e => e.id === Number(employeeId) && e.user_id === Number(userId) && (Number(e.company_id) === Number(compId) || !e.company_id));
    if (idx === -1) throw new Error('Employee not found');
    this.data.employees[idx] = { ...this.data.employees[idx], ...updates, updated_at: new Date().toISOString() };
    this.saveJson();
    return this.data.employees[idx];
  }

  async deleteEmployee(userId, companyIdOrEmpId, empIdArg) {
    const compId = empIdArg !== undefined ? await this.resolveCompanyId(userId, companyIdOrEmpId) : await this.resolveCompanyId(userId, null);
    const employeeId = empIdArg !== undefined ? empIdArg : companyIdOrEmpId;

    if (this.useMySQL) {
      await mysql.query('DELETE FROM employees WHERE id = ? AND user_id = ? AND (company_id = ? OR company_id IS NULL)', [Number(employeeId), Number(userId), Number(compId)]);
      return true;
    }
    this.data.employees = this.data.employees.filter(e => !(e.id === Number(employeeId) && e.user_id === Number(userId) && (Number(e.company_id) === Number(compId) || !e.company_id)));
    this.saveJson();
    return true;
  }

  // --- Production Runs ---
  async getProductionRuns(userId, companyId) {
    const compId = await this.resolveCompanyId(userId, companyId);
    if (this.useMySQL) {
      return await mysql.query(
        'SELECT * FROM production_runs WHERE user_id = ? AND (company_id = ? OR (company_id IS NULL AND ? = (SELECT company_id FROM users WHERE id = ?))) ORDER BY run_date DESC, id DESC',
        [Number(userId), Number(compId), Number(compId), Number(userId)]
      );
    }
    return this.data.production_runs
      .filter(p => Number(p.user_id) === Number(userId) && (Number(p.company_id) === Number(compId) || (!p.company_id && Number(compId) === 1)))
      .sort((a, b) => new Date(b.run_date) - new Date(a.run_date));
  }

  async createProductionRun(userId, companyIdOrData, dataArg) {
    const compId = dataArg !== undefined ? await this.resolveCompanyId(userId, companyIdOrData) : await this.resolveCompanyId(userId, null);
    const data = dataArg !== undefined ? dataArg : companyIdOrData;
    const { run_date, product, quantity, status } = data;

    if (!product || !product.trim()) throw new Error('Product name is required');

    if (this.useMySQL) {
      const res = await mysql.query(
        'INSERT INTO production_runs (user_id, company_id, run_date, product, quantity, status) VALUES (?, ?, ?, ?, ?, ?)',
        [
          Number(userId),
          Number(compId),
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
      company_id: Number(compId),
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

  async updateProductionRunStatus(userId, companyIdOrRunId, runIdOrStatus, statusArg) {
    const compId = statusArg !== undefined ? await this.resolveCompanyId(userId, companyIdOrRunId) : await this.resolveCompanyId(userId, null);
    const runId = statusArg !== undefined ? runIdOrStatus : companyIdOrRunId;
    const status = statusArg !== undefined ? statusArg : runIdOrStatus;

    if (this.useMySQL) {
      await mysql.query('UPDATE production_runs SET status = ? WHERE id = ? AND user_id = ? AND (company_id = ? OR company_id IS NULL)', [status, Number(runId), Number(userId), Number(compId)]);
      const rows = await mysql.query('SELECT * FROM production_runs WHERE id = ?', [Number(runId)]);
      return rows[0];
    }

    const idx = this.data.production_runs.findIndex(p => p.id === Number(runId) && p.user_id === Number(userId) && (Number(p.company_id) === Number(compId) || !p.company_id));
    if (idx === -1) throw new Error('Production run not found');
    this.data.production_runs[idx].status = status;
    this.saveJson();
    return this.data.production_runs[idx];
  }

  async deleteProductionRun(userId, companyIdOrRunId, runIdArg) {
    const compId = runIdArg !== undefined ? await this.resolveCompanyId(userId, companyIdOrRunId) : await this.resolveCompanyId(userId, null);
    const runId = runIdArg !== undefined ? runIdArg : companyIdOrRunId;

    if (this.useMySQL) {
      await mysql.query('DELETE FROM production_runs WHERE id = ? AND user_id = ? AND (company_id = ? OR company_id IS NULL)', [Number(runId), Number(userId), Number(compId)]);
      return true;
    }
    this.data.production_runs = this.data.production_runs.filter(p => !(p.id === Number(runId) && p.user_id === Number(userId) && (Number(p.company_id) === Number(compId) || !p.company_id)));
    this.saveJson();
    return true;
  }

  // --- Dashboard Aggregates ---
  async getDashboardSummary(userId, companyId) {
    const compId = await this.resolveCompanyId(userId, companyId);
    const sales = await this.getSales(userId, compId);
    const expenses = await this.getExpenses(userId, compId);
    const inventory = await this.getInventory(userId, compId);
    const employees = await this.getEmployees(userId, compId);

    const totalSales = sales.reduce((sum, s) => sum + Number(s.amount), 0);
    const paidSales = sales.filter(s => s.status === 'Paid').reduce((sum, s) => sum + Number(s.amount), 0);
    const pendingSales = sales.filter(s => s.status === 'Pending').reduce((sum, s) => sum + Number(s.amount), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    const inventoryValue = inventory.reduce((sum, i) => sum + (Number(i.quantity) * Number(i.unit_cost)), 0);
    const lowStockCount = inventory.filter(i => Number(i.quantity) <= (Number(i.reorder_level) || 5)).length;

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
