const { z } = require('zod')
const { asyncHandler } = require('../middleware/errorHandler')

const CreateProductSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  price: z.number().positive('El precio debe ser mayor a 0'),
  stock: z.number().int().min(0).optional().default(0),
  category: z.string().min(1, 'La categoría es requerida'),
})

const UpdateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  category: z.string().min(1).optional(),
})

class ProductController {
  constructor({ getAllProducts, getProductById, createProduct, updateProduct, deleteProduct }) {
    this.getAllProducts = getAllProducts
    this.getProductById = getProductById
    this.createProduct = createProduct
    this.updateProduct = updateProduct
    this.deleteProduct = deleteProduct
  }

  getAll = asyncHandler(async (req, res) => {
    const { category, minPrice, maxPrice, skip, take } = req.query
    const products = await this.getAllProducts.execute({ category, minPrice, maxPrice, skip, take })
    res.json({ data: products.map(p => p.toJSON()), count: products.length })
  })

  getById = asyncHandler(async (req, res) => {
    const product = await this.getProductById.execute(req.params.id)
    res.json(product.toJSON())
  })

  create = asyncHandler(async (req, res) => {
    const data = CreateProductSchema.parse(req.body)
    const product = await this.createProduct.execute(data)
    res.status(201).json(product.toJSON())
  })

  update = asyncHandler(async (req, res) => {
    const data = UpdateProductSchema.parse(req.body)
    const product = await this.updateProduct.execute(req.params.id, data)
    res.json(product.toJSON())
  })

  remove = asyncHandler(async (req, res) => {
    const result = await this.deleteProduct.execute(req.params.id)
    res.json(result)
  })
}

module.exports = { ProductController }
