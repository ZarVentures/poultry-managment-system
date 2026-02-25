const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path in project root
const DB_PATH = path.join(process.cwd(), 'aziz-poultry.db');

// Database connection instance
let db = null;

/**
 * Get or create database connection
 * @returns {sqlite3.Database} Database instance
 */
function getDatabase() {
  if (db) {
    return db;
  }

  db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
      throw err;
    }
    console.log('Connected to SQLite database:', DB_PATH);
    initializeTables();
  });

  return db;
}

/**
 * Initialize database tables
 */
function initializeTables() {
  const database = getDatabase();

  database.serialize(() => {
    // Create products table
    database.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT,
        price REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating products table:', err.message);
      } else {
        console.log('Products table initialized successfully.');
      }
    });

    // Create purchases table with all new fields
    database.run(`
      CREATE TABLE IF NOT EXISTS purchases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        purchaseInvoiceNo TEXT,
        purchaseDate TEXT,
        farmerName TEXT,
        farmerMobile TEXT,
        farmLocation TEXT,
        vehicleNo TEXT,
        purchaseType TEXT CHECK(purchaseType IN ('Paid', 'Credit')) DEFAULT 'Paid',
        notes TEXT,
        birdType TEXT,
        numberOfCages INTEGER,
        numberOfBirds INTEGER,
        averageWeight REAL,
        totalWeight REAL,
        ratePerKg REAL,
        totalAmount REAL,
        transportCharges REAL,
        loadingCharges REAL,
        commission REAL,
        otherCharges REAL,
        deductions REAL,
        totalInvoice REAL,
        advancePaid REAL,
        outstandingPayment REAL,
        paymentMode TEXT CHECK(paymentMode IN ('Cash', 'Credit', 'Online')),
        totalPaymentMade REAL,
        balanceAmount REAL,
        dueDate TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        -- Legacy fields for backward compatibility
        orderNumber TEXT,
        supplier TEXT,
        date TEXT,
        description TEXT,
        birdQuantity INTEGER,
        cageQuantity INTEGER,
        unitCost REAL,
        totalValue REAL,
        status TEXT CHECK(status IN ('pending', 'picked up', 'cancel'))
      )
    `, (err) => {
      if (err) {
        console.error('Error creating purchases table:', err.message);
      } else {
        console.log('Purchases table initialized successfully.');
        // Add new columns to existing table if they don't exist (using PRAGMA to check)
        database.all("PRAGMA table_info(purchases)", (pragmaErr, columns) => {
          if (pragmaErr) {
            console.error('Error checking table info:', pragmaErr.message);
            return;
          }
          
          const existingColumns = columns.map(col => col.name);
          const newColumns = [
            { name: 'purchaseInvoiceNo', type: 'TEXT' },
            { name: 'purchaseDate', type: 'TEXT' },
            { name: 'farmerName', type: 'TEXT' },
            { name: 'farmerMobile', type: 'TEXT' },
            { name: 'farmLocation', type: 'TEXT' },
            { name: 'vehicleNo', type: 'TEXT' },
            { name: 'purchaseType', type: 'TEXT' },
            { name: 'birdType', type: 'TEXT' },
            { name: 'numberOfCages', type: 'INTEGER' },
            { name: 'numberOfBirds', type: 'INTEGER' },
            { name: 'averageWeight', type: 'REAL' },
            { name: 'totalWeight', type: 'REAL' },
            { name: 'ratePerKg', type: 'REAL' },
            { name: 'totalAmount', type: 'REAL' },
            { name: 'transportCharges', type: 'REAL' },
            { name: 'loadingCharges', type: 'REAL' },
            { name: 'commission', type: 'REAL' },
            { name: 'otherCharges', type: 'REAL' },
            { name: 'deductions', type: 'REAL' },
            { name: 'totalInvoice', type: 'REAL' },
            { name: 'advancePaid', type: 'REAL' },
            { name: 'outstandingPayment', type: 'REAL' },
            { name: 'paymentMode', type: 'TEXT' },
            { name: 'totalPaymentMade', type: 'REAL' },
            { name: 'balanceAmount', type: 'REAL' },
            { name: 'dueDate', type: 'TEXT' },
            { name: 'cageDetails', type: 'TEXT' }
          ];
          
          newColumns.forEach((col) => {
            if (!existingColumns.includes(col.name)) {
              database.run(`ALTER TABLE purchases ADD COLUMN ${col.name} ${col.type}`, (alterErr) => {
                if (alterErr) {
                  console.error(`Error adding column ${col.name}:`, alterErr.message);
                } else {
                  console.log(`Added column ${col.name} to purchases table`);
                }
              });
            }
          });
        });
      }
    });

    // Create sales table with all new fields
    database.run(`
      CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        saleInvoiceNo TEXT,
        shopName TEXT,
        ownerName TEXT,
        phone TEXT,
        address TEXT,
        saleMode TEXT CHECK(saleMode IN ('From Gadi', 'From Godown')),
        vehicleNo TEXT,
        salePayment TEXT CHECK(salePayment IN ('Paid', 'Credit', 'Partial Payment')) DEFAULT 'Paid',
        notes TEXT,
        birdType TEXT CHECK(birdType IN ('Boiler', 'Layer', 'Desi')),
        numberOfCages INTEGER,
        numberOfBirds INTEGER,
        averageWeight REAL,
        totalWeight REAL,
        ratePerKg REAL,
        totalAmount REAL,
        transportCharges REAL,
        loadingCharges REAL,
        commission REAL,
        otherCharges REAL,
        deductions REAL,
        totalInvoice REAL,
        advancePaid REAL,
        creditBalance REAL,
        totalPaymentMade REAL,
        outstandingPayment REAL,
        paymentMode TEXT CHECK(paymentMode IS NULL OR paymentMode IN ('Cash', 'Credit', 'Online')),
        balanceAmount REAL,
        saleDate TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating sales table:', err.message);
      } else {
        console.log('Sales table initialized successfully.');
        // Add new columns to existing table if they don't exist
        database.all("PRAGMA table_info(sales)", (pragmaErr, columns) => {
          if (pragmaErr) {
            console.error('Error checking table info:', pragmaErr.message);
            return;
          }
          
          const existingColumns = columns.map(col => col.name);
          const newColumns = [
            { name: 'saleInvoiceNo', type: 'TEXT' },
            { name: 'shopName', type: 'TEXT' },
            { name: 'ownerName', type: 'TEXT' },
            { name: 'phone', type: 'TEXT' },
            { name: 'address', type: 'TEXT' },
            { name: 'saleMode', type: 'TEXT' },
            { name: 'vehicleNo', type: 'TEXT' },
            { name: 'salePayment', type: 'TEXT' },
            { name: 'notes', type: 'TEXT' },
            { name: 'birdType', type: 'TEXT' },
            { name: 'numberOfCages', type: 'INTEGER' },
            { name: 'numberOfBirds', type: 'INTEGER' },
            { name: 'averageWeight', type: 'REAL' },
            { name: 'totalWeight', type: 'REAL' },
            { name: 'ratePerKg', type: 'REAL' },
            { name: 'totalAmount', type: 'REAL' },
            { name: 'transportCharges', type: 'REAL' },
            { name: 'loadingCharges', type: 'REAL' },
            { name: 'commission', type: 'REAL' },
            { name: 'otherCharges', type: 'REAL' },
            { name: 'deductions', type: 'REAL' },
            { name: 'totalInvoice', type: 'REAL' },
            { name: 'advancePaid', type: 'REAL' },
            { name: 'creditBalance', type: 'REAL' },
            { name: 'totalPaymentMade', type: 'REAL' },
            { name: 'outstandingPayment', type: 'REAL' },
            { name: 'paymentMode', type: 'TEXT' },
            { name: 'balanceAmount', type: 'REAL' },
            { name: 'saleDate', type: 'TEXT' }
          ];
          
          newColumns.forEach((col) => {
            if (!existingColumns.includes(col.name)) {
              database.run(`ALTER TABLE sales ADD COLUMN ${col.name} ${col.type}`, (alterErr) => {
                if (alterErr && !alterErr.message.includes('duplicate column name')) {
                  console.error(`Error adding column ${col.name}:`, alterErr.message);
                } else if (!alterErr) {
                  console.log(`Added column ${col.name} to sales table`);
                }
              });
            }
          });
        });
      }
    });
  });
}

/**
 * Close database connection
 */
function closeDatabase() {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed.');
        db = null;
      }
    });
  }
}

// Initialize database on module load
getDatabase();

module.exports = {
  getDatabase,
  closeDatabase,
  DB_PATH
};
