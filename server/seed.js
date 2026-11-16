const db = require('./db');

function seedDatabase() {
  console.log('--- Initializing Forge Ledger Seed Data ---');

  // 1. Chart of Accounts Setup
  const defaultAccounts = [
    // Assets (1000 - 1999)
    { id: '1010', code: '1010', name: 'Petty Cash', type: 'ASSET', subtype: 'CASH', description: 'Cash on hand' },
    { id: '1020', code: '1020', name: 'Operating Bank Account', type: 'ASSET', subtype: 'BANK', description: 'Primary business checking account' },
    { id: '1030', code: '1030', name: 'Accounts Receivable (A/R)', type: 'ASSET', subtype: 'ACCOUNTS_RECEIVABLE', description: 'Customer invoices due', isSystem: true },
    { id: '1040', code: '1040', name: 'Inventory Asset', type: 'ASSET', subtype: 'CURRENT_ASSET', description: 'Value of raw materials and stock' },
    { id: '1050', code: '1050', name: 'Prepaid Expenses', type: 'ASSET', subtype: 'CURRENT_ASSET', description: 'Prepaid insurance and retainers' },
    { id: '1510', code: '1510', name: 'Machinery & Equipment', type: 'ASSET', subtype: 'FIXED_ASSET', description: 'Workshop machines and tools' },

    // Liabilities (2000 - 2999)
    { id: '2010', code: '2010', name: 'Accounts Payable (A/P)', type: 'LIABILITY', subtype: 'ACCOUNTS_PAYABLE', description: 'Vendor bills and suppliers', isSystem: true },
    { id: '2020', code: '2020', name: 'Sales Tax Payable', type: 'LIABILITY', subtype: 'CURRENT_LIABILITY', description: 'Collected sales tax owed to authorities', isSystem: true },
    { id: '2030', code: '2030', name: 'Accrued Payroll & Wages', type: 'LIABILITY', subtype: 'CURRENT_LIABILITY', description: 'Unpaid employee compensation' },
    { id: '2040', code: '2040', name: 'Commercial Line of Credit', type: 'LIABILITY', subtype: 'CURRENT_LIABILITY', description: 'Short term financing facility' },

    // Equity (3000 - 3999)
    { id: '3010', code: '3010', name: "Owner's Capital", type: 'EQUITY', subtype: 'EQUITY', description: 'Initial invested capital' },
    { id: '3020', code: '3020', name: 'Retained Earnings', type: 'EQUITY', subtype: 'EQUITY', description: 'Accumulated business profits', isSystem: true },
    { id: '3030', code: '3030', name: "Owner's Drawings", type: 'EQUITY', subtype: 'EQUITY', description: 'Withdrawals for personal use' },

    // Revenue (4000 - 4999)
    { id: '4010', code: '4010', name: 'Product Sales Revenue', type: 'REVENUE', subtype: 'OPERATING_REVENUE', description: 'Gross revenue from goods and components', isSystem: true },
    { id: '4020', code: '4020', name: 'Engineering & Fabrication Services', type: 'REVENUE', subtype: 'SERVICE_REVENUE', description: 'Custom manufacturing and consulting services' },
    { id: '4030', code: '4030', name: 'Miscellaneous Income', type: 'REVENUE', subtype: 'OTHER_INCOME', description: 'Scrap sales and interest' },

    // Expenses (5000 - 5999)
    { id: '5010', code: '5010', name: 'Cost of Goods Sold (COGS)', type: 'EXPENSE', subtype: 'DIRECT_EXPENSE', description: 'Raw metals, alloy billets, and consumables' },
    { id: '5020', code: '5020', name: 'Shop Utilities & Electricity', type: 'EXPENSE', subtype: 'OPERATING_EXPENSE', description: 'Power grid, water, and industrial gas' },
    { id: '5030', code: '5030', name: 'Facility Rent & Lease', type: 'EXPENSE', subtype: 'OPERATING_EXPENSE', description: 'Warehouse and foundry lease' },
    { id: '5040', code: '5040', name: 'Equipment Maintenance & Tooling', type: 'EXPENSE', subtype: 'OPERATING_EXPENSE', description: 'CNC maintenance and forge tooling' },
    { id: '5050', code: '5050', name: 'Contractor & Skilled Labor', type: 'EXPENSE', subtype: 'OPERATING_EXPENSE', description: 'Technicians and contract fabricators' },
    { id: '5060', code: '5060', name: 'Logistics & Freight Shipping', type: 'EXPENSE', subtype: 'OPERATING_EXPENSE', description: 'Outbound courier and heavy freight' }
  ];

  // Check if accounts already exist
  const existingAccounts = db.getAccounts();
  if (existingAccounts.length === 0) {
    console.log('Seeding Chart of Accounts...');
    defaultAccounts.forEach(acc => db.addAccount(acc));
  } else {
    console.log('Chart of Accounts already populated.');
  }

  // 2. Contacts Setup (Customers & Vendors)
  if (db.data.contacts.length === 0) {
    console.log('Seeding Customers and Vendors...');
    const sampleContacts = [
      { type: 'CUSTOMER', name: 'Vanguard Industrial Dynamics', company: 'Vanguard Corp', email: 'procurement@vanguard.com', phone: '+1 (555) 782-9011', address: '420 Titan Way, Detroit, MI' },
      { type: 'CUSTOMER', name: 'Helios Aerospace Systems', company: 'Helios Ltd', email: 'orders@helios-aero.com', phone: '+1 (555) 439-0022', address: '1200 Orbit Blvd, Houston, TX' },
      { type: 'CUSTOMER', name: 'Nexus Automotive Works', company: 'Nexus Auto', email: 'billing@nexusauto.io', phone: '+1 (555) 301-8844', address: '88 Piston Rd, Indianapolis, IN' },
      { type: 'VENDOR', name: 'Titan Alloys & Metallurgical', company: 'Titan Alloys', email: 'sales@titanalloys.com', phone: '+1 (555) 902-1133', address: '500 Smelter Lane, Pittsburgh, PA' },
      { type: 'VENDOR', name: 'Apex Tooling & CNC Supplies', company: 'Apex Tooling', email: 'supplies@apextooling.com', phone: '+1 (555) 234-5566', address: '78 Industrial Loop, Cleveland, OH' },
      { type: 'VENDOR', name: 'GridPower Energy Co.', company: 'GridPower', email: 'commercial@gridpower.net', phone: '+1 (555) 880-9900', address: '1 Powerhouse Plaza, Chicago, IL' }
    ];

    sampleContacts.forEach(c => db.addContact(c));
  }

  // 3. Opening Balance Journal Entry
  if (db.data.journal_entries.length === 0) {
    console.log('Recording Initial Opening Balance Journal Entry...');
    db.createJournalEntry({
      date: '2026-01-01',
      reference: 'OB-2026',
      description: 'Opening financial balances and owner equity capitalization',
      status: 'POSTED',
      items: [
        { accountId: '1020', debit: 65000, credit: 0, description: 'Opening Operating Bank balance' },
        { accountId: '1010', debit: 2500, credit: 0, description: 'Opening Petty Cash balance' },
        { accountId: '1040', debit: 18000, credit: 0, description: 'Starting raw material inventory' },
        { accountId: '1510', debit: 45000, credit: 0, description: 'Shop machinery & forging equipment' },
        { accountId: '3010', debit: 0, credit: 130500, description: "Initial Owner's Equity Capital" }
      ]
    });

    // 4. Sample Invoices
    console.log('Creating Sample Invoices...');
    const vanguard = db.data.contacts.find(c => c.company === 'Vanguard Corp');
    const helios = db.data.contacts.find(c => c.company === 'Helios Ltd');
    const nexus = db.data.contacts.find(c => c.company === 'Nexus Auto');

    if (vanguard) {
      const inv1 = db.createInvoice({
        customerId: vanguard.id,
        issueDate: '2026-02-10',
        dueDate: '2026-03-12',
        status: 'SENT',
        notes: 'Net 30. Heavy structural forged flanges and brackets.',
        items: [
          { description: 'Forged High-Yield Steel Flanges (Grade 8)', quantity: 40, unitPrice: 220, accountId: '4010' },
          { description: 'Precision CNC Machining & Heat Treating', quantity: 20, unitPrice: 150, accountId: '4020' }
        ]
      });

      // Record a partial payment for inv1
      db.recordInvoicePayment(inv1.id, {
        amount: 5000,
        date: '2026-02-25',
        paymentMethod: 'BANK_TRANSFER',
        depositAccountId: '1020',
        notes: '50% progress deposit received via Wire Transfer'
      });
    }

    if (helios) {
      db.createInvoice({
        customerId: helios.id,
        issueDate: '2026-03-01',
        dueDate: '2026-03-31',
        status: 'SENT',
        notes: 'Aerospace grade titanium bracket fabrication batch #1.',
        items: [
          { description: 'Titanium Ti-6Al-4V Forged Linkage Arms', quantity: 15, unitPrice: 850, accountId: '4010' },
          { description: 'Ultrasonic Non-Destructive Testing (NDT)', quantity: 1, unitPrice: 1200, accountId: '4020' }
        ]
      });
    }

    if (nexus) {
      const inv3 = db.createInvoice({
        customerId: nexus.id,
        issueDate: '2026-03-05',
        dueDate: '2026-04-05',
        status: 'SENT',
        notes: 'Automotive race crank shaft blanks.',
        items: [
          { description: '4340 Billet Steel Crankshaft Blanks', quantity: 10, unitPrice: 620, accountId: '4010' }
        ]
      });

      // Nexus pays in full
      db.recordInvoicePayment(inv3.id, {
        amount: inv3.total,
        date: '2026-03-10',
        paymentMethod: 'BANK_TRANSFER',
        depositAccountId: '1020',
        notes: 'Paid in full via ACH'
      });
    }

    // 5. Sample Vendor Bills & Expenses
    console.log('Creating Sample Vendor Bills & Payments...');
    const titan = db.data.contacts.find(c => c.company === 'Titan Alloys');
    const apex = db.data.contacts.find(c => c.company === 'Apex Tooling');
    const grid = db.data.contacts.find(c => c.company === 'GridPower');

    if (titan) {
      const bill1 = db.createBill({
        vendorId: titan.id,
        issueDate: '2026-02-05',
        dueDate: '2026-03-05',
        category: 'Raw Materials & Alloys',
        expenseAccountId: '5010', // COGS
        notes: 'Bulk order: 5 Tons 4140 Round Bar',
        items: [
          { description: '4140 Alloy Round Bar Stock (5,000 lbs)', quantity: 1, unitPrice: 6800, accountId: '5010' }
        ]
      });

      // Pay Titan bill
      db.recordBillPayment(bill1.id, {
        amount: 6800,
        date: '2026-02-18',
        paymentMethod: 'BANK_TRANSFER',
        withdrawAccountId: '1020',
        notes: 'Wire payment settled for bulk round bar'
      });
    }

    if (apex) {
      db.createBill({
        vendorId: apex.id,
        issueDate: '2026-02-20',
        dueDate: '2026-03-20',
        category: 'Tooling & Bits',
        expenseAccountId: '5040', // Maintenance & Tooling
        notes: 'Carbide inserts and milling cutters',
        items: [
          { description: 'High-speed Carbide Milling Inserts (Box of 50)', quantity: 4, unitPrice: 320, accountId: '5040' },
          { description: 'Synthetic Coolant Lubricant Drum (55 Gal)', quantity: 2, unitPrice: 450, accountId: '5040' }
        ]
      });
    }

    if (grid) {
      const bill3 = db.createBill({
        vendorId: grid.id,
        issueDate: '2026-02-28',
        dueDate: '2026-03-15',
        category: 'Foundry Electricity',
        expenseAccountId: '5020', // Utilities
        notes: 'Industrial furnace high-voltage electricity bill for Feb 2026',
        items: [
          { description: 'Commercial Industrial Power Consumption (Feb)', quantity: 1, unitPrice: 3150, accountId: '5020' }
        ]
      });

      // Pay half of electricity
      db.recordBillPayment(bill3.id, {
        amount: 1500,
        date: '2026-03-02',
        paymentMethod: 'BANK_TRANSFER',
        withdrawAccountId: '1020',
        notes: 'Partial payment on Feb power invoice'
      });
    }
  }

  console.log('--- Forge Ledger Seeding Completed Successfully! ---');
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
