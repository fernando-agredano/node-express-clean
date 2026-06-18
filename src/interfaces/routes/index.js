const { Router } = require('express')

function buildRoutes({ productController, orderController }) {
  const router = Router()

  // Products
  router.get('/products', productController.getAll)
  router.get('/products/:id', productController.getById)
  router.post('/products', productController.create)
  router.put('/products/:id', productController.update)
  router.delete('/products/:id', productController.remove)

  // Orders
  router.get('/orders', orderController.getAll)
  router.get('/orders/:id', orderController.getById)
  router.post('/orders', orderController.create)
  router.put('/orders/:id/status', orderController.updateStatus)

  return router
}

module.exports = { buildRoutes }
