const { OrderRepository } = require('../../domain/repositories')
const { Order, OrderItem } = require('../../domain/entities/Order')
const { v4: uuidv4 } = require('uuid')

class PgOrderRepository extends OrderRepository {
  constructor(pool) { super(); this.pool = pool }

  async findAll({ customerId, status, skip = 0, take = 20 } = {}) {
    const conditions = []; const params = []
    if (customerId) { conditions.push(`o.customer_id = $${params.length+1}`); params.push(customerId) }
    if (status) { conditions.push(`o.status = $${params.length+1}`); params.push(status) }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    params.push(Number(take), Number(skip))
    const { rows } = await this.pool.query(
      `SELECT o.*, json_agg(json_build_object('id',i.id,'productId',i.product_id,'quantity',i.quantity,'unitPrice',i.unit_price)) as items
       FROM orders o LEFT JOIN order_items i ON o.id = i.order_id
       ${where} GROUP BY o.id ORDER BY o.created_at DESC LIMIT $${params.length-1} OFFSET $${params.length}`,
      params
    )
    return rows.map(this._toEntity)
  }

  async findById(id) {
    const { rows } = await this.pool.query(
      `SELECT o.*, json_agg(json_build_object('id',i.id,'productId',i.product_id,'quantity',i.quantity,'unitPrice',i.unit_price)) as items
       FROM orders o LEFT JOIN order_items i ON o.id = i.order_id
       WHERE o.id = $1 GROUP BY o.id`,
      [id]
    )
    return rows[0] ? this._toEntity(rows[0]) : null
  }

  async save(order) {
    const client = await this.pool.connect()
    try {
      await client.query('BEGIN')
      await client.query(
        'INSERT INTO orders (id, customer_id, status, total) VALUES ($1,$2,$3,$4)',
        [order.id, order.customerId, order.status, order.total]
      )
      for (const item of order.items) {
        await client.query(
          'INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES ($1,$2,$3,$4,$5)',
          [item.id, order.id, item.productId, item.quantity, item.unitPrice]
        )
      }
      await client.query('COMMIT')
      return this.findById(order.id)
    } catch (e) { await client.query('ROLLBACK'); throw e }
    finally { client.release() }
  }

  async updateStatus(id, status) {
    await this.pool.query('UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2', [status, id])
    return this.findById(id)
  }

  _toEntity(row) {
    const rawItems = row.items || []
    const items = rawItems[0] === null ? [] : rawItems.map(i => new OrderItem({ id: i.id, productId: i.productId || i.product_id, quantity: i.quantity, unitPrice: Number(i.unitPrice || i.unit_price) }))
    return new Order({ id: row.id, customerId: row.customer_id, status: row.status, total: Number(row.total), createdAt: row.created_at, updatedAt: row.updated_at, items })
  }
}

module.exports = { PgOrderRepository }
