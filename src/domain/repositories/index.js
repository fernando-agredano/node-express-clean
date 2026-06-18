/**
 * Contratos (interfaces) de repositorios.
 * El dominio define QUÉ necesita — la infraestructura lo implementa.
 * La regla de dependencia: dominio no importa infraestructura.
 */

class ProductRepository {
  async findAll({ category, minPrice, maxPrice, skip, take } = {}) { throw new Error('Not implemented') }
  async findById(id) { throw new Error('Not implemented') }
  async save(product) { throw new Error('Not implemented') }
  async update(product) { throw new Error('Not implemented') }
  async delete(id) { throw new Error('Not implemented') }
}

class OrderRepository {
  async findAll({ customerId, status, skip, take } = {}) { throw new Error('Not implemented') }
  async findById(id) { throw new Error('Not implemented') }
  async save(order) { throw new Error('Not implemented') }
  async updateStatus(id, status) { throw new Error('Not implemented') }
}

module.exports = { ProductRepository, OrderRepository }
