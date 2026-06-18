const { ProductRepository } = require('../../domain/repositories')
const { Product } = require('../../domain/entities/Product')

class PgProductRepository extends ProductRepository {
  constructor(pool) { super(); this.pool = pool }

  async findAll({ category, minPrice, maxPrice, skip = 0, take = 20 } = {}) {
    const conditions = []; const params = []
    if (category) { conditions.push(`category = $${params.length+1}`); params.push(category) }
    if (minPrice !== undefined) { conditions.push(`price >= $${params.length+1}`); params.push(Number(minPrice)) }
    if (maxPrice !== undefined) { conditions.push(`price <= $${params.length+1}`); params.push(Number(maxPrice)) }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    params.push(Number(take), Number(skip))
    const { rows } = await this.pool.query(
      `SELECT * FROM products ${where} ORDER BY created_at DESC LIMIT $${params.length-1} OFFSET $${params.length}`,
      params
    )
    return rows.map(this._toEntity)
  }

  async findById(id) {
    const { rows } = await this.pool.query('SELECT * FROM products WHERE id = $1', [id])
    return rows[0] ? this._toEntity(rows[0]) : null
  }

  async save(product) {
    const { rows } = await this.pool.query(
      `INSERT INTO products (name, description, price, stock, category)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [product.name, product.description ?? null, product.price, product.stock, product.category]
    )
    return this._toEntity(rows[0])
  }

  async update(product) {
    const { rows } = await this.pool.query(
      `UPDATE products SET name=$1, description=$2, price=$3, stock=$4, category=$5, updated_at=NOW()
       WHERE id=$6 RETURNING *`,
      [product.name, product.description ?? null, product.price, product.stock, product.category, product.id]
    )
    return this._toEntity(rows[0])
  }

  async delete(id) {
    await this.pool.query('DELETE FROM products WHERE id = $1', [id])
  }

  _toEntity(row) {
    return new Product({ id: row.id, name: row.name, description: row.description, price: Number(row.price), stock: row.stock, category: row.category, createdAt: row.created_at, updatedAt: row.updated_at })
  }
}

module.exports = { PgProductRepository }
