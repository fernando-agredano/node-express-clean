const { Product } = require('../../domain/entities/Product')
const { NotFoundError, BusinessRuleError } = require('../../domain/errors')

class GetAllProductsUseCase {
  constructor(productRepository) {
    this.productRepository = productRepository
  }

  async execute({ category, minPrice, maxPrice, skip = 0, take = 20 } = {}) {
    return this.productRepository.findAll({ category, minPrice, maxPrice, skip, take })
  }
}

class GetProductByIdUseCase {
  constructor(productRepository) {
    this.productRepository = productRepository
  }

  async execute(id) {
    const product = await this.productRepository.findById(id)
    if (!product) throw new NotFoundError('Producto', id)
    return product
  }
}

class CreateProductUseCase {
  constructor(productRepository) {
    this.productRepository = productRepository
  }

  async execute({ name, description, price, stock, category }) {
    const product = new Product({ id: undefined, name, description, price, stock, category })
    return this.productRepository.save(product)
  }
}

class UpdateProductUseCase {
  constructor(productRepository) {
    this.productRepository = productRepository
  }

  async execute(id, fields) {
    const product = await this.productRepository.findById(id)
    if (!product) throw new NotFoundError('Producto', id)
    Object.assign(product, fields)
    product.updatedAt = new Date()
    return this.productRepository.update(product)
  }
}

class DeleteProductUseCase {
  constructor(productRepository) {
    this.productRepository = productRepository
  }

  async execute(id) {
    const product = await this.productRepository.findById(id)
    if (!product) throw new NotFoundError('Producto', id)
    await this.productRepository.delete(id)
    return { message: 'Producto eliminado correctamente' }
  }
}

module.exports = {
  GetAllProductsUseCase,
  GetProductByIdUseCase,
  CreateProductUseCase,
  UpdateProductUseCase,
  DeleteProductUseCase,
}
