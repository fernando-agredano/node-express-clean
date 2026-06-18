const { pool } = require('./database/pg')
const { PgProductRepository } = require('./repositories/PgProductRepository')
const { PgOrderRepository } = require('./repositories/PgOrderRepository')

const { GetAllProductsUseCase, GetProductByIdUseCase, CreateProductUseCase, UpdateProductUseCase, DeleteProductUseCase } = require('../use-cases/product')
const { GetAllOrdersUseCase, GetOrderByIdUseCase, CreateOrderUseCase, UpdateOrderStatusUseCase } = require('../use-cases/order')
const { ProductController } = require('../interfaces/controllers/ProductController')
const { OrderController } = require('../interfaces/controllers/OrderController')

function buildContainer() {
  const productRepository = new PgProductRepository(pool)
  const orderRepository   = new PgOrderRepository(pool)

  const productController = new ProductController({
    getAllProducts:  new GetAllProductsUseCase(productRepository),
    getProductById:  new GetProductByIdUseCase(productRepository),
    createProduct:   new CreateProductUseCase(productRepository),
    updateProduct:   new UpdateProductUseCase(productRepository),
    deleteProduct:   new DeleteProductUseCase(productRepository),
  })

  const orderController = new OrderController({
    getAllOrders:       new GetAllOrdersUseCase(orderRepository),
    getOrderById:      new GetOrderByIdUseCase(orderRepository),
    createOrder:       new CreateOrderUseCase(orderRepository, productRepository),
    updateOrderStatus: new UpdateOrderStatusUseCase(orderRepository),
  })

  return { productController, orderController }
}

module.exports = { buildContainer }
