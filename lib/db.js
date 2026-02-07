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

    // Create purchases table
    database.run(`
      CREATE TABLE IF NOT EXISTS purchases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        orderNumber TEXT NOT NULL,
        supplier TEXT NOT NULL,
        date TEXT NOT NULL,
        description TEXT NOT NULL,
        birdQuantity INTEGER NOT NULL,
        cageQuantity INTEGER NOT NULL DEFAULT 0,
        unitCost REAL NOT NULL,
        totalValue REAL NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('pending', 'picked up', 'cancel')) DEFAULT 'pending',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating purchases table:', err.message);
      } else {
        console.log('Purchases table initialized successfully.');
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
