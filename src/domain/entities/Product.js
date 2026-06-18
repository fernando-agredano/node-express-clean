/**
 * Entidad de dominio: Product
 * No importa Express, Prisma ni ningún framework.
 * Contiene las reglas de negocio del producto.
 */
class Product {
  constructor({ id, name, description, price, stock, category, createdAt, updatedAt }) {
    this.id = id
    this.name = name
    this.description = description ?? null
    this.price = price
    this.stock = stock ?? 0
    this.category = category
    this.createdAt = createdAt ?? new Date()
    this.updatedAt = updatedAt ?? new Date()
  }

  hasStock(quantity) {
    return this.stock >= quantity
  }

  decreaseStock(quantity) {
    if (!this.hasStock(quantity)) {
      throw new Error(`Stock insuficiente para "${this.name}". Disponible: ${this.stock}`)
    }
    this.stock -= quantity
  }

  updatePrice(newPrice) {
    if (newPrice <= 0) throw new Error('El precio debe ser mayor a 0')
    this.price = newPrice
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      price: this.price,
      stock: this.stock,
      category: this.category,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}

module.exports = { Product }
