const { OrderRepository } = require('../../domain/repositories')
const { Order, OrderItem } = require('../../domain/entities/Order')
const { v4: uuidv4 } = require('uuid')

class SqliteOrderRepository extends OrderRepository {
  constructor(db) { super(); this.db = db }

  findAll({ customerId, status, skip = 0, take = 20 } = {}) {
    let sql = 'SELECT * FROM orders WHERE 1=1'
    const params = {}
    if (customerId) { sql += ' AND customer_id = :customerId'; params.customerId = customerId }
    if (status) { sql += ' AND status = :status'; params.status = status }
    sql += ' ORDER BY created_at DESC LIMIT :take OFFSET :skip'
    params.take = Number(take); params.skip = Number(skip)
    return this.db.prepare(sql).all(params).map(r => this._toEntity(r))
  }

  findById(id) {
    const row = this.db.prepare('SELECT * FROM orders WHERE id = :id').get({ id })
    return row ? this._toEntity(row) : null
  }

  save(order) {
    this.db.prepare('INSERT INTO orders (id,customer_id,status,total) VALUES (:id,:customerId,:status,:total)')
      .run({ id: order.id, customerId: order.customerId, status: order.status, total: order.total })
    for (const item of order.items) {
      this.db.prepare('INSERT INTO order_items (id,order_id,product_id,quantity,unit_price) VALUES (:id,:orderId,:productId,:quantity,:unitPrice)')
        .run({ id: item.id, orderId: order.id, productId: item.productId, quantity: item.quantity, unitPrice: item.unitPrice })
    }
    return this.findById(order.id)
  }

  updateStatus(id, status) {
    this.db.prepare("UPDATE orders SET status=:status,updated_at=datetime('now') WHERE id=:id").run({ status, id })
    return this.findById(id)
  }

  _toEntity(row) {
    const itemRows = this.db.prepare('SELECT * FROM order_items WHERE order_id = :orderId').all({ orderId: row.id })
    return new Order({
      id: row.id, customerId: row.customer_id, status: row.status, total: row.total,
      createdAt: new Date(row.created_at), updatedAt: new Date(row.updated_at),
      items: itemRows.map(i => new OrderItem({ id: i.id, productId: i.product_id, quantity: i.quantity, unitPrice: i.unit_price })),
    })
  }
}

module.exports = { SqliteOrderRepository }
