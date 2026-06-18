const { DatabaseSync } = require('node:sqlite')
const path = require('path')

const DB_PATH = path.join(__dirname, '..', '..', '..', 'ecommerce.db')

function createDatabase() {
  const db = new DatabaseSync(DB_PATH)

  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      description TEXT,
      price       REAL NOT NULL,
      stock       INTEGER NOT NULL DEFAULT 0,
      category    TEXT NOT NULL,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS orders (
      id          TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      status      TEXT NOT NULL DEFAULT 'pending',
      total       REAL NOT NULL DEFAULT 0,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS order_items (
      id          TEXT PRIMARY KEY,
      order_id    TEXT NOT NULL,
      product_id  TEXT NOT NULL,
      quantity    INTEGER NOT NULL,
      unit_price  REAL NOT NULL
    );
  `)

  return db
}

const db = createDatabase()
module.exports = { db }
