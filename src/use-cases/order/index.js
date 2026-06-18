const { Order } = require('../../domain/entities/Order')
const { NotFoundError, BusinessRuleError } = require('../../domain/errors')
const { v4: uuidv4 } = require('uuid')

class GetAllOrdersUseCase {
  constructor(orderRepository) {
    this.orderRepository = orderRepository
  }

  async execute({ customerId, status, skip = 0, take = 20 } = {}) {
    return this.orderRepository.findAll({ customerId, status, skip, take })
  }
}

class GetOrderByIdUseCase {
  constructor(orderRepository) {
    this.orderRepository = orderRepository
  }

  async execute(id) {
    const order = await this.orderRepository.findById(id)
    if (!order) throw new NotFoundError('Orden', id)
    return order
  }
}

class CreateOrderUseCase {
  constructor(orderRepository, productRepository) {
    this.orderRepository = orderRepository
    this.productRepository = productRepository
  }

  async execute({ customerId, items }) {
    if (!items || items.length === 0) {
      throw new BusinessRuleError('La orden debe contener al menos un producto')
    }

    // Verificar stock y construir items con precio actual
    const resolvedItems = []
    for (const item of items) {
      const product = await this.productRepository.findById(item.productId)
      if (!product) throw new NotFoundError('Producto', item.productId)

      if (!product.hasStock(item.quantity)) {
        throw new BusinessRuleError(
          `Stock insuficiente para "${product.name}". Disponible: ${product.stock}, solicitado: ${item.quantity}`
        )
      }

      resolvedItems.push({
        id: uuidv4(),
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
      })

      // Descontar stock
      product.decreaseStock(item.quantity)
      await this.productRepository.update(product)
    }

    const order = new Order({ id: uuidv4(), customerId, items: resolvedItems })
    return this.orderRepository.save(order)
  }
}

class UpdateOrderStatusUseCase {
  constructor(orderRepository) {
    this.orderRepository = orderRepository
  }

  async execute(id, newStatus) {
    const order = await this.orderRepository.findById(id)
    if (!order) throw new NotFoundError('Orden', id)

    try {
      order.updateStatus(newStatus)
    } catch (err) {
      throw new BusinessRuleError(err.message)
    }

    return this.orderRepository.updateStatus(id, order.status)
  }
}

module.exports = {
  GetAllOrdersUseCase,
  GetOrderByIdUseCase,
  CreateOrderUseCase,
  UpdateOrderStatusUseCase,
}
