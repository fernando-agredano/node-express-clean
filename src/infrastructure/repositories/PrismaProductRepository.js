const { ProductRepository } = require('../../domain/repositories')
const { Product } = require('../../domain/entities/Product')

class PrismaProductRepository extends ProductRepository {
  constructor(prisma) {
    super()
    this.prisma = prisma
  }

  async findAll({ category, minPrice, maxPrice, skip = 0, take = 20 } = {}) {
    const where = {}
    if (category) where.category = category
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {}
      if (minPrice !== undefined) where.price.gte = Number(minPrice)
      if (maxPrice !== undefined) where.price.lte = Number(maxPrice)
    }

    const records = await this.prisma.product.findMany({
      where,
      skip: Number(skip),
      take: Number(take),
      orderBy: { createdAt: 'desc' },
    })
    return records.map(this._toEntity)
  }

  async findById(id) {
    const record = await this.prisma.product.findUnique({ where: { id } })
    return record ? this._toEntity(record) : null
  }

  async save(product) {
    const record = await this.prisma.product.create({
      data: {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category: product.category,
      },
    })
    return this._toEntity(record)
  }

  async update(product) {
    const record = await this.prisma.product.update({
      where: { id: product.id },
      data: {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category: product.category,
      },
    })
    return this._toEntity(record)
  }

  async delete(id) {
    await this.prisma.product.delete({ where: { id } })
  }

  _toEntity(record) {
    return new Product(record)
  }
}

module.exports = { PrismaProductRepository }
