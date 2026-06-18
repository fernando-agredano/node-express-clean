/**
 * Entidad de dominio: Order
 * Encapsula las reglas de negocio de un pedido.
 */

const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
}

const VALID_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
}

class OrderItem {
  constructor({ id, productId, quantity, unitPrice }) {
    this.id = id
    this.productId = productId
    this.quantity = quantity
    this.unitPrice = unitPrice
  }

  get subtotal() {
    return this.quantity * this.unitPrice
  }

  toJSON() {
    return {
      id: this.id,
      productId: this.productId,
      quantity: this.quantity,
      unitPrice: this.unitPrice,
      subtotal: this.subtotal,
    }
  }
}

class Order {
  constructor({ id, customerId, status, total, items, createdAt, updatedAt }) {
    this.id = id
    this.customerId = customerId
    this.status = status ?? ORDER_STATUS.PENDING
    this.items = (items ?? []).map(i => new OrderItem(i))
    this.total = total ?? this._calculateTotal()
    this.createdAt = createdAt ?? new Date()
    this.updatedAt = updatedAt ?? new Date()
  }

  _calculateTotal() {
    return this.items.reduce((sum, item) => sum + item.subtotal, 0)
  }

  canTransitionTo(newStatus) {
    return VALID_TRANSITIONS[this.status]?.includes(newStatus) ?? false
  }

  updateStatus(newStatus) {
    if (!Object.values(ORDER_STATUS).includes(newStatus)) {
      throw new Error(`Status inválido: "${newStatus}"`)
    }
    if (!this.canTransitionTo(newStatus)) {
      throw new Error(
        `No se puede cambiar de "${this.status}" a "${newStatus}". ` +
        `Transiciones válidas: [${VALID_TRANSITIONS[this.status].join(', ')}]`
      )
    }
    this.status = newStatus
    this.updatedAt = new Date()
  }

  toJSON() {
    return {
      id: this.id,
      customerId: this.customerId,
      status: this.status,
      total: this.total,
      items: this.items.map(i => i.toJSON()),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}

module.exports = { Order, OrderItem, ORDER_STATUS }
