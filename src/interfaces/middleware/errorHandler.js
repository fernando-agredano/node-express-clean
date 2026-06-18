const { AppError } = require('../../domain/errors')

function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    })
  }

  // Error de Zod (validación)
  if (err.name === 'ZodError') {
    return res.status(422).json({
      error: 'ValidationError',
      message: 'Datos de entrada inválidos',
      details: err.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
    })
  }

  console.error('[Unhandled Error]', err)
  return res.status(500).json({ error: 'InternalServerError', message: 'Error interno del servidor' })
}

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
}

module.exports = { errorHandler, asyncHandler }
