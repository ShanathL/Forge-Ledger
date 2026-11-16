# ForgeLedger

> **Integrated Manufacturing Workspace for Small Manufacturers**  
> **Author:** Lanka Shanath, Dept of CSE, SRM University, Chennai, India (`lvshanath@gmail.com`)  
> **Reference:** "Integrated Manufacturing Workspace for Small Manufacturers", Research & Implementation Paper

---

## 🏭 Overview

**ForgeLedger** is a unified, web-based operational workspace built for small and medium manufacturing enterprises (SMEs). It connects sales, stock, raw materials, production runs, payroll, and expenses into a single, company-scoped application.

---

## 🛠️ Technology Stack

* **Frontend:** React 18 SPA, Vanilla Tailwind Design System, Responsive Dark Sidebar Navigation.
* **Backend:** Node.js & Express REST API (`/api/*`).
* **Database Engine:** MySQL / MariaDB (InnoDB with Foreign Keys & ACID Transaction support) + Embedded Relational Fallback.
* **Authentication:** JWT HTTP-Only Cookies + bcrypt password hashing.

---

## 🗄️ Relational Database Schema (`database/db.sql`)

The application models the exact relational schema defined in `database.sql`:

* `users`: `id`, `name`, `email`, `password_hash`, `picture`, `company_id`, timestamps
* `companies`: `id`, `owner_user_id`, `name`, `legal_name`, `registration_no`, `gst_no`, `email`, `phone`, `address`, `city`, `state`, `country`
* `inventory`: `id`, `user_id`, `item_name`, `sku`, `category` (*Raw material*, *Finished good*, etc.), `quantity`, `unit`, `unit_cost`, `reorder_level`
* `sales`: `id`, `user_id`, `invoice_no`, `customer`, `issued_date`, `due_date`, `amount`, `status` (*Paid*, *Pending*, *Overdue*)
* `expenses`: `id`, `user_id`, `description`, `category`, `expense_date`, `payment_method`, `amount`
* `employees`: `id`, `user_id`, `name`, `role`, `monthly_salary`, `status` (*Active*, *Inactive*)
* `production_runs`: `id`, `user_id`, `run_date`, `product`, `quantity`, `status` (*Planned*, *In progress*, *Completed*)

---

## 🚀 Quick Start Guide

### Option 1: One-Click Launcher (Windows)
Double-click `start.bat` in `D:\Forge Ledger`. It will:
1. Automatically install any missing packages (`npm install`).
2. Start the Express server on `http://localhost:4000`.
3. Open your browser directly to the dashboard.

### Option 2: Terminal / Command Prompt
```bash
cd "D:\Forge Ledger"

# Install dependencies
npm install

# Start the application
npm start
```
Then visit **`http://localhost:4000`** in your browser.

---

## 🔑 Default Credentials (Pre-seeded Demo)

* **Email:** `demo@forgeledger.local`
* **Password:** `password123`
* **Workspace Company:** `Riverton Works` (India)

---

## 🐬 Connecting to MySQL / MariaDB (e.g. XAMPP)

1. Start **Apache** & **MySQL** in your XAMPP Control Panel.
2. In phpMyAdmin or MySQL CLI, import `database/db.sql`:
   ```bash
   mysql -u root -p < database/db.sql
   ```
3. Check your `.env` configuration:
   ```env
   PORT=4000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=forgeledger
   JWT_SECRET=forgeledger_production_jwt_secret_srm_cse_2026_super_secure_key_32chars
   ```
4. ForgeLedger will automatically detect MySQL on port 3306 and use the live MySQL connection pool. If MySQL is offline, it gracefully uses the high-performance local persistent store so development never halts.

---

## 📋 API Endpoints Summary

| Route | Method | Description |
| :--- | :--- | :--- |
| `/api/auth/signup` | `POST` | Register user and create new company |
| `/api/auth/login` | `POST` | Authenticate user & issue JWT cookie |
| `/api/auth/me` | `GET` | Get authenticated user & company |
| `/api/dashboard/summary`| `GET` | Real-time KPI summaries, inventory value & recent sales |
| `/api/inventory` | `GET`, `POST` | List and add inventory items |
| `/api/inventory/:id` | `PUT`, `DELETE` | Update or remove inventory item |
| `/api/sales` | `GET`, `POST` | List and create sales invoices |
| `/api/expenses` | `GET`, `POST` | Record business costs & categories |
| `/api/employees` | `GET`, `POST` | Manage staff & monthly payroll |
| `/api/production` | `GET`, `POST` | Schedule & track manufacturing runs |
| `/api/settings` | `GET`, `PUT` | View & update company details |
