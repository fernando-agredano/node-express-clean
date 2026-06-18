const { z } = require('zod')
const { asyncHandler } = require('../middleware/errorHandler')

const CreateOrderSchema = z.object({
  customerId: z.string().min(1, 'El customerId es requerido'),
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().int().positive('La cantidad debe ser mayor a 0'),
  })).min(1, 'La orden debe tener al menos un item'),
})

const UpdateStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
})

class OrderController {
  constructor({ getAllOrders, getOrderById, createOrder, updateOrderStatus }) {
    this.getAllOrders = getAllOrders
    this.getOrderById = getOrderById
    this.createOrder = createOrder
    this.updateOrderStatus = updateOrderStatus
  }

  getAll = asyncHandler(async (req, res) => {
    const { customerId, status, skip, take } = req.query
    const orders = await this.getAllOrders.execute({ customerId, status, skip, take })
    res.json({ data: orders.map(o => o.toJSON()), count: orders.length })
  })

  getById = asyncHandler(async (req, res) => {
    const order = await this.getOrderById.execute(req.params.id)
    res.json(order.toJSON())
  })

  create = asyncHandler(async (req, res) => {
    const data = CreateOrderSchema.parse(req.body)
    const order = await this.createOrder.execute(data)
    res.status(201).json(order.toJSON())
  })

  updateStatus = asyncHandler(async (req, res) => {
    const { status } = UpdateStatusSchema.parse(req.body)
    const order = await this.updateOrderStatus.execute(req.params.id, status)
    res.json(order.toJSON())
  })
}

module.exports = { OrderController }
