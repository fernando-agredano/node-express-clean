require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { setupDatabase } = require('./infrastructure/database/pg')
const { buildContainer } = require('./infrastructure/container')
const { buildRoutes } = require('./interfaces/routes')
const { errorHandler } = require('./interfaces/middleware/errorHandler')

const PORT = process.env.PORT || 3000

async function bootstrap() {
  // Crear tablas si no existen
  await setupDatabase()

  const app = express()
  app.use(cors())
  app.use(express.json())

  app.get('/', (req, res) => res.json({ status: 'ok', project: 'Node - Express Clean Architecture', db: 'PostgreSQL' }))

  const container = buildContainer()
  app.use('/api', buildRoutes(container))
  app.use(errorHandler)

  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
  })
}

bootstrap().catch(err => { console.error('Error al iniciar:', err); process.exit(1) })
