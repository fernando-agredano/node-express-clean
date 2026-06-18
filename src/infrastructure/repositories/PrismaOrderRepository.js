const { OrderRepository } = require('../../domain/repositories')
const { Order, OrderItem } = require('../../domain/entities/Order')

class PrismaOrderRepository extends OrderRepository {
  constructor(prisma) {
    super()
    this.prisma = prisma
  }

  async findAll({ customerId, status, skip = 0, take = 20 } = {}) {
    const where = {}
    if (customerId) where.customerId = customerId
    if (status) where.status = status

    const records = await this.prisma.order.findMany({
      where,
      include: { items: true },
      skip: Number(skip),
      take: Number(take),
      orderBy: { createdAt: 'desc' },
    })
    return records.map(this._toEntity)
  }

  async findById(id) {
    const record = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    })
    return record ? this._toEntity(record) : null
  }

  async save(order) {
    const record = await this.prisma.order.create({
      data: {
        id: order.id,
        customerId: order.customerId,
        status: order.status,
        total: order.total,
        items: {
          create: order.items.map(item => ({
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: { items: true },
    })
    return this._toEntity(record)
  }

  async updateStatus(id, status) {
    const record = await this.prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    })
    return this._toEntity(record)
  }

  _toEntity(record) {
    return new Order({
      ...record,
      items: record.items.map(i => new OrderItem(i)),
    })
  }
}

module.exports = { PrismaOrderRepository }
