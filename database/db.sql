-- ForgeLedger Database Schema & Seed Data
-- Reference: Lanka Shanath, "Integrated Manufacturing Workspace for Small Manufacturers"
-- Compatible with MySQL 8.0+ / MariaDB (Railway & Local XAMPP/WAMP/Docker)

DROP TABLE IF EXISTS production_runs;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS sales;
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NULL,
  picture VARCHAR(500) NOT NULL DEFAULT '',
  company_id INT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE companies (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  owner_user_id INT UNSIGNED NOT NULL,
  name VARCHAR(160) NOT NULL,
  legal_name VARCHAR(180) NOT NULL DEFAULT '',
  registration_no VARCHAR(100) NOT NULL DEFAULT '',
  gst_no VARCHAR(50) NOT NULL DEFAULT '',
  email VARCHAR(190) NOT NULL DEFAULT '',
  phone VARCHAR(50) NOT NULL DEFAULT '',
  address VARCHAR(500) NOT NULL DEFAULT '',
  city VARCHAR(100) NOT NULL DEFAULT '',
  state VARCHAR(100) NOT NULL DEFAULT '',
  country VARCHAR(100) NOT NULL DEFAULT 'India',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_company_owner FOREIGN KEY (owner_user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE users ADD CONSTRAINT fk_user_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE SET NULL;

CREATE TABLE inventory (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  company_id INT UNSIGNED NULL,
  item_name VARCHAR(150) NOT NULL,
  sku VARCHAR(80) NOT NULL,
  category VARCHAR(100) NOT NULL,
  quantity DECIMAL(12,2) NOT NULL DEFAULT 0,
  unit VARCHAR(30) NOT NULL DEFAULT 'units',
  unit_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
  reorder_level DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY ix_inventory_company (company_id),
  CONSTRAINT fk_inventory_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sales (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  company_id INT UNSIGNED NULL,
  invoice_no VARCHAR(50) NOT NULL,
  customer VARCHAR(150) NOT NULL,
  issued_date DATE NOT NULL,
  due_date DATE NOT NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  status ENUM('Paid', 'Pending', 'Overdue') NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY ix_sales_company (company_id),
  CONSTRAINT fk_sales_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE expenses (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  company_id INT UNSIGNED NULL,
  description VARCHAR(180) NOT NULL,
  category VARCHAR(100) NOT NULL,
  expense_date DATE NOT NULL,
  payment_method VARCHAR(60) NOT NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY ix_expenses_company (company_id),
  CONSTRAINT fk_expenses_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE employees (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  company_id INT UNSIGNED NULL,
  name VARCHAR(150) NOT NULL,
  role VARCHAR(120) NOT NULL,
  monthly_salary DECIMAL(12,2) NOT NULL DEFAULT 0,
  status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY ix_employees_company (company_id),
  CONSTRAINT fk_employees_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE production_runs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  company_id INT UNSIGNED NULL,
  run_date DATE NOT NULL,
  product VARCHAR(150) NOT NULL,
  quantity DECIMAL(12,2) NOT NULL DEFAULT 0,
  status ENUM('Planned', 'In progress', 'Completed') NOT NULL DEFAULT 'Planned',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY ix_production_company (company_id),
  CONSTRAINT fk_production_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Initial Seed Data from Lanka Shanath Research Paper & database.sql
INSERT INTO users (name, email, password_hash) VALUES ('Demo User', 'demo@forgeledger.local', NULL);
SET @demo = (SELECT id FROM users WHERE email = 'demo@forgeledger.local');

INSERT INTO companies (owner_user_id, name, legal_name, registration_no, gst_no, email, phone, address, city, state, country)
VALUES (@demo, 'Riverton Works', 'Riverton Works', 'REG-2026-RW', '33AAAAA0000A1Z5', 'contact@rivertonworks.local', '+91 98765 43210', 'Plot 45, Industrial Estate, Guindy', 'Chennai', 'Tamil Nadu', 'India');

SET @company = (SELECT id FROM companies WHERE owner_user_id = @demo LIMIT 1);
UPDATE users SET company_id = @company WHERE id = @demo;

INSERT INTO inventory (user_id, company_id, item_name, sku, category, quantity, unit, unit_cost, reorder_level) VALUES
  (@demo, @company, 'Steel sheets, 2mm', 'RM-ST-002', 'Raw material', 12.00, 'sheets', 1840.00, 35.00),
  (@demo, @company, 'Aluminium rods, 6061-T6', 'RM-AL-011', 'Raw material', 86.00, 'kg', 420.00, 30.00),
  (@demo, @company, 'Forged Carbon Steel Billets 100mm', 'RM-CS-104', 'Raw material', 18.00, 'billets', 2650.00, 25.00),
  (@demo, @company, 'Brass Hex Stock 32mm', 'RM-BR-032', 'Raw material', 140.00, 'kg', 580.00, 40.00),
  (@demo, @company, 'Hydraulic Nitrile O-Ring Kits', 'RM-OR-500', 'Raw material', 95.00, 'kits', 85.00, 30.00),
  (@demo, @company, 'CNC Cutting Fluid & Lubricant', 'RM-CL-020', 'Raw material', 6.00, 'drums', 3200.00, 10.00),
  (@demo, @company, 'Assembly bracket', 'FG-AB-204', 'Finished good', 160.00, 'units', 285.00, 40.00),
  (@demo, @company, 'Heavy Industrial Flange 4-Inch', 'FG-FL-401', 'Finished good', 85.00, 'units', 1240.00, 25.00),
  (@demo, @company, 'Precision Spur Gearbox 1:10', 'FG-GB-810', 'Finished good', 28.00, 'units', 3400.00, 15.00),
  (@demo, @company, 'Hydraulic Control Valve 500PSI', 'FG-HV-502', 'Finished good', 42.00, 'units', 1850.00, 20.00),
  (@demo, @company, 'Turned Brass Bushing Set', 'FG-BB-108', 'Finished good', 320.00, 'units', 110.00, 80.00),
  (@demo, @company, 'Stainless Shaft Coupler 25mm', 'FG-SC-325', 'Finished good', 110.00, 'units', 460.00, 30.00);

INSERT INTO sales (user_id, company_id, invoice_no, customer, issued_date, due_date, amount, status) VALUES
  (@demo, @company, 'INV-1048', 'Northstar Retail Solutions', '2026-09-08', '2026-09-15', 48600.00, 'Paid'),
  (@demo, @company, 'INV-1047', 'Veda Industrial Supply', '2026-09-06', '2026-09-15', 32400.00, 'Paid'),
  (@demo, @company, 'INV-1049', 'Tata Motors Heavy Engineering', '2026-09-11', '2026-09-25', 86000.00, 'Paid'),
  (@demo, @company, 'INV-1050', 'Larsen & Toubro Machinery Division', '2026-09-14', '2026-09-28', 116000.00, 'Paid'),
  (@demo, @company, 'INV-1051', 'BHEL Power Equipment Plant', '2026-09-18', '2026-10-05', 64000.00, 'Pending'),
  (@demo, @company, 'INV-1052', 'Mahindra Precision Dynamics', '2026-09-22', '2026-10-10', 41700.00, 'Pending'),
  (@demo, @company, 'INV-1045', 'Omkar Fabrications', '2026-09-01', '2026-09-05', 48200.00, 'Overdue');

INSERT INTO expenses (user_id, company_id, description, category, expense_date, payment_method, amount) VALUES
  (@demo, @company, 'Factory 3-Phase Electricity Bill (TNEB Power Grid)', 'Utilities', '2026-09-07', 'Bank transfer', 34800.00),
  (@demo, @company, 'Diesel Generator Fuel & Compressed Air Backups', 'Utilities', '2026-09-15', 'UPI', 14200.00),
  (@demo, @company, 'Bulk Steel Sheet Procurement (Tata Steel Distribution)', 'Materials', '2026-09-04', 'Bank transfer', 55200.00),
  (@demo, @company, 'Aluminium Extrusions & Brass Rod Restock', 'Materials', '2026-09-12', 'Bank transfer', 32600.00),
  (@demo, @company, 'Packaging Cartons & Strapping Band Rolls', 'Materials', '2026-09-05', 'UPI', 12900.00),
  (@demo, @company, 'CNC Milling Spindle Servicing & Carbide Inserts', 'Maintenance', '2026-09-03', 'Bank transfer', 18600.00),
  (@demo, @company, 'Hydraulic Press Calibration & Filter Replacements', 'Maintenance', '2026-09-19', 'UPI', 8400.00),
  (@demo, @company, 'Industrial Estate Shed Lease - Guindy Plot 45', 'Rent', '2026-09-01', 'Bank transfer', 45000.00),
  (@demo, @company, 'Freight & Logistics Dispatch (Blue Dart Freight)', 'Logistics', '2026-09-16', 'UPI', 9800.00);

INSERT INTO employees (user_id, company_id, name, role, monthly_salary, status) VALUES
  (@demo, @company, 'Demo Employee', 'Shop Floor Operator', 28000.00, 'Active'),
  (@demo, @company, 'Kavita Sundaram', 'Warehouse Clerk', 24500.00, 'Active'),
  (@demo, @company, 'Suresh Nair', 'Accountant & Tax Lead', 36000.00, 'Active'),
  (@demo, @company, 'Arjun Patel', 'Senior CNC Machinist', 32000.00, 'Active');

INSERT INTO production_runs (user_id, company_id, run_date, product, quantity, status) VALUES
  (@demo, @company, '2026-09-05', 'Assembly bracket', 100.00, 'Completed'),
  (@demo, @company, '2026-09-10', 'Assembly bracket', 150.00, 'In progress'),
  (@demo, @company, '2026-09-08', 'Heavy Industrial Flange 4-Inch', 50.00, 'Completed'),
  (@demo, @company, '2026-09-16', 'Hydraulic Control Valve 500PSI', 35.00, 'In progress'),
  (@demo, @company, '2026-09-24', 'Precision Spur Gearbox 1:10', 20.00, 'Planned'),
  (@demo, @company, '2026-09-12', 'Turned Brass Bushing Set', 250.00, 'Completed');
