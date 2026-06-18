const { ProductRepository } = require('../../domain/repositories')
const { Product } = require('../../domain/entities/Product')
const { v4: uuidv4 } = require('uuid')

class SqliteProductRepository extends ProductRepository {
  constructor(db) { super(); this.db = db }

  findAll({ category, minPrice, maxPrice, skip = 0, take = 20 } = {}) {
    let sql = 'SELECT * FROM products WHERE 1=1'
    const params = {}
    if (category) { sql += ' AND category = :category'; params.category = category }
    if (minPrice !== undefined) { sql += ' AND price >= :minPrice'; params.minPrice = Number(minPrice) }
    if (maxPrice !== undefined) { sql += ' AND price <= :maxPrice'; params.maxPrice = Number(maxPrice) }
    sql += ' ORDER BY created_at DESC LIMIT :take OFFSET :skip'
    params.take = Number(take); params.skip = Number(skip)
    return this.db.prepare(sql).all(params).map(this._toEntity)
  }

  findById(id) {
    const row = this.db.prepare('SELECT * FROM products WHERE id = :id').get({ id })
    return row ? this._toEntity(row) : null
  }

  save(product) {
    const id = uuidv4()
    this.db.prepare('INSERT INTO products (id,name,description,price,stock,category) VALUES (:id,:name,:description,:price,:stock,:category)')
      .run({ id, name: product.name, description: product.description ?? null, price: product.price, stock: product.stock, category: product.category })
    return this.findById(id)
  }

  update(product) {
    this.db.prepare("UPDATE products SET name=:name,description=:description,price=:price,stock=:stock,category=:category,updated_at=datetime('now') WHERE id=:id")
      .run({ name: product.name, description: product.description ?? null, price: product.price, stock: product.stock, category: product.category, id: product.id })
    return this.findById(product.id)
  }

  delete(id) { this.db.prepare('DELETE FROM products WHERE id = :id').run({ id }) }

  _toEntity(row) {
    return new Product({ id: row.id, name: row.name, description: row.description, price: row.price, stock: row.stock, category: row.category, createdAt: new Date(row.created_at), updatedAt: new Date(row.updated_at) })
  }
}

module.exports = { SqliteProductRepository }
